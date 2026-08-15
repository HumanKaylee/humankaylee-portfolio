import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const site = JSON.parse(
	readFileSync("apps/web/src/content/site/site.json", "utf8"),
) as { siteName: string; siteUrl: string };
const expectedSiteUrl = site.siteUrl.replace(/\/$/, "");

const blackScholesNote = {
	title: "A Black-Scholes options pricer in Rust, compiled to WASM",
	path: "/notes/wasm-black-scholes-options-pricer/",
	summary:
		"How a ~150-line Rust crate becomes a live, in-browser options pricer with sub-millisecond Greeks — without a server round-trip.",
	body: /The Black-Scholes model prices European options/i,
	dateLabel: "May 26, 2026",
	datetime: "2026-05-26",
	pubDate: "Tue, 26 May 2026 00:00:00 GMT",
	tags: ["rust", "wasm", "options"],
};

const suppressedNotes = [
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

		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			"Technical notes.",
		);

		const main = page.locator("main");
		const article = main.getByRole("article", {
			name: new RegExp(blackScholesNote.title, "i"),
		});
		await expect(
			article.getByRole("heading", { name: blackScholesNote.title }),
		).toBeVisible();
		await expect(article.getByText(blackScholesNote.summary)).toBeVisible();
		for (const tag of blackScholesNote.tags) {
			await expect(article.getByText(tag, { exact: true })).toBeVisible();
		}
		await expect(
			article.getByRole("link", {
				name: new RegExp(blackScholesNote.title, "i"),
			}),
		).toHaveAttribute("href", blackScholesNote.path);
		await expect(article.getByText(blackScholesNote.dateLabel)).toBeVisible();

		for (const note of suppressedNotes) {
			await expect(main).not.toContainText(note.title);
		}
		await expect(main).not.toContainText(
			/build log|portfolio architecture|publication boundaries|Phase 1/i,
		);
		await expect(main).not.toContainText(/needs-redaction|defer/i);

		const indexHtml = await main.textContent();
		for (const pattern of privateContentPatterns) {
			expect(indexHtml ?? "").not.toMatch(pattern);
		}

		await expect(
			page.locator(".artifact-grid, .project-card, .paper-panel"),
		).toHaveCount(0);
		const quietPresentation = await article.evaluate((element) => {
			const style = getComputedStyle(element);
			return {
				backgroundColor: style.backgroundColor,
				borderBottomWidth: style.borderBottomWidth,
				borderRadius: style.borderRadius,
				boxShadow: style.boxShadow,
			};
		});
		expect(quietPresentation).toEqual({
			backgroundColor: "rgba(0, 0, 0, 0)",
			borderBottomWidth: "1px",
			borderRadius: "0px",
			boxShadow: "none",
		});
	});

	test("does not generate public routes for suppressed operational notes", async ({
		page,
	}) => {
		for (const note of suppressedNotes) {
			const response = await page.goto(note.path);
			expect(response?.status(), note.path).toBe(404);
			await expect(
				page.getByRole("heading", { level: 1, name: /404:\s*not found/i }),
			).toBeVisible();
		}
	});

	test("keeps the Black-Scholes note honest about its canonical live tool", async ({
		page,
	}) => {
		await page.goto(blackScholesNote.path);
		const noteArticle = page.locator("article");
		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			blackScholesNote.title,
		);
		await expect(noteArticle).toContainText(blackScholesNote.summary);
		await expect(noteArticle).toContainText(blackScholesNote.body);
		await expect(noteArticle).not.toContainText(/build log|adjust .* below/i);
		await expect(
			noteArticle.getByRole("link", {
				name: "Open the live Black-Scholes tool",
			}),
		).toHaveAttribute("href", "/work/black-scholes-wasm/");
		await expect(
			page.locator(".artifact-grid, .project-card, .paper-panel"),
		).toHaveCount(0);
	});

	test("serves a valid published-notes RSS feed", async ({ request }) => {
		const response = await request.get("/rss.xml");

		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("xml");

		const xml = await response.text();
		expect(xml).toContain('<?xml version="1.0"');
		expect(xml).toContain('<rss version="2.0">');
		expect(xml).toContain("<channel>");
		expect(xml).toContain(`<title>${site.siteName} Notes</title>`);

		expect(xml).toContain(`<title>${blackScholesNote.title}</title>`);
		expect(xml).toContain(
			`<link>${expectedSiteUrl}${blackScholesNote.path}</link>`,
		);
		expect(xml).toContain(
			`<guid>${expectedSiteUrl}${blackScholesNote.path}</guid>`,
		);
		expect(xml).toContain(`<pubDate>${blackScholesNote.pubDate}</pubDate>`);
		expect(xml).toContain(
			`<description>${blackScholesNote.summary}</description>`,
		);
		for (const tag of blackScholesNote.tags) {
			expect(xml).toContain(`<category>${tag}</category>`);
		}

		for (const note of suppressedNotes) {
			expect(xml).not.toContain(note.title);
			expect(xml).not.toContain(`${expectedSiteUrl}${note.path}`);
			expect(xml).not.toContain(note.summary);
		}

		expect(xml).not.toMatch(/build[- ]log|needs-redaction|defer/i);
		for (const pattern of privateContentPatterns) {
			expect(xml).not.toMatch(pattern);
		}
	});
});
