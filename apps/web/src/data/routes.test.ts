import { describe, expect, it } from "vitest";

import { profile } from "./profile";
import { routeInventory, routeInventoryById } from "./routes";
import { primaryNavigation, secondaryNavigation } from "./site-navigation";

describe("routeInventory", () => {
	it("centers primary visitor navigation on Work, About, Résumé, and Contact", () => {
		const primaryPaths = routeInventory
			.filter((route) => route.primary)
			.map((route) => route.path);

		expect(primaryPaths).toEqual([
			"/work/",
			"/about/",
			"/resume/",
			"/contact/",
		]);
		expect(primaryPaths).not.toContain("/projects/");
		expect(primaryNavigation.map((item) => item.label)).toEqual([
			"Work",
			"About",
			"Résumé",
			"Contact",
		]);
		expect(primaryNavigation).not.toHaveLength(7);
		expect(secondaryNavigation.map((item) => item.href)).toEqual([
			"/notes/",
			"/now/",
			"/uses/",
			"/reading/",
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

	it("keeps legacy project records non-primary while exposing canonical Work and About routes", () => {
		expect(routeInventoryById.work.path).toBe("/work/");
		expect(routeInventoryById.about.path).toBe("/about/");
		expect(routeInventoryById.projects).toMatchObject({
			primary: false,
			legacy: true,
		});
		expect(routeInventoryById["case-studies"]).toMatchObject({
			primary: false,
			legacy: true,
		});
		expect(routeInventoryById.robots.seo.robots).toBe("noindex,nofollow");
		expect(routeInventoryById["fallback-error"].seo.robots).toBe(
			"noindex,nofollow",
		);
	});

	it("uses Joe Poznanski as the single primary public identity", () => {
		expect(profile).toMatchObject({
			name: "Joe Poznanski",
			role: "Principal Software Engineer",
			location: "Titusville, Florida, USA",
			email: "josephpoznanski@gmail.com",
			linkedin: "https://www.linkedin.com/in/joe-poznanski",
			github: "https://github.com/HumanKaylee",
		});
		expect(Object.values(profile).join(" ")).not.toMatch(/systems atelier/i);
	});
});
