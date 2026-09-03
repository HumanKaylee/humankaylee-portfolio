import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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
	"openxhc-linuxcnc",
	"mac-mini-shelf",
	"black-scholes-wasm",
	"cli-fleet-synchronization-and-mcp-rollout",
	"remote-workstation-recovery-and-operational-debugging",
];

test("Work content has two flagships, four supporting studies, two archives, and required local assets", () => {
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
		"supporting",
		"supporting",
	]);
	assert.deepEqual(
		[...featuredOrders].sort((left, right) => left - right),
		[1, 2, 3, 4, 5, 6, 7, 8],
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
	assert.ok(existsSync("apps/web/public/media/mac-mini-shelf/shelf-fit.png"));
	for (const width of [640, 960, 1440]) {
		assert.ok(
			existsSync(
				`apps/web/public/media/mac-mini-shelf/shelf-fit-${width}.webp`,
			),
		);
	}
	for (const width of [640, 960, 1440]) {
		assert.ok(
			existsSync(
				`apps/web/public/media/openxhc/openxhc-proof-loop-${width}.webp`,
			),
		);
	}
	assert.ok(existsSync("apps/web/public/media/openxhc/openxhc-proof-loop.mp4"));
	const openxhcSource = source.find(
		(entry) => frontmatterValue(entry, "slug") === "openxhc-linuxcnc",
	);
	assert.ok(openxhcSource);
	assert.equal(
		statSync("apps/web/public/media/openxhc/openxhc-proof-loop.mp4").size,
		Number(openxhcSource.match(/^\s+sizeBytes:\s*(\d+)$/m)?.[1]),
	);
	assert.ok(existsSync("apps/web/public/downloads/joe-poznanski-resume.pdf"));
});

test("Mac mini shelf keeps its four-times front-edge case out of service guidance", () => {
	const shelf = readFileSync(
		"apps/web/src/content/work/mac-mini-shelf.md",
		"utf8",
	);

	assert.match(
		shelf,
		/four-times front-edge case was transient analysis evidence, not a recommended service load/i,
	);
});

test("CryoSim connects prior controls experience to a bounded consulting offer", () => {
	const cryo = readFileSync(
		"apps/web/src/content/work/cryo-flow-sim.md",
		"utf8",
	);
	const normalizedCryo = cryo.replace(/\s+/g, " ");

	for (const requiredClaim of [
		"informed by Siemens and Rockwell PLC experience",
		"Siemens and Rockwell PLC logic",
		"commodity inventories, temperatures, pressures, and other sensor and actuator feedback",
		"facility-specific control-sequence rehearsal",
		"does not reproduce proprietary employer implementation",
		"is not plant-calibrated, connected to PLC or DCS control logic, safety-authoritative, or an operational digital twin",
	]) {
		assert.ok(
			normalizedCryo.includes(requiredClaim),
			`CryoSim case study is missing: ${requiredClaim}`,
		);
	}

	assert.doesNotMatch(cryo, /is an operational digital twin/i);
	assert.doesNotMatch(cryo, /[—–]/);
});
