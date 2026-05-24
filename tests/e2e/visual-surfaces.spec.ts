import { type Page, expect, test } from "@playwright/test";

const desktopRoutes = [
	"/",
	"/projects/",
	"/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
	"/resume/",
	"/contact/",
] as const;

const mobileRoutes = desktopRoutes;

async function expectSurfaceTreatment(page: Page, selector: string) {
	const states = await page.locator(selector).evaluateAll((elements) =>
		elements.map((element) => {
			const computed = getComputedStyle(element);
			const rect = element.getBoundingClientRect();
			const visible =
				rect.width > 0 &&
				rect.height > 0 &&
				computed.display !== "none" &&
				computed.visibility !== "hidden";
			const hasBackgroundImage = computed.backgroundImage !== "none";
			const hasBoxShadow = computed.boxShadow !== "none";
			const hasBorder =
				computed.borderTopStyle !== "none" &&
				computed.borderTopWidth !== "0px" &&
				computed.borderTopColor !== "rgba(0, 0, 0, 0)";

			return {
				hasTreatment: hasBackgroundImage || hasBoxShadow || hasBorder,
				visible,
			};
		}),
	);
	const visibleStates = states.filter((state) => state.visible);

	expect(states.length, `${selector} should exist`).toBeGreaterThan(0);
	expect(visibleStates.length, `${selector} should be visible`).toBeGreaterThan(
		0,
	);
	expect(
		visibleStates.every((state) => state.hasTreatment),
		`every visible ${selector} should read as an intentional surface`,
	).toBe(true);
}

async function expectNoHorizontalOverflow(page: Page) {
	const overflow = await page.evaluate(() => {
		const viewportWidth = window.innerWidth;
		const main = document.querySelector("main");

		return Array.from(main?.querySelectorAll("*") ?? []).some((element) => {
			const style = getComputedStyle(element);
			const rect = element.getBoundingClientRect();
			const intersectsViewport = rect.right > 0 && rect.left < viewportWidth;

			return (
				intersectsViewport &&
				style.display !== "none" &&
				style.visibility !== "hidden" &&
				(rect.left < -1 || rect.right > viewportWidth + 1)
			);
		});
	});

	expect(overflow, "main content should not overflow horizontally").toBe(false);
}

async function expectTouchTargets(page: Page) {
	const heights = await page
		.locator("main")
		.locator('a[data-touch-target="true"], button')
		.evaluateAll((elements) =>
			elements.map((element) => element.getBoundingClientRect().height),
		);

	expect(heights.length).toBeGreaterThan(0);
	expect(
		heights.every((height) => height >= 44),
		"primary touch targets should remain at least 44px tall",
	).toBe(true);
}

test.describe("visual surfaces @visual-surfaces", () => {
	test("art-directs the core page surfaces on desktop", async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 1200 });

		for (const route of desktopRoutes) {
			await page.goto(route);
			await expectNoHorizontalOverflow(page);
			await expect(page.locator("body")).toHaveCSS(
				"background-image",
				/gradient/i,
			);
		}

		await page.goto("/");
		await expectSurfaceTreatment(page, ".hero-shell");
		await expectSurfaceTreatment(page, ".systems-map-hero");
		await expectSurfaceTreatment(page, ".systems-map-legend");
		await expectSurfaceTreatment(page, ".systems-map-legend li");
		await expectSurfaceTreatment(page, ".cta-cluster .cta-card");
		await expectSurfaceTreatment(page, ".telemetry-strip");

		await page.goto("/projects/");
		await expectSurfaceTreatment(page, ".project-atlas-shell");
		await expectSurfaceTreatment(page, ".atlas-filter-nav");
		await expectSurfaceTreatment(page, ".atlas-motion-panel");
		await expectSurfaceTreatment(page, ".atlas-category-panel");
		await expectSurfaceTreatment(page, ".atlas-node-card");

		await page.goto("/case-studies/cli-fleet-synchronization-and-mcp-rollout/");
		await expectSurfaceTreatment(page, ".case-study-detail");
		await expectSurfaceTreatment(page, ".case-study-section");
		await expectSurfaceTreatment(page, ".evidence-drawer");

		await page.goto("/resume/");
		await expectSurfaceTreatment(page, ".paper-panel");
		await expectSurfaceTreatment(page, ".workflow-list");

		await page.goto("/contact/");
		await expectSurfaceTreatment(page, ".paper-panel");
		await expectSurfaceTreatment(page, ".contact-form");
		await expectSurfaceTreatment(page, ".contact-status");

		await expectTouchTargets(page);
	});

	test("keeps the same surfaces usable on mobile without horizontal overflow", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });

		for (const route of mobileRoutes) {
			await page.goto(route);
			await expectNoHorizontalOverflow(page);
		}

		await page.goto("/");
		await expectTouchTargets(page);
	});
});
