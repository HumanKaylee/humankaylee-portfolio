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

test.describe("no-WebGL fallback @no-webgl", () => {
	test("captures no-webgl-projects-fallback on the project atlas", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1440, height: 1100 });
		await disableWebgl(page);
		await stabilizeFallbackView(page);

		const response = await page.goto("/projects/", {
			waitUntil: "domcontentloaded",
		});
		expect(response?.status()).toBeLessThan(400);
		await page.waitForLoadState("networkidle");

		await expect(
			page.getByRole("region", { name: "Accessible project atlas" }),
		).toBeVisible();
		await expect(page.locator("canvas")).toHaveCount(0);
		await expect(page.locator("[data-project-constellation]")).toBeVisible();
		await expect(
			page.getByText(/Reduced-motion poster fallback/i),
		).toBeVisible();

		await expect(page).toHaveScreenshot("no-webgl-projects-fallback.png", {
			fullPage: false,
			animations: "disabled",
			maxDiffPixels: 300,
		});
	});
});
