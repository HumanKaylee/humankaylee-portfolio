import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

type NoteEntry = CollectionEntry<"notes">;

const siteUrl = "https://humankaylee.example";

function escapeXml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

function noteUrl(note: NoteEntry) {
	return `${siteUrl}/notes/${note.data.slug}/`;
}

export async function GET() {
	const notes = ((await getCollection("notes")) as NoteEntry[])
		.filter((note: NoteEntry) => note.data.publicationStatus === "publish")
		.sort((left: NoteEntry, right: NoteEntry) =>
			right.data.publishedAt.localeCompare(left.data.publishedAt),
		);

	const items = notes
		.map((note: NoteEntry) => {
			const pubDate = new Date(`${note.data.publishedAt}T00:00:00Z`);

			return `<item>
<title>${escapeXml(note.data.title)}</title>
<link>${escapeXml(noteUrl(note))}</link>
<guid>${escapeXml(noteUrl(note))}</guid>
<pubDate>${pubDate.toUTCString()}</pubDate>
<description>${escapeXml(note.data.summary)}</description>
</item>`;
		})
		.join("");

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>HumanKaylee Portfolio Notes</title>
<link>${siteUrl}/notes/</link>
<description>Published engineering notes and build-log entries from HumanKaylee.</description>
${items}
</channel>
</rss>`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
		},
	});
}
