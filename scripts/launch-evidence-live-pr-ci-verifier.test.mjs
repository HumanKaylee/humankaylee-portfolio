import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";

const repo = "HumanKaylee/humankaylee-portfolio";
const prNumber = 6;
const enabled = process.env.HK_VERIFY_LAUNCH_EVIDENCE_LIVE === "1";
const requiredCheckRuns = [
	{ name: "Frontend verification", workflowName: "Phase 0 CI" },
	{ name: "Rust verification", workflowName: "Phase 0 CI" },
];

function localHead() {
	return execFileSync("git", ["rev-parse", "HEAD"], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	}).trim();
}

function ghPrView() {
	const output = execFileSync(
		"gh",
		[
			"pr",
			"view",
			String(prNumber),
			"--repo",
			repo,
			"--json",
			"number,headRefName,headRefOid,state,isDraft,statusCheckRollup,url",
		],
		{ encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
	);

	return JSON.parse(output);
}

function findRequiredCheckRun(entries, required) {
	return entries.find(
		(entry) =>
			entry.__typename === "CheckRun" &&
			entry.name === required.name &&
			entry.workflowName === required.workflowName,
	);
}

test(
	"live PR/CI verifier confirms PR #6 current head and checks are successful",
	{
		skip: enabled
			? false
			: "Set HK_VERIFY_LAUNCH_EVIDENCE_LIVE=1 to query GitHub live.",
	},
	() => {
		const pr = ghPrView();

		assert.equal(pr.number, prNumber, "expected PR #6");
		assert.equal(pr.state, "OPEN", "expected PR #6 to remain open");
		assert.equal(pr.isDraft, false, "expected PR #6 to be ready for review");
		assert.equal(pr.headRefOid, localHead());
		assert.match(pr.headRefOid, /^[0-9a-f]{40}$/, "expected a commit SHA head");
		assert.match(
			pr.headRefName,
			/^[A-Za-z0-9._/-]+$/,
			"expected a valid head branch name",
		);
		assert.ok(
			pr.statusCheckRollup.length > 0,
			"expected status checks to be present",
		);

		for (const required of requiredCheckRuns) {
			const entry = findRequiredCheckRun(pr.statusCheckRollup, required);

			assert.ok(
				entry,
				`expected ${required.workflowName} / ${required.name} check run`,
			);
			assert.equal(
				entry.status,
				"COMPLETED",
				`expected ${required.workflowName} / ${required.name} to complete`,
			);
			assert.equal(
				entry.conclusion,
				"SUCCESS",
				`expected ${required.workflowName} / ${required.name} to pass`,
			);
			assert.match(
				entry.detailsUrl,
				/^https:\/\/github\.com\/HumanKaylee\/humankaylee-portfolio\/actions\/runs\/\d+\/job\/\d+$/,
				`expected ${required.workflowName} / ${required.name} to link to an Actions job`,
			);
		}
	},
);
