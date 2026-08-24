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

	it("exposes canonical Work and About routes without legacy public route records", () => {
		expect(routeInventoryById.work.path).toBe("/work/");
		expect(routeInventoryById.about.path).toBe("/about/");
		expect(routeInventory.map((route) => route.id)).not.toEqual(
			expect.arrayContaining([
				"projects",
				"project-detail",
				"case-studies",
				"case-study-detail",
			]),
		);
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
		expect(profile.knowsAbout).toEqual([
			"Flight simulation",
			"Aerospace simulation",
			"Controls software",
			"Telemetry systems",
			"Rust",
			"C++",
			"Hardware-in-the-loop testing",
			"Injection molding",
			"Conformal cooling",
			"Metal additive manufacturing",
			"Distributed systems",
			"Operational software",
		]);
		expect(Object.values(profile).join(" ")).not.toMatch(/systems atelier/i);
	});

	it("describes Home and Work with the exact simulation and manufacturing scope", () => {
		expect(routeInventoryById.home.seo.description).toBe(
			"Principal software engineer for flight simulation, controls, telemetry, and operational systems in Rust and C++.",
		);
		expect(routeInventoryById.work.seo.description).toBe(
			"Evidence-backed work across flight simulation, engineering simulation, manufacturing software, and operational systems.",
		);
	});
});
