import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";

const repo = "HumanKaylee/humankaylee-portfolio";
const liveVerificationEnabled = process.env.HK_VERIFY_GITHUB_LIVE === "1";

const expectedPhase8Issues = [
	{
		number: 70,
		title: "B-064: Evaluate portfolio assistant scope",
		labels: [
			"agent-standard",
			"area:backend",
			"area:privacy",
			"phase:8-post-launch",
			"priority:p2",
			"type:research",
		],
		bodyIncludes: ["Parent epic: #5", "Backlog ID: B-064", "B-063"],
	},
	{
		number: 71,
		title: "B-065: Add portfolio assistant prototype",
		labels: [
			"agent-standard",
			"area:backend",
			"area:frontend",
			"area:privacy",
			"phase:8-post-launch",
			"priority:p2",
			"type:feature",
		],
		bodyIncludes: [
			"Parent epic: #5",
			"Backlog ID: B-065",
			"B-064",
			"Do not build the assistant before B-064 is approved.",
		],
	},
	{
		number: 72,
		title: "B-066: Add richer public status or metadata page",
		labels: [
			"agent-standard",
			"area:backend",
			"area:frontend",
			"phase:8-post-launch",
			"priority:p2",
			"type:feature",
		],
		bodyIncludes: [
			"Parent epic: #5",
			"Backlog ID: B-066",
			"B-039",
			"B-040",
			"B-063",
		],
	},
	{
		number: 73,
		title: "B-067: Add additional notes and postmortems",
		labels: [
			"agent-standard",
			"area:content",
			"phase:8-post-launch",
			"priority:p2",
			"type:content",
		],
		bodyIncludes: ["Parent epic: #5", "Backlog ID: B-067", "B-027", "B-063"],
	},
	{
		number: 74,
		title: "B-068: Evaluate API hosting migration",
		labels: [
			"agent-standard",
			"area:backend",
			"area:infra",
			"phase:8-post-launch",
			"priority:p2",
			"type:research",
		],
		bodyIncludes: ["Parent epic: #5", "Backlog ID: B-068", "B-058", "B-063"],
	},
];

function issueView(number) {
	const output = execFileSync(
		"gh",
		[
			"issue",
			"view",
			String(number),
			"--repo",
			repo,
			"--json",
			"number,title,state,labels,body",
		],
		{ encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
	);
	return JSON.parse(output);
}

test(
	"live GitHub Phase 8 issues mirror the documented issue-sync table",
	{
		skip: liveVerificationEnabled
			? false
			: "Set HK_VERIFY_GITHUB_LIVE=1 to query GitHub.",
	},
	() => {
		for (const expected of expectedPhase8Issues) {
			const issue = issueView(expected.number);
			const labels = issue.labels.map((label) => label.name).sort();

			assert.equal(issue.number, expected.number);
			assert.equal(issue.title, expected.title);
			assert.equal(
				issue.state,
				"OPEN",
				`expected #${expected.number} to stay open`,
			);
			assert.deepEqual(
				labels,
				expected.labels.sort(),
				`unexpected labels for #${expected.number}`,
			);
			assert.match(
				issue.body,
				/Deferred until B-063 launch completion\./,
				`expected #${expected.number} to preserve post-launch deferral`,
			);

			for (const expectedBodyText of expected.bodyIncludes) {
				assert.ok(
					issue.body.includes(expectedBodyText),
					`expected #${expected.number} body to include ${expectedBodyText}`,
				);
			}
		}
	},
);
