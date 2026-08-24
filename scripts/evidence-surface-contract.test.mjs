import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	evidenceStrip: "apps/web/src/components/EvidenceStrip.astro",
	capabilityMatrix: "apps/web/src/components/CapabilityMatrix.astro",
	home: "apps/web/src/pages/index.astro",
	mediaFrame: "apps/web/src/components/MediaFrame.astro",
	proofGallery: "apps/web/src/components/ProofGallery.astro",
	projectStage: "apps/web/src/components/ProjectStage.astro",
	workDetail: "apps/web/src/pages/work/[slug].astro",
	workEvidenceFlow: "apps/web/src/components/WorkEvidenceFlow.astro",
	changelog: "docs/CHANGELOG.md",
	launchEvidence: "runbooks/LAUNCH_EVIDENCE.md",
};

const xplaneTitle = "X-Plane Cabin Camera FOV Trade Study";

function readRequiredFile(path) {
	assert.ok(existsSync(path), `missing required file: ${path}`);
	const content = readFileSync(path, "utf8");
	assert.ok(content.trim().length > 0, `empty required file: ${path}`);
	return content;
}

function extractHeadingSection(content, heading) {
	const start = content.indexOf(`${heading}\n`);
	assert.notEqual(start, -1, `missing heading: ${heading}`);
	const afterHeading = content.slice(start + heading.length + 1);
	const nextHeading = afterHeading.search(/^## /m);
	return nextHeading === -1 ? afterHeading : afterHeading.slice(0, nextHeading);
}

function extractTableRow(content, firstCell) {
	const row = content
		.split(/\r?\n/)
		.find((line) => line.startsWith(`| ${firstCell} `));
	assert.ok(row, `missing table row for ${firstCell}`);
	return row;
}

test("Unreleased notes and launch evidence keep X-Plane pre-release", () => {
	const changelog = extractHeadingSection(
		readRequiredFile(files.changelog),
		"## [Unreleased]",
	);
	const launchEvidence = extractHeadingSection(
		readRequiredFile(files.launchEvidence),
		"## X-Plane and Conformal pre-release evidence — 2026-08-24",
	);
	const changelogEntry = changelog
		.split(/\n(?=- )/)
		.find((entry) => entry.includes(xplaneTitle));
	assert.ok(changelogEntry, "missing X-Plane Unreleased changelog entry");
	const normalizedChangelogEntry = changelogEntry.replace(/\s+/g, " ");
	for (const expected of [
		"homepage and Conformal Cooling copy",
		"crawler semantics",
		"intrinsic media ratios",
		"direct original-image inspection",
		"real retained meshes",
	]) {
		assert.ok(
			normalizedChangelogEntry.includes(expected),
			`X-Plane changelog entry must include ${expected}`,
		);
	}
	assert.doesNotMatch(
		normalizedChangelogEntry,
		/\b(?:live|deployed|production|approved)\b/i,
		"Unreleased X-Plane entry must not claim release or approval",
	);

	const xplaneLocal = extractTableRow(
		launchEvidence,
		"X-Plane sanitized media",
	);
	assert.match(xplaneLocal, /14 passed/);
	assert.match(
		xplaneLocal,
		/0a00b99bacbf1c0612bdf873ce2e4bea9387b83425e2315603fcbc30c02eeff6/,
	);
	assert.match(xplaneLocal, /local\/PR/);

	const conformalLocal = extractTableRow(
		launchEvidence,
		"Conformal real-geometry rerender",
	);
	assert.match(conformalLocal, /a51b70ae524e13ef56d79bb07a83462256d361f9/);
	assert.match(
		conformalLocal,
		/BE308C4C7300123A9EE433DB0733EFDA310D11AF53BB08993D8C6798747E9C39/i,
	);
	assert.match(conformalLocal, /local\/PR/);

	for (const pendingArea of [
		"X-Plane production-equivalent preview",
		"X-Plane production release",
	]) {
		const row = extractTableRow(launchEvidence, pendingArea);
		assert.match(row, /\| Pending \|/);
		assert.doesNotMatch(row, /\| (?:Passed|Complete|Live) \|/i);
		assert.match(row, /No deployment ID, URL, CI run, or rollback ID recorded/);
	}
});

test("Signal / Proof surfaces bind claims to ProofGallery, CapabilityMatrix, EvidenceStrip, and real media", () => {
	const home = readRequiredFile(files.home);
	const capabilityMatrix = readRequiredFile(files.capabilityMatrix);
	const evidenceStrip = readRequiredFile(files.evidenceStrip);
	const mediaFrame = readRequiredFile(files.mediaFrame);
	const proofGallery = readRequiredFile(files.proofGallery);
	const workDetail = readRequiredFile(files.workDetail);
	const workEvidenceFlow = readRequiredFile(files.workEvidenceFlow);

	assert.match(home, /<ProofGallery projects=\{homepageProof\}/);
	assert.match(home, /<CapabilityMatrix records=\{capabilityProof\}/);
	assert.match(home, /<EvidenceStrip[\s\S]*Verified Cryogenic Flow evidence/);
	assert.match(proofGallery, /projects\.map/);
	assert.match(
		proofGallery,
		/data-proof-placement=\{project\.data\.placement\}/,
	);
	assert.match(proofGallery, /<MotionLoop loop=\{project\.data\.media\.loop\}/);
	assert.match(proofGallery, /<MediaFrame media=\{project\.data\.media\}/);
	assert.match(capabilityMatrix, /records\.map/);
	assert.match(capabilityMatrix, /data-capability-proof/);
	assert.match(evidenceStrip, /<dl>/);
	assert.match(evidenceStrip, /items\.map/);

	assert.match(workDetail, /<MediaFrame media=\{data\.media\} playback=/);
	assert.match(workDetail, /<WorkEvidenceFlow work=\{work\}/);
	assert.match(workDetail, /<EvidenceStrip/);
	assert.match(workEvidenceFlow, /data\.architecture/);
	assert.match(workEvidenceFlow, /data\.evidence/);

	assert.match(mediaFrame, /<picture[\s\S]*data-video-poster/);
	assert.match(
		mediaFrame,
		/\.map\(\(source\) => `\$\{source\.src\} \$\{source\.width\}w`\)/,
	);
	assert.match(mediaFrame, /srcset=\{responsivePosterSrcset\}/);
	assert.match(mediaFrame, /<video[\s\S]*preload="none"/);
	assert.match(
		mediaFrame,
		/<img[\s\S]*width=\{media\.width\}[\s\S]*height=\{media\.height\}/,
	);
});

test("retired atlas, drawer, telemetry, and contact-form surfaces stay absent", () => {
	for (const path of [
		"apps/web/src/components/EvidenceDrawer.astro",
		"apps/web/src/components/ProjectAtlas.astro",
		"apps/web/src/components/ProjectConstellation.astro",
	]) {
		assert.equal(
			existsSync(path),
			false,
			`retired surface should stay deleted: ${path}`,
		);
	}

	const source = [
		readRequiredFile(files.home),
		readRequiredFile(files.projectStage),
		readRequiredFile(files.workDetail),
	].join("\n");
	assert.doesNotMatch(
		source,
		/hero-shell|systems-map|project-atlas|constellation|cta-cluster|telemetry-strip|evidence-drawer|contact-form/i,
	);
});

test("global stylesheet remains only the five ordered Signal / Proof imports", () => {
	const globalStyles = readRequiredFile("apps/web/src/styles/global.css")
		.trim()
		.split(/\r?\n/)
		.filter(Boolean);

	assert.deepEqual(globalStyles, [
		'@import "./tokens.css";',
		'@import "./base.css";',
		'@import "./layout.css";',
		'@import "./components.css";',
		'@import "./motion.css";',
	]);
});
