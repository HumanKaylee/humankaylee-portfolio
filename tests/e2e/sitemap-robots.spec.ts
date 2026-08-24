import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const site = JSON.parse(
	readFileSync("apps/web/src/content/site/site.json", "utf8"),
) as { siteUrl: string };
const expectedSiteUrl = site.siteUrl.replace(/\/$/, "");

test.describe("crawler artifacts @metadata", () => {
	test("serves robots.txt with the sitemap location and no broad disallow", async ({
		request,
	}) => {
		const response = await request.get("/robots.txt");

		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("text/plain");

		const body = await response.text();
		expect(body).toContain("User-agent: *");
		expect(body).toContain(`Sitemap: ${expectedSiteUrl}/sitemap-index.xml`);
		expect(body).not.toContain("Disallow: /");
	});

	test("serves a sitemap for core routes and published content only", async ({
		request,
	}) => {
		const response = await request.get("/sitemap-index.xml");

		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("application/xml");

		const body = await response.text();
		expect(body).toContain("<urlset");
		for (const path of [
			"/",
			"/work/",
			"/work/cryo-flow-sim/",
			"/work/conformal-cooling-channel-generation/",
			"/work/xplane-cabin-camera-fov-trade-study/",
			"/work/cli-fleet-synchronization-and-mcp-rollout/",
			"/work/remote-workstation-recovery-and-operational-debugging/",
			"/work/black-scholes-wasm/",
			"/about/",
			"/resume/",
			"/contact/",
			"/notes/",
			"/notes/wasm-black-scholes-options-pricer/",
		]) {
			expect(body).toContain(`<loc>${expectedSiteUrl}${path}</loc>`);
		}
		expect(
			body.split(
				`${expectedSiteUrl}/work/xplane-cabin-camera-fov-trade-study/`,
			),
		).toHaveLength(2);

		expect(body).not.toContain("/projects/");
		expect(body).not.toContain("/case-studies/");
		expect(body).not.toContain(
			"/notes/how-the-portfolio-stays-useful-when-the-api-is-offline/",
		);
		expect(body).not.toContain(
			"/notes/redaction-rules-for-portfolio-case-studies/",
		);
		expect(body).not.toContain(
			"/notes/why-the-portfolio-content-starts-as-data-not-pages/",
		);
		expect(body).not.toContain("youtube-ai-video-pipeline");
		expect(body).not.toContain("kalshi-migration-or-analytics-tooling");
	});

	test("keeps RSS limited to the existing public Note boundary", async ({
		request,
	}) => {
		const response = await request.get("/rss.xml");
		const body = await response.text();

		expect(response.status()).toBe(200);
		expect(body).toContain(
			`${expectedSiteUrl}/notes/wasm-black-scholes-options-pricer/`,
		);
		expect(body).not.toContain(
			"how-the-portfolio-stays-useful-when-the-api-is-offline",
		);
		expect(body).not.toContain("redaction-rules-for-portfolio-case-studies");
		expect(body).not.toContain(
			"why-the-portfolio-content-starts-as-data-not-pages",
		);
	});
});
