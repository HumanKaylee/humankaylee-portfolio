import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
	CASE_STUDY_REDACTION_READINESS_SAFE_SKIPS,
	CASE_STUDY_REDACTION_READINESS_SUMMARY_PATH,
	evaluateCaseStudyRedactionReadiness,
	redactionReadinessPlan,
} from "./case-study-redaction-readiness.mjs";

const expectedPublishCandidateTitles = [
	"CLI Fleet Synchronization and MCP Rollout",
	"Creative Web Systems Atlas Demo",
	"Cryo Flow Sim — Stage 1 Showcase",
	"Joe Poznanski Portfolio Build",
	"Remote Workstation Recovery and Operational Debugging",
];

describe("case-study redaction readiness report", () => {
	it("summarizes current approval blockers without granting launch approval", () => {
		const report = evaluateCaseStudyRedactionReadiness({
			timestamp: "2026-05-25T20:00:00.000Z",
		});

		assert.equal(report.status, "blocked");
		assert.equal(report.evidenceAuthority, "local/redaction-readiness");
		assert.equal(report.safeToRunWithoutSecrets, true);
		assert.equal(report.canApproveCaseStudies, false);
		assert.equal(report.canCloseIssues, false);
		assert.equal(report.requiredApprovedPublishCount, 4);
		assert.equal(report.currentApprovedPublishCount, 0);
		assert.equal(report.currentPublishCandidateCount, 5);
		assert.deepEqual(report.safeSkippedActions, [
			...CASE_STUDY_REDACTION_READINESS_SAFE_SKIPS,
		]);
		assert.deepEqual(
			report.publishCandidates.map((candidate) => candidate.title).sort(),
			expectedPublishCandidateTitles.toSorted(),
		);

		for (const candidate of report.publishCandidates) {
			assert.equal(candidate.publicationStatus, "publish");
			assert.equal(candidate.redactionStatus, "reviewed");
			assert.equal(candidate.checklistStatus, "partial");
			assert.equal(candidate.openItemsCount > 0, true);
			assert.equal(candidate.approvalEvidencePresent, false);
			assert.deepEqual(candidate.missingApprovalEvidence, [
				"redactionStatus is reviewed, not approved",
				"redactionReview.checklistStatus is partial, not complete",
				"redactionReview.openItems must be cleared",
				"approvalEvidence.humanSignoff is missing",
				"approvalEvidence.artifactInspection is missing",
				"approvalEvidence.productionOrPreviewEvidence is missing",
			]);
		}

		assert.deepEqual(
			report.publishCandidates
				.map((candidate) => candidate.githubIssue)
				.sort((left, right) => left - right),
			[20, 21, 22, 23, 26],
		);
		assert.deepEqual(
			report.deferredOrBlockedCandidates.map((candidate) => ({
				publicationStatus: candidate.publicationStatus,
				redactionStatus: candidate.redactionStatus,
				title: candidate.title,
			})),
			[
				{
					publicationStatus: "defer",
					redactionStatus: "blocked",
					title: "Kalshi Migration or Analytics Tooling",
				},
				{
					publicationStatus: "needs-redaction",
					redactionStatus: "blocked",
					title: "YouTube AI Video Pipeline",
				},
			],
		);
	});

	it("exposes a dry-run plan without writing a summary", () => {
		const workspace = mkdtempSync(join(tmpdir(), "redaction-readiness-plan-"));
		const summaryPath = join(workspace, "summary.json");

		try {
			const result = spawnSync(
				process.execPath,
				[
					"scripts/case-study-redaction-readiness.mjs",
					"--dry-run",
					"--summary",
					summaryPath,
				],
				{ encoding: "utf8" },
			);

			assert.equal(result.status, 0, result.stderr);
			assert.equal(existsSync(summaryPath), false);
			assert.deepEqual(
				JSON.parse(result.stdout),
				redactionReadinessPlan(summaryPath),
			);
		} finally {
			rmSync(workspace, { force: true, recursive: true });
		}
	});

	it("writes a public-safe summary without copying open-item text", async () => {
		const workspace = mkdtempSync(join(tmpdir(), "redaction-readiness-"));
		const summaryPath = join(workspace, "summary.json");

		try {
			const result = spawnSync(
				process.execPath,
				[
					"scripts/case-study-redaction-readiness.mjs",
					"--summary",
					summaryPath,
				],
				{ encoding: "utf8" },
			);

			assert.equal(result.status, 0, result.stderr);
			assert.equal(existsSync(summaryPath), true);

			const summary = JSON.parse(await readFile(summaryPath, "utf8"));
			const serialized = JSON.stringify(summary);

			assert.equal(summary.status, "blocked");
			assert.equal(summary.currentApprovedPublishCount, 0);
			assert.equal(
				serialized.includes("Confirm the public narrative uses role labels"),
				false,
				"summary should not copy full open-item text from frontmatter",
			);
			assert.equal(serialized.includes("/home/joe"), false);
			assert.equal(serialized.includes("ghp_"), false);
		} finally {
			rmSync(workspace, { force: true, recursive: true });
		}
	});

	it("is documented as a local-only readiness command", () => {
		const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
		const packet = readFileSync(
			"runbooks/CASE_STUDY_REDACTION_APPROVAL_PACKETS.md",
			"utf8",
		);
		const launchEvidence = readFileSync("runbooks/LAUNCH_EVIDENCE.md", "utf8");
		const status = readFileSync("runbooks/CONTENT_REDACTION_STATUS.md", "utf8");

		assert.equal(
			packageJson.scripts["redaction:readiness"],
			"node scripts/case-study-redaction-readiness.mjs",
		);
		assert.match(packet, /pnpm redaction:readiness/);
		assert.match(status, /case-study-redaction-readiness\.mjs/);
		assert.match(status, /local\/redaction-readiness/);
		assert.match(launchEvidence, /Case-study redaction readiness/);
		assert.match(launchEvidence, /pnpm redaction:readiness/);
		assert.match(
			launchEvidence,
			/0 approved publish candidates out of 4 required/,
		);
		assert.match(
			launchEvidence,
			/Evidence Authority `local\/redaction-readiness`/,
		);
		assert.doesNotMatch(packet, /redaction readiness[^.\n]*launch-ready/i);
	});
});

assert.equal(
	CASE_STUDY_REDACTION_READINESS_SUMMARY_PATH,
	"test-results/case-study-redaction-readiness.json",
);
