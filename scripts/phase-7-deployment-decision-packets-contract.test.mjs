import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	backlog: "docs/BACKLOG.md",
	blockers: "runbooks/LAUNCH_BLOCKERS_REGISTER.md",
	checklist: "runbooks/FINAL_LAUNCH_CHECKLIST.md",
	deployment: "runbooks/DEPLOYMENT.md",
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

test("Phase 7 deployment decision packets document launch blockers without clearing them", () => {
	const backlog = readRequiredFile(files.backlog);
	const blockers = readRequiredFile(files.blockers);
	const checklist = readRequiredFile(files.checklist);
	const deployment = readRequiredFile(files.deployment);
	const evidence = readRequiredFile(files.evidence);
	const githubSync = readRequiredFile(files.githubSync);
	const packet = readRequiredFile(files.packet);

	expectAll(backlog, [
		"### B-057: Configure Cloudflare Pages frontend deployment",
		"### B-058: Deploy Rust API to selected host",
		"### B-059: Configure production domain and canonical URLs",
		"### B-063: Complete launch checklist",
		"runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md",
		"scripts/phase-7-deployment-decision-packets-contract.test.mjs",
	]);

	expectAll(packet, [
		"# Phase 7 Deployment Decision Packets",
		"Status: decision packets only; not launch-ready",
		"Scope: B-057 through B-059 and B-063",
		"#63",
		"#64",
		"#65",
		"#69",
		"Do not close #63, #64, #65, or #69 from this packet alone.",
		"Do not mark production smoke, DNS, TLS, API health, contact handling, rollback, Lighthouse, or redaction approvals as passed from local or PR-only evidence.",
		"runbooks/FINAL_LAUNCH_CHECKLIST.md",
		"runbooks/LAUNCH_EVIDENCE.md",
		"runbooks/LAUNCH_BLOCKERS_REGISTER.md",
		"Direct Upload projects cannot later switch to Git integration",
		"successful production deployments are rollback targets",
		"rollback is image-only, not database/config/secrets rollback",
		"Older deployments outside plan retention cannot be rolled back",
		"Shuttle is ceasing operations",
	]);

	expectTableRow(packet, "Cloudflare Pages frontend deployment", [
		"B-057",
		"#63",
		"Blocked until provider project",
		"pnpm build",
		"dist",
		"PUBLIC_SITE_URL",
		"PUBLIC_API_BASE_URL",
		"Successful preview or production deploy log",
	]);
	expectTableRow(packet, "Rust API deployment", [
		"B-058",
		"#64",
		"Blocked until API host decision",
		"GET /api/health",
		"HK_API_ALLOWED_ORIGINS",
		"HK_API_CONTACT_DELIVERY_MODE",
		"CORS",
		"rollback target",
	]);
	expectTableRow(packet, "Production domain and canonical URLs", [
		"B-059",
		"#65",
		"Blocked until final domain",
		"DNS",
		"TLS",
		"PUBLIC_SITE_URL",
		"sitemap",
		"Open Graph",
	]);
	expectTableRow(packet, "Final launch checklist", [
		"B-063",
		"#69",
		"Blocked until B-057, B-058, B-059",
		"four approved case studies",
		"production Lighthouse",
		"rollback evidence",
	]);

	expectAll(evidence, [
		"Phase 7 deployment decision packets",
		"Decision packet only",
		"Blocked / not run",
		"#63",
		"#64",
		"#65",
		"#69",
		"runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md",
	]);
	expectAll(githubSync, [
		"#63 remains open because the Cloudflare Pages frontend provider/project and production deploy evidence are not complete; #64 remains open because the API host/provider and public /api/health evidence are not complete; #65 remains open because the final domain, canonical URLs, DNS, and TLS evidence are not complete; #69 remains open because launch validation evidence is not complete.",
		"Phase 7 deployment decision packet status: progress evidence only",
		"#63, #64, #65, and #69 remain open",
		"runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md",
	]);
	expectAll(blockers, [
		"Phase 7 deployment decision packets",
		"runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md",
	]);
	expectAll(checklist, [
		"GitHub issues #63, #64, #65, and #69 remain open until provider, deployment, domain, and launch evidence exist.",
		"runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md",
		"Phase 7 Deployment Decision Packets",
	]);
	expectAll(deployment, [
		"runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md",
		"Phase 7 Deployment Decision Packets",
	]);

	for (const content of [
		backlog,
		blockers,
		checklist,
		deployment,
		evidence,
		githubSync,
		packet,
	]) {
		expectNotContains(content, "Status: launch-ready");
		expectNotContains(content, "Phase 7 approved for launch");
		expectNotContains(content, "Production deployment complete");
	}
});
