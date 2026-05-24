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
	{
		label: "home",
		path: "/",
	},
	{
		label: "projects",
		path: "/projects/",
	},
	{
		label: "case-study",
		path: "/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
	},
	{
		label: "resume",
		path: "/resume/",
	},
	{
		label: "contact",
		path: "/contact/",
	},
] as const;

async function stabilizeVisualState(page: import("@playwright/test").Page) {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.addInitScript(() => {
		const sheet = document.createElement("style");
		sheet.id = "visual-regression-motion-lock";
		sheet.textContent =
			"*, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }";
		document.documentElement.append(sheet);
	});
	await page.route("**/api/health", (route) =>
		route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				status: "ok",
				version: "visual-regression-test",
			}),
		}),
	);
	await page.route("**/api/projects/live", (route) =>
		route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				projects: [{ slug: "cli-fleet-synchronization-and-mcp-rollout" }],
				stale: false,
			}),
		}),
	);
}

async function expectCoreReadiness(page: Page, path: string) {
	const response = await page.goto(path, {
		waitUntil: "domcontentloaded",
	});
	expect(response?.status(), `${path} loads`).toBeLessThan(400);
	await page.waitForLoadState("networkidle");
	await expect(page.locator("main")).toBeVisible();
	await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

test.describe("visual regression @visual-regression", () => {
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
						mask: [
							page.locator("[data-telemetry-status]"),
							page.locator(".contact-status"),
						],
					},
				);
			});
		}
	}
});
