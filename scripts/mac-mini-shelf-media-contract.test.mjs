import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const publicRoot = "apps/web/public/media/mac-mini-shelf";
const generatorPath = "scripts/build-mac-mini-shelf-media.mjs";
const originals = {
	"shelf-fit.png": {
		width: 1400,
		height: 1000,
		sha256: "76bb0b95d28d67379590d89c1553378e1283d0441b8445ea478478b42f103c75",
	},
	"full-stack.png": {
		width: 1400,
		height: 1000,
		sha256: "9ce3c8af0dd56cfc7bd781df2998876840b9e5dcff9588549abdfa5c7b96bed2",
	},
	"print-orientation.png": {
		width: 1400,
		height: 1000,
		sha256: "50b5b53643330e3466e1b321f4cb67f84245f9215f6fac45d29b9d4f660670ef",
	},
	"fem-constraints.png": {
		width: 1400,
		height: 950,
		sha256: "329469f133d6f3110be40ded32e16f82059ecb79b541cd64b618c7d0b5a40eff",
	},
	"fem-mesh-underside.png": {
		width: 1400,
		height: 950,
		sha256: "f1fbae01a10ca54d918fb6c9fe5f1e210e4c37709dbbf0bb54c0097425697ccb",
	},
	"fem-vonmises-underside.png": {
		width: 1400,
		height: 950,
		sha256: "4d8291de996585b847e67c6c03b91c623ef2621ffe10cc1b9d094924af09f62a",
	},
	"fem-displacement.png": {
		width: 1400,
		height: 950,
		sha256: "f9c5cd2e033c7ab74527da11b6e85b661cbb8bbc51f4c5acaa8d330baf3e9478",
	},
	"fem-deformed.png": {
		width: 1400,
		height: 950,
		sha256: "27dca48ea546d00be0ffc0d575ef2b33c43bd88e32afe4b58064141eea52ea4d",
	},
};
const responsiveWidths = [640, 960, 1440];

function sha256(filePath) {
	return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function pngDimensions(filePath) {
	const bytes = readFileSync(filePath);
	assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
	assert.equal(bytes.subarray(12, 16).toString("ascii"), "IHDR");
	return {
		width: bytes.readUInt32BE(16),
		height: bytes.readUInt32BE(20),
	};
}

function webpDimensions(filePath) {
	const result = spawnSync(
		"ffprobe",
		["-v", "error", "-show_streams", "-of", "json", filePath],
		{ encoding: "utf8" },
	);
	assert.equal(result.status, 0, result.stderr);
	const stream = JSON.parse(result.stdout).streams.find(
		(candidate) => candidate.codec_type === "video",
	);
	assert.ok(stream, `${filePath} has no image stream`);
	return { width: stream.width, height: stream.height };
}

test("Mac mini shelf media preserves verified originals and responsive derivatives", () => {
	assert.ok(existsSync(generatorPath), `missing ${generatorPath}`);
	const generator = readFileSync(generatorPath, "utf8");

	for (const [filename, original] of Object.entries(originals)) {
		const originalPath = path.join(publicRoot, filename);
		assert.ok(existsSync(originalPath), `missing original ${filename}`);
		assert.equal(sha256(originalPath), original.sha256, filename);
		assert.deepEqual(pngDimensions(originalPath), {
			width: original.width,
			height: original.height,
		});
		assert.match(generator, new RegExp(`"${filename}"`));

		const basename = path.basename(filename, ".png");
		for (const width of responsiveWidths) {
			const derivative = `${basename}-${width}.webp`;
			const derivativePath = path.join(publicRoot, derivative);
			assert.ok(existsSync(derivativePath), `missing derivative ${derivative}`);
			assert.equal(
				webpDimensions(derivativePath).width,
				Math.min(width, original.width),
				derivative,
			);
		}
	}

	for (const width of responsiveWidths) {
		assert.match(generator, new RegExp(`\\b${width}\\b`));
	}
});
