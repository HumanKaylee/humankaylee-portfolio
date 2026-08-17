import { type Page, expect, test } from "@playwright/test";

const releaseRoutes = [
	"/",
	"/work/",
	"/work/cryo-flow-sim/",
	"/work/cli-fleet-synchronization-and-mcp-rollout/",
	"/work/remote-workstation-recovery-and-operational-debugging/",
	"/about/",
	"/resume/",
	"/contact/",
	"/notes/",
] as const;

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
		.locator('[data-touch-target="true"]')
		.evaluateAll((elements) =>
			elements
				.filter((element) => {
					const style = getComputedStyle(element);
					return style.display !== "none" && style.visibility !== "hidden";
				})
				.map((element) => element.getBoundingClientRect().height),
		);

	expect(heights.length, "marked primary targets should exist").toBeGreaterThan(
		0,
	);
	expect(
		heights.every((height) => height >= 44),
		"marked primary targets should remain at least 44px tall",
	).toBe(true);
}

test.describe("Signal / Proof visual surfaces @visual-surfaces", () => {
	test("keeps release routes on the approved flat canvas", async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 1200 });

		for (const route of releaseRoutes) {
			await page.goto(route);
			await expectNoHorizontalOverflow(page);
			await expect(page.locator("body")).toHaveCSS(
				"background-color",
				"rgb(242, 241, 235)",
			);
			await expect(page.locator("body")).toHaveCSS("background-image", "none");
		}
	});

	test("renders the homepage as a proof gallery and capability matrix with real evidence", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1440, height: 1200 });
		await page.goto("/");

		await expect(page.locator(".proof-gallery")).toHaveCount(1);
		await expect(page.locator("[data-proof-placement]")).toHaveCount(2);
		await expect(page.locator("[data-capability-proof]")).toHaveCount(6);
		await expect(page.locator(".proof-gallery .media-frame")).toHaveCount(1);
		await expect(page.locator(".proof-gallery .evidence-flow")).toHaveCount(1);
		await expect(page.locator("[data-motion-loop]")).toHaveCount(2);
		await expect(
			page.locator(".project-atlas-shell, .evidence-drawer, .telemetry-strip"),
		).toHaveCount(0);

		const treatments = await page
			.locator(".proof-gallery__item, [data-capability-proof] article")
			.evaluateAll((elements) =>
				elements.map((element) => {
					const style = getComputedStyle(element);
					return {
						backgroundImage: style.backgroundImage,
						borderRadius: Number.parseFloat(style.borderTopLeftRadius),
						boxShadow: style.boxShadow,
					};
				}),
			);
		expect(treatments.length).toBeGreaterThan(0);
		expect(
			treatments.every(
				(treatment) =>
					treatment.backgroundImage === "none" &&
					treatment.borderRadius <= 2 &&
					treatment.boxShadow === "none",
			),
			"core Signal / Proof surfaces should use rules instead of gradients, soft cards, or shadows",
		).toBe(true);
		await expect(page.locator(".media-frame").first()).toHaveCSS(
			"border-radius",
			"12px",
		);
	});

	test("keeps every flagship media frame and proof section legible", async ({
		page,
	}) => {
		for (const route of releaseRoutes.slice(2, 5)) {
			await page.goto(route);
			await expect(page.locator(".media-frame")).toHaveCount(1);
			await expect(
				page.getByRole("heading", { level: 2, name: "Proof" }),
			).toBeVisible();
			await expect(page.locator(".evidence-strip")).toHaveCount(1);
		}
	});

	test("keeps the same surfaces usable on mobile", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });

		for (const route of releaseRoutes) {
			await page.goto(route);
			await expectNoHorizontalOverflow(page);
			await expectTouchTargets(page);
		}

		await page.goto("/");
		await expect(page.locator("[data-proof-placement]:visible")).toHaveCount(2);
	});
});
