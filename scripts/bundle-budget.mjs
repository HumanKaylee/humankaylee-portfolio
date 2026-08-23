import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const BUNDLE_BUDGET_LIMITS = {
	maxCriticalJavaScriptBytesPerRoute: 8 * 1024,
};

export const REQUIRED_RELEASE_ROUTES = [
	"/",
	"/about/",
	"/contact/",
	"/notes/",
	"/resume/",
	"/work/",
	"/work/black-scholes-wasm/",
	"/work/cli-fleet-synchronization-and-mcp-rollout/",
	"/work/conformal-cooling-channel-generation/",
	"/work/cryo-flow-sim/",
	"/work/remote-workstation-recovery-and-operational-debugging/",
];

const DEFAULT_DIST_DIR = "dist";
const DEFAULT_SUMMARY_PATH = "test-results/bundle-budget-summary.json";
const SCRIPT_TAG_PATTERN =
	/<script\b(?<attrs>[^>]*)>(?<body>[\s\S]*?)<\/script>/gi;
const ATTRIBUTE_PATTERN =
	/(?<name>[^\s=]+)(?:=(?<quote>["'])(?<value>.*?)\k<quote>)?/g;

function attributesFromScriptTag(rawAttributes) {
	const attributes = new Map();

	for (const match of rawAttributes.matchAll(ATTRIBUTE_PATTERN)) {
		attributes.set(match.groups.name.toLowerCase(), match.groups.value ?? "");
	}

	return attributes;
}

function isNonExecutableScript(attributes) {
	const type = attributes.get("type")?.trim().toLowerCase();
	return (
		type === "application/ld+json" ||
		type === "application/json" ||
		type === "importmap"
	);
}

function normalizeAssetPath(src) {
	if (src.startsWith("http://") || src.startsWith("https://")) {
		return null;
	}

	const withoutQuery = src.split("?")[0].split("#")[0];
	return withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
}

export function analyzeHtmlForCriticalJavaScript({
	html,
	routePath,
	assetSizes = new Map(),
}) {
	let criticalJavaScriptBytes = 0;
	let inlineScriptCount = 0;
	let externalScriptCount = 0;
	const externalScripts = [];

	for (const match of html.matchAll(SCRIPT_TAG_PATTERN)) {
		const attributes = attributesFromScriptTag(match.groups.attrs);
		if (isNonExecutableScript(attributes)) {
			continue;
		}

		const src = attributes.get("src");
		if (src) {
			const assetPath = normalizeAssetPath(src);
			if (!assetPath) {
				continue;
			}
			externalScriptCount += 1;
			externalScripts.push(assetPath);
			criticalJavaScriptBytes += assetSizes.get(assetPath) ?? 0;
			continue;
		}

		const body = match.groups.body.trim();
		if (body) {
			inlineScriptCount += 1;
			criticalJavaScriptBytes += Buffer.byteLength(body);
		}
	}

	return {
		routePath,
		inlineScriptCount,
		externalScriptCount,
		externalScripts,
		criticalJavaScriptBytes,
	};
}

export function evaluateBundleBudget(routes, limits = BUNDLE_BUDGET_LIMITS) {
	const routeFailures = routes.flatMap((route) => {
		if (
			route.criticalJavaScriptBytes <= limits.maxCriticalJavaScriptBytesPerRoute
		) {
			return [];
		}

		return [
			`${route.routePath} critical JavaScript ${route.criticalJavaScriptBytes} bytes exceeds ${limits.maxCriticalJavaScriptBytesPerRoute} bytes`,
		];
	});
	const routePaths = new Set(routes.map((route) => route.routePath));
	const missingRouteFailures = REQUIRED_RELEASE_ROUTES.filter(
		(routePath) => !routePaths.has(routePath),
	).map(
		(routePath) => `required release route missing from build: ${routePath}`,
	);
	const failures = [...routeFailures, ...missingRouteFailures];

	return {
		passed: failures.length === 0,
		failures,
	};
}

export function bundleBudgetDryRunPlan({
	distDir = DEFAULT_DIST_DIR,
	summaryPath = DEFAULT_SUMMARY_PATH,
} = {}) {
	return {
		distDir,
		summaryPath,
		limits: BUNDLE_BUDGET_LIMITS,
		requiredRoutes: REQUIRED_RELEASE_ROUTES,
		routeSource: `${distDir}/**/*.html`,
		measuredAssets: "same-origin executable script assets referenced by routes",
		ignoredScriptTypes: [
			"application/ld+json",
			"application/json",
			"importmap",
		],
	};
}

async function findFiles(root, predicate) {
	const entries = await readdir(root, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const path = join(root, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await findFiles(path, predicate)));
			continue;
		}
		if (predicate(path)) {
			files.push(path);
		}
	}

	return files;
}

function routePathFromHtmlPath(distDir, htmlPath) {
	const relativePath = relative(distDir, htmlPath).split(sep).join("/");
	if (relativePath === "index.html") {
		return "/";
	}
	if (relativePath.endsWith("/index.html")) {
		return `/${relativePath.slice(0, -"/index.html".length)}/`;
	}
	return `/${relativePath}`;
}

async function buildAssetSizeMap(distDir) {
	const files = await findFiles(distDir, (path) => !path.endsWith(".html"));
	const entries = await Promise.all(
		files.map(async (path) => {
			const publicPath = `/${relative(distDir, path).split(sep).join("/")}`;
			return [publicPath, (await stat(path)).size];
		}),
	);
	return new Map(entries);
}

export async function analyzeDistBundle({
	distDir = DEFAULT_DIST_DIR,
	summaryPath = DEFAULT_SUMMARY_PATH,
} = {}) {
	const assetSizes = await buildAssetSizeMap(distDir);
	const htmlFiles = await findFiles(distDir, (path) => path.endsWith(".html"));
	const routes = await Promise.all(
		htmlFiles.map(async (htmlPath) =>
			analyzeHtmlForCriticalJavaScript({
				html: await readFile(htmlPath, "utf8"),
				routePath: routePathFromHtmlPath(distDir, htmlPath),
				assetSizes,
			}),
		),
	);
	routes.sort((left, right) => left.routePath.localeCompare(right.routePath));

	const result = evaluateBundleBudget(routes);
	const summary = {
		limits: BUNDLE_BUDGET_LIMITS,
		requiredRoutes: REQUIRED_RELEASE_ROUTES,
		routes,
		failures: result.failures,
	};

	await mkdir(dirname(summaryPath), { recursive: true });
	await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

	return { ...result, summaryPath, routes };
}

function parseCliOptions(args) {
	return {
		dryRun: args.includes("--dry-run"),
		distDir:
			args.find((arg) => arg.startsWith("--dist="))?.slice("--dist=".length) ??
			DEFAULT_DIST_DIR,
		summaryPath:
			args
				.find((arg) => arg.startsWith("--summary="))
				?.slice("--summary=".length) ?? DEFAULT_SUMMARY_PATH,
	};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const options = parseCliOptions(process.argv.slice(2));

	if (options.dryRun) {
		console.log(JSON.stringify(bundleBudgetDryRunPlan(options), null, 2));
		process.exit(0);
	}

	analyzeDistBundle(options)
		.then((result) => {
			for (const route of result.routes) {
				console.log(
					`${route.routePath} critical-js=${route.criticalJavaScriptBytes}B inline=${route.inlineScriptCount} external=${route.externalScriptCount}`,
				);
			}

			if (!result.passed) {
				throw new Error(
					`Bundle budget failures:\n${result.failures.join("\n")}\nSummary: ${result.summaryPath}`,
				);
			}

			console.log(`Bundle budget passed. Summary: ${result.summaryPath}`);
		})
		.catch((error) => {
			console.error(error.message);
			process.exit(1);
		});
}
