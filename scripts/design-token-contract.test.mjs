import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync("apps/web/src/styles/global.css", "utf8");

test("global CSS exposes the Systems Atelier token contract", () => {
	for (const token of [
		"--space-1",
		"--space-2",
		"--space-3",
		"--radius-card",
		"--radius-pill",
		"--motion-fast",
		"--motion-page",
		"--ease-out",
		"--ease-route",
		"--layout-content",
		"--layout-narrow",
		"--z-skip-link",
		"--z-header",
	]) {
		assert.match(css, new RegExp(`${token}:`), `missing CSS token ${token}`);
	}

	assert.match(
		css,
		/--color-tungsten:\s*#c47b31;/,
		"Systems Atelier tungsten token should stay explicit",
	);
	assert.match(
		css,
		/--color-oxidized:\s*#2f6470;/,
		"Systems Atelier oxidized blue token should stay explicit",
	);
});
