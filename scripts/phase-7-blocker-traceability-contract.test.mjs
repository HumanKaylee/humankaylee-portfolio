import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	backlog: "docs/BACKLOG.md",
	checklist: "runbooks/FINAL_LAUNCH_CHECKLIST.md",
	evidence: "runbooks/LAUNCH_EVIDENCE.md",
	githubSync: "docs/GITHUB_SYNC.md",
	register: "runbooks/LAUNCH_BLOCKERS_REGISTER.md",
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

function markdownRows(content) {
	const codeFenceLineNumbers = fencedLineIndexes(content);

	return content
		.split("\n")
		.filter((_, index) => !codeFenceLineNumbers.has(index))
		.filter((line) => line.trim().startsWith("|"))
		.map(splitMarkdownTableRow)
		.filter((cells) => !cells.every((cell) => /^-+$/.test(cell)));
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

function expectTableRowCells(content, firstCell, expectedCellsByColumn) {
	const row = markdownRows(content).find((cells) => cells[0] === firstCell);
	assert.ok(row, `expected table row for ${firstCell}`);

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

test("Phase 7 launch blockers are traceable from decision register to open issues and evidence rows", () => {
	const backlog = readRequiredFile(files.backlog);
	const checklist = readRequiredFile(files.checklist);
	const evidence = readRequiredFile(files.evidence);
	const githubSync = readRequiredFile(files.githubSync);
	const register = readRequiredFile(files.register);

	expectContains(register, "## Phase 7 Issue Traceability");
	expectContains(
		register,
		"Traceability rows explain which launch issue stays open, which blocker register decision controls it, and which evidence row must be replaced before closure.",
	);

	expectTableRowCells(register, "B-057 / #63", {
		1: [
			"Final domain name",
			"Frontend provider/project target",
			"Cloudflare Pages frontend deployment",
		],
		2: [
			"Production frontend smoke",
			"provider project",
			"deployment URL",
			"rollback target",
		],
		3: ["Keep #63 open"],
	});
	expectTableRowCells(register, "B-058 / #64", {
		1: ["API host decision after Shuttle shutdown", "Rust API deployment"],
		2: [
			"Production API smoke",
			"public API origin",
			"secret storage",
			"contact handling",
		],
		3: ["Keep #64 open"],
	});
	expectTableRowCells(register, "B-059 / #65", {
		1: ["Final domain name", "Production domain and canonical URLs"],
		2: ["DNS/TLS", "canonical metadata", "Open Graph"],
		3: ["Keep #65 open"],
	});
	expectTableRowCells(register, "B-063 / #69", {
		1: [
			"Frontend provider/project target",
			"Final domain name",
			"API host decision after Shuttle shutdown",
			"Contact production handling",
			"Public-safe case-study approvals",
			"Complete launch checklist",
		],
		2: [
			"Production Lighthouse",
			"Contact production handling",
			"Rollback evidence",
			"four approved case studies",
		],
		3: ["Keep #69 open"],
	});

	expectContains(
		backlog,
		"scripts/phase-7-blocker-traceability-contract.test.mjs",
	);
	expectContains(
		backlog,
		"Phase 7 issue traceability maps #63, #64, #65, and #69 to their controlling launch-blocker decisions and replacement evidence rows.",
	);
	expectContains(
		githubSync,
		"Phase 7 blocker traceability status: issue-to-evidence mapping only; production remains blocked.",
	);
	expectContains(
		checklist,
		"Phase 7 issue traceability in `runbooks/LAUNCH_BLOCKERS_REGISTER.md` maps #63, #64, #65, and #69 to their controlling decisions and required replacement evidence.",
	);
	expectContains(evidence, "Phase 7 blocker traceability");
	expectTableRowCells(evidence, "Phase 7 blocker traceability", {
		1: ["node --test scripts/phase-7-blocker-traceability-contract.test.mjs"],
		4: [
			"Traceability only",
			"#63, #64, #65, and #69 remain open",
			"not production evidence",
		],
	});

	for (const content of [backlog, checklist, evidence, githubSync, register]) {
		expectNotContains(content, "Status: launch-ready", "launch-ready status");
		expectNotContains(content, "Phase 7 approved for launch");
		expectNotContains(content, "Traceability clears production blockers");
	}
});
