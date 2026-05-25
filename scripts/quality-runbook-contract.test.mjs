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
		content.replace(/\s+/g, " ").includes(needle.replace(/\s+/g, " ")),
		`expected quality runbook to include ${label}`,
	);
}

test("quality runbook keeps launch-gate wording phase-neutral and artifact-backed", () => {
	const quality = readRequiredFile(qualityPath);

	expectContains(
		quality,
		"Automated launch quality gates are enforced locally and in CI.",
	);
	expectContains(
		quality,
		"Manual privacy review is a separate launch blocker check and cannot be fully enforced by CI.",
		"manual privacy review CI boundary",
	);
	expectContains(
		quality,
		"Phase 0 CI keeps `@keyboard`, `@accessibility`, `@security`, `@api-down`, `@api-telemetry`, and `@journey` as dedicated Playwright gates before the umbrella E2E sweep so stubbed API telemetry and journey failures remain easy to identify.",
		"dedicated Phase 0 CI API telemetry and journey gates",
	);
	expectContains(
		quality,
		"These focused gates intentionally duplicate part of the later umbrella sweep to keep CI failures diagnosable.",
		"focused gate duplicate-coverage tradeoff",
	);
	expectContains(
		quality,
		'`pnpm test:e2e -- --grep "@api-telemetry"` verifies the frontend telemetry enhancement path with stubbed API responses while preserving the static fallback boundary.',
		"API telemetry local gate",
	);
	expectContains(
		quality,
		'`pnpm test:e2e -- --grep "@journey"` verifies recruiter, engineer, and contact evaluator journeys across the existing static launch paths.',
		"journey smoke local gate",
	);
	expectContains(quality, "test-results/lighthouse-summary.json");
	expectContains(quality, "test-results/bundle-budget-summary.json");

	assert.ok(
		!quality.includes("Phase 7 launch gates"),
		"quality runbook should not pin current quality gates to stale phase wording",
	);
	assert.ok(
		!quality.includes(
			"All launch quality gates are enforced locally and in CI.",
		),
		"quality runbook should not imply manual privacy review is fully CI-enforced",
	);
});
