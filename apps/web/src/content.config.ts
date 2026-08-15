import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

import {
	caseStudySchema,
	notesEntrySchema,
	nowEntrySchema,
	projectMetadataSchema,
	readingEntrySchema,
	resumeDataSchema,
	siteMetadataSchema,
	usesEntrySchema,
} from "./lib/contracts/content";
import { workSchema } from "./lib/contracts/work";

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

const now = defineCollection({
	loader: glob({
		base: "./apps/web/src/content/now",
		pattern: "**/*.md",
	}),
	schema: nowEntrySchema,
});

const uses = defineCollection({
	loader: glob({
		base: "./apps/web/src/content/uses",
		pattern: "**/*.md",
	}),
	schema: usesEntrySchema,
});

const work = defineCollection({
	loader: glob({
		base: "./apps/web/src/content/work",
		pattern: "**/*.md",
	}),
	schema: workSchema,
});

const reading = defineCollection({
	loader: glob({
		base: "./apps/web/src/content/reading",
		pattern: "**/*.md",
	}),
	schema: readingEntrySchema,
});

export const collections = {
	caseStudies,
	notes,
	now,
	projects,
	reading,
	resume,
	site,
	uses,
	work,
};
