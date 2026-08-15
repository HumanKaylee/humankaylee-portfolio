import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const flagshipHrefs = [
	"/work/cryo-flow-sim/",
	"/work/cli-fleet-synchronization-and-mcp-rollout/",
	"/work/remote-workstation-recovery-and-operational-debugging/",
] as const;

const flagshipTitles = [
	"Cryogenic Flow Simulation",
	"CLI Fleet Synchronization",
	"Remote Workstation Recovery",
] as const;

const internalHomepageCopy =
	/fallback mode|API health|for recruiters|for engineers|launch readiness|deployment status/i;

test("presents Joe, a Work action, authentic media, and three flagships in the first viewport", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/");

	const identity = page.getByRole("link", { name: "Joe Poznanski home" });
	const heading = page.getByRole("heading", { level: 1 });
	const workAction = page.getByRole("link", { name: "View selected work" });
	const heroPoster = page.locator(".home-hero [data-video-poster] img");

	await expect(identity).toBeVisible();
	await expect(heading).toHaveText(
		"Principal engineer for systems that cannot drift.",
	);
	await expect(page.locator(".home-hero")).toContainText(
		"I turn ambiguous operational problems into reliable software, from simulation and infrastructure to automation and recovery.",
	);
	await expect(workAction).toHaveAttribute("href", "/work/");
	await expect(heroPoster).toHaveAttribute(
		"alt",
		/Cryogenic flow simulation dashboard/i,
	);
	await expect(heroPoster).toBeVisible();
	await expect(page.locator("[data-stage-trigger]")).toHaveCount(3);
	await expect(page.locator("main")).not.toContainText(internalHomepageCopy);

	for (const element of [identity, heading, workAction, heroPoster]) {
		const box = await element.boundingBox();
		expect(box, "required first-viewport element has a box").not.toBeNull();
		expect(box?.y ?? Number.POSITIVE_INFINITY).toBeLessThan(1000);
	}
});

test("renders exactly the three approved flagships as normal Work links and complete static panels", async ({
	page,
}) => {
	await page.goto("/");

	const triggers = page.locator("[data-stage-trigger]");
	const panels = page.locator("[data-stage-panel]");

	await expect(triggers).toHaveCount(3);
	await expect(triggers).toHaveText(flagshipTitles);
	expect(
		await triggers.evaluateAll((links) =>
			links.map((link) => link.getAttribute("href")),
		),
	).toEqual(flagshipHrefs);
	await expect(panels).toHaveCount(3);
	expect(
		await panels.evaluateAll((items) =>
			items.map((panel) => panel.hasAttribute("hidden")),
		),
	).toEqual([false, false, false]);
	await expect(
		page.locator('[data-stage-panel="cryo-flow-sim"] img'),
	).toHaveAttribute("alt", /Cryogenic flow simulation dashboard/i);
	await expect(
		page.locator(
			'[data-stage-panel="cli-fleet-synchronization-and-mcp-rollout"]',
		),
	).toContainText("Primary workstation account");
	await expect(
		page.locator(
			'[data-stage-panel="remote-workstation-recovery-and-operational-debugging"]',
		),
	).toContainText("Reachability");
	await expect(
		page.locator("[data-project-stage] svg, [data-project-stage] canvas"),
	).toHaveCount(0);
});

test("uses the responsive Cryogenic Flow poster without loading homepage video playback", async ({
	page,
}) => {
	await page.goto("/");

	const sources = page.locator('[data-video-poster] source[type="image/webp"]');
	await expect(sources).toHaveCount(2);
	for (const source of await sources.all()) {
		await expect(source).toHaveAttribute(
			"srcset",
			"/media/cryo-flow-sim-stage1-640.webp 640w, /media/cryo-flow-sim-stage1-960.webp 960w, /media/cryo-flow-sim-stage1-1440.webp 1440w",
		);
		await expect(source).toHaveAttribute(
			"sizes",
			"(max-width: 760px) 100vw, 50vw",
		);
	}

	const posters = page.locator("[data-video-poster] img");
	await expect(posters).toHaveCount(2);
	for (const poster of await posters.all()) {
		await expect(poster).toHaveAttribute("width", "1920");
		await expect(poster).toHaveAttribute("height", "1080");
		await expect(poster).toHaveAttribute(
			"src",
			"/media/cryo-flow-sim-stage1-poster.png",
		);
	}
	await expect(page.locator("main video")).toHaveCount(0);
});

test("stays static and useful during an API outage", async ({ page }) => {
	await page.route("**/api/**", (route) => route.abort("failed"));
	const response = await page.goto("/");

	expect(response?.status()).toBe(200);
	await expect(page.getByRole("heading", { level: 1 })).toHaveText(
		"Principal engineer for systems that cannot drift.",
	);
	await expect(page.locator("[data-stage-trigger]")).toHaveCount(3);
	await expect(page.locator("[data-stage-panel]")).toHaveCount(3);
	await expect(page.locator("main")).not.toContainText(
		/Failed to fetch|ECONNREFUSED|TypeError:|API health/i,
	);
});

test.describe("static homepage without JavaScript", () => {
	test.use({ javaScriptEnabled: false });

	test("keeps every flagship link and panel readable in semantic order", async ({
		page,
	}) => {
		await page.goto("/");

		await expect(page.locator("[data-stage-trigger]")).toHaveText(
			flagshipTitles,
		);
		await expect(page.locator("[data-stage-panel]")).toHaveCount(3);
		for (const panel of await page.locator("[data-stage-panel]").all()) {
			await expect(panel).toBeVisible();
		}
		await expect(page.locator("main video")).toHaveCount(0);
		await expect(page.locator("main")).not.toContainText(internalHomepageCopy);
	});
});

test("has no blocking accessibility findings or horizontal overflow at representative widths", async ({
	page,
}) => {
	for (const viewport of [
		{ width: 390, height: 844 },
		{ width: 820, height: 1180 },
		{ width: 1440, height: 1000 },
	]) {
		await page.setViewportSize(viewport);
		await page.goto("/");

		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth > window.innerWidth + 1,
		);
		expect(overflow, `${viewport.width}px homepage overflow`).toBe(false);
	}

	const results = await new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
		.analyze();
	expect(
		results.violations.filter((violation) =>
			["serious", "critical"].includes(violation.impact ?? ""),
		),
	).toEqual([]);
});
