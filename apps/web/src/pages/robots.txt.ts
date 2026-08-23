import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
	const [site] = await getCollection("site");
	const siteUrl = site.data.siteUrl.replace(/\/$/, "");

	return new Response(
		[
			"User-agent: *",
			"Allow: /",
			`Sitemap: ${siteUrl}/sitemap-index.xml`,
			"",
		].join("\n"),
		{
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
			},
		},
	);
};
