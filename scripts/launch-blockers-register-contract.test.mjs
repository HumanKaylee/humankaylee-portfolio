import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	backlog: "docs/BACKLOG.md",
	checklist: "runbooks/FINAL_LAUNCH_CHECKLIST.md",
	deployment: "runbooks/DEPLOYMENT.md",
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

test("B-005 launch blockers register tracks unresolved launch decisions without overstating readiness", () => {
	const backlog = readRequiredFile(files.backlog);
	const checklist = readRequiredFile(files.checklist);
	const deployment = readRequiredFile(files.deployment);
	const evidence = readRequiredFile(files.evidence);
	const githubSync = readRequiredFile(files.githubSync);
	const register = readRequiredFile(files.register);

	expectAll(backlog, [
		"### B-005: Resolve launch blockers register",
		"runbooks/LAUNCH_BLOCKERS_REGISTER.md",
		"scripts/launch-blockers-register-contract.test.mjs",
		"- Register includes AI assistant v1 versus v2 decision. - Each decision has impact, latest acceptable resolution phase, and owner. Current evidence:",
	]);

	expectAll(register, [
		"# Launch Blockers Register",
		"Scope: B-005",
		"Status: decision register only; not launch-ready",
		"Decision",
		"Impact",
		"Latest acceptable resolution phase",
		"Owner",
		"Status",
		"Next evidence",
		"runbooks/FINAL_LAUNCH_CHECKLIST.md",
		"runbooks/LAUNCH_EVIDENCE.md",
		"docs/GITHUB_SYNC.md",
	]);

	expectTableRow(register, "Final domain name", [
		"canonical URLs",
		"Phase 7",
		"HumanKaylee",
		"Blocked / pending decision",
	]);
	expectTableRow(register, "Final resume PDF source", [
		"resume asset",
		"Phase 7",
		"HumanKaylee",
		"Resolved / approved local source",
		"3a6f35bf0f565fb9bbf2009665b40ae7a556dd39ff99e0d04043cab8a4c5f477",
		"production `/resume/` and PDF smoke evidence",
	]);
	expectTableRow(register, "Public-safe case-study approvals", [
		"case studies",
		"Phase 6",
		"Content owner",
		"Blocked / pending approval",
	]);
	expectTableRow(register, "API host decision after Shuttle shutdown", [
		"production API",
		"Phase 7",
		"Operations owner",
		"Blocked / pending decision",
		"Shuttle is not a viable new launch target",
		"Fly.io, Railway, or another approved host",
	]);
	expectTableRow(register, "AI assistant v1 vs v2 decision", [
		"post-launch",
		"Phase 8",
		"HumanKaylee",
		"Blocked / pending decision",
	]);

	expectAll(checklist, [
		"runbooks/LAUNCH_BLOCKERS_REGISTER.md",
		"Launch Blockers Register",
	]);
	expectAll(evidence, [
		"Launch blockers register",
		"runbooks/LAUNCH_BLOCKERS_REGISTER.md",
		"node --test scripts/launch-blockers-register-contract.test.mjs",
		"Resume download check",
		"3a6f35bf0f565fb9bbf2009665b40ae7a556dd39ff99e0d04043cab8a4c5f477",
	]);
	expectTableRow(evidence, "Launch blockers register", [
		"remaining unresolved launch decisions",
		"resume-source row is resolved local evidence only",
		"production blockers",
	]);
	expectAll(deployment, [
		"runbooks/LAUNCH_BLOCKERS_REGISTER.md",
		"API host decision",
		"Shuttle is not a viable new launch target",
	]);
	expectAll(githubSync, ["#11", "B-005: Resolve launch blockers register"]);

	expectNotContains(register, "Status: launch-ready", "launch-ready status");
	expectNotContains(register, "No blockers", "false blocker clearance");
	expectNotContains(
		register,
		"public resume source",
		"resume source should not imply production publication",
	);
});
