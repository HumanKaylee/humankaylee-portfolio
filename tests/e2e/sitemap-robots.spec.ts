import { expect, test } from "@playwright/test";

test.describe("crawler artifacts @metadata", () => {
	test("serves robots.txt with the sitemap location and no broad disallow", async ({
		request,
	}) => {
		const response = await request.get("/robots.txt");

		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("text/plain");

		const body = await response.text();
		expect(body).toContain("User-agent: *");
		expect(body).toContain(
			"Sitemap: https://humankaylee.example/sitemap-index.xml",
		);
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
			"/projects/",
			"/resume/",
			"/contact/",
			"/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
			"/notes/redaction-rules-for-portfolio-case-studies/",
		]) {
			expect(body).toContain(`<loc>https://humankaylee.example${path}</loc>`);
		}

		expect(body).not.toContain("youtube-ai-video-pipeline");
		expect(body).not.toContain("kalshi-migration-or-analytics-tooling");
	});
});
