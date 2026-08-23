import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const privacySource = readFileSync(
	new URL("./privacy/index.astro", import.meta.url),
	"utf8",
).replace(/\s+/g, " ");

describe("legal page factual contracts", () => {
	it("describes the active Cloudflare services without categorical no-collection claims", () => {
		expect(privacySource).toContain("Cloudflare Web Analytics");
		expect(privacySource).toContain("cookie-free performance beacon");
		expect(privacySource).toContain("email-obfuscation script");

		for (const contradictedClaim of [
			"this website collects nothing about you",
			"sends no data about your visit anywhere",
			"There is no analytics",
			"it does not track anything",
		]) {
			expect(privacySource.toLowerCase()).not.toContain(
				contradictedClaim.toLowerCase(),
			);
		}
	});

	it("states the provider-granted Google capabilities and avoids unsupported promises", () => {
		expect(privacySource).toContain("compose and send messages");
		expect(privacySource).toContain("restore messages from Trash");
		expect(privacySource).toContain(
			"share and permanently delete calendars",
		);
		expect(privacySource).toContain(
			"immediate permanent deletion that bypasses Trash",
		);

		for (const unsupportedClaim of [
			"cannot send mail as him",
			"readable only by his own account",
			"not used to train, fine-tune, or improve any machine learning or AI model",
			"deleted on request",
			"cached copies are overwritten as they refresh",
		]) {
			expect(privacySource.toLowerCase()).not.toContain(
				unsupportedClaim.toLowerCase(),
			);
		}
	});
});
