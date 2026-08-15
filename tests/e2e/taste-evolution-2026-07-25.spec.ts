import { expect, test } from "@playwright/test";

const routeCurrentLinks = [
	["/", "/"],
	["/projects/", "/projects/"],
	["/now/", "/now/"],
	["/uses/", "/uses/"],
	["/reading/", "/reading/"],
	["/resume/", "/resume/"],
	["/contact/", "/contact/"],
] as const;

test.describe("portfolio taste evolution July 2026 @taste-evolution", () => {
	test("marks exactly one current primary navigation item on every public tab", async ({
		page,
	}) => {
		for (const [route, expectedHref] of routeCurrentLinks) {
			await page.goto(route);
			const current = page.locator(".primary-nav a[aria-current='page']");
			await expect(current).toHaveCount(1);
			await expect(current).toHaveAttribute("href", expectedHref);
		}
	});

	test("uses intentional visual hierarchy rather than repeated equal card grids", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(page.locator(".home-recruiter-path")).toBeVisible();
		await expect(page.locator(".home-featured-project")).toBeVisible();

		await page.goto("/now/");
		await expect(page.locator(".now-focus-card-primary")).toBeVisible();

		await page.goto("/uses/");
		await expect(page.locator(".uses-list-item-featured")).toBeVisible();

		await page.goto("/reading/");
		await expect(page.locator(".reading-item-featured")).toHaveCount(3);
	});

	test("keeps the project constellation limited to public capability clusters", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1440, height: 1000 });
		await page.goto("/projects/");

		const labels = page.locator("[data-constellation-cluster]");
		await expect(labels).toHaveCount(2);
		await expect(labels).toContainText(["creative web", "operations"]);
		expect(await labels.allTextContents()).not.toContain("automation");
		await expect(page.locator(".constellation-artifact-grid")).toHaveCount(0);
		await expect(
			page.locator("[data-constellation-node]").first(),
		).toHaveAttribute("href", /\/projects\//);
	});

	test("preserves the compact resume metadata and contact fallback contract", async ({
		page,
	}) => {
		await page.goto("/resume/");
		await expect(page.locator(".resume-meta-list")).toBeVisible();

		await page.goto("/contact/");
		await expect(page.getByText("Useful context to include")).toBeVisible();
		await expect(
			page.getByRole("textbox", { name: "Your name" }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: /josephpoznanski@gmail.com/i }),
		).toBeVisible();
	});
});
