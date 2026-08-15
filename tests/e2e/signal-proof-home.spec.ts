import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

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
	/fallback mode|API health|for recruiters|for engineers|launch readiness|deployment status|PR evidence|production launch/i;

async function expectFirstViewportStory(
	page: Page,
	viewport: { width: number; height: number },
) {
	await page.setViewportSize(viewport);
	await page.goto("/");

	const identity = page.getByRole("link", { name: "Joe Poznanski home" });
	const role = page.locator(".home-hero .section-kicker");
	const heading = page.getByRole("heading", { level: 1 });
	const value = page.locator(".home-hero__lede");
	const workAction = page.getByRole("link", { name: "View selected work" });
	const heroPoster = page.locator(".home-hero [data-video-poster] img");

	await expect(identity).toBeVisible();
	await expect(role).toContainText("Joe Poznanski");
	await expect(role).toContainText("Principal Software Engineer");
	await expect(heading).toHaveText(
		"Principal engineer for systems that cannot drift.",
	);
	await expect(value).toHaveText(
		"I turn ambiguous operational problems into reliable software, from simulation and infrastructure to automation and recovery.",
	);
	await expect(workAction).toHaveAttribute("href", "/work/");
	await expect(heroPoster).toHaveAttribute(
		"alt",
		/Cryogenic flow simulation dashboard/i,
	);
	await expect(heroPoster).toBeVisible();

	for (const [label, element] of [
		["identity", identity],
		["role", role],
		["heading", heading],
		["value", value],
		["Work action", workAction],
	] as const) {
		const box = await element.boundingBox();
		expect(box, `${label} has a box`).not.toBeNull();
		expect(
			box?.y ?? -1,
			`${label} starts inside the viewport`,
		).toBeGreaterThanOrEqual(0);
		expect(
			(box?.y ?? Number.POSITIVE_INFINITY) + (box?.height ?? 0),
			`${label} is fully visible in the first viewport`,
		).toBeLessThanOrEqual(viewport.height);
	}

	const posterIntersection = await heroPoster.evaluate((element) => {
		const rect = element.getBoundingClientRect();
		const visibleWidth = Math.max(
			0,
			Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0),
		);
		const visibleHeight = Math.max(
			0,
			Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0),
		);
		return {
			visibleAreaRatio:
				rect.width > 0 && rect.height > 0
					? (visibleWidth * visibleHeight) / (rect.width * rect.height)
					: 0,
			visibleHeight,
			visibleWidthRatio: rect.width > 0 ? visibleWidth / rect.width : 0,
		};
	});

	expect(
		posterIntersection.visibleAreaRatio,
		"at least 75% of the authentic poster is visible",
	).toBeGreaterThanOrEqual(0.75);
	expect(
		posterIntersection.visibleHeight,
		"at least 160px of authentic poster height is visible",
	).toBeGreaterThanOrEqual(160);
	expect(
		posterIntersection.visibleWidthRatio,
		"the authentic poster is not horizontally clipped",
	).toBeGreaterThanOrEqual(0.95);
	await expect(page.locator("main")).not.toContainText(internalHomepageCopy);
}

for (const viewport of [
	{ label: "desktop", width: 1440, height: 1000 },
	{ label: "mobile", width: 390, height: 844 },
]) {
	test(`presents the complete identity and authentic poster in the ${viewport.label} first viewport`, async ({
		page,
	}) => {
		await expectFirstViewportStory(page, viewport);
	});
}

test("progressively enhances exactly one approved flagship while retaining normal Work links", async ({
	page,
}) => {
	await page.goto("/");

	const stage = page.locator("[data-project-stage]");
	const triggers = page.locator("[data-stage-trigger]");
	const panels = page.locator("[data-stage-panel]");

	await expect(stage).toHaveAttribute("data-enhanced", "true");
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
	).toEqual([false, true, true]);
	expect(
		await triggers.evaluateAll((links) =>
			links.map((link) => link.getAttribute("aria-current")),
		),
	).toEqual(["true", "false", "false"]);
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

test("keeps project proof inline on mobile without an enhancement-only selection", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");

	const stage = page.locator("[data-project-stage]");
	const triggers = page.locator("[data-stage-trigger]");
	const panels = page.locator("[data-stage-panel]");

	await expect(stage).not.toHaveAttribute("data-enhanced");
	await expect(triggers).toHaveCount(3);
	expect(
		await triggers.evaluateAll((links) =>
			links.map((link) => link.getAttribute("href")),
		),
	).toEqual(flagshipHrefs);
	await expect(panels).toHaveCount(3);
	for (const panel of await panels.all()) {
		await expect(panel).toBeVisible();
	}
	expect(
		await triggers.evaluateAll((links) =>
			links.map((link) => link.hasAttribute("aria-current")),
		),
	).toEqual([false, false, false]);
});

test("restores inline project proof when the viewport leaves the enhancement mode", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/");

	const stage = page.locator("[data-project-stage]");
	const panels = page.locator("[data-stage-panel]");

	await expect(stage).toHaveAttribute("data-enhanced", "true");
	await expect(page.locator("[data-stage-panel]:not([hidden])")).toHaveCount(1);

	await page.setViewportSize({ width: 390, height: 844 });
	await expect(stage).not.toHaveAttribute("data-enhanced");
	for (const panel of await panels.all()) {
		await expect(panel).toBeVisible();
	}
	await expect(page.locator("[data-stage-trigger][aria-current]")).toHaveCount(
		0,
	);

	await page.setViewportSize({ width: 1440, height: 1000 });
	await expect(stage).toHaveAttribute("data-enhanced", "true");
	await expect(
		page.locator('[data-stage-trigger][aria-current="true"]'),
	).toHaveCount(1);
	await expect(page.locator("[data-stage-panel]:not([hidden])")).toHaveCount(1);
});

test("selects a panel on pointer and keyboard focus while preserving normal link navigation", async ({
	page,
}) => {
	await page.goto("/");

	const fleet = page.locator(
		'[data-stage-trigger="cli-fleet-synchronization-and-mcp-rollout"]',
	);
	const recovery = page.locator(
		'[data-stage-trigger="remote-workstation-recovery-and-operational-debugging"]',
	);
	const selectedTriggers = page.locator(
		'[data-stage-trigger][aria-current="true"]',
	);
	const visiblePanels = page.locator("[data-stage-panel]:not([hidden])");

	await fleet.hover();
	await expect(selectedTriggers).toHaveCount(1);
	await expect(fleet).toHaveAttribute("aria-current", "true");
	await expect(visiblePanels).toHaveCount(1);
	await expect(
		page.locator(
			'[data-stage-panel="cli-fleet-synchronization-and-mcp-rollout"]',
		),
	).toBeVisible();

	await recovery.focus();
	expect(
		await recovery.evaluate((trigger) => document.activeElement === trigger),
	).toBe(true);
	await expect(selectedTriggers).toHaveCount(1);
	await expect(recovery).toHaveAttribute("aria-current", "true");
	await expect(visiblePanels).toHaveCount(1);
	await expect(
		page.locator(
			'[data-stage-panel="remote-workstation-recovery-and-operational-debugging"]',
		),
	).toBeVisible();

	await Promise.all([
		page.waitForURL(
			"**/work/remote-workstation-recovery-and-operational-debugging/",
		),
		recovery.click(),
	]);
});

test.describe("inline project proof for coarse pointers", () => {
	test.use({ hasTouch: true });

	test("leaves all panels visible even at desktop width", async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 1000 });
		await page.goto("/");

		await expect(page.locator("[data-project-stage]")).not.toHaveAttribute(
			"data-enhanced",
		);
		await expect(page.locator("[data-stage-panel]:not([hidden])")).toHaveCount(
			3,
		);
		await expect(
			page.locator("[data-stage-trigger][aria-current]"),
		).toHaveCount(0);
	});
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
			"/media/cryo-flow-sim-stage1-1440.webp",
		);
	}
	await expect(
		page.locator('main img[src="/media/cryo-flow-sim-stage1-poster.png"]'),
	).toHaveCount(0);
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

		const triggers = page.locator("[data-stage-trigger]");
		const panels = page.locator("[data-stage-panel]");

		await expect(triggers).toHaveText(flagshipTitles);
		expect(
			await triggers.evaluateAll((links) =>
				links.map((link) => link.getAttribute("href")),
			),
		).toEqual(flagshipHrefs);
		await expect(panels).toHaveCount(3);
		for (const panel of await panels.all()) {
			await expect(panel).toBeVisible();
		}
		expect(
			await panels.evaluateAll((items) =>
				items.every((panel) =>
					Boolean(
						panel.compareDocumentPosition(
							document.querySelector("[data-stage-trigger]") as Node,
						) & Node.DOCUMENT_POSITION_PRECEDING,
					),
				),
			),
		).toBe(true);
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
