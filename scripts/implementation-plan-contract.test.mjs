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
