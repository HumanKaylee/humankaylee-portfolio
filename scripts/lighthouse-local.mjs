import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const LIGHTHOUSE_ROUTES = [
	{ label: "home", path: "/" },
	{ label: "work", path: "/work/" },
	{ label: "work-cryo", path: "/work/cryo-flow-sim/" },
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

export const LIGHTHOUSE_METRIC_THRESHOLDS = {
	homeLargestContentfulPaintMs: 2500,
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
const LIGHTHOUSE_SUMMARY_PATH = join(
	RESULTS_DIR,
	"lighthouse-summary.json",
).replace(/\\/g, "/");
const WAIT_TIMEOUT_MS = 30_000;
const require = createRequire(import.meta.url);
const ASTRO_BIN_PATH = join(
	dirname(require.resolve("astro/package.json")),
	"bin",
	"astro.mjs",
);

export function pnpmInvocation(
	platform = process.platform,
	nodePath = process.execPath,
) {
	if (platform !== "win32") {
		return { command: "pnpm", args: [] };
	}

	return {
		command: nodePath,
		args: [
			join(dirname(nodePath), "node_modules", "corepack", "dist", "pnpm.js"),
		],
	};
}

function runCommand(command, args, options = {}) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
			env: { ...process.env, ...options.env },
		});
		let output = "";
		for (const stream of [child.stdout, child.stderr]) {
			stream?.on("data", (chunk) => {
				output += chunk.toString();
			});
		}

		child.on("error", reject);
		child.on("exit", (code) => {
			resolve({ exitCode: code, output });
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

export function previewInvocation(
	host,
	port,
	nodePath = process.execPath,
	astroBinPath = ASTRO_BIN_PATH,
) {
	return {
		command: nodePath,
		args: [astroBinPath, "preview", "--host", host, "--port", String(port)],
	};
}

export function ensurePreviewPortAvailable(host, port) {
	return new Promise((resolve, reject) => {
		const probe = createServer();
		probe.once("error", (error) => {
			if (error.code === "EADDRINUSE") {
				reject(new Error(`Preview port ${host}:${port} is already in use.`));
				return;
			}
			reject(error);
		});
		probe.listen({ host, port, exclusive: true }, () => {
			probe.close((error) => (error ? reject(error) : resolve()));
		});
	});
}

function startPreview(host, port) {
	const invocation = previewInvocation(host, port);
	const child = spawn(invocation.command, invocation.args, {
		stdio: "inherit",
		env: process.env,
	});

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
	return join(RESULTS_DIR, `lighthouse-${route.label}.json`).replace(
		/\\/g,
		"/",
	);
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
		metricThresholds: LIGHTHOUSE_METRIC_THRESHOLDS,
		summaryPath: LIGHTHOUSE_SUMMARY_PATH,
	};
}

export function canUseReportAfterWindowsCleanupError({
	platform = process.platform,
	exitCode,
	output,
	report,
}) {
	const hasCompleteReport =
		!report?.runtimeError &&
		LIGHTHOUSE_CATEGORIES.every((category) =>
			Number.isFinite(report?.categories?.[category]?.score),
		) &&
		Number.isFinite(report?.audits?.["largest-contentful-paint"]?.numericValue);
	const isChromeTempCleanupError =
		typeof output === "string" &&
		/EPERM, Permission denied:[\s\S]*?[\\/]Temp[\\/]lighthouse\.\d+/.test(
			output,
		);

	return (
		platform === "win32" &&
		exitCode === 1 &&
		isChromeTempCleanupError &&
		hasCompleteReport
	);
}

async function runLighthouseForRoute(baseUrl, route) {
	const outputPath = outputPathForRoute(route);
	const pnpm = pnpmInvocation();
	await rm(outputPath, { force: true });

	const command = [
		...pnpm.args,
		"exec",
		"lighthouse",
		routeUrl(baseUrl, route),
		"--chrome-flags=--headless --no-sandbox",
		`--only-categories=${LIGHTHOUSE_CATEGORIES.join(",")}`,
		"--output=json",
		`--output-path=${outputPath}`,
		"--quiet",
		"--max-wait-for-load=10000",
	];
	const { exitCode, output } = await runCommand(pnpm.command, command);
	let report;
	try {
		report = JSON.parse(await readFile(outputPath, "utf8"));
	} catch (error) {
		throw new Error(
			`${pnpm.command} ${command.join(" ")} exited with ${exitCode}; no fresh report was produced.\n${output}\n${error.message}`,
		);
	}

	if (exitCode !== 0) {
		if (!canUseReportAfterWindowsCleanupError({ exitCode, output, report })) {
			throw new Error(
				`${pnpm.command} ${command.join(" ")} exited with ${exitCode}\n${output}`,
			);
		}
		console.warn(
			`Lighthouse wrote a complete ${route.label} report before Windows failed to remove its temporary Chrome profile; continuing with that fresh report.`,
		);
	}

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
		metrics: {
			largestContentfulPaintMs:
				report.audits["largest-contentful-paint"].numericValue,
		},
	};
}

export function thresholdFailures(results) {
	const categoryFailures = results.flatMap((result) =>
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
	const home = results.find((result) => result.path === "/");
	const lcp = home?.metrics?.largestContentfulPaintMs;
	const lcpFailure =
		Number.isFinite(lcp) &&
		lcp < LIGHTHOUSE_METRIC_THRESHOLDS.homeLargestContentfulPaintMs
			? []
			: [
					`/ mobile LCP ${Number.isFinite(lcp) ? Math.round(lcp) : "missing"}ms is not below ${LIGHTHOUSE_METRIC_THRESHOLDS.homeLargestContentfulPaintMs}ms`,
				];

	return [...categoryFailures, ...lcpFailure];
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
				metricThresholds: LIGHTHOUSE_METRIC_THRESHOLDS,
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
		await ensurePreviewPortAvailable(host, port);
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
			if (result.path === "/") {
				console.log(
					`/ mobile-lcp=${Math.round(result.metrics.largestContentfulPaintMs)}ms`,
				);
			}
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	runLighthouseGate(cliOptions(process.argv.slice(2))).catch((error) => {
		console.error(error.message);
		process.exit(1);
	});
}
