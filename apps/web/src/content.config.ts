import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

import {
	caseStudySchema,
	notesEntrySchema,
	projectMetadataSchema,
	resumeDataSchema,
	siteMetadataSchema,
} from "./lib/contracts/content";

const caseStudies = defineCollection({
	loader: glob({
		base: "./apps/web/src/content/case-studies",
		pattern: "**/*.md",
	}),
	schema: caseStudySchema,
});

const notes = defineCollection({
	loader: glob({
		base: "./apps/web/src/content/notes",
		pattern: "**/*.md",
	}),
	schema: notesEntrySchema,
});

const projects = defineCollection({
	loader: glob({
		base: "./apps/web/src/content/projects",
		pattern: "**/*.json",
	}),
	schema: projectMetadataSchema,
});

const resume = defineCollection({
	loader: glob({
		base: "./apps/web/src/content/resume",
		pattern: "resume.json",
	}),
	schema: resumeDataSchema,
});

const site = defineCollection({
	loader: glob({
		base: "./apps/web/src/content/site",
		pattern: "site.json",
	}),
	schema: siteMetadataSchema,
});

export const collections = {
	caseStudies,
	notes,
	projects,
	resume,
	site,
};
