#!/usr/bin/env node

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const CASE_STUDY_REDACTION_READINESS_SUMMARY_PATH =
	"test-results/case-study-redaction-readiness.json";

export const CASE_STUDY_REDACTION_READINESS_SAFE_SKIPS = [
	"changing redactionStatus to approved",
	"clearing redactionReview.openItems",
	"adding approvalEvidence without human signoff",
	"closing #20/#21/#24/#25",
	"counting reviewed case studies toward launch",
];

const CASE_STUDIES_DIR = "apps/web/src/content/case-studies";
const REQUIRED_APPROVED_PUBLISH_COUNT = 4;

function frontmatterBlock(content, path) {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) {
		throw new Error(`missing frontmatter: ${path}`);
	}
	return match[1];
}

function scalarValue(frontmatter, key) {
	const match = frontmatter.match(
		new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, "m"),
	);
	return match?.[1] ?? "";
}

function nestedScalarValue(frontmatter, key) {
	const match = frontmatter.match(
		new RegExp(`^ {2}${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, "m"),
	);
	return match?.[1] ?? "";
}

function countNestedList(frontmatter, key) {
	const match = frontmatter.match(
		new RegExp(`^ {2}${key}:\\n((?: {4}- [^\\n]+\\n?)+)`, "m"),
	);
	return match ? match[1].split("\n").filter((line) => line.trim()).length : 0;
}

function hasBlock(frontmatter, key) {
	return new RegExp(`^${key}:\\n`, "m").test(frontmatter);
}

function readCaseStudies(caseStudiesDir = CASE_STUDIES_DIR) {
	return readdirSync(caseStudiesDir)
		.filter((entry) => entry.endsWith(".md"))
		.sort()
		.map((entry) => {
			const path = `${caseStudiesDir}/${entry}`;
			const frontmatter = frontmatterBlock(readFileSync(path, "utf8"), path);

			return {
				path,
				title: scalarValue(frontmatter, "title"),
				publicationStatus: scalarValue(frontmatter, "publicationStatus"),
				redactionStatus: scalarValue(frontmatter, "redactionStatus"),
				checklistStatus: nestedScalarValue(frontmatter, "checklistStatus"),
				githubIssue: Number(nestedScalarValue(frontmatter, "githubIssue")),
				openItemsCount: countNestedList(frontmatter, "openItems"),
				approvalEvidencePresent: hasBlock(frontmatter, "approvalEvidence"),
			};
		});
}

function missingApprovalEvidence(candidate) {
	const missing = [];

	if (candidate.redactionStatus !== "approved") {
		missing.push(
			`redactionStatus is ${candidate.redactionStatus}, not approved`,
		);
	}

	if (candidate.checklistStatus !== "complete") {
		missing.push(
			`redactionReview.checklistStatus is ${candidate.checklistStatus}, not complete`,
		);
	}

	if (candidate.openItemsCount > 0) {
		missing.push("redactionReview.openItems must be cleared");
	}

	if (!candidate.approvalEvidencePresent) {
		missing.push("approvalEvidence.humanSignoff is missing");
		missing.push("approvalEvidence.artifactInspection is missing");
		missing.push("approvalEvidence.productionOrPreviewEvidence is missing");
	}

	return missing;
}

function publicCandidateSummary(candidate) {
	return {
		title: candidate.title,
		path: candidate.path,
		githubIssue: Number.isNaN(candidate.githubIssue)
			? undefined
			: candidate.githubIssue,
		publicationStatus: candidate.publicationStatus,
		redactionStatus: candidate.redactionStatus,
		checklistStatus: candidate.checklistStatus,
		openItemsCount: candidate.openItemsCount,
		approvalEvidencePresent: candidate.approvalEvidencePresent,
		missingApprovalEvidence: missingApprovalEvidence(candidate),
	};
}

export function redactionReadinessPlan(
	summaryPath = CASE_STUDY_REDACTION_READINESS_SUMMARY_PATH,
) {
	return {
		status: "redaction-readiness only; launch approval remains blocked",
		summaryPath,
		evidenceAuthority: "local/redaction-readiness",
		safeToRunWithoutSecrets: true,
		caseStudiesDir: CASE_STUDIES_DIR,
		safeSkippedActions: CASE_STUDY_REDACTION_READINESS_SAFE_SKIPS,
		recordsToUpdate:
			"Use the summary as reviewer handoff input only; keep reviewed candidates non-launch-eligible until approvalEvidence exists and openItems are cleared.",
	};
}

export function evaluateCaseStudyRedactionReadiness({
	caseStudiesDir = CASE_STUDIES_DIR,
	timestamp = new Date().toISOString(),
} = {}) {
	const caseStudies = readCaseStudies(caseStudiesDir);
	const publishCandidates = caseStudies
		.filter((candidate) => candidate.publicationStatus === "publish")
		.map(publicCandidateSummary)
		.sort((left, right) => left.title.localeCompare(right.title));
	const deferredOrBlockedCandidates = caseStudies
		.filter((candidate) => candidate.publicationStatus !== "publish")
		.map(publicCandidateSummary)
		.sort((left, right) => left.title.localeCompare(right.title));
	const currentApprovedPublishCount = publishCandidates.filter(
		(candidate) => candidate.redactionStatus === "approved",
	).length;

	return {
		status:
			currentApprovedPublishCount >= REQUIRED_APPROVED_PUBLISH_COUNT
				? "approval-evidence-present"
				: "blocked",
		evidenceAuthority: "local/redaction-readiness",
		timestamp,
		safeToRunWithoutSecrets: true,
		canApproveCaseStudies: false,
		canCloseIssues: false,
		requiredApprovedPublishCount: REQUIRED_APPROVED_PUBLISH_COUNT,
		currentApprovedPublishCount,
		currentPublishCandidateCount: publishCandidates.length,
		publishCandidates,
		deferredOrBlockedCandidates,
		safeSkippedActions: CASE_STUDY_REDACTION_READINESS_SAFE_SKIPS,
		nextAction:
			"Human reviewer must inspect artifacts, clear openItems, record approvalEvidence, and keep production-dependent claims blocked until production or owner-approved preview evidence exists.",
		privacyRedactionRule:
			"The summary records metadata, counts, issue numbers, and missing evidence labels only; it does not copy open-item text, raw artifacts, private paths, tokens, or logs.",
	};
}

function parseArgs(args) {
	const options = {
		dryRun: false,
		summaryPath: CASE_STUDY_REDACTION_READINESS_SUMMARY_PATH,
	};

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];

		if (arg === "--") {
			continue;
		}

		if (arg === "--dry-run") {
			options.dryRun = true;
			continue;
		}

		if (arg === "--summary") {
			const nextArg = args[index + 1];
			if (nextArg) {
				options.summaryPath = nextArg;
				index += 1;
			}
			continue;
		}

		if (arg.startsWith("--summary=")) {
			options.summaryPath = arg.slice("--summary=".length);
		}
	}

	return options;
}

function printJson(value) {
	process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function runCli() {
	const options = parseArgs(process.argv.slice(2));

	if (options.dryRun) {
		printJson(redactionReadinessPlan(options.summaryPath));
		return;
	}

	const summary = evaluateCaseStudyRedactionReadiness();
	const summaryPath = resolve(options.summaryPath);
	mkdirSync(dirname(summaryPath), { recursive: true });
	writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
	printJson(summary);
}

const isDirectRun =
	process.argv[1] &&
	fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isDirectRun) {
	runCli();
}
