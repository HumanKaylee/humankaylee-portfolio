import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	accessibilityRunbook: "runbooks/ACCESSIBILITY_AUDIT.md",
	backlog: "docs/BACKLOG.md",
	capabilityMatrix: "apps/web/src/components/CapabilityMatrix.astro",
	contact: "apps/web/src/pages/contact/index.astro",
	contactForm: "apps/web/src/components/ContactForm.astro",
	evidence: "runbooks/LAUNCH_EVIDENCE.md",
	fallbackRunbook: "runbooks/MOTION_AND_WEBGL_FALLBACK_QA.md",
	noWebglSpec: "tests/e2e/no-webgl.spec.ts",
	proofGallery: "apps/web/src/components/ProofGallery.astro",
	retiredAtlasLoader: "apps/web/public/scripts/project-constellation.mjs",
	quality: "runbooks/QUALITY.md",
	qualitySpec: "tests/e2e/quality-gates.spec.ts",
};

const expectedAccessibilityRoutes = [
	"/",
	"/work/",
	"/work/cryo-flow-sim/",
	"/work/cli-fleet-synchronization-and-mcp-rollout/",
	"/work/remote-workstation-recovery-and-operational-debugging/",
	"/work/black-scholes-wasm/",
	"/about/",
	"/resume/",
	"/notes/",
	"/contact/",
];

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

function qualitySpecRoutes(source) {
	const matrix = source.match(
		/const coreRoutes = \[([\s\S]*?)\] as const;/,
	)?.[1];
	assert.ok(matrix, "quality spec must expose coreRoutes");
	return [...matrix.matchAll(/path:\s*"([^"]+)"/g)].map(([, path]) => path);
}

function accessibilityRunbookRoutes(source) {
	const section = source.match(
		/## Page-by-page checklist([\s\S]*?)(?:\n## |$)/,
	)?.[1];
	assert.ok(section, "accessibility runbook must expose its route checklist");
	return [...section.matchAll(/\|\s*`(\/[^`]*)`\s*\|/g)].map(
		([, path]) => path,
	);
}

test("B-048 accessibility audit has a dedicated artifact and checklist contract", () => {
	const accessibility = readRequiredFile(files.accessibilityRunbook);
	const backlog = readRequiredFile(files.backlog);
	const evidence = readRequiredFile(files.evidence);
	const quality = readRequiredFile(files.quality);
	const qualitySpec = readRequiredFile(files.qualitySpec);

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
	for (const requirement of [
		"Page-by-page checklist",
		"Headings",
		"Landmarks",
		"Keyboard",
		"Contrast",
		"Touch targets",
		"Alt text",
		"Animation summary",
	]) {
		expectContains(accessibility, requirement);
	}
	expectContains(accessibility, 'pnpm test:e2e -- --grep "@accessibility"');
	expectContains(accessibility, 'pnpm test:e2e -- --grep "@keyboard"');
	expectContains(
		accessibility,
		"node --test scripts/accessibility-and-fallback-qa-contract.test.mjs",
	);

	expectContains(quality, "runbooks/ACCESSIBILITY_AUDIT.md");
	for (const currentSurface of [
		"/work/",
		"/work/cryo-flow-sim/",
		"/work/cli-fleet-synchronization-and-mcp-rollout/",
		"/work/remote-workstation-recovery-and-operational-debugging/",
		"ProofGallery",
		"CapabilityMatrix",
		"EvidenceStrip",
		"Static direct contact channels",
	]) {
		expectContains(accessibility, currentSurface);
	}
	for (const retiredSurface of [
		"/projects/",
		"/case-studies/",
		"project atlas",
		"constellation",
		"evidence drawer",
		"contact form",
		"API outage state",
	]) {
		expectNotContains(accessibility, retiredSurface);
	}
	expectContains(evidence, "Accessibility audit checklist");
	expectContains(evidence, "runbooks/ACCESSIBILITY_AUDIT.md");
	assert.deepEqual(
		qualitySpecRoutes(qualitySpec),
		expectedAccessibilityRoutes,
		"the Axe/quality matrix must include every current release route",
	);
	assert.deepEqual(
		accessibilityRunbookRoutes(accessibility),
		expectedAccessibilityRoutes,
		"the accessibility checklist must match the executable Axe matrix",
	);
	const blackScholesRow = accessibility
		.split("\n")
		.find((line) => line.includes("`/work/black-scholes-wasm/`"));
	assert.match(
		blackScholesRow ?? "",
		/@accessibility/,
		"Black-Scholes must cite the executed Axe gate, not runtime coverage alone",
	);
});

test("B-049 preserves rigorous static and no-WebGL evidence for Signal / Proof", () => {
	const backlog = readRequiredFile(files.backlog);
	const evidence = readRequiredFile(files.evidence);
	const fallback = readRequiredFile(files.fallbackRunbook);
	const noWebglSpec = readRequiredFile(files.noWebglSpec);
	const capabilityMatrix = readRequiredFile(files.capabilityMatrix);
	const proofGallery = readRequiredFile(files.proofGallery);
	const quality = readRequiredFile(files.quality);

	expectContains(backlog, "### B-049: Add reduced-motion and no-WebGL QA pass");
	expectContains(backlog, "runbooks/MOTION_AND_WEBGL_FALLBACK_QA.md");
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
	expectContains(
		fallback,
		"pnpm exec playwright test tests/e2e/no-webgl.spec.ts",
	);
	expectContains(
		fallback,
		"node --test scripts/accessibility-and-fallback-qa-contract.test.mjs",
	);
	expectContains(quality, "runbooks/MOTION_AND_WEBGL_FALLBACK_QA.md");
	for (const currentSurface of [
		"ProofGallery",
		"CapabilityMatrix",
		"EvidenceStrip",
		"[data-proof-placement]",
		"[data-capability-proof]",
		"[data-motion-video]",
		"no-webgl-signal-proof-home-linux.png",
		"work-desktop-linux.png",
		"work-cryo-desktop-linux.png",
		"Static direct contact channels",
	]) {
		expectContains(fallback, currentSurface);
	}
	for (const retiredSurface of [
		"project atlas",
		"constellation",
		"systems map",
		"projects-desktop-linux.png",
		"case-study-desktop-linux.png",
		"no-webgl-projects-fallback",
		"@constellation",
		"Contact fallback",
	]) {
		expectNotContains(fallback, retiredSurface);
	}
	for (const retiredQualitySurface of [
		"@api-telemetry",
		"project atlas",
		"no-WebGL project-atlas fallback",
		"no-webgl-projects-fallback",
		"audits home, projects, one case study",
	]) {
		expectNotContains(quality, retiredQualitySurface);
	}
	expectContains(quality, "ProofGallery");
	expectContains(quality, "CapabilityMatrix");
	expectContains(quality, "static direct channels");
	expectContains(
		quality,
		"audits home, Work, Cryogenic Flow, resume, and contact",
	);
	expectContains(evidence, "Reduced-motion and no-WebGL QA");
	expectContains(evidence, "tests/e2e/no-webgl.spec.ts");

	for (const requirement of [
		"@no-webgl",
		".proof-gallery",
		"[data-proof-placement]",
		"[data-capability-proof]",
		'page.locator("canvas, svg")',
		"script[src*='constellation']",
		"Cryogenic flow dashboard showing coordinated valve travel",
		"/work/cryo-flow-sim/",
		"no-webgl-signal-proof-home",
		"toHaveScreenshot",
	]) {
		expectContains(noWebglSpec, requirement);
	}
	expectContains(proofGallery, "<MotionLoop");
	expectContains(proofGallery, "<MediaFrame");
	expectContains(proofGallery, "data-proof-placement");
	expectContains(capabilityMatrix, "data-capability-proof");
	expectNotContains(proofGallery, "ProjectAtlas");
	expectNotContains(proofGallery, "project-constellation.mjs");
	assert.equal(
		existsSync(files.retiredAtlasLoader),
		false,
		"retired WebGL/atlas loader must remain absent",
	);
});

test("contact remains a static direct path with no simulated delivery state", () => {
	const contact = readRequiredFile(files.contact);

	assert.ok(
		!existsSync(files.contactForm),
		"legacy ContactForm component must remain deleted",
	);
	expectContains(contact, 'import { profile } from "../../data/profile"');
	expectContains(contact, "mailto:" + "$" + "{profile.email}");
	expectContains(contact, "profile.linkedin");
	expectContains(contact, "profile.github");
	expectNotContains(contact, "<form");
	expectNotContains(contact, "<script");
	expectNotContains(contact, "/api/contact");
	expectNotContains(contact, 'role="status"');
	for (const claim of [
		"delivery",
		"telemetry",
		"fallback",
		"API health",
		"launch readiness",
		"response time",
	]) {
		expectNotContains(contact, claim);
	}
});
