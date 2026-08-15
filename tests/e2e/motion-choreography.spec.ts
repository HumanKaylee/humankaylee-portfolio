import { expect, test } from "@playwright/test";

function toMilliseconds(duration: string) {
	const trimmed = duration.trim();

	if (trimmed.endsWith("ms")) {
		return Number.parseFloat(trimmed);
	}

	if (trimmed.endsWith("s")) {
		return Number.parseFloat(trimmed) * 1000;
	}

	return Number.parseFloat(trimmed) || 0;
}

test.describe("purposeful motion @motion", () => {
	test("presents the complete project-stage state immediately for reduced-motion users", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");

		const stage = page.locator("[data-project-stage]");
		const transitionDurations = await page
			.locator("[data-stage-panel]")
			.evaluateAll((panels) =>
				panels.map((panel) => getComputedStyle(panel).transitionDuration),
			);

		await expect(stage).toHaveAttribute("data-enhanced", "true");
		await expect(stage).toHaveCSS("scroll-behavior", "auto");
		await expect(
			page.locator('[data-stage-trigger][aria-current="true"]'),
		).toHaveCount(1);
		await expect(page.locator("[data-stage-panel]:not([hidden])")).toHaveCount(
			1,
		);
		expect(
			transitionDurations.every((duration) =>
				duration.split(",").every((value) => toMilliseconds(value) <= 0.001),
			),
		).toBe(true);
	});

	test("adds restrained signal-link motion when motion is allowed", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "no-preference" });
		await page.goto("/");

		const workLink = page.getByRole("link", { name: /View selected work/i });
		const before = await workLink.evaluate((link) => {
			const styles = getComputedStyle(link, "::after");
			return {
				transform: styles.transform,
				transitionDuration: styles.transitionDuration,
			};
		});
		expect(
			before.transitionDuration
				.split(",")
				.some((duration) => toMilliseconds(duration) >= 100),
		).toBe(true);

		await workLink.hover();
		await expect
			.poll(() =>
				workLink.evaluate(
					(link) => getComputedStyle(link, "::after").transform,
				),
			)
			.not.toBe(before.transform);
	});

	test("suppresses signal-link animation for reduced-motion users", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");

		const durations = await page
			.getByRole("link", { name: /View selected work/i })
			.evaluate((link) => getComputedStyle(link, "::after").transitionDuration);

		expect(
			durations
				.split(",")
				.every((duration) => toMilliseconds(duration) <= 0.001),
		).toBe(true);
	});
});

test.describe("purposeful motion @motion @noscript", () => {
	test.use({ javaScriptEnabled: false });

	test("keeps every project proof visible and linked without JavaScript", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1440, height: 1000 });
		await page.goto("/");

		await expect(page.locator("[data-project-stage]")).not.toHaveAttribute(
			"data-enhanced",
		);
		await expect(page.locator("[data-stage-panel]:visible")).toHaveCount(3);
		await expect(page.locator(".work-row")).toHaveCount(3);
		await expect(page.locator("canvas, svg")).toHaveCount(0);
		for (const href of [
			"/work/cryo-flow-sim/",
			"/work/cli-fleet-synchronization-and-mcp-rollout/",
			"/work/remote-workstation-recovery-and-operational-debugging/",
		]) {
			await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
		}
	});
});
