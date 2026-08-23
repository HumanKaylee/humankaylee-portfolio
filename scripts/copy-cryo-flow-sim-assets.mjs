#!/usr/bin/env node

/**
 * copy-cryo-flow-sim-assets.mjs
 *
 * Copies the cryo-flow-sim Stage 1 MP4 and poster PNG from the source
 * showcase artifact directory into apps/web/public/media/.
 *
 * Source: C:\Users\joepo\projects\cryo-flow-sim-showcase\artifacts\stage1_showcase_final\
 * Target: apps/web/public/media/
 *
 * Run from the repo root:
 *   node scripts/copy-cryo-flow-sim-assets.mjs
 *
 * Set CRYO_SOURCE_DIR to override the default source path.
 */

import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_SOURCE_DIR = join(
	"C:",
	"Users",
	"joepo",
	"projects",
	"cryo-flow-sim-showcase",
	"artifacts",
	"stage1_showcase_final",
);

const SOURCE_DIR = process.env.CRYO_SOURCE_DIR ?? DEFAULT_SOURCE_DIR;
const TARGET_MEDIA_DIR = join("apps", "web", "public", "media");

const EXPECTED_MP4_BYTES = 13_157_234;

const ASSETS = [
	{
		src: join(SOURCE_DIR, "video", "demo.mp4"),
		dest: join(TARGET_MEDIA_DIR, "cryo-flow-sim-stage1.mp4"),
		label: "Stage 1 MP4",
		expectedBytes: EXPECTED_MP4_BYTES,
	},
	{
		src: join(SOURCE_DIR, "screens", "overview-dashboard.png"),
		dest: join(TARGET_MEDIA_DIR, "cryo-flow-sim-stage1-poster.png"),
		label: "Stage 1 poster (overview-dashboard)",
		expectedBytes: null,
	},
];

function fail(message) {
	process.stderr.write(`ERROR: ${message}\n`);
	process.exit(1);
}

function log(message) {
	process.stdout.write(`${message}\n`);
}

mkdirSync(TARGET_MEDIA_DIR, { recursive: true });

for (const asset of ASSETS) {
	if (!existsSync(asset.src)) {
		fail(`Source file not found: ${asset.src}`);
	}

	copyFileSync(asset.src, asset.dest);

	const destStat = statSync(asset.dest);
	const bytes = destStat.size;

	if (asset.expectedBytes !== null && bytes !== asset.expectedBytes) {
		fail(
			`${asset.label} copied but byte count mismatch: expected ${asset.expectedBytes}, got ${bytes}`,
		);
	}

	log(`OK  ${asset.label}: ${asset.dest} (${bytes} bytes)`);
}

log("cryo-flow-sim assets copied successfully.");
