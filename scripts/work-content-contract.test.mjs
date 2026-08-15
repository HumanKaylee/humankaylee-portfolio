import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";

function frontmatterValue(entry, field) {
	return entry.match(
		new RegExp(`^${field}:\\s*[\"']?([^\\n\"']+)[\"']?\\s*$`, "m"),
	)?.[1];
}

test("Work content has three unique flagships and required local assets", () => {
	const dir = "apps/web/src/content/work";
	const files = readdirSync(dir).filter((name) => name.endsWith(".md"));
	const source = files.map((name) =>
		readFileSync(path.join(dir, name), "utf8"),
	);
	const featuredOrders = source
		.map((entry) => frontmatterValue(entry, "featuredOrder"))
		.filter((value) => value !== undefined);
	const slugs = source.map((entry) => frontmatterValue(entry, "slug"));

	assert.deepEqual([...featuredOrders].sort(), ["1", "2", "3"]);
	assert.equal(new Set(featuredOrders).size, 3);
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
