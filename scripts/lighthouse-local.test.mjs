import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	LIGHTHOUSE_CATEGORIES,
	LIGHTHOUSE_ROUTES,
	LIGHTHOUSE_THRESHOLDS,
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
});
