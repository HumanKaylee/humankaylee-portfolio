import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

function readRequiredFile(path) {
	assert.ok(existsSync(path), `missing required file: ${path}`);
	const content = readFileSync(path, "utf8");
	assert.ok(content.trim().length > 0, `empty required file: ${path}`);
	return content;
}

test("evidence drawer does not conflate redaction approval with launch approval", () => {
	const source = readRequiredFile(
		"apps/web/src/components/EvidenceDrawer.astro",
	);

	assert.ok(
		source.includes("Launch approval pending"),
		"drawer should keep launch approval pending copy explicit",
	);
	assert.ok(
		!source.includes("Launch approved"),
		"drawer must not claim launch approval from case-study redaction state",
	);
});
