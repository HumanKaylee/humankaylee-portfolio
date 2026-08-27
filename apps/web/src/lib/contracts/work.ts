import { z } from "astro/zod";

import {
	approvalEvidenceSchema,
	caseStudyRedactionStatusSchema,
	publicationStatusSchema,
	redactionReviewSchema,
	seoSchema,
	slugSchema,
} from "./content";

const workResponsiveSourceSchema = z.object({
	src: z.string().min(1),
	width: z.number().int().positive(),
});

const workResponsiveSourcesSchema = z
	.array(workResponsiveSourceSchema)
	.min(1)
	.superRefine((sources, context) => {
		const seenWidths = new Set<number>();
		for (const [index, source] of sources.entries()) {
			if (seenWidths.has(source.width)) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: [index, "width"],
					message: "responsive source widths must be unique",
				});
			}
			seenWidths.add(source.width);
		}
	});

const workEvidenceImageSchema = z.object({
	kind: z.literal("image"),
	src: z.string().min(1),
	responsiveSources: workResponsiveSourcesSchema,
	width: z.number().int().positive(),
	height: z.number().int().positive(),
	alt: z.string().min(1),
	caption: z.string().min(1),
});

const workEvidenceVideoSchema = z.object({
	kind: z.literal("video"),
	src: z.string().min(1),
	poster: z.string().min(1),
	responsivePosterSources: workResponsiveSourcesSchema,
	width: z.number().int().positive(),
	height: z.number().int().positive(),
	alt: z.string().min(1),
	caption: z.string().min(1),
});

const workLoopMediaSchema = z.object({
	src: z.string().min(1),
	poster: z.string().min(1),
	responsivePosterSources: workResponsiveSourcesSchema.optional(),
	width: z.number().int().positive(),
	height: z.number().int().positive(),
	durationSeconds: z.number().min(6).max(12),
	sizeBytes: z.number().int().positive().max(2_097_152),
	alt: z.string().min(1),
	description: z.string().min(1),
});

export const workSchema = z
	.object({
		title: z.string().min(1),
		slug: slugSchema,
		discipline: z.enum(["simulation", "operations", "reliability", "tools"]),
		year: z.number().int().min(2000).max(2100),
		placement: z.enum(["flagship", "supporting", "archive"]),
		featuredOrder: z.number().int().positive(),
		lede: z.string().min(1),
		problem: z.string().min(1),
		stakes: z.string().min(1),
		role: z.string().min(1),
		constraints: z.array(z.string().min(1)).min(1),
		architecture: z.object({
			overview: z.string().min(1),
			diagramAlt: z.string().min(1),
		}),
		decisions: z
			.array(
				z.object({
					title: z.string().min(1),
					choice: z.string().min(1),
					alternatives: z.array(z.string().min(1)).min(1),
					tradeoff: z.string().min(1),
				}),
			)
			.min(1)
			.max(3),
		outcome: z.string().min(1),
		lessons: z.array(z.string().min(1)).min(1),
		evidence: z.object({
			label: z.string().min(1),
			summary: z.string().min(1),
			values: z
				.array(
					z.object({
						label: z.string().min(1),
						value: z.string().min(1),
						detail: z.string().min(1),
					}),
				)
				.min(1),
			scope: z.string().min(1),
			limits: z.string().min(1),
		}),
		media: z.object({
			kind: z.enum(["image", "video", "evidence-flow"]),
			src: z.string().min(1).optional(),
			poster: z.string().min(1).optional(),
			responsivePosterSources: workResponsiveSourcesSchema.optional(),
			width: z.number().int().positive(),
			height: z.number().int().positive(),
			alt: z.string().min(1),
			caption: z.string().min(1),
			loop: workLoopMediaSchema.optional(),
		}),
		evidenceMedia: z
			.array(
				z.discriminatedUnion("kind", [
					workEvidenceImageSchema,
					workEvidenceVideoSchema,
				]),
			)
			.optional(),
		demoComponent: z.literal("BlackScholesDemo").optional(),
		publicationStatus: publicationStatusSchema,
		redactionStatus: caseStudyRedactionStatusSchema,
		redactionReview: redactionReviewSchema,
		approvalEvidence: approvalEvidenceSchema.optional(),
		seo: seoSchema,
	})
	.superRefine((entry, context) => {
		if (
			entry.publicationStatus === "publish" &&
			entry.redactionStatus === "blocked"
		) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["redactionStatus"],
				message: "blocked work cannot be published",
			});
		}

		if (entry.redactionStatus === "approved") {
			if (entry.redactionReview.checklistStatus !== "complete") {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["redactionReview", "checklistStatus"],
					message: "approved work requires a completed redaction checklist",
				});
			}
			if (!entry.redactionReview.reviewedOn) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["redactionReview", "reviewedOn"],
					message: "approved work requires a review date",
				});
			}
			if (!entry.redactionReview.checklist) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["redactionReview", "checklist"],
					message: "approved work requires checklist answers",
				});
			}
			if (entry.redactionReview.checklist?.claimsHaveSafeEvidence !== "yes") {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["redactionReview", "checklist", "claimsHaveSafeEvidence"],
					message: "approved work requires safe supporting evidence",
				});
			}
			if (entry.redactionReview.openItems.length > 0) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["redactionReview", "openItems"],
					message: "approved work cannot have open redaction items",
				});
			}
			if (!entry.approvalEvidence) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["approvalEvidence"],
					message: "approved work requires structured approval evidence",
				});
			}
		}

		if (
			entry.media.kind === "video" &&
			(!entry.media.src || !entry.media.poster)
		) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["media"],
				message: "video work requires source and poster assets",
			});
		}

		if (entry.media.kind === "image" && !entry.media.src) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["media", "src"],
				message: "image work requires a source asset",
			});
		}
	});

export type WorkEntryData = z.infer<typeof workSchema>;
export type WorkMedia = WorkEntryData["media"];
export type WorkLoopMedia = z.infer<typeof workLoopMediaSchema>;
export type WorkResponsiveSource = z.infer<typeof workResponsiveSourceSchema>;
export type WorkEvidenceMedia = z.infer<
	typeof workEvidenceImageSchema | typeof workEvidenceVideoSchema
>;
