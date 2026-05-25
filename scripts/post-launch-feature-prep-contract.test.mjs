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

function extractSection(content, heading) {
	const lines = content.split("\n");
	const start = lines.findIndex((line) => line.trim() === heading);
	assert.notEqual(start, -1, `expected section heading ${heading}`);

	const headingLevel = heading.match(/^#+/)?.[0].length;
	assert.ok(headingLevel, `expected markdown heading for ${heading}`);

	const end = lines.findIndex((line, index) => {
		if (index <= start) {
			return false;
		}

		const match = line.match(/^(#+)\s+/);
		return Boolean(match && match[1].length <= headingLevel);
	});

	return lines.slice(start, end === -1 ? undefined : end).join("\n");
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
	const b064Backlog = extractSection(
		backlog,
		"### B-064: Evaluate portfolio assistant scope",
	);
	const b065Backlog = extractSection(
		backlog,
		"### B-065: Add portfolio assistant prototype",
	);
	const b066Backlog = extractSection(
		backlog,
		"### B-066: Add richer public status or metadata page",
	);
	const b067Backlog = extractSection(
		backlog,
		"### B-067: Add additional notes and postmortems",
	);
	const b068Backlog = extractSection(
		backlog,
		"### B-068: Evaluate API hosting migration",
	);
	const b068MigrationInputs = extractSection(
		runbook,
		"## B-068 Migration Comparison Inputs",
	);
	const b067OutlineRecords = extractSection(
		runbook,
		"## B-067 Draft Outline Records",
	);

	expectAll(backlog, [
		"### B-064: Evaluate portfolio assistant scope",
		"### B-065: Add portfolio assistant prototype",
		"### B-066: Add richer public status or metadata page",
		"### B-067: Add additional notes and postmortems",
		"### B-068: Evaluate API hosting migration",
		"After B-058 and B-063 evidence exists",
		"Produces a keep-or-move recommendation only after selected-host and launch evidence exists",
		"runbooks/POST_LAUNCH_FEATURE_PREP.md",
		"scripts/post-launch-feature-prep-contract.test.mjs",
	]);
	expectContains(b064Backlog, "Depends on: B-063");
	expectContains(b065Backlog, "Depends on: B-064, B-063");
	expectContains(b066Backlog, "Depends on: B-039, B-040, B-063");
	expectContains(b067Backlog, "Depends on: B-027, B-063");
	expectContains(b068Backlog, "Depends on: B-058, B-063");

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
	expectAll(b068MigrationInputs, [
		"## B-068 Migration Comparison Inputs",
		"Compare-only",
		"Current launch host evidence",
		"Uptime/availability expectation",
		"Monthly cost estimate",
		"Deploy complexity",
		"Custom domain/TLS support",
		"Observability/logs",
		"Rollback/deployment history",
		"Rust Axum fit",
		"Cold-start/sleep behavior",
		"Operational risk",
		"Provider-move procedure",
		"rollback procedure only after a future recommendation",
		"Re-check official provider docs before any future recommendation",
		"Do not choose a provider, perform DNS cutover, run migration commands, configure env/secrets, or write rollback steps before B-058/B-063 evidence and HumanKaylee approval",
		"no provider choice",
		"not launch evidence",
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
		"Current assistant recommendation: defer; non-binding, not HumanKaylee approval, not #70 closure",
		"## User Value Beyond Novelty",
		"## Allowed Public Data Sources",
		"## Privacy Model",
		"## Cost And Rate-Limit Controls",
		"## No-Secret Frontend Architecture",
		"## Disabled-Mode Behavior",
		"## Retrieval And Answer Contract",
		"## Build / Defer / Reject Decision",
		"public portfolio content only",
		"source-backed answers",
		"Cite at least one public source",
		"Say it cannot verify",
		"Ignore prompt-injection instructions",
		"no runtime access to local files",
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
		"downloadable resume PDF link only after production `/resume/` and PDF smoke checks pass",
		"does not authorize B-065",
	]);
	expectNotContains(
		assistantDecision,
		"Published public pages generated from `apps/web/src/content/`",
		"assistant source docs should not authorize raw content collection globbing",
	);
	expectNotContains(
		assistantDecision,
		"approved public PDF link",
		"assistant source docs should not imply the resume PDF has production-public route evidence",
	);
	expectTableRowCells(runbook, "Portfolio assistant prototype", {
		1: ["B-065", "#71"],
		2: [
			"Blocked until B-063 launch evidence exists",
			"#70/B-064 has a HumanKaylee-approved outcome of `build`",
		],
		3: ["Do not build", "disabled-mode"],
		4: ["Prompt/content tests", "disabled-mode smoke test"],
	});
	expectAll(runbook, [
		"Do not build a portfolio assistant before B-063 launch evidence exists",
		"#70/B-064 has a HumanKaylee-approved outcome of `build`",
		"`docs/ASSISTANT_SCOPE_DECISION.md` is draft decision support only",
	]);
	expectContains(
		b065Backlog,
		"blocked until B-063 launch evidence exists and #70/B-064 has a HumanKaylee-approved outcome of `build`",
	);
	expectContains(
		githubSync,
		"B-065 remains blocked until B-063 launch evidence exists and #70/B-064 has a HumanKaylee-approved outcome of `build`",
	);
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
		"Public release label or build version only",
		"No raw private commit SHA, deployment ID, provider account name, or non-generic environment label unless explicitly approved for public evidence",
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
	expectAll(b067OutlineRecords, [
		"## B-067 Draft Outline Records",
		"Status: planning outlines only; not published content",
		"These records do not create notes collection entries, RSS feed items, launch evidence, or publication approval.",
	]);
	const outlineRecordHeadings = b067OutlineRecords
		.split("\n")
		.filter((line) => line.startsWith("### Outline: "));
	assert.equal(
		outlineRecordHeadings.length,
		3,
		"expected exactly three B-067 draft outline records",
	);
	const outlineSections = b067OutlineRecords
		.split("\n### Outline: ")
		.slice(1)
		.map((section) => `### Outline: ${section}`);
	for (const requiredOutline of [
		"Static-first portfolio launch after-action",
		"Redaction-safe case-study production workflow",
		"Rust API launch operations postmortem",
	]) {
		expectContains(b067OutlineRecords, `### Outline: ${requiredOutline}`);
	}
	for (const outlineSection of outlineSections) {
		expectAll(outlineSection, [
			"- Working title:",
			"- Problem:",
			"- Approach:",
			"- Evidence plan:",
			"- Lesson:",
			"- Redaction review:",
			"- Launch dependency:",
			"- RSS/index verification after launch:",
		]);
	}
	expectTableRowCells(runbook, "API hosting migration", {
		1: ["B-068", "#74"],
		2: ["Blocked until B-058 and B-063"],
		3: [
			"Decision matrix only",
			"docs/ARCHITECTURE.md#9-hosting-architecture",
			"canonical candidate source",
			"compare every candidate",
		],
		4: ["Future host-retention recommendation"],
	});
	const apiHostingPrepCell = findTableRow(runbook, "API hosting migration")[3];
	expectNotContains(apiHostingPrepCell, "Fly.io");
	expectNotContains(apiHostingPrepCell, "Railway");
	expectNotContains(apiHostingPrepCell, "Cloudflare");
	expectNotContains(apiHostingPrepCell, "Hetzner");
	expectAll(b068MigrationInputs, [
		"### B-068 Comparison Matrix",
		"Official doc source",
		"Snapshot date",
		"Source-derived comparison inputs",
		"Still blocked by",
		"Shuttle legacy compatibility",
		"Fly.io normal Axum PaaS candidate",
		"Railway normal Axum PaaS candidate",
		"Cloudflare Workers/Pages Functions edge rewrite option",
		"Hetzner VPS higher-ops fallback",
		"no ranking",
		"no provider choice",
		"not launch evidence",
	]);
	for (const forbiddenB068Phrase of [
		"select a provider",
		"recommend migration",
		"best provider",
		"switch to",
		"migrate to",
		"migration steps",
		"rollback plan",
		"launch-ready",
		"production-ready",
		"approved for implementation",
		"stay-or-migrate",
	]) {
		expectNotContains(b068MigrationInputs, forbiddenB068Phrase);
	}
	for (const [candidate, sourceUrl] of [
		[
			"Shuttle legacy compatibility",
			"https://docs.shuttle.dev/docs/shuttle-shutdown",
		],
		["Fly.io normal Axum PaaS candidate", "https://fly.io/docs/about/pricing/"],
		["Railway normal Axum PaaS candidate", "https://docs.railway.com/pricing"],
		[
			"Cloudflare Workers/Pages Functions edge rewrite option",
			"https://developers.cloudflare.com/workers/platform/pricing/",
		],
		[
			"Hetzner VPS higher-ops fallback",
			"https://docs.hetzner.com/cloud/servers/overview",
		],
	]) {
		const row = findTableRow(b068MigrationInputs, candidate);
		assert.equal(
			row[1],
			sourceUrl,
			`expected ${candidate} row to carry its own official source URL`,
		);
		assert.equal(
			row[2],
			"2026-05-24",
			`expected ${candidate} row to carry its own snapshot date`,
		);
		assert.ok(
			row[3],
			`expected ${candidate} row to include source-derived comparison inputs`,
		);
		assert.ok(row[4], `expected ${candidate} row to include remaining blocker`);
	}

	expectAll(runbook, [
		"https://docs.shuttle.dev/docs/shuttle-shutdown",
		"https://fly.io/docs/about/pricing/",
		"https://docs.railway.com/pricing",
		"https://developers.cloudflare.com/workers/platform/pricing/",
		"https://docs.hetzner.com/cloud/servers/overview",
		"Official-source snapshot date: 2026-05-24",
		"be disableable without changing core portfolio navigation",
	]);
	expectAll(runbook, [
		"## B-065 Future Prompt And Source Test Checklist",
		"Source-backed answer test",
		"Unsupported-claim refusal test",
		"Private-source request refusal test",
		"Prompt-injection resistance test",
		"Disabled-mode smoke test",
		"No assistant route, endpoint, model provider, retrieval index, or UI implementation is authorized by this checklist.",
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
		"B-068 comparisons must record the official source URL and snapshot date",
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
		"B-065 remains blocked until B-063 launch evidence exists and #70/B-064 has a HumanKaylee-approved outcome of `build`",
		"#70 through #74 remain open",
		"B-067 draft outline contract status: pre-launch planning only",
		"#73 remains open until B-063 launch evidence exists and approved public-safe content is published",
		"B-067 draft outline records status: pre-launch planning only",
		"three draft-only outline records",
		"B-068 source-cited comparison matrix status: pre-launch planning only",
		"official provider source and snapshot date",
	]);
	expectAll(roadmap, [
		"runbooks/POST_LAUNCH_FEATURE_PREP.md",
		"pre-launch planning only",
	]);
	expectAll(changelog, [
		"Post-Launch Feature Prep",
		"Assistant Scope Decision",
		"B-067 Draft Outline Contract",
		"B-067 Draft Outline Records",
		"B-068 migration comparison inputs",
		"B-068 Source-Cited Comparison Matrix",
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
