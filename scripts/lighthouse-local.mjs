import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";

export const LIGHTHOUSE_ROUTES = [
	{ label: "home", path: "/" },
	{ label: "projects", path: "/projects/" },
	{
		label: "case-study",
		path: "/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
	},
	{ label: "resume", path: "/resume/" },
	{ label: "contact", path: "/contact/" },
];

export const LIGHTHOUSE_CATEGORIES = [
	"performance",
	"accessibility",
	"best-practices",
	"seo",
];

export const LIGHTHOUSE_THRESHOLDS = {
	performance: 0.9,
	accessibility: 0.95,
	"best-practices": 0.95,
	seo: 0.95,
};

export const LIGHTHOUSE_WARMUP_ROUTE = {
	label: "warmup",
	path: "/",
	scored: false,
};

export const LIGHTHOUSE_AUDIT_PLAN = [
	LIGHTHOUSE_WARMUP_ROUTE,
	...LIGHTHOUSE_ROUTES.map((route) => ({ ...route, scored: true })),
];

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 4322;
const RESULTS_DIR = "test-results";
const LIGHTHOUSE_SUMMARY_PATH = join(RESULTS_DIR, "lighthouse-summary.json").replace(/\\/g, "/");
const WAIT_TIMEOUT_MS = 30_000;

function runCommand(command, args, options = {}) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			stdio: options.stdio ?? "inherit",
			env: { ...process.env, ...options.env },
		});

		child.on("error", reject);
		child.on("exit", (code) => {
			if (code === 0) {
				resolve();
				return;
			}
			reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
		});
	});
}

async function waitForPreview(baseUrl) {
	const deadline = Date.now() + WAIT_TIMEOUT_MS;
	let lastError;

	while (Date.now() < deadline) {
		try {
			const response = await fetch(baseUrl);
			if (response.ok) {
				return;
			}
			lastError = new Error(`preview returned ${response.status}`);
		} catch (error) {
			lastError = error;
		}

		await new Promise((resolve) => setTimeout(resolve, 500));
	}

	throw new Error(
		`Preview did not become ready at ${baseUrl}: ${lastError?.message ?? "timed out"}`,
	);
}

function startPreview(host, port) {
	const child = spawn(
		"pnpm",
		["exec", "astro", "preview", "--host", host, "--port", String(port)],
		{ stdio: "inherit", env: process.env },
	);

	child.on("error", (error) => {
		throw error;
	});

	return child;
}

async function stopPreview(child) {
	if (!child || child.killed) {
		return;
	}

	child.kill("SIGTERM");
	await new Promise((resolve) => {
		child.once("exit", resolve);
		setTimeout(resolve, 2_000);
	});
}

function routeUrl(baseUrl, route) {
	return new URL(route.path, baseUrl).toString();
}

function outputPathForRoute(route) {
	return join(RESULTS_DIR, `lighthouse-${route.label}.json`).replace(/\\/g, "/");
}

export function lighthouseDryRunPlan(baseUrl) {
	return {
		baseUrl,
		routes: LIGHTHOUSE_ROUTES,
		scoredRoutes: LIGHTHOUSE_ROUTES,
		auditPlan: LIGHTHOUSE_AUDIT_PLAN.map((route) => ({
			...route,
			outputPath: outputPathForRoute(route),
		})),
		categories: LIGHTHOUSE_CATEGORIES,
		thresholds: LIGHTHOUSE_THRESHOLDS,
		summaryPath: LIGHTHOUSE_SUMMARY_PATH,
	};
}

async function runLighthouseForRoute(baseUrl, route) {
	const outputPath = outputPathForRoute(route);

	await runCommand("pnpm", [
		"exec",
		"lighthouse",
		routeUrl(baseUrl, route),
		"--chrome-flags=--headless --no-sandbox",
		`--only-categories=${LIGHTHOUSE_CATEGORIES.join(",")}`,
		"--output=json",
		`--output-path=${outputPath}`,
		"--quiet",
		"--max-wait-for-load=10000",
	]);

	const report = JSON.parse(await readFile(outputPath, "utf8"));
	const scores = Object.fromEntries(
		LIGHTHOUSE_CATEGORIES.map((category) => [
			category,
			report.categories[category].score,
		]),
	);

	return {
		label: route.label,
		path: route.path,
		outputPath,
		scores,
	};
}

function thresholdFailures(results) {
	return results.flatMap((result) =>
		LIGHTHOUSE_CATEGORIES.flatMap((category) => {
			const actual = result.scores[category];
			const expected = LIGHTHOUSE_THRESHOLDS[category];

			if (actual >= expected) {
				return [];
			}

			return [
				`${result.path} ${category} ${(actual * 100).toFixed(0)} < ${(expected * 100).toFixed(0)}`,
			];
		}),
	);
}

export async function runAuditPlan(baseUrl, runRoute = runLighthouseForRoute) {
	const results = [];
	for (const route of LIGHTHOUSE_AUDIT_PLAN) {
		const result = await runRoute(baseUrl, route);
		if (route.scored) {
			results.push(result);
		}
	}
	return results;
}

async function writeSummary(results) {
	await writeFile(
		LIGHTHOUSE_SUMMARY_PATH,
		`${JSON.stringify(
			{
				thresholds: LIGHTHOUSE_THRESHOLDS,
				routes: results,
			},
			null,
			2,
		)}\n`,
	);
	return LIGHTHOUSE_SUMMARY_PATH;
}

export async function runLighthouseGate({
	baseUrl,
	host = DEFAULT_HOST,
	port = DEFAULT_PORT,
	dryRun = false,
} = {}) {
	const resolvedBaseUrl = baseUrl ?? `http://${host}:${port}`;

	if (dryRun) {
		console.log(JSON.stringify(lighthouseDryRunPlan(resolvedBaseUrl), null, 2));
		return;
	}

	await mkdir(RESULTS_DIR, { recursive: true });

	let preview;
	if (!baseUrl) {
		preview = startPreview(host, port);
		await waitForPreview(resolvedBaseUrl);
	}

	try {
		const results = await runAuditPlan(resolvedBaseUrl);
		const summaryPath = await writeSummary(results);
		const failures = thresholdFailures(results);

		for (const result of results) {
			const formattedScores = LIGHTHOUSE_CATEGORIES.map(
				(category) =>
					`${category}=${Math.round(result.scores[category] * 100)}`,
			).join(" ");
			console.log(`${result.path} ${formattedScores}`);
		}

		if (failures.length > 0) {
			throw new Error(
				`Lighthouse threshold failures:\n${failures.join("\n")}\nSummary: ${summaryPath}`,
			);
		}

		console.log(`Lighthouse thresholds passed. Summary: ${summaryPath}`);
	} finally {
		await stopPreview(preview);
	}
}

function cliOptions(args) {
	return {
		dryRun: args.includes("--dry-run"),
		baseUrl:
			args
				.find((arg) => arg.startsWith("--base-url="))
				?.slice("--base-url=".length) || process.env.LIGHTHOUSE_BASE_URL,
	};
}

if (import.meta.url === `file://${process.argv[1]}`) {
	runLighthouseGate(cliOptions(process.argv.slice(2))).catch((error) => {
		console.error(error.message);
		process.exit(1);
	});
}
