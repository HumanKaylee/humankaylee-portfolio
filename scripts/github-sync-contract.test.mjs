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
		"Project board recovery steps",
	]) {
		expectContains(githubSync, required);
	}
});
