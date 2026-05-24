import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const site = JSON.parse(
	readFileSync("apps/web/src/content/site/site.json", "utf8"),
) as { siteUrl: string };
const expectedSiteUrl = site.siteUrl.replace(/\/$/, "");

const publishedNotes = [
	{
		title: "How the portfolio stays useful when the API is offline",
		path: "/notes/how-the-portfolio-stays-useful-when-the-api-is-offline/",
		summary:
			"A build-log note describing the static-first contract that keeps the portfolio credible when enhanced services are unavailable.",
		body: /The static shell carries the recruiting story/i,
		dateLabel: "May 24, 2026",
		datetime: "2026-05-24",
		pubDate: "Sun, 24 May 2026 00:00:00 GMT",
		tags: ["static-first", "resilience", "Rust API"],
	},
	{
		title: "Redaction rules for portfolio case studies",
		path: "/notes/redaction-rules-for-portfolio-case-studies/",
		summary:
			"A build-log note summarizing the publication safety boundary for case-study evidence.",
		body: /Public proof should preserve the engineering story/i,
		dateLabel: "May 23, 2026",
		datetime: "2026-05-23",
		pubDate: "Sat, 23 May 2026 00:00:00 GMT",
		tags: ["redaction", "case studies", "public safety"],
	},
	{
		title: "Why the portfolio content starts as data, not pages",
		path: "/notes/why-the-portfolio-content-starts-as-data-not-pages/",
		summary:
			"A build-log note explaining why Phase 1 establishes structured inventory before visual page composition.",
		body: /Phase 1 starts with contracts and safe inventory/i,
		dateLabel: "May 23, 2026",
		datetime: "2026-05-23",
		pubDate: "Sat, 23 May 2026 00:00:00 GMT",
		tags: ["content model", "contracts", "static-first"],
	},
];

const privateContentPatterns = [
	/\/home\/joe/i,
	/100\.77\.\d+\.\d+/,
	/RubyPalace/i,
	/ares-tron/i,
	/(token|secret|password)=/i,
];

test.describe("notes and RSS @notes-rss", () => {
	test("lists published notes and renders readable detail pages", async ({
		page,
	}) => {
		await page.goto("/notes/");

		await expect(page.getByRole("heading", { level: 1 })).toContainText(
			/notes|build log/i,
		);

		const main = page.locator("main");
		for (const note of publishedNotes) {
			const article = main.getByRole("article", {
				name: new RegExp(note.title, "i"),
			});
			await expect(
				article.getByRole("heading", { name: note.title }),
			).toBeVisible();
			await expect(article.getByText(note.summary)).toBeVisible();
			for (const tag of note.tags) {
				await expect(article.getByText(tag, { exact: true })).toBeVisible();
			}
			await expect(
				article.getByRole("link", { name: new RegExp(note.title, "i") }),
			).toHaveAttribute("href", note.path);
			await expect(article.getByText(note.dateLabel)).toBeVisible();
		}

		await expect(main).not.toContainText(/needs-redaction|defer/i);

		const indexHtml = await main.textContent();
		for (const pattern of privateContentPatterns) {
			expect(indexHtml ?? "").not.toMatch(pattern);
		}

		for (const note of publishedNotes) {
			await page.goto(note.path);

			await expect(page.getByRole("heading", { level: 1 })).toHaveText(
				note.title,
			);
			await expect(page.locator("article time")).toHaveAttribute(
				"datetime",
				note.datetime,
			);
			await expect(page.locator("article")).toContainText(note.summary);
			await expect(page.locator("article")).toContainText(note.body);
			for (const tag of note.tags) {
				await expect(page.locator("article")).toContainText(tag);
			}

			const articleText = await page.locator("article").textContent();
			for (const pattern of privateContentPatterns) {
				expect(articleText ?? "").not.toMatch(pattern);
			}
		}
	});

	test("serves a valid published-notes RSS feed", async ({ request }) => {
		const response = await request.get("/rss.xml");

		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("xml");

		const xml = await response.text();
		expect(xml).toContain('<?xml version="1.0"');
		expect(xml).toContain('<rss version="2.0">');
		expect(xml).toContain("<channel>");
		expect(xml).toContain("<title>HumanKaylee Portfolio Notes</title>");

		for (const note of publishedNotes) {
			expect(xml).toContain(`<title>${note.title}</title>`);
			expect(xml).toContain(`<link>${expectedSiteUrl}${note.path}</link>`);
			expect(xml).toContain(`<guid>${expectedSiteUrl}${note.path}</guid>`);
			expect(xml).toContain(`<pubDate>${note.pubDate}</pubDate>`);
			expect(xml).toContain(`<description>${note.summary}</description>`);
			for (const tag of note.tags) {
				expect(xml).toContain(`<category>${tag}</category>`);
			}
		}

		expect(xml).not.toMatch(/needs-redaction|defer/i);
		for (const pattern of privateContentPatterns) {
			expect(xml).not.toMatch(pattern);
		}
	});
});
