import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	readme: "scripts/launch/README.md",
	m3: "scripts/launch/m3-dns-verify.sh",
	m4: "scripts/launch/m4-production-smoke.sh",
};

const expectedHtmlRoutes = [
	"/",
	"/work/",
	"/work/cryo-flow-sim/",
	"/work/cli-fleet-synchronization-and-mcp-rollout/",
	"/work/remote-workstation-recovery-and-operational-debugging/",
	"/work/black-scholes-wasm/",
	"/about/",
	"/resume/",
	"/notes/",
	"/notes/wasm-black-scholes-options-pricer/",
	"/contact/",
];

function read(path) {
	return readFileSync(path, "utf8");
}

function shellArray(source, name) {
	const match = source.match(new RegExp(`${name}=\\(([\\s\\S]*?)\\n\\)`));
	assert.ok(match, `missing shell array ${name}`);
	return [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
}

function withoutShellArray(source, name) {
	return source.replace(new RegExp(`${name}=\\([\\s\\S]*?\\n\\)`), "");
}

test("M3 probes every final Signal / Proof surface and treats old routes only as redirects", () => {
	const m3 = read(files.m3);
	assert.deepEqual(shellArray(m3, "FINAL_HTML_ROUTES"), expectedHtmlRoutes);
	assert.deepEqual(shellArray(m3, "FINAL_ASSET_ROUTES"), [
		"/downloads/joe-poznanski-resume.pdf",
		"/sitemap-index.xml",
		"/robots.txt",
		"/.well-known/security.txt",
		"/wasm/blackscholes/blackscholes_wasm_bg.wasm",
	]);
	assert.deepEqual(shellArray(m3, "LEGACY_REDIRECTS"), [
		"/projects/|/work/",
		"/projects/cryo-flow-sim/|/work/cryo-flow-sim/",
		"/case-studies/|/work/",
		"/case-studies/cryo-flow-sim/|/work/cryo-flow-sim/",
	]);

	for (const requirement of [
		"check_canonical",
		"check_legacy_redirect",
		'rel="canonical"',
		"Content-Type",
		"application/pdf",
		"application/wasm",
	]) {
		assert.ok(m3.includes(requirement), `M3 must include ${requirement}`);
	}

	const m3WithoutLegacyRedirectInputs = withoutShellArray(
		m3,
		"LEGACY_REDIRECTS",
	);
	assert.doesNotMatch(m3WithoutLegacyRedirectInputs, /\/projects\//);
	assert.doesNotMatch(m3WithoutLegacyRedirectInputs, /\/case-studies\//);
	assert.doesNotMatch(m3, /API_DOMAIN|\/api\/health|\/api\/contact|-X\s+POST/);
});

test("M4 is a read-only current-route quality and static Contact smoke", () => {
	const m4 = read(files.m4);
	assert.deepEqual(shellArray(m4, "LIGHTHOUSE_PAGES"), [
		"/",
		"/work/",
		"/work/cryo-flow-sim/",
		"/resume/",
		"/contact/",
	]);
	for (const requirement of [
		"static Contact direct channels",
		"mailto:",
		"linkedin.com",
		"github.com",
		"<form",
		"PLAYWRIGHT_BASE_URL",
		"bundle-budget.mjs",
	]) {
		assert.ok(m4.includes(requirement), `M4 must include ${requirement}`);
	}
	assert.doesNotMatch(m4, /\/projects\/|\/case-studies\//);
	assert.doesNotMatch(
		m4,
		/API_DOMAIN|\/api\/contact|-X\s+POST|contact-form|smoke-cleanup|payload=/i,
	);
});

test("launch README documents current read-only probes without retired success surfaces", () => {
	const readme = read(files.readme);
	for (const requirement of [
		"final Signal / Proof routes",
		"legacy redirect inputs",
		"résumé PDF",
		"canonical URLs",
		"static Contact direct channels",
		"read-only",
	]) {
		assert.ok(
			readme.includes(requirement),
			`README must include ${requirement}`,
		);
	}
	assert.doesNotMatch(
		readme,
		/API_DOMAIN|\/api\/contact|contact-form|contact form|POST per run|4\/4 case studies/i,
	);
});
