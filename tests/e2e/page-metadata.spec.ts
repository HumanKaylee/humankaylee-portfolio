import { expect, test } from "@playwright/test";

test.describe("page metadata @metadata", () => {
	test("renders canonical, Open Graph, Twitter card, and JSON-LD on the home page", async ({
		page,
	}) => {
		await page.goto("/");

		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			"href",
			"https://humankaylee.example/",
		);
		await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
			"content",
			"https://humankaylee.example/",
		);
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			"content",
			"https://humankaylee.example/social/default.svg",
		);
		await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
			"content",
			"https://humankaylee.example/social/default.svg",
		);

		const structuredData = await page
			.locator('script[type="application/ld+json"]')
			.allTextContents();

		expect(structuredData.join("\n")).toContain('"@type":"Person"');
		expect(structuredData.join("\n")).toContain('"@type":"WebSite"');
		expect(structuredData.join("\n")).not.toContain("/home/joe");
	});

	test("serves the default social preview asset", async ({ request }) => {
		const response = await request.get("/social/default.svg");

		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("image/svg+xml");
	});
});
