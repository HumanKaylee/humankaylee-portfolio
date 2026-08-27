import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const workSource = readFileSync(
	"apps/web/src/content/work/openxhc-linuxcnc.md",
	"utf8",
);

test("the expanded OpenXHC package stays reviewed until fresh preview evidence and owner authorization", () => {
	assert.match(workSource, /^redactionStatus: "reviewed"$/m);
	assert.match(workSource, /^ {2}checklistStatus: "partial"$/m);
	assert.match(
		workSource,
		/Fresh provider preview and owner authorization for the expanded recruiter package are pending\./,
	);
	assert.doesNotMatch(workSource, /^approvalEvidence:/m);
});
