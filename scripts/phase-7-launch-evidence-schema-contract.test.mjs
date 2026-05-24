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

test("Phase 7 launch evidence schema stays provider-neutral and public-safe", () => {
	const changelog = readRequiredFile(files.changelog);
	const evidence = readRequiredFile(files.evidence);
	const operations = readRequiredFile(files.operations);
	const packet = readRequiredFile(files.packet);

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
