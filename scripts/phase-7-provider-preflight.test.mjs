import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
	PHASE_7_PROVIDER_PREFLIGHT_BLOCKERS,
	PHASE_7_PROVIDER_PREFLIGHT_SAFE_SKIPS,
	evaluateProviderPreflight,
	phase7ProviderPreflightPlan,
} from "./phase-7-provider-preflight.mjs";

describe("Phase 7 provider preflight", () => {
	it("classifies missing provider auth and targets without clearing launch blockers", () => {
		const result = evaluateProviderPreflight({
			commandAvailability: {
				wrangler: false,
				fly: false,
				railway: false,
			},
			env: {},
			timestamp: "2026-05-25T18:40:00.000Z",
		});

		assert.equal(result.status, "blocked");
		assert.equal(result.evidenceAuthority, "local/preflight");
		assert.equal(result.canDeploy, false);
		assert.deepEqual(result.productionBlockers, [
			...PHASE_7_PROVIDER_PREFLIGHT_BLOCKERS,
		]);
		assert.deepEqual(result.safeSkippedActions, [
			...PHASE_7_PROVIDER_PREFLIGHT_SAFE_SKIPS,
		]);
		assert.deepEqual(result.commands, {
			wrangler: "missing",
			fly: "missing",
			railway: "missing",
		});
		assert.deepEqual(result.presentEnvNames, []);
		assert.deepEqual(result.missingEnvNames, [
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
		]);
	});

	it("reports only environment names, never secret values", () => {
		const result = evaluateProviderPreflight({
			commandAvailability: {
				wrangler: true,
				fly: false,
				railway: false,
			},
			env: {
				CLOUDFLARE_API_TOKEN: "super-secret-token",
				CLOUDFLARE_ACCOUNT_ID: "sensitive-account-id",
				PUBLIC_SITE_URL: "https://portfolio.example.invalid",
			},
			timestamp: "2026-05-25T18:40:00.000Z",
		});

		const serialized = JSON.stringify(result);
		assert.deepEqual(result.presentEnvNames, [
			"CLOUDFLARE_API_TOKEN",
			"CLOUDFLARE_ACCOUNT_ID",
			"PUBLIC_SITE_URL",
		]);
		assert.equal(serialized.includes("super-secret-token"), false);
		assert.equal(serialized.includes("sensitive-account-id"), false);
		assert.equal(serialized.includes("portfolio.example.invalid"), false);
	});

	it("exposes a dry-run plan without writing a summary", () => {
		const workspace = mkdtempSync(join(tmpdir(), "phase-7-provider-plan-"));
		const summaryPath = join(workspace, "summary.json");

		try {
			const result = spawnSync(
				process.execPath,
				[
					"scripts/phase-7-provider-preflight.mjs",
					"--dry-run",
					"--summary",
					summaryPath,
				],
				{ encoding: "utf8" },
			);

			assert.equal(result.status, 0, result.stderr);
			assert.equal(existsSync(summaryPath), false);

			const plan = JSON.parse(result.stdout);
			assert.deepEqual(plan, phase7ProviderPreflightPlan(summaryPath));
		} finally {
			rmSync(workspace, { force: true, recursive: true });
		}
	});

	it("writes a public-safe summary when requested", async () => {
		const workspace = mkdtempSync(join(tmpdir(), "phase-7-provider-summary-"));
		const summaryPath = join(workspace, "summary.json");

		try {
			const result = spawnSync(
				process.execPath,
				["scripts/phase-7-provider-preflight.mjs", "--summary", summaryPath],
				{
					encoding: "utf8",
					env: {
						PATH: "",
						CLOUDFLARE_API_TOKEN: "do-not-print",
					},
				},
			);

			assert.equal(result.status, 0, result.stderr);
			assert.equal(existsSync(summaryPath), true);

			const summary = JSON.parse(await readFile(summaryPath, "utf8"));
			assert.equal(summary.status, "blocked");
			assert.deepEqual(summary.commands, {
				wrangler: "missing",
				fly: "missing",
				railway: "missing",
			});
			assert.deepEqual(summary.presentEnvNames, ["CLOUDFLARE_API_TOKEN"]);
			assert.equal(JSON.stringify(summary).includes("do-not-print"), false);
		} finally {
			rmSync(workspace, { force: true, recursive: true });
		}
	});
});
