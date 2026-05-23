import { describe, expect, it } from "vitest";

import { homeScaffold } from "./home-scaffold";

describe("homeScaffold", () => {
	it("describes the scaffold-stage portfolio honestly", () => {
		const scaffold = homeScaffold();

		expect(scaffold.kicker).toContain("scaffold");
		expect(scaffold.heroTitle).toContain("HumanKaylee");
		expect(scaffold.note).toContain("not the launch version");
		expect(scaffold.noJsNote).toContain("No JavaScript required");
		expect(scaffold.primaryCta.href).toBe("#projects");
		expect(scaffold.secondaryCta.href).toBe("#contact");
	});
});
