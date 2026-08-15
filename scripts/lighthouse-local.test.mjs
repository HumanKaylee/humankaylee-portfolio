import assert from "node:assert/strict";
import { createServer } from "node:net";
import { describe, it } from "node:test";

import {
	LIGHTHOUSE_AUDIT_PLAN,
	LIGHTHOUSE_CATEGORIES,
	LIGHTHOUSE_METRIC_THRESHOLDS,
	LIGHTHOUSE_ROUTES,
	LIGHTHOUSE_THRESHOLDS,
	LIGHTHOUSE_WARMUP_ROUTE,
	canUseReportAfterWindowsCleanupError,
	ensurePreviewPortAvailable,
	lighthouseDryRunPlan,
	pnpmInvocation,
	previewInvocation,
	runAuditPlan,
	thresholdFailures,
} from "./lighthouse-local.mjs";

describe("lighthouse local gate contract", () => {
	it("covers the PRD core launch routes", () => {
		assert.deepEqual(
			LIGHTHOUSE_ROUTES.map((route) => route.path),
			["/", "/work/", "/work/cryo-flow-sim/", "/resume/", "/contact/"],
		);
	});

	it("uses the PRD category thresholds", () => {
		assert.deepEqual(LIGHTHOUSE_CATEGORIES, [
			"performance",
			"accessibility",
			"best-practices",
			"seo",
		]);
		assert.deepEqual(LIGHTHOUSE_THRESHOLDS, {
			performance: 0.9,
			accessibility: 0.95,
			"best-practices": 0.95,
			seo: 0.95,
		});
		assert.deepEqual(LIGHTHOUSE_METRIC_THRESHOLDS, {
			homeLargestContentfulPaintMs: 2500,
		});
	});

	it("fails a homepage mobile LCP at or above 2.5 seconds", () => {
		const failures = thresholdFailures([
			{
				label: "home",
				path: "/",
				scores: Object.fromEntries(
					LIGHTHOUSE_CATEGORIES.map((category) => [category, 1]),
				),
				metrics: { largestContentfulPaintMs: 2500 },
			},
		]);

		assert.ok(failures.some((failure) => failure.includes("LCP")));
		assert.ok(failures.some((failure) => failure.includes("2500")));
	});

	it("runs pnpm through Corepack without a Windows command shell", () => {
		assert.deepEqual(
			pnpmInvocation("win32", "C:\\Program Files\\nodejs\\node.exe"),
			{
				command: "C:\\Program Files\\nodejs\\node.exe",
				args: [
					"C:\\Program Files\\nodejs\\node_modules\\corepack\\dist\\pnpm.js",
				],
			},
		);
		assert.deepEqual(pnpmInvocation("linux", "/usr/bin/node"), {
			command: "pnpm",
			args: [],
		});
	});

	it("starts Astro directly and rejects an occupied preview port", async () => {
		assert.deepEqual(
			previewInvocation(
				"127.0.0.1",
				4322,
				"C:\\Program Files\\nodejs\\node.exe",
				"C:\\repo\\node_modules\\astro\\bin\\astro.mjs",
			),
			{
				command: "C:\\Program Files\\nodejs\\node.exe",
				args: [
					"C:\\repo\\node_modules\\astro\\bin\\astro.mjs",
					"preview",
					"--host",
					"127.0.0.1",
					"--port",
					"4322",
				],
			},
		);

		const listener = createServer();
		await new Promise((resolve, reject) => {
			listener.once("error", reject);
			listener.listen(0, "127.0.0.1", resolve);
		});
		const address = listener.address();
		assert.ok(address && typeof address === "object");
		try {
			await assert.rejects(
				ensurePreviewPortAvailable("127.0.0.1", address.port),
				/preview port .* is already in use/i,
			);
		} finally {
			await new Promise((resolve, reject) =>
				listener.close((error) => (error ? reject(error) : resolve())),
			);
		}
	});

	it("uses a complete report only when Windows Chrome cleanup is the sole CLI error", () => {
		const report = {
			categories: Object.fromEntries(
				LIGHTHOUSE_CATEGORIES.map((category) => [category, { score: 1 }]),
			),
			audits: {
				"largest-contentful-paint": { numericValue: 800 },
			},
		};
		const cleanupError = String.raw`Runtime error encountered: EPERM, Permission denied: \\?\C:\Users\joe\AppData\Local\Temp\lighthouse.12345678`;

		assert.equal(
			canUseReportAfterWindowsCleanupError({
				platform: "win32",
				exitCode: 1,
				output: cleanupError,
				report,
			}),
			true,
		);
		assert.equal(
			canUseReportAfterWindowsCleanupError({
				platform: "linux",
				exitCode: 1,
				output: cleanupError,
				report,
			}),
			false,
		);
		assert.equal(
			canUseReportAfterWindowsCleanupError({
				platform: "win32",
				exitCode: 1,
				output: "Lighthouse threshold or navigation failure",
				report,
			}),
			false,
		);
		assert.equal(
			canUseReportAfterWindowsCleanupError({
				platform: "win32",
				exitCode: 1,
				output: cleanupError,
				report: { categories: {}, audits: {} },
			}),
			false,
		);
	});

	it("warms up the preview before scored audits", () => {
		assert.deepEqual(LIGHTHOUSE_WARMUP_ROUTE, {
			label: "warmup",
			path: "/",
			scored: false,
		});
		assert.ok(
			!LIGHTHOUSE_ROUTES.some((route) => route.label === "warmup"),
			"warm-up route should not be included in the scored route summary",
		);
	});

	it("keeps the warm-up first and out of the scored audit summary", () => {
		assert.deepEqual(
			LIGHTHOUSE_AUDIT_PLAN.map((route) => ({
				label: route.label,
				path: route.path,
				scored: route.scored,
			})),
			[
				{ label: "warmup", path: "/", scored: false },
				...LIGHTHOUSE_ROUTES.map((route) => ({
					label: route.label,
					path: route.path,
					scored: true,
				})),
			],
		);
	});

	it("executes the warm-up first while returning only scored route results", async () => {
		const executedRoutes = [];
		const results = await runAuditPlan(
			"http://127.0.0.1:4322",
			async (baseUrl, route) => {
				executedRoutes.push(`${baseUrl}${route.path}:${route.label}`);
				return {
					label: route.label,
					path: route.path,
					outputPath: `test-results/lighthouse-${route.label}.json`,
					scores: Object.fromEntries(
						LIGHTHOUSE_CATEGORIES.map((category) => [category, 1]),
					),
				};
			},
		);

		assert.deepEqual(executedRoutes, [
			"http://127.0.0.1:4322/:warmup",
			...LIGHTHOUSE_ROUTES.map(
				(route) => `http://127.0.0.1:4322${route.path}:${route.label}`,
			),
		]);
		assert.deepEqual(
			results.map((result) => result.label),
			LIGHTHOUSE_ROUTES.map((route) => route.label),
		);
	});

	it("exposes dry-run audit artifacts for cheap B-050 verification", () => {
		const plan = lighthouseDryRunPlan("http://127.0.0.1:4322");

		assert.deepEqual(plan.auditPlan, [
			{
				label: "warmup",
				path: "/",
				scored: false,
				outputPath: "test-results/lighthouse-warmup.json",
			},
			...LIGHTHOUSE_ROUTES.map((route) => ({
				...route,
				scored: true,
				outputPath: `test-results/lighthouse-${route.label}.json`,
			})),
		]);
		assert.deepEqual(plan.routes, LIGHTHOUSE_ROUTES);
		assert.deepEqual(plan.scoredRoutes, LIGHTHOUSE_ROUTES);
		assert.equal(plan.summaryPath, "test-results/lighthouse-summary.json");
		assert.deepEqual(plan.categories, LIGHTHOUSE_CATEGORIES);
		assert.deepEqual(plan.thresholds, LIGHTHOUSE_THRESHOLDS);
		assert.deepEqual(plan.metricThresholds, LIGHTHOUSE_METRIC_THRESHOLDS);
	});
});
