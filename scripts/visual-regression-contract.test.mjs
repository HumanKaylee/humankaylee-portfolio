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

const snapshotDirectory = "tests/e2e/visual-regression.spec.ts-snapshots";

const expectedVisualRoutes = [
	["home", "/"],
	["work", "/work/"],
	["work-cryo", "/work/cryo-flow-sim/"],
	["work-conformal-cooling", "/work/conformal-cooling-channel-generation/"],
	["work-cli-fleet", "/work/cli-fleet-synchronization-and-mcp-rollout/"],
	[
		"work-remote-recovery",
		"/work/remote-workstation-recovery-and-operational-debugging/",
	],
	["work-black-scholes", "/work/black-scholes-wasm/"],
	["about", "/about/"],
	["resume", "/resume/"],
	["contact", "/contact/"],
	["notes", "/notes/"],
];

function readRequiredFile(path) {
	assert.ok(existsSync(path), `missing required file: ${path}`);
	const content = readFileSync(path, "utf8");
	assert.ok(content.trim().length > 0, `empty required file: ${path}`);
	return content;
}

function expectContains(content, needle, label = needle) {
	assert.ok(
		content.replace(/\s+/g, " ").includes(needle.replace(/\s+/g, " ")),
		`expected content to include ${label}`,
	);
}

function visualSpecRoutes(source) {
	const matrix = source.match(
		/const visualRoutes = \[([\s\S]*?)\] as const;/,
	)?.[1];
	assert.ok(matrix, "visual spec must expose visualRoutes");
	return [
		...matrix.matchAll(/label:\s*"([^"]+)"[\s\S]*?path:\s*"([^"]+)"/g),
	].map(([, label, path]) => [label, path]);
}

function documentedVisualRoutes(source) {
	const section = source.match(
		/## Route And Snapshot Matrix([\s\S]*?)(?:\n## |$)/,
	)?.[1];
	assert.ok(section, "visual runbook must expose a route and snapshot matrix");
	return [...section.matchAll(/\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|/g)].map(
		([, label, path]) => [label, path],
	);
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
		["work-conformal-cooling", "/work/conformal-cooling-channel-generation/"],
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

test("B-037 runbook and executable visual matrix cover every current Signal / Proof surface", () => {
	const runbook = readRequiredFile(files.runbook);
	const visualSpec = readRequiredFile(files.visualSpec);

	assert.deepEqual(visualSpecRoutes(visualSpec), expectedVisualRoutes);
	assert.deepEqual(documentedVisualRoutes(runbook), expectedVisualRoutes);
	assert.match(runbook, /Windows[\s\S]*Linux/i);
	assert.match(
		runbook,
		/Black-Scholes[\s\S]*initialized|initialized[\s\S]*Black-Scholes/i,
	);
	assert.doesNotMatch(
		runbook,
		/Project index|representative case study|API-offline|telemetry panel|how-the-portfolio-stays-useful/i,
	);
});

test("B-037 visual route matrix has paired Linux and Windows baselines at every viewport", () => {
	const visualSpec = readRequiredFile(files.visualSpec);
	const missingBaselines = [];

	for (const [label] of visualSpecRoutes(visualSpec)) {
		for (const viewport of ["desktop", "mobile"]) {
			for (const platform of ["linux", "win32"]) {
				const snapshot = `${snapshotDirectory}/${label}-${viewport}-${platform}.png`;
				if (!existsSync(snapshot)) {
					missingBaselines.push(
						`${platform} ${label} ${viewport}: ${snapshot}`,
					);
				}
			}
		}
	}

	assert.deepEqual(missingBaselines, [], "missing visual baselines");
});
