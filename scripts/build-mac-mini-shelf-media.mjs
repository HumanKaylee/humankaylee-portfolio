import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const sourceNames = [
	"shelf-fit.png",
	"full-stack.png",
	"print-orientation.png",
	"fem-constraints.png",
	"fem-mesh-underside.png",
	"fem-vonmises-underside.png",
	"fem-displacement.png",
	"fem-deformed.png",
];
const widths = [640, 960, 1440];
const publicRoot = "apps/web/public/media/mac-mini-shelf";

function runFfmpeg(args) {
	const result = spawnSync("ffmpeg", args, { encoding: "utf8" });
	if (result.error) {
		throw result.error;
	}
	if (result.status !== 0) {
		throw new Error(`ffmpeg failed: ${result.stderr}`);
	}
}

function main() {
	const outputRoot = path.resolve(publicRoot);
	mkdirSync(outputRoot, { recursive: true });

	for (const sourceName of sourceNames) {
		const sourcePath = path.join(outputRoot, sourceName);
		if (!existsSync(sourcePath)) {
			throw new Error(`Missing source image: ${sourcePath}`);
		}
		const basename = path.basename(sourceName, ".png");
		for (const width of widths) {
			const outputPath = path.join(outputRoot, `${basename}-${width}.webp`);
			runFfmpeg([
				"-hide_banner",
				"-loglevel",
				"error",
				"-y",
				"-i",
				sourcePath,
				"-vf",
				`scale=${width}:-2:flags=lanczos`,
				"-frames:v",
				"1",
				"-map_metadata",
				"-1",
				"-c:v",
				"libwebp",
				"-quality",
				"82",
				"-compression_level",
				"6",
				outputPath,
			]);
		}
	}

	console.log("Generated 8 originals and 24 responsive WebP files at 640/960/1440.");
}

main();
