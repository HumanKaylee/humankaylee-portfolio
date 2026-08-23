#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const CONTACT_DECISION_REQUIRED_FIELDS = [
	"decisionOwner",
	"selectedMode",
	"retention",
	"backupHandling",
	"rotation",
	"deletionWorkflow",
	"storePathOrProvider",
	"productionSmokeCommand",
	"rollbackOrDisablePlan",
	"privacyRedactionRule",
	"blockedIssues",
	"ownerApprovalEvidence",
];

export const CONTACT_DECISION_MODES = {
	"mailto-only-exception": {
		modeSummary:
			"Owner-approved mailto-only launch exception with API submissions disabled or non-required for launch.",
		storePathOrProvider:
			"No API storage; visible mailto fallback remains the launch contact path.",
		smokeCommand:
			"<exact command that verifies the production contact route exposes the visible mailto fallback and does not require API submission>",
		rollbackOrDisablePlan:
			"<document how API contact enhancement stays disabled or can be disabled without affecting the static contact path>",
	},
	"jsonl-store": {
		modeSummary:
			"Rust API contact submissions use an approved persistent JSONL store on the selected backend host.",
		storePathOrProvider:
			"<approved HK_API_CONTACT_STORE_PATH on the selected host, recorded without private paths or payloads>",
		smokeCommand:
			"<exact command that verifies production or owner-approved production-equivalent provider preview contact submission, JSONL append, CORS, and safe response behavior>",
		rollbackOrDisablePlan:
			"<document how to rotate or disable HK_API_CONTACT_DELIVERY_MODE=store and preserve the mailto fallback>",
	},
	"external-provider": {
		modeSummary:
			"Contact submissions are delivered or stored through an approved external contact provider.",
		storePathOrProvider:
			"<approved external provider name, secret store location, retention owner, and non-secret delivery target summary>",
		smokeCommand:
			"<exact command that verifies production or owner-approved production-equivalent provider preview contact delivery without exposing message contents>",
		rollbackOrDisablePlan:
			"<document how to disable provider delivery and keep the static mailto fallback available>",
	},
	defer: {
		modeSummary:
			"Contact API production handling remains deferred; launch cannot rely on API submissions from this template.",
		storePathOrProvider:
			"<no approved store or provider; contact production handling remains blocked>",
		smokeCommand:
			"<exact future command still required after a contact handling mode is approved>",
		rollbackOrDisablePlan:
			"<document the current blocked state and the fallback path that remains available>",
	},
};

const DEFAULT_MODE = "defer";
const DEFAULT_SUMMARY_PATH =
	"test-results/phase-7-contact-decision-template.json";
const BLOCKED_ISSUES = ["#64", "#69"];
const FORBIDDEN_ACTIONS = [
	"do not approve contact handling from this template",
	"do not record contact payloads",
	"do not write secret values or provider account IDs",
	"do not close #64 or #69",
];

export function buildContactDecisionTemplate({
	mode = DEFAULT_MODE,
	timestamp = new Date().toISOString(),
} = {}) {
	const modeRecord = CONTACT_DECISION_MODES[mode];
	if (!modeRecord) {
		throw new Error(
			`unknown Phase 7 contact decision mode: ${mode}. Expected one of ${Object.keys(
				CONTACT_DECISION_MODES,
			).join(", ")}.`,
		);
	}

	return {
		status: "template only; production contact handling not approved",
		mode,
		modeSummary: modeRecord.modeSummary,
		timestamp,
		evidenceAuthority: "local/decision-template",
		canCloseIssues: false,
		blockedIssues: BLOCKED_ISSUES,
		decision: {
			decisionOwner: "<HumanKaylee or delegated launch owner>",
			selectedMode: mode,
			retention: "<required retention decision before launch>",
			backupHandling: "<required backup handling decision before launch>",
			rotation: "<required rotation decision before launch>",
			deletionWorkflow: "<required deletion workflow decision before launch>",
			storePathOrProvider: modeRecord.storePathOrProvider,
			productionSmokeCommand: modeRecord.smokeCommand,
			rollbackOrDisablePlan: modeRecord.rollbackOrDisablePlan,
			privacyRedactionRule:
				"Redact contact payloads, sender details, provider account IDs, secrets, and tokens before copying contact evidence.",
			blockedIssues: BLOCKED_ISSUES,
			ownerApprovalEvidence:
				"<HumanKaylee approval record, timestamp, and evidence link>",
		},
		nextAction:
			"Replace this template with owner-approved contact handling and production or owner-approved production-equivalent provider preview smoke evidence before closing #64 or #69.",
		forbiddenActions: FORBIDDEN_ACTIONS,
	};
}

function parseArgs(args) {
	const options = {
		mode: DEFAULT_MODE,
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

		if (arg === "--mode") {
			const nextArg = args[index + 1];
			if (nextArg) {
				options.mode = nextArg;
				index += 1;
			}
			continue;
		}

		if (arg.startsWith("--mode=")) {
			options.mode = arg.slice("--mode=".length);
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
	try {
		const options = parseArgs(process.argv.slice(2));
		const template = buildContactDecisionTemplate({ mode: options.mode });

		if (!options.dryRun) {
			const summaryPath = resolve(options.summaryPath);
			mkdirSync(dirname(summaryPath), { recursive: true });
			writeFileSync(summaryPath, `${JSON.stringify(template, null, 2)}\n`);
		}

		printJson(template);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		process.stderr.write(`${message}\n`);
		process.exitCode = 1;
	}
}

const isDirectRun =
	process.argv[1] &&
	fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isDirectRun) {
	runCli();
}
