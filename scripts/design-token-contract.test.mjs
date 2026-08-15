import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const tokensPath = "apps/web/src/styles/tokens.css";
const tokens = existsSync(tokensPath) ? readFileSync(tokensPath, "utf8") : "";
const globalCss = readFileSync("apps/web/src/styles/global.css", "utf8");
const navigationSource = readFileSync(
	"apps/web/src/data/site-navigation.ts",
	"utf8",
);

test("global CSS exposes the Signal / Proof token contract", () => {
	assert.match(tokens, /--color-canvas:\s*#f2f1eb/i);
	assert.match(tokens, /--color-ink:\s*#11120f/i);
	assert.match(tokens, /--color-signal:\s*#d9ff43/i);
	assert.match(tokens, /--color-muted:\s*#666a63/i);
	assert.match(tokens, /--color-media:\s*#ffffff/i);
	assert.match(tokens, /--color-technical:\s*#090a09/i);
	assert.match(tokens, /--font-display:\s*"Archivo Variable"/i);
	assert.match(tokens, /--font-evidence:\s*"JetBrains Mono"/i);
	assert.match(tokens, /--content-max:\s*92rem/i);
	assert.match(tokens, /--reading-max:\s*44rem/i);
	assert.match(tokens, /--focus-ring:/i);
	assert.doesNotMatch(globalCss, /Fraunces|Archivo Narrow/);
});

test("primary navigation follows the four-link visitor model", () => {
	const primaryNavigation = navigationSource.match(
		/export const primaryNavigation = \[([\s\S]*?)\] as const;/,
	)?.[1];
	assert.ok(
		primaryNavigation,
		"primaryNavigation must remain statically defined",
	);

	const primaryLabels = [
		...primaryNavigation.matchAll(/label:\s*"([^"]+)"/g),
	].map((match) => match[1]);
	assert.deepEqual(primaryLabels, ["Work", "About", "Résumé", "Contact"]);
});
