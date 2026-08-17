import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import ts from "typescript";

const contractsDirectory = join(
	process.cwd(),
	"apps",
	"web",
	"src",
	"lib",
	"contracts",
);

async function loadWorkSchema() {
	const temporaryDirectory = await mkdtemp(
		join(tmpdir(), "portfolio-media-contract-"),
	);
	const astroZodUrl = import.meta.resolve("astro/zod");

	try {
		const contentSource = (
			await readFile(join(contractsDirectory, "content.ts"), "utf8")
		).replace('from "astro/zod"', `from ${JSON.stringify(astroZodUrl)}`);
		const workSource = (
			await readFile(join(contractsDirectory, "work.ts"), "utf8")
		)
			.replace('from "astro/zod"', `from ${JSON.stringify(astroZodUrl)}`)
			.replace('from "./content"', 'from "./content.mjs"');

		for (const [name, source] of [
			["content.mjs", contentSource],
			["work.mjs", workSource],
		]) {
			const output = ts.transpileModule(source, {
				compilerOptions: {
					module: ts.ModuleKind.ESNext,
					target: ts.ScriptTarget.ES2022,
					verbatimModuleSyntax: true,
				},
				fileName: name.replace(".mjs", ".ts"),
			}).outputText;
			await writeFile(join(temporaryDirectory, name), output, "utf8");
		}

		const module = await import(
			`${pathToFileURL(join(temporaryDirectory, "work.mjs")).href}?${Date.now()}`
		);
		return module.workSchema;
	} finally {
		await rm(temporaryDirectory, { force: true, recursive: true });
	}
}

const validWork = {
	title: "Cryogenic Flow Simulation",
	slug: "cryo-flow-sim",
	discipline: "simulation",
	year: 2026,
	placement: "flagship",
	lede: "A deterministic cryogenic flow simulation.",
	problem: "Make transient behavior reproducible without live hardware.",
	stakes: "Incorrect state transitions can misrepresent boundary behavior.",
	role: "Architecture, implementation, capture, and verification.",
	constraints: ["Fixed-seed determinism"],
	architecture: {
		overview: "A physics core feeds a service and browser visualization.",
		diagramAlt: "Physics core to service to browser visualization.",
	},
	decisions: [
		{
			title: "Deterministic capture",
			choice: "Drive the scenario from a fixed seed.",
			alternatives: ["Record an uncontrolled run"],
			tradeoff: "Less variability for reproducible evidence.",
		},
	],
	outcome: "A verified motion artifact.",
	lessons: ["Deterministic artifacts make regressions diagnosable."],
	evidence: {
		label: "Verified artifact",
		summary: "Capture thresholds passed.",
		values: [{ label: "Checks", value: "Pass", detail: "Validated" }],
		scope: "Public artifact",
		limits: "Interactive control is outside this release.",
	},
	media: {
		kind: "video",
		src: "/media/cryo-flow-sim-stage1.mp4",
		poster: "/media/cryo-flow-sim-stage1-1440.webp",
		width: 1920,
		height: 1080,
		alt: "Cryogenic flow simulation dashboard.",
		caption: "Deterministic Stage 1 capture.",
	},
	publicationStatus: "publish",
	redactionStatus: "reviewed",
	redactionReview: {
		guidePath: "docs/CONTENT_REDACTION_GUIDE.md",
		reviewer: "operator",
		checklistStatus: "partial",
		openItems: [],
		notes: "Public-safe artifact.",
	},
	seo: {
		title: "Cryogenic Flow Simulation | Joe Poznanski",
		description: "A deterministic simulation and verified capture pipeline.",
		canonicalPath: "/work/cryo-flow-sim/",
		ogImage: "/social/default.png",
	},
};

const validLoop = {
	src: "/media/cryo-flow-sim-loop-960.mp4",
	poster: "/media/cryo-flow-sim-loop-960.webp",
	width: 960,
	height: 540,
	durationSeconds: 10,
	sizeBytes: 2_000_000,
	alt: "Cryogenic flow loop",
	description:
		"Parallel valve travel changes tank levels, flow paths, and telemetry.",
};

test("accepts and retains a bounded short-loop media record", async () => {
	const workSchema = await loadWorkSchema();
	const parsed = workSchema.parse({
		...validWork,
		media: { ...validWork.media, loop: validLoop },
	});

	assert.deepEqual(parsed.media.loop, validLoop);
});

for (const [label, invalidLoop] of [
	["duration over 12 seconds", { ...validLoop, durationSeconds: 13 }],
	["file size over 2 MiB", { ...validLoop, sizeBytes: 2_097_153 }],
	["blank description", { ...validLoop, description: "" }],
	["missing poster", { ...validLoop, poster: undefined }],
]) {
	test(`rejects a short loop with ${label}`, async () => {
		const workSchema = await loadWorkSchema();

		assert.throws(() =>
			workSchema.parse({
				...validWork,
				media: { ...validWork.media, loop: invalidLoop },
			}),
		);
	});
}
