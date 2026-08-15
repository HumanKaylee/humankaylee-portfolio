import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const site = JSON.parse(
	readFileSync("apps/web/src/content/site/site.json", "utf8"),
) as { defaultOgImage: string; siteUrl: string };
const expectedSiteUrl = site.siteUrl.replace(/\/$/, "");
const expectedSocialImage = `${expectedSiteUrl}${site.defaultOgImage}`;

const socialImageRoutes = [
	{
		label: "home",
		path: "/",
	},
	{
		label: "projects index",
		path: "/projects/",
	},
	{
		label: "case studies index",
		path: "/case-studies/",
	},
	{
		label: "notes index",
		path: "/notes/",
	},
	{
		label: "contact",
		path: "/contact/",
	},
	{
		label: "project detail",
		path: "/projects/cli-fleet-synchronization-and-mcp-rollout/",
	},
	{
		label: "case-study detail",
		path: "/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
	},
	{
		label: "note detail",
		path: "/notes/how-the-portfolio-stays-useful-when-the-api-is-offline/",
	},
	{
		label: "resume",
		path: "/resume/",
	},
] as const;

test.describe("page metadata @metadata", () => {
	test("renders canonical, Open Graph, Twitter card, and JSON-LD on the home page", async ({
		page,
	}) => {
		await page.goto("/");

		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			"href",
			`${expectedSiteUrl}/`,
		);
		await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
			"content",
			`${expectedSiteUrl}/`,
		);
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			"content",
			expectedSocialImage,
		);
		await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
			"content",
			expectedSocialImage,
		);

		const structuredData = await page
			.locator('script[type="application/ld+json"]')
			.allTextContents();

		expect(structuredData.join("\n")).toContain('"@type":"Person"');
		expect(structuredData.join("\n")).toContain('"@type":"WebSite"');
		expect(structuredData.join("\n")).not.toContain("/home/joe");
	});

	test("serves the configured default social preview asset", async ({
		request,
	}) => {
		const response = await request.get(site.defaultOgImage);

		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("image/png");
	});

	for (const testCase of socialImageRoutes) {
		test(`renders the configured default social image on ${testCase.label}`, async ({
			page,
		}) => {
			await page.goto(testCase.path);

			await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
				"content",
				expectedSocialImage,
			);
			await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
				"content",
				expectedSocialImage,
			);
		});
	}

	test("renders item-specific JSON-LD on project and case-study detail pages", async ({
		page,
	}) => {
		await page.goto("/projects/cli-fleet-synchronization-and-mcp-rollout/");

		let structuredData = await page
			.locator('script[type="application/ld+json"]')
			.allTextContents();
		let jsonLdText = structuredData.join("\n");

		expect(jsonLdText).toContain('"@type":"SoftwareSourceCode"');
		expect(jsonLdText).toContain(
			'"name":"CLI Fleet Synchronization and MCP Rollout"',
		);
		expect(jsonLdText).toContain(
			`"url":"${expectedSiteUrl}/projects/cli-fleet-synchronization-and-mcp-rollout/"`,
		);
		expect(jsonLdText).not.toContain("/home/joe");

		await page.goto("/case-studies/cli-fleet-synchronization-and-mcp-rollout/");

		structuredData = await page
			.locator('script[type="application/ld+json"]')
			.allTextContents();
		jsonLdText = structuredData.join("\n");

		expect(jsonLdText).toContain('"@type":"CreativeWork"');
		expect(jsonLdText).toContain(
			'"name":"CLI Fleet Synchronization and MCP Rollout"',
		);
		expect(jsonLdText).toContain(
			`"url":"${expectedSiteUrl}/case-studies/cli-fleet-synchronization-and-mcp-rollout/"`,
		);
		expect(jsonLdText).not.toContain("Complete the final approval checklist");
		expect(jsonLdText).not.toContain("openItems");
		expect(jsonLdText).not.toContain("/home/joe");
	});

	test("renders note-specific BlogPosting JSON-LD on note detail pages", async ({
		page,
	}) => {
		await page.goto(
			"/notes/how-the-portfolio-stays-useful-when-the-api-is-offline/",
		);

		const structuredData = await page
			.locator('script[type="application/ld+json"]')
			.allTextContents();
		const jsonLdText = structuredData.join("\n");

		expect(jsonLdText).toContain('"@type":"BlogPosting"');
		expect(jsonLdText).toContain(
			'"headline":"How the portfolio stays useful when the API is offline"',
		);
		expect(jsonLdText).toContain(
			`"url":"${expectedSiteUrl}/notes/how-the-portfolio-stays-useful-when-the-api-is-offline/"`,
		);
		expect(jsonLdText).toContain('"datePublished":"2026-05-24"');
		expect(jsonLdText).not.toContain("/home/joe");
	});
});
