import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

const internalHomepageCopy =
	/fallback mode|API health|for recruiters|for engineers|launch readiness|deployment status|PR evidence|production launch/i;

const capabilityLabels = [
	"Simulation and controls",
	"Rust and C++ systems",
	"High-rate telemetry",
	"Verification and validation",
	"Distributed media",
	"Human-in-the-loop agents",
] as const;

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
	const heroVideo = page.locator(".home-hero [data-motion-video]");

	await expect(identity).toBeVisible();
	await expect(role).toContainText("Joe Poznanski");
	await expect(role).toContainText("Principal Software Engineer");
	await expect(heading).toHaveText(
		"Principal engineer for simulation, controls, and operational software.",
	);
	await expect(value).toHaveText(
		"I build flight simulation, telemetry, controls, and operator-facing software across Rust, C++, distributed systems, and human-in-the-loop AI.",
	);
	await expect(workAction).toHaveAttribute("href", "/work/");
	await expect(heroVideo).toHaveAttribute(
		"aria-label",
		/Cryogenic flow dashboard showing coordinated valve travel/i,
	);
	await expect(heroVideo).toHaveAttribute(
		"poster",
		"/media/cryo-flow-sim-loop-960.webp",
	);
	await expect(heroVideo).toBeVisible();

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

	const mediaIntersection = await heroVideo.evaluate((element) => {
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
		mediaIntersection.visibleAreaRatio,
		"at least 75% of the authentic motion poster is visible",
	).toBeGreaterThanOrEqual(0.75);
	expect(
		mediaIntersection.visibleHeight,
		"at least 160px of authentic poster height is visible",
	).toBeGreaterThanOrEqual(160);
	expect(
		mediaIntersection.visibleWidthRatio,
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

test("leads with two flagships, two supporting studies, and no archive projects", async ({
	page,
}) => {
	await page.goto("/");
	const cryoEvidence = page.locator(
		'.evidence-strip[aria-label="Verified Cryogenic Flow evidence"]',
	);
	await expect(cryoEvidence.locator("dt")).toHaveText([
		"System scale",
		"Real-time runtime",
		"Deterministic replay",
	]);
	await expect(cryoEvidence.locator("strong")).toHaveText([
		"29,500 entities",
		"30 Hz",
		"1,800 frames",
	]);
	await expect(
		page
			.locator("[data-capability-proof]")
			.filter({ hasText: "Simulation and controls" })
			.locator(".capability-matrix__evidence span"),
	).toHaveText(
		"The Cryogenic Flow case study runs 29,500 entities at 30 Hz, reproduces a byte-identical 1,800-frame raw replay in its fixed hardware and software scope, and makes coordinated valve waves visible across all 15,000 valves. A warmed-state transport measurement paired a 5.29 MB full JSON snapshot with a separately scoped 6.8 KB representative incremental delta.",
	);
	await expect(page.locator("main")).toContainText(
		"6.8 KB representative incremental delta",
	);
	await expect(page.locator("main")).toContainText(
		"5.29 MB full JSON snapshot",
	);
	await expect(page.locator("main")).not.toContainText(/92 passing tests/i);

	const flagship = page.locator('[data-proof-placement="flagship"]');
	const supporting = page.locator('[data-proof-placement="supporting"]');
	await expect(flagship).toHaveCount(2);
	await expect(supporting).toHaveCount(2);
	await expect(flagship.locator("h3")).toHaveText([
		"Cryogenic Flow Simulation",
		"Conformal Cooling Channel Generation",
	]);
	await expect(supporting.locator("h3")).toHaveText([
		"X-Plane Cabin Camera FOV Trade Study",
		"Black-Scholes Options Pricer in Rust and WASM",
	]);
	await expect(
		flagship.getByRole("link", { name: "Cryogenic Flow Simulation" }),
	).toHaveAttribute("href", "/work/cryo-flow-sim/");
	await expect(
		supporting.getByRole("link", {
			name: "X-Plane Cabin Camera FOV Trade Study",
		}),
	).toHaveAttribute("href", "/work/xplane-cabin-camera-fov-trade-study/");
	await expect(
		supporting.getByRole("link", {
			name: "Black-Scholes Options Pricer in Rust and WASM",
		}),
	).toHaveAttribute("href", "/work/black-scholes-wasm/");
	await expect(page.locator("[data-proof-placement] h3")).toHaveText([
		"Cryogenic Flow Simulation",
		"Conformal Cooling Channel Generation",
		"X-Plane Cabin Camera FOV Trade Study",
		"Black-Scholes Options Pricer in Rust and WASM",
	]);
	await expect(page.locator("main")).not.toContainText(
		"CLI Fleet Synchronization",
	);
	await expect(page.locator("main")).not.toContainText(
		"Remote Workstation Recovery",
	);
	await expect(page.locator("[data-capability-proof] h3")).toHaveText(
		capabilityLabels,
	);
	await expect(page.locator("[data-capability-proof]")).toHaveCount(6);
	await expect(page.locator("main")).not.toContainText(
		/unexpected clamp events/i,
	);
	await expect(page.locator("main")).toContainText(
		/cooling passages.*injection-mold cavity/i,
	);
	await expect(page.locator("main")).toContainText(
		/metal additive manufacturing/i,
	);
	await expect(page.locator(".proof-gallery__header")).toContainText(
		/The flagship case studies carry captured motion and geometry evidence\. Focused technical studies show how the same evidence-first approach applies to camera tradeoffs and browser computation\./,
	);
	await expect(page.locator("canvas, svg")).toHaveCount(0);
});

test("stays static and useful during an API outage", async ({ page }) => {
	await page.route("**/api/**", (route) => route.abort("failed"));
	const response = await page.goto("/");

	expect(response?.status()).toBe(200);
	await expect(page.getByRole("heading", { level: 1 })).toHaveText(
		"Principal engineer for simulation, controls, and operational software.",
	);
	await expect(page.locator('[data-proof-placement="flagship"]')).toHaveCount(
		2,
	);
	await expect(page.locator('[data-proof-placement="supporting"]')).toHaveCount(
		2,
	);
	await expect(page.locator("main")).not.toContainText(
		/Failed to fetch|ECONNREFUSED|TypeError:|API health/i,
	);
});

test.describe("static homepage without JavaScript", () => {
	test.use({ javaScriptEnabled: false });

	test("keeps proof, poster descriptions, and links readable", async ({
		page,
	}) => {
		await page.goto("/");

		await expect(page.locator('[data-proof-placement="flagship"]')).toHaveCount(
			2,
		);
		await expect(
			page.locator('[data-proof-placement="supporting"]'),
		).toHaveCount(2);
		await expect(page.locator("[data-motion-loop]")).toHaveCount(3);
		await expect(page.locator("[data-motion-video][poster]")).toHaveCount(3);
		await expect(page.locator("[data-motion-video][src]")).toHaveCount(0);
		await expect(page.locator("[data-motion-description]")).toHaveCount(3);
		await expect(page.locator("[data-motion-toggle]:visible")).toHaveCount(0);
		await expect(page.locator("[data-capability-proof]")).toHaveCount(6);
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
