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

function expectMatches(content, pattern, label) {
	assert.match(
		normalize(content),
		pattern,
		`expected content to match ${label}`,
	);
}

const evidencePath = fileURLToPath(
	new URL("../runbooks/LAUNCH_EVIDENCE.md", import.meta.url),
);
const changelogPath = fileURLToPath(
	new URL("../docs/CHANGELOG.md", import.meta.url),
);
const liveVerifierPath = fileURLToPath(
	new URL("./launch-evidence-live-pr-ci-verifier.test.mjs", import.meta.url),
);
const evidence = readFileSync(evidencePath, "utf8");
const changelog = readFileSync(changelogPath, "utf8");
const liveVerifier = readFileSync(liveVerifierPath, "utf8");

function latestVerifiedValue(content, label, pattern) {
	const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const match = content.match(
		new RegExp(`${escapedLabel}:\\s*[\\x60]([^\\x60]+)[\\x60]`, "i"),
	);
	assert.ok(match, `expected a ${label} record`);
	assert.match(match[1], pattern, `expected ${label} to match ${pattern}`);
	return match[1];
}

function resumeEvidenceBlock(content) {
	const tableRow = content
		.split("\n")
		.find((line) => line.startsWith("| Resume inventory alignment "));

	if (tableRow) return tableRow;

	const marker = "Resume inventory alignment";
	const markerIndex = content.indexOf(marker);
	assert.ok(markerIndex >= 0, `expected content to include ${marker}`);

	const blockStart = Math.max(0, content.lastIndexOf("\n- ", markerIndex) + 1);
	const nextBlock = content.indexOf("\n- ", markerIndex + marker.length);
	return content.slice(blockStart, nextBlock === -1 ? undefined : nextBlock);
}

function downloadedResumeRecheckBlock(content) {
	const tableRow = content
		.split("\n")
		.find((line) => line.startsWith("| Downloaded resume recheck "));

	if (tableRow) return tableRow;

	const marker = "Downloaded resume recheck";
	const markerIndex = content.indexOf(marker);
	assert.ok(markerIndex >= 0, `expected content to include ${marker}`);

	const blockStart = Math.max(0, content.lastIndexOf("\n- ", markerIndex) + 1);
	const nextBlock = content.indexOf("\n- ", markerIndex + marker.length);
	return content.slice(blockStart, nextBlock === -1 ? undefined : nextBlock);
}

test("launch evidence distinguishes the embedded PR snapshot from live current checks", () => {
	const head = latestVerifiedValue(
		evidence,
		"Embedded verified PR head",
		/^[0-9a-f]{40}$/,
	);
	const ciRun = latestVerifiedValue(evidence, "CI run", /^\d+$/);
	const frontendJob = latestVerifiedValue(evidence, "Frontend job", /^\d+$/);
	const rustJob = latestVerifiedValue(evidence, "Rust job", /^\d+$/);

	expectContains(evidence, "snapshot-aware launch evidence index");
	expectContains(evidence, "Embedded Verified PR Evidence Snapshot");
	expectContains(evidence, "Embedded verified PR head");
	expectContains(evidence, "historical rows");
	expectContains(
		evidence,
		"point-in-time evidence for the embedded PR snapshot",
		"point-in-time launch-evidence caveat",
	);
	expectContains(
		evidence,
		"HK_VERIFY_LAUNCH_EVIDENCE_LIVE=1 node --test scripts/launch-evidence-live-pr-ci-verifier.test.mjs",
		"opt-in live PR/CI verifier command",
	);
	expectContains(
		evidence,
		"compares the GitHub PR head with the local checkout",
		"live verifier local checkout comparison",
	);
	expectContains(
		evidence,
		"requires only the Phase 0 CI Frontend verification and Rust verification gates",
		"live verifier required gate scope",
	);
	expectContains(
		evidence,
		`embedded snapshot head \`${head}\``,
		"embedded PR row head",
	);
	expectContains(
		evidence,
		`PR #6, embedded snapshot head \`${head}\``,
		"frontend and Rust row heads",
	);
	expectNotContains(
		evidence,
		"Latest Verified PR Evidence",
		"stale-prone static evidence heading",
	);
	expectNotContains(
		evidence,
		"current launch evidence index",
		"stale-prone current evidence-index wording",
	);
	expectNotContains(
		evidence,
		"Latest verified PR head",
		"stale-prone static evidence label",
	);
	expectContains(evidence, ciRun, "latest verified CI run");
	expectContains(evidence, frontendJob, "latest verified frontend job");
	expectContains(evidence, rustJob, "latest verified Rust job");
	expectContains(
		evidence,
		"Boundary wording guard hardening",
		"boundary wording historical evidence row",
	);
	expectContains(
		evidence,
		"c4be290b638547b9c0ec10095b00018d2858c622",
		"boundary wording verified commit",
	);
	expectContains(evidence, "26380864515", "boundary wording CI run");
	expectContains(evidence, "77649642797", "boundary wording frontend job");
	expectContains(evidence, "77649642806", "boundary wording Rust job");
	expectContains(
		evidence,
		"not production launch evidence",
		"boundary wording production-readiness caveat",
	);
	expectContains(
		changelog,
		"Recorded boundary wording guard CI evidence",
		"boundary wording changelog entry",
	);
	expectContains(
		evidence,
		"every currently open live-bridge issue (`#3`, `#5`, `#20`, `#21`, `#24`, `#25`, `#63`, `#64`, `#65`, `#69`, and `#70`-`#74`) has a Project item",
		"latest GitHub issue and Project sync row",
	);
	expectContains(
		evidence,
		"GitHub issue, PR, and Project sync",
		"latest GitHub issue, PR, and Project sync row",
	);
	expectContains(
		evidence,
		"PR #6 has a Project item with status `Todo`",
		"PR Project sync row",
	);
	expectContains(
		evidence,
		"HK_VERIFY_GITHUB_LIVE=1 node --test scripts/github-live-issue-sync.test.mjs",
		"live GitHub issue-sync verifier",
	);
	expectContains(
		evidence,
		"not launch readiness, post-launch feature approval, or assistant-build approval",
		"Phase 8 issue-sync guardrail",
	);
	expectNotContains(
		evidence.match(
			/## Current Evidence Matrix[\s\S]*?\| GitHub issue, PR, and Project sync/,
		)?.[0] ?? "",
		"26349194779",
		"stale CI run in latest PR rows",
	);
	expectContains(evidence, "Production Blockers");
	expectContains(
		evidence,
		"contact handling, rollback targets, and redaction approvals",
		"expanded scope blockers",
	);
	expectContains(evidence, "Production frontend smoke");
	expectContains(evidence, "Production API smoke");
	expectContains(evidence, "Rollback evidence");
	expectContains(evidence, "Blocked / not run");
	expectNotContains(evidence, "Status: launch-ready");
	expectNotContains(
		evidence,
		"committed public resume asset",
		"resume asset should stay local-source scoped",
	);

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

test("live launch-evidence verifier is scoped to the current checkout and required CI gates", () => {
	expectContains(
		liveVerifier,
		'execFileSync("git", ["rev-parse", "HEAD"]',
		"local checkout head read",
	);
	expectContains(
		liveVerifier,
		"assert.equal(pr.headRefOid, localHead())",
		"PR head must match local checkout",
	);
	expectContains(
		liveVerifier,
		'"Frontend verification"',
		"required frontend check",
	);
	expectContains(liveVerifier, '"Rust verification"', "required Rust check");
	expectContains(liveVerifier, '"Phase 0 CI"', "required workflow name");
	expectNotContains(
		liveVerifier,
		"for (const entry of pr.statusCheckRollup)",
		"live verifier should not require every status context to pass",
	);
});

test("resume inventory alignment is recorded as local approved-source evidence only", () => {
	for (const content of [evidence, changelog]) {
		const block = resumeEvidenceBlock(content);

		expectContains(block, "Resume inventory alignment");
		expectMatches(block, /commit `?[0-9a-f]{40}`?/i, "commit SHA evidence");
		expectMatches(block, /ci run `?\d+`?/i, "CI run evidence");
		expectMatches(block, /frontend job `?\d+`?/i, "frontend job evidence");
		expectMatches(block, /rust job `?\d+`?/i, "Rust job evidence");
		expectMatches(block, /\b[0-9a-f]{64}\b/i, "resume PDF checksum");
		expectContains(
			block,
			"pnpm exec vitest run apps/web/src/data/content-inventory.test.ts apps/web/src/lib/contracts/content.test.ts",
			"resume inventory focused contract command",
		);
		expectContains(
			block,
			"pnpm test -- --run content",
			"content contract command",
		);
		expectContains(
			block,
			"not production `/resume/` readiness",
			"resume production readiness boundary",
		);
	}
	expectNotContains(
		changelog,
		"Published the approved downloadable resume PDF",
	);
	expectNotContains(changelog, "approved downloadable resume PDF");
});

test("downloaded resume recheck records exact local comparison without production readiness", () => {
	for (const content of [evidence, changelog]) {
		const block = downloadedResumeRecheckBlock(content);

		expectContains(block, "Downloaded resume recheck");
		expectContains(
			block,
			"~/Downloads/'Joe Poznanski Resume February 2026.pdf'",
			"downloaded resume source path",
		);
		expectContains(
			block,
			"apps/web/public/downloads/humankaylee-resume.pdf",
			"repo resume asset path",
		);
		expectContains(block, "sha256sum", "checksum command");
		expectContains(block, "cmp -s", "byte comparison command");
		expectContains(block, "cmp_exit=0", "byte comparison exit code");
		expectContains(
			block,
			"3a6f35bf0f565fb9bbf2009665b40ae7a556dd39ff99e0d04043cab8a4c5f477",
			"resume SHA-256",
		);
		expectContains(
			block,
			"no resume asset update",
			"no-import-needed boundary",
		);
		expectContains(
			block,
			"not production `/resume/` readiness",
			"production readiness boundary",
		);
	}
});
