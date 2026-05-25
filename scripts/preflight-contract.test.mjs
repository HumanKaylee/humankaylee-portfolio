import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	changelog: "docs/CHANGELOG.md",
	evidence: "runbooks/LAUNCH_EVIDENCE.md",
	preflight: "runbooks/PREFLIGHT.md",
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

function sectionBetween(content, startHeading, endHeading) {
	const start = content.indexOf(startHeading);
	assert.ok(start >= 0, `expected section ${startHeading}`);
	const end = content.indexOf(endHeading, start + startHeading.length);
	assert.ok(end >= 0, `expected following section ${endHeading}`);
	return content.slice(start, end);
}

function expectPublicSafe(content, label, options = {}) {
	assert.doesNotMatch(
		content,
		/\/home\/joe\//,
		`${label} must not expose absolute local home paths`,
	);
	assert.doesNotMatch(
		content,
		/(ghp_|github_pat_|BEGIN [A-Z ]*PRIVATE KEY|token:|oauth_token)/i,
		`${label} must not expose tokens, secrets, or private keys`,
	);
	assert.doesNotMatch(
		content,
		/(Token:\s|Token scopes:|ghp_\*+|Logged in to github\.com account .*\(|Traceback \(most recent call last\)|^\[[^\]]+\]\s+(INFO|WARN|ERROR)\b)/im,
		`${label} must not expose raw auth output or raw logs`,
	);
	assert.doesNotMatch(
		content,
		/\b(ares-tron|bigmac\d+|rog-strix-joe|bluebeast)\b/i,
		`${label} must not expose private hostnames`,
	);
	if (options.rejectLaunchReady) {
		assert.doesNotMatch(
			content,
			/\blaunch-ready\b/i,
			`${label} must not imply launch readiness`,
		);
	}
}

test("preflight contract table parser ignores fenced code and preserves escaped pipes", () => {
	const rows = markdownRows(`
| Area | Command | Result |
| --- | --- | --- |
| Preflight | \`printf 'a\\|b'\` | value \\| with pipe |

\`\`\`text
| This fenced row | must not | parse |
\`\`\`
`);

	assert.equal(rows.length, 2);
	assert.deepEqual(rows[1], [
		"Preflight",
		"`printf 'a|b'`",
		"value | with pipe",
	]);
});

test("preflight refresh records sanitized local readiness evidence only", () => {
	const changelog = readRequiredFile(files.changelog);
	const evidence = readRequiredFile(files.evidence);
	const preflight = readRequiredFile(files.preflight);

	expectPublicSafe(preflight, "runbooks/PREFLIGHT.md", {
		rejectLaunchReady: true,
	});

	assert.match(
		preflight,
		/^Date: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/m,
		"preflight date must be an ISO-8601 local timestamp",
	);
	assert.match(
		preflight,
		/^Checkout head at refresh: `[a-f0-9]{40}`$/m,
		"preflight must record the checkout head at refresh time",
	);

	expectContains(preflight, "Branch: `goal/portfolio-implementation`");
	expectContains(preflight, "Scope: local read-only readiness refresh");
	expectContains(
		preflight,
		"Project board access is available. Project #1 exists and contains the current",
		"Project board current-state evidence",
	);
	expectContains(
		preflight,
		"Do not run `gh auth refresh` from unattended automation.",
		"unattended auth refresh guard",
	);
	expectContains(
		preflight,
		"Resume source recheck remained byte-identical to the committed static PDF asset and did not require an asset update.",
		"resume local-source recheck",
	);

	for (const command of [
		"date -Is",
		"git status --short --branch",
		"git rev-parse HEAD",
		"git remote -v",
		"node --version",
		"corepack --version",
		"pnpm --version",
		"rustc --version",
		"cargo --version",
		"gh auth status",
		"git --version",
		"codex --version",
		"GH_PROMPT_DISABLED=1 gh project list --owner HumanKaylee --format json",
	]) {
		expectContains(preflight, `\`${command}\``, command);
	}

	expectTableRowCells(preflight, "Git branch", {
		1: ["git status --short --branch"],
		2: [
			"## goal/portfolio-implementation...origin/goal/portfolio-implementation",
			"M docs/CHANGELOG.md",
			"M docs/GITHUB_SYNC.md",
			"M docs/IMPLEMENTATION_AND_TEST_PLAN.md",
			"M runbooks/LAUNCH_EVIDENCE.md",
			"M scripts/agent-instructions-contract.test.mjs",
			"M scripts/github-sync-contract.test.mjs",
		],
		3: ["ready"],
	});
	expectTableRowCells(preflight, "GitHub Project discovery", {
		1: [
			"GH_PROMPT_DISABLED=1 gh project list --owner HumanKaylee --format json",
		],
		2: [
			"Project #1",
			"HumanKaylee Portfolio",
			"https://github.com/users/HumanKaylee/projects/1",
			"19 fields",
			"15 synced items",
		],
		3: ["ready"],
	});
	expectTableRowCells(preflight, "Downloaded resume recheck", {
		1: ["sha256sum", "cmp -s"],
		2: ["cmp_exit=0"],
		3: ["local approved-source evidence only"],
	});

	const matrix = sectionBetween(
		evidence,
		"## Current Evidence Matrix",
		"## Production Blockers",
	);
	expectPublicSafe(matrix, "Current Evidence Matrix");
	expectTableRowCells(matrix, "Preflight", {
		1: ["node --test scripts/preflight-contract.test.mjs"],
		2: ["Local checkout on `goal/portfolio-implementation`"],
		4: ["Passed locally", "local readiness only"],
		5: ["runbooks/PREFLIGHT.md", "scripts/preflight-contract.test.mjs"],
		6: ["production deploy", "redaction approvals"],
		7: ["Public-safe summary only", "absolute local home paths"],
	});

	expectContains(
		changelog,
		"Refreshed the sanitized local preflight record",
		"preflight changelog entry",
	);
});
