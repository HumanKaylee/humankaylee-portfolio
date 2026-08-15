import {
	type PublicationStatus as ContractPublicationStatus,
	publicationStatuses,
} from "../lib/contracts/content";
import { routeInventory } from "./routes";

type RouteId = (typeof routeInventory)[number]["id"];

export const PUBLICATION_STATUSES = publicationStatuses;

export type PublicationStatus = ContractPublicationStatus;

export type RouteInventoryEntry = Readonly<{
	path: string;
	kind:
		| "home"
		| "work"
		| "work-detail"
		| "about"
		| "notes"
		| "note-detail"
		| "notes-build-log"
		| "resume"
		| "contact"
		| "sitemap"
		| "robots"
		| "error"
		| "now"
		| "uses"
		| "reading";
	contentSources: readonly string[];
	requiredSeoFields: readonly string[];
}>;

const routeKindById = {
	home: "home",
	work: "work",
	"work-detail": "work-detail",
	about: "about",
	resume: "resume",
	contact: "contact",
	notes: "notes",
	"note-detail": "note-detail",
	sitemap: "sitemap",
	robots: "robots",
	"fallback-error": "error",
	now: "now",
	uses: "uses",
	reading: "reading",
} satisfies Readonly<Record<RouteId, RouteInventoryEntry["kind"]>>;

const contentSourcesById = {
	home: [
		"hero positioning",
		"featured work summaries",
		"resume summary",
		"contact CTA",
	],
	work: ["work summaries", "featured evidence", "publication status"],
	"work-detail": ["work metadata", "safe artifacts", "verification notes"],
	about: ["resume summary", "current focus", "uses", "reading"],
	resume: ["resume summary", "downloadable pdf source status"],
	contact: ["contact CTA", "mailto fallback", "privacy note"],
	notes: ["technical notes", "publication status"],
	"note-detail": ["note body", "publication status"],
	sitemap: ["route inventory", "published content slugs"],
	robots: ["route inventory", "crawl policy"],
	"fallback-error": ["fallback navigation", "contact path", "home link"],
	now: ["current focus items", "now entry date", "entry summary"],
	uses: ["hardware list", "software list", "tooling philosophy"],
	reading: ["reading items by kind", "status badges", "takeaways"],
} satisfies Readonly<Record<RouteId, readonly string[]>>;

export const ROUTE_INVENTORY: readonly RouteInventoryEntry[] =
	routeInventory.map((route) => ({
		path: route.path,
		kind: routeKindById[route.id],
		contentSources: contentSourcesById[route.id],
		requiredSeoFields:
			route.id === "sitemap"
				? ["xmlSitemap"]
				: route.id === "robots"
					? ["robotsDirectives"]
					: ["title", "description", "canonicalPath", "ogImage"],
	}));

export type ContentTypeKey =
	| "work"
	| "notesBuildLog"
	| "resume"
	| "siteMetadata"
	| "now"
	| "uses"
	| "reading";

export type ContentValidationExample = Readonly<{
	requiredFields: readonly string[];
	validExample: Readonly<Record<string, unknown>>;
	invalidExamples: readonly Readonly<{
		reason: string;
		entry: Readonly<Record<string, unknown>>;
	}>[];
}>;

const seoExample = {
	title: "Example page",
	description: "A safe public summary.",
	canonicalPath: "/examples/example-page/",
	ogImage: "/social/default.png",
};

export const CONTENT_VALIDATION_EXAMPLES: Readonly<
	Record<ContentTypeKey, ContentValidationExample>
> = {
	work: {
		requiredFields: [
			"title",
			"slug",
			"discipline",
			"year",
			"lede",
			"problem",
			"stakes",
			"role",
			"constraints",
			"architecture",
			"decisions",
			"outcome",
			"lessons",
			"evidence",
			"media",
			"publicationStatus",
			"redactionStatus",
			"redactionReview",
			"seo",
		],
		validExample: {
			title: "Example Work story",
			slug: "example-work-story",
			discipline: "operations",
			year: 2026,
			lede: "A safe Work summary.",
			problem: "A bounded engineering problem.",
			stakes: "The stakes were operational consistency.",
			role: "System design and verification.",
			constraints: ["Private details must stay generalized."],
			architecture: {
				overview: "A simple static-first architecture.",
				diagramAlt: "A text-only system diagram.",
			},
			decisions: [
				{
					title: "Static delivery",
					choice: "Render the complete narrative in HTML.",
					alternatives: ["Require client-side rendering."],
					tradeoff: "The story remains readable without JavaScript.",
				},
			],
			outcome: "The public story is safe to draft.",
			lessons: ["Keep evidence useful without leaking private context."],
			evidence: {
				label: "Public-safe proof",
				summary: "A curated evidence hook without private details.",
				values: [
					{
						label: "Verification",
						value: "Passed",
						detail: "The bounded check passed.",
					},
				],
				scope: "Local and PR evidence only.",
				limits: "Private environment details remain excluded.",
			},
			media: {
				kind: "evidence-flow",
				width: 1600,
				height: 1000,
				alt: "A semantic evidence sequence.",
				caption: "Public-safe verification sequence.",
			},
			publicationStatus: "publish",
			redactionStatus: "reviewed",
			redactionReview: {
				guidePath: "docs/CONTENT_REDACTION_GUIDE.md",
				reviewer: "phase-1-content-review",
				reviewedOn: "2026-05-23",
				checklistStatus: "partial",
				openItems: ["Expand body with approved public evidence."],
				notes: "Draft is safe but not launch-approved.",
			},
			seo: seoExample,
		},
		invalidExamples: [
			{
				reason: "missing the publication status flag",
				entry: {
					title: "Incomplete Work story",
					slug: "incomplete-work-story",
					discipline: "operations",
				},
			},
		],
	},
	notesBuildLog: {
		requiredFields: [
			"title",
			"slug",
			"publishedAt",
			"summary",
			"tags",
			"publicationStatus",
			"seo",
		],
		validExample: {
			title: "Build log placeholder",
			slug: "build-log-placeholder",
			publishedAt: "2026-05-23",
			summary: "A safe build-log summary.",
			tags: ["build-log", "verification"],
			publicationStatus: "publish",
			seo: seoExample,
		},
		invalidExamples: [
			{
				reason: "omits the publication date needed for the feed",
				entry: {
					title: "Date-free note",
					slug: "date-free-note",
					summary: "Missing date.",
					publicationStatus: "publish",
					seo: seoExample,
				},
			},
		],
	},
	resume: {
		requiredFields: [
			"title",
			"slug",
			"sourceStatus",
			"workflowState",
			"pdfStatus",
			"sourceAsset",
			"approvalState",
			"workflowSteps",
			"pdfSourcePath",
			"pdfDownloadPath",
			"seo",
		],
		validExample: {
			title: "Joe Poznanski Resume",
			slug: "resume",
			pdfSourcePath: "approved-local-resume-pdf-imported-2026-05-23",
			pdfDownloadPath: "/downloads/joe-poznanski-resume.pdf",
			sourceStatus: "approved-source",
			workflowState: "complete",
			pdfStatus: "published",
			sourceAsset: "apps/web/public/downloads/joe-poznanski-resume.pdf",
			approvalState: "approved",
			workflowSteps: [
				{
					step: "collect approved source bullets",
					status: "complete",
				},
				{
					step: "redact private employers, paths, and sensitive details",
					status: "complete",
				},
				{
					step: "format the final resume source document",
					status: "complete",
				},
				{
					step: "export the PDF and verify the public link",
					status: "complete",
				},
			],
			seo: {
				title: "Joe Poznanski Resume",
				description:
					"HTML resume entry point with a downloadable PDF for recruiter review.",
				canonicalPath: "/resume/",
				ogImage: "/social/default.png",
			},
		},
		invalidExamples: [
			{
				reason: "claims a final PDF before source approval",
				entry: {
					title: "Joe Poznanski Resume",
					slug: "resume",
					pdfSourcePath: "pending-approved-resume-source",
					pdfDownloadPath: "/downloads/joe-poznanski-resume.pdf",
					sourceStatus: "placeholder",
					workflowState: "complete",
					pdfStatus: "published",
					sourceAsset: "pending-approved-resume-source",
					approvalState: "approved",
					workflowSteps: [
						{
							step: "collect approved source bullets",
							status: "pending",
						},
					],
					seo: seoExample,
				},
			},
		],
	},
	siteMetadata: {
		requiredFields: [
			"siteName",
			"siteDescription",
			"siteUrl",
			"defaultOgImage",
			"seo",
		],
		validExample: {
			siteName: "Joe Poznanski Portfolio",
			siteDescription: "A systems atelier portfolio.",
			siteUrl: "https://joepoznanski.io",
			defaultOgImage: "/social/default.png",
			seo: {
				...seoExample,
				canonicalPath: "/",
			},
		},
		invalidExamples: [
			{
				reason: "site URL must be absolute",
				entry: {
					siteName: "Joe Poznanski Portfolio",
					siteDescription: "A systems atelier portfolio.",
					siteUrl: "joepoznanski.io",
					defaultOgImage: "/social/default.png",
					seo: seoExample,
				},
			},
		],
	},
	now: {
		requiredFields: ["title", "date", "status", "summary", "items"],
		validExample: {
			title: "What I'm focused on, May 2026",
			date: "2026-05-26",
			status: "current",
			summary: "A current-focus snapshot.",
			items: [
				{ label: "Active project", note: "Working on the portfolio launch." },
			],
		},
		invalidExamples: [
			{
				reason: "missing required items array",
				entry: {
					title: "Now entry without items",
					date: "2026-05-26",
					status: "current",
					summary: "A summary.",
				},
			},
		],
	},
	uses: {
		requiredFields: ["title", "lastReviewed", "sections"],
		validExample: {
			title: "Uses",
			lastReviewed: "2026-05-26",
			sections: [
				{
					label: "Hardware",
					items: [{ name: "Example device", why: "It works well." }],
				},
			],
		},
		invalidExamples: [
			{
				reason: "missing required sections array",
				entry: {
					title: "Uses without sections",
					lastReviewed: "2026-05-26",
				},
			},
		],
	},
	reading: {
		requiredFields: ["title", "quarter", "items"],
		validExample: {
			title: "Reading list — Q2 2026",
			quarter: "2026-q2",
			items: [
				{
					title: "Example Book",
					author: "Example Author",
					kind: "book",
					status: "read",
				},
			],
		},
		invalidExamples: [
			{
				reason: "quarter does not match required format",
				entry: {
					title: "Reading list",
					quarter: "Q2-2026",
					items: [
						{
							title: "Example Book",
							author: "Example Author",
							kind: "book",
							status: "read",
						},
					],
				},
			},
		],
	},
} as const;
