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
		expect(scaffold.heroTitle).toBe("Systems built to hold up.");
		expect(scaffold.primaryNav.map((item) => item.href)).toEqual([
			"/",
			"/projects/",
			"/now/",
			"/uses/",
			"/reading/",
			"/resume/",
			"/contact/",
		]);
		expect(scaffold.ctas.map((cta) => cta.href)).toEqual([
			"/resume/",
			"/projects/",
			"/contact/",
		]);
		expect(scaffold.telemetry.map((item) => item.label)).toEqual([
			"Build",
			"Verification",
			"Accessibility",
			"Resilience",
		]);
		expect(scaffold.telemetry[0]).toMatchObject({
			value: "Fast by default",
		});
		expect(scaffold.telemetry[3]).toMatchObject({
			value: "Failure aware",
		});
		expect(scaffold.noJsNote).toContain("evidence used to verify delivery");
		expect(scaffold.audienceOrder).toEqual([
			"recruiter",
			"senior-engineer",
			"collaborator",
		]);
		expect(scaffold.supportStatements).toHaveLength(4);
		const supportCopy = scaffold.supportStatements.join(" ").toLowerCase();
		expect(supportCopy).toContain("automation with explicit evidence");
		expect(supportCopy).toContain("ai-assisted systems");
		expect(supportCopy).toContain("distributed services");
	});

	it("keeps public home copy polished instead of scaffold or future-promise language", () => {
		const scaffold = homeScaffold();
		const publicCopy = [
			scaffold.kicker,
			scaffold.heroTitle,
			scaffold.intro,
			scaffold.noJsNote,
			...scaffold.supportStatements,
			...scaffold.telemetry.flatMap((item) => [
				item.label,
				item.value,
				item.detail,
			]),
		].join(" ");

		expect(publicCopy).not.toMatch(
			/\b(scaffold|placeholder)\b|will enhance|later without replacing/i,
		);
	});
});
