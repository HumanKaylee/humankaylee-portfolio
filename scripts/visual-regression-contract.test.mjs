import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	backlog: "docs/BACKLOG.md",
	ci: ".github/workflows/phase-0-ci.yml",
	playwrightConfig: "playwright.config.ts",
	visualSpec: "tests/e2e/visual-regression.spec.ts",
	packageConfig: "package.json",
	runbook: "runbooks/VISUAL_REGRESSION.md",
	tsconfig: "tsconfig.json",
};

function readRequiredFile(path) {
	assert.ok(existsSync(path), `missing required file: ${path}`);
	const content = readFileSync(path, "utf8");
	assert.ok(content.trim().length > 0, `empty required file: ${path}`);
	return content;
}

function expectContains(content, needle, label = needle) {
	assert.ok(content.includes(needle), `expected content to include ${label}`);
}

test("B-037 visual regression spec exists and backlog tracks the task", () => {
	const backlog = readRequiredFile(files.backlog);
	const runbook = readRequiredFile(files.runbook);
	const ci = readRequiredFile(files.ci);
	const playwrightConfig = readRequiredFile(files.playwrightConfig);
	const tsconfig = readRequiredFile(files.tsconfig);

	expectContains(backlog, "### B-037: Add visual regression snapshots");
	const packageConfig = readRequiredFile(files.packageConfig);
	assert.ok(
		existsSync(files.visualSpec),
		`missing required file: ${files.visualSpec}`,
	);
	expectContains(
		runbook,
		"Status: implementation evidence only; not production launch evidence",
		"visual evidence boundary",
	);
	expectContains(packageConfig, '"test:visual"', "test:visual package script");
	expectContains(runbook, "pnpm test:visual:update");
	expectContains(
		runbook,
		"node --test scripts/visual-regression-contract.test.mjs",
	);
	expectContains(packageConfig, "playwright.visual.config.ts");
	expectContains(tsconfig, '"playwright.visual.config.ts"');
	expectContains(ci, "Run visual regression gate");
	expectContains(ci, "pnpm test:visual");
	expectContains(runbook, "Run visual regression gate");
	expectContains(runbook, "notes");
	expectContains(runbook, "/notes/");
	const visualSpec = readRequiredFile(files.visualSpec);
	for (const [label, path] of [
		["home", "/"],
		["work", "/work/"],
		["work-cryo", "/work/cryo-flow-sim/"],
		["work-cli-fleet", "/work/cli-fleet-synchronization-and-mcp-rollout/"],
		[
			"work-remote-recovery",
			"/work/remote-workstation-recovery-and-operational-debugging/",
		],
		["about", "/about/"],
		["resume", "/resume/"],
		["contact", "/contact/"],
		["notes", "/notes/"],
	]) {
		expectContains(visualSpec, `label: "${label}"`);
		expectContains(visualSpec, `path: "${path}"`);
	}
	expectContains(playwrightConfig, "testIgnore");
	expectContains(playwrightConfig, "visual-regression.spec.ts");
	assert.ok(
		existsSync(files.runbook),
		`missing required file: ${files.runbook}`,
	);
});
