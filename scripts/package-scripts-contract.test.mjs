import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

test("package scripts cover the Phase 1 frontend scaffold contract", () => {
	const scripts = packageJson.scripts ?? {};

	for (const scriptName of [
		"dev",
		"build",
		"preview",
		"check",
		"format",
		"lint",
		"test",
	]) {
		assert.ok(
			scripts[scriptName],
			`expected package.json to define a ${scriptName} script`,
		);
	}

	assert.equal(
		scripts.dev,
		"astro dev --host 127.0.0.1 --port 4321",
		"dev script should use the documented local frontend host and port",
	);
	assert.equal(
		scripts.check,
		"pnpm typecheck",
		"check script should route to the existing Astro and TypeScript checks",
	);
	assert.equal(
		scripts["phase7:provider-preflight"],
		"node scripts/phase-7-provider-preflight.mjs",
		"phase7 provider preflight should run the safe local provider readiness check",
	);
	assert.ok(
		packageJson.devDependencies?.wrangler,
		"wrangler should be a repo-managed dev dependency for Cloudflare Pages local readiness",
	);
	assert.match(
		scripts.format,
		/^biome format --write /,
		"format script should run Biome formatting on the tracked frontend/tooling surface",
	);
});
