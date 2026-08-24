import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = "apps/web/public/media/xplane-fov";
const FORBIDDEN = /SNV|[A-Za-z]:\\|XPlaneRecordings|\bLM[5-8]\b/i;
const EXPECTED = [
	"capture-manifest.json",
	"comparison-bank-120-640.webp",
	"comparison-bank-120-960.webp",
	"comparison-bank-120-1440.webp",
	"comparison-bank-180-640.webp",
	"comparison-bank-180-960.webp",
	"comparison-bank-180-1440.webp",
	"fov50-p0-h0.mp4",
	"fov50-p0-h0-poster.webp",
	"fov110-m5-h0.mp4",
	"fov110-m5-h0-poster.webp",
].sort();

// biome-ignore lint/suspicious/noExportsInTest: the public-media contract requires this safety helper to be reusable.
export function assertPublicXplaneMetadata(value) {
	const serialized = JSON.stringify(value);
	assert.doesNotMatch(serialized, FORBIDDEN);
	assert.doesNotMatch(
		serialized,
		/token|password|cookie|authorization|bearer/i,
	);
}

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

test("X-Plane media matches its sanitized public manifest", () => {
	assert.ok(existsSync(ROOT));
	assert.deepEqual(readdirSync(ROOT).sort(), EXPECTED);
	const manifest = JSON.parse(
		readFileSync(path.join(ROOT, "capture-manifest.json"), "utf8"),
	);
	assertPublicXplaneMetadata(manifest);
	assert.equal(manifest.schemaVersion, 1);
	assert.equal(manifest.evidence.replayHarnessIncluded, false);
	assert.deepEqual(
		manifest.configurations.map((item) => item.id),
		["fov50-p0-h0", "fov110-m5-h0"],
	);
	assert.equal(manifest.configurations[0].horizontalFovDegrees, 50);
	assert.equal(manifest.configurations[0].pitchOffsetDegrees, 0);
	assert.equal(manifest.configurations[1].horizontalFovDegrees, 110);
	assert.equal(manifest.configurations[1].pitchOffsetDegrees, -5);
	assert.deepEqual(
		manifest.publishedAssets.map((asset) => asset.filename).sort(),
		EXPECTED.filter((filename) => filename !== "capture-manifest.json"),
	);

	for (const asset of manifest.publishedAssets) {
		const filePath = path.join(ROOT, asset.filename);
		assert.equal(statSync(filePath).size, asset.sizeBytes, asset.filename);
		assert.equal(sha256(filePath), asset.sha256, asset.filename);
		const metadata = probe(filePath);
		const video = metadata.streams.find(
			(stream) => stream.codec_type === "video",
		);
		assert.ok(video, asset.filename);
		assert.equal(video.width, asset.width, asset.filename);
		assert.equal(video.height, asset.height, asset.filename);
	}

	for (const filename of ["fov50-p0-h0.mp4", "fov110-m5-h0.mp4"]) {
		const filePath = path.join(ROOT, filename);
		const metadata = probe(filePath);
		const video = metadata.streams.find(
			(stream) => stream.codec_type === "video",
		);
		assert.equal(video.codec_name, "h264", filename);
		assert.equal(video.width, 1440, filename);
		assert.equal(video.height, 400, filename);
		assert.equal(video.avg_frame_rate, "2/1", filename);
		assert.equal(video.pix_fmt, "yuv420p", filename);
		assert.equal(
			metadata.streams.filter((stream) => stream.codec_type === "audio").length,
			0,
			filename,
		);
		const duration = Number(metadata.format.duration);
		assert.ok(duration >= 249, filename);
		assert.ok(duration <= 251, filename);
		assertFastStart(filePath);
	}

	for (const [filename, width, height] of [
		["fov50-p0-h0-poster.webp", 1440, 400],
		["fov110-m5-h0-poster.webp", 1440, 400],
		["comparison-bank-120-640.webp", 640, 356],
		["comparison-bank-120-960.webp", 960, 534],
		["comparison-bank-120-1440.webp", 1440, 800],
		["comparison-bank-180-640.webp", 640, 356],
		["comparison-bank-180-960.webp", 960, 534],
		["comparison-bank-180-1440.webp", 1440, 800],
	]) {
		const metadata = probe(path.join(ROOT, filename));
		const image = metadata.streams.find(
			(stream) => stream.codec_type === "video",
		);
		assert.equal(image.codec_name, "webp", filename);
		assert.equal(image.width, width, filename);
		assert.equal(image.height, height, filename);
	}
});

test("X-Plane public metadata rejects recovered private identifiers", () => {
	for (const unsafe of [
		"SNV",
		"E:\\private",
		"XPlaneRecordings",
		"LM5",
		"lm8",
	]) {
		assert.throws(() => assertPublicXplaneMetadata({ note: unsafe }));
	}
});
