import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const qualityPath = "runbooks/QUALITY.md";

function readRequiredFile(path) {
	assert.ok(existsSync(path), `missing required file: ${path}`);

	const content = readFileSync(path, "utf8");
	assert.ok(content.trim().length > 0, `empty required file: ${path}`);
	return content;
}

function expectContains(content, needle, label = needle) {
	assert.ok(
		content.includes(needle),
		`expected quality runbook to include ${label}`,
	);
}

test("quality runbook keeps launch-gate wording phase-neutral and artifact-backed", () => {
	const quality = readRequiredFile(qualityPath);

	expectContains(
		quality,
		"Launch quality gates are enforced locally and in CI.",
	);
	expectContains(quality, "test-results/lighthouse-summary.json");
	expectContains(quality, "test-results/bundle-budget-summary.json");

	assert.ok(
		!quality.includes("Phase 7 launch gates"),
		"quality runbook should not pin current quality gates to stale phase wording",
	);
});
