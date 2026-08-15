import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	evidenceStrip: "apps/web/src/components/EvidenceStrip.astro",
	home: "apps/web/src/pages/index.astro",
	mediaFrame: "apps/web/src/components/MediaFrame.astro",
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

test("Signal / Proof surfaces bind claims to ProjectStage, EvidenceStrip, and real media", () => {
	const home = readRequiredFile(files.home);
	const projectStage = readRequiredFile(files.projectStage);
	const evidenceStrip = readRequiredFile(files.evidenceStrip);
	const mediaFrame = readRequiredFile(files.mediaFrame);
	const workDetail = readRequiredFile(files.workDetail);
	const workEvidenceFlow = readRequiredFile(files.workEvidenceFlow);

	assert.match(home, /<ProjectStage projects=\{flagships\}/);
	assert.match(home, /<EvidenceStrip[\s\S]*Verified Cryogenic Flow evidence/);
	assert.match(projectStage, /projects\.map/);
	assert.match(projectStage, /<WorkRow project=\{project\}/);
	assert.match(projectStage, /<MediaFrame media=\{project\.data\.media\}/);
	assert.match(evidenceStrip, /<dl>/);
	assert.match(evidenceStrip, /items\.map/);

	assert.match(workDetail, /<MediaFrame media=\{data\.media\} playback=/);
	assert.match(workDetail, /<WorkEvidenceFlow work=\{work\}/);
	assert.match(workDetail, /<EvidenceStrip/);
	assert.match(workEvidenceFlow, /data\.architecture/);
	assert.match(workEvidenceFlow, /data\.evidence/);

	assert.match(mediaFrame, /<picture[\s\S]*data-video-poster/);
	assert.match(mediaFrame, /srcset="\/media\/cryo-flow-sim-stage1-640\.webp/);
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
