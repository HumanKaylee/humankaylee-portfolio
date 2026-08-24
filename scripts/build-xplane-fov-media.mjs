import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	renameSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs as parseNodeArgs } from "node:util";

const CONFIGURATIONS = [
	{
		sourceDirectory: "fov50_p0_h0",
		publicId: "fov50-p0-h0",
		horizontalFovDegrees: 50,
		pitchOffsetDegrees: 0,
	},
	{
		sourceDirectory: "fov110_m5_h0",
		publicId: "fov110-m5-h0",
		horizontalFovDegrees: 110,
		pitchOffsetDegrees: -5,
	},
];

const EXPECTED_SOURCE_FILES = [
	"composite.mp4",
	"info.txt",
	...Array.from(
		{ length: 10 },
		(_, index) => `screenshot_${String(index + 1).padStart(2, "0")}.png`,
	),
].sort();

const PUBLISHED_FILENAMES = [
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

export const SOURCE_FILE_SHA256 = Object.freeze({
	"fov110_m5_h0/composite.mp4":
		"418030e9ba239cae0273400a41d290a5545c554b103d399e1a5e3e3ce9d320a9",
	"fov110_m5_h0/info.txt":
		"dd5357cbf2fdd76b045a55b30264c5248aa0f8ca8c150a8206083c519e50334e",
	"fov110_m5_h0/screenshot_01.png":
		"f55012111d32b30b2310ec22639aa89fbcb42e5a0750098a34b44e2ef7de056b",
	"fov110_m5_h0/screenshot_02.png":
		"5ed1aae400431564351138b49d8edbe08e8fbc78b324b4516427eefcedebde01",
	"fov110_m5_h0/screenshot_03.png":
		"e114af23f8299bb62b7c3534ce82546e15a99146f920ba0b849d10288c336038",
	"fov110_m5_h0/screenshot_04.png":
		"8765796f7568c37e99ff7901722ea877c41a8d2a1875c666a3f0cdbeeb2bd0ef",
	"fov110_m5_h0/screenshot_05.png":
		"35bb0036b270708d3dc88d540ded05d6e2852efe710aee4a376be8fed3936f1a",
	"fov110_m5_h0/screenshot_06.png":
		"ca68cc7d236c6c7989caebad132ab81494bf8f35ace2d4d06328c3a8490de393",
	"fov110_m5_h0/screenshot_07.png":
		"d2c77b23574e02779d11942575934b0f85c0949e63a0fd2f23adf3377a831de8",
	"fov110_m5_h0/screenshot_08.png":
		"fb40c7c901443d011a255f3030b3bb60f392da7bbe69c7c037c07d3c6a02193f",
	"fov110_m5_h0/screenshot_09.png":
		"c3c420c41b77092e4e6892391acedb020a82736d916da41779451c76455eb47b",
	"fov110_m5_h0/screenshot_10.png":
		"bb9844bbe16a8def1a50d424d8f825387cdbb596261619650ebfa7eeb3d6204a",
	"fov50_p0_h0/composite.mp4":
		"b55fd78c3fd3d0aa974aefd1aa1607c169c5314276c11d49986c5cc38776c089",
	"fov50_p0_h0/info.txt":
		"39438c283285471ee5e14156fe8628686fdeb6d803a1b336ce0e72bc12258b8b",
	"fov50_p0_h0/screenshot_01.png":
		"5bb3551662b55ff7914ac6e330e904004b465b155e0af6a3277468dd15d5da55",
	"fov50_p0_h0/screenshot_02.png":
		"8d7f72c6382a921ec1edd82a53201afe577855a74db8469774d4f693a4f9674c",
	"fov50_p0_h0/screenshot_03.png":
		"a6d49d6bf9affa4a65fd2f46374740dbcef22428db12c28a5bbc266fb9497fa5",
	"fov50_p0_h0/screenshot_04.png":
		"76ce19a439121df9dbce5d4a41b956fe47c6607392364fc7d9cf2ac605d2a035",
	"fov50_p0_h0/screenshot_05.png":
		"3255b334ad109ce4cb7a63cc98dcb6649ccdae3e69b36f9bc4739c06b79dbfe8",
	"fov50_p0_h0/screenshot_06.png":
		"4a91a004bd75872b946521e7e72bed9f03fdaa2943f629fa20a74d9239dc7b08",
	"fov50_p0_h0/screenshot_07.png":
		"b86a9621db22504f530f27c1aaffb1c4db379edf092e91509c32d44ef9ec1e2a",
	"fov50_p0_h0/screenshot_08.png":
		"1ac6f63dc1756d9ce2581b4a0b716c88b7af8c5d23c1e16a7e028465b458e5d0",
	"fov50_p0_h0/screenshot_09.png":
		"9545a0a25d6d5f4b712f622c9209c5516a50fa645d33775dee5dfe2ca65afc54",
	"fov50_p0_h0/screenshot_10.png":
		"297c32133ae2d0626020af6e68054ee257c7e21687d4665121b368edfb12a327",
});

const FORBIDDEN =
	/SNV|[A-Za-z]:[\\/]|(?:\\{2,}|\/{2,})[^\\/]+[\\/]+[^\\/]+|XPlaneRecordings|\bLM[5-8]\b/i;
const FORBIDDEN_SECRETS = /token|password|cookie|authorization|bearer/i;

const MASK_FILTER = [
	"drawbox=x=0:y=0:w=48:h=28:color=black:t=fill",
	"drawbox=x=1440:y=0:w=48:h=28:color=black:t=fill",
	"drawbox=x=0:y=400:w=48:h=28:color=black:t=fill",
	"drawbox=x=1440:y=400:w=48:h=28:color=black:t=fill",
	"scale=1440:400:flags=lanczos",
].join(",");

function parseArgs() {
	const { values, positionals } = parseNodeArgs({
		allowPositionals: true,
		options: {
			"source-root": { type: "string" },
			"output-root": { type: "string" },
		},
	});

	if (positionals.length > 0) {
		throw new Error(
			`Unexpected positional arguments: ${positionals.join(" ")}`,
		);
	}
	if (!values["source-root"] || !values["output-root"]) {
		throw new Error(
			"Usage: node scripts/build-xplane-fov-media.mjs --source-root <directory> --output-root <directory>",
		);
	}

	return {
		sourceRoot: path.resolve(values["source-root"]),
		outputRoot: path.resolve(values["output-root"]),
	};
}

function run(command, args) {
	const result = spawnSync(command, args, {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
	if (result.error) {
		throw result.error;
	}
	if (result.status !== 0) {
		throw new Error(`${command} failed: ${result.stderr}`);
	}
	return result.stdout;
}

function sha256(filePath) {
	return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function probe(filePath) {
	return JSON.parse(
		run("ffprobe", [
			"-v",
			"error",
			"-show_streams",
			"-show_format",
			"-of",
			"json",
			filePath,
		]),
	);
}

export function assertSafePublicMetadata(value) {
	const serialized = JSON.stringify(value);
	if (FORBIDDEN.test(serialized) || FORBIDDEN_SECRETS.test(serialized)) {
		throw new Error("Refusing to write unsafe public X-Plane metadata");
	}
}

function assertExpectedInventory(directory, expectedNames, label) {
	if (!existsSync(directory) || !statSync(directory).isDirectory()) {
		throw new Error(`Missing ${label} directory`);
	}
	const actualNames = readdirSync(directory).sort();
	if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
		throw new Error(`Unexpected ${label} inventory`);
	}
}

function relativeFileInventory(root, directory = root) {
	const relativeFiles = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			relativeFiles.push(...relativeFileInventory(root, entryPath));
			continue;
		}
		if (!entry.isFile()) {
			throw new Error("Unexpected non-file entry in pinned source inventory");
		}
		relativeFiles.push(
			path.relative(root, entryPath).split(path.sep).join("/"),
		);
	}
	return relativeFiles.sort();
}

export function assertPinnedFileHashes(sourceRoot, expectedHashes) {
	const actualFiles = relativeFileInventory(sourceRoot);
	const expectedFiles = Object.keys(expectedHashes).sort();
	if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
		throw new Error("Unexpected pinned source inventory");
	}
	for (const relativePath of expectedFiles) {
		const filePath = path.join(sourceRoot, ...relativePath.split("/"));
		if (sha256(filePath) !== expectedHashes[relativePath]) {
			throw new Error(`Source content hash mismatch: ${relativePath}`);
		}
	}
}

function isSameOrDescendant(relativePath) {
	return (
		relativePath === "" ||
		(!path.isAbsolute(relativePath) &&
			relativePath !== ".." &&
			!relativePath.startsWith(`..${path.sep}`))
	);
}

export function assertNonOverlappingRoots(sourceRoot, outputRoot) {
	const resolvedSource = path.resolve(sourceRoot);
	const resolvedOutput = path.resolve(outputRoot);
	if (
		isSameOrDescendant(path.relative(resolvedSource, resolvedOutput)) ||
		isSameOrDescendant(path.relative(resolvedOutput, resolvedSource))
	) {
		throw new Error("Source and output roots must not overlap");
	}
}

function assertSourceContract(sourceRoot) {
	assertExpectedInventory(
		sourceRoot,
		CONFIGURATIONS.map((configuration) => configuration.sourceDirectory).sort(),
		"source root",
	);
	assertPinnedFileHashes(sourceRoot, SOURCE_FILE_SHA256);

	for (const configuration of CONFIGURATIONS) {
		const configurationRoot = path.join(
			sourceRoot,
			configuration.sourceDirectory,
		);
		assertExpectedInventory(
			configurationRoot,
			EXPECTED_SOURCE_FILES,
			configuration.sourceDirectory,
		);
		const sourceVideo = path.join(configurationRoot, "composite.mp4");
		const metadata = probe(sourceVideo);
		const video = metadata.streams.find(
			(stream) => stream.codec_type === "video",
		);
		if (
			!video ||
			video.codec_name !== "h264" ||
			video.width !== 2880 ||
			video.height !== 800 ||
			video.avg_frame_rate !== "2/1" ||
			Number(metadata.format.duration) < 249 ||
			Number(metadata.format.duration) > 251 ||
			metadata.streams.some((stream) => stream.codec_type === "audio")
		) {
			throw new Error(
				`Unexpected ${configuration.sourceDirectory} video contract`,
			);
		}
	}
}

function ffmpegArgs() {
	return ["-hide_banner", "-loglevel", "error"];
}

function ffmpegOutputSafetyArgs() {
	return ["-fflags", "+bitexact", "-map_metadata", "-1", "-map_chapters", "-1"];
}

function encodeSanitizedVideo(source, output) {
	run("ffmpeg", [
		"-y",
		...ffmpegArgs(),
		"-i",
		source,
		...ffmpegOutputSafetyArgs(),
		"-an",
		"-vf",
		MASK_FILTER,
		"-r",
		"2",
		"-c:v",
		"libx264",
		"-preset",
		"slow",
		"-crf",
		"30",
		"-pix_fmt",
		"yuv420p",
		"-flags:v",
		"+bitexact",
		"-movflags",
		"+faststart",
		output,
	]);
}

function writeWebpFromVideo(video, second, output) {
	run("ffmpeg", [
		"-y",
		...ffmpegArgs(),
		"-ss",
		String(second),
		"-i",
		video,
		...ffmpegOutputSafetyArgs(),
		"-frames:v",
		"1",
		"-an",
		"-c:v",
		"libwebp",
		"-quality",
		"82",
		"-compression_level",
		"6",
		"-preset",
		"picture",
		output,
	]);
}

function writeComparison(firstVideo, secondVideo, second, output) {
	run("ffmpeg", [
		"-y",
		...ffmpegArgs(),
		"-ss",
		String(second),
		"-i",
		firstVideo,
		"-ss",
		String(second),
		"-i",
		secondVideo,
		...ffmpegOutputSafetyArgs(),
		"-filter_complex",
		"[0:v][1:v]vstack=inputs=2[stacked]",
		"-map",
		"[stacked]",
		"-frames:v",
		"1",
		"-an",
		"-c:v",
		"libwebp",
		"-quality",
		"82",
		"-compression_level",
		"6",
		"-preset",
		"picture",
		output,
	]);
}

function resizeWebp(source, width, output) {
	run("ffmpeg", [
		"-y",
		...ffmpegArgs(),
		"-i",
		source,
		...ffmpegOutputSafetyArgs(),
		"-vf",
		`scale=${width}:-2:flags=lanczos`,
		"-frames:v",
		"1",
		"-an",
		"-c:v",
		"libwebp",
		"-quality",
		"82",
		"-compression_level",
		"6",
		"-preset",
		"picture",
		output,
	]);
}

function buildAssetRecord(outputRoot, filename) {
	const filePath = path.join(outputRoot, filename);
	const metadata = probe(filePath);
	const video = metadata.streams.find(
		(stream) => stream.codec_type === "video",
	);
	if (!video) {
		throw new Error(`${filename} has no video or image stream`);
	}
	const record = {
		filename,
		sizeBytes: statSync(filePath).size,
		sha256: sha256(filePath),
		mediaType: filename.endsWith(".mp4") ? "video" : "image",
		codec: video.codec_name,
		width: video.width,
		height: video.height,
	};
	if (record.mediaType === "video") {
		record.frameRate = video.avg_frame_rate;
		record.pixelFormat = video.pix_fmt;
		record.durationSeconds = Number(metadata.format.duration);
		record.audioStreams = metadata.streams.filter(
			(stream) => stream.codec_type === "audio",
		).length;
	}
	return record;
}

function writeManifest(outputRoot) {
	const publishedAssets = PUBLISHED_FILENAMES.map((filename) =>
		buildAssetRecord(outputRoot, filename),
	);
	const manifest = {
		schemaVersion: 1,
		source: {
			kind: "user-supplied archive",
			suppliedOn: "2026-08-23",
			sanitizedDerivatives: true,
		},
		configurations: CONFIGURATIONS.map(
			({ publicId, horizontalFovDegrees, pitchOffsetDegrees }) => ({
				id: publicId,
				horizontalFovDegrees,
				pitchOffsetDegrees,
			}),
		),
		evidence: {
			camerasPerComposite: 4,
			documentedDurationSeconds: 250,
			documentedFrameRate: "2/1",
			replayHarnessIncluded: false,
			physicalCameraEvidence: false,
		},
		publishedAssets,
	};
	assertSafePublicMetadata(manifest);
	writeFileSync(
		path.join(outputRoot, "capture-manifest.json"),
		`${JSON.stringify(manifest, null, 2)}\n`,
		"utf8",
	);
}

function assertManagedSibling(outputRoot, candidate, purpose) {
	const resolvedOutput = path.resolve(outputRoot);
	const resolvedCandidate = path.resolve(candidate);
	const outputParent = path.dirname(resolvedOutput);
	const relativeCandidate = path.relative(outputParent, resolvedCandidate);
	const expectedPrefix = `.${path.basename(resolvedOutput)}.${purpose}-`;
	if (
		path.isAbsolute(relativeCandidate) ||
		relativeCandidate.startsWith(`..${path.sep}`) ||
		path.dirname(relativeCandidate) !== "." ||
		!relativeCandidate.startsWith(expectedPrefix)
	) {
		throw new Error(`Unsafe ${purpose} sibling path`);
	}
}

function createManagedSibling(outputRoot, purpose) {
	const resolvedOutput = path.resolve(outputRoot);
	const prefix = path.join(
		path.dirname(resolvedOutput),
		`.${path.basename(resolvedOutput)}.${purpose}-`,
	);
	const sibling = mkdtempSync(prefix);
	assertManagedSibling(resolvedOutput, sibling, purpose);
	return sibling;
}

function removeManagedSibling(outputRoot, candidate, purpose) {
	assertManagedSibling(outputRoot, candidate, purpose);
	rmSync(candidate, { force: true, recursive: true });
}

function validateStagedOutput(stageRoot) {
	assertExpectedInventory(
		stageRoot,
		["capture-manifest.json", ...PUBLISHED_FILENAMES].sort(),
		"staged public output",
	);
	const manifest = JSON.parse(
		readFileSync(path.join(stageRoot, "capture-manifest.json"), "utf8"),
	);
	assertSafePublicMetadata(manifest);
	const expectedAssets = PUBLISHED_FILENAMES.map((filename) =>
		buildAssetRecord(stageRoot, filename),
	);
	if (
		JSON.stringify(manifest.publishedAssets) !== JSON.stringify(expectedAssets)
	) {
		throw new Error("Staged public manifest does not match generated assets");
	}
}

export function buildOutputAtomically(
	outputRoot,
	producer,
	validate = () => {},
) {
	const resolvedOutput = path.resolve(outputRoot);
	mkdirSync(path.dirname(resolvedOutput), { recursive: true });
	let stageRoot = createManagedSibling(resolvedOutput, "stage");
	let backupRoot;
	let preserveBackup = false;

	try {
		producer(stageRoot);
		validate(stageRoot);
		if (!existsSync(resolvedOutput)) {
			renameSync(stageRoot, resolvedOutput);
			stageRoot = undefined;
			return;
		}

		backupRoot = createManagedSibling(resolvedOutput, "backup");
		removeManagedSibling(resolvedOutput, backupRoot, "backup");
		renameSync(resolvedOutput, backupRoot);
		try {
			renameSync(stageRoot, resolvedOutput);
			stageRoot = undefined;
		} catch (promotionError) {
			try {
				renameSync(backupRoot, resolvedOutput);
				backupRoot = undefined;
			} catch (rollbackError) {
				preserveBackup = true;
				throw new AggregateError(
					[promotionError, rollbackError],
					`Output promotion and rollback failed; prior output is preserved at ${backupRoot}`,
				);
			}
			throw promotionError;
		}

		removeManagedSibling(resolvedOutput, backupRoot, "backup");
		backupRoot = undefined;
	} finally {
		if (stageRoot && existsSync(stageRoot)) {
			removeManagedSibling(resolvedOutput, stageRoot, "stage");
		}
		if (backupRoot && !preserveBackup && existsSync(backupRoot)) {
			removeManagedSibling(resolvedOutput, backupRoot, "backup");
		}
	}
}

function produceMedia(sourceRoot, outputRoot) {
	const sanitizedVideos = new Map();
	for (const configuration of CONFIGURATIONS) {
		const output = path.join(outputRoot, `${configuration.publicId}.mp4`);
		encodeSanitizedVideo(
			path.join(sourceRoot, configuration.sourceDirectory, "composite.mp4"),
			output,
		);
		sanitizedVideos.set(configuration.publicId, output);
		writeWebpFromVideo(
			output,
			120,
			path.join(outputRoot, `${configuration.publicId}-poster.webp`),
		);
	}

	for (const second of [120, 180]) {
		const widestComparison = path.join(
			outputRoot,
			`comparison-bank-${second}-1440.webp`,
		);
		writeComparison(
			sanitizedVideos.get("fov50-p0-h0"),
			sanitizedVideos.get("fov110-m5-h0"),
			second,
			widestComparison,
		);
		for (const width of [640, 960]) {
			resizeWebp(
				widestComparison,
				width,
				path.join(outputRoot, `comparison-bank-${second}-${width}.webp`),
			);
		}
	}

	writeManifest(outputRoot);
}

function main() {
	const { sourceRoot, outputRoot } = parseArgs();
	assertNonOverlappingRoots(sourceRoot, outputRoot);
	assertSourceContract(sourceRoot);
	buildOutputAtomically(
		outputRoot,
		(stageRoot) => produceMedia(sourceRoot, stageRoot),
		validateStagedOutput,
	);
}

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
	main();
}
