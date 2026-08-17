import { type Page, expect, test } from "@playwright/test";

const launchRoutes = [
	{
		path: "/",
		heading:
			/Principal engineer for simulation, controls, and operational software/i,
		marker: /Three systems\. Three kinds of proof/i,
		primaryLink: /View selected work/i,
	},
	{
		path: "/work/",
		heading: /Systems made legible through proof/i,
		marker: /Cryogenic Flow Simulation/i,
		primaryLink: /Read the case study/i,
	},
	{
		path: "/work/cryo-flow-sim/",
		heading: /Cryogenic Flow Simulation/i,
		marker: /Proof/i,
		primaryLink: /Open the simulation video/i,
	},
	{
		path: "/work/cli-fleet-synchronization-and-mcp-rollout/",
		heading: /CLI Fleet Synchronization/i,
		marker: /Proof/i,
		primaryLink: /Next project:/i,
	},
	{
		path: "/work/remote-workstation-recovery-and-operational-debugging/",
		heading: /Remote Workstation Recovery/i,
		marker: /Proof/i,
		primaryLink: /Next project:/i,
	},
	{
		path: "/work/black-scholes-wasm/",
		heading: /Black-Scholes Options Pricer/i,
		marker: /Live pricer/i,
		primaryLink: /Next project:/i,
	},
	{
		path: "/about/",
		heading: /Engineering judgment for systems that have to hold up/i,
		marker: /Operating principles/i,
		primaryLink: /See selected work/i,
	},
	{
		path: "/resume/",
		heading: /Joe Poznanski/i,
		marker: /Agentic AI & automation highlights/i,
		primaryLink: /Download résumé PDF/i,
	},
	{
		path: "/notes/",
		heading: /Technical notes/i,
		marker: /Black-Scholes/i,
		primaryLink: /Black-Scholes Options Pricer/i,
	},
	{
		path: "/contact/",
		heading: /Let’s talk about the system behind the problem/i,
		marker: /Useful context to include/i,
		primaryLink: /Email Joe/i,
	},
] as const;

const viewportMatrix = [
	{
		name: "mobile",
		size: { width: 390, height: 844 },
	},
	{
		name: "tablet",
		size: { width: 820, height: 1180 },
	},
	{
		name: "desktop",
		size: { width: 1440, height: 1000 },
	},
] as const;

async function expectNoHorizontalOverflow(page: Page, label: string) {
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

	expect(overflow, `${label} should not have horizontal overflow`).toBe(false);
}

async function expectFirstLoadReadable(
	page: Page,
	route: (typeof launchRoutes)[number],
	label: string,
) {
	const response = await page.goto(route.path, {
		waitUntil: "domcontentloaded",
	});

	expect(response?.status(), `${label} response status`).toBe(200);
	await expect(page.getByRole("heading", { level: 1 })).toContainText(
		route.heading,
	);
	await expect(page.locator("main")).toContainText(route.marker);
	await expect(
		page.getByRole("link", { name: route.primaryLink }).first(),
	).toBeVisible();
	await expect(
		page.locator(".static-fallback-note, .noscript-banner"),
	).toHaveCount(0);
	await expectNoHorizontalOverflow(page, label);

	const firstHeadingBox = await page
		.getByRole("heading", { level: 1 })
		.boundingBox();
	expect(
		firstHeadingBox,
		`${label} H1 should have a visible bounding box`,
	).not.toBe(null);
	expect(
		firstHeadingBox?.y ?? Number.POSITIVE_INFINITY,
		`${label} H1 should appear in the initial viewport`,
	).toBeLessThan(page.viewportSize()?.height ?? 0);
}

test.describe("Signal / Proof responsive cross-browser QA @responsive", () => {
	for (const viewport of viewportMatrix) {
		test(`keeps launch routes readable on ${viewport.name}`, async ({
			page,
			browserName,
		}) => {
			await page.setViewportSize(viewport.size);

			for (const route of launchRoutes) {
				await expectFirstLoadReadable(
					page,
					route,
					`${browserName} ${viewport.name} ${route.path}`,
				);
			}
		});
	}

	test("keeps the LinkedIn in-app mobile first load static and readable", async ({
		browser,
		browserName,
		baseURL,
	}) => {
		const context = await browser.newContext({
			javaScriptEnabled: false,
			userAgent:
				"Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) LinkedInApp/9.1.0 Mobile/15E148 Safari/604.1",
			viewport: { width: 390, height: 844 },
		});
		const page = await context.newPage();

		try {
			await page.goto(new URL("/", baseURL).toString(), {
				waitUntil: "domcontentloaded",
			});
			await expect(page.getByRole("heading", { level: 1 })).toContainText(
				/Principal engineer for simulation, controls, and operational software/i,
			);
			await expect(page.locator("[data-stage-panel]:visible")).toHaveCount(3);
			await expect(
				page.getByRole("link", { name: /View selected work/i }),
			).toBeVisible();
			await expectNoHorizontalOverflow(
				page,
				`${browserName} LinkedIn in-app mobile approximation`,
			);
		} finally {
			await context.close();
		}
	});
});
