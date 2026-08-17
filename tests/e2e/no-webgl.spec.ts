import { type Page, expect, test } from "@playwright/test";

async function disableWebgl(page: Page) {
	await page.addInitScript(() => {
		const originalGetContext = HTMLCanvasElement.prototype.getContext;

		HTMLCanvasElement.prototype.getContext = function getContextWithoutWebgl(
			this: HTMLCanvasElement,
			type: string,
			...args: unknown[]
		) {
			if (/^webgl2?$/i.test(type)) {
				return null;
			}

			return Reflect.apply(originalGetContext, this, [type, ...args]);
		} as typeof HTMLCanvasElement.prototype.getContext;

		Object.defineProperty(navigator, "gpu", {
			configurable: true,
			get: () => undefined,
		});
	});
}

async function stabilizeFallbackView(page: Page) {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.addInitScript(() => {
		const sheet = document.createElement("style");
		sheet.id = "no-webgl-qa-motion-lock";
		sheet.textContent =
			"*, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }";
		document.documentElement.append(sheet);
	});
}

test.describe("Signal / Proof no-WebGL behavior @no-webgl", () => {
	test("keeps the complete proof gallery and authentic media without WebGL", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1440, height: 1100 });
		await disableWebgl(page);
		await stabilizeFallbackView(page);

		const response = await page.goto("/", {
			waitUntil: "domcontentloaded",
		});
		expect(response?.status()).toBe(200);
		await page.waitForLoadState("networkidle");

		await expect(page.locator(".proof-gallery")).toBeVisible();
		await expect(page.locator("[data-proof-placement]")).toHaveCount(2);
		await expect(page.locator("[data-capability-proof]")).toHaveCount(6);
		await expect(page.locator("canvas, svg")).toHaveCount(0);
		await expect(page.locator("script[src*='constellation']")).toHaveCount(0);
		await expect(page.locator("[data-motion-video]").first()).toHaveAttribute(
			"aria-label",
			/Cryogenic flow dashboard showing coordinated valve travel/i,
		);
		await expect(page.locator("[data-motion-video]").first()).toBeVisible();
		await expect(
			page.getByRole("link", { name: /Cryogenic Flow Simulation/i }).first(),
		).toHaveAttribute("href", "/work/cryo-flow-sim/");

		await expect(page).toHaveScreenshot("no-webgl-signal-proof-home.png", {
			fullPage: false,
			animations: "disabled",
			maxDiffPixels: 300,
		});
	});
});
