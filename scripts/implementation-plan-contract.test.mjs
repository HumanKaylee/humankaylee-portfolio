import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	plan: "docs/IMPLEMENTATION_AND_TEST_PLAN.md",
	roadmap: "docs/ROADMAP.md",
};

function read(path) {
	assert.ok(existsSync(path), `missing required file: ${path}`);
	const content = readFileSync(path, "utf8");
	assert.ok(content.trim().length > 0, `empty file: ${path}`);
	return content;
}

function contains(content, needle, label = needle) {
	assert.ok(content.includes(needle), `expected content to include ${label}`);
}

function containsAll(content, needles, label) {
	for (const needle of needles) {
		contains(content, needle, `${label || "required text"}: ${needle}`);
	}
}

const plan = read(files.plan);
const roadmap = read(files.roadmap);

const implemented = [
	"B-031",
	"B-032",
	"B-033",
	"B-034",
	"B-035",
	"B-036",
	"B-037",
];

const phase5Implemented = [
	"B-038",
	"B-039",
	"B-040",
	"B-041",
	"B-044",
	"B-045",
	"B-046",
	"B-047",
];

test("Phase 4 docs split implemented and remaining work without overstating launch state", () => {
	containsAll(plan, implemented, "implemented Phase 4 slices");
	contains(
		plan,
		"desktop-gated SVG/HTML project constellation with lazy focus helper",
	);
	contains(plan, "Local PR evidence in place today");
	contains(plan, "B-035");
	contains(
		plan,
		"does not remove the separate provider, domain, redaction, production smoke, rollback, or contact-storage launch blockers",
	);
	contains(plan, "Do not claim Three.js, R3F, or WebGL is shipping");
	contains(plan, "Active guard commands for phase 4 status checks");
	contains(plan, 'pnpm test:e2e -- --grep "@visual-surfaces"');
	contains(plan, 'pnpm test:e2e -- --grep "static systems map hero"');
	contains(plan, 'pnpm test:e2e -- --grep "@atlas"');
	contains(plan, 'pnpm test:e2e -- --grep "@constellation"');
	contains(plan, 'pnpm test:e2e -- --grep "@motion"');
	contains(plan, 'pnpm test:e2e -- --grep "@route-continuity"');
	contains(plan, "pnpm test:visual");

	contains(roadmap, "B-031/032/033/034/035/036/037");
	contains(roadmap, "Current PR status:");
	contains(
		roadmap,
		"desktop-gated SVG/HTML constellation with a lazy focus helper",
	);
	contains(roadmap, "not by a WebGL/R3F shipping claim");

	assert.ok(
		!plan.toLowerCase().includes("three.js ships"),
		"plan must not claim Three.js ships",
	);
	assert.ok(
		!plan.toLowerCase().includes("r3f ships"),
		"plan must not claim R3F ships",
	);
	assert.ok(
		!plan.toLowerCase().includes("webgl ships"),
		"plan must not claim WebGL ships",
	);
	assert.ok(
		!roadmap.toLowerCase().includes("three.js ships"),
		"roadmap must not claim Three.js ships",
	);
	assert.ok(
		!roadmap.toLowerCase().includes("r3f ships"),
		"roadmap must not claim R3F ships",
	);
	assert.ok(
		!roadmap.toLowerCase().includes("webgl ships"),
		"roadmap must not claim WebGL ships",
	);
});

test("Phase 5 docs record local backend evidence without overstating production readiness", () => {
	containsAll(plan, phase5Implemented, "implemented Phase 5 slices");
	contains(plan, "structured JSON tracing");
	contains(plan, "injectable cached project metadata provider");
	contains(plan, "slow-refresh stale-cache fallback tests");
	contains(
		plan,
		"does not remove the separate provider, domain, production secret",
	);
	contains(plan, "persistent contact storage");
	contains(plan, "B-042");
	contains(plan, "B-043");
	contains(plan, "Active guard commands for phase 5 status checks");
	contains(plan, "cargo audit --file apps/api/Cargo.lock");
	contains(
		plan,
		"sudo podman build -t humankaylee-api:local-check -f apps/api/Dockerfile apps/api",
	);
	contains(
		plan,
		"xh --check-status --body GET http://127.0.0.1:8787/api/projects/live",
	);

	contains(roadmap, "B-038/039/040/041/044/045/046/047");
	contains(roadmap, "Current PR status:");
	contains(roadmap, "structured JSON startup telemetry");
	contains(roadmap, "stale-safe cached project metadata");
	contains(roadmap, "Current production blockers:");
	contains(roadmap, "B-043 remains blocked for production");

	assert.ok(
		!plan.toLowerCase().includes("production contact handling is approved"),
		"plan must not approve production contact handling",
	);
	assert.ok(
		!roadmap.toLowerCase().includes("production contact handling is approved"),
		"roadmap must not approve production contact handling",
	);
});

test("implementation plan is swarm-ready for content privacy and legacy API host boundaries", () => {
	containsAll(
		plan,
		[
			"AGENTS.md",
			"docs/CONTENT_STRATEGY.md",
			"docs/CONTENT_REDACTION_GUIDE.md",
			"docs/PRIVACY.md",
			"docs/ARCHITECTURE.md",
			"docs/ROADMAP.md",
			"docs/BACKLOG.md",
			"docs/OPERATIONS.md",
			"docs/GITHUB_SYNC.md",
			"runbooks/LAUNCH_EVIDENCE.md",
			"Do not start implementation until the executor has read every file in the Source of Truth list.",
			"Preflight evidence must include sanitized command output for",
			"Final resume PDF source is resolved locally",
			"Shuttle remains legacy compatibility only",
			"Do not use Shuttle as a new production API host",
		],
		"swarm-ready plan guidance",
	);

	containsAll(
		roadmap,
		[
			"Final resume PDF source is resolved locally",
			"production `/resume/` and PDF-link smoke evidence is still required",
		],
		"resume source boundary",
	);

	assert.ok(
		!plan.includes("final PDF source remains an open decision"),
		"plan must not reopen the resolved local resume source decision",
	);
	assert.ok(
		!roadmap.includes("final PDF source remains an open decision"),
		"roadmap must not reopen the resolved local resume source decision",
	);
});

test("implementation plan has a current-state overlay for blocked goal continuations", () => {
	containsAll(
		plan,
		[
			"## Current Repo State / Issue Overlay",
			"Current goal continuations must treat completed or local-evidence items as guard-check targets, not duplicate implementation tasks.",
			"Keep #20/#21/#24/#25/#63/#64/#65/#69/#70-#74 open unless the live verifier and documented external evidence gates prove otherwise.",
			"provider/domain/auth/contact/redaction blockers are unresolved",
			"continue only non-blocked local-readiness, docs-sync, guardrail, and verification-hardening work",
		],
		"current-state overlay",
	);

	containsAll(
		plan,
		[
			"stop deployment or launch work at the documented pause conditions",
			"do not close #20/#21/#24/#25/#63/#64/#65/#69/#70-#74 from local-only, PR-only, or docs-only evidence",
		],
		"goal prompt blocker handling",
	);

	assert.equal(
		plan.match(/^pnpm preview$/gm)?.length ?? 0,
		1,
		"bare long-running pnpm preview must appear only in the root command contract, not automated verification lists",
	);
});

test("implementation plan ownership lanes match current repo paths", () => {
	containsAll(
		plan,
		[
			"apps/web/src/components/SiteHeader.astro",
			"apps/web/src/components/SiteFooter.astro",
			"apps/web/src/components/BuildTelemetryStrip.astro",
			"apps/web/src/components/ProjectAtlas.astro",
			"apps/web/src/components/ProjectCard.astro",
			"apps/web/src/components/AudienceChips.astro",
			"apps/web/src/components/SystemsMapHero.astro",
			"apps/web/src/components/EvidenceDrawer.astro",
			"apps/web/public/scripts/project-constellation.mjs",
			"apps/web/src/components/ContactForm.astro",
			"apps/web/public/downloads/",
			"apps/web/public/social/",
			"apps/web/src/lib/contracts/",
		],
		"current ownership paths",
	);

	for (const stalePath of [
		"apps/web/src/components/chrome/",
		"apps/web/src/components/atlas/",
		"apps/web/src/components/hero/",
		"apps/web/src/components/contact/",
		"apps/web/src/lib/project-model/",
		"apps/web/src/lib/motion/",
		"apps/web/src/lib/webgl/",
		"apps/web/src/lib/contact-client/",
		"apps/web/public/content/",
		"apps/web/public/interactive/",
		"apps/web/src/lib/contracts/api.ts",
		"root `justfile`",
		"`infra/`",
	]) {
		assert.ok(
			!plan.includes(stalePath),
			`ownership lane must not reference stale path: ${stalePath}`,
		);
	}
});
