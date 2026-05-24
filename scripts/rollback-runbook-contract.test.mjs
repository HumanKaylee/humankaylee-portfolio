import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	backlog: "docs/BACKLOG.md",
	deployment: "runbooks/DEPLOYMENT.md",
	evidence: "runbooks/LAUNCH_EVIDENCE.md",
	operations: "docs/OPERATIONS.md",
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

function expectNotContains(content, needle, label = needle) {
	assert.ok(
		!normalize(content).includes(normalize(needle)),
		`expected content not to include ${label}`,
	);
}

function expectAll(content, needles) {
	for (const needle of needles) {
		expectContains(content, needle);
	}
}

function expectNoExampleOriginCommands(content, label) {
	assert.doesNotMatch(
		content,
		/https:\/\/(?:www\.)?example\.com|https:\/\/api\.example\.com/,
		`${label} should use shell variables or angle-bracket placeholders instead of runnable example.com origins`,
	);
}

test("deployment and operations runbooks cover B-062 rollback and incident requirements", () => {
	const backlog = readRequiredFile(files.backlog);
	const deployment = readRequiredFile(files.deployment);
	const operations = readRequiredFile(files.operations);
	const evidence = readRequiredFile(files.evidence);

	expectAll(backlog, [
		"### B-062: Write rollback and incident runbook",
		"scripts/rollback-runbook-contract.test.mjs",
		"rollback and incident runbook coverage",
	]);

	expectAll(deployment, [
		"### 4.4 Frontend Rollback",
		"pnpm exec wrangler pages deployment list",
		"--environment production",
		"preview deployments are not rollback targets",
		"### 5.4 Legacy Shuttle Rollback",
		'shuttle deployment redeploy "$KNOWN_GOOD_SHUTTLE_DEPLOYMENT_ID"',
		"### 6.2 Rollback",
		'fly releases --app "$FLY_APP"',
		'fly deploy --app "$FLY_APP" --config fly.toml --image "$KNOWN_GOOD_IMAGE"',
		"### 7.2 Rollback",
		"railway deployment list",
		"railway status --json",
		"## 8. Domain, DNS, TLS, And Cache",
		"Custom domains",
		"CAA records",
		"<project>.pages.dev",
		"## 10. Rollback And Incident Dry Run",
		"FRONTEND_ROLLBACK_TARGET",
		"API_ROLLBACK_TARGET",
		"HK_API_CONTACT_DELIVERY_MODE=disabled",
		'export PUBLIC_API_BASE_URL=""',
		"Provider console or CLI: set `HK_API_CONTACT_DELIVERY_MODE=disabled`",
		'xh -h "$FRONTEND_ORIGIN/"',
		'xh -h "$FRONTEND_ORIGIN/contact/"',
		'xh "$API_ORIGIN/api/health"',
		"Record command, target, date, exit status, deployment ID, rollback target, and result",
	]);
	expectNotContains(
		deployment.match(/## 10\. Rollback And Incident Dry Run[\s\S]*$/)?.[0] ??
			"",
		'shuttle deployment redeploy "$KNOWN_GOOD_SHUTTLE_DEPLOYMENT_ID"',
		"mutating Shuttle rollback command in dry-run section",
	);
	expectNotContains(
		deployment.match(/## 10\. Rollback And Incident Dry Run[\s\S]*$/)?.[0] ??
			"",
		'fly deploy --app "$FLY_APP" --config fly.toml --image "$KNOWN_GOOD_IMAGE"',
		"mutating Fly rollback command in dry-run section",
	);

	expectAll(operations, [
		"## 10. Incident Response",
		"### 10.2 General Incident Steps",
		"Restore the static recruiter fast path first",
		"Verify home, resume, projects, and contact fallback",
		"### 10.4 API Down",
		"Confirm frontend still serves static content",
		"### 10.5 Contact Form Failing",
		"Keep mailto fallback visible",
		"DNS or TLS broken",
		"## 11. Rollback Runbook",
		"### 11.1 Frontend Rollback",
		"### 11.2 Backend Rollback",
		"### 11.4 Recovery Verification Record",
		"deployment ID",
		"rollback target",
		"Smoke-check command",
		"follow-up action",
	]);

	expectAll(evidence, [
		"Rollback runbook dry-run contract",
		"node --test scripts/rollback-runbook-contract.test.mjs",
		"Production rollback targets remain blocked",
	]);
});

test("deployment and operations docs do not ship runnable example origins", () => {
	const deployment = readRequiredFile(files.deployment);
	const operations = readRequiredFile(files.operations);

	expectNoExampleOriginCommands(deployment, files.deployment);
	expectNoExampleOriginCommands(operations, files.operations);
	expectContains(deployment, 'FRONTEND_ORIGIN="<https-frontend-origin>"');
	expectContains(deployment, 'API_ORIGIN="<https-api-origin>"');
	expectContains(operations, 'FRONTEND_ORIGIN="<https-frontend-origin>"');
	expectContains(operations, 'API_ORIGIN="<https-api-origin>"');
});
