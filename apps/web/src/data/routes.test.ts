import { describe, expect, it } from "vitest";

import { routeInventory } from "./routes";

describe("routeInventory", () => {
	it("covers the Phase 1 route inventory in the expected order", () => {
		expect(routeInventory.map((route) => route.id)).toEqual([
			"home",
			"projects",
			"project-detail",
			"case-studies",
			"case-study-detail",
			"notes-build-log",
			"resume",
			"contact",
			"sitemap",
			"robots",
			"fallback-error",
		]);
	});

	it("requires shared SEO metadata and route ownership metadata on every entry", () => {
		for (const route of routeInventory) {
			expect(route.label).toBeTypeOf("string");
			expect(route.path).toBeTypeOf("string");
			expect(route.owner).toBeTypeOf("string");
			expect(route.status).toBeTypeOf("string");
			expect(route.seo.title).toBeTypeOf("string");
			expect(route.seo.description).toBeTypeOf("string");
			expect(route.seo.canonicalPath).toBeTypeOf("string");
			expect(route.seo.ogImage).toBeTypeOf("string");
			expect("ogImagePath" in route.seo).toBe(false);
			expect(route.seo.robots).toMatch(/^(index|noindex),(follow|nofollow)$/);
		}
	});

	it("marks the content-driven routes and utility routes distinctly", () => {
		const caseStudies = routeInventory.find(
			(route) => route.id === "case-studies",
		);
		const caseStudyDetail = routeInventory.find(
			(route) => route.id === "case-study-detail",
		);
		const notesBuildLog = routeInventory.find(
			(route) => route.id === "notes-build-log",
		);
		const resume = routeInventory.find((route) => route.id === "resume");
		const sitemap = routeInventory.find((route) => route.id === "sitemap");
		const robots = routeInventory.find((route) => route.id === "robots");
		const fallbackError = routeInventory.find(
			(route) => route.id === "fallback-error",
		);

		expect(caseStudies?.owner).toBe("content");
		expect(caseStudyDetail?.path).toBe("/case-studies/[slug]/");
		expect(notesBuildLog?.status).toBe("draft");
		expect(resume?.owner).toBe("content");
		expect(sitemap?.status).toBe("generated");
		expect(robots?.seo.robots).toBe("noindex,nofollow");
		expect(fallbackError?.seo.robots).toBe("noindex,nofollow");
	});
});
