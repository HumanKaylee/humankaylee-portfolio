#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PHASE_7_LAUNCH_AUDIT_BLOCKING_ISSUES = [
	"#20",
	"#21",
	"#24",
	"#25",
	"#63",
	"#64",
	"#65",
	"#69",
];

export const PHASE_7_LAUNCH_AUDIT_REQUIRED_EVIDENCE = [
	"production frontend smoke",
	"production API smoke",
	"production Lighthouse",
	"contact production handling",
	"rollback evidence",
	"four approved case studies",
	"DNS/TLS/canonical metadata smoke",
];

export const PHASE_7_LAUNCH_AUDIT_SAFE_SKIPS = [
	"wrangler pages deploy",
	"fly deploy",
	"railway up",
	"DNS/TLS changes",
	"production contact submission",
	"launch blocker issue closure",
];

const DEFAULT_SUMMARY_PATH = "test-results/phase-7-launch-readiness-audit.json";

export function phase7LaunchReadinessAuditPlan(
	summaryPath = DEFAULT_SUMMARY_PATH,
) {
	return {
		status: "launch-readiness audit only; production remains blocked",
		summaryPath,
		evidenceAuthority: "local/readiness-audit",
		safeToRunWithoutCredentials: true,
		recordsToRead: [
			"runbooks/FINAL_LAUNCH_CHECKLIST.md",
			"runbooks/LAUNCH_EVIDENCE.md",
			"runbooks/LAUNCH_BLOCKERS_REGISTER.md",
			"runbooks/CONTENT_REDACTION_STATUS.md",
		],
		safeSkippedActions: PHASE_7_LAUNCH_AUDIT_SAFE_SKIPS,
		requiredProductionEvidence: PHASE_7_LAUNCH_AUDIT_REQUIRED_EVIDENCE,
		recordsToUpdate:
			"Optional public-safe launch audit summary only; do not replace blocked production rows or close launch issues.",
	};
}

export function buildPhase7LaunchReadinessAudit({
	timestamp = new Date().toISOString(),
} = {}) {
	return {
		status: "blocked",
		launchReady: false,
		canCloseIssues: false,
		evidenceAuthority: "local/readiness-audit",
		timestamp,
		blockingIssues: PHASE_7_LAUNCH_AUDIT_BLOCKING_ISSUES,
		postLaunchIssuesBlockedUntilB063: ["#70", "#71", "#72", "#73", "#74"],
		caseStudies: {
			requiredApproved: 4,
			currentApproved: 0,
			currentStatus:
				"reviewed and blocked candidates do not count toward launch approval",
		},
		issueBlockers: {
			"#20":
				"case-study artifact inspection, open-item clearance, and human redaction signoff",
			"#21":
				"case-study artifact inspection, open-item clearance, and human redaction signoff",
			"#24":
				"HumanKaylee publication-safety decision and approved synthetic proof pack",
			"#25":
				"HumanKaylee publication-safety decision and approved synthetic proof pack",
			"#63":
				"frontend provider project, production deploy URL, production smoke, and rollback evidence",
			"#64":
				"API host decision, provider project, public API origin, secret storage, contact handling, CORS, health, and rollback evidence",
			"#65":
				"final domain, DNS/TLS, canonical metadata, sitemap, robots, RSS, and Open Graph production smoke",
			"#69":
				"final launch checklist with production route/API/contact smoke, production Lighthouse, rollback evidence, and four approved case studies",
		},
		requiredProductionEvidence: PHASE_7_LAUNCH_AUDIT_REQUIRED_EVIDENCE,
		safeSkippedActions: PHASE_7_LAUNCH_AUDIT_SAFE_SKIPS,
		nextAction:
			"Resolve one external gate with real production or owner-approved production-equivalent provider preview evidence, or continue one small local guardrail slice if external inputs remain unavailable.",
		privacyRedactionRule:
			"Public-safe blocker labels only; no secret values, provider account IDs, private logs, private hostnames, raw artifacts, contact payloads, or private paths are recorded.",
	};
}

function parseArgs(args) {
	const options = { dryRun: false, summaryPath: DEFAULT_SUMMARY_PATH };

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];

		if (arg === "--") continue;

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
		printJson(phase7LaunchReadinessAuditPlan(options.summaryPath));
		return;
	}

	const audit = buildPhase7LaunchReadinessAudit();
	const summaryPath = resolve(options.summaryPath);
	mkdirSync(dirname(summaryPath), { recursive: true });
	writeFileSync(summaryPath, `${JSON.stringify(audit, null, 2)}\n`);
	printJson(audit);
}

const isDirectRun =
	process.argv[1] &&
	fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isDirectRun) {
	runCli();
}
