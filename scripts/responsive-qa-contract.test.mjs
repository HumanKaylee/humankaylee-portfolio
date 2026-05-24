import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	backlog: "docs/BACKLOG.md",
	evidence: "runbooks/LAUNCH_EVIDENCE.md",
	runbook: "runbooks/CROSS_BROWSER_RESPONSIVE_QA.md",
	spec: "tests/e2e/responsive-cross-browser.spec.ts",
	workflow: ".github/workflows/phase-0-ci.yml",
};

function readRequiredFile(path) {
	assert.ok(existsSync(path), `missing required file: ${path}`);

	const content = readFileSync(path, "utf8");
	assert.ok(content.trim().length > 0, `empty required file: ${path}`);
	return content;
}

function normalize(content) {
	return content.replace(/\s+/g, " ");
}

function expectContains(content, needle, label = needle) {
	assert.ok(
		normalize(content).includes(normalize(needle)),
		`expected content to include ${label}`,
	);
}

test("B-055 responsive QA artifacts cover browser and viewport launch criteria", () => {
	const backlog = readRequiredFile(files.backlog);
	const evidence = readRequiredFile(files.evidence);
	const runbook = readRequiredFile(files.runbook);
	const spec = readRequiredFile(files.spec);
	const workflow = readRequiredFile(files.workflow);

	expectContains(
		backlog,
		"### B-055: Add cross-browser and responsive QA pass",
	);
	expectContains(backlog, "runbooks/CROSS_BROWSER_RESPONSIVE_QA.md");
	expectContains(backlog, "tests/e2e/responsive-cross-browser.spec.ts");
	expectContains(backlog, "scripts/responsive-qa-contract.test.mjs");

	expectContains(runbook, "# Cross-Browser And Responsive QA Runbook");
	expectContains(runbook, "Chromium");
	expectContains(runbook, "Firefox");
	expectContains(runbook, "WebKit");
	expectContains(runbook, "mobile");
	expectContains(runbook, "tablet");
	expectContains(runbook, "desktop");
	expectContains(runbook, "notes/build-log");
	expectContains(runbook, "/notes/");
	expectContains(
		runbook,
		"/notes/how-the-portfolio-stays-useful-when-the-api-is-offline/",
	);
	expectContains(runbook, "LinkedIn in-app mobile");
	expectContains(runbook, "launch blocker");
	expectContains(runbook, "polish");
	expectContains(runbook, "post-launch");
	expectContains(runbook, 'pnpm test:e2e -- --grep "@responsive"');
	expectContains(
		runbook,
		'pnpm test:e2e -- --grep "@responsive" --browser=all',
	);

	expectContains(spec, "@responsive");
	expectContains(spec, "LinkedIn in-app mobile");
	expectContains(spec, "tablet");
	expectContains(spec, "desktop");
	expectContains(spec, "browserName");
	expectContains(spec, "horizontal overflow");
	expectContains(spec, "resume");
	expectContains(spec, "/notes/");
	expectContains(
		spec,
		"/notes/how-the-portfolio-stays-useful-when-the-api-is-offline/",
	);
	expectContains(spec, "contact");

	expectContains(
		workflow,
		"Run responsive browser/device gate",
		"responsive CI gate name",
	);
	expectContains(
		workflow,
		'pnpm test:e2e -- --grep "@responsive" --browser=all',
		"responsive CI gate command",
	);
	expectContains(
		workflow,
		"pnpm exec playwright install --with-deps chromium firefox webkit",
		"CI installs B-055 browsers",
	);

	expectContains(evidence, "Cross-browser responsive QA");
	expectContains(evidence, "runbooks/CROSS_BROWSER_RESPONSIVE_QA.md");
	expectContains(evidence, "tests/e2e/responsive-cross-browser.spec.ts");
});
