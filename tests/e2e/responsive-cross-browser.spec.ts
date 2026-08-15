import { type Page, expect, test } from "@playwright/test";

const launchRoutes = [
	{
		path: "/",
		heading: /Systems built to hold up/i,
		marker: /Principal engineer/i,
		primaryLink: /Download resume PDF/i,
		primaryText: undefined,
	},
	{
		path: "/projects/",
		heading: /Selected systems, mapped by capability/i,
		marker: /CLI Fleet Synchronization/i,
		primaryLink: /View project detail for CLI Fleet Synchronization/i,
		primaryText: undefined,
	},
	{
		path: "/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
		heading: /CLI Fleet Synchronization and MCP Rollout/i,
		marker: /sanitized rollout matrix/i,
		primaryLink: undefined,
		primaryText: /operator checklist/i,
	},
	{
		path: "/resume/",
		heading: /Joe Poznanski/i,
		marker: /Download full resume \(PDF\)/i,
		primaryLink: /Download full resume \(PDF\)/i,
		primaryText: undefined,
	},
	{
		path: "/notes/",
		heading: /notes from the systems atelier/i,
		marker: /How the portfolio stays useful when the API is offline/i,
		primaryLink: /How the portfolio stays useful when the API is offline/i,
		primaryText: undefined,
	},
	{
		path: "/notes/how-the-portfolio-stays-useful-when-the-api-is-offline/",
		heading: /How the portfolio stays useful when the API is offline/i,
		marker: /The static shell carries the recruiting story/i,
		primaryLink: undefined,
		primaryText: /Rust API/i,
	},
	{
		path: "/contact/",
		heading: /contact joe/i,
		marker: /fastest route is direct email/i,
		primaryLink: /josephpoznanski@gmail\.com/i,
		primaryText: undefined,
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

	expect(response?.status(), `${label} response status`).toBeLessThan(400);
	await expect(page.getByRole("heading", { level: 1 })).toContainText(
		route.heading,
	);
	await expect(page.locator("main")).toContainText(route.marker);
	if (route.primaryLink) {
		await expect(
			page.getByRole("link", { name: route.primaryLink }).first(),
		).toBeVisible();
	}
	if (route.primaryText) {
		await expect(page.locator("main")).toContainText(route.primaryText);
	}
	await expect(page.locator(".static-fallback-note")).toHaveCount(0);
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

test.describe("B-055 responsive cross-browser QA @responsive", () => {
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

	test("considers LinkedIn in-app mobile first-load readability", async ({
		browser,
		browserName,
		baseURL,
	}) => {
		const context = await browser.newContext({
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
				/Systems built to hold up/i,
			);
			await expect(page.locator("main")).toContainText(/Principal engineer/i);
			await expect(
				page.getByRole("link", { name: /Download resume PDF/i }),
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
