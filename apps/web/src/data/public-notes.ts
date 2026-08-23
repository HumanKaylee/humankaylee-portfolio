import type { CollectionEntry } from "astro:content";

type NoteEntry = CollectionEntry<"notes">;

const suppressedOperationalNoteSlugs = new Set([
	"how-the-portfolio-stays-useful-when-the-api-is-offline",
	"redaction-rules-for-portfolio-case-studies",
	"why-the-portfolio-content-starts-as-data-not-pages",
]);

export function isPublicNote(note: NoteEntry) {
	return (
		note.data.publicationStatus === "publish" &&
		!suppressedOperationalNoteSlugs.has(note.data.slug)
	);
}
