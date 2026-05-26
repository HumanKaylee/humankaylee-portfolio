import { z } from "astro/zod";

export const portfolioCategories = [
	"AI",
	"automation",
	"infrastructure",
	"backend",
	"creative web",
	"operations",
] as const;

export const portfolioCategorySchema = z.enum(portfolioCategories);

export const publicationStatuses = [
	"publish",
	"needs-redaction",
	"defer",
] as const;

export const publicationStatusSchema = z.enum(publicationStatuses);

export const caseStudyRedactionStatuses = [
	"draft",
	"reviewed",
	"approved",
	"blocked",
] as const;

export const caseStudyRedactionStatusSchema = z.enum(
	caseStudyRedactionStatuses,
);

export const audienceFits = [
	"recruiter",
	"senior-engineer",
	"collaborator",
	"client",
] as const;

export const audienceFitSchema = z.enum(audienceFits);

export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
	message: "slug must be lowercase kebab-case without path separators",
});

export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const canonicalPathSchema = z
	.string()
	.min(1)
	.refine((value) => value.startsWith("/") && !value.startsWith("//"), {
		message: "canonicalPath must start with a single leading slash",
	});

export const seoSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	canonicalPath: canonicalPathSchema,
	ogImage: z.string().min(1),
	twitterCard: z
		.enum(["summary", "summary_large_image"])
		.default("summary_large_image"),
});

export const linkTargetsSchema = z.object({
	repo: z.string().min(1).optional(),
	demo: z.string().min(1).optional(),
	docs: z.string().min(1).optional(),
	screenshots: z.array(z.string().min(1)).min(1).optional(),
	artifacts: z.array(z.string().min(1)).min(1).optional(),
});

export const featuredEvidenceSchema = z.object({
	label: z.string().min(1),
	summary: z.string().min(1),
	scope: z.string().min(1),
});

export const redactionChecklistAnswerSchema = z.enum(["yes", "not-applicable"]);

export const redactionChecklistSchema = z.object({
	secretsRemoved: z.literal("yes"),
	hostnamesAndAccessPathsGeneralized: z.literal("yes"),
	userAndAccountNamesGeneralized: z.literal("yes"),
	screenshotsInspected: redactionChecklistAnswerSchema,
	logsSummarizedOrSanitized: redactionChecklistAnswerSchema,
	publicLinksVerified: redactionChecklistAnswerSchema,
	claimsHaveSafeEvidence: redactionChecklistAnswerSchema,
	securitySensitiveProceduresRemoved: z.literal("yes"),
});

export const redactionReviewSchema = z.object({
	guidePath: z.literal("docs/CONTENT_REDACTION_GUIDE.md"),
	reviewer: z.string().min(1),
	reviewedOn: dateStringSchema.optional(),
	checklistStatus: z.enum(["not-started", "partial", "complete"]),
	openItems: z.array(z.string().min(1)),
	notes: z.string().min(1),
	checklist: redactionChecklistSchema.optional(),
});

export const approvalEvidenceResultSchema = z.enum(["passed"]);

export const approvalEvidenceSchema = z.object({
	humanSignoff: z.object({
		reviewer: z.string().min(1),
		signedOffOn: dateStringSchema,
		decision: z.literal("approved"),
		notes: z.string().min(1),
	}),
	artifactInspection: z.object({
		source: z.string().min(1),
		inspectedOn: dateStringSchema,
		result: approvalEvidenceResultSchema,
		notes: z.string().min(1),
	}),
	productionOrPreviewEvidence: z.object({
		source: z.string().min(1),
		capturedOn: dateStringSchema,
		result: approvalEvidenceResultSchema,
		notes: z.string().min(1),
	}),
});

export const issueTraceSchema = z.object({
	backlogId: z.string().regex(/^B-\d{3}$/),
	githubIssue: z.number().int().positive(),
	parentIssue: z.number().int().positive(),
	closureRule: z.string().min(1),
});

export const caseStudySchema = z
	.object({
		title: z.string().min(1),
		slug: slugSchema,
		category: portfolioCategorySchema,
		summary: z.string().min(1),
		audienceFit: z.array(audienceFitSchema).min(1),
		problem: z.string().min(1),
		stakes: z.string().min(1),
		constraints: z.array(z.string().min(1)).min(1),
		architecture: z.object({
			overview: z.string().min(1),
			diagramAlt: z.string().min(1),
		}),
		implementation: z.array(z.string().min(1)).min(1),
		verification: z.array(z.string().min(1)).min(1),
		operations: z.array(z.string().min(1)).min(1),
		outcome: z.string().min(1),
		lessons: z.array(z.string().min(1)).min(1),
		featuredEvidence: featuredEvidenceSchema,
		links: linkTargetsSchema.optional(),
		publicationStatus: publicationStatusSchema,
		redactionStatus: caseStudyRedactionStatusSchema,
		issueTrace: issueTraceSchema.optional(),
		redactionReview: redactionReviewSchema,
		approvalEvidence: approvalEvidenceSchema.optional(),
		seo: seoSchema,
	})
	.superRefine((entry, context) => {
		if (entry.redactionStatus !== "approved") {
			return;
		}

		if (entry.redactionReview.checklistStatus !== "complete") {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"approved case studies require a completed redaction checklist",
				path: ["redactionReview", "checklistStatus"],
			});
		}

		if (!entry.redactionReview.reviewedOn) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: "approved case studies require a review date",
				path: ["redactionReview", "reviewedOn"],
			});
		}

		if (!entry.redactionReview.checklist) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: "approved case studies require checklist answers",
				path: ["redactionReview", "checklist"],
			});
		}

		if (entry.redactionReview.checklist?.claimsHaveSafeEvidence !== "yes") {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"approved case studies require safe supporting evidence for claims",
				path: ["redactionReview", "checklist", "claimsHaveSafeEvidence"],
			});
		}

		if (entry.redactionReview.openItems.length > 0) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: "approved case studies cannot have open redaction items",
				path: ["redactionReview", "openItems"],
			});
		}

		if (!entry.approvalEvidence) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: "approved case studies require structured approval evidence",
				path: ["approvalEvidence"],
			});
		}
	});

export const projectMetadataSchema = z.object({
	name: z.string().min(1),
	slug: slugSchema,
	category: portfolioCategorySchema,
	summary: z.string().min(1),
	bestFor: z.array(audienceFitSchema).min(1),
	proof: z.string().min(1),
	links: linkTargetsSchema.optional(),
	publicationStatus: publicationStatusSchema,
	seo: seoSchema,
});

export const knownDemoComponents = ["BlackScholesDemo"] as const;

export const notesEntrySchema = z.object({
	title: z.string().min(1),
	slug: slugSchema,
	summary: z.string().min(1),
	tags: z.array(z.string().min(1)).min(1).max(6),
	publishedAt: dateStringSchema,
	publicationStatus: publicationStatusSchema,
	/** Optional demo component to inject below the note body. */
	demoComponent: z.enum(knownDemoComponents).optional(),
	seo: seoSchema,
});

export const resumeDataSchema = z
	.object({
		title: z.string().min(1),
		slug: z.literal("resume"),
		pdfSourcePath: z.string().min(1),
		pdfDownloadPath: z.string().min(1),
		sourceStatus: z.enum(["placeholder", "approved-source"]),
		workflowState: z.enum([
			"awaiting-redaction-review",
			"ready-to-export",
			"complete",
		]),
		pdfStatus: z.enum(["not-generated", "generated", "published"]),
		sourceAsset: z.string().min(1),
		approvalState: z.enum(["pending", "approved", "blocked"]),
		workflowSteps: z
			.array(
				z.object({
					step: z.string().min(1),
					status: z.enum(["pending", "complete", "blocked"]),
				}),
			)
			.min(1),
		seo: seoSchema,
	})
	.superRefine((entry, context) => {
		if (
			entry.approvalState !== "approved" &&
			entry.workflowState !== "complete" &&
			entry.pdfStatus !== "published"
		) {
			return;
		}

		if (entry.sourceStatus === "placeholder") {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: "final PDF state requires an approved source",
				path: ["sourceStatus"],
			});
		}

		if (entry.workflowSteps.some((step) => step.status !== "complete")) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: "final PDF state requires completed workflow steps",
				path: ["workflowSteps"],
			});
		}
	});

export const siteMetadataSchema = z.object({
	siteName: z.string().min(1),
	siteDescription: z.string().min(1),
	siteUrl: z.string().url(),
	defaultOgImage: z.string().min(1),
	twitterHandle: z.string().min(1).optional(),
	seo: seoSchema,
});

export type PortfolioCategory = z.infer<typeof portfolioCategorySchema>;
export type PublicationStatus = z.infer<typeof publicationStatusSchema>;
export type CaseStudyRedactionStatus = z.infer<
	typeof caseStudyRedactionStatusSchema
>;
export type AudienceFit = z.infer<typeof audienceFitSchema>;
export type SeoFields = z.infer<typeof seoSchema>;
export type RedactionReview = z.infer<typeof redactionReviewSchema>;
export type IssueTrace = z.infer<typeof issueTraceSchema>;
export type CaseStudyEntry = z.infer<typeof caseStudySchema>;
export type ProjectMetadataEntry = z.infer<typeof projectMetadataSchema>;
export type KnownDemoComponent = (typeof knownDemoComponents)[number];
export type NotesEntry = z.infer<typeof notesEntrySchema>;
export type ResumeDataEntry = z.infer<typeof resumeDataSchema>;
export type SiteMetadataEntry = z.infer<typeof siteMetadataSchema>;
