import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const contentRoot = "apps/web/src/content";

describe("Astro content collection fixtures", () => {
	it("creates the schema-backed collection directories expected by Astro", () => {
		for (const collection of [
			"case-studies",
			"notes",
			"now",
			"projects",
			"reading",
			"resume",
			"site",
			"uses",
		]) {
			expect(existsSync(join(contentRoot, collection))).toBe(true);
		}
	});

	it("provides enough case-study entries for the Phase 1 launch gate", () => {
		const entries = readdirSync(join(contentRoot, "case-studies")).filter(
			(file) => file.endsWith(".md"),
		);

		// 7 entries as of M5 (cryo-flow-sim added in M5 alongside original 6)
		expect(entries).toHaveLength(7);
	});

	it("uses the approved production domain for canonical metadata", () => {
		const site = JSON.parse(
			readFileSync(join(contentRoot, "site", "site.json"), "utf8"),
		) as { siteUrl?: string };

		expect(site.siteUrl).toBe("https://joepoznanski.io");
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

		// 5 publish entries as of M5 (cryo-flow-sim added in M5)
		expect(selectedForV1).toHaveLength(5);

		for (const contents of selectedForV1) {
			// M5 approved 3 entries (cli-fleet, cryo-flow-sim, remote-workstation);
			// reviewed entries may still be "reviewed" pending production URL evidence.
			// All publish entries must still link to the redaction guide.
			expect(contents).toContain(
				'guidePath: "docs/CONTENT_REDACTION_GUIDE.md"',
			);
			expect(contents).not.toContain(
				'docs: "/docs/CONTENT_REDACTION_GUIDE.md"',
			);
		}
	});
});
