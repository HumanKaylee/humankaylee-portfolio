import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	backlog: "docs/BACKLOG.md",
	checklist: "runbooks/FINAL_LAUNCH_CHECKLIST.md",
	evidence: "runbooks/LAUNCH_EVIDENCE.md",
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

function embeddedPrHead(evidence) {
	const match = evidence.match(/Embedded verified PR head: `([a-f0-9]{40})`/);
	assert.ok(match, "expected launch evidence to include embedded PR head");
	return match[1];
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

test("B-063 final launch checklist preserves blocker honesty", () => {
	const backlog = readRequiredFile(files.backlog);
	const checklist = readRequiredFile(files.checklist);
	const evidence = readRequiredFile(files.evidence);
	const embeddedHead = embeddedPrHead(evidence);

	expectAll(backlog, [
		"### B-063: Complete launch checklist",
		"runbooks/FINAL_LAUNCH_CHECKLIST.md",
		"scripts/final-launch-checklist-contract.test.mjs",
	]);

	expectAll(checklist, [
		"# Final Launch Checklist",
		"Status: not launch-ready",
		`Head: embedded verified PR head \`${embeddedHead}\``,
		"B-063",
		"Do not mark launch-ready",
		"## Embedded PR Evidence Snapshot",
		"Snapshot checks at the time of this checklist update:",
		"Home is live",
		"Projects are live",
		"At least four case studies are live and redacted",
		"Resume route and PDF production smoke evidence exists",
		"Notes/build-log is live",
		"Contact path works",
		"Rust API health is live",
		"CI is green",
		"Lighthouse targets pass or exceptions are documented",
		"Deployment and rollback docs are complete",
		"Current approved launch case studies: 0",
		"Blocked / not run",
		"Production frontend smoke",
		"Production API smoke",
		"Production Lighthouse",
		"Contact production handling",
		"Rollback evidence",
		"Final frontend domain",
		"Final API domain",
		"provider projects",
		"redaction approvals",
		"runbooks/LAUNCH_EVIDENCE.md",
		"runbooks/CONTENT_REDACTION_STATUS.md",
		"docs/OPERATIONS.md",
	]);

	for (const requirement of [
		"Home is live",
		"Projects are live",
		"At least four case studies are live and redacted",
		"Resume route and PDF production smoke evidence exists",
		"Notes/build-log is live",
		"Contact path works",
		"Rust API health is live",
	]) {
		expectTableRow(checklist, requirement, ["Blocked / not run"]);
	}

	expectTableRow(checklist, "CI is green", ["Pass for PR only"]);
	expectTableRow(
		checklist,
		"Lighthouse targets pass or exceptions are documented",
		["Pass locally only"],
	);
	expectTableRow(checklist, "Deployment and rollback docs are complete", [
		"Pass for docs only",
		"docs/OPERATIONS.md",
	]);

	for (const evidenceRow of [
		"Production frontend smoke",
		"Production API smoke",
		"Production Lighthouse",
		"Contact production handling",
		"Rollback evidence",
	]) {
		expectTableRow(evidence, evidenceRow, ["Blocked / not run"]);
	}

	expectAll(evidence, [
		"Status: not launch-ready",
		"Production frontend smoke",
		"Production API smoke",
		"Production Lighthouse",
		"Contact production handling",
		"Rollback evidence",
		"Blocked / not run",
	]);

	expectNotContains(checklist, "Status: launch-ready", "launch-ready status");
	expectNotContains(checklist, "Head: 77b228b", "stale head SHA");
	expectNotContains(
		checklist,
		"## Current PR Evidence",
		"stale-prone current PR evidence heading",
	);
	expectNotContains(
		checklist,
		"Current checks at the time",
		"stale-prone current PR checks wording",
	);
	expectNotContains(
		checklist,
		"Resume HTML and PDF are live",
		"resume production-state overclaim",
	);
	expectNotContains(
		checklist,
		"https://<production",
		"placeholder production URL",
	);
	expectNotContains(
		checklist,
		"https://www.example.com",
		"example frontend URL",
	);
	expectNotContains(checklist, "https://api.example.com", "example API URL");
});
