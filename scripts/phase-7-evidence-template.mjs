#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PHASE_7_EVIDENCE_FIELDS = [
	"Command",
	"Target",
	"Evidence Authority",
	"Timestamp",
	"Result / Status",
	"Artifact / Link / Deployment ID / Rollback Target",
	"Blocker / Next Action",
	"Privacy Redaction Rule",
];

export const PHASE_7_EVIDENCE_AREAS = {
	frontend: {
		issue: "#63",
		relatedIssues: ["#63", "#69"],
		commandHint: "<exact command that produced frontend route smoke evidence>",
		targetHint:
			"<real target URL from production or owner-approved provider preview>",
		artifactHint:
			"<provider deployment ID, smoke output artifact, and rollback target>",
		blocker:
			"Still blocked until frontend provider project, deploy URL, domain target, production smoke, and rollback evidence exist.",
		privacy:
			"Redact provider account IDs, private logs, and private repository metadata before copying frontend evidence.",
	},
	api: {
		issue: "#64",
		relatedIssues: ["#64", "#69"],
		commandHint: "<exact command that checked the public API health route>",
		targetHint:
			"<real API origin from production or owner-approved provider preview>",
		artifactHint:
			"<API deployment ID, health response artifact, CORS result, and rollback target>",
		blocker:
			"Still blocked until API host, public API origin, secret storage, CORS, contact handling, health, and rollback evidence exist.",
		privacy:
			"Redact provider account IDs, private logs, contact payloads, and response details that expose private configuration before copying API evidence.",
	},
	domain: {
		issue: "#65",
		relatedIssues: ["#65", "#69"],
		commandHint: "<exact command that checked DNS, TLS, or metadata>",
		targetHint: "<real final domain or canonical production URL>",
		artifactHint:
			"<DNS/TLS output, metadata inspection artifact, sitemap/robots/RSS/Open Graph result>",
		blocker:
			"Still blocked until final domain, DNS, TLS, canonical URL, sitemap, robots, RSS, and Open Graph smoke evidence exist.",
		privacy:
			"Redact provider account IDs, registrar-private records, private logs, and private DNS management screenshots before copying domain evidence.",
	},
	lighthouse: {
		issue: "#69",
		relatedIssues: ["#63", "#65", "#69"],
		commandHint:
			"<exact command that ran Lighthouse on production or approved preview>",
		targetHint:
			"<real frontend origin audited by Lighthouse with core route list>",
		artifactHint: "<Lighthouse report path or public-safe summary artifact>",
		blocker:
			"Still blocked until production or owner-approved preview Lighthouse passes home, projects, one case study, resume, and contact thresholds.",
		privacy:
			"Redact provider account IDs, private report URLs, private logs, and non-public route data before copying Lighthouse evidence.",
	},
	contact: {
		issue: "#69",
		relatedIssues: ["#64", "#69"],
		commandHint:
			"<exact command that verified approved production contact handling>",
		targetHint:
			"<real contact route and API origin or approved mailto-only launch exception target>",
		artifactHint:
			"<contact smoke result, approved store/provider decision, retention note, and rollback target>",
		blocker:
			"Still blocked until contact handling decision, retention, backup, rotation, deletion, and production smoke evidence exist.",
		privacy:
			"Redact contact payloads, sender details, provider account IDs, private logs, secrets, and storage paths before copying contact evidence.",
	},
	rollback: {
		issue: "#69",
		relatedIssues: ["#63", "#64", "#69"],
		commandHint: "<exact command that listed or exercised rollback target>",
		targetHint: "<real frontend or API provider deployment target>",
		artifactHint:
			"<deployment ID, previous known-good deployment, rollback target, and recovery smoke result>",
		blocker:
			"Still blocked until real frontend/API deployment IDs, rollback targets, and rollback verification output exist.",
		privacy:
			"Redact provider account IDs, private deployment metadata, private logs, and sensitive release details before copying rollback evidence.",
	},
	redaction: {
		issue: "#69",
		relatedIssues: ["#20", "#21", "#24", "#25", "#69"],
		commandHint:
			"<exact command or reviewer record that produced approval evidence>",
		targetHint:
			"<case-study approval packet or owner-approved production-equivalent preview target>",
		artifactHint:
			"<human signoff record, artifact inspection summary, and approvalEvidence pointer>",
		blocker:
			"Still blocked until at least four publish case studies have cleared open items, artifact inspection, and human approval evidence.",
		privacy:
			"Approval summaries only; do not copy raw artifacts, private paths, private hostnames, raw logs, or reviewer-private notes.",
	},
};

const DEFAULT_AREA = "frontend";
const DEFAULT_SUMMARY_PATH = "test-results/phase-7-evidence-template.json";
const EVIDENCE_AUTHORITY_OPTIONS = [
	"production",
	"owner-approved production-equivalent provider preview",
];
const FORBIDDEN_ACTIONS = [
	"do not select providers",
	"do not run deployment commands",
	"do not change DNS or TLS",
	"do not run production smoke commands",
	"do not close launch blocker issues",
];

export function buildPhase7EvidenceTemplate({
	area = DEFAULT_AREA,
	timestamp = new Date().toISOString(),
} = {}) {
	const areaTemplate = PHASE_7_EVIDENCE_AREAS[area];
	if (!areaTemplate) {
		throw new Error(
			`unknown Phase 7 evidence area: ${area}. Expected one of ${Object.keys(
				PHASE_7_EVIDENCE_AREAS,
			).join(", ")}.`,
		);
	}

	return {
		status: "template only; production evidence not captured",
		area,
		issue: areaTemplate.issue,
		relatedIssues: areaTemplate.relatedIssues,
		canCloseIssues: false,
		evidenceAuthorityOptions: EVIDENCE_AUTHORITY_OPTIONS,
		row: {
			Command: areaTemplate.commandHint,
			Target: areaTemplate.targetHint,
			"Evidence Authority":
				"<production or owner-approved production-equivalent provider preview>",
			Timestamp: timestamp,
			"Result / Status": "<exit status or HTTP status plus concise result>",
			"Artifact / Link / Deployment ID / Rollback Target":
				areaTemplate.artifactHint,
			"Blocker / Next Action": areaTemplate.blocker,
			"Privacy Redaction Rule": areaTemplate.privacy,
		},
		forbiddenActions: FORBIDDEN_ACTIONS,
	};
}

function parseArgs(args) {
	const options = {
		area: DEFAULT_AREA,
		dryRun: false,
		summaryPath: DEFAULT_SUMMARY_PATH,
	};

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];

		if (arg === "--") continue;

		if (arg === "--dry-run") {
			options.dryRun = true;
			continue;
		}

		if (arg === "--area") {
			const nextArg = args[index + 1];
			if (nextArg) {
				options.area = nextArg;
				index += 1;
			}
			continue;
		}

		if (arg.startsWith("--area=")) {
			options.area = arg.slice("--area=".length);
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
	const template = buildPhase7EvidenceTemplate({ area: options.area });

	if (!options.dryRun) {
		const summaryPath = resolve(options.summaryPath);
		mkdirSync(dirname(summaryPath), { recursive: true });
		writeFileSync(summaryPath, `${JSON.stringify(template, null, 2)}\n`);
	}

	printJson(template);
}

const isDirectRun =
	process.argv[1] &&
	fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isDirectRun) {
	runCli();
}
