import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const contentRoot = "apps/web/src/content";
const contentConfig = readFileSync("apps/web/src/content.config.ts", "utf8");

describe("Astro content collection fixtures", () => {
	it("creates the schema-backed collection directories expected by Astro", () => {
		for (const collection of [
			"notes",
			"now",
			"reading",
			"resume",
			"site",
			"uses",
			"work",
		]) {
			expect(existsSync(join(contentRoot, collection))).toBe(true);
		}
	});

	it("registers Work as the only public project-story collection", () => {
		expect(contentConfig).toMatch(/\bconst work = defineCollection\(/);
		expect(contentConfig).not.toMatch(/\bconst projects = defineCollection\(/);
		expect(contentConfig).not.toMatch(
			/\bconst caseStudies = defineCollection\(/,
		);
		expect(contentConfig).not.toMatch(/\bprojects,|\bcaseStudies,/);
	});

	it("keeps exactly five unified Work records", () => {
		const entries = readdirSync(join(contentRoot, "work")).filter((file) =>
			file.endsWith(".md"),
		);

		expect(entries).toHaveLength(5);
	});

	it("uses the approved production domain for canonical metadata", () => {
		const site = JSON.parse(
			readFileSync(join(contentRoot, "site", "site.json"), "utf8"),
		) as { siteUrl?: string };

		expect(site.siteUrl).toBe("https://joepoznanski.io");
	});

	it("keeps all generated Work records published and linked to the source review guide", () => {
		const entries = readdirSync(join(contentRoot, "work")).filter((file) =>
			file.endsWith(".md"),
		);
		const published = entries
			.map((entry) => readFileSync(join(contentRoot, "work", entry), "utf8"))
			.filter((contents) => contents.includes('publicationStatus: "publish"'));

		expect(published).toHaveLength(5);

		for (const contents of published) {
			expect(contents).toContain(
				'guidePath: "docs/CONTENT_REDACTION_GUIDE.md"',
			);
			expect(contents).not.toContain(
				'docs: "/docs/CONTENT_REDACTION_GUIDE.md"',
			);
		}
	});
});
