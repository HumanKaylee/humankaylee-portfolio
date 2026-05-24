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

function fencedLineIndexes(content) {
	const indexes = new Set();
	let insideFence = false;

	content.split("\n").forEach((line, index) => {
		if (line.trim().startsWith("```")) {
			insideFence = !insideFence;
			indexes.add(index);
			return;
		}

		if (insideFence) {
			indexes.add(index);
		}
	});

	return indexes;
}

function splitMarkdownTableRow(line) {
	const cells = [];
	let cell = "";
	let escaped = false;

	for (const character of line.trim().slice(1, -1)) {
		if (escaped) {
			cell += character === "|" ? character : `\\${character}`;
			escaped = false;
			continue;
		}

		if (character === "\\") {
			escaped = true;
			continue;
		}

		if (character === "|") {
			cells.push(cell.trim());
			cell = "";
			continue;
		}

		cell += character;
	}

	if (escaped) {
		cell += "\\";
	}

	cells.push(cell.trim());
	return cells;
}

function markdownRows(content) {
	const codeFenceLineNumbers = fencedLineIndexes(content);

	return content
		.split("\n")
		.filter((_, index) => !codeFenceLineNumbers.has(index))
		.filter((line) => line.trim().startsWith("|"))
		.map(splitMarkdownTableRow)
		.filter((cells) => !cells.every((cell) => /^-+$/.test(cell)));
}

function findTableRow(content, firstCell) {
	const row = markdownRows(content).find((cells) => cells[0] === firstCell);
	assert.ok(row, `expected table row for ${firstCell}`);
	return row;
}

function expectTableRowCells(content, firstCell, expectedCellsByColumn) {
	const row = findTableRow(content, firstCell);

	for (const [columnIndex, expectedCells] of Object.entries(
		expectedCellsByColumn,
	)) {
		const cell = row[Number(columnIndex)];
		assert.ok(
			cell,
			`expected ${firstCell} row to include column ${columnIndex}`,
		);

		for (const expectedCell of expectedCells) {
			assert.ok(
				normalize(cell).includes(normalize(expectedCell)),
				`expected ${firstCell} column ${columnIndex} to include ${expectedCell}`,
			);
		}
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
		"Canonical hosting source: `docs/ARCHITECTURE.md#9-hosting-architecture`",
	]);

	expectTableRowCells(runbook, "Portfolio assistant scope", {
		1: ["B-064", "#70"],
		2: ["Blocked until B-063"],
		3: ["docs/ASSISTANT_SCOPE_DECISION.md", "privacy", "cost"],
		4: ["HumanKaylee-approved", "build/defer/reject"],
	});

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
		"no private hostnames",
		"credentials",
		"unpublished case-study drafts",
		"redaction open items",
		"server-side only",
		"rate limit",
		"monthly cost cap",
		"kill switch",
		"does not authorize B-065",
	]);
	expectTableRowCells(runbook, "Portfolio assistant prototype", {
		1: ["B-065", "#71"],
		2: ["Blocked until B-064", "build recommendation"],
		3: ["Do not build", "disabled-mode"],
		4: ["Prompt/content tests", "disabled-mode smoke test"],
	});
	expectTableRowCells(runbook, "Public status or metadata page", {
		1: ["B-066", "#72"],
		2: ["Blocked until B-063"],
		3: ["/api/health", "/api/projects/live", "static fallback"],
		4: ["API-up and API-down"],
	});
	expectAll(runbook, [
		"## B-066 Status / Metadata Implementation Checklist",
		"Permitted data sources: `/api/health`, `/api/projects/live`, static fallback copy",
		"API-up check",
		"API-down fallback check",
		"No private deployment, provider, log, or contact data",
		"No JavaScript requirement for core content",
		"Launch-blocked until B-063",
		"No route or UI implementation yet",
	]);
	expectTableRowCells(runbook, "Additional notes and postmortems", {
		1: ["B-067", "#73"],
		2: ["Blocked until B-063"],
		3: ["draft outlines only", "redaction review"],
		4: ["Feed and notes index review"],
	});
	expectAll(runbook, [
		"## B-067 Draft Outline Contract",
		"Outline status: draft only; not published content",
		"Do not create `apps/web/src/content/notes/*.md` entries before B-063 launch evidence exists",
		"Working title",
		"Problem",
		"Approach",
		"Evidence plan",
		"Lesson",
		"Redaction review",
		"Launch dependency",
		"RSS/index verification after launch",
		"No RSS feed update is expected before published content exists",
	]);
	expectTableRowCells(runbook, "API hosting migration", {
		1: ["B-068", "#74"],
		2: ["Blocked until B-058 and B-063"],
		3: [
			"Decision matrix only",
			"Shuttle is not a viable new launch target",
			"Fly.io",
			"Railway",
			"Cloudflare",
			"Hetzner",
		],
		4: ["Stay-or-migrate recommendation"],
	});

	expectAll(runbook, [
		"https://docs.shuttle.dev/docs/shuttle-shutdown",
		"https://fly.io/docs/about/pricing/",
		"https://docs.railway.com/pricing",
		"https://developers.cloudflare.com/workers/platform/pricing/",
		"https://docs.hetzner.com/cloud/servers/overview",
		"Official-source snapshot date: 2026-05-24",
	]);

	for (const content of [
		architecture,
		implementationPlan,
		operations,
		deployment,
		readme,
		research,
		blockers,
	]) {
		expectAll(content, [
			"Shuttle is not a viable new launch target",
			"https://docs.shuttle.dev/docs/shuttle-shutdown",
		]);
	}
	for (const content of [
		architecture,
		implementationPlan,
		operations,
		deployment,
		readme,
		research,
		blockers,
	]) {
		expectAll(content, ["Fly.io", "Railway"]);
	}
	expectAll(architecture, [
		"## 9. Hosting Architecture",
		"Fly.io",
		"Railway",
		"Cloudflare Pages plus Workers",
		"Hetzner VPS",
		"Home self-hosting plus Cloudflare Tunnel",
	]);

	expectAll(githubSync, [
		"Phase 8 prep status: pre-launch planning only",
		"runbooks/POST_LAUNCH_FEATURE_PREP.md",
		"docs/ASSISTANT_SCOPE_DECISION.md",
		"not authorization to build the assistant before",
		"#70 has B-063 launch evidence",
		"HumanKaylee approval",
		"approved outcome of `build`",
		"#70 remains open until B-063 launch evidence and HumanKaylee approval exist",
		"B-065 remains blocked until #70 has that approval",
		"#70 through #74 remain open",
		"B-067 draft outline contract status: pre-launch planning only",
		"#73 remains open until B-063 launch evidence exists and approved public-safe content is published",
	]);
	expectAll(roadmap, [
		"runbooks/POST_LAUNCH_FEATURE_PREP.md",
		"pre-launch planning only",
	]);
	expectAll(changelog, [
		"Post-Launch Feature Prep",
		"Assistant Scope Decision",
		"B-067 Draft Outline Contract",
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
