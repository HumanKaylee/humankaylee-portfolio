import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);
const publicDir = path.join(repoRoot, "apps/web/public");
const sourcePoster = path.join(
	publicDir,
	"media/cryo-flow-sim-stage1-poster.png",
);
const defaultOutputPath = path.join(publicDir, "social/default.png");
const name = "Joe Poznanski";
const positioningLines = [
	"Principal engineer",
	"for systems that",
	"cannot drift.",
];

function firstExistingPath(paths, label) {
	const result = paths.find((candidate) => existsSync(candidate));
	if (!result) {
		throw new Error(`Could not find a local ${label} font for social preview`);
	}
	return result;
}

function requestedOutputPath(args) {
	if (args.length === 0) {
		return defaultOutputPath;
	}

	if (args.length !== 2 || args[0] !== "--output" || !args[1].trim()) {
		throw new Error(
			"Usage: node scripts/generate-social-preview-assets.mjs [--output <png-path>]",
		);
	}

	return path.resolve(repoRoot, args[1]);
}

function ffmpegFilterPath(filePath) {
	return filePath.replaceAll("\\", "/").replace(":", "\\:");
}

const regularFont = ffmpegFilterPath(
	firstExistingPath(
		[
			"C:/Windows/Fonts/arial.ttf",
			"/System/Library/Fonts/Supplemental/Arial.ttf",
			"/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
		],
		"regular",
	),
);
const boldFont = ffmpegFilterPath(
	firstExistingPath(
		[
			"C:/Windows/Fonts/arialbd.ttf",
			"/System/Library/Fonts/Supplemental/Arial Bold.ttf",
			"/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
		],
		"bold",
	),
);
const outputPath = requestedOutputPath(process.argv.slice(2));

if (!existsSync(sourcePoster)) {
	throw new Error(`Missing authentic source poster: ${sourcePoster}`);
}

mkdirSync(path.dirname(outputPath), { recursive: true });

const positioningFilters = positioningLines
	.map(
		(line, index) =>
			`drawtext=fontfile='${boldFont}':text='${line}':fontcolor=0x11120F:fontsize=48:x=58:y=${220 + index * 66}`,
	)
	.join(",");
const filter = [
	`[0:v]drawbox=x=58:y=60:w=86:h=12:color=0xD9FF43:t=fill,drawtext=fontfile='${regularFont}':text='${name}':fontcolor=0x11120F:fontsize=32:x=58:y=106,${positioningFilters}[text]`,
	"[1:v]scale=1120:630,crop=660:630:0:0[media]",
	"[text][media]hstack=inputs=2[out]",
].join(";");

const result = spawnSync(
	"ffmpeg",
	[
		"-hide_banner",
		"-loglevel",
		"error",
		"-y",
		"-f",
		"lavfi",
		"-i",
		"color=c=0xF2F1EB:s=540x630",
		"-i",
		sourcePoster,
		"-filter_complex",
		filter,
		"-map",
		"[out]",
		"-frames:v",
		"1",
		"-update",
		"1",
		outputPath,
	],
	{ stdio: "inherit" },
);

if (result.status !== 0) {
	throw new Error(`Failed to generate ${outputPath}`);
}

console.log(
	`Generated ${path.relative(repoRoot, outputPath)} from cryo-flow-sim-stage1-poster.png: ${name} — ${positioningLines.join(" ")}`,
);
