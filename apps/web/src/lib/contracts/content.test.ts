import { describe, expect, it } from "vitest";

import {
	caseStudyRedactionStatusSchema,
	caseStudySchema,
	notesEntrySchema,
	portfolioCategorySchema,
	projectMetadataSchema,
	publicationStatusSchema,
	resumeDataSchema,
	seoSchema,
	siteMetadataSchema,
	slugSchema,
} from "./content";

const seo = {
	title: "HumanKaylee | CLI fleet synchronization",
	description: "A concise summary of the work and why it matters.",
	canonicalPath: "/case-studies/cli-fleet-synchronization",
	ogImage: "/og/case-studies/cli-fleet-synchronization.png",
};

const partialRedactionReview = {
	guidePath: "docs/CONTENT_REDACTION_GUIDE.md",
	reviewer: "phase-1-content-review",
	reviewedOn: "2026-05-23",
	checklistStatus: "partial",
	openItems: [
		"Expand placeholder body with approved public evidence before launch.",
	],
	notes: "Phase 1 outline is safe as a draft but is not launch-approved.",
};

const completeRedactionReview = {
	...partialRedactionReview,
	checklistStatus: "complete",
	openItems: [],
	notes: "Checklist completed against the redaction guide.",
	checklist: {
		secretsRemoved: "yes",
		hostnamesAndAccessPathsGeneralized: "yes",
		userAndAccountNamesGeneralized: "yes",
		screenshotsInspected: "not-applicable",
		logsSummarizedOrSanitized: "yes",
		publicLinksVerified: "not-applicable",
		claimsHaveSafeEvidence: "yes",
		securitySensitiveProceduresRemoved: "yes",
	},
};

const publishableCaseStudy = {
	title: "CLI Fleet Synchronization and MCP Rollout",
	slug: "cli-fleet-synchronization-and-mcp-rollout",
	category: "operations",
	summary: "A safe, recruiter-facing summary of the rollout.",
	audienceFit: ["recruiter", "senior-engineer"],
	problem: "Fleet state had drifted across multiple workstations.",
	stakes: "Operational consistency was at risk.",
	constraints: ["Sensitive accounts could not be disclosed."],
	architecture: {
		overview: "Inventory, rollout, and verification loop.",
		diagramAlt: "A simple text description of the rollout loop.",
	},
	implementation: [
		"Standardized discovery commands.",
		"Recorded rollout evidence.",
	],
	verification: ["Validated target-by-target status."],
	operations: ["Kept auth state local to each account."],
	outcome: "The fleet was aligned.",
	lessons: ["Inventory first, then rollout, then verification."],
	links: {
		demo: "/demos/cli-fleet-rollout",
	},
	publicationStatus: "publish",
	redactionStatus: "reviewed",
	redactionReview: partialRedactionReview,
	seo,
};

describe("content contracts", () => {
	it("accepts the exact project categories from the PRD", () => {
		expect(portfolioCategorySchema.parse("AI")).toBe("AI");
		expect(portfolioCategorySchema.parse("automation")).toBe("automation");
		expect(portfolioCategorySchema.parse("infrastructure")).toBe(
			"infrastructure",
		);
		expect(portfolioCategorySchema.parse("backend")).toBe("backend");
		expect(portfolioCategorySchema.parse("creative web")).toBe("creative web");
		expect(portfolioCategorySchema.parse("operations")).toBe("operations");
		expect(portfolioCategorySchema.safeParse("Design").success).toBe(false);
	});

	it("accepts the exact publication statuses from the plan", () => {
		expect(publicationStatusSchema.parse("publish")).toBe("publish");
		expect(publicationStatusSchema.parse("needs-redaction")).toBe(
			"needs-redaction",
		);
		expect(publicationStatusSchema.parse("defer")).toBe("defer");
		expect(publicationStatusSchema.safeParse("draft").success).toBe(false);
	});

	it("accepts the exact case-study redaction statuses from the plan", () => {
		expect(caseStudyRedactionStatusSchema.parse("draft")).toBe("draft");
		expect(caseStudyRedactionStatusSchema.parse("reviewed")).toBe("reviewed");
		expect(caseStudyRedactionStatusSchema.parse("approved")).toBe("approved");
		expect(caseStudyRedactionStatusSchema.parse("blocked")).toBe("blocked");
		expect(caseStudyRedactionStatusSchema.safeParse("publish").success).toBe(
			false,
		);
	});

	it("requires route-safe slugs", () => {
		expect(slugSchema.parse("cli-fleet-synchronization")).toBe(
			"cli-fleet-synchronization",
		);
		expect(slugSchema.safeParse("CLI Fleet").success).toBe(false);
		expect(slugSchema.safeParse("../cli-fleet").success).toBe(false);
		expect(slugSchema.safeParse("cli_fleet").success).toBe(false);
	});

	it("requires SEO metadata with a rooted canonical path", () => {
		expect(seoSchema.parse(seo).canonicalPath).toBe(
			"/case-studies/cli-fleet-synchronization",
		);
		expect(seoSchema.safeParse({ title: "Missing description" }).success).toBe(
			false,
		);
		expect(
			seoSchema.safeParse({
				title: "Bad path",
				description: "This should fail.",
				canonicalPath: "case-studies/bad-path",
				ogImage: "/og/bad-path.png",
			}).success,
		).toBe(false);
	});

	it("accepts a publishable case study entry before launch approval", () => {
		expect(caseStudySchema.safeParse(publishableCaseStudy).success).toBe(true);
	});

	it("requires a completed redaction checklist before approval", () => {
		expect(
			caseStudySchema.safeParse({
				...publishableCaseStudy,
				redactionStatus: "approved",
			}).success,
		).toBe(false);

		expect(
			caseStudySchema.safeParse({
				...publishableCaseStudy,
				redactionStatus: "approved",
				redactionReview: completeRedactionReview,
			}).success,
		).toBe(true);
	});

	it("rejects invalid project metadata and notes metadata", () => {
		expect(
			projectMetadataSchema.safeParse({
				name: "Portfolio Build",
				slug: "portfolio-build",
				category: "design",
				bestFor: ["recruiter"],
				proof: "A summary of the proof available for this project.",
				links: {
					docs: "/docs/portfolio-build",
				},
				publicationStatus: "publish",
				summary: "A build that should be categorized by the shared enum.",
				seo: {
					title: "Portfolio Build",
					description: "Summary of the build.",
					canonicalPath: "/projects/portfolio-build",
					ogImage: "/og/projects/portfolio-build.png",
				},
			}).success,
		).toBe(false);

		expect(
			projectMetadataSchema.safeParse({
				name: "Bad Slug",
				slug: "Bad Slug",
				category: "creative web",
				bestFor: ["recruiter"],
				proof: "A summary of proof.",
				publicationStatus: "publish",
				summary: "A project with an invalid slug.",
				seo,
			}).success,
		).toBe(false);

		expect(
			notesEntrySchema.safeParse({
				title: "How this site was built",
				slug: "how-this-site-was-built",
				publishedAt: "2026-05-23",
				publicationStatus: "publish",
				summary: "A launch note that should require SEO metadata.",
				seo: {
					title: "How this site was built",
					description: "Notes about the build.",
					canonicalPath: "/notes/how-this-site-was-built",
					ogImage: "/og/notes/how-this-site-was-built.png",
				},
			}).success,
		).toBe(true);
	});

	it("requires resume workflow state in the schema-backed resume entry", () => {
		expect(
			resumeDataSchema.safeParse({
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
				seo: {
					title: "HumanKaylee Resume",
					description: "Downloadable resume and HTML summary.",
					canonicalPath: "/resume",
					ogImage: "/og/resume.png",
				},
			}).success,
		).toBe(true);

		expect(
			resumeDataSchema.safeParse({
				title: "HumanKaylee Resume",
				slug: "resume",
				pdfSourcePath: "pending-approved-resume-source",
				pdfDownloadPath: "/downloads/humankaylee-resume.pdf",
				seo,
			}).success,
		).toBe(false);

		expect(
			resumeDataSchema.safeParse({
				title: "HumanKaylee Resume",
				slug: "resume",
				pdfSourcePath: "pending-approved-resume-source",
				pdfDownloadPath: "/downloads/humankaylee-resume.pdf",
				sourceStatus: "placeholder",
				workflowState: "complete",
				pdfStatus: "published",
				sourceAsset: "pending-approved-resume-source",
				approvalState: "approved",
				workflowSteps: [],
				seo,
			}).success,
		).toBe(false);
	});

	it("accepts site metadata and rejects invalid site metadata", () => {
		expect(
			siteMetadataSchema.safeParse({
				siteName: "HumanKaylee Portfolio",
				siteDescription: "A systems atelier portfolio.",
				siteUrl: "https://humankaylee.example",
				defaultOgImage: "/og/site-default.png",
				twitterHandle: "@humankaylee",
				seo: {
					title: "HumanKaylee Portfolio",
					description: "A systems atelier portfolio.",
					canonicalPath: "/",
					ogImage: "/og/site-default.png",
				},
			}).success,
		).toBe(true);

		expect(
			siteMetadataSchema.safeParse({
				siteName: "HumanKaylee Portfolio",
				siteDescription: "A systems atelier portfolio.",
				siteUrl: "humankaylee.example",
				defaultOgImage: "/og/site-default.png",
				seo,
			}).success,
		).toBe(false);
	});
});
