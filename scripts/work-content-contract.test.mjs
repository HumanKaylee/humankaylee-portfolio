import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";

function frontmatterValue(entry, field) {
	return entry.match(
		new RegExp(`^${field}:\\s*[\"']?([^\\n\"']+)[\"']?\\s*$`, "m"),
	)?.[1];
}

const expectedPublishedSlugs = [
	"cryo-flow-sim",
	"conformal-cooling-channel-generation",
	"xplane-cabin-camera-fov-trade-study",
	"black-scholes-wasm",
	"cli-fleet-synchronization-and-mcp-rollout",
	"remote-workstation-recovery-and-operational-debugging",
];

test("Work content has two flagships, two supporting studies, two archives, and required local assets", () => {
	const dir = "apps/web/src/content/work";
	const files = readdirSync(dir).filter((name) => name.endsWith(".md"));
	const source = files.map((name) =>
		readFileSync(path.join(dir, name), "utf8"),
	);
	const placements = source.map((entry) =>
		frontmatterValue(entry, "placement"),
	);
	const slugs = source.map((entry) => frontmatterValue(entry, "slug"));
	const featuredOrders = source.map((entry) =>
		Number(frontmatterValue(entry, "featuredOrder")),
	);

	assert.deepEqual([...placements].sort(), [
		"archive",
		"archive",
		"flagship",
		"flagship",
		"supporting",
		"supporting",
	]);
	assert.deepEqual(
		[...featuredOrders].sort((left, right) => left - right),
		[1, 2, 3, 4, 5, 6],
	);
	assert.deepEqual(
		slugs
			.map((slug, index) => ({ order: featuredOrders[index], slug }))
			.sort((left, right) => left.order - right.order)
			.map(({ slug }) => slug),
		expectedPublishedSlugs,
	);
	assert.equal(new Set(files).size, files.length);
	assert.ok(slugs.every((slug) => slug));
	assert.equal(new Set(slugs).size, slugs.length);
	assert.ok(
		source.every(
			(entry) =>
				!(
					/^publicationStatus:\s*publish$/m.test(entry) &&
					/^redactionStatus:\s*blocked$/m.test(entry)
				),
		),
	);
	assert.ok(
		existsSync("apps/web/public/media/cryo-flow-sim-stage1-poster.png"),
	);
	for (const width of [640, 960, 1440]) {
		assert.ok(
			existsSync(`apps/web/public/media/cryo-flow-sim-stage1-${width}.webp`),
		);
	}
	assert.ok(existsSync("apps/web/public/media/cryo-flow-sim-stage1.mp4"));
	assert.ok(existsSync("apps/web/public/downloads/joe-poznanski-resume.pdf"));
});
