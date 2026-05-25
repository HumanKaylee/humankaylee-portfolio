import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const AGENTS_PATH = "AGENTS.md";
const LOCAL_PORTFOLIO_SKILL_PATHS = [
	"/home/joe/.codex/skills/humankaylee-portfolio/SKILL.md",
	"/home/joe/.agents/skills/humankaylee-portfolio/SKILL.md",
];

function readRequiredFile(path) {
	assert.ok(existsSync(path), `missing required file: ${path}`);

	const content = readFileSync(path, "utf8");
	assert.ok(content.trim().length > 0, `empty required file: ${path}`);
	return content;
}

function expectContains(
	content,
	needle,
	label = needle,
	subject = "AGENTS.md",
) {
	const normalizedContent = content.replace(/\s+/g, " ");
	const normalizedNeedle = needle.replace(/\s+/g, " ");
	assert.ok(
		normalizedContent.includes(normalizedNeedle),
		`expected ${subject} to include ${label}`,
	);
}

function existingLocalSkillMirrors() {
	return LOCAL_PORTFOLIO_SKILL_PATHS.filter((path) => existsSync(path));
}

function section(content, heading) {
	const headingLine = `## ${heading}`;
	const lines = content.split("\n");
	const startIndex = lines.findIndex((line) => line === headingLine);
	assert.notEqual(
		startIndex,
		-1,
		`expected AGENTS.md to include ${heading} section`,
	);

	const endIndex = lines.findIndex(
		(line, index) => index > startIndex && line.startsWith("## "),
	);
	return lines
		.slice(startIndex + 1, endIndex === -1 ? undefined : endIndex)
		.join("\n");
}

function bulletStarting(sectionContent, prefix) {
	const lines = sectionContent.split("\n");
	const startIndex = lines.findIndex((line) => line.startsWith(`- ${prefix}`));
	assert.notEqual(
		startIndex,
		-1,
		`expected section to include ${prefix} bullet`,
	);

	const bulletLines = [lines[startIndex]];
	for (const line of lines.slice(startIndex + 1)) {
		if (line.startsWith("- ")) {
			break;
		}

		if (line.startsWith("  ")) {
			bulletLines.push(line);
		}
	}

	return bulletLines.join("\n");
}

function expectCurrentHostingTarget(agents) {
	const buildDirection = section(agents, "Build Direction");
	const hostingTarget = bulletStarting(buildDirection, "Hosting target:");

	assert.ok(
		!/\bShuttle\b/i.test(hostingTarget),
		"Hosting target bullet must not list Shuttle as an active API host",
	);

	expectContains(hostingTarget, "Cloudflare Pages frontend");
	expectContains(hostingTarget, "Fly.io, Railway, or another approved host");
	expectContains(hostingTarget, "approved current-host comparison set for #64");
	assert.ok(
		!hostingTarget.includes("current normal Axum API candidates"),
		"Hosting target bullet must not use stale current-normal provider wording",
	);
}

test("repository agent instructions use current hosting and launch-blocker guidance", () => {
	const agents = readRequiredFile(AGENTS_PATH);

	expectCurrentHostingTarget(agents);
	expectContains(agents, "docs/CONTENT_STRATEGY.md");
	expectContains(agents, "docs/CONTENT_REDACTION_GUIDE.md");
	expectContains(agents, "docs/PRIVACY.md");
	expectContains(agents, "Shuttle is not a viable new launch target");
	expectContains(agents, "https://docs.shuttle.dev/docs/shuttle-shutdown");
	expectContains(agents, "Do not use Shuttle for a new production launch");
	expectContains(agents, "not launch-ready");
	expectContains(agents, "production frontend/API targets");
	expectContains(agents, "redaction approvals");
	expectContains(
		agents,
		"Do not close launch blocker issues from local-only, PR-only, or docs-only evidence; production frontend/API targets, DNS/TLS, contact handling, rollback evidence, production Lighthouse, and redaction approvals remain required before launch readiness.",
	);

	assert.ok(
		!agents.includes("Shuttle Rust API initially"),
		"AGENTS.md must not direct new agents toward Shuttle as the initial API host",
	);
	assert.ok(
		!agents.includes("keep Fly.io/Railway fallback documented"),
		"AGENTS.md must not describe current API candidates as mere fallback documentation",
	);
});

test("repository agent instructions surface GitHub Project board guardrails", () => {
	const agents = readRequiredFile(AGENTS_PATH);

	expectContains(agents, "## GitHub And Project Work");
	expectContains(
		agents,
		"Read `docs/GITHUB_SYNC.md` before changing issues, labels, milestones, or GitHub Project state.",
	);
	expectContains(
		agents,
		"Use `GH_PROMPT_DISABLED=1 gh project list --owner HumanKaylee --format json` for Project discovery checks.",
	);
	expectContains(
		agents,
		"Do not run `gh auth refresh` from unattended automation.",
	);
	expectContains(
		agents,
		"Project board recovery requires every open issue in the live issue bridge to have a Project item or a documented skip reason.",
	);
	expectContains(
		agents,
		"Issue sync evidence is not launch readiness, production deployment evidence, post-launch feature approval, assistant-build approval, or Project board recovery.",
	);
});

test("repository agent instructions reject Shuttle as the active hosting target even with legacy warning text", () => {
	const agents = readRequiredFile(AGENTS_PATH);
	const staleAgents = agents.replace(
		/- Hosting target:[\s\S]*?(?=\n- Shuttle is not a viable new launch target)/,
		[
			"- Hosting target: Cloudflare Pages frontend plus Shuttle as the first",
			"  Rust API host, with Fly.io or Railway documented as fallback options.",
		].join("\n"),
	);

	assert.throws(
		() => expectCurrentHostingTarget(staleAgents),
		/Shuttle as an active API host/,
	);
});

test("installed portfolio skill mirrors preserve local launch guardrails", (t) => {
	const mirrorPaths = existingLocalSkillMirrors();
	if (mirrorPaths.length === 0) {
		t.skip("local portfolio skill mirrors are not installed on this runner");
		return;
	}

	const mirrorContents = mirrorPaths.map((path) => ({
		path,
		content: readRequiredFile(path),
	}));

	if (mirrorContents.length > 1) {
		const [firstMirror, ...remainingMirrors] = mirrorContents;
		for (const mirror of remainingMirrors) {
			assert.equal(
				mirror.content,
				firstMirror.content,
				`${mirror.path} should match ${firstMirror.path}`,
			);
		}
	}

	const requiredSkillGuardrails = [
		"Guard installed skill mirrors with `node --test scripts/agent-instructions-contract.test.mjs` after changing portfolio agent instructions.",
		"Do not reboot `rog-strix-joe` or the local laptop as part of portfolio work.",
		"GitHub Project board creation is blocked by missing `project` and `read:project` scopes.",
		"Use `GH_PROMPT_DISABLED=1 gh project list --owner HumanKaylee --format json` for Project discovery checks; do not run `gh auth refresh` from unattended automation.",
		"Do not close launch blocker issues from local-only, PR-only, or docs-only evidence; production frontend/API targets, DNS/TLS, contact handling, rollback evidence, production Lighthouse, and redaction approvals remain required before launch readiness.",
		"Blocked/deferred case-study candidates must not count toward the four-case-study launch minimum.",
		"B-037 visual regression snapshots are implementation evidence only, not production launch evidence",
		'Project constellation import failure is a handled progressive-enhancement fallback: `document.body.dataset.constellationReady === "module-error"` while the static atlas remains usable.',
		"Contact store config must fail fast when `HK_API_CONTACT_DELIVERY_MODE=store` lacks `HK_API_CONTACT_STORE_PATH`.",
		"Blocked/deferred case-study candidates should use explicit unpublished body boundaries, not generic placeholder body copy.",
	];

	for (const mirror of mirrorContents) {
		for (const guardrail of requiredSkillGuardrails) {
			expectContains(mirror.content, guardrail, guardrail, mirror.path);
		}
	}
});
