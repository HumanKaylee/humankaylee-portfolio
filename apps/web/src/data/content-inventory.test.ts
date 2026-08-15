import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
	caseStudySchema,
	notesEntrySchema,
	projectMetadataSchema,
	resumeDataSchema,
	siteMetadataSchema,
} from "../lib/contracts/content";
import {
	CONTENT_VALIDATION_EXAMPLES,
	PROJECT_CATEGORIES,
	PUBLICATION_STATUSES,
	ROUTE_INVENTORY,
} from "./content-inventory";

describe("phase 1 content inventory", () => {
	it("pins the project taxonomy to the PRD categories", () => {
		expect(PROJECT_CATEGORIES).toEqual([
			"AI",
			"automation",
			"infrastructure",
			"backend",
			"creative web",
			"operations",
		]);
	});

	it("keeps the publication statuses limited to the launch workflow", () => {
		expect(PUBLICATION_STATUSES).toEqual([
			"publish",
			"needs-redaction",
			"defer",
		]);
	});

	it("lists canonical and secondary content routes without duplicate public story routes", () => {
		expect(ROUTE_INVENTORY.map((entry) => entry.path)).toEqual([
			"/",
			"/work/",
			"/work/[slug]/",
			"/about/",
			"/resume/",
			"/contact/",
			"/notes/",
			"/notes/[slug]/",
			"/sitemap-index.xml",
			"/robots.txt",
			"/404",
			"/now/",
			"/uses/",
			"/reading/",
		]);
		expect(ROUTE_INVENTORY.map((entry) => entry.kind)).not.toEqual(
			expect.arrayContaining([
				"projects",
				"project-detail",
				"case-studies",
				"case-study-detail",
			]),
		);
	});

	it("parses valid examples and rejects invalid examples with the real schemas", () => {
		const examples = CONTENT_VALIDATION_EXAMPLES;

		expect(
			caseStudySchema.safeParse(examples.caseStudies.validExample).success,
		).toBe(true);
		expect(
			notesEntrySchema.safeParse(examples.notesBuildLog.validExample).success,
		).toBe(true);
		expect(
			projectMetadataSchema.safeParse(examples.projectCatalog.validExample)
				.success,
		).toBe(true);
		expect(
			resumeDataSchema.safeParse(examples.resume.validExample).success,
		).toBe(true);
		expect(
			siteMetadataSchema.safeParse(examples.siteMetadata.validExample).success,
		).toBe(true);

		for (const invalid of examples.caseStudies.invalidExamples) {
			expect(caseStudySchema.safeParse(invalid.entry).success).toBe(false);
		}
		for (const invalid of examples.notesBuildLog.invalidExamples) {
			expect(notesEntrySchema.safeParse(invalid.entry).success).toBe(false);
		}
		for (const invalid of examples.projectCatalog.invalidExamples) {
			expect(projectMetadataSchema.safeParse(invalid.entry).success).toBe(
				false,
			);
		}
		for (const invalid of examples.resume.invalidExamples) {
			expect(resumeDataSchema.safeParse(invalid.entry).success).toBe(false);
		}
		for (const invalid of examples.siteMetadata.invalidExamples) {
			expect(siteMetadataSchema.safeParse(invalid.entry).success).toBe(false);
		}
	});

	it("keeps case-study required-field inventory aligned with the real schema", () => {
		expect(CONTENT_VALIDATION_EXAMPLES.caseStudies.requiredFields).toEqual(
			expect.arrayContaining([
				"audienceFit",
				"redactionReview",
				"publicationStatus",
				"redactionStatus",
			]),
		);
		expect(
			CONTENT_VALIDATION_EXAMPLES.caseStudies.requiredFields,
		).not.toContain("publication_status");
		expect(
			CONTENT_VALIDATION_EXAMPLES.caseStudies.requiredFields,
		).not.toContain("redaction_status");
	});

	it("keeps the resume validation example aligned with the approved PDF source", () => {
		const approvedResumeRecord = JSON.parse(
			readFileSync(
				new URL("../content/resume/resume.json", import.meta.url),
				"utf8",
			),
		);
		expect(CONTENT_VALIDATION_EXAMPLES.resume.validExample).toEqual(
			approvedResumeRecord,
		);
		const parsedResumeExample = resumeDataSchema.parse(
			CONTENT_VALIDATION_EXAMPLES.resume.validExample,
		);
		expect(
			parsedResumeExample.workflowSteps.every(
				(workflowStep) => workflowStep.status === "complete",
			),
		).toBe(true);
	});

	it("keeps resume inventory guard wording local-source scoped", () => {
		const forbiddenResumeOverclaim =
			/\bpublished resume\b|\bpublished PDF\b|\bpublic resume\b|\bpublic PDF\b|\blive resume\b|\bproduction resume\b|\bproduction-ready resume\b/i;
		const resumeInventory = CONTENT_VALIDATION_EXAMPLES.resume;
		const invalidReasons = resumeInventory.invalidExamples
			.map((invalidExample) => invalidExample.reason)
			.join("\n");

		expect(invalidReasons).not.toMatch(forbiddenResumeOverclaim);

		for (const invalidExample of resumeInventory.invalidExamples) {
			const parsed = resumeDataSchema.safeParse(invalidExample.entry);
			expect(parsed.success).toBe(false);
			if (!parsed.success) {
				expect(
					parsed.error.issues.map((issue) => issue.message).join("\n"),
				).not.toMatch(forbiddenResumeOverclaim);
			}
		}
	});
});
