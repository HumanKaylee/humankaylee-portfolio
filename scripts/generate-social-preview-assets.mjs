import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);
const publicDir = path.join(repoRoot, "apps/web/public");
const projectDefinitions = {
	default: {
		sourceName: "cryo-flow-sim-stage1-poster.png",
		sourcePath: path.join(publicDir, "media/cryo-flow-sim-stage1-poster.png"),
		outputPath: path.join(publicDir, "social/default.png"),
	},
	openxhc: {
		sourceName: "openxhc-proof-loop-1440.webp",
		sourcePath: path.join(
			publicDir,
			"media/openxhc/openxhc-proof-loop-1440.webp",
		),
		outputPath: path.join(publicDir, "social/openxhc-linuxcnc.png"),
	},
	"mac-mini-shelf": {
		sourceName: "shelf-fit.png",
		sourcePath: path.join(publicDir, "media/mac-mini-shelf/shelf-fit.png"),
		outputPath: path.join(publicDir, "social/mac-mini-shelf.png"),
	},
};
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

function requestedOptions(args) {
	let project = "default";
	let outputPath;

	for (let index = 0; index < args.length; index += 2) {
		const flag = args[index];
		const value = args[index + 1];

		if (!value?.trim() || !["--project", "--output"].includes(flag)) {
			throw new Error(
				"Usage: node scripts/generate-social-preview-assets.mjs [--project openxhc|mac-mini-shelf] [--output <png-path>]",
			);
		}

		if (flag === "--project") {
			project = value;
		} else {
			outputPath = path.resolve(repoRoot, value);
		}
	}

	if (!(project in projectDefinitions)) {
		throw new Error(`Unknown social preview project: ${project}`);
	}

	return {
		project,
		outputPath: outputPath ?? projectDefinitions[project].outputPath,
	};
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
const { outputPath, project } = requestedOptions(process.argv.slice(2));
const projectDefinition = projectDefinitions[project];
const sourcePoster = projectDefinition.sourcePath;

if (!existsSync(sourcePoster)) {
	throw new Error(`Missing authentic source poster: ${sourcePoster}`);
}

mkdirSync(path.dirname(outputPath), { recursive: true });

const defaultPositioningFilters = positioningLines
	.map(
		(line, index) =>
			`drawtext=fontfile='${boldFont}':text='${line}':fontcolor=0x11120F:fontsize=48:x=58:y=${220 + index * 66}`,
	)
	.join(",");
const defaultFilter = [
	`[0:v]drawbox=x=58:y=60:w=86:h=12:color=0xD9FF43:t=fill,drawtext=fontfile='${regularFont}':text='${name}':fontcolor=0x11120F:fontsize=32:x=58:y=106,${defaultPositioningFilters}[text]`,
	"[1:v]scale=1120:630,crop=660:630:0:0[media]",
	"[text][media]hstack=inputs=2[out]",
].join(";");
const openXhcFilter = [
	`[0:v]drawbox=x=54:y=52:w=92:h=12:color=0xD9FF43:t=fill,drawtext=fontfile='${boldFont}':text='OpenXHC':fontcolor=0xF2F1EB:fontsize=54:x=54:y=102,drawtext=fontfile='${regularFont}':text='CNC MOTION INTERFACE':fontcolor=0xBFC0B8:fontsize=21:x=54:y=176,drawtext=fontfile='${boldFont}':text='2,490 reports':fontcolor=0xD9FF43:fontsize=42:x=54:y=294,drawtext=fontfile='${boldFont}':text='0 mismatches':fontcolor=0xF2F1EB:fontsize=42:x=54:y=352,drawtext=fontfile='${regularFont}':text='OFFLINE C++20 VALIDATION':fontcolor=0xBFC0B8:fontsize=19:x=54:y=473,drawtext=fontfile='${regularFont}':text='NO USB WRITES':fontcolor=0xBFC0B8:fontsize=19:x=54:y=509[text]`,
	"[1:v]scale=1120:630,crop=684:630:16:0[media]",
	"[text][media]hstack=inputs=2[out]",
].join(";");
const macMiniShelfFilter = [
	`[0:v]drawbox=x=54:y=52:w=92:h=12:color=0xD9FF43:t=fill,drawtext=fontfile='${boldFont}':text='MAC MINI WALL SHELF':fontcolor=0xF2F1EB:fontsize=38:x=54:y=102,drawtext=fontfile='${regularFont}':text='AGENTIC CAD + FEM':fontcolor=0xBFC0B8:fontsize=21:x=54:y=172,drawtext=fontfile='${boldFont}':text='0.064 mm deflection':fontcolor=0xD9FF43:fontsize=36:x=54:y=274,drawtext=fontfile='${boldFont}':text='1.42 MPa stress':fontcolor=0xF2F1EB:fontsize=36:x=54:y=326,drawtext=fontfile='${boldFont}':text='3.5x creep margin':fontcolor=0xF2F1EB:fontsize=36:x=54:y=378,drawtext=fontfile='${regularFont}':text='DIGITAL MANUFACTURING PACKAGE':fontcolor=0xBFC0B8:fontsize=18:x=54:y=492[text]`,
	"[1:v]scale=1120:630,crop=684:630:16:0[media]",
	"[text][media]hstack=inputs=2[out]",
].join(";");
const filter =
	project === "openxhc"
		? openXhcFilter
		: project === "mac-mini-shelf"
			? macMiniShelfFilter
			: defaultFilter;
const panelWidth =
	project === "openxhc" || project === "mac-mini-shelf" ? 516 : 540;

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
		`color=c=${project === "openxhc" || project === "mac-mini-shelf" ? "0x11120F" : "0xF2F1EB"}:s=${panelWidth}x630`,
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

const summary =
	project === "openxhc"
		? "OpenXHC | 2,490 reports | 0 mismatches"
		: project === "mac-mini-shelf"
			? "Mac mini shelf | 0.064 mm deflection | 3.5x creep margin"
			: `${name} — ${positioningLines.join(" ")}`;

console.log(
	`Generated ${path.relative(repoRoot, outputPath)} from ${projectDefinition.sourceName}: ${summary}`,
);
