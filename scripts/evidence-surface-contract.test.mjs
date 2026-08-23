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
};

function readRequiredFile(path) {
	assert.ok(existsSync(path), `missing required file: ${path}`);
	const content = readFileSync(path, "utf8");
	assert.ok(content.trim().length > 0, `empty required file: ${path}`);
	return content;
}

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
