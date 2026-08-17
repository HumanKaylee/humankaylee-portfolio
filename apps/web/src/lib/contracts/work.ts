import { z } from "astro/zod";

import {
	caseStudyRedactionStatusSchema,
	publicationStatusSchema,
	redactionReviewSchema,
	seoSchema,
	slugSchema,
} from "./content";

const workLoopMediaSchema = z.object({
	src: z.string().min(1),
	poster: z.string().min(1),
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
		featuredOrder: z.number().int().positive().optional(),
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
			width: z.number().int().positive(),
			height: z.number().int().positive(),
			alt: z.string().min(1),
			caption: z.string().min(1),
			loop: workLoopMediaSchema.optional(),
		}),
		demoComponent: z.literal("BlackScholesDemo").optional(),
		publicationStatus: publicationStatusSchema,
		redactionStatus: caseStudyRedactionStatusSchema,
		redactionReview: redactionReviewSchema,
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
