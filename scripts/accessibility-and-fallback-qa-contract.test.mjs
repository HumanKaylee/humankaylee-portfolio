import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	accessibilityRunbook: "runbooks/ACCESSIBILITY_AUDIT.md",
	backlog: "docs/BACKLOG.md",
	evidence: "runbooks/LAUNCH_EVIDENCE.md",
	fallbackRunbook: "runbooks/MOTION_AND_WEBGL_FALLBACK_QA.md",
	noWebglSpec: "tests/e2e/no-webgl.spec.ts",
	projectAtlasSpec: "tests/e2e/project-atlas.spec.ts",
	quality: "runbooks/QUALITY.md",
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

test("B-048 accessibility audit has a dedicated artifact and checklist contract", () => {
	const accessibility = readRequiredFile(files.accessibilityRunbook);
	const backlog = readRequiredFile(files.backlog);
	const evidence = readRequiredFile(files.evidence);
	const quality = readRequiredFile(files.quality);

	expectContains(backlog, "### B-048: Add accessibility audit pass");
	expectContains(backlog, "runbooks/ACCESSIBILITY_AUDIT.md");
	expectContains(
		backlog,
		'pnpm test:e2e -- --grep "@accessibility"',
		"B-048 accessibility command",
	);
	expectContains(
		backlog,
		"scripts/accessibility-and-fallback-qa-contract.test.mjs",
		"B-048 contract command",
	);

	expectContains(accessibility, "# Accessibility Audit Runbook");
	expectContains(accessibility, "Status: local and CI evidence only");
	expectContains(accessibility, "not production launch evidence");
	expectContains(accessibility, "Page-by-page checklist");
	expectContains(accessibility, "Headings");
	expectContains(accessibility, "Landmarks");
	expectContains(accessibility, "Keyboard");
	expectContains(accessibility, "Contrast");
	expectContains(accessibility, "Touch targets");
	expectContains(accessibility, "Alt text");
	expectContains(accessibility, "Animation summary");
	expectContains(accessibility, 'pnpm test:e2e -- --grep "@accessibility"');
	expectContains(accessibility, 'pnpm test:e2e -- --grep "@keyboard"');
	expectContains(
		accessibility,
		"node --test scripts/accessibility-and-fallback-qa-contract.test.mjs",
	);

	expectContains(quality, "runbooks/ACCESSIBILITY_AUDIT.md");
	expectContains(evidence, "Accessibility audit checklist");
	expectContains(evidence, "runbooks/ACCESSIBILITY_AUDIT.md");
});

test("B-049 reduced-motion and no-WebGL QA has a dedicated artifact contract", () => {
	const backlog = readRequiredFile(files.backlog);
	const evidence = readRequiredFile(files.evidence);
	const fallback = readRequiredFile(files.fallbackRunbook);
	const noWebglSpec = readRequiredFile(files.noWebglSpec);
	const projectAtlasSpec = readRequiredFile(files.projectAtlasSpec);
	const quality = readRequiredFile(files.quality);

	expectContains(backlog, "### B-049: Add reduced-motion and no-WebGL QA pass");
	expectContains(backlog, "runbooks/MOTION_AND_WEBGL_FALLBACK_QA.md");
	expectContains(
		backlog,
		'pnpm test:e2e -- --grep "@reduced-motion|@motion|@constellation"',
		"B-049 focused Playwright command",
	);
	expectContains(
		backlog,
		"scripts/accessibility-and-fallback-qa-contract.test.mjs",
		"B-049 contract command",
	);

	expectContains(fallback, "# Motion And WebGL Fallback QA Runbook");
	expectContains(fallback, "Status: local and CI evidence only");
	expectContains(fallback, "not production launch evidence");
	expectContains(fallback, "Reduced-motion evidence");
	expectContains(fallback, "No-WebGL fallback evidence");
	expectContains(fallback, "tests/e2e/visual-regression.spec.ts-snapshots");
	expectContains(fallback, "tests/e2e/no-webgl.spec.ts");
	expectContains(fallback, "no-webgl-projects-fallback");
	expectContains(fallback, "projects-desktop-linux.png");
	expectContains(fallback, "projects-mobile-linux.png");
	expectContains(
		fallback,
		"pnpm exec playwright test tests/e2e/no-webgl.spec.ts",
	);
	expectContains(
		fallback,
		"pnpm exec playwright test tests/e2e/no-webgl.spec.ts --update-snapshots",
	);
	expectContains(fallback, 'pnpm test:e2e -- --grep "@reduced-motion"');
	expectContains(fallback, 'pnpm test:e2e -- --grep "@motion"');
	expectContains(fallback, 'pnpm test:e2e -- --grep "@constellation"');
	expectContains(fallback, "mobile-skipped");
	expectContains(fallback, "reduced-motion");
	expectContains(fallback, "lazy desktop constellation import fails");
	expectContains(fallback, "module-error");
	expectContains(projectAtlasSpec, "project-constellation.mjs");
	expectContains(projectAtlasSpec, "module-error");
	expectContains(
		fallback,
		"node --test scripts/accessibility-and-fallback-qa-contract.test.mjs",
	);

	expectContains(quality, "runbooks/MOTION_AND_WEBGL_FALLBACK_QA.md");
	expectContains(evidence, "Reduced-motion and no-WebGL QA");
	expectContains(evidence, "runbooks/MOTION_AND_WEBGL_FALLBACK_QA.md");
	expectContains(evidence, "tests/e2e/no-webgl.spec.ts");

	expectContains(noWebglSpec, "@no-webgl");
	expectContains(noWebglSpec, "no-webgl-projects-fallback");
	expectContains(noWebglSpec, "Accessible project atlas");
	expectContains(noWebglSpec, "data-project-constellation");
	expectContains(noWebglSpec, "toHaveScreenshot");
});
