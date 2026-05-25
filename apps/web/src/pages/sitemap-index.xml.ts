import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { APIRoute } from "astro";

type CaseStudyEntry = CollectionEntry<"caseStudies">;
type NoteEntry = CollectionEntry<"notes">;
type ProjectEntry = CollectionEntry<"projects">;

const corePaths = [
	"/",
	"/projects/",
	"/case-studies/",
	"/notes/",
	"/resume/",
	"/contact/",
] as const;

function escapeXml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

function absoluteUrl(siteUrl: string, path: string) {
	return `${siteUrl.replace(/\/$/, "")}${path}`;
}

export const GET: APIRoute = async () => {
	const [site] = await getCollection("site");
	const caseStudies = (await getCollection("caseStudies")) as CaseStudyEntry[];
	const notes = (await getCollection("notes")) as NoteEntry[];
	const projects = (await getCollection("projects")) as ProjectEntry[];
	const siteUrl = site.data.siteUrl.replace(/\/$/, "");
	const projectPaths = projects
		.filter((entry: ProjectEntry) => entry.data.publicationStatus === "publish")
		.map((entry: ProjectEntry) => `/projects/${entry.data.slug}/`);
	const caseStudyPaths = caseStudies
		.filter(
			(entry: CaseStudyEntry) => entry.data.publicationStatus === "publish",
		)
		.map((entry: CaseStudyEntry) => `/case-studies/${entry.data.slug}/`);
	const notePaths = notes
		.filter((entry: NoteEntry) => entry.data.publicationStatus === "publish")
		.map((entry: NoteEntry) => `/notes/${entry.data.slug}/`);
	const paths = [
		...corePaths,
		...projectPaths,
		...caseStudyPaths,
		...notePaths,
	];
	const urls = paths
		.map(
			(path) =>
				`  <url><loc>${escapeXml(absoluteUrl(siteUrl, path))}</loc></url>`,
		)
		.join("\n");

	return new Response(
		[
			'<?xml version="1.0" encoding="UTF-8"?>',
			'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
			urls,
			"</urlset>",
			"",
		].join("\n"),
		{
			headers: {
				"Content-Type": "application/xml; charset=utf-8",
			},
		},
	);
};
