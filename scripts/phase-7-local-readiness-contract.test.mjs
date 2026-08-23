import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	backlog: "docs/BACKLOG.md",
	checklist: "runbooks/FINAL_LAUNCH_CHECKLIST.md",
	evidence: "runbooks/LAUNCH_EVIDENCE.md",
	githubSync: "docs/GITHUB_SYNC.md",
	packet: "runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md",
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

function splitMarkdownTableRow(line) {
	const cells = [];
	let cell = "";
	let escaped = false;

	for (const character of line.trim().slice(1, -1)) {
		if (escaped) {
			cell += character === "|" ? character : `\\${character}`;
			escaped = false;
			continue;
		}

		if (character === "\\") {
			escaped = true;
			continue;
		}

		if (character === "|") {
			cells.push(cell.trim());
			cell = "";
			continue;
		}

		cell += character;
	}

	if (escaped) {
		cell += "\\";
	}

	cells.push(cell.trim());
	return cells;
}

function markdownRows(content) {
	const codeFenceLineNumbers = fencedLineIndexes(content);

	return content
		.split("\n")
		.filter((_, index) => !codeFenceLineNumbers.has(index))
		.filter((line) => line.trim().startsWith("|"))
		.map(splitMarkdownTableRow)
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

test("Phase 7 local readiness records safe local gates without clearing production blockers", () => {
	const backlog = readRequiredFile(files.backlog);
	const checklist = readRequiredFile(files.checklist);
	const evidence = readRequiredFile(files.evidence);
	const githubSync = readRequiredFile(files.githubSync);
	const packet = readRequiredFile(files.packet);

	expectAll(packet, [
		"## Pre-Provider Local Readiness Contract",
		"Status: local-readiness only; production remains blocked",
		"Safe to run now with no provider credentials, deploy tokens, DNS changes, or production restarts.",
		"Provider-mutating commands stay disabled until real provider records, domains, secrets, and rollback targets exist.",
		"Do not run `wrangler pages deploy`, `fly deploy`, `railway up`, or production `xh` smoke commands from this local readiness contract.",
		"Record successful local evidence in `runbooks/LAUNCH_EVIDENCE.md` without closing #63, #64, #65, or #69.",
		'pnpm test:e2e -- --grep "@security|@keyboard|@accessibility|@api-down"',
	]);

	expectTableRow(packet, "Frontend static build readiness", [
		"pnpm build && pnpm bundle:budget",
		"pnpm lighthouse:local",
		"local production-equivalent preview",
		"frontend provider project",
		"production deployment URL",
	]);
	expectTableRow(packet, "Frontend interaction and safety readiness", [
		"Focused Playwright safety grep",
		"route, accessibility, keyboard, security, and API-outage behavior",
		"production frontend smoke",
		"production Lighthouse",
	]);
	expectTableRow(packet, "Rust API package readiness", [
		"cargo fmt --manifest-path apps/api/Cargo.toml --check",
		"cargo clippy --manifest-path apps/api/Cargo.toml --all-targets -- -D warnings",
		"cargo test --manifest-path apps/api/Cargo.toml",
		"cargo audit --file apps/api/Cargo.lock",
		"API host",
		"secret store",
	]);
	expectTableRow(packet, "Local API smoke readiness", [
		"cargo run --manifest-path apps/api/Cargo.toml --bin humankaylee-api",
		"HK_API_CONTACT_DELIVERY_MODE=store",
		"HK_API_CONTACT_STORE_PATH=/tmp/humankaylee-contact-local-readiness.jsonl",
		"GET /api/health",
		"temporary JSONL store",
		"persistent contact store",
		"production CORS origin",
	]);
	expectTableRow(packet, "Domain and metadata readiness", [
		"PUBLIC_SITE_URL",
		"sitemap-index.xml",
		"Open Graph",
		"final domain",
		"DNS",
		"TLS",
	]);
	expectTableRow(packet, "Launch evidence readiness", [
		"node --test scripts/final-launch-checklist-contract.test.mjs scripts/launch-blockers-register-contract.test.mjs scripts/phase-7-deployment-decision-packets-contract.test.mjs scripts/phase-7-local-readiness-contract.test.mjs",
		"blocked production rows",
		"rollback evidence",
		"four approved case studies",
		"redaction approvals",
	]);
	expectTableRow(packet, "Provider auth and target preflight", [
		"node scripts/phase-7-provider-preflight.mjs --summary test-results/phase-7-provider-preflight.json",
		"local/preflight",
		"repo-managed `wrangler` dev dependency",
		"only environment variable names and command presence",
		"no `wrangler pages deploy`, `fly deploy`, `railway up`, production `xh`, or DNS/TLS changes",
		"frontend provider/project target",
		"API host decision",
	]);

	expectTableRow(evidence, "Phase 7 local readiness contract", [
		"node --test scripts/phase-7-local-readiness-contract.test.mjs",
		"Local readiness contract only",
		"not production evidence",
		"production deploy, DNS/TLS, API health, contact handling, rollback, Lighthouse, four approved case studies, and redaction approvals remain blocked",
	]);
	expectTableRow(evidence, "Phase 7 provider preflight", [
		"node scripts/phase-7-provider-preflight.mjs --summary test-results/phase-7-provider-preflight.json",
		"local/preflight",
		"not production evidence",
		"repo-managed `wrangler` dev dependency is present",
		"`fly` and `railway` are still missing",
		"Only environment variable names and command presence are recorded",
	]);

	expectAll(backlog, [
		"scripts/phase-7-local-readiness-contract.test.mjs",
		"scripts/phase-7-provider-preflight.mjs",
		"Pre-provider local readiness contract",
		"provider auth and target preflight",
		"local-readiness only; production remains blocked",
		"four approved case studies",
	]);
	expectAll(githubSync, [
		"Phase 7 local readiness contract status: local-readiness only; production remains blocked.",
		"Phase 7 provider preflight status: local/preflight evidence only; production remains blocked.",
		"repo-managed `wrangler` dev dependency is present",
		"four approved case studies",
		"#63, #64, #65, and #69 remain open",
	]);
	expectAll(checklist, [
		"Status: not launch-ready",
		"Local-only checks and PR checks cannot satisfy a production-live requirement.",
	]);

	for (const content of [backlog, evidence, githubSync, packet]) {
		expectNotContains(content, "Status: launch-ready", "launch-ready status");
		expectNotContains(
			content,
			"Phase 7 approved for launch",
			"Phase 7 launch approval claim",
		);
		expectNotContains(
			content,
			"Production deployment complete",
			"production deployment completion claim",
		);
		expectNotContains(
			content,
			"Local readiness clears production blockers",
			"local evidence overclaim",
		);
	}
});
