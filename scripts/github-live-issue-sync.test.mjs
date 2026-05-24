import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repo = "HumanKaylee/humankaylee-portfolio";
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const githubSyncPath = resolve(repoRoot, "docs/GITHUB_SYNC.md");
const liveVerificationEnabled = process.env.HK_VERIFY_GITHUB_LIVE === "1";
const parentEpicIssueNumbers = [3, 5];
const mustRemainOpenIssueNumbers = new Set([
	...parentEpicIssueNumbers,
	20,
	21,
	24,
	25,
	63,
	64,
	65,
	69,
	70,
	71,
	72,
	73,
	74,
]);

function readGitHubSync() {
	return readFileSync(githubSyncPath, "utf8");
}

function parseLabels(cell) {
	return Array.from(cell.matchAll(/`([^`]+)`/g), ([, label]) => label).sort();
}

function parseGranularIssues(syncDoc) {
	const granularSection = syncDoc.split("## Granular Issue Sync")[1];

	assert.ok(granularSection, "expected granular issue sync section");

	const issues = [];
	for (const line of granularSection.split("\n")) {
		const match = line.match(
			/^\|\s*(#\d+)\s*\|\s*(.*?)\s*\|\s*(#\d+)\s*\|\s*(.*?)\s*\|$/,
		);
		if (!match) continue;

		const [, issueRef, title, parent, labelsCell] = match;
		const number = Number.parseInt(issueRef.slice(1), 10);
		const backlogId = title.match(/\bB-\d{3}\b/)?.[0];

		assert.ok(backlogId, `expected backlog id in ${issueRef}`);

		issues.push({
			backlogId,
			labels: parseLabels(labelsCell),
			number,
			parent,
			title,
		});
	}

	return issues;
}

function fetchAllIssues() {
	const output = execFileSync(
		"gh",
		[
			"api",
			"--paginate",
			"--slurp",
			`repos/${repo}/issues?state=all&per_page=100`,
		],
		{ encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
	);
	return JSON.parse(output)
		.flat()
		.filter((issue) => !issue.pull_request)
		.map((issue) => ({
			body: issue.body ?? "",
			labels: issue.labels.map((label) => ({ name: label.name })),
			number: issue.number,
			state: issue.state.toUpperCase(),
			title: issue.title,
		}));
}

function phase8StatusRequirements(backlogId) {
	const requirements = [
		"Phase: 8-post-launch",
		"Deferred until B-063 launch completion.",
	];

	if (backlogId === "B-064") {
		requirements.push(
			"Do not approve implementation before B-063 is closed and reviewed and HumanKaylee approves the B-064 decision.",
		);
	}

	if (backlogId === "B-065") {
		requirements.push(
			"Blocked until B-064 has a HumanKaylee-approved build recommendation.",
			"Do not build the assistant before #70 has B-063 launch evidence, HumanKaylee approval, and an approved outcome of build.",
		);
	}

	if (backlogId === "B-066") {
		requirements.push(
			"Do not expose post-launch metadata until the launch checklist is complete.",
		);
	}

	if (backlogId === "B-067") {
		requirements.push(
			"Do not publish post-launch notes until the launch checklist is complete.",
		);
	}

	if (backlogId === "B-068") {
		requirements.push(
			"Do not evaluate migration options as a replacement for launch work.",
		);
	}

	return requirements;
}

function phase7StatusRequirements(backlogId) {
	const requirements = [];

	if (backlogId === "B-057") {
		requirements.push(
			"Deploy the static frontend to Cloudflare Pages.",
			"Production frontend smoke remains blocked until provider, project, domain, deployment URL, and rollback evidence exist.",
		);
	}

	if (backlogId === "B-058") {
		requirements.push(
			"Deploy API to Fly.io, Railway, or another approved host.",
			"Shuttle is legacy compatibility only, not a new production launch host.",
			"No production API evidence exists until public or approved-preview `/api/health`, CORS, secret storage, contact handling, and rollback evidence are recorded.",
		);
	}

	if (backlogId === "B-059") {
		requirements.push(
			"Final domain, canonical URL, DNS, TLS, sitemap, Open Graph, robots, RSS, and production metadata smoke evidence are required before closure.",
		);
	}

	if (backlogId === "B-063") {
		requirements.push(
			"Current approved launch case studies: 0.",
			"Production frontend/API smoke, production Lighthouse, contact production handling, rollback evidence, and redaction approvals remain blocked.",
		);
	}

	return requirements;
}

test(
	"live GitHub issue sync mirrors the documented granular bridge",
	{
		skip: liveVerificationEnabled
			? false
			: "Set HK_VERIFY_GITHUB_LIVE=1 to query GitHub.",
	},
	() => {
		const expectedIssues = parseGranularIssues(readGitHubSync());
		const issuesByNumber = new Map(
			fetchAllIssues().map((issue) => [issue.number, issue]),
		);

		assert.equal(
			expectedIssues.length,
			68,
			"expected granular bridge to cover #7 through #74",
		);

		for (const parentEpicNumber of parentEpicIssueNumbers) {
			const issue = issuesByNumber.get(parentEpicNumber);
			assert.ok(issue, `missing live parent epic #${parentEpicNumber}`);
			assert.equal(
				issue.state,
				"OPEN",
				`expected parent epic #${parentEpicNumber} to stay open while child blockers remain open`,
			);
		}

		for (const expected of expectedIssues) {
			const issue = issuesByNumber.get(expected.number);
			assert.ok(issue, `missing live GitHub issue #${expected.number}`);
			const expectedAgent = expected.labels.find((label) =>
				label.startsWith("agent-"),
			);

			const labels = issue.labels.map((label) => label.name).sort();
			assert.equal(issue.number, expected.number);
			assert.equal(issue.title, expected.title);
			if (mustRemainOpenIssueNumbers.has(expected.number)) {
				assert.equal(
					issue.state,
					"OPEN",
					`expected #${expected.number} to stay open`,
				);
			} else {
				assert.match(
					issue.state,
					/^(OPEN|CLOSED)$/,
					`expected #${expected.number} to be a live GitHub issue`,
				);
			}
			assert.deepEqual(
				labels,
				expected.labels,
				`unexpected labels for #${expected.number}`,
			);
			if (expected.number <= 11) {
				assert.ok(
					issue.body.includes(`Source: docs/BACKLOG.md ${expected.backlogId}`),
					`expected #${expected.number} body to preserve source reference`,
				);
				assert.ok(
					issue.body.includes(`Parent: ${expected.parent}`),
					`expected #${expected.number} body to preserve parent`,
				);
				assert.ok(
					issue.body.includes(`Agent lane: ${expectedAgent}`),
					`expected #${expected.number} body to preserve agent lane`,
				);
			} else if (expected.number >= 70) {
				assert.ok(
					issue.body.includes(`Parent epic: ${expected.parent}`),
					`expected #${expected.number} body to preserve parent epic`,
				);
				assert.ok(
					issue.body.includes(`Backlog ID: ${expected.backlogId}`),
					`expected #${expected.number} body to preserve backlog id`,
				);
				for (const required of phase8StatusRequirements(expected.backlogId)) {
					assert.ok(
						issue.body.includes(required),
						`expected #${expected.number} body to preserve Phase 8 guard: ${required}`,
					);
				}
			} else if (expected.number >= 63) {
				assert.ok(
					issue.body.includes(`Parent epic: ${expected.parent}`),
					`expected #${expected.number} body to preserve parent epic`,
				);
				for (const required of phase7StatusRequirements(expected.backlogId)) {
					assert.ok(
						issue.body.includes(required),
						`expected #${expected.number} body to preserve Phase 7 guard: ${required}`,
					);
				}
				assert.ok(
					!issue.body.includes("Shuttle Community or a chosen fallback host"),
					`expected #${expected.number} body to avoid stale Shuttle-primary host wording`,
				);
			} else {
				assert.ok(
					issue.body.includes(`Parent epic: ${expected.parent}`),
					`expected #${expected.number} body to preserve parent epic`,
				);
			}
		}
	},
);
