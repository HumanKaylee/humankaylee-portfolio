import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	changelog: "docs/CHANGELOG.md",
	cliFleet:
		"apps/web/src/content/case-studies/cli-fleet-synchronization-and-mcp-rollout.md",
	contentContract: "apps/web/src/lib/contracts/content.ts",
	decision: "runbooks/PUBLICATION_SAFETY_DECISIONS.md",
	githubSync: "docs/GITHUB_SYNC.md",
	kalshi:
		"apps/web/src/content/case-studies/kalshi-migration-or-analytics-tooling.md",
	packet: "runbooks/CASE_STUDY_REDACTION_APPROVAL_PACKETS.md",
	remoteRecovery:
		"apps/web/src/content/case-studies/remote-workstation-recovery-and-operational-debugging.md",
	status: "runbooks/CONTENT_REDACTION_STATUS.md",
	youtube: "apps/web/src/content/case-studies/youtube-ai-video-pipeline.md",
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

function expectTableRowCells(content, firstCell, expectedCellsByColumn) {
	const rows = markdownRows(content).filter((cells) => cells[0] === firstCell);
	assert.ok(rows.length > 0, `expected table row for ${firstCell}`);

	const row = rows.find((candidate) =>
		Object.entries(expectedCellsByColumn).every(
			([columnIndex, expectedCells]) => {
				const cell = candidate[Number(columnIndex)];
				return expectedCells.every((expectedCell) =>
					normalize(cell ?? "").includes(normalize(expectedCell)),
				);
			},
		),
	);

	assert.ok(
		row,
		`expected ${firstCell} row to include ${JSON.stringify(
			expectedCellsByColumn,
		)}`,
	);
}

function expectFrontmatterLine(content, key, value, label) {
	const pattern = new RegExp(`^\\s{2}${key}:\\s*["']?${value}["']?\\s*$`, "m");
	assert.match(
		content,
		pattern,
		`expected ${label} to include ${key}: ${value}`,
	);
}

function expectIssueTrace(content, expected, label) {
	expectContains(content, "issueTrace:", `${label} issueTrace block`);
	expectFrontmatterLine(content, "backlogId", expected.backlogId, label);
	expectFrontmatterLine(
		content,
		"githubIssue",
		String(expected.githubIssue),
		label,
	);
	expectFrontmatterLine(
		content,
		"parentIssue",
		String(expected.parentIssue),
		label,
	);
	expectFrontmatterLine(content, "closureRule", expected.closureRule, label);
}

test("content issue traceability ties open content issues to approval blockers without approving publication", () => {
	const changelog = readRequiredFile(files.changelog);
	const cliFleet = readRequiredFile(files.cliFleet);
	const contentContract = readRequiredFile(files.contentContract);
	const decision = readRequiredFile(files.decision);
	const githubSync = readRequiredFile(files.githubSync);
	const kalshi = readRequiredFile(files.kalshi);
	const packet = readRequiredFile(files.packet);
	const remoteRecovery = readRequiredFile(files.remoteRecovery);
	const status = readRequiredFile(files.status);
	const youtube = readRequiredFile(files.youtube);

	expectContains(contentContract, "issueTraceSchema");
	expectContains(contentContract, "issueTrace: issueTraceSchema.optional()");
	expectIssueTrace(
		cliFleet,
		{
			backlogId: "B-014",
			closureRule:
				"Keep #20 open until open items, artifact inspection, and human signoff are complete.",
			githubIssue: 20,
			parentIssue: 3,
		},
		"CLI Fleet Synchronization and MCP Rollout",
	);
	expectIssueTrace(
		remoteRecovery,
		{
			backlogId: "B-015",
			closureRule:
				"Keep #21 open until open items, artifact inspection, and human signoff are complete.",
			githubIssue: 21,
			parentIssue: 3,
		},
		"Remote Workstation Recovery and Operational Debugging",
	);
	expectIssueTrace(
		kalshi,
		{
			backlogId: "B-018",
			closureRule:
				"Keep #24 open until HumanKaylee records a publication decision and any synthetic proof pack passes review.",
			githubIssue: 24,
			parentIssue: 3,
		},
		"Kalshi Migration or Analytics Tooling",
	);
	expectIssueTrace(
		youtube,
		{
			backlogId: "B-019",
			closureRule:
				"Keep #25 open until HumanKaylee records a publication decision and any synthetic proof pack passes review.",
			githubIssue: 25,
			parentIssue: 3,
		},
		"YouTube AI Video Pipeline",
	);

	expectContains(status, "## GitHub Issue Traceability");
	expectContains(
		status,
		"Traceability rows are approval aids only; they do not close issues, approve publication, or change launch eligibility.",
	);

	expectTableRowCells(status, "CLI Fleet Synchronization and MCP Rollout", {
		1: ["B-014 / #20"],
		2: ["`publish` / `reviewed`"],
		3: ["openItems clearance", "artifact inspection", "human signoff"],
		4: ["Keep #20 open"],
	});
	expectTableRowCells(
		status,
		"Remote Workstation Recovery and Operational Debugging",
		{
			1: ["B-015 / #21"],
			2: ["`publish` / `reviewed`"],
			3: ["openItems clearance", "artifact inspection", "human signoff"],
			4: ["Keep #21 open"],
		},
	);
	expectTableRowCells(status, "Kalshi Migration or Analytics Tooling", {
		1: ["B-018 / #24"],
		2: ["`defer` / `blocked`"],
		3: ["HumanKaylee decision", "synthetic proof pack"],
		4: ["Keep #24 open"],
	});
	expectTableRowCells(status, "YouTube AI Video Pipeline", {
		1: ["B-019 / #25"],
		2: ["`needs-redaction` / `blocked`"],
		3: ["HumanKaylee decision", "synthetic proof pack"],
		4: ["Keep #25 open"],
	});

	expectContains(
		packet,
		"#20 and #21 remain open until open items, artifact inspection, and human signoff are complete.",
	);
	expectContains(
		decision,
		"#24 and #25 remain open until HumanKaylee records a publication decision and any synthetic proof pack passes review.",
	);
	expectContains(
		githubSync,
		"Content issue traceability status: approval-blocker mapping only; #20, #21, #24, and #25 remain open.",
	);
	expectContains(
		changelog,
		"Added content issue traceability coverage for #20, #21, #24, and #25",
	);

	for (const content of [decision, githubSync, packet, status]) {
		expectNotContains(content, "Status: publication approved");
		expectNotContains(content, "launch-ready");
		expectNotContains(content, "Traceability approves publication");
	}
});
