import {
	type PublicationStatus as ContractPublicationStatus,
	type PortfolioCategory,
	portfolioCategories,
	publicationStatuses,
} from "../lib/contracts/content";
import { routeInventory } from "./routes";

type RouteId = (typeof routeInventory)[number]["id"];

export const PROJECT_CATEGORIES = portfolioCategories;

export type ProjectCategory = PortfolioCategory;

export const PUBLICATION_STATUSES = publicationStatuses;

export type PublicationStatus = ContractPublicationStatus;

export type RouteInventoryEntry = Readonly<{
	path: string;
	kind:
		| "home"
		| "projects"
		| "project-detail"
		| "case-studies"
		| "case-study-detail"
		| "notes-build-log"
		| "resume"
		| "contact"
		| "sitemap"
		| "robots"
		| "error";
	contentSources: readonly string[];
	requiredSeoFields: readonly string[];
}>;

const routeKindById = {
	home: "home",
	projects: "projects",
	"project-detail": "project-detail",
	"case-studies": "case-studies",
	"case-study-detail": "case-study-detail",
	"notes-build-log": "notes-build-log",
	resume: "resume",
	contact: "contact",
	sitemap: "sitemap",
	robots: "robots",
	"fallback-error": "error",
} satisfies Readonly<Record<RouteId, RouteInventoryEntry["kind"]>>;

const contentSourcesById = {
	home: [
		"hero positioning",
		"featured case-study summaries",
		"project category highlights",
		"resume summary",
		"contact CTA",
	],
	projects: [
		"project taxonomy",
		"project cards",
		"status labels",
		"proof links",
	],
	"project-detail": [
		"project metadata",
		"featured case-study crosslinks",
		"artifact notes",
		"publication status",
	],
	"case-studies": [
		"case-study outline summaries",
		"redaction status labels",
		"safe artifacts",
	],
	"case-study-detail": [
		"case-study outline",
		"redaction review source",
		"safe artifacts",
		"verification notes",
	],
	"notes-build-log": [
		"build-log entries",
		"site update notes",
		"verification summaries",
	],
	resume: [
		"resume summary",
		"workflow placeholder",
		"downloadable pdf source status",
	],
	contact: ["contact CTA", "mailto fallback", "privacy note"],
	sitemap: ["route inventory", "published content slugs"],
	robots: ["route inventory", "crawl policy"],
	"fallback-error": ["fallback navigation", "contact path", "home link"],
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
	| "caseStudies"
	| "notesBuildLog"
	| "projectCatalog"
	| "resume"
	| "siteMetadata";

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
	ogImage: "/social/examples/example-page.png",
};

export const CONTENT_VALIDATION_EXAMPLES: Readonly<
	Record<ContentTypeKey, ContentValidationExample>
> = {
	caseStudies: {
		requiredFields: [
			"title",
			"slug",
			"category",
			"audienceFit",
			"publicationStatus",
			"redactionStatus",
			"redactionReview",
			"summary",
			"problem",
			"stakes",
			"constraints",
			"architecture",
			"implementation",
			"verification",
			"operations",
			"outcome",
			"lessons",
			"featuredEvidence",
			"seo",
		],
		validExample: {
			title: "Example case study",
			slug: "example-case-study",
			category: "backend",
			summary: "A safe case-study summary.",
			audienceFit: ["senior-engineer"],
			problem: "A bounded engineering problem.",
			stakes: "The stakes were operational consistency.",
			constraints: ["Private details must stay generalized."],
			architecture: {
				overview: "A simple static-first architecture.",
				diagramAlt: "A text-only system diagram.",
			},
			implementation: ["Implemented the bounded change."],
			verification: ["Verified with automated checks."],
			operations: ["Recorded safe operational notes."],
			outcome: "The public story is safe to draft.",
			lessons: ["Keep evidence useful without leaking private context."],
			featuredEvidence: {
				label: "Public-safe proof",
				summary:
					"A curated evidence hook that stays useful without private details.",
				scope: "Local and PR evidence only.",
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
					title: "Incomplete case study",
					slug: "incomplete-case-study",
					category: "operations",
				},
			},
			{
				reason: "claims approval without a completed checklist",
				entry: {
					title: "Wrong approval",
					slug: "wrong-approval",
					category: "operations",
					summary: "A summary.",
					audienceFit: ["senior-engineer"],
					problem: "Problem.",
					stakes: "Stakes.",
					constraints: ["Constraint."],
					architecture: { overview: "Overview.", diagramAlt: "Diagram." },
					implementation: ["Implementation."],
					verification: ["Verification."],
					operations: ["Operations."],
					outcome: "Outcome.",
					lessons: ["Lesson."],
					publicationStatus: "publish",
					redactionStatus: "approved",
					redactionReview: {
						guidePath: "docs/CONTENT_REDACTION_GUIDE.md",
						reviewer: "phase-1-content-review",
						reviewedOn: "2026-05-23",
						checklistStatus: "partial",
						openItems: ["Checklist incomplete."],
						notes: "Approval should fail.",
					},
					seo: seoExample,
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
	projectCatalog: {
		requiredFields: [
			"name",
			"slug",
			"category",
			"summary",
			"bestFor",
			"proof",
			"publicationStatus",
			"seo",
		],
		validExample: {
			name: "Project atlas example",
			slug: "project-atlas-example",
			category: "creative web",
			summary: "A project summary.",
			bestFor: ["recruiter"],
			proof: "A safe proof statement.",
			publicationStatus: "publish",
			seo: seoExample,
		},
		invalidExamples: [
			{
				reason: "uses an unsupported category label",
				entry: {
					name: "Atlas with unknown category",
					slug: "atlas-with-unknown-category",
					category: "machine-learning",
					summary: "A project summary.",
					bestFor: ["recruiter"],
					proof: "A safe proof statement.",
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
			title: "HumanKaylee Resume",
			slug: "resume",
			pdfSourcePath: "pending-approved-resume-source",
			pdfDownloadPath: "/downloads/humankaylee-resume.pdf",
			sourceStatus: "placeholder",
			workflowState: "awaiting-redaction-review",
			pdfStatus: "not-generated",
			sourceAsset: "pending-approved-resume-source",
			approvalState: "pending",
			workflowSteps: [
				{
					step: "collect approved source bullets",
					status: "pending",
				},
			],
			seo: seoExample,
		},
		invalidExamples: [
			{
				reason: "claims a final published PDF before source approval",
				entry: {
					title: "HumanKaylee Resume",
					slug: "resume",
					pdfSourcePath: "pending-approved-resume-source",
					pdfDownloadPath: "/downloads/humankaylee-resume.pdf",
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
			siteName: "HumanKaylee Portfolio",
			siteDescription: "A systems atelier portfolio.",
			siteUrl: "https://humankaylee.example",
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
					siteName: "HumanKaylee Portfolio",
					siteDescription: "A systems atelier portfolio.",
					siteUrl: "humankaylee.example",
					defaultOgImage: "/social/default.png",
					seo: seoExample,
				},
			},
		],
	},
} as const;
