import { type Page, expect, test } from "@playwright/test";

const viewportMatrix = [
	{
		label: "desktop",
		size: { width: 1440, height: 1200 },
	},
	{
		label: "mobile",
		size: { width: 390, height: 844 },
	},
] as const;

const visualRoutes = [
	{ label: "home", path: "/" },
	{ label: "work", path: "/work/" },
	{ label: "work-cryo", path: "/work/cryo-flow-sim/" },
	{
		label: "work-cli-fleet",
		path: "/work/cli-fleet-synchronization-and-mcp-rollout/",
	},
	{
		label: "work-remote-recovery",
		path: "/work/remote-workstation-recovery-and-operational-debugging/",
	},
	{ label: "work-black-scholes", path: "/work/black-scholes-wasm/" },
	{ label: "about", path: "/about/" },
	{ label: "resume", path: "/resume/" },
	{ label: "contact", path: "/contact/" },
	{ label: "notes", path: "/notes/" },
] as const;

async function stabilizeVisualState(page: Page) {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.addInitScript(() => {
		const sheet = document.createElement("style");
		sheet.id = "visual-regression-motion-lock";
		sheet.textContent =
			"*, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }";
		document.documentElement.append(sheet);
	});
}

async function waitForStableMedia(page: Page) {
	await page.locator(".media-frame img").evaluateAll(async (elements) => {
		for (const element of elements) {
			const image = element as HTMLImageElement;
			if (!image.complete || image.naturalWidth === 0) {
				await new Promise<void>((resolve, reject) => {
					image.addEventListener("load", () => resolve(), { once: true });
					image.addEventListener(
						"error",
						() => reject(new Error("media image failed to load")),
						{ once: true },
					);
				});
			}
			await image.decode();
		}
	});
	await page
		.locator(".media-frame video[poster]")
		.evaluateAll(async (elements) => {
			for (const element of elements) {
				const video = element as HTMLVideoElement;
				const poster = new Image();
				poster.src = video.poster;
				if (!poster.complete || poster.naturalWidth === 0) {
					await new Promise<void>((resolve, reject) => {
						poster.addEventListener("load", () => resolve(), { once: true });
						poster.addEventListener(
							"error",
							() => reject(new Error("video poster failed to load")),
							{ once: true },
						);
					});
				}
				await poster.decode();

				if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
					await new Promise<void>((resolve, reject) => {
						video.addEventListener("loadedmetadata", () => resolve(), {
							once: true,
						});
						video.addEventListener(
							"error",
							() => reject(new Error("video metadata failed to load")),
							{ once: true },
						);
						video.preload = "metadata";
						video.load();
					});
				}
			}
		});
	await page.evaluate(
		() =>
			new Promise<void>((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
			),
	);
}

async function expectCoreReadiness(page: Page, path: string) {
	const response = await page.goto(path, {
		waitUntil: "domcontentloaded",
	});
	expect(response?.status(), `${path} loads`).toBe(200);
	await page.waitForLoadState("networkidle");
	await expect(page.locator("main")).toBeVisible();
	await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	await waitForStableMedia(page);
	if (path === "/work/black-scholes-wasm/") {
		await expect(page.locator("#bs-controls")).not.toHaveAttribute(
			"aria-hidden",
			"true",
		);
		await expect(page.locator("#bs-price")).not.toHaveText("—");
	}
}

test.describe("Signal / Proof visual regression @visual-regression", () => {
	for (const viewport of viewportMatrix) {
		for (const route of visualRoutes) {
			test(`captures ${route.label} at ${viewport.label}`, async ({ page }) => {
				await page.setViewportSize(viewport.size);
				await stabilizeVisualState(page);
				await expectCoreReadiness(page, route.path);
				await expect(page).toHaveScreenshot(
					`${route.label}-${viewport.label}.png`,
					{
						fullPage: false,
						animations: "disabled",
						maxDiffPixels: 300,
					},
				);
			});
		}
	}
});
