import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const workSource = readFileSync(
	"apps/web/src/content/work/openxhc-linuxcnc.md",
	"utf8",
);

test("the expanded OpenXHC package records exact fresh preview evidence and owner authorization", () => {
	assert.match(workSource, /^redactionStatus: "approved"$/m);
	assert.match(workSource, /^ {2}checklistStatus: "complete"$/m);
	assert.match(workSource, /^ {2}openItems: \[\]$/m);
	assert.match(workSource, /^approvalEvidence:$/m);
	assert.match(workSource, /^ {4}reviewer: "Joe Poznanski"$/m);
	assert.match(workSource, /^ {4}signedOffOn: "2026-08-27"$/m);
	assert.match(workSource, /^ {4}decision: "approved"$/m);
	assert.match(
		workSource,
		/99f05c83-fe84-4d29-b95a-afe95f5d40a8.*96051e09e0d5fdef8b21378d0a17af701f544025/,
	);
	assert.doesNotMatch(workSource, /preview and owner authorization.*pending/i);
});
