import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
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
	launchEvidence: "runbooks/LAUNCH_EVIDENCE.md",
	packet: "runbooks/CASE_STUDY_REDACTION_APPROVAL_PACKETS.md",
	remoteRecoveryCaseStudy:
		"apps/web/src/content/case-studies/remote-workstation-recovery-and-operational-debugging.md",
	status: "runbooks/CONTENT_REDACTION_STATUS.md",
	xplaneManifest: "apps/web/public/media/xplane-fov/capture-manifest.json",
	xplaneMediaDir: "apps/web/public/media/xplane-fov",
};

const xplaneTitle = "X-Plane Cabin Camera FOV Trade Study";
const xplaneSlug = "xplane-cabin-camera-fov-trade-study";
const xplaneReplayLimit = "replay harness source not supplied";

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

const expectedPublishCandidateTitles = [
	"CLI Fleet Synchronization and MCP Rollout",
	"Creative Web Systems Atlas Demo",
	"Cryo Flow Sim — Stage 1 Showcase",
	"Joe Poznanski Portfolio Build",
	"Remote Workstation Recovery and Operational Debugging",
];

const requiredChecklistAnswers = [
	["secretsRemoved", ["yes"]],
	["hostnamesAndAccessPathsGeneralized", ["yes"]],
	["userAndAccountNamesGeneralized", ["yes"]],
	["screenshotsInspected", ["yes", "not-applicable"]],
	["logsSummarizedOrSanitized", ["yes", "not-applicable"]],
	["publicLinksVerified", ["yes", "not-applicable"]],
	["claimsHaveSafeEvidence", ["yes"]],
	["securitySensitiveProceduresRemoved", ["yes"]],
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

function sha256(path) {
	return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function extractHeadingSection(content, heading) {
	const start = content.indexOf(`${heading}\n`);
	assert.notEqual(start, -1, `missing heading: ${heading}`);
	const afterHeading = content.slice(start + heading.length + 1);
	const nextHeading = afterHeading.search(/^## /m);
	return nextHeading === -1 ? afterHeading : afterHeading.slice(0, nextHeading);
}

function extractTableRow(content, firstCell) {
	const row = content
		.split(/\r?\n/)
		.find((line) => line.startsWith(`| ${firstCell} `));
	assert.ok(row, `missing table row for ${firstCell}`);
	return row;
}

function expectXPlaneReleaseBoundary(packetSection, statusSection) {
	const statusCells = extractTableRow(statusSection, xplaneTitle)
		.split("|")
		.slice(1, -1)
		.map((cell) => cell.trim());
	assert.match(packetSection, /Current redaction \| `reviewed`/);
	assert.doesNotMatch(packetSection, /Current redaction \| `approved`/);
	assert.match(packetSection, /Open redaction items \| None/);
	assert.match(
		packetSection,
		/production-equivalent preview evidence and final approval/i,
	);
	assert.match(packetSection, new RegExp(xplaneReplayLimit, "i"));
	assert.deepEqual(statusCells.slice(0, 4), [
		xplaneTitle,
		`\`${xplaneSlug}\``,
		"`publish`",
		"`reviewed`",
	]);
}

test("X-Plane packet matches committed public media and stays preview-pending", () => {
	const packet = readRequiredFile(files.packet);
	const status = readRequiredFile(files.status);
	const packetSection = extractHeadingSection(packet, `## ${xplaneTitle}`);
	const statusSection = extractHeadingSection(
		status,
		"## Work Redaction Matrix",
	);
	const manifest = JSON.parse(readRequiredFile(files.xplaneManifest));

	expectXPlaneReleaseBoundary(packetSection, statusSection);
	expectContains(packetSection, xplaneSlug, "X-Plane slug");
	expectContains(packetSection, "Joe supplied the archive", "archive owner");
	expectContains(packetSection, "user-supplied", "archive source kind");
	expectContains(
		packetSection,
		"authorized the design and publication direction on 2026-08-24",
		"dated publication authorization",
	);
	for (const omitted of [
		"raw source manifests",
		"program identifier",
		"private source path",
		"LM5",
		"LM6",
		"LM7",
		"LM8",
	]) {
		expectContains(packetSection, omitted, `omitted ${omitted}`);
	}
	expectContains(
		packetSection,
		"comparison images and representative video frames",
		"comparison and video visual inspection",
	);
	expectContains(
		packetSection,
		"design and publication authorization is not production-equivalent preview evidence",
		"authorization versus preview boundary",
	);

	const manifestRow = extractTableRow(packetSection, "capture-manifest.json");
	assert.ok(
		manifestRow.includes(sha256(files.xplaneManifest)),
		"packet manifest row must contain the committed manifest hash",
	);
	assert.equal(manifest.publishedAssets.length, 10);
	for (const asset of manifest.publishedAssets) {
		const assetPath = join(files.xplaneMediaDir, asset.filename);
		const actualHash = sha256(assetPath);
		assert.equal(
			asset.sha256,
			actualHash,
			`${asset.filename} manifest hash must match committed bytes`,
		);
		const packetRow = extractTableRow(packetSection, asset.filename);
		assert.ok(
			packetRow.includes(actualHash),
			`packet row must contain computed hash for ${asset.filename}`,
		);
	}
});

function expectContains(content, needle, label = needle) {
	assert.ok(
		normalize(content).includes(normalize(needle)),
		`expected content to include ${label}`,
	);
}

function frontmatterBlock(content, filePath) {
	const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);
	assert.ok(frontmatter, `missing frontmatter: ${filePath}`);
	return frontmatter[1];
}

function frontmatterValue(content, key, filePath) {
	const frontmatter = frontmatterBlock(content, filePath);

	const value = frontmatter.match(
		new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, "m"),
	);
	assert.ok(value, `missing ${key} in frontmatter: ${filePath}`);
	return value[1];
}

function nestedFrontmatterValue(content, key, filePath) {
	const frontmatter = frontmatterBlock(content, filePath);

	const value = frontmatter.match(
		new RegExp(`^ {2}${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, "m"),
	);
	assert.ok(value, `missing nested ${key} in frontmatter: ${filePath}`);
	return value[1];
}

function checklistAnswers(content, filePath) {
	const frontmatter = frontmatterBlock(content, filePath);
	const checklist = frontmatter.match(
		/^ {2}checklist:\n((?: {4}[a-zA-Z][^\n]*\n?)+)/m,
	);
	assert.ok(
		checklist,
		`missing redactionReview.checklist in frontmatter: ${filePath}`,
	);

	return Object.fromEntries(
		checklist[1]
			.split("\n")
			.filter((line) => line.trim().length > 0)
			.map((line) => {
				const match = line.match(
					/^\s{4}([A-Za-z0-9]+):\s*["']?([^"'\n]+)["']?$/,
				);
				assert.ok(match, `invalid checklist line in ${filePath}: ${line}`);
				return [match[1], match[2]];
			}),
	);
}

function readCaseStudies() {
	assert.ok(existsSync(files.caseStudiesDir), "missing case-study content dir");

	return readdirSync(files.caseStudiesDir)
		.filter((entry) => entry.endsWith(".md"))
		.map((entry) => {
			const path = `${files.caseStudiesDir}/${entry}`;
			const content = readRequiredFile(path);

			return {
				content,
				checklistStatus: nestedFrontmatterValue(
					content,
					"checklistStatus",
					path,
				),
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

function expectCompleteChecklistRecord(candidate) {
	const checklist = checklistAnswers(candidate.content, candidate.path);

	assert.equal(
		candidate.redactionStatus,
		"reviewed",
		`${candidate.path} must remain reviewed while checklist answers are prepared`,
	);
	assert.equal(
		candidate.checklistStatus,
		"partial",
		`${candidate.path} must keep checklistStatus partial until openItems and artifact evidence are cleared`,
	);

	for (const [field, allowedAnswers] of requiredChecklistAnswers) {
		assert.ok(
			Object.hasOwn(checklist, field),
			`${candidate.path} checklist missing ${field}`,
		);
		assert.ok(
			allowedAnswers.includes(checklist[field]),
			`${candidate.path} checklist ${field} must be one of ${allowedAnswers.join(
				", ",
			)}`,
		);
	}
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

function expectStatusRow(status, candidateTitle, expectedFragments) {
	const rowPattern = new RegExp(
		`\\|\\s*${escapedRegex(candidateTitle)}\\s*\\|([^\\n]+)`,
	);
	const row = status.match(rowPattern);
	assert.ok(row, `expected redaction status row for ${candidateTitle}`);

	const normalizedRow = row[1].replace(/`/g, "").toLowerCase();

	for (const fragment of expectedFragments) {
		const normalizedFragment = fragment.replace(/`/g, "").toLowerCase();
		assert.ok(
			normalizedRow.includes(normalizedFragment),
			`expected ${candidateTitle} status row to include ${fragment}`,
		);
	}
}

function expectHandoffQueueRow(packet, artifactLabel, expectedFragments) {
	const rowPattern = new RegExp(
		`\\|\\s*${escapedRegex(artifactLabel)}\\s*\\|([^\\n]+)`,
	);
	const row = packet.match(rowPattern);
	assert.ok(row, `expected handoff queue row for ${artifactLabel}`);

	const normalizedRow = row[1].replace(/`/g, "").toLowerCase();

	for (const fragment of expectedFragments) {
		const normalizedFragment = fragment.replace(/`/g, "").toLowerCase();
		assert.ok(
			normalizedRow.includes(normalizedFragment),
			`expected ${artifactLabel} handoff queue row to include ${fragment}`,
		);
	}
}

function expectReviewOnlyBoundary(packet, label) {
	expectContains(
		packet,
		"Status: review-only launch-blocking evidence index; no launch approval; no issue closure.",
		`${label} review-only boundary`,
	);
	expectContains(
		packet,
		"canonical non-approval evidence for the four current `publish` candidates",
		`${label} canonical non-approval evidence boundary`,
	);
	for (const pattern of [
		/\blaunch[- ]approved\b/i,
		/\bapproved for launch\b/i,
		/\blaunch[- ]ready\b/i,
		/\bready to launch\b/i,
		/\bpublication[- ]ready\b/i,
		/\bready for approval\b/i,
		/\bsafe enough to publish\b/i,
	]) {
		assert.doesNotMatch(
			packet,
			pattern,
			`${label} should not use approval-adjacent wording ${pattern}`,
		);
	}
}

test("redaction packet review-only boundary rejects approval-adjacent variants", () => {
	const baseBoundary = [
		"Status: review-only launch-blocking evidence index; no launch approval; no issue closure.",
		"canonical non-approval evidence for the four current `publish` candidates",
	].join("\n");

	for (const unsafeVariant of [
		"launch approved",
		"launch ready",
		"ready to launch",
		"publication-ready",
	]) {
		assert.throws(
			() =>
				expectReviewOnlyBoundary(
					`${baseBoundary}\n${unsafeVariant}`,
					"synthetic packet",
				),
			/approval-adjacent wording/,
			`expected helper to reject ${unsafeVariant}`,
		);
	}
});

test("case-study redaction approval packets preserve not-approved launch state", () => {
	const backlog = readRequiredFile(files.backlog);
	const cliFleetCaseStudy = readRequiredFile(files.cliFleetCaseStudy);
	const contentContract = readRequiredFile(files.contentContract);
	const finalChecklist = readRequiredFile(files.finalChecklist);
	const guide = readRequiredFile(files.guide);
	const githubSync = readRequiredFile(files.githubSync);
	const launchEvidence = readRequiredFile(files.launchEvidence);
	const packet = readRequiredFile(files.packet);
	const remoteRecoveryCaseStudy = readRequiredFile(
		files.remoteRecoveryCaseStudy,
	);
	const status = readRequiredFile(files.status);
	const caseStudies = readCaseStudies();
	const launchCandidates = caseStudies.filter(
		(caseStudy) => caseStudy.publicationStatus === "publish",
	);

	assert.deepEqual(
		launchCandidates.map((candidate) => candidate.title).sort(),
		expectedPublishCandidateTitles.toSorted(),
		"publish candidates should stay limited to the four current launch candidates",
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
		backlog,
		"checklist answers recorded",
		"backlog records checklist answer progress",
	);
	assert.doesNotMatch(
		backlog,
		/missing checklist answers/i,
		"backlog should not say checklist answers are still missing",
	);
	expectContains(
		githubSync,
		"#20 and #21 remain open for openItems/artifact review and final human signoff",
		"GitHub sync keeps #20/#21 open",
	);
	expectContains(
		githubSync,
		"non-approval evidence inventory",
		"GitHub sync records non-approval inventory progress",
	);
	expectContains(
		launchEvidence,
		"recorded checklist answers",
		"launch evidence records current redaction checklist state",
	);
	expectContains(
		launchEvidence,
		"review recorded checklist answers",
		"launch evidence points reviewer to current redaction action",
	);
	assert.doesNotMatch(
		launchEvidence,
		/(Complete guide checklists|Complete checklist review|completed redaction checklists|checklists? (?:are )?complete|review complete|artifact inspection (?:done|complete)|human review complete)/i,
		"launch evidence should not use stale checklist-missing or checklist-complete wording",
	);

	expectContains(packet, "# Case Study Redaction Approval Packets");
	expectContains(
		packet,
		"Status: review-only launch-blocking evidence index; no launch approval; no issue closure.",
	);
	expectContains(packet, "## Packet Readiness Matrix");
	expectReviewOnlyBoundary(packet, "packet");
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
	expectContains(
		packet,
		"production or owner-approved production-equivalent provider preview evidence",
	);
	expectContains(packet, "approval decision");
	expectContains(packet, "## Non-Approval Evidence Inventory");
	expectContains(
		packet,
		"These inventory notes are review-only; they do not grant launch approval or close issues.",
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
	expectContains(packet, "Static-first local verification matrix");
	expectContains(
		packet,
		"Pending reviewer inspection of local verification and launch evidence claims",
	);
	expectContains(packet, "Semantic project atlas fallback");
	expectContains(
		packet,
		"Pending reviewer inspection of atlas fallback evidence",
	);
	expectContains(packet, "## B-014/B-015 Artifact Inspection Handoff Queue");
	expectHandoffQueueRow(packet, "sanitized rollout matrix", [
		"#20",
		"CLI Fleet Synchronization and MCP Rollout",
		"pending reviewer inspection",
		"reviewed or blocked only",
		"forbidden material",
		"not approval evidence",
	]);
	expectHandoffQueueRow(packet, "operator checklist", [
		"#20",
		"CLI Fleet Synchronization and MCP Rollout",
		"pending reviewer inspection",
		"reviewed or blocked only",
		"forbidden material",
		"not approval evidence",
	]);
	expectHandoffQueueRow(packet, "redacted incident summary", [
		"#21",
		"Remote Workstation Recovery and Operational Debugging",
		"pending reviewer inspection",
		"reviewed or blocked only",
		"forbidden material",
		"not approval evidence",
	]);
	expectHandoffQueueRow(packet, "operator runbook excerpt", [
		"#21",
		"Remote Workstation Recovery and Operational Debugging",
		"pending reviewer inspection",
		"reviewed or blocked only",
		"forbidden material",
		"not approval evidence",
	]);
	assert.equal(
		packet.match(
			/\|\s*(?:sanitized rollout matrix|operator checklist|redacted incident summary|operator runbook excerpt)\s*\|/g,
		)?.length,
		4,
		"handoff queue must include exactly the four required B-014/B-015 artifact labels",
	);

	for (const candidate of launchCandidates) {
		expectCompleteChecklistRecord(candidate);
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
		"checklist answers recorded",
		"missing openItems clearance",
		"missing artifact evidence source",
	]);
	expectReadinessRow(packet, "Creative Web Systems Atlas Demo", [
		"checklist answers recorded",
		"missing openItems clearance",
		"missing atlas fallback artifact inspection evidence",
	]);
	expectReadinessRow(packet, "Joe Poznanski Portfolio Build", [
		"checklist answers recorded",
		"missing openItems clearance",
		"missing production domain evidence",
	]);
	expectReadinessRow(
		packet,
		"Remote Workstation Recovery and Operational Debugging",
		[
			"checklist answers recorded",
			"missing openItems clearance",
			"missing redacted incident summary inspection evidence",
		],
	);
	expectStatusRow(status, "CLI Fleet Synchronization and MCP Rollout", [
		"review recorded checklist answers",
		"clear open items",
		"inspect linked artifacts",
	]);
	expectStatusRow(status, "Creative Web Systems Atlas Demo", [
		"review recorded checklist answers",
		"inspect atlas fallback artifacts",
		"capture production or owner-approved production-equivalent provider preview evidence",
	]);
	expectStatusRow(status, "Joe Poznanski Portfolio Build", [
		"review recorded checklist answers",
		"inspect public artifacts",
		"add real production domain",
	]);
	expectStatusRow(
		status,
		"Remote Workstation Recovery and Operational Debugging",
		[
			"review recorded checklist answers",
			"inspect linked artifacts",
			"keep hostnames",
		],
	);
	assert.doesNotMatch(
		status,
		/(Complete (every guide checklist item|final checklist review)|checklists? (?:are )?complete|review complete|artifact inspection (?:done|complete)|human review complete)/i,
		"redaction status next actions should reflect recorded checklist answers",
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
	expectContains(
		status,
		"The two blocked/deferred candidates must not count toward the four-case-study launch minimum.",
		"blocked/deferred candidates do not satisfy launch minimum",
	);
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
		"Non-approval evidence inventory for all four current `publish` candidates",
		"status explains packet inventory covers all publish candidates",
	);
	expectContains(
		status,
		"counts-only mechanical scan note remains limited to the two operational case-study bodies",
		"status limits mechanical scan scope honestly",
	);
	assert.doesNotMatch(
		status,
		/two operational case studies/i,
		"status should not describe the packet inventory as limited to two operational case studies",
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
	assert.doesNotMatch(
		packet,
		/Missing checklist answers/,
		"packet should no longer name checklist answers as missing once frontmatter records them",
	);
});
