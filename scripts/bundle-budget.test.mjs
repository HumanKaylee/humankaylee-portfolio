import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
	BUNDLE_BUDGET_LIMITS,
	REQUIRED_RELEASE_ROUTES,
	analyzeHtmlForCriticalJavaScript,
	bundleBudgetDryRunPlan,
	evaluateBundleBudget,
} from "./bundle-budget.mjs";

describe("bundle budget gate", () => {
	it("ignores JSON-LD and counts inline module scripts as critical JavaScript", () => {
		const result = analyzeHtmlForCriticalJavaScript({
			html: `
				<html>
					<head>
						<script type="application/ld+json">{"@context":"https://schema.org"}</script>
						<script type="module">console.log("critical");</script>
					</head>
				</html>
			`,
			routePath: "/",
		});

		assert.equal(result.routePath, "/");
		assert.equal(result.inlineScriptCount, 1);
		assert.equal(result.externalScriptCount, 0);
		assert.equal(
			result.criticalJavaScriptBytes,
			'console.log("critical");'.length,
		);
	});

	it("adds same-origin Astro script asset sizes to the route budget", () => {
		const result = analyzeHtmlForCriticalJavaScript({
			html: '<script type="module" src="/_astro/client.abc123.js"></script>',
			routePath: "/contact/",
			assetSizes: new Map([["/_astro/client.abc123.js", 4096]]),
		});

		assert.equal(result.externalScriptCount, 1);
		assert.equal(result.criticalJavaScriptBytes, 4096);
		assert.deepEqual(result.externalScripts, ["/_astro/client.abc123.js"]);
	});

	it("fails when one route exceeds the critical JavaScript budget", () => {
		const oversizedRoute = {
			routePath: "/contact/",
			inlineScriptCount: 1,
			externalScriptCount: 0,
			externalScripts: [],
			criticalJavaScriptBytes:
				BUNDLE_BUDGET_LIMITS.maxCriticalJavaScriptBytesPerRoute + 1,
		};

		const result = evaluateBundleBudget([oversizedRoute]);

		assert.equal(result.passed, false);
		assert.match(result.failures[0], /\/contact\//);
		assert.match(result.failures[0], /critical JavaScript/);
	});

	it("rejects a stale build that is missing the canonical Signal / Proof routes", () => {
		const result = evaluateBundleBudget([
			{
				routePath: "/",
				inlineScriptCount: 0,
				externalScriptCount: 0,
				externalScripts: [],
				criticalJavaScriptBytes: 0,
			},
		]);

		assert.equal(result.passed, false);
		assert.ok(result.failures.some((failure) => failure.includes("/work/")));
		assert.ok(result.failures.some((failure) => failure.includes("missing")));
	});

	it("rejects a build that omits the Black-Scholes WASM detail route", () => {
		const routesWithoutBlackScholes = [
			"/",
			"/about/",
			"/contact/",
			"/notes/",
			"/resume/",
			"/work/",
			"/work/cli-fleet-synchronization-and-mcp-rollout/",
			"/work/cryo-flow-sim/",
			"/work/remote-workstation-recovery-and-operational-debugging/",
		].map((routePath) => ({
			routePath,
			inlineScriptCount: 0,
			externalScriptCount: 0,
			externalScripts: [],
			criticalJavaScriptBytes: 0,
		}));

		const result = evaluateBundleBudget(routesWithoutBlackScholes);

		assert.equal(result.passed, false);
		assert.ok(
			result.failures.includes(
				"required release route missing from build: /work/black-scholes-wasm/",
			),
		);
	});

	it("exposes a dry-run plan before build artifacts exist", () => {
		assert.deepEqual(bundleBudgetDryRunPlan(), {
			distDir: "dist",
			summaryPath: "test-results/bundle-budget-summary.json",
			limits: BUNDLE_BUDGET_LIMITS,
			requiredRoutes: REQUIRED_RELEASE_ROUTES,
			routeSource: "dist/**/*.html",
			measuredAssets:
				"same-origin executable script assets referenced by routes",
			ignoredScriptTypes: [
				"application/ld+json",
				"application/json",
				"importmap",
			],
		});
	});

	it("keeps CLI dry-run independent from build artifacts and summary writes", () => {
		const workspace = mkdtempSync(join(tmpdir(), "bundle-budget-dry-run-"));
		const missingDistDir = join(workspace, "missing-dist");
		const summaryPath = join(workspace, "summary.json");

		try {
			const result = spawnSync(
				process.execPath,
				[
					"scripts/bundle-budget.mjs",
					"--dry-run",
					`--dist=${missingDistDir}`,
					`--summary=${summaryPath}`,
				],
				{ encoding: "utf8" },
			);

			assert.equal(result.status, 0, result.stderr);
			assert.equal(existsSync(summaryPath), false);

			const plan = JSON.parse(result.stdout);
			assert.equal(plan.distDir, missingDistDir);
			assert.equal(plan.summaryPath, summaryPath);
			assert.equal(plan.routeSource, `${missingDistDir}/**/*.html`);
			assert.deepEqual(plan.limits, BUNDLE_BUDGET_LIMITS);
		} finally {
			rmSync(workspace, { force: true, recursive: true });
		}
	});
});
