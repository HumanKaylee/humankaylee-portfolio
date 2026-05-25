#!/usr/bin/env node

import { accessSync, mkdirSync, writeFileSync } from "node:fs";
import { constants } from "node:fs";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PHASE_7_PROVIDER_COMMANDS = ["wrangler", "fly", "railway"];

export const PHASE_7_PROVIDER_ENV_NAMES = [
	"CLOUDFLARE_API_TOKEN",
	"CLOUDFLARE_ACCOUNT_ID",
	"FLY_API_TOKEN",
	"RAILWAY_TOKEN",
	"FRONTEND_ORIGIN",
	"API_ORIGIN",
	"PUBLIC_SITE_URL",
	"PUBLIC_API_BASE_URL",
	"HK_API_ALLOWED_ORIGINS",
	"HK_API_CONTACT_DELIVERY_MODE",
	"HK_API_CONTACT_STORE_PATH",
];

export const PHASE_7_PROVIDER_PREFLIGHT_BLOCKERS = [
	"frontend provider/project target",
	"final domain name",
	"API host decision after Shuttle shutdown",
	"contact production handling",
	"public-safe case-study approvals",
];

export const PHASE_7_PROVIDER_PREFLIGHT_SAFE_SKIPS = [
	"wrangler pages deploy",
	"fly deploy",
	"railway up",
	"production xh smoke commands",
	"DNS/TLS changes",
];

const DEFAULT_SUMMARY_PATH = "test-results/phase-7-provider-preflight.json";

function commandExists(command, pathValue = process.env.PATH ?? "") {
	return pathValue
		.split(delimiter)
		.filter(Boolean)
		.some((directory) => {
			try {
				accessSync(join(directory, command), constants.X_OK);
				return true;
			} catch {
				return false;
			}
		});
}

export function currentCommandAvailability(pathValue = process.env.PATH ?? "") {
	return Object.fromEntries(
		PHASE_7_PROVIDER_COMMANDS.map((command) => [
			command,
			commandExists(command, pathValue),
		]),
	);
}

export function phase7ProviderPreflightPlan(
	summaryPath = DEFAULT_SUMMARY_PATH,
) {
	return {
		status: "provider-preflight only; production remains blocked",
		summaryPath,
		evidenceAuthority: "local/preflight",
		safeToRunWithoutCredentials: true,
		commandsChecked: PHASE_7_PROVIDER_COMMANDS,
		envNamesChecked: PHASE_7_PROVIDER_ENV_NAMES,
		safeSkippedActions: PHASE_7_PROVIDER_PREFLIGHT_SAFE_SKIPS,
		productionBlockers: PHASE_7_PROVIDER_PREFLIGHT_BLOCKERS,
		recordsToUpdate:
			"runbooks/LAUNCH_EVIDENCE.md only with public-safe summary evidence; keep #63/#64/#65/#69 open until external evidence exists.",
	};
}

export function evaluateProviderPreflight({
	commandAvailability = currentCommandAvailability(),
	env = process.env,
	timestamp = new Date().toISOString(),
} = {}) {
	const commands = Object.fromEntries(
		PHASE_7_PROVIDER_COMMANDS.map((command) => [
			command,
			commandAvailability[command] ? "present" : "missing",
		]),
	);
	const presentEnvNames = PHASE_7_PROVIDER_ENV_NAMES.filter((name) =>
		Boolean(env[name]),
	);
	const missingEnvNames = PHASE_7_PROVIDER_ENV_NAMES.filter(
		(name) => !presentEnvNames.includes(name),
	);

	return {
		status: "blocked",
		evidenceAuthority: "local/preflight",
		canDeploy: false,
		timestamp,
		commands,
		presentEnvNames,
		missingEnvNames,
		safeSkippedActions: PHASE_7_PROVIDER_PREFLIGHT_SAFE_SKIPS,
		productionBlockers: PHASE_7_PROVIDER_PREFLIGHT_BLOCKERS,
		nextAction:
			"Select provider projects, domains, API host, contact handling, and case-study approvals before running deployment, DNS, rollback, or production smoke commands.",
		privacyRedactionRule:
			"Only environment variable names and command presence are recorded; secret values, provider account IDs, URLs, contact payloads, and raw provider logs are not captured.",
	};
}

function parseArgs(args) {
	const options = { dryRun: false, summaryPath: DEFAULT_SUMMARY_PATH };

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
		printJson(phase7ProviderPreflightPlan(options.summaryPath));
		return;
	}

	const summary = evaluateProviderPreflight();
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
