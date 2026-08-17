import { describe, expect, it } from "vitest";

import { workSchema } from "./work";

const validWork = {
	title: "Cryogenic Flow Simulation",
	slug: "cryo-flow-sim",
	discipline: "simulation",
	year: 2026,
	placement: "flagship",
	featuredOrder: 1,
	lede: "A deterministic cryogenic flow simulation with auditable capture evidence.",
	problem: "Make transient system behavior reproducible without live hardware.",
	stakes: "Incorrect state transitions can misrepresent boundary behavior.",
	role: "Architecture, Rust implementation, capture pipeline, and verification.",
	constraints: ["Fixed-seed determinism", "No live hardware dependency"],
	architecture: {
		overview:
			"A Rust physics core feeds an Axum service and browser visualization.",
		diagramAlt:
			"Physics core to service to browser visualization and capture harness.",
	},
	decisions: [
		{
			title: "Deterministic capture",
			choice: "Drive the scenario from a fixed seed.",
			alternatives: ["Record an uncontrolled live run"],
			tradeoff: "Less variability in exchange for reproducible evidence.",
		},
	],
	outcome: "A verified 1080p artifact with 92 passing tests.",
	lessons: ["Deterministic artifacts make regressions diagnosable."],
	evidence: {
		label: "Stage 1 verified artifact",
		summary: "92 tests and all capture thresholds passed.",
		values: [{ label: "Tests", value: "92", detail: "cargo-nextest" }],
		scope: "Public Stage 1 artifact",
		limits: "Stage 2 is outside this release.",
	},
	media: {
		kind: "video",
		src: "/media/cryo-flow-sim-stage1.mp4",
		poster: "/media/cryo-flow-sim-stage1-poster.png",
		responsivePosterSources: [
			{ src: "/media/example-640.webp", width: 640 },
			{ src: "/media/example-960.webp", width: 960 },
			{ src: "/media/example-1440.webp", width: 1440 },
		],
		width: 1920,
		height: 1080,
		alt: "Cryogenic flow simulation dashboard during a valve transition.",
		caption: "Deterministic Stage 1 capture.",
	},
	evidenceMedia: [
		{
			kind: "image",
			src: "/media/example-1440.webp",
			responsiveSources: [
				{ src: "/media/example-640.webp", width: 640 },
				{ src: "/media/example-960.webp", width: 960 },
				{ src: "/media/example-1440.webp", width: 1440 },
			],
			width: 1440,
			height: 810,
			alt: "A deterministic geometry evidence frame.",
			caption: "A deterministic geometry evidence frame.",
		},
		{
			kind: "video",
			src: "/media/example.mp4",
			poster: "/media/example-poster-1440.webp",
			responsivePosterSources: [
				{ src: "/media/example-poster-640.webp", width: 640 },
				{ src: "/media/example-poster-960.webp", width: 960 },
				{ src: "/media/example-poster-1440.webp", width: 1440 },
			],
			width: 1536,
			height: 864,
			alt: "A deterministic workflow evidence recording.",
			caption: "A deterministic workflow evidence recording.",
		},
	],
	publicationStatus: "publish",
	redactionStatus: "reviewed",
	redactionReview: {
		guidePath: "docs/CONTENT_REDACTION_GUIDE.md",
		reviewer: "operator",
		checklistStatus: "partial",
		openItems: [],
		notes:
			"Only the inspected public-safe narrative and evidence labels are rendered.",
	},
	seo: {
		title: "Cryogenic Flow Simulation | Joe Poznanski",
		description:
			"A deterministic Rust simulation and verified capture pipeline.",
		canonicalPath: "/work/cryo-flow-sim/",
		ogImage: "/social/default.png",
	},
};

describe("workSchema", () => {
	it("accepts a complete public Work entry", () => {
		const parsed = workSchema.parse(validWork);
		expect(parsed.featuredOrder).toBe(1);
		expect(parsed.media.responsivePosterSources).toEqual(
			validWork.media.responsivePosterSources,
		);
		expect(parsed.evidenceMedia?.map((item) => item.kind)).toEqual([
			"image",
			"video",
		]);
	});

	it.each(["placement", "featuredOrder", "role", "evidence", "media"])(
		"rejects missing %s",
		(field) => {
			const candidate = structuredClone(validWork) as Record<string, unknown>;
			delete candidate[field];
			expect(workSchema.safeParse(candidate).success).toBe(false);
		},
	);

	it("rejects unknown placement values", () => {
		expect(
			workSchema.safeParse({ ...validWork, placement: "featured" }).success,
		).toBe(false);
	});

	it.each([0, -1])("rejects nonpositive featuredOrder %s", (featuredOrder) => {
		expect(workSchema.safeParse({ ...validWork, featuredOrder }).success).toBe(
			false,
		);
	});

	it("rejects duplicate responsive widths", () => {
		const candidate = structuredClone(validWork);
		candidate.media.responsivePosterSources[1].width = 640;
		expect(workSchema.safeParse(candidate).success).toBe(false);
	});

	it("rejects evidence images without responsive sources", () => {
		const candidate = structuredClone(validWork) as {
			evidenceMedia: Record<string, unknown>[];
		};
		delete candidate.evidenceMedia[0].responsiveSources;
		expect(workSchema.safeParse(candidate).success).toBe(false);
	});

	it.each(["src", "poster", "responsivePosterSources"])(
		"rejects evidence videos missing %s",
		(field) => {
			const candidate = structuredClone(validWork) as {
				evidenceMedia: Record<string, unknown>[];
			};
			delete candidate.evidenceMedia[1][field];
			expect(workSchema.safeParse(candidate).success).toBe(false);
		},
	);

	it.each(["label", "summary", "values", "scope", "limits"])(
		"rejects evidence missing %s",
		(field) => {
			const candidate = structuredClone(validWork) as {
				evidence: Record<string, unknown>;
			};
			delete candidate.evidence[field];
			expect(workSchema.safeParse(candidate).success).toBe(false);
		},
	);

	it.each(["kind", "width", "height", "alt", "caption"])(
		"rejects media missing %s",
		(field) => {
			const candidate = structuredClone(validWork) as {
				media: Record<string, unknown>;
			};
			delete candidate.media[field];
			expect(workSchema.safeParse(candidate).success).toBe(false);
		},
	);

	it.each(["title", "description", "canonicalPath", "ogImage"])(
		"rejects SEO metadata missing %s",
		(field) => {
			const candidate = structuredClone(validWork) as {
				seo: Record<string, unknown>;
			};
			delete candidate.seo[field];
			expect(workSchema.safeParse(candidate).success).toBe(false);
		},
	);

	it.each(["src", "poster"])("rejects video media missing %s", (field) => {
		const candidate = structuredClone(validWork) as {
			media: Record<string, unknown>;
		};
		delete candidate.media[field];
		expect(workSchema.safeParse(candidate).success).toBe(false);
	});

	it("rejects image media without a source", () => {
		const candidate = structuredClone(validWork) as {
			media: Record<string, unknown>;
		};
		candidate.media.kind = "image";
		candidate.media.src = undefined;
		expect(workSchema.safeParse(candidate).success).toBe(false);
	});

	it("rejects blocked content marked publish", () => {
		expect(
			workSchema.safeParse({
				...validWork,
				redactionStatus: "blocked",
			}).success,
		).toBe(false);
	});
});
