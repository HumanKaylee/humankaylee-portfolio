import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	backlog: "docs/BACKLOG.md",
	githubSync: "docs/GITHUB_SYNC.md",
};

function readRequiredFile(path) {
	assert.ok(existsSync(path), `missing required file: ${path}`);

	const content = readFileSync(path, "utf8");
	assert.ok(content.trim().length > 0, `empty required file: ${path}`);
	return content;
}

function uniqueLabelsFromBacklog(backlog) {
	return [
		...new Set(
			backlog
				.split("\n")
				.filter((line) => line.startsWith("Labels:"))
				.flatMap((line) =>
					Array.from(line.matchAll(/`([a-z][a-z0-9:-]+)`/g), ([, label]) =>
						label.trim(),
					),
				),
		),
	].sort();
}

function expectContains(content, needle, label = needle) {
	assert.ok(
		content.includes(needle),
		`expected GitHub sync to include ${label}`,
	);
}

test("GitHub sync runbook mirrors backlog taxonomy and project-scope blocker", () => {
	const backlog = readRequiredFile(files.backlog);
	const githubSync = readRequiredFile(files.githubSync);
	const labels = uniqueLabelsFromBacklog(backlog);

	assert.ok(labels.length >= 20, "expected backlog taxonomy labels");

	for (const label of labels) {
		expectContains(githubSync, `\`${label}\``, `label ${label}`);
	}

	for (const required of [
		"gh auth refresh --hostname github.com -s project,read:project",
		"missing required scopes [project read:project]",
		"missing required scopes [read:project]",
		"GitHub Project board creation is blocked",
		"repo issues are the synchronization surface",
		"gh label create",
		"gh issue edit",
		"gh issue create",
		"Current live issue bridge",
		"Legacy `phase-0` through `phase-5` labels remain on the coarse issues",
		"Granular Issue Sync",
		"#7",
		"B-001: Confirm launch positioning and audience order",
		"#8",
		"B-002: Create public-safety and redaction checklist",
		"#9",
		"B-003: Inventory case-study candidates",
		"#10",
		'B-004: Define "The Systems Atelier" design brief',
		"#11",
		"B-005: Resolve launch blockers register",
		"Phase 1 backlog issues now live as the next granular sync layer",
		"#12",
		"B-006: Scaffold Astro TypeScript frontend",
		"#13",
		"B-007: Configure content collections",
		"#14",
		"B-008: Build base layout and semantic shell",
		"#15",
		"B-009: Establish CSS token system",
		"#16",
		"B-010: Add baseline CI checks",
		"#17",
		"B-011: Add frontend test harness",
		"#18",
		"B-012: Add Playwright smoke-test harness",
		"Phase 2 backlog issues now live as the next granular sync layer",
		"#19",
		"B-013: Write launch home-page content package",
		"#20",
		"B-014: Draft case study: CLI fleet synchronization and MCP rollout",
		"#21",
		"B-015: Draft case study: remote workstation recovery and operational debugging",
		"#22",
		"B-016: Draft case study: HumanKaylee portfolio build",
		"#23",
		"B-017: Draft case study: creative web demo",
		"#24",
		"B-018: Evaluate Kalshi or analytics tooling publication safety",
		"#25",
		"B-019: Evaluate YouTube AI video pipeline publication safety",
		"#26",
		"B-020: Build resume content source",
		"#27",
		"B-021: Create notes/build-log starter content",
		"Phase 3 backlog issues now live as the next granular sync layer",
		"#28",
		"B-022: Implement static home page",
		"#29",
		"B-023: Implement project index and category filters",
		"#30",
		"B-024: Implement case-study routes",
		"#31",
		"B-025: Implement resume HTML page and PDF link",
		"#32",
		"B-026: Implement contact page or section with fallback",
		"#33",
		"B-027: Implement notes/build-log pages and RSS",
		"#34",
		"B-028: Add SEO metadata and structured data",
		"#35",
		"B-029: Add sitemap and robots.txt",
		"#36",
		"B-030: Add static project metadata fallback",
		"Project board recovery steps",
	]) {
		expectContains(githubSync, required);
	}
});
