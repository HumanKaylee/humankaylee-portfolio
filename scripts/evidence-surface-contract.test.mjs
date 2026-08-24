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
const xplaneReviewedSha = "6df39168df3d1374e9e31058b6b7e160a867bcbc";
const xplaneFirstPreviewId = "1c92ba32-fb78-435b-a229-7dfeb8592579";
const xplaneFirstPreviewUrl =
	"https://1c92ba32.humankaylee-portfolio.pages.dev";
const xplaneApprovedSha = "a4293f91d29256d00a21a8f6e0f7a69ecfc77479";
const xplaneFirstProductionId = "cf491d10-d530-4e7f-af3b-b0b4469eabe2";
const xplaneFirstProductionUrl =
	"https://cf491d10.humankaylee-portfolio.pages.dev";
const xplaneRollbackId = "f7a08ad2-16f7-430c-a245-cd600e3d65a9";
const xplaneRollbackUrl = "https://f7a08ad2.humankaylee-portfolio.pages.dev";

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

function expectXPlaneProductionEvidence(
	changelogEntry,
	previewRow,
	releaseRow,
	blockersSection,
) {
	const normalizedChangelogEntry = changelogEntry.replace(/\s+/g, " ");
	for (const expected of [
		"owner-authorized",
		xplaneReviewedSha,
		xplaneFirstPreviewId,
		xplaneFirstPreviewUrl,
		"agent/browser verified",
		"frontend production release",
		xplaneApprovedSha,
		xplaneFirstProductionId,
		xplaneFirstProductionUrl,
	]) {
		assert.ok(
			normalizedChangelogEntry.toLowerCase().includes(expected.toLowerCase()),
			`X-Plane changelog entry must include ${expected}`,
		);
	}
	assert.doesNotMatch(
		normalizedChangelogEntry,
		/(?:global|platform) launch (?:is )?complete|entire platform (?:is )?(?:live|launched)|all production work (?:is )?complete/i,
	);

	for (const expected of [
		xplaneReviewedSha,
		xplaneFirstPreviewId,
		xplaneFirstPreviewUrl,
		"32769663529",
		xplaneRollbackId,
		"full-body 200",
		"direct playback",
		"Blob",
		"artifact seekability only",
	]) {
		assert.ok(
			previewRow.includes(expected),
			`X-Plane preview row must include ${expected}`,
		);
	}
	assert.match(previewRow, /\| Passed \|/);
	assert.match(previewRow, /pages\.dev.*range.*seek.*unsupported/i);
	assert.doesNotMatch(
		previewRow,
		/\| (?:Complete|Live) \||\b(?:is|now) live\b/i,
	);
	for (const expected of [
		xplaneApprovedSha,
		xplaneFirstProductionId,
		xplaneFirstProductionUrl,
		"32776758475",
		"97589465985",
		"97589466169",
		"97589466212",
		"32776758493",
		"97589466129",
		xplaneRollbackId,
		xplaneRollbackUrl,
		"bytes 0-1023/5179542",
		"bytes 0-1023/5626106",
		"exactly 1,024 bytes",
		"direct play, seek to 5 seconds, and resume",
		"exact security headers",
		"Cloudflare analytics",
		"$10.4506",
		"$17.6630",
		"4732951502a465371d8f429f66473c2b856e8c81184a5b3aeb65e520d84e06bb",
		"5f582ed5e1790b033bc0afc79d568a3f0ee0ce26d782c2f68d04bc6efaed11ae",
		"no-JS",
		"reduced-motion",
		"eight captures",
	]) {
		assert.ok(
			releaseRow.includes(expected),
			`X-Plane production row must include ${expected}`,
		);
	}
	assert.match(releaseRow, /\| production \|/);
	assert.match(releaseRow, /\| Passed \|/);
	assert.match(releaseRow, /rollback.*listed.*200/i);
	assert.doesNotMatch(
		releaseRow,
		/No production deployments or rollback targets exist/i,
	);
	assert.doesNotMatch(
		releaseRow,
		/(?:global|platform) launch (?:is )?complete|entire platform (?:is )?(?:live|launched)|all production work (?:is )?complete/i,
	);

	for (const expected of [
		"frontend custom domain and Cloudflare Pages project are verified",
		"B-063",
		"production API",
		"production contact",
		"broader platform launch remains open",
	]) {
		assert.ok(
			blockersSection.includes(expected),
			`production blockers section must include ${expected}`,
		);
	}
	assert.doesNotMatch(
		blockersSection,
		/Final frontend domain and Cloudflare Pages or alternate static provider\s+project are not selected|Rollback targets cannot be recorded until real production deployments exist/i,
	);
}

test("Unreleased notes and launch evidence record the exact verified X-Plane frontend production release without claiming a broader launch", () => {
	const changelog = extractHeadingSection(
		readRequiredFile(files.changelog),
		"## [Unreleased]",
	);
	const launchEvidence = extractHeadingSection(
		readRequiredFile(files.launchEvidence),
		"## X-Plane and Conformal production evidence — 2026-08-24",
	);
	const blockersSection = extractHeadingSection(
		readRequiredFile(files.launchEvidence),
		"## Production Blockers",
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

	const previewRow = extractTableRow(
		launchEvidence,
		"X-Plane production-equivalent preview",
	);
	const releaseRow = extractTableRow(
		launchEvidence,
		"X-Plane production release",
	);
	expectXPlaneProductionEvidence(
		changelogEntry,
		previewRow,
		releaseRow,
		blockersSection,
	);
});

test("X-Plane production evidence rejects missing range/seek proof, wrong provenance, false rollback absence, and false global completion", () => {
	const validChangelog = [
		`owner-authorized ${xplaneReviewedSha}`,
		xplaneFirstPreviewId,
		xplaneFirstPreviewUrl,
		"agent/browser verified",
		"frontend production release",
		xplaneApprovedSha,
		xplaneFirstProductionId,
		xplaneFirstProductionUrl,
	].join(" ");
	const validPreviewRow = [
		"| X-Plane production-equivalent preview | command | target | Passed |",
		xplaneReviewedSha,
		xplaneFirstPreviewId,
		xplaneFirstPreviewUrl,
		"32769663529",
		"f7a08ad2-16f7-430c-a245-cd600e3d65a9",
		"pages.dev direct range and seek unsupported; full-body 200 hashes and direct playback passed; Blob proves artifact seekability only |",
	].join(" ");
	const validReleaseRow = [
		"| X-Plane production release | explicit deploy and browser/HTTP matrix | joepoznanski.io | production | 2026-08-24T21:08:13Z | Passed |",
		xplaneApprovedSha,
		xplaneFirstProductionId,
		xplaneFirstProductionUrl,
		"32776758475 97589465985 97589466169 97589466212 32776758493 97589466129",
		xplaneRollbackId,
		xplaneRollbackUrl,
		"bytes 0-1023/5179542 and bytes 0-1023/5626106, exactly 1,024 bytes each; direct play, seek to 5 seconds, and resume; exact security headers; Cloudflare analytics; $10.4506 to $17.6630;",
		"4732951502a465371d8f429f66473c2b856e8c81184a5b3aeb65e520d84e06bb",
		"5f582ed5e1790b033bc0afc79d568a3f0ee0ce26d782c2f68d04bc6efaed11ae",
		"no-JS; reduced-motion; eight captures; rollback remains listed and returned 200 | none |",
	].join(" ");
	const validBlockers =
		"The frontend custom domain and Cloudflare Pages project are verified. B-063, production API, and production contact work remain unresolved; broader platform launch remains open.";

	assert.throws(
		() =>
			expectXPlaneProductionEvidence(
				validChangelog,
				validPreviewRow,
				validReleaseRow.replace("bytes 0-1023/5179542", ""),
				validBlockers,
			),
		/X-Plane production row must include/,
	);
	assert.throws(
		() =>
			expectXPlaneProductionEvidence(
				validChangelog,
				validPreviewRow,
				validReleaseRow.replace(
					"direct play, seek to 5 seconds, and resume",
					"direct playback only",
				),
				validBlockers,
			),
		/X-Plane production row must include/,
	);
	assert.throws(
		() =>
			expectXPlaneProductionEvidence(
				validChangelog,
				validPreviewRow,
				validReleaseRow.replace(
					xplaneApprovedSha,
					"0".repeat(xplaneApprovedSha.length),
				),
				validBlockers,
			),
		/X-Plane production row must include/,
	);
	assert.throws(
		() =>
			expectXPlaneProductionEvidence(
				validChangelog,
				validPreviewRow,
				validReleaseRow.replace(xplaneFirstProductionId, "wrong-id"),
				validBlockers,
			),
		/X-Plane production row must include/,
	);
	assert.throws(
		() =>
			expectXPlaneProductionEvidence(
				validChangelog,
				validPreviewRow,
				validReleaseRow.replace(
					"rollback remains listed and returned 200",
					"No production deployments or rollback targets exist",
				),
				validBlockers,
			),
		/X-Plane production row must include|No production deployments or rollback targets exist/,
	);
	assert.throws(
		() =>
			expectXPlaneProductionEvidence(
				`${validChangelog} global launch is complete`,
				validPreviewRow,
				validReleaseRow,
				validBlockers,
			),
		/global|match/i,
	);
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
