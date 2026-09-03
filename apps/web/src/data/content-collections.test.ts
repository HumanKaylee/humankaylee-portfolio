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

	it("keeps exactly eight unified Work records in published hierarchy order", () => {
		const entries = readdirSync(join(contentRoot, "work")).filter((file) =>
			file.endsWith(".md"),
		);
		const orderedSlugs = entries
			.map((entry) => {
				const contents = readFileSync(join(contentRoot, "work", entry), "utf8");
				return {
					featuredOrder: Number(
						contents.match(/^featuredOrder:\s*(\d+)$/m)?.[1],
					),
					slug: contents.match(/^slug:\s*"([^"]+)"$/m)?.[1],
				};
			})
			.sort((left, right) => left.featuredOrder - right.featuredOrder)
			.map((entry) => entry.slug);

		expect(entries).toHaveLength(8);
		expect(orderedSlugs).toEqual([
			"cryo-flow-sim",
			"conformal-cooling-channel-generation",
			"xplane-cabin-camera-fov-trade-study",
			"openxhc-linuxcnc",
			"mac-mini-shelf",
			"black-scholes-wasm",
			"cli-fleet-synchronization-and-mcp-rollout",
			"remote-workstation-recovery-and-operational-debugging",
		]);
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

		expect(published).toHaveLength(8);

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
