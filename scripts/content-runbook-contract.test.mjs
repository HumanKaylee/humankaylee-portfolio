import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const runbookPath = "runbooks/CONTENT_UPDATE_AND_REDACTION.md";

function readRunbook() {
	assert.ok(existsSync(runbookPath), `missing runbook: ${runbookPath}`);

	const content = readFileSync(runbookPath, "utf8");
	assert.ok(content.trim().length > 0, `empty runbook: ${runbookPath}`);
	return content;
}

function expectContains(content, needle, label = needle) {
	assert.ok(content.includes(needle), `expected runbook to include ${label}`);
}

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
