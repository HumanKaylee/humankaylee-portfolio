import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	staticShell: "tests/e2e/static-shell.spec.ts",
	visualSurfaces: "tests/e2e/visual-surfaces.spec.ts",
	quality: "runbooks/QUALITY.md",
	changelog: "docs/CHANGELOG.md",
};

function readRequiredFile(path) {
	assert.ok(existsSync(path), `missing required file: ${path}`);

	const content = readFileSync(path, "utf8");
	assert.ok(content.trim().length > 0, `empty required file: ${path}`);
	return content;
}

function expectContains(content, needle, label = needle) {
	assert.ok(
		content.replace(/\s+/g, " ").includes(needle.replace(/\s+/g, " ")),
		`expected ${label}`,
	);
}

function expectNotMatches(content, pattern, label) {
	assert.doesNotMatch(content, pattern, `expected no ${label}`);
}

test("notes surfaces are covered by static-shell and visual-surface QA without production overclaims", () => {
	const staticShell = readRequiredFile(files.staticShell);
	const visualSurfaces = readRequiredFile(files.visualSurfaces);
	const quality = readRequiredFile(files.quality);
	const changelog = readRequiredFile(files.changelog);
	const notesOverclaimPattern =
		/notes\/build-log[^.\n]*(?:production-ready|launch-ready|ready for launch|production evidence|launch evidence|is live)/i;

	for (const spec of [staticShell, visualSurfaces]) {
		expectContains(spec, '"/notes/"', "notes index route coverage");
	}

	expectContains(
		staticShell,
		'"/notes/wasm-black-scholes-options-pricer/"',
		"public notes detail route coverage",
	);
	expectContains(
		staticShell,
		"European options",
		"note detail static-shell marker",
	);
	expectContains(visualSurfaces, "releaseRoutes", "notes visual route matrix");
	expectContains(
		quality,
		'`pnpm test:e2e -- --grep "@static-shell|@visual-surfaces"` verifies core static shell and art-directed surface coverage, including notes/build-log index and detail routes, as local QA evidence only.',
		"quality runbook notes QA boundary",
	);
	expectContains(
		changelog,
		"Expanded notes/build-log local QA parity across `@static-shell` and `@visual-surfaces` without changing production launch status.",
		"changelog notes QA boundary",
	);

	for (const [label, content] of [
		["quality runbook", quality],
		["changelog", changelog],
	]) {
		expectNotMatches(
			content,
			notesOverclaimPattern,
			`${label} notes production overclaim`,
		);
	}
});
