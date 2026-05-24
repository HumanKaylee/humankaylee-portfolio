import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	LIGHTHOUSE_AUDIT_PLAN,
	LIGHTHOUSE_CATEGORIES,
	LIGHTHOUSE_ROUTES,
	LIGHTHOUSE_THRESHOLDS,
	LIGHTHOUSE_WARMUP_ROUTE,
	runAuditPlan,
} from "./lighthouse-local.mjs";

describe("lighthouse local gate contract", () => {
	it("covers the PRD core launch routes", () => {
		assert.deepEqual(
			LIGHTHOUSE_ROUTES.map((route) => route.path),
			[
				"/",
				"/projects/",
				"/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
				"/resume/",
				"/contact/",
			],
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
});
