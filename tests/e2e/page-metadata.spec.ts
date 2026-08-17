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
		label: "Work index",
		path: "/work/",
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
		label: "Work detail",
		path: "/work/cli-fleet-synchronization-and-mcp-rollout/",
	},
	{
		label: "note detail",
		path: "/notes/wasm-black-scholes-options-pricer/",
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

	test("renders item-specific CreativeWork JSON-LD on Work detail pages", async ({
		page,
	}) => {
		await page.goto("/work/cli-fleet-synchronization-and-mcp-rollout/");

		const structuredData = await page
			.locator('script[type="application/ld+json"]')
			.allTextContents();
		const jsonLdText = structuredData.join("\n");

		expect(jsonLdText).toContain('"@type":"CreativeWork"');
		expect(jsonLdText).toContain('"name":"CLI Fleet Synchronization"');
		expect(jsonLdText).toContain(
			`"url":"${expectedSiteUrl}/work/cli-fleet-synchronization-and-mcp-rollout/"`,
		);
		expect(jsonLdText).not.toMatch(/redaction|openItems|checklistStatus/i);
		expect(jsonLdText).not.toContain("/home/joe");
	});

	test("keeps the Cryogenic Flow canonical, Open Graph, and JSON-LD URLs aligned", async ({
		page,
	}) => {
		const canonicalUrl = `${expectedSiteUrl}/work/cryo-flow-sim/`;

		await page.goto("/work/cryo-flow-sim/");
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			"href",
			canonicalUrl,
		);
		await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
			"content",
			canonicalUrl,
		);

		const jsonLdText = (
			await page.locator('script[type="application/ld+json"]').allTextContents()
		).join("\n");
		expect(jsonLdText).toContain(`"url":"${canonicalUrl}"`);
		expect(jsonLdText).toContain(
			'"description":"Principal engineer for simulation, controls, and operational software."',
		);
		expect(jsonLdText).not.toMatch(
			/humankaylee\.dev|\/projects\/|\/case-studies\//i,
		);
	});

	test("renders note-specific BlogPosting JSON-LD on note detail pages", async ({
		page,
	}) => {
		await page.goto("/notes/wasm-black-scholes-options-pricer/");

		const structuredData = await page
			.locator('script[type="application/ld+json"]')
			.allTextContents();
		const jsonLdText = structuredData.join("\n");

		expect(jsonLdText).toContain('"@type":"BlogPosting"');
		expect(jsonLdText).toContain(
			'"headline":"A Black-Scholes options pricer in Rust, compiled to WASM"',
		);
		expect(jsonLdText).toContain(
			`"url":"${expectedSiteUrl}/notes/wasm-black-scholes-options-pricer/"`,
		);
		expect(jsonLdText).toContain('"datePublished":"2026-05-26"');
		expect(jsonLdText).not.toContain("/home/joe");
	});
});
