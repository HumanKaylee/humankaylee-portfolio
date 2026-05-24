import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	architecture: "docs/ARCHITECTURE.md",
	blockers: "runbooks/LAUNCH_BLOCKERS_REGISTER.md",
	changelog: "docs/CHANGELOG.md",
	githubSync: "docs/GITHUB_SYNC.md",
	launchEvidence: "runbooks/LAUNCH_EVIDENCE.md",
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
	const codeFenceLines = fencedLineIndexes(content);

	return content
		.split("\n")
		.filter((_, index) => !codeFenceLines.has(index))
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

function expectNoTableRow(content, firstCell) {
	const row = markdownRows(content).find((cells) => cells[0] === firstCell);
	assert.equal(row, undefined, `expected no table row for ${firstCell}`);
}

test("Phase 7 API host guidance keeps Shuttle legacy-only and active launch guidance current", () => {
	const architecture = readRequiredFile(files.architecture);
	const blockers = readRequiredFile(files.blockers);
	const changelog = readRequiredFile(files.changelog);
	const githubSync = readRequiredFile(files.githubSync);
	const launchEvidence = readRequiredFile(files.launchEvidence);

	expectContains(
		githubSync,
		"Shuttle is not a viable new launch target",
		"GitHub sync active API host warning",
	);
	expectContains(githubSync, "https://docs.shuttle.dev/docs/shuttle-shutdown");
	expectContains(
		githubSync,
		"Fly.io, Railway, or another approved host are the approved current-host comparison set for #64",
	);
	expectContains(
		githubSync,
		"Shuttle secrets are legacy compatibility only and are not required for new CI deploy setup.",
	);
	expectNoTableRow(githubSync, "`SHUTTLE_API_KEY`");
	expectTableRowCells(githubSync, "`FLY_API_TOKEN`", {
		1: ["Fly.io API deploy"],
		2: ["Only if Fly.io is selected"],
	});
	expectTableRowCells(githubSync, "`RAILWAY_TOKEN`", {
		1: ["Railway API deploy"],
		2: ["Only if Railway is selected"],
	});

	expectTableRowCells(launchEvidence, "Shuttle API binary", {
		4: ["feature-gated", "legacy compatibility"],
		6: [
			"Do not use Shuttle for a new production launch",
			"local compatibility evidence",
		],
	});
	expectContains(
		launchEvidence,
		"Final API domain and Fly.io, Railway, or another approved host provider project are not selected.",
	);
	expectContains(
		launchEvidence,
		"Shuttle is not a viable new launch target and remains legacy compatibility only.",
	);
	expectContains(
		architecture,
		"Fly.io, Railway, or another approved host as the approved current-host comparison set for #64",
	);
	expectContains(
		blockers,
		"Fly.io, Railway, or another approved host are the approved current-host comparison set for #64",
	);
	expectNotContains(
		launchEvidence,
		"Final API domain and Shuttle, Fly.io, Railway",
		"Shuttle as active provider in production blocker list",
	);
	expectNotContains(
		launchEvidence,
		"Production Shuttle run/deploy remains blocked",
		"Production Shuttle pending path",
	);

	expectContains(changelog, "Added Phase 7 current API host guidance coverage");

	for (const content of [architecture, blockers, githubSync, launchEvidence]) {
		expectNotContains(content, "Shuttle Rust API initially");
		expectNotContains(content, "Shuttle as the first Rust API host");
		expectNotContains(content, "Shuttle API deploy, if CI deploys backend");
		expectNotContains(content, "current normal Axum API deploy candidates");
		expectNotContains(content, "current normal Axum PaaS candidates");
		expectNotContains(content, "alternate current API provider");
	}
});
