import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const runbookPath = "runbooks/CONTENT_UPDATE_AND_REDACTION.md";
const contentStrategyPath = "docs/CONTENT_STRATEGY.md";
const contentRedactionGuidePath = "docs/CONTENT_REDACTION_GUIDE.md";
const backlogPath = "docs/BACKLOG.md";
const reviewedLaunchBoundary =
	"`reviewed` is never launch-eligible; the launch-eligible case-study count stays `0` until real human approval evidence exists.";
const xplaneBacklogTitle =
	"### B-069: Publish X-Plane FOV study and homepage clarity corrections";
const xplaneAcceptanceCriteria = [
	"Publish the sanitized X-Plane Work entry on Home, Work, sitemap, and its canonical detail route.",
	"Preserve two flagship, two supporting, and two archive entries with Cryogenic Flow as hero.",
	"Remove visitor-facing `unexpected clamp events` copy.",
	"Explain Conformal Cooling's injection-mold use case and metal-additive-manufacturing boundary without unsupported performance claims.",
	"Replace the confusing cavity/channel visual with a reviewed render from real retained meshes.",
	"Pass media, private-content, accessibility, responsive, no-JavaScript, reduced-motion, browser, build, Rust, CI, preview, and production gates.",
	"Retain the previous Cloudflare production deployment as rollback.",
];

function readRunbook() {
	assert.ok(existsSync(runbookPath), `missing runbook: ${runbookPath}`);

	const content = readFileSync(runbookPath, "utf8");
	assert.ok(content.trim().length > 0, `empty runbook: ${runbookPath}`);
	return content;
}

function readContentStrategy() {
	assert.ok(
		existsSync(contentStrategyPath),
		`missing content strategy doc: ${contentStrategyPath}`,
	);

	const content = readFileSync(contentStrategyPath, "utf8");
	assert.ok(
		content.trim().length > 0,
		`empty content strategy doc: ${contentStrategyPath}`,
	);
	return content;
}

function readContentRedactionGuide() {
	assert.ok(
		existsSync(contentRedactionGuidePath),
		`missing content redaction guide: ${contentRedactionGuidePath}`,
	);

	const content = readFileSync(contentRedactionGuidePath, "utf8");
	assert.ok(
		content.trim().length > 0,
		`empty content redaction guide: ${contentRedactionGuidePath}`,
	);
	return content;
}

function readBacklog() {
	assert.ok(existsSync(backlogPath), `missing backlog: ${backlogPath}`);

	const content = readFileSync(backlogPath, "utf8");
	assert.ok(content.trim().length > 0, `empty backlog: ${backlogPath}`);
	return content;
}

function expectContains(content, needle, label = needle) {
	assert.ok(content.includes(needle), `expected runbook to include ${label}`);
}

function normalizeContent(content) {
	return content.replace(/\s+/g, " ").trim();
}

function contentIncludesNormalized(content, needle) {
	return normalizeContent(content).includes(normalizeContent(needle));
}

function expectStrategyContains(content, needle, label = needle) {
	assert.ok(
		contentIncludesNormalized(content, needle),
		`expected content strategy to include ${label}`,
	);
}

function expectStrategyNotContains(content, needle, label = needle) {
	assert.ok(
		!content.includes(needle),
		`expected content strategy to exclude ${label}`,
	);
}

function expectStrategyContainsAll(content, entries) {
	for (const [needle, label] of entries) {
		expectStrategyContains(content, needle, label);
	}
}

function extractMarkdownFenceAfterHeading(content, heading) {
	const headingIndex = content.indexOf(`${heading}\n`);
	assert.notEqual(
		headingIndex,
		-1,
		`missing content strategy heading: ${heading}`,
	);

	const afterHeading = content.slice(headingIndex + heading.length);
	const match = afterHeading.match(/```md\n([\s\S]*?)\n```/);
	assert.ok(
		match,
		`missing markdown fence after content strategy heading: ${heading}`,
	);
	return match[1];
}

function extractFrontmatter(template) {
	const match = template.match(/^---\n([\s\S]*?)\n---/);
	assert.ok(match, "case study template must start with frontmatter");
	return match[1];
}

function extractHeadingSection(content, heading) {
	const start = content.indexOf(`${heading}\n`);
	assert.notEqual(start, -1, `missing heading: ${heading}`);
	const afterHeading = content.slice(start + heading.length + 1);
	const nextHeading = afterHeading.search(/^#{1,3} /m);
	return nextHeading === -1 ? afterHeading : afterHeading.slice(0, nextHeading);
}

test("B-069 preserves the complete X-Plane release contract", () => {
	const section = extractHeadingSection(readBacklog(), xplaneBacklogTitle);

	assert.match(section, /^Priority: P0$/m);
	assert.match(section, /^Depends on: B-063$/m);
	const acceptanceBullets = section
		.split(/\r?\n/)
		.filter((line) => line.startsWith("- "))
		.map((line) => line.slice(2));
	assert.deepEqual(
		acceptanceBullets,
		xplaneAcceptanceCriteria,
		"B-069 must keep exactly the seven approved acceptance criteria",
	);
});

test("content update and redaction runbook covers the required workflow", () => {
	const content = readRunbook();

	expectContains(content, "# Content Update And Redaction Runbook", "title");
	assert.match(content, /^Date: \d{4}-\d{2}-\d{2}$/m, "date field shape");
	expectContains(content, "## Add A Project", "project addition heading");
	expectContains(content, "## Add A Case Study", "case study addition heading");
	expectContains(
		content,
		"## Add A Note Or Build Log Entry",
		"note/build-log addition heading",
	);
	expectContains(
		content,
		"## Redaction Checklist",
		"redaction checklist heading",
	);
	expectContains(
		content,
		"## Publication Review Flow",
		"publication review steps heading",
	);
	expectContains(content, "publicationStatus", "publicationStatus");
	expectContains(content, "redactionStatus", "redactionStatus");
	expectContains(content, "redactionReview", "redactionReview");
	expectContains(content, "approvalEvidence", "approvalEvidence");
	expectContains(content, "checklistStatus", "checklistStatus");
	expectContains(content, "openItems", "openItems");
	expectContains(content, "guidePath", "guidePath");
	expectContains(
		content,
		"apps/web/src/content.config.ts",
		"Astro content config",
	);
	expectContains(content, "docs/CONTENT_REDACTION_GUIDE.md", "guide path");
	expectContains(
		content,
		"runbooks/CONTENT_REDACTION_STATUS.md",
		"redaction status index",
	);
	expectContains(content, "No private content rule", "no private content rule");
	expectContains(
		content,
		"Creative Web Systems Atlas Demo",
		"existing content-item review example",
	);
	expectContains(
		content,
		"Launch eligibility requires all four conditions",
		"launch eligibility gate",
	);
	expectContains(
		content,
		"`publicationStatus` is `publish`",
		"launch publication status requirement",
	);
	expectContains(
		content,
		"`redactionStatus` is `approved`",
		"launch redaction status requirement",
	);
	expectContains(
		content,
		"understandable without private context",
		"private-context-free readability requirement",
	);
	expectContains(
		content,
		"Every linked artifact has passed the redaction checklist",
		"linked artifact review requirement",
	);
	expectContains(
		content,
		"`approvalEvidence` records human signoff, artifact inspection, and production or owner-approved production-equivalent provider preview evidence",
		"approved evidence record requirement",
	);
	expectContains(
		content,
		"`pnpm test -- --run content`",
		"content test verification command",
	);
	expectContains(
		content,
		"repository's full unit and Node",
		"honest test command scope",
	);
	expectContains(
		content,
		'`pnpm test:e2e -- --grep "case-study routes @case-studies|quality @quality"`',
		"e2e verification command",
	);
	expectContains(content, "Prettier", "prettier check guidance");
	expectContains(content, "pnpm lint", "lint verification command");
	expectContains(content, "pnpm typecheck", "typecheck verification command");
	expectContains(
		content,
		"pnpm test:e2e -- tests/e2e/case-study-routes.spec.ts",
		"case-study route file verification command",
	);
	expectContains(
		content,
		"pnpm test:e2e -- tests/e2e/quality-gates.spec.ts",
		"quality gate file verification command",
	);
	expectContains(content, "pnpm build && pnpm bundle:budget", "bundle gate");
	expectContains(content, "pnpm lighthouse:local", "Lighthouse escalation");
	expectContains(content, "Manual privacy review", "manual privacy review");
});

test("content strategy doc uses the live schema and launch eligibility wording", () => {
	const content = readContentStrategy();
	const caseStudyTemplate = extractMarkdownFenceAfterHeading(
		content,
		"## Case Study Template",
	);
	const caseStudyFrontmatter = extractFrontmatter(caseStudyTemplate);
	const shortProjectCardTemplate = extractMarkdownFenceAfterHeading(
		content,
		"## Short Project Card Template",
	);

	expectStrategyNotContains(
		content,
		"redaction_status",
		"stale redaction_status field",
	);
	expectStrategyNotContains(
		content,
		"publication_status",
		"stale publication_status field",
	);
	expectStrategyNotContains(
		content,
		"audience_fit",
		"stale audience_fit field",
	);
	expectStrategyNotContains(
		content,
		"hero_artifact",
		"stale hero_artifact field",
	);
	expectStrategyNotContains(content, "repo_url", "stale repo_url field");
	expectStrategyNotContains(content, "demo_url", "stale demo_url field");
	expectStrategyNotContains(
		content,
		'status: "draft"',
		"stale status template field",
	);
	expectStrategyNotContains(
		content,
		"Published, draft, private, or redacted",
		"stale short-card status list",
	);
	expectStrategyNotContains(
		caseStudyFrontmatter,
		'featuredEvidence: ""',
		"scalar featuredEvidence template",
	);
	expectStrategyNotContains(
		caseStudyFrontmatter,
		"links: []",
		"array links template",
	);
	expectStrategyNotContains(
		caseStudyFrontmatter,
		'checklistStatus: "incomplete"',
		"invalid checklistStatus template value",
	);

	expectStrategyContains(
		caseStudyFrontmatter,
		'publicationStatus: "defer"',
		"case-study template publicationStatus",
	);
	expectStrategyContains(
		caseStudyFrontmatter,
		'redactionStatus: "draft"',
		"case-study template redactionStatus",
	);
	expectStrategyContains(
		caseStudyFrontmatter,
		"audienceFit:",
		"case-study template audienceFit",
	);
	expectStrategyContains(
		caseStudyFrontmatter,
		"featuredEvidence:",
		"case-study template featuredEvidence",
	);
	expectStrategyContainsAll(caseStudyFrontmatter, [
		["links:", "case-study template links"],
		['  repo: ""', "links repo field"],
		['  demo: ""', "links demo field"],
		['  docs: ""', "links docs field"],
		["  screenshots:", "links screenshots field"],
		["  artifacts:", "links artifacts field"],
		["seo:", "case-study template SEO"],
		['  title: ""', "SEO title field"],
		['  description: ""', "SEO description field"],
		["canonicalPath:", "SEO canonical path"],
		["ogImage:", "SEO Open Graph image"],
		["redactionReview:", "case-study template redactionReview"],
		[
			'guidePath: "docs/CONTENT_REDACTION_GUIDE.md"',
			"redaction review guide path",
		],
		['  reviewer: ""', "redaction review reviewer field"],
		['  reviewedOn: ""', "redaction review reviewedOn field"],
		['checklistStatus: "not-started"', "valid default checklistStatus"],
		["  openItems: []", "redaction review openItems field"],
		['  notes: ""', "redaction review notes field"],
		["issueTrace:", "case-study template issueTrace"],
		["  backlogId:", "issueTrace backlogId key"],
		["  githubIssue:", "issueTrace githubIssue key"],
		["  parentIssue:", "issueTrace parentIssue key"],
		["  closureRule:", "issueTrace closureRule key"],
		['  label: ""', "featuredEvidence label field"],
		['  summary: ""', "featuredEvidence summary field"],
		['  scope: ""', "featuredEvidence scope field"],
	]);
	expectStrategyContains(
		shortProjectCardTemplate,
		"Publication status: `publish`, `needs-redaction`, or `defer`.",
		"short-card publication status values",
	);
	expectStrategyContains(
		content,
		'publicationStatus: "publish"',
		"launch publicationStatus requirement",
	);
	expectStrategyContains(
		content,
		'redactionStatus: "approved"',
		"launch redactionStatus requirement",
	);
	expectStrategyContains(
		content,
		"understandable public story",
		"public-story readability requirement",
	);
	expectStrategyContains(
		content,
		"artifact checklist pass",
		"artifact checklist pass requirement",
	);
	expectStrategyContains(content, "approvalEvidence", "approvalEvidence field");
	expectStrategyContains(
		content,
		"human signoff, linked-artifact inspection, and production or owner-approved production-equivalent provider preview evidence",
		"approved evidence field description",
	);
});

test("content strategy and redaction guide reject reviewed launch eligibility", () => {
	const contentStrategy = readContentStrategy();
	const contentRedactionGuide = readContentRedactionGuide();

	expectStrategyContains(
		contentStrategy,
		reviewedLaunchBoundary,
		"reviewed launch-eligibility boundary",
	);
	assert.ok(
		contentIncludesNormalized(contentRedactionGuide, reviewedLaunchBoundary),
		"expected content redaction guide to include reviewed launch-eligibility boundary",
	);
});

test("reviewed launch boundary matcher tolerates markdown line wrapping", () => {
	const wrappedBoundary = [
		"`reviewed` is never launch-eligible; the launch-eligible case-study count",
		"stays `0` until real human approval evidence exists.",
	].join("\n");

	assert.ok(contentIncludesNormalized(wrappedBoundary, reviewedLaunchBoundary));
});
