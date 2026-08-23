import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const PUBLIC_ROOT = "apps/web/public/media/conformal-cooling";
const MANIFEST_PATH = path.join(PUBLIC_ROOT, "capture-manifest.json");
const ACCEPTED_SOURCE_COMMIT = "5514afad8321812037c556d6e21b6c2559851a8d";
const WIDTHS = [640, 960, 1440];
const IMAGE_FAMILIES = [
	"conformal-input-gear",
	"conformal-cavity-channels",
	"conformal-split-mold-ports",
	"conformal-validation-export",
	"conformal-workflow-loop-poster",
	"conformal-workflow-poster",
];
const EXPECTED_ASSET_NAMES = [
	...IMAGE_FAMILIES.flatMap((family) =>
		WIDTHS.map((width) => `${family}-${width}.webp`),
	),
	"conformal-workflow-loop.mp4",
	"conformal-workflow.mp4",
].sort();

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

function assertPublicManifest(value) {
	const serialized = JSON.stringify(value);
	assert.doesNotMatch(serialized, /[A-Za-z]:\\|\/Users\/|\/home\//i);
	assert.doesNotMatch(
		serialized,
		/"(?:token|password|cookie|authorization|bearer)[^"]*"\s*:/i,
	);
	assert.doesNotMatch(serialized, /\bbearer\s+\S+/i);
}

test("Conformal cooling media matches its sanitized capture manifest", () => {
	assert.ok(existsSync(MANIFEST_PATH), "missing public capture manifest");
	const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
	assertPublicManifest(manifest);
	assert.equal(manifest.source.uiApiCaptureCommit, ACCEPTED_SOURCE_COMMIT);
	assert.equal(manifest.source.cleanAtUiApiCapture, true);

	const listedNames = manifest.publishedAssets
		.map((asset) => asset.filename)
		.sort();
	assert.deepEqual(listedNames, EXPECTED_ASSET_NAMES);
	assert.deepEqual(
		readdirSync(PUBLIC_ROOT).sort(),
		["capture-manifest.json", ...EXPECTED_ASSET_NAMES].sort(),
	);

	for (const asset of manifest.publishedAssets) {
		const filePath = path.join(PUBLIC_ROOT, asset.filename);
		assert.ok(existsSync(filePath), `missing ${asset.filename}`);
		assert.equal(statSync(filePath).size, asset.sizeBytes, asset.filename);
		assert.equal(sha256(filePath), asset.sha256, asset.filename);
		const metadata = probe(filePath);
		const videoStream = metadata.streams.find(
			(stream) => stream.codec_type === "video",
		);
		assert.ok(videoStream, `${asset.filename} has no video/image stream`);
		assert.equal(videoStream.width, asset.width, asset.filename);
		assert.equal(videoStream.height, asset.height, asset.filename);
	}

	for (const family of IMAGE_FAMILIES) {
		for (const width of WIDTHS) {
			const filename = `${family}-${width}.webp`;
			const metadata = probe(path.join(PUBLIC_ROOT, filename));
			const stream = metadata.streams.find(
				(candidate) => candidate.codec_type === "video",
			);
			assert.equal(stream.codec_name, "webp", filename);
			assert.equal(stream.width, width, filename);
			assert.equal(stream.height, (width * 9) / 16, filename);
		}
	}

	for (const contract of [
		{
			filename: "conformal-workflow-loop.mp4",
			width: 960,
			height: 540,
			minimumDuration: 8,
			maximumDuration: 12,
			maximumBytes: 2_097_152,
		},
		{
			filename: "conformal-workflow.mp4",
			width: 1536,
			height: 864,
			minimumDuration: 30,
			maximumDuration: 45,
			maximumBytes: 20 * 1024 * 1024,
		},
	]) {
		const filePath = path.join(PUBLIC_ROOT, contract.filename);
		const metadata = probe(filePath);
		const stream = metadata.streams.find(
			(candidate) => candidate.codec_type === "video",
		);
		assert.equal(stream.codec_name, "h264", contract.filename);
		assert.equal(stream.width, contract.width, contract.filename);
		assert.equal(stream.height, contract.height, contract.filename);
		assert.equal(stream.avg_frame_rate, "30/1", contract.filename);
		assert.equal(stream.pix_fmt, "yuv420p", contract.filename);
		assert.equal(
			metadata.streams.filter((candidate) => candidate.codec_type === "audio")
				.length,
			0,
			contract.filename,
		);
		const duration = Number(metadata.format.duration);
		assert.ok(duration >= contract.minimumDuration, contract.filename);
		assert.ok(duration <= contract.maximumDuration, contract.filename);
		assert.ok(
			statSync(filePath).size <= contract.maximumBytes,
			contract.filename,
		);
	}
});
