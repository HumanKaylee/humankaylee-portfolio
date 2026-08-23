import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const operationsPath = "docs/OPERATIONS.md";

function readRequiredFile(path) {
	assert.ok(existsSync(path), `missing required file: ${path}`);

	const content = readFileSync(path, "utf8");
	assert.ok(content.trim().length > 0, `empty required file: ${path}`);
	return content;
}

function normalize(content) {
	return content.replace(/\s+/g, " ");
}

function section(content, heading) {
	const lines = content.split("\n");
	const startIndex = lines.findIndex((line) => line === `## ${heading}`);

	assert.notEqual(
		startIndex,
		-1,
		`expected operations doc to include section: ${heading}`,
	);

	const nextHeadingIndex = lines.findIndex(
		(line, index) => index > startIndex && line.startsWith("## "),
	);
	const endIndex = nextHeadingIndex === -1 ? lines.length : nextHeadingIndex;

	return lines.slice(startIndex, endIndex).join("\n");
}

function expectContains(content, needle, label = needle) {
	assert.ok(
		normalize(content).includes(normalize(needle)),
		`expected content to include ${label}`,
	);
}

function expectNotContains(content, needle, label = needle) {
	assert.ok(
		!normalize(content).includes(normalize(needle)),
		`expected content not to include ${label}`,
	);
}

test("deployment summary keeps provider commands reference-only until launch evidence exists", () => {
	const operations = readRequiredFile(operationsPath);
	const deploymentSummary = section(operations, "7. Deployment Runbook");

	expectContains(
		deploymentSummary,
		"`runbooks/DEPLOYMENT.md` as the provider-neutral deployment and rollback reference",
		"provider-neutral deployment reference",
	);
	expectContains(
		deploymentSummary,
		"Provider-specific commands, migration procedures, and rollback steps stay deferred until provider/domain decisions and required external evidence exist.",
		"provider command deferral boundary",
	);
	expectContains(
		deploymentSummary,
		"Do not treat this section as launch-ready while provider, domain, contact storage, or rollback evidence is still blocked or not run.",
		"launch-ready blocker boundary",
	);
	expectNotContains(
		deploymentSummary,
		"exact Phase 8 deployment command source",
		"Phase 8 command authorization wording",
	);
});

test("minimum viable production standard is bounded by launch blockers and evidence", () => {
	const operations = readRequiredFile(operationsPath);
	const standard = section(
		operations,
		"19. Minimum Viable Production Standard",
	);

	expectContains(
		standard,
		"minimum operator-readiness standard, not launch approval",
		"operator readiness boundary",
	);
	expectContains(
		standard,
		"`runbooks/LAUNCH_BLOCKERS_REGISTER.md`",
		"launch blockers register source",
	);
	expectContains(
		standard,
		"`runbooks/LAUNCH_EVIDENCE.md`",
		"launch evidence source",
	);
	expectContains(
		standard,
		"Unresolved blocker-register rows and blocked evidence rows stay blocked until direct production evidence replaces them.",
		"blocked rows remain blocked",
	);
});

test("minimum viable production standard keeps static fallback and independent rollback requirements", () => {
	const operations = readRequiredFile(operationsPath);
	const standard = section(
		operations,
		"19. Minimum Viable Production Standard",
	);

	for (const requiredBoundary of [
		"Roll back frontend and backend independently.",
		"Confirm static content still works when the API is unavailable.",
		"Verify production health using documented smoke checks.",
		"the smoke evidence is captured from those public URLs",
	]) {
		expectContains(standard, requiredBoundary);
	}
});

test("minimum viable production standard does not claim route metadata or issue closure", () => {
	const operations = readRequiredFile(operationsPath);
	const standard = section(
		operations,
		"19. Minimum Viable Production Standard",
	);

	for (const { pattern, label } of [
		{
			label: "route metadata closure",
			pattern:
				/\b(?:route|metadata|seo|open graph|canonical|social preview)\b[\s\S]{0,80}\b(?:complete|done|ready|launch(?:ed|able)?|close[sd]?|resolve[sd]?)\b/i,
		},
		{
			label: "issue closure",
			pattern:
				/\b(?:close[sd]?|resolve[sd]?|clear[sed]?)\b[\s\S]{0,80}#(?:63|65)\b/i,
		},
		{
			label: "launch-ready shorthand",
			pattern: /\blaunch[- ]ready\b/i,
		},
	]) {
		assert.doesNotMatch(
			standard,
			pattern,
			`minimum production standard should not include ${label}`,
		);
	}
});
