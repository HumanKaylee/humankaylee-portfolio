import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	statSync,
	writeFileSync,
} from "node:fs";
import path from "node:path";
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

const ALLOWED_OUTPUT_FILENAMES = new Set([
	"capture-manifest.json",
	...PUBLISHED_FILENAMES,
]);

const FORBIDDEN = /SNV|[A-Za-z]:\\|XPlaneRecordings|\bLM[5-8]\b/i;
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

function assertSafePublicMetadata(value) {
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

function assertSourceContract(sourceRoot) {
	assertExpectedInventory(
		sourceRoot,
		CONFIGURATIONS.map((configuration) => configuration.sourceDirectory).sort(),
		"source root",
	);

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

function main() {
	const { sourceRoot, outputRoot } = parseArgs();
	if (sourceRoot === outputRoot) {
		throw new Error("Source and output roots must differ");
	}
	assertSourceContract(sourceRoot);
	mkdirSync(outputRoot, { recursive: true });
	const unexpectedOutputs = readdirSync(outputRoot).filter(
		(filename) => !ALLOWED_OUTPUT_FILENAMES.has(filename),
	);
	if (unexpectedOutputs.length > 0) {
		throw new Error("Unexpected output inventory; refusing to overwrite it");
	}

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

main();
