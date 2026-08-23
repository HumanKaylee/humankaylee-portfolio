import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { APIRoute } from "astro";

import { isPublicNote } from "../data/public-notes";

type NoteEntry = CollectionEntry<"notes">;
type WorkEntry = CollectionEntry<"work">;

const corePaths = [
	"/",
	"/work/",
	"/about/",
	"/notes/",
	"/now/",
	"/uses/",
	"/reading/",
	"/resume/",
	"/contact/",
	"/privacy/",
	"/terms/",
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
	const notes = (await getCollection("notes")) as NoteEntry[];
	const work = (await getCollection("work")) as WorkEntry[];
	const siteUrl = site.data.siteUrl.replace(/\/$/, "");
	const workPaths = work
		.filter((entry: WorkEntry) => entry.data.publicationStatus === "publish")
		.map((entry: WorkEntry) => `/work/${entry.data.slug}/`);
	const notePaths = notes
		.filter(isPublicNote)
		.map((entry: NoteEntry) => `/notes/${entry.data.slug}/`);
	const paths = [...corePaths, ...workPaths, ...notePaths];
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
