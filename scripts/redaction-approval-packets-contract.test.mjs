import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";

const files = {
	backlog: "docs/BACKLOG.md",
	caseStudiesDir: "apps/web/src/content/case-studies",
	cliFleetCaseStudy:
		"apps/web/src/content/case-studies/cli-fleet-synchronization-and-mcp-rollout.md",
	contentContract: "apps/web/src/lib/contracts/content.ts",
	finalChecklist: "runbooks/FINAL_LAUNCH_CHECKLIST.md",
	guide: "docs/CONTENT_REDACTION_GUIDE.md",
	githubSync: "docs/GITHUB_SYNC.md",
	packet: "runbooks/CASE_STUDY_REDACTION_APPROVAL_PACKETS.md",
	remoteRecoveryCaseStudy:
		"apps/web/src/content/case-studies/remote-workstation-recovery-and-operational-debugging.md",
	status: "runbooks/CONTENT_REDACTION_STATUS.md",
};

const checklistMappings = [
	[
		"Secrets removed",
		["redactionReview.checklist.secretsRemoved"],
		["secretsRemoved"],
	],
	[
		"Hostnames and access paths generalized",
		["redactionReview.checklist.hostnamesAndAccessPathsGeneralized"],
		["hostnamesAndAccessPathsGeneralized"],
	],
	[
		"Usernames and account names generalized or intentionally public",
		["redactionReview.checklist.userAndAccountNamesGeneralized"],
		["userAndAccountNamesGeneralized"],
	],
	[
		"Screenshots inspected at full resolution",
		["redactionReview.checklist.screenshotsInspected"],
		["screenshotsInspected"],
	],
	[
		"Logs summarized or sanitized",
		["redactionReview.checklist.logsSummarizedOrSanitized"],
		["logsSummarizedOrSanitized"],
	],
	[
		"Repo/demo links are public and intentional",
		["redactionReview.checklist.publicLinksVerified"],
		["publicLinksVerified"],
	],
	[
		"Claims have safe supporting evidence",
		["redactionReview.checklist.claimsHaveSafeEvidence"],
		["claimsHaveSafeEvidence"],
	],
	[
		"Security-sensitive procedures removed or generalized",
		["redactionReview.checklist.securitySensitiveProceduresRemoved"],
		["securitySensitiveProceduresRemoved"],
	],
	[
		"Redaction reviewer recorded",
		["redactionReview.reviewer", "redactionReview.reviewedOn"],
		["reviewer", "reviewedOn"],
	],
	["Redaction status", ["redactionStatus"], ["redactionStatus"]],
];

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

function frontmatterValue(content, key, filePath) {
	const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);
	assert.ok(frontmatter, `missing frontmatter: ${filePath}`);

	const value = frontmatter[1].match(
		new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, "m"),
	);
	assert.ok(value, `missing ${key} in frontmatter: ${filePath}`);
	return value[1];
}

function readCaseStudies() {
	assert.ok(existsSync(files.caseStudiesDir), "missing case-study content dir");

	return readdirSync(files.caseStudiesDir)
		.filter((entry) => entry.endsWith(".md"))
		.map((entry) => {
			const path = `${files.caseStudiesDir}/${entry}`;
			const content = readRequiredFile(path);

			return {
				path,
				publicationStatus: frontmatterValue(content, "publicationStatus", path),
				redactionStatus: frontmatterValue(content, "redactionStatus", path),
				title: frontmatterValue(content, "title", path),
			};
		});
}

function escapedRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function expectPacketMapping(packet, guideCheck, schemaFields) {
	const rowPattern = new RegExp(
		`\\|\\s*${escapedRegex(guideCheck)}\\s*\\|([^\\n]+)`,
	);
	const row = packet.match(rowPattern);
	assert.ok(row, `expected packet to include mapping row for ${guideCheck}`);

	for (const schemaField of schemaFields) {
		assert.match(
			row[1],
			new RegExp(`\\\`${escapedRegex(schemaField)}\\\``),
			`expected packet to map ${guideCheck} to ${schemaField}`,
		);
	}
}

function expectReadinessRow(packet, candidateTitle, expectedFragments) {
	const rowPattern = new RegExp(
		`\\|\\s*${escapedRegex(candidateTitle)}\\s*\\|([^\\n]+)`,
	);
	const row = packet.match(rowPattern);
	assert.ok(row, `expected packet readiness row for ${candidateTitle}`);

	const normalizedRow = row[1].replace(/`/g, "").toLowerCase();

	for (const fragment of expectedFragments) {
		const normalizedFragment = fragment.replace(/`/g, "").toLowerCase();
		assert.ok(
			normalizedRow.includes(normalizedFragment),
			`expected ${candidateTitle} readiness row to include ${fragment}`,
		);
	}
}

test("case-study redaction approval packets preserve not-approved launch state", () => {
	const backlog = readRequiredFile(files.backlog);
	const cliFleetCaseStudy = readRequiredFile(files.cliFleetCaseStudy);
	const contentContract = readRequiredFile(files.contentContract);
	const finalChecklist = readRequiredFile(files.finalChecklist);
	const guide = readRequiredFile(files.guide);
	const githubSync = readRequiredFile(files.githubSync);
	const packet = readRequiredFile(files.packet);
	const remoteRecoveryCaseStudy = readRequiredFile(
		files.remoteRecoveryCaseStudy,
	);
	const status = readRequiredFile(files.status);
	const caseStudies = readCaseStudies();
	const launchCandidates = caseStudies.filter(
		(caseStudy) => caseStudy.publicationStatus === "publish",
	);

	assert.ok(
		launchCandidates.length >= 1,
		"expected at least one publish case-study candidate",
	);

	expectContains(
		backlog,
		"CASE_STUDY_REDACTION_APPROVAL_PACKETS.md",
		"backlog approval-packet evidence",
	);
	expectContains(
		backlog,
		"scripts/redaction-approval-packets-contract.test.mjs",
		"backlog approval-packet contract",
	);
	expectContains(
		githubSync,
		"#20 and #21 remain open for final redaction checklist/artifact review",
		"GitHub sync keeps #20/#21 open",
	);
	expectContains(
		githubSync,
		"non-approval evidence inventory",
		"GitHub sync records non-approval inventory progress",
	);

	expectContains(packet, "# Case Study Redaction Approval Packets");
	expectContains(
		packet,
		"Status: approval packets only; no case study is launch-approved",
	);
	expectContains(packet, "## Packet Readiness Matrix");
	expectContains(
		packet,
		"exactly which approval evidence remains missing",
		"missing-evidence framing",
	);
	expectContains(packet, "docs/CONTENT_REDACTION_GUIDE.md");
	expectContains(packet, "runbooks/CONTENT_REDACTION_STATUS.md");
	expectContains(packet, "not approved until human signoff");
	expectContains(packet, "reviewer");
	expectContains(packet, "review date");
	expectContains(packet, "artifact evidence source");
	expectContains(packet, "redactionReview.checklist");
	expectContains(packet, "redactionReview.openItems");
	expectContains(packet, "publicationStatus: publish");
	expectContains(packet, "redactionStatus: approved");
	expectContains(packet, "public-safe evidence");
	expectContains(packet, "linked artifacts inspected");
	expectContains(packet, "production or approved-preview evidence");
	expectContains(packet, "approval decision");
	expectContains(packet, "## Non-Approval Evidence Inventory");
	expectContains(
		packet,
		"These inventory notes are mechanical preparation only; they are not approval decisions.",
		"non-approval evidence inventory boundary",
	);
	expectContains(packet, "Counts-only mechanical scan note");
	expectContains(
		packet,
		"matched-text excerpts are intentionally omitted",
		"mechanical scan privacy boundary",
	);
	expectContains(packet, "In-page sanitized architecture sketch");
	expectContains(packet, "In-page sanitized verification matrix");
	expectContains(packet, "In-page sanitized operator checklist");
	expectContains(
		packet,
		"Pending reviewer inspection of sanitized rollout matrix",
	);
	expectContains(packet, "Pending reviewer inspection of operator checklist");
	expectContains(packet, "In-page role-labeled diagnostic flow");
	expectContains(
		packet,
		"Pending reviewer inspection of redacted incident summary",
	);
	expectContains(
		packet,
		"Pending reviewer inspection of operator runbook excerpt",
	);

	for (const candidate of launchCandidates) {
		expectContains(
			packet,
			`## ${candidate.title}`,
			`${candidate.title} packet`,
		);
		expectContains(status, candidate.title, `${candidate.title} status row`);
		assert.notEqual(
			candidate.redactionStatus,
			"approved",
			`${candidate.path} is publish but must not be approved in this slice`,
		);
		assert.match(
			status,
			new RegExp(
				`\\|\\s*${escapedRegex(candidate.title)}\\s*\\|\\s*\\\`publish\\\`\\s*\\|\\s*\\\`reviewed\\\`\\s*\\|`,
			),
			`${candidate.title} must remain reviewed in the status matrix`,
		);
	}

	expectReadinessRow(packet, "CLI Fleet Synchronization and MCP Rollout", [
		"missing checklist answers",
		"missing openItems clearance",
		"missing artifact evidence source",
	]);
	expectReadinessRow(packet, "Creative Web Systems Atlas Demo", [
		"missing checklist answers",
		"missing openItems clearance",
		"missing atlas fallback artifact inspection evidence",
	]);
	expectReadinessRow(packet, "HumanKaylee Portfolio Build", [
		"missing checklist answers",
		"missing openItems clearance",
		"missing production domain evidence",
	]);
	expectReadinessRow(
		packet,
		"Remote Workstation Recovery and Operational Debugging",
		[
			"missing checklist answers",
			"missing openItems clearance",
			"missing redacted incident summary inspection evidence",
		],
	);

	for (const [guideCheck, schemaFields, contractFields] of checklistMappings) {
		expectContains(guide, guideCheck, `guide check ${guideCheck}`);
		expectPacketMapping(packet, guideCheck, schemaFields);
		for (const contractField of contractFields) {
			expectContains(
				contentContract,
				contractField,
				`contract field ${contractField}`,
			);
		}
	}

	expectContains(status, "No candidate currently meets that launch gate.");
	assert.doesNotMatch(
		status,
		/\|\s*[^|]+\s*\|\s*`publish`\s*\|\s*`approved`\s*\|/,
		"no publish candidate should be approved in the status matrix yet",
	);
	expectContains(
		finalChecklist,
		"Current approved launch case studies: 0",
		"final checklist zero approved count",
	);
	expectContains(
		status,
		"Non-approval evidence inventory",
		"status links non-approval inventory",
	);
	expectContains(
		status,
		"counts-only mechanical scan note",
		"status mentions mechanical scan boundary",
	);
	expectContains(
		cliFleetCaseStudy,
		"Confirm the public narrative uses role labels only and that linked artifacts exclude hostnames, account names, access paths, raw logs, and credentials.",
		"CLI fleet public narrative open item",
	);
	expectContains(
		cliFleetCaseStudy,
		"Inspect the sanitized rollout matrix and operator checklist artifacts; record artifact evidence source and reviewer decision before approval.",
		"CLI fleet artifact inspection open item",
	);
	expectContains(
		cliFleetCaseStudy,
		"Keep redactionStatus reviewed until human signoff and openItems clearance.",
		"CLI fleet human signoff open item",
	);
	expectContains(
		remoteRecoveryCaseStudy,
		"Confirm the recovery story and linked artifacts are fully sanitized, with exact commands, session identifiers, and environment-specific details removed or generalized.",
		"remote recovery public narrative open item",
	);
	expectContains(
		remoteRecoveryCaseStudy,
		"Inspect the redacted incident summary and operator runbook excerpt; record artifact evidence source and reviewer decision before approval.",
		"remote recovery artifact inspection open item",
	);
	expectContains(
		remoteRecoveryCaseStudy,
		"Keep redactionStatus reviewed until human signoff and openItems clearance.",
		"remote recovery private detail open item",
	);
});
