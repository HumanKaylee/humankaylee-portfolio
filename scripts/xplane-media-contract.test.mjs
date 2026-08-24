import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	statSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
	SOURCE_FILE_SHA256,
	assertNonOverlappingRoots,
	assertPinnedFileHashes,
	assertSafeOutputTarget,
	assertSafePublicMetadata,
	buildOutputAtomically,
} from "./build-xplane-fov-media.mjs";

const ROOT = "apps/web/public/media/xplane-fov";
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
	assertSafePublicMetadata(value);
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

test("source pins accept the expected bytes and reject a changed file", () => {
	const fixtureRoot = mkdtempSync(path.join(tmpdir(), "xplane-source-pin-"));
	try {
		mkdirSync(path.join(fixtureRoot, "nested"));
		writeFileSync(path.join(fixtureRoot, "alpha.txt"), "alpha");
		writeFileSync(path.join(fixtureRoot, "nested", "beta.txt"), "beta");
		const expectedHashes = {
			"alpha.txt":
				"8ed3f6ad685b959ead7022518e1af76cd816f8e8ec7ccdda1ed4018e8f2223f8",
			"nested/beta.txt":
				"f44e64e75f3948e9f73f8dfa94721c4ce8cbb4f265c4790c702b2d41cfbf2753",
		};

		assert.doesNotThrow(() =>
			assertPinnedFileHashes(fixtureRoot, expectedHashes),
		);
		writeFileSync(path.join(fixtureRoot, "alpha.txt"), "changed");
		assert.throws(
			() => assertPinnedFileHashes(fixtureRoot, expectedHashes),
			/source content hash mismatch/i,
		);
	} finally {
		rmSync(fixtureRoot, { force: true, recursive: true });
	}
});

test("source hash pins cover the exact 24-file supplied inventory", () => {
	const expectedRelativePaths = ["fov50_p0_h0", "fov110_m5_h0"]
		.flatMap((configuration) => [
			`${configuration}/composite.mp4`,
			`${configuration}/info.txt`,
			...Array.from(
				{ length: 10 },
				(_, index) =>
					`${configuration}/screenshot_${String(index + 1).padStart(2, "0")}.png`,
			),
		])
		.sort();

	assert.equal(Object.keys(SOURCE_FILE_SHA256).length, 24);
	assert.deepEqual(
		Object.keys(SOURCE_FILE_SHA256).sort(),
		expectedRelativePaths,
	);
});

test("atomic build preserves an unrelated destination without invoking its producer", () => {
	const fixtureParent = mkdtempSync(
		path.join(tmpdir(), "xplane-unowned-output-"),
	);
	try {
		const outputRoot = path.join(fixtureParent, "public-media");
		mkdirSync(outputRoot);
		const sentinel = Buffer.from("unrelated-user-file-sentinel");
		writeFileSync(path.join(outputRoot, "unrelated-user-file.txt"), sentinel);
		let producerCalled = false;

		assert.throws(
			() =>
				buildOutputAtomically(outputRoot, () => {
					producerCalled = true;
				}),
			/unsafe output target/i,
		);
		assert.equal(producerCalled, false);
		assert.deepEqual(
			readFileSync(path.join(outputRoot, "unrelated-user-file.txt")),
			sentinel,
		);
		assert.deepEqual(readdirSync(outputRoot), ["unrelated-user-file.txt"]);
		assert.deepEqual(readdirSync(fixtureParent), ["public-media"]);
	} finally {
		rmSync(fixtureParent, { force: true, recursive: true });
	}
});

test("atomic build rechecks the destination before promotion", () => {
	const fixtureParent = mkdtempSync(
		path.join(tmpdir(), "xplane-output-insertion-"),
	);
	try {
		const outputRoot = path.join(fixtureParent, "public-media");
		mkdirSync(outputRoot);
		const oldManifest = Buffer.from("pre-existing-owned-manifest");
		const insertedSentinel = Buffer.from("inserted-user-file-sentinel");
		writeFileSync(path.join(outputRoot, "capture-manifest.json"), oldManifest);

		assert.throws(
			() =>
				buildOutputAtomically(outputRoot, (stageRoot) => {
					writeFileSync(
						path.join(stageRoot, "capture-manifest.json"),
						"new-output",
					);
					writeFileSync(
						path.join(outputRoot, "unrelated-user-file.txt"),
						insertedSentinel,
					);
				}),
			/unsafe output target/i,
		);
		assert.deepEqual(
			readFileSync(path.join(outputRoot, "capture-manifest.json")),
			oldManifest,
		);
		assert.deepEqual(
			readFileSync(path.join(outputRoot, "unrelated-user-file.txt")),
			insertedSentinel,
		);
		assert.deepEqual(readdirSync(outputRoot).sort(), [
			"capture-manifest.json",
			"unrelated-user-file.txt",
		]);
		assert.deepEqual(readdirSync(fixtureParent), ["public-media"]);
	} finally {
		rmSync(fixtureParent, { force: true, recursive: true });
	}
});

test("output target guard allows absent, empty, partial, and complete owned inventories", () => {
	const fixtureParent = mkdtempSync(
		path.join(tmpdir(), "xplane-owned-output-"),
	);
	try {
		const outputRoot = path.join(fixtureParent, "public-media");
		assert.doesNotThrow(() => assertSafeOutputTarget(outputRoot));

		mkdirSync(outputRoot);
		assert.doesNotThrow(() => assertSafeOutputTarget(outputRoot));

		writeFileSync(path.join(outputRoot, "capture-manifest.json"), "partial");
		assert.doesNotThrow(() => assertSafeOutputTarget(outputRoot));

		for (const filename of EXPECTED) {
			writeFileSync(path.join(outputRoot, filename), filename);
		}
		assert.doesNotThrow(() => assertSafeOutputTarget(outputRoot));
	} finally {
		rmSync(fixtureParent, { force: true, recursive: true });
	}
});

test("output target guard rejects filesystem roots and non-directory targets", () => {
	const fixtureParent = mkdtempSync(
		path.join(tmpdir(), "xplane-output-shape-"),
	);
	try {
		assert.throws(
			() => assertSafeOutputTarget(path.parse(fixtureParent).root),
			/filesystem root/i,
		);

		const outputFile = path.join(fixtureParent, "not-a-directory");
		writeFileSync(outputFile, "sentinel");
		assert.throws(
			() => assertSafeOutputTarget(outputFile),
			/output target must be a directory/i,
		);
		assert.equal(readFileSync(outputFile, "utf8"), "sentinel");
	} finally {
		rmSync(fixtureParent, { force: true, recursive: true });
	}
});

test("output target guard rejects non-regular and symbolic-link entries", () => {
	const fixtureParent = mkdtempSync(
		path.join(tmpdir(), "xplane-output-entry-"),
	);
	try {
		const directoryRoot = path.join(fixtureParent, "directory-entry");
		mkdirSync(directoryRoot);
		mkdirSync(path.join(directoryRoot, "capture-manifest.json"));
		assert.throws(
			() => assertSafeOutputTarget(directoryRoot),
			/regular files/i,
		);

		const linkRoot = path.join(fixtureParent, "link-entry");
		mkdirSync(linkRoot);
		const linkTarget = path.join(fixtureParent, "link-target");
		mkdirSync(linkTarget);
		writeFileSync(path.join(linkTarget, "sentinel.txt"), "outside-sentinel");
		symlinkSync(linkTarget, path.join(linkRoot, "fov50-p0-h0.mp4"), "junction");
		assert.throws(() => assertSafeOutputTarget(linkRoot), /regular files/i);
		assert.equal(
			readFileSync(path.join(linkTarget, "sentinel.txt"), "utf8"),
			"outside-sentinel",
		);
	} finally {
		rmSync(fixtureParent, { force: true, recursive: true });
	}
});

test("failed media production preserves the destination and removes staging residue", () => {
	const fixtureParent = mkdtempSync(
		path.join(tmpdir(), "xplane-atomic-output-"),
	);
	try {
		const outputRoot = path.join(fixtureParent, "public-media");
		mkdirSync(outputRoot);
		const sentinelManifest = Buffer.from("pre-existing-manifest-sentinel");
		writeFileSync(
			path.join(outputRoot, "capture-manifest.json"),
			sentinelManifest,
		);

		assert.throws(
			() =>
				buildOutputAtomically(outputRoot, (stageRoot) => {
					writeFileSync(path.join(stageRoot, "partial.mp4"), "partial");
					throw new Error("injected producer failure");
				}),
			/injected producer failure/i,
		);
		assert.deepEqual(
			readFileSync(path.join(outputRoot, "capture-manifest.json")),
			sentinelManifest,
		);
		assert.deepEqual(readdirSync(outputRoot), ["capture-manifest.json"]);
		assert.deepEqual(readdirSync(fixtureParent), ["public-media"]);
	} finally {
		rmSync(fixtureParent, { force: true, recursive: true });
	}
});

test("a source change during production prevents output promotion", () => {
	const fixtureParent = mkdtempSync(path.join(tmpdir(), "xplane-source-race-"));
	try {
		const sourceRoot = path.join(fixtureParent, "source");
		mkdirSync(sourceRoot);
		writeFileSync(path.join(sourceRoot, "alpha.txt"), "alpha");
		const expectedHashes = {
			"alpha.txt":
				"8ed3f6ad685b959ead7022518e1af76cd816f8e8ec7ccdda1ed4018e8f2223f8",
		};
		assert.doesNotThrow(() =>
			assertPinnedFileHashes(sourceRoot, expectedHashes),
		);

		const outputRoot = path.join(fixtureParent, "public-media");
		mkdirSync(outputRoot);
		const sentinelManifest = Buffer.from("pre-existing-source-race-sentinel");
		writeFileSync(
			path.join(outputRoot, "capture-manifest.json"),
			sentinelManifest,
		);
		let producerCalled = false;

		assert.throws(
			() =>
				buildOutputAtomically(
					outputRoot,
					(stageRoot) => {
						producerCalled = true;
						writeFileSync(
							path.join(stageRoot, "capture-manifest.json"),
							"new-output",
						);
						writeFileSync(path.join(sourceRoot, "alpha.txt"), "changed");
					},
					() => {},
					() => assertPinnedFileHashes(sourceRoot, expectedHashes),
				),
			/source content hash mismatch/i,
		);
		assert.equal(producerCalled, true);
		assert.deepEqual(
			readFileSync(path.join(outputRoot, "capture-manifest.json")),
			sentinelManifest,
		);
		assert.deepEqual(readdirSync(outputRoot), ["capture-manifest.json"]);
		assert.deepEqual(readdirSync(fixtureParent).sort(), [
			"public-media",
			"source",
		]);
	} finally {
		rmSync(fixtureParent, { force: true, recursive: true });
	}
});

test("source and output roots must be distinct non-overlapping trees", () => {
	const fixtureParent = path.join(tmpdir(), "xplane-root-guard");
	const sourceRoot = path.join(fixtureParent, "source");
	const outputRoot = path.join(fixtureParent, "output");

	assert.doesNotThrow(() => assertNonOverlappingRoots(sourceRoot, outputRoot));
	assert.throws(
		() => assertNonOverlappingRoots(sourceRoot, sourceRoot),
		/roots must not overlap/i,
	);
	assert.throws(
		() =>
			assertNonOverlappingRoots(
				sourceRoot,
				path.join(sourceRoot, "public-media"),
			),
		/roots must not overlap/i,
	);
	assert.throws(
		() =>
			assertNonOverlappingRoots(
				path.join(outputRoot, "supplied-source"),
				outputRoot,
			),
		/roots must not overlap/i,
	);
});

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
		"C:/private",
		"//server/share",
		"\\\\server\\share",
		"XPlaneRecordings",
		"LM5",
		"lm8",
	]) {
		assert.throws(() => assertPublicXplaneMetadata({ note: unsafe }));
	}
});
