import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const PUBLIC_ROOT = "apps/web/public/media/cryo-flow-sim-scale";
const DETERMINISTIC_SOURCE_SHA = "94ec41eb42a4aeb758843d7fed22bbb3f4233bed";
const LIVE_SOURCE_SHA = "bdb72f92c7e2623bdd59aa30d9e7f5f2d321b853";
const SCENARIO = "generated:5000:20260823";
const COUNTS = {
	tanks: 5000,
	valves: 15000,
	pipes: 4500,
	sensors: 5000,
};
const EXPECTED_SHA256 = {
	"cryo-scale-deterministic-960.manifest.json":
		"a9edc5a8bc589ae3766403f94eb5096132698f3ec70366f25656587c684dea88",
	"cryo-scale-deterministic-960.mp4":
		"7476523deba2250cb3abc50028a824c9691da71e1c9ae5b3bdb560c92c7c4c71",
	"cryo-scale-deterministic-960.png":
		"4382cc0015cead25d6aeed28e3464e43a653337b0f19e65e7cc53d38c3069519",
	"cryo-scale-realtime-960.manifest.json":
		"8916b662f2644b58d75bec72d2603ddc9e99caded19fe35e4e1561d25627fb05",
	"cryo-scale-realtime-960.mp4":
		"2315ede1ebf418c6c8fb41b58b07d6b928eab7b6e1a569511de216ae93893458",
	"cryo-scale-realtime-960.png":
		"6294acb3ec91155adf971efc91a67240bb86f1fc74532ec4178073da6d8a7156",
	"live-capture-evidence.json":
		"bab9aba5b6674c54fe0cf2dd2f8f5bc1494b54baf322bc2a4cabd5273a99a276",
};
const OPTIMIZED_POSTERS = [
	"cryo-scale-deterministic-960.webp",
	"cryo-scale-realtime-960.webp",
];

function sha256(filePath) {
	return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function probe(filePath) {
	const result = spawnSync(
		"ffprobe",
		["-v", "error", "-show_streams", "-show_format", "-of", "json", filePath],
		{ encoding: "utf8" },
	);
	assert.equal(result.status, 0, result.stderr);
	return JSON.parse(result.stdout);
}

function assertFastStart(filePath) {
	const bytes = readFileSync(filePath);
	const moovOffset = bytes.indexOf(Buffer.from("moov"));
	const mediaDataOffset = bytes.indexOf(Buffer.from("mdat"));
	assert.ok(moovOffset >= 0, `${path.basename(filePath)} has no moov atom`);
	assert.ok(
		mediaDataOffset >= 0,
		`${path.basename(filePath)} has no mdat atom`,
	);
	assert.ok(
		moovOffset < mediaDataOffset,
		`${path.basename(filePath)} is not fast-start compatible`,
	);
}

function assertPublicMetadata(value) {
	const serialized = JSON.stringify(value);
	assert.doesNotMatch(serialized, /[A-Za-z]:\\|\/Users\/|\/home\//i);
	assert.doesNotMatch(serialized, /\\\\[^\\]+\\[^\\]+/i);
	assert.doesNotMatch(
		serialized,
		/"(?:hostname|username|account|email|token|password|cookie|authorization|bearer)"\s*:/i,
	);
	assert.doesNotMatch(serialized, /\bbearer\s+\S+/i);
	assert.doesNotMatch(
		serialized,
		/\b(?:10\.|127\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)\d{1,3}\.\d{1,3}/,
	);
	assert.doesNotMatch(serialized, /\b(?:joepo|rog-strix-joe|lightred)\b/i);
}

function assertCaptureManifestContract(
	manifest,
	expectedKind,
	expectedLabel,
	expectedSourceSha,
) {
	assertPublicMetadata(manifest);
	assert.equal(manifest.schema_version, "cryo-scale-media/v1");
	assert.equal(manifest.media_kind, expectedKind);
	assert.equal(manifest.truthful_label, expectedLabel);
	assert.equal(manifest.source_sha, expectedSourceSha);
	assert.equal(manifest.scenario, SCENARIO);
	assert.equal(manifest.seed, 20260823);
	assert.deepEqual(manifest.counts, COUNTS);
	assert.equal(
		Object.values(manifest.counts).reduce((sum, count) => sum + count),
		29500,
	);
	assert.deepEqual(manifest.source_dimensions, { width: 1920, height: 1080 });
	assert.deepEqual(manifest.output_dimensions, { width: 960, height: 540 });
	assert.equal(manifest.fps, 30);
	assert.equal(manifest.duration_seconds, 60);
	assert.equal(manifest.validation.passed, true);
	assert.equal(manifest.handoff.prefers_reduced_motion_poster, true);
	assert.equal(manifest.handoff.autoplay, false);
}

function assertVisibleChangeContract(manifest) {
	assert.equal(manifest.capture_profile, "visible_change_v1");
	assert.deepEqual(manifest.chapters, [
		{ name: "baseline", start_seconds: 0 },
		{ name: "close_sweep", start_seconds: 5 },
		{ name: "open_wave", start_seconds: 15 },
		{ name: "transfer_hold", start_seconds: 30 },
		{ name: "restore_sweep", start_seconds: 40 },
		{ name: "recovery", start_seconds: 52 },
	]);
}

function validManifestFixture() {
	return {
		schema_version: "cryo-scale-media/v1",
		media_kind: "deterministic_offline",
		truthful_label: "DETERMINISTIC / OFFLINE",
		source_sha: DETERMINISTIC_SOURCE_SHA,
		scenario: SCENARIO,
		seed: 20260823,
		counts: structuredClone(COUNTS),
		source_dimensions: { width: 1920, height: 1080 },
		output_dimensions: { width: 960, height: 540 },
		fps: 30,
		duration_seconds: 60,
		capture_profile: "visible_change_v1",
		chapters: [
			{ name: "baseline", start_seconds: 0 },
			{ name: "close_sweep", start_seconds: 5 },
			{ name: "open_wave", start_seconds: 15 },
			{ name: "transfer_hold", start_seconds: 30 },
			{ name: "restore_sweep", start_seconds: 40 },
			{ name: "recovery", start_seconds: 52 },
		],
		validation: { passed: true },
		handoff: { prefers_reduced_motion_poster: true, autoplay: false },
	};
}

test("Cryo scale contract rejects a dishonest media kind or entity count", () => {
	const dishonestKind = validManifestFixture();
	dishonestKind.media_kind = "live_realtime";
	assert.throws(() =>
		assertCaptureManifestContract(
			dishonestKind,
			"deterministic_offline",
			"DETERMINISTIC / OFFLINE",
			DETERMINISTIC_SOURCE_SHA,
		),
	);

	const dishonestCount = validManifestFixture();
	dishonestCount.counts.valves = 14999;
	assert.throws(() =>
		assertCaptureManifestContract(
			dishonestCount,
			"deterministic_offline",
			"DETERMINISTIC / OFFLINE",
			DETERMINISTIC_SOURCE_SHA,
		),
	);
});

test("Cryo scale contract rejects a passive or incomplete deterministic choreography", () => {
	const passive = validManifestFixture();
	passive.capture_profile = "passive_v1";
	assert.throws(() => assertVisibleChangeContract(passive));

	const missingOpenWave = validManifestFixture();
	missingOpenWave.chapters = missingOpenWave.chapters.filter(
		(chapter) => chapter.name !== "open_wave",
	);
	assert.throws(() => assertVisibleChangeContract(missingOpenWave));
});

test("Cryo scale public media matches the accepted source bytes and manifests", () => {
	assert.deepEqual(
		readdirSync(PUBLIC_ROOT).sort(),
		[...Object.keys(EXPECTED_SHA256), ...OPTIMIZED_POSTERS].sort(),
	);
	for (const [filename, expectedHash] of Object.entries(EXPECTED_SHA256)) {
		assert.equal(
			sha256(path.join(PUBLIC_ROOT, filename)),
			expectedHash,
			filename,
		);
	}

	const deterministic = JSON.parse(
		readFileSync(
			path.join(PUBLIC_ROOT, "cryo-scale-deterministic-960.manifest.json"),
			"utf8",
		),
	);
	assertCaptureManifestContract(
		deterministic,
		"deterministic_offline",
		"DETERMINISTIC / OFFLINE",
		DETERMINISTIC_SOURCE_SHA,
	);
	assertVisibleChangeContract(deterministic);
	assert.equal(
		deterministic.artifacts.mp4.sha256,
		EXPECTED_SHA256["cryo-scale-deterministic-960.mp4"],
	);
	assert.equal(
		deterministic.artifacts.poster.sha256,
		EXPECTED_SHA256["cryo-scale-deterministic-960.png"],
	);

	const realtime = JSON.parse(
		readFileSync(
			path.join(PUBLIC_ROOT, "cryo-scale-realtime-960.manifest.json"),
			"utf8",
		),
	);
	assertCaptureManifestContract(
		realtime,
		"live_realtime",
		"LIVE / REAL-TIME",
		LIVE_SOURCE_SHA,
	);
	assert.deepEqual(realtime.chapters, [
		{ name: "normal", start_seconds: 0 },
		{ name: "stress", start_seconds: 10.074 },
		{ name: "recovery", start_seconds: 20.125 },
	]);
	assert.equal(
		realtime.artifacts.mp4.sha256,
		EXPECTED_SHA256["cryo-scale-realtime-960.mp4"],
	);
	assert.equal(
		realtime.artifacts.poster.sha256,
		EXPECTED_SHA256["cryo-scale-realtime-960.png"],
	);
	assert.equal(
		realtime.artifacts.evidence.sha256,
		EXPECTED_SHA256["live-capture-evidence.json"],
	);

	const evidence = JSON.parse(
		readFileSync(path.join(PUBLIC_ROOT, "live-capture-evidence.json"), "utf8"),
	);
	assertPublicMetadata(evidence);
	assert.equal(evidence.schema_version, "cryo-live-capture-evidence/v1");
	assert.equal(evidence.scenario, SCENARIO);
	assert.deepEqual(evidence.authoritative.counts, COUNTS);
	assert.deepEqual(evidence.final_authoritative.counts, COUNTS);
	assert.equal(evidence.renderer.totalEntityCount, 29500);
	assert.equal(evidence.renderer.visibleEntityCount, 29500);
	assert.equal(evidence.duration_after_readiness_seconds, 60.237);
	assert.deepEqual(evidence.chapters, [
		{ name: "normal", start_seconds: 0 },
		{ name: "stress", start_seconds: 10.074 },
		{ name: "recovery", start_seconds: 20.125 },
	]);
	assert.equal(evidence.normal_window.tick_hz, 30);
	assert.equal(evidence.stress_window.tick_hz, 24.1);
	assert.equal(evidence.recovery_window.tick_hz, 30);
	assert.deepEqual(
		{
			status: evidence.normal_window.window.status,
			observed: evidence.normal_window.window.observed_ticks,
			dropped: evidence.normal_window.window.dropped_ticks,
		},
		{ status: "pass", observed: 300, dropped: 0 },
	);
	assert.deepEqual(
		{
			status: evidence.stress_window.window.status,
			observed: evidence.stress_window.window.observed_ticks,
			dropped: evidence.stress_window.window.dropped_ticks,
		},
		{ status: "fail", observed: 241, dropped: 59 },
	);
	assert.deepEqual(
		{
			status: evidence.recovery_window.window.status,
			observed: evidence.recovery_window.window.observed_ticks,
			dropped: evidence.recovery_window.window.dropped_ticks,
		},
		{ status: "pass", observed: 300, dropped: 0 },
	);
	assert.deepEqual(evidence.console_errors, []);
});

test("Cryo scale website posters use compact modern-image derivatives", () => {
	for (const filename of OPTIMIZED_POSTERS) {
		const filePath = path.join(PUBLIC_ROOT, filename);
		const image = probe(filePath).streams.find(
			(stream) => stream.codec_type === "video",
		);
		assert.ok(image, filename);
		assert.equal(image.codec_name, "webp", filename);
		assert.equal(image.width, 960, filename);
		assert.equal(image.height, 540, filename);
		assert.ok(statSync(filePath).size < 100_000, filename);
	}
});

test("Cryo scale MP4 and poster files satisfy the website media contract", () => {
	for (const filename of [
		"cryo-scale-deterministic-960.mp4",
		"cryo-scale-realtime-960.mp4",
	]) {
		const filePath = path.join(PUBLIC_ROOT, filename);
		const metadata = probe(filePath);
		const video = metadata.streams.find(
			(stream) => stream.codec_type === "video",
		);
		assert.ok(video, filename);
		assert.equal(video.codec_name, "h264", filename);
		assert.equal(video.pix_fmt, "yuv420p", filename);
		assert.equal(video.width, 960, filename);
		assert.equal(video.height, 540, filename);
		assert.equal(video.avg_frame_rate, "30/1", filename);
		assert.equal(
			metadata.streams.filter((stream) => stream.codec_type === "audio").length,
			0,
			filename,
		);
		const duration = Number(metadata.format.duration);
		assert.ok(duration >= 59.9 && duration <= 60.1, filename);
		assertFastStart(filePath);
	}

	for (const filename of [
		"cryo-scale-deterministic-960.png",
		"cryo-scale-realtime-960.png",
	]) {
		const image = probe(path.join(PUBLIC_ROOT, filename)).streams.find(
			(stream) => stream.codec_type === "video",
		);
		assert.ok(image, filename);
		assert.equal(image.codec_name, "png", filename);
		assert.equal(image.width, 960, filename);
		assert.equal(image.height, 540, filename);
	}
});
