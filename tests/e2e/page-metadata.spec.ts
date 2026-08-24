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
		label: "Conformal Work detail",
		path: "/work/conformal-cooling-channel-generation/",
	},
	{
		label: "note detail",
		path: "/notes/wasm-black-scholes-options-pricer/",
	},
	{
		label: "resume",
		path: "/resume/",
	},
	{
		label: "privacy",
		path: "/privacy/",
	},
	{
		label: "terms",
		path: "/terms/",
	},
] as const;

const legalRoutes = [
	{ path: "/privacy/", title: "Privacy Policy | Joe Poznanski" },
	{ path: "/terms/", title: "Terms of Service | Joe Poznanski" },
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
		const records = structuredData.flatMap((source) => JSON.parse(source));
		const person = records.find(
			(record: { "@type"?: string }) => record["@type"] === "Person",
		);

		expect(person).toMatchObject({
			"@type": "Person",
			name: "Joe Poznanski",
			jobTitle: "Principal Software Engineer",
			sameAs: [
				"https://www.linkedin.com/in/joe-poznanski",
				"https://github.com/HumanKaylee",
			],
		});
		expect(person.knowsAbout).toEqual([
			"Flight simulation",
			"Aerospace simulation",
			"Controls software",
			"Telemetry systems",
			"Rust",
			"C++",
			"Hardware-in-the-loop testing",
			"Injection molding",
			"Conformal cooling",
			"Metal additive manufacturing",
			"Distributed systems",
			"Operational software",
		]);
		expect(JSON.stringify(person)).not.toMatch(/josephpoznanski@gmail\.com/i);
		expect(structuredData.join("\n")).toContain('"@type":"WebSite"');
		expect(structuredData.join("\n")).not.toContain("/home/joe");
	});

	test("describes Home and Work with matching simulation and manufacturing scope", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			"content",
			"Principal software engineer for flight simulation, controls, telemetry, and operational systems in Rust and C++.",
		);

		await page.goto("/work/");
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			"content",
			"Evidence-backed work across flight simulation, engineering simulation, manufacturing software, and operational systems.",
		);
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

	test("@legal renders indexable route-specific metadata for both policies", async ({
		page,
	}) => {
		for (const legalRoute of legalRoutes) {
			const url = `${expectedSiteUrl}${legalRoute.path}`;

			await page.goto(legalRoute.path);
			await expect(page).toHaveTitle(legalRoute.title);
			await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
				"href",
				url,
			);
			await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
				"content",
				url,
			);
			await expect(page.locator('meta[name="description"]')).toHaveAttribute(
				"content",
				/\S/,
			);
			await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
				"content",
				"index,follow",
			);
		}
	});

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
			'"description":"Principal software engineer for flight simulation, controls, telemetry, and operational systems in Rust and C++."',
		);
		expect(jsonLdText).not.toMatch(
			/humankaylee\.dev|\/projects\/|\/case-studies\//i,
		);
	});

	test("keeps the Conformal Cooling canonical and CreativeWork JSON-LD aligned", async ({
		page,
	}) => {
		const canonicalUrl = `${expectedSiteUrl}/work/conformal-cooling-channel-generation/`;

		await page.goto("/work/conformal-cooling-channel-generation/");
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			"href",
			canonicalUrl,
		);
		await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
			"content",
			canonicalUrl,
		);
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			"content",
			"An engineering prototype for designing and validating conformal cooling passages inside injection molds, including geometries enabled by metal additive manufacturing.",
		);

		const jsonLdText = (
			await page.locator('script[type="application/ld+json"]').allTextContents()
		).join("\n");
		expect(jsonLdText).toContain('"@type":"CreativeWork"');
		expect(jsonLdText).toContain(
			'"name":"Conformal Cooling Channel Generation"',
		);
		expect(jsonLdText).toContain(`"url":"${canonicalUrl}"`);
	});

	test("renders route-specific X-Plane metadata and one canonical CreativeWork record", async ({
		page,
	}) => {
		const canonicalUrl = `${expectedSiteUrl}/work/xplane-cabin-camera-fov-trade-study/`;

		await page.goto("/work/xplane-cabin-camera-fov-trade-study/");
		await expect(page).toHaveTitle(
			"X-Plane Cabin Camera FOV Trade Study | Joe Poznanski",
		);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			"href",
			canonicalUrl,
		);
		await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
			"content",
			canonicalUrl,
		);
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			"content",
			`${expectedSiteUrl}/media/xplane-fov/comparison-bank-120-1440.webp`,
		);
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			"content",
			/A documented X-Plane replay comparing four cabin camera views/i,
		);

		const records = (
			await page.locator('script[type="application/ld+json"]').allTextContents()
		)
			.flatMap((source) => JSON.parse(source))
			.filter(
				(record: { "@type"?: string }) => record["@type"] === "CreativeWork",
			);

		expect(records).toHaveLength(1);
		expect(records[0]).toMatchObject({
			"@type": "CreativeWork",
			name: "X-Plane Cabin Camera FOV Trade Study",
			url: canonicalUrl,
		});
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
