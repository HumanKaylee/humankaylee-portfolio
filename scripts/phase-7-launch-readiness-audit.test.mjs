import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
	PHASE_7_LAUNCH_AUDIT_BLOCKING_ISSUES,
	PHASE_7_LAUNCH_AUDIT_REQUIRED_EVIDENCE,
	buildPhase7LaunchReadinessAudit,
	phase7LaunchReadinessAuditPlan,
} from "./phase-7-launch-readiness-audit.mjs";

describe("Phase 7 launch readiness audit", () => {
	it("summarizes unresolved external launch gates without granting launch approval", () => {
		const audit = buildPhase7LaunchReadinessAudit({
			timestamp: "2026-05-25T22:00:00.000Z",
		});

		assert.equal(audit.status, "blocked");
		assert.equal(audit.launchReady, false);
		assert.equal(audit.canCloseIssues, false);
		assert.equal(audit.evidenceAuthority, "local/readiness-audit");
		assert.equal(audit.timestamp, "2026-05-25T22:00:00.000Z");
		assert.deepEqual(
			audit.blockingIssues,
			PHASE_7_LAUNCH_AUDIT_BLOCKING_ISSUES,
		);
		assert.deepEqual(
			audit.requiredProductionEvidence,
			PHASE_7_LAUNCH_AUDIT_REQUIRED_EVIDENCE,
		);
		assert.equal(audit.caseStudies.requiredApproved, 4);
		assert.equal(audit.caseStudies.currentApproved, 0);
		assert.match(audit.issueBlockers["#63"], /frontend provider/i);
		assert.match(audit.issueBlockers["#64"], /API host/i);
		assert.match(audit.issueBlockers["#65"], /DNS\/TLS/i);
		assert.match(audit.issueBlockers["#69"], /final launch checklist/i);
	});

	it("keeps the summary public-safe and does not include secret values", () => {
		const audit = buildPhase7LaunchReadinessAudit({
			timestamp: "2026-05-25T22:00:00.000Z",
		});
		const serialized = JSON.stringify(audit);

		assert.equal(serialized.includes("CLOUDFLARE_API_TOKEN="), false);
		assert.equal(serialized.includes("ghp_"), false);
		assert.equal(serialized.includes("provider account id"), false);
		assert.match(audit.privacyRedactionRule, /no secret values/i);
	});

	it("exposes a dry-run plan without writing a summary and can write a public-safe summary", async () => {
		const workspace = mkdtempSync(join(tmpdir(), "phase-7-launch-audit-"));
		const summaryPath = join(workspace, "launch-readiness.json");

		try {
			const dryRun = spawnSync(
				process.execPath,
				[
					"scripts/phase-7-launch-readiness-audit.mjs",
					"--dry-run",
					"--summary",
					summaryPath,
				],
				{ encoding: "utf8" },
			);

			assert.equal(dryRun.status, 0, dryRun.stderr);
			assert.equal(existsSync(summaryPath), false);
			assert.deepEqual(
				JSON.parse(dryRun.stdout),
				phase7LaunchReadinessAuditPlan(summaryPath),
			);

			const writeRun = spawnSync(
				process.execPath,
				[
					"scripts/phase-7-launch-readiness-audit.mjs",
					"--summary",
					summaryPath,
				],
				{ encoding: "utf8" },
			);

			assert.equal(writeRun.status, 0, writeRun.stderr);
			assert.equal(existsSync(summaryPath), true);
			const summary = JSON.parse(await readFile(summaryPath, "utf8"));
			assert.equal(summary.status, "blocked");
			assert.equal(summary.launchReady, false);
			assert.equal(summary.canCloseIssues, false);
		} finally {
			rmSync(workspace, { force: true, recursive: true });
		}
	});

	it("is documented as a local audit, not production launch evidence", async () => {
		const [packageJson, agents, packet, launchEvidence, changelog] =
			await Promise.all([
				readFile("package.json", "utf8"),
				readFile("AGENTS.md", "utf8"),
				readFile("runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md", "utf8"),
				readFile("runbooks/LAUNCH_EVIDENCE.md", "utf8"),
				readFile("docs/CHANGELOG.md", "utf8"),
			]);

		assert.match(packageJson, /"phase7:launch-audit"/);
		assert.match(agents, /phase7:launch-audit/);
		assert.match(packet, /Phase 7 launch readiness audit/);
		assert.match(packet, /local\/readiness-audit/);
		assert.match(launchEvidence, /Phase 7 launch readiness audit/);
		assert.match(launchEvidence, /not production evidence/);
		assert.match(changelog, /Phase 7 launch readiness audit/);
	});
});
