import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const contentRoot = "apps/web/src/content";

describe("Astro content collection fixtures", () => {
	it("creates the schema-backed collection directories expected by Astro", () => {
		for (const collection of [
			"case-studies",
			"notes",
			"projects",
			"resume",
			"site",
		]) {
			expect(existsSync(join(contentRoot, collection))).toBe(true);
		}
	});

	it("provides enough case-study entries for the Phase 1 launch gate", () => {
		const entries = readdirSync(join(contentRoot, "case-studies")).filter(
			(file) => file.endsWith(".md"),
		);

		expect(entries).toHaveLength(6);
	});

	it("keeps v1 case-study outlines linked to the source redaction guide without claiming launch approval", () => {
		const entries = readdirSync(join(contentRoot, "case-studies")).filter(
			(file) => file.endsWith(".md"),
		);
		const selectedForV1 = entries
			.map((entry) =>
				readFileSync(join(contentRoot, "case-studies", entry), "utf8"),
			)
			.filter((contents) => contents.includes('publicationStatus: "publish"'));

		expect(selectedForV1).toHaveLength(4);

		for (const contents of selectedForV1) {
			expect(contents).not.toContain('redactionStatus: "approved"');
			expect(contents).toContain(
				'guidePath: "docs/CONTENT_REDACTION_GUIDE.md"',
			);
			expect(contents).not.toContain(
				'docs: "/docs/CONTENT_REDACTION_GUIDE.md"',
			);
		}
	});
});
