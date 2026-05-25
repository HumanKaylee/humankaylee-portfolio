import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	changelog: "docs/CHANGELOG.md",
	evidence: "runbooks/LAUNCH_EVIDENCE.md",
	operations: "docs/OPERATIONS.md",
	packet: "runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md",
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

function markdownRows(content) {
	return content
		.split("\n")
		.filter((line) => line.trim().startsWith("|"))
		.map((line) => splitMarkdownTableLine(line.trim()))
		.filter((cells) => !cells.every((cell) => /^-+$/.test(cell)));
}

function splitMarkdownTableLine(line) {
	const trimmed = line.replace(/^\|/, "").replace(/\|$/, "");
	const cells = [];
	let cell = "";
	let escaped = false;

	for (const char of trimmed) {
		if (escaped) {
			cell += char === "|" ? "\\|" : `\\${char}`;
			escaped = false;
			continue;
		}

		if (char === "\\") {
			escaped = true;
			continue;
		}

		if (char === "|") {
			cells.push(cell.trim());
			cell = "";
			continue;
		}

		cell += char;
	}

	if (escaped) cell += "\\";
	cells.push(cell.trim());
	return cells;
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

function sectionBetween(content, startHeading, endHeading) {
	const start = content.indexOf(startHeading);
	assert.ok(start >= 0, `expected section ${startHeading}`);
	const end = content.indexOf(endHeading, start + startHeading.length);
	assert.ok(end >= 0, `expected following section ${endHeading}`);
	return content.slice(start, end);
}

function expectCurrentEvidenceMatrixPrivacyRules(evidence) {
	const matrix = sectionBetween(
		evidence,
		"## Current Evidence Matrix",
		"## Production Blockers",
	);
	const rows = markdownRows(matrix);
	assert.ok(rows.length > 1, "expected current evidence matrix rows");
	assert.doesNotMatch(
		matrix,
		/\/home\/joe\//,
		"current evidence matrix must not expose absolute local home paths",
	);

	const header = rows[0];
	const privacyIndex = header.indexOf("Privacy Redaction Rule");
	assert.notEqual(
		privacyIndex,
		-1,
		"expected Current Evidence Matrix to include Privacy Redaction Rule column",
	);

	for (const row of rows.slice(1)) {
		assert.equal(
			row.length,
			header.length,
			`expected ${row[0]} row to match current evidence matrix column count`,
		);
		assert.ok(
			row[privacyIndex] && !/^(tbd|n\/a|-)?$/i.test(row[privacyIndex]),
			`expected ${row[0]} row to include a privacy redaction rule`,
		);
	}

	expectTableRow(matrix, "Production frontend smoke", [
		"Blocked / not run",
		"No target URL exists yet; future evidence must redact provider account IDs, private logs, secrets, and tokens before capture.",
	]);
	expectTableRow(matrix, "Production API smoke", [
		"Blocked / not run",
		"No API origin or response body exists yet; future evidence must redact provider account IDs, private logs, secrets, tokens, and contact payloads before capture.",
	]);
	expectTableRow(matrix, "Content redaction", [
		"Blocked:",
		"Approval summaries only; do not copy raw artifacts, private paths, private hostnames, raw logs, or reviewer-private notes.",
	]);
}

test("Phase 7 launch evidence schema stays provider-neutral and public-safe", () => {
	const changelog = readRequiredFile(files.changelog);
	const evidence = readRequiredFile(files.evidence);
	const operations = readRequiredFile(files.operations);
	const packet = readRequiredFile(files.packet);

	expectCurrentEvidenceMatrixPrivacyRules(evidence);

	expectContains(evidence, "## Future Evidence Capture Contract");
	expectContains(evidence, "Exact command.");
	expectContains(
		evidence,
		"Target, including the real production URL, origin, or local preview target when applicable.",
	);
	expectContains(evidence, "ISO-8601 date/time.");
	expectContains(
		evidence,
		"Result / Status with exit status or HTTP status.",
		"result/status field with exit status or HTTP status",
	);
	expectContains(
		evidence,
		"Artifact path, PR check URL, deployment ID, report path, rollback target, or response capture.",
	);
	expectContains(
		evidence,
		"Blocker or next action if the row is not pass evidence.",
	);
	expectContains(evidence, "Privacy redaction rule.");
	expectTableRow(evidence, "Result / Status", [
		"Exit status for local commands or HTTP status for request-based checks.",
	]);
	expectTableRow(
		evidence,
		"Artifact / Link / Deployment ID / Rollback Target",
		["Public-safe pointer", "deployment identifier", "rollback target"],
	);
	expectTableRow(evidence, "Privacy Redaction Rule", [
		"The redaction rule applied before the row was copied here.",
	]);

	expectContains(packet, "## Provider-Neutral Evidence Mapping");
	expectContains(packet, "Frontend evidence");
	expectContains(packet, "API evidence");
	expectContains(packet, "Domain evidence");
	expectContains(packet, "Rollback evidence");
	expectContains(
		packet,
		"Do not select providers, replace placeholders, run provider commands, or clear blocked rows.",
	);
	expectTableRow(packet, "Frontend evidence", [
		"target URL or local target",
		"deployment ID/rollback target",
		"Provider project",
		"production deploy URL",
	]);
	expectTableRow(packet, "API evidence", [
		"public API origin or local target",
		"result/status with exit status or HTTP status",
		"API host selection",
		"contact handling decision",
	]);
	expectTableRow(packet, "Rollback evidence", [
		"deployment ID or rollback target",
		"privacy redaction rule",
		"Real deployment IDs",
		"rollback verification output",
	]);

	expectContains(operations, "### 4.4 Public-Safe Evidence Handling");
	expectContains(operations, "public-safe evidence");
	expectContains(operations, "provider account IDs");
	expectContains(operations, "private paths");
	expectContains(operations, "logs");
	expectContains(operations, "secrets");
	expectContains(
		operations,
		"Redact provider account IDs, private paths, logs, secrets, tokens, and other sensitive identifiers before copying evidence into runbooks, public docs, or changelog entries.",
	);
	expectContains(
		changelog,
		"Hardened the Phase 7 launch evidence schema and packet mapping",
	);
});
