import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	BUNDLE_BUDGET_LIMITS,
	analyzeHtmlForCriticalJavaScript,
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
});
