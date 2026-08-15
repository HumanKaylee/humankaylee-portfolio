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

async function expectCoreReadiness(page: Page, path: string) {
	const response = await page.goto(path, {
		waitUntil: "domcontentloaded",
	});
	expect(response?.status(), `${path} loads`).toBe(200);
	await page.waitForLoadState("networkidle");
	await expect(page.locator("main")).toBeVisible();
	await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
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
