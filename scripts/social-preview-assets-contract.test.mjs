import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

const repoRoot = process.cwd();
const publicDir = path.join(repoRoot, "apps/web/public");
const scannedRoots = ["apps/web/src"];
const pngSignature = "89504e470d0a1a0a";
const socialGenerator = readFileSync(
	path.join(repoRoot, "scripts/generate-social-preview-assets.mjs"),
	"utf8",
);

function listFiles(entryPath) {
	const fullPath = path.join(repoRoot, entryPath);
	const stats = statSync(fullPath);

	if (stats.isFile()) {
		return [fullPath];
	}

	return readdirSync(fullPath, { withFileTypes: true }).flatMap((entry) => {
		const childPath = path.join(fullPath, entry.name);

		if (entry.isDirectory()) {
			return listFiles(path.relative(repoRoot, childPath));
		}

		return entry.isFile() ? [childPath] : [];
	});
}

function collectSocialReferences() {
	const references = new Map();
	const socialPathPattern = /["'](\/social\/[^"']+)["']/g;

	for (const source of scannedRoots.flatMap(listFiles)) {
		const relativeSource = path.relative(repoRoot, source);
		const content = readFileSync(source, "utf8");
		let match = socialPathPattern.exec(content);

		while (match) {
			const socialPath = match[1];
			const sources = references.get(socialPath) ?? [];
			sources.push(relativeSource);
			references.set(socialPath, sources);
			match = socialPathPattern.exec(content);
		}
	}

	return references;
}

function readFrontmatterValue(content, key) {
	return content.match(new RegExp(`^\\s*${key}:\\s*"([^"]+)"`, "m"))?.[1] ?? "";
}

function socialAssetPath(socialPath) {
	return path.join(publicDir, socialPath.replace(/^\//, ""));
}

function readPngDimensions(assetPath) {
	const file = readFileSync(assetPath);
	const signature = file.subarray(0, 8).toString("hex");

	assert.equal(signature, pngSignature, `${assetPath} must be a PNG file`);

	return {
		width: file.readUInt32BE(16),
		height: file.readUInt32BE(20),
	};
}

test("all source social preview references resolve to public assets", () => {
	const references = collectSocialReferences();

	assert.ok(
		references.size > 0,
		"expected at least one /social/ preview asset reference",
	);

	const missingAssets = [];

	for (const [socialPath, sources] of references) {
		assert.ok(
			!socialPath.includes(".."),
			`${socialPath} must not traverse outside public assets`,
		);

		const assetPath = socialAssetPath(socialPath);
		if (!existsSync(assetPath) || !statSync(assetPath).isFile()) {
			missingAssets.push(
				`${socialPath} referenced by ${[...new Set(sources)].join(", ")}`,
			);
		}
	}

	assert.deepEqual(missingAssets, []);
});

test("referenced PNG social preview assets are valid 1200x630 images", () => {
	const references = collectSocialReferences();
	const invalidAssets = [];

	for (const socialPath of references.keys()) {
		if (!socialPath.endsWith(".png")) {
			continue;
		}

		const assetPath = socialAssetPath(socialPath);
		const dimensions = readPngDimensions(assetPath);

		if (dimensions.width !== 1200 || dimensions.height !== 630) {
			invalidAssets.push(
				`${socialPath} is ${dimensions.width}x${dimensions.height}`,
			);
		}
	}

	assert.deepEqual(invalidAssets, []);
});

test("the default social card composes authentic project media without the retired theme", () => {
	assert.match(socialGenerator, /cryo-flow-sim-stage1-poster\.png/);
	assert.match(socialGenerator, /"Principal engineer"/);
	assert.match(socialGenerator, /"for systems that"/);
	assert.match(socialGenerator, /"cannot drift\."/);
	assert.match(socialGenerator, /Joe Poznanski/);
	assert.doesNotMatch(
		socialGenerator,
		/SYSTEMS ATELIER|gradient:#091612|#091612|#26382f/i,
	);
});

test("unpublished case-study candidates use the generic social preview", () => {
	// Updated 2026-05-26 (post-0a1f924 M7-partial): static per-page OG PNGs
	// (incl. /social/case-study-detail.png) were retired in favor of the
	// runtime /api/og?title=... endpoint. Canonical fallback for unpublished
	// candidates is now /social/default.svg; legacy paths accepted in transition.
	const acceptableFallbacks = new Set([
		"/social/default.svg",
		"/social/default.png",
		"/social/case-study-detail.png",
	]);
	const caseStudyFiles = listFiles("apps/web/src/content/case-studies").filter(
		(filePath) => filePath.endsWith(".md"),
	);
	const violations = [];

	for (const filePath of caseStudyFiles) {
		const content = readFileSync(filePath, "utf8");
		const publicationStatus = readFrontmatterValue(
			content,
			"publicationStatus",
		);
		const ogImage = readFrontmatterValue(content, "ogImage");

		if (publicationStatus === "publish") {
			continue;
		}

		if (!acceptableFallbacks.has(ogImage)) {
			violations.push(
				`${path.relative(repoRoot, filePath)} uses ${ogImage || "<missing>"} (expected one of: ${[...acceptableFallbacks].join(", ")})`,
			);
		}
	}

	assert.deepEqual(violations, []);
});
