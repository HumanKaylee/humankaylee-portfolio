import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	backlog: "docs/BACKLOG.md",
	changelog: "docs/CHANGELOG.md",
	contentStrategy: "docs/CONTENT_STRATEGY.md",
	decision: "runbooks/PUBLICATION_SAFETY_DECISIONS.md",
	status: "runbooks/CONTENT_REDACTION_STATUS.md",
};

function readRequiredFile(path) {
	assert.ok(existsSync(path), `missing required file: ${path}`);

	const content = readFileSync(path, "utf8");
	assert.ok(content.trim().length > 0, `empty required file: ${path}`);
	return content;
}

function normalize(content) {
	return content.replace(/\s+/g, " ");
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

function expectAll(content, needles) {
	for (const needle of needles) {
		expectContains(content, needle);
	}
}

function markdownRows(content) {
	return content
		.split("\n")
		.filter((line) => line.trim().startsWith("|"))
		.map((line) =>
			line
				.trim()
				.slice(1, -1)
				.split("|")
				.map((cell) => cell.trim()),
		)
		.filter((cells) => !cells.every((cell) => /^-+$/.test(cell)));
}

function expectTableRow(content, firstCell, expectedCells) {
	const row = markdownRows(content).find((cells) => cells[0] === firstCell);
	assert.ok(row, `expected table row for ${firstCell}`);

	for (const expectedCell of expectedCells) {
		assert.ok(
			row.some((cell) => normalize(cell).includes(normalize(expectedCell))),
			`expected ${firstCell} row to include ${expectedCell}`,
		);
	}
}

test("B-018 and B-019 publication safety decisions are recorded without publishing blocked candidates", () => {
	const backlog = readRequiredFile(files.backlog);
	const changelog = readRequiredFile(files.changelog);
	const contentStrategy = readRequiredFile(files.contentStrategy);
	const decision = readRequiredFile(files.decision);
	const status = readRequiredFile(files.status);

	expectAll(backlog, [
		"### B-018: Evaluate Kalshi or analytics tooling publication safety",
		"### B-019: Evaluate YouTube AI video pipeline publication safety",
		"runbooks/PUBLICATION_SAFETY_DECISIONS.md",
		"scripts/publication-safety-decisions-contract.test.mjs",
	]);

	expectAll(decision, [
		"# Publication Safety Decisions",
		"Status: decision-support record only; not publication approval",
		"Scope: B-018 and B-019",
		"docs/CONTENT_REDACTION_GUIDE.md",
		"runbooks/CONTENT_REDACTION_STATUS.md",
		"apps/web/src/content/case-studies/kalshi-migration-or-analytics-tooling.md",
		"apps/web/src/content/case-studies/youtube-ai-video-pipeline.md",
		"User decision status",
		"Owner",
		"Recommendation",
		"Public-safe follow-up",
		"Safer replacement candidate",
	]);

	expectTableRow(decision, "Kalshi Migration or Analytics Tooling", [
		"B-018",
		"financial",
		"account-linked",
		"exclude from v1",
		"Creative Web Systems Atlas Demo",
		"HumanKaylee decision pending",
	]);
	expectTableRow(decision, "YouTube AI Video Pipeline", [
		"B-019",
		"private channel",
		"account identifiers",
		"exclude from v1",
		"defer until synthetic proof pack exists",
		"HumanKaylee decision pending",
	]);

	expectAll(status, [
		"Kalshi Migration or Analytics Tooling",
		"`defer`",
		"YouTube AI Video Pipeline",
		"`needs-redaction`",
		"runbooks/PUBLICATION_SAFETY_DECISIONS.md",
	]);

	expectAll(contentStrategy, [
		"runbooks/PUBLICATION_SAFETY_DECISIONS.md",
		"decision-support record only",
	]);
	expectAll(changelog, ["Publication Safety Decisions", "B-018", "B-019"]);

	expectNotContains(decision, "Status: publication approved");
	expectNotContains(decision, "redactionStatus: approved");
	expectNotContains(decision, "launch-ready");
});
