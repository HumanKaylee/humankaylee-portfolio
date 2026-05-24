import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

function normalize(content) {
	return content.replace(/\s+/g, " ").toLowerCase();
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

const evidencePath = fileURLToPath(
	new URL("../runbooks/LAUNCH_EVIDENCE.md", import.meta.url),
);
const evidence = readFileSync(evidencePath, "utf8");

function latestVerifiedValue(content, label, pattern) {
	const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const match = content.match(
		new RegExp(`${escapedLabel}:\\s*[\\x60]([^\\x60]+)[\\x60]`, "i"),
	);
	assert.ok(match, `expected a ${label} record`);
	assert.match(match[1], pattern, `expected ${label} to match ${pattern}`);
	return match[1];
}

test("launch evidence distinguishes the latest PR head from historical rows", () => {
	const head = latestVerifiedValue(
		evidence,
		"Latest verified PR head",
		/^[0-9a-f]{40}$/,
	);
	const ciRun = latestVerifiedValue(evidence, "CI run", /^\d+$/);
	const frontendJob = latestVerifiedValue(evidence, "Frontend job", /^\d+$/);
	const rustJob = latestVerifiedValue(evidence, "Rust job", /^\d+$/);

	expectContains(evidence, "current launch evidence index");
	expectContains(evidence, "Latest Verified PR Evidence");
	expectContains(evidence, "Latest verified PR head");
	expectContains(evidence, "historical rows");
	expectContains(evidence, `current head \`${head}\``, "current PR row head");
	expectContains(
		evidence,
		`PR #6, head \`${head}\``,
		"frontend and Rust row heads",
	);
	expectContains(evidence, ciRun, "latest verified CI run");
	expectContains(evidence, frontendJob, "latest verified frontend job");
	expectContains(evidence, rustJob, "latest verified Rust job");
	expectNotContains(
		evidence.match(
			/## Current Evidence Matrix[\s\S]*?\| GitHub issue sync/,
		)?.[0] ?? "",
		"26349194779",
		"stale CI run in latest PR rows",
	);
	expectContains(evidence, "Production Blockers");
	expectContains(evidence, "Production frontend smoke");
	expectContains(evidence, "Production API smoke");
	expectContains(evidence, "Rollback evidence");
	expectContains(evidence, "Blocked / not run");
	expectNotContains(evidence, "Status: launch-ready");

	if (process.env.HK_EXPECTED_PR_HEAD) {
		assert.equal(
			head,
			process.env.HK_EXPECTED_PR_HEAD,
			"latest verified PR head does not match expected live PR head",
		);
	}

	if (process.env.HK_EXPECTED_CI_RUN) {
		assert.equal(
			ciRun,
			process.env.HK_EXPECTED_CI_RUN,
			"latest verified CI run does not match expected live CI run",
		);
	}

	if (process.env.HK_EXPECTED_FRONTEND_JOB) {
		assert.equal(
			frontendJob,
			process.env.HK_EXPECTED_FRONTEND_JOB,
			"latest verified frontend job does not match expected live frontend job",
		);
	}

	if (process.env.HK_EXPECTED_RUST_JOB) {
		assert.equal(
			rustJob,
			process.env.HK_EXPECTED_RUST_JOB,
			"latest verified Rust job does not match expected live Rust job",
		);
	}
});
