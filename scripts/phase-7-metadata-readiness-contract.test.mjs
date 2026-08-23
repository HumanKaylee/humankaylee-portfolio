import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	backlog: "docs/BACKLOG.md",
	baseLayout: "apps/web/src/layouts/BaseLayout.astro",
	evidence: "runbooks/LAUNCH_EVIDENCE.md",
	githubSync: "docs/GITHUB_SYNC.md",
	notesRssSpec: "tests/e2e/notes-rss.spec.ts",
	robots: "apps/web/src/pages/robots.txt.ts",
	rss: "apps/web/src/pages/rss.xml.ts",
	site: "apps/web/src/content/site/site.json",
	sitemap: "apps/web/src/pages/sitemap-index.xml.ts",
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

test("Phase 7 metadata readiness uses shared site metadata without clearing domain blockers", () => {
	const metadataReadinessBoundary =
		"Phase 7 metadata readiness verifies RSS uses shared site metadata with the sitemap, robots, canonical URL, and Open Graph path; this is local readiness only and does not close #65 until final domain, DNS/TLS, and production metadata smoke evidence exist.";
	const backlog = readRequiredFile(files.backlog);
	const baseLayout = readRequiredFile(files.baseLayout);
	const evidence = readRequiredFile(files.evidence);
	const githubSync = readRequiredFile(files.githubSync);
	const notesRssSpec = readRequiredFile(files.notesRssSpec);
	const robots = readRequiredFile(files.robots);
	const rss = readRequiredFile(files.rss);
	const site = JSON.parse(readRequiredFile(files.site));
	const sitemap = readRequiredFile(files.sitemap);

	assert.equal(
		site.siteUrl,
		"https://joepoznanski.io",
		"expected the configured public site origin to stay centralized in site.json",
	);

	for (const [label, content] of [
		["RSS endpoint", rss],
		["sitemap endpoint", sitemap],
		["robots endpoint", robots],
	]) {
		expectContains(
			content,
			'getCollection("site")',
			`${label} site collection`,
		);
		expectContains(content, "site.data.siteUrl.replace", `${label} siteUrl`);
	}

	expectNotContains(
		rss,
		'const siteUrl = "https://joepoznanski.io"',
		"RSS hardcoded public origin",
	);
	expectContains(
		notesRssSpec,
		'readFileSync("apps/web/src/content/site/site.json"',
		"RSS e2e shared site metadata fixture",
	);
	expectContains(
		notesRssSpec,
		"expectedSiteUrl",
		"RSS e2e expected shared site URL",
	);
	expectContains(
		notesRssSpec,
		"<guid>${expectedSiteUrl}${blackScholesNote.path}</guid>",
		"RSS e2e shared site URL guid",
	);

	expectContains(
		baseLayout,
		'getCollection("site")',
		"BaseLayout site collection",
	);
	expectContains(
		baseLayout,
		"const siteUrl = site.data.siteUrl.replace",
		"BaseLayout shared siteUrl",
	);
	expectContains(
		baseLayout,
		"const canonicalUrl = absoluteUrl(siteUrl, canonicalPath)",
		"BaseLayout canonical from shared siteUrl",
	);
	expectContains(
		baseLayout,
		"absoluteUrl( siteUrl, ogImage ?? site.data.defaultOgImage, )",
		"BaseLayout Open Graph image and fallback from shared siteUrl",
	);
	expectContains(
		baseLayout,
		'<meta property="og:url" content={canonicalUrl}',
		"BaseLayout Open Graph URL uses canonicalUrl",
	);
	expectContains(
		baseLayout,
		'<meta property="og:image" content={socialImageUrl}',
		"BaseLayout Open Graph image uses shared socialImageUrl",
	);

	for (const content of [backlog, evidence, githubSync]) {
		expectContains(
			content,
			metadataReadinessBoundary,
			"full Phase 7 metadata readiness launch boundary",
		);
		expectContains(
			content,
			"Phase 7 metadata readiness",
			"Phase 7 metadata readiness evidence",
		);
		expectContains(
			content,
			"RSS uses shared site metadata",
			"RSS shared metadata note",
		);
		expectContains(content, "DNS/TLS", "domain blocker preserved");
		expectNotContains(content, "B-059 closed by local metadata readiness");
		expectNotContains(content, "production domain ready");
		expectNotContains(content, "Phase 7 approved for launch");
	}
});
