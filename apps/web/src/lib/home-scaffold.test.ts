import { describe, expect, it } from "vitest";

import { homeScaffold } from "./home-scaffold";

describe("homeScaffold", () => {
	it("describes the Phase 2 static shell and Systems Atelier direction", () => {
		const scaffold = homeScaffold();

		expect(scaffold.visualDirection).toBe("The Systems Atelier");
		expect(scaffold.palette).toEqual([
			"warm off-black",
			"paper cream",
			"tungsten amber",
			"signal green",
			"oxidized blue",
		]);
		expect(scaffold.heroTitle).toContain("practical AI-assisted systems");
		expect(scaffold.primaryNav.map((item) => item.href)).toEqual([
			"/",
			"/projects/",
			"/resume/",
			"/contact/",
		]);
		expect(scaffold.ctas.map((cta) => cta.href)).toEqual([
			"/resume/",
			"/projects/",
			"/contact/",
		]);
		expect(scaffold.telemetry.some((item) => item.label === "Rendering")).toBe(
			true,
		);
		expect(scaffold.noJsNote).toContain("without JavaScript or WebGL");
	});
});
