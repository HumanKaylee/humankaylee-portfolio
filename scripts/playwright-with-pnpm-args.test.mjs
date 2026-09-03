import assert from "node:assert/strict";
import { test } from "node:test";

import { runPlaywright } from "./playwright-with-pnpm-args.mjs";

test("forwards a pipe-containing grep as one Playwright argument without a shell", () => {
	const calls = [];
	const result = runPlaywright(
		["--", "--grep", "mac-mini-shelf|@responsive"],
		(command, args, options) => {
			calls.push({ command, args, options });
			return { status: 0 };
		},
	);

	assert.equal(result.status, 0);
	assert.equal(calls.length, 1);
	assert.equal(calls[0].command, process.execPath);
	assert.match(
		calls[0].args[0],
		/node_modules[\\/]@playwright[\\/]test[\\/]cli\.js$/,
	);
	assert.deepEqual(calls[0].args.slice(1), [
		"test",
		"--grep",
		"mac-mini-shelf|@responsive",
	]);
	assert.deepEqual(calls[0].options, { shell: false, stdio: "inherit" });
});
