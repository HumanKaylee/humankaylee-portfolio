import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";

const files = {
	backlog: "docs/BACKLOG.md",
	caseStudiesDir: "apps/web/src/content/case-studies",
	contentContract: "apps/web/src/lib/contracts/content.ts",
	finalChecklist: "runbooks/FINAL_LAUNCH_CHECKLIST.md",
	guide: "docs/CONTENT_REDACTION_GUIDE.md",
	packet: "runbooks/CASE_STUDY_REDACTION_APPROVAL_PACKETS.md",
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

test("case-study redaction approval packets preserve not-approved launch state", () => {
	const backlog = readRequiredFile(files.backlog);
	const contentContract = readRequiredFile(files.contentContract);
	const finalChecklist = readRequiredFile(files.finalChecklist);
	const guide = readRequiredFile(files.guide);
	const packet = readRequiredFile(files.packet);
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

	expectContains(packet, "# Case Study Redaction Approval Packets");
	expectContains(
		packet,
		"Status: approval packets only; no case study is launch-approved",
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
});
