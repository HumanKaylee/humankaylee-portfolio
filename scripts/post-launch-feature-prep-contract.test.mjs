import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	architecture: "docs/ARCHITECTURE.md",
	assistantDecision: "docs/ASSISTANT_SCOPE_DECISION.md",
	backlog: "docs/BACKLOG.md",
	blockers: "runbooks/LAUNCH_BLOCKERS_REGISTER.md",
	changelog: "docs/CHANGELOG.md",
	deployment: "runbooks/DEPLOYMENT.md",
	githubSync: "docs/GITHUB_SYNC.md",
	implementationPlan: "docs/IMPLEMENTATION_AND_TEST_PLAN.md",
	operations: "docs/OPERATIONS.md",
	readme: "README.md",
	research: "docs/RESEARCH.md",
	roadmap: "docs/ROADMAP.md",
	runbook: "runbooks/POST_LAUNCH_FEATURE_PREP.md",
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

function markdownRows(content) {
	return content
		.split("\n")
		.filter((line) => line.trim().startsWith("|"))
		.map((line) =>
			line
				.trim()
				.slice(1, -1)
				.split("|")
				.map((cell) => cell.trim()),
		)
		.filter((cells) => !cells.every((cell) => /^-+$/.test(cell)));
}

function expectTableRow(content, firstCell, expectedCells) {
	const row = markdownRows(content).find((cells) => cells[0] === firstCell);
	assert.ok(row, `expected table row for ${firstCell}`);

	for (const expectedCell of expectedCells) {
		assert.ok(
			row.some((cell) => normalize(cell).includes(normalize(expectedCell))),
			`expected ${firstCell} row to include ${expectedCell}`,
		);
	}
}

test("Phase 8 post-launch feature prep is documented without authorizing blocked work", () => {
	const architecture = readRequiredFile(files.architecture);
	const assistantDecision = readRequiredFile(files.assistantDecision);
	const backlog = readRequiredFile(files.backlog);
	const blockers = readRequiredFile(files.blockers);
	const changelog = readRequiredFile(files.changelog);
	const deployment = readRequiredFile(files.deployment);
	const githubSync = readRequiredFile(files.githubSync);
	const implementationPlan = readRequiredFile(files.implementationPlan);
	const operations = readRequiredFile(files.operations);
	const readme = readRequiredFile(files.readme);
	const research = readRequiredFile(files.research);
	const roadmap = readRequiredFile(files.roadmap);
	const runbook = readRequiredFile(files.runbook);

	expectAll(backlog, [
		"### B-064: Evaluate portfolio assistant scope",
		"### B-065: Add portfolio assistant prototype",
		"### B-066: Add richer public status or metadata page",
		"### B-067: Add additional notes and postmortems",
		"### B-068: Evaluate API hosting migration",
		"runbooks/POST_LAUNCH_FEATURE_PREP.md",
		"scripts/post-launch-feature-prep-contract.test.mjs",
	]);

	expectAll(runbook, [
		"# Post-Launch Feature Prep",
		"Status: pre-launch planning only; not authorization to build",
		"Scope: B-064 through B-068",
		"#70",
		"#71",
		"#72",
		"#73",
		"#74",
		"Do not close Phase 8 issues from this runbook alone",
		"Do not claim launch readiness from this runbook",
		"runbooks/FINAL_LAUNCH_CHECKLIST.md",
		"runbooks/LAUNCH_EVIDENCE.md",
	]);

	expectTableRow(runbook, "Portfolio assistant scope", [
		"B-064",
		"#70",
		"Blocked until B-063",
		"docs/ASSISTANT_SCOPE_DECISION.md",
		"privacy",
		"cost",
	]);

	expectAll(assistantDecision, [
		"# Portfolio Assistant Scope Decision",
		"Status: draft decision support only; not approved for implementation",
		"Backlog / issue: B-064 / #70",
		"Depends on: B-063 launch evidence",
		"Current recommendation: defer",
		"## User Value Beyond Novelty",
		"## Allowed Public Data Sources",
		"## Privacy Model",
		"## Cost And Rate-Limit Controls",
		"## No-Secret Frontend Architecture",
		"## Disabled-Mode Behavior",
		"## Build / Defer / Reject Decision",
		"public portfolio content only",
		"no raw contact submissions",
		"no private repositories",
		"server-side only",
		"rate limit",
		"monthly cost cap",
		"kill switch",
	]);
	expectTableRow(runbook, "Portfolio assistant prototype", [
		"B-065",
		"#71",
		"Blocked until B-064 approved build recommendation",
		"Do not build",
		"disabled-mode",
	]);
	expectTableRow(runbook, "Public status or metadata page", [
		"B-066",
		"#72",
		"Blocked until B-063",
		"/api/health",
		"/api/projects/live",
		"static fallback",
		"no private deployment details",
	]);
	expectTableRow(runbook, "Additional notes and postmortems", [
		"B-067",
		"#73",
		"Blocked until B-063",
		"draft outlines only",
		"redaction review",
	]);
	expectTableRow(runbook, "API hosting migration", [
		"B-068",
		"#74",
		"Blocked until B-058 and B-063",
		"Shuttle is not a viable new launch target",
		"Shuttle",
		"Fly.io",
		"Railway",
		"Cloudflare",
		"Hetzner",
	]);

	expectAll(runbook, [
		"https://docs.shuttle.dev/docs/shuttle-shutdown",
		"https://fly.io/docs/about/pricing/",
		"https://docs.railway.com/pricing",
		"https://developers.cloudflare.com/workers/platform/pricing/",
		"https://docs.hetzner.com/cloud/servers/overview",
		"Official-source snapshot date: 2026-05-24",
	]);

	for (const [label, content] of [
		["architecture", architecture],
		["implementation plan", implementationPlan],
		["operations", operations],
		["deployment", deployment],
		["readme", readme],
		["research", research],
		["launch blockers", blockers],
	]) {
		expectAll(content, [
			"Shuttle is not a viable new launch target",
			"https://docs.shuttle.dev/docs/shuttle-shutdown",
		]);
		expectContains(
			content,
			"Fly.io and Railway",
			`${label} current Axum host candidates`,
		);
	}

	expectAll(githubSync, [
		"Phase 8 prep status: pre-launch planning only",
		"runbooks/POST_LAUNCH_FEATURE_PREP.md",
		"docs/ASSISTANT_SCOPE_DECISION.md",
		"not authorization to build the assistant before #70 has B-063 launch evidence, HumanKaylee approval, and an approved outcome of `build`",
		"#70 remains open until B-063 launch evidence and HumanKaylee approval exist",
		"B-065 remains blocked until #70 has that approval",
		"#70 through #74 remain open",
	]);
	expectAll(roadmap, [
		"runbooks/POST_LAUNCH_FEATURE_PREP.md",
		"pre-launch planning only",
	]);
	expectAll(changelog, [
		"Post-Launch Feature Prep",
		"Assistant Scope Decision",
		"B-064",
		"B-068",
	]);

	for (const content of [
		assistantDecision,
		backlog,
		githubSync,
		roadmap,
		runbook,
	]) {
		expectNotContains(content, "Phase 8 approved for implementation");
		expectNotContains(content, "Status: launch-ready");
		expectNotContains(content, "Status: post-launch features approved");
		expectNotContains(content, "Status: approved for implementation");
		expectNotContains(content, "redactionStatus: approved");
	}
	expectNotContains(
		githubSync,
		"before B-064 is approved",
		"GitHub sync should not use ambiguous assistant approval shorthand",
	);
});
