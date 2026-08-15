export type RouteOwner = "page-composition" | "content" | "foundation";

export type RouteStatus = "planned" | "draft" | "generated";

export type RouteSeo = Readonly<{
	title: string;
	description: string;
	canonicalPath: string;
	ogImage: string;
	robots: "index,follow" | "noindex,nofollow";
}>;

export type RouteInventoryEntry = Readonly<{
	id: string;
	label: string;
	path: string;
	owner: RouteOwner;
	status: RouteStatus;
	seo: RouteSeo;
}>;

export const routeInventory = [
	{
		id: "home",
		label: "Home",
		path: "/",
		owner: "page-composition",
		status: "planned",
		seo: {
			title: "Joe Poznanski portfolio",
			description:
				"A systems-focused portfolio home page that introduces Joe Poznanski's work, proof, and contact paths.",
			canonicalPath: "/",
			ogImage: "/social/default.png",
			robots: "index,follow",
		},
	},
	{
		id: "projects",
		label: "Projects",
		path: "/projects/",
		owner: "page-composition",
		status: "planned",
		seo: {
			title: "Projects | Joe Poznanski portfolio",
			description:
				"A curated project index with accessible summaries for recruiter and engineer review.",
			canonicalPath: "/projects/",
			ogImage: "/social/default.png",
			robots: "index,follow",
		},
	},
	{
		id: "project-detail",
		label: "Project detail",
		path: "/projects/[slug]/",
		owner: "page-composition",
		status: "planned",
		seo: {
			title: "Project detail | Joe Poznanski portfolio",
			description:
				"A project detail route for deep-dive evidence, implementation notes, and artifacts.",
			canonicalPath: "/projects/[slug]/",
			ogImage: "/social/default.png",
			robots: "index,follow",
		},
	},
	{
		id: "case-studies",
		label: "Case studies",
		path: "/case-studies/",
		owner: "content",
		status: "draft",
		seo: {
			title: "Case studies | Joe Poznanski portfolio",
			description:
				"Flagship case studies with problem, constraints, verification, operations, and lessons.",
			canonicalPath: "/case-studies/",
			ogImage: "/social/default.png",
			robots: "index,follow",
		},
	},
	{
		id: "case-study-detail",
		label: "Case study detail",
		path: "/case-studies/[slug]/",
		owner: "content",
		status: "draft",
		seo: {
			title: "Case study detail | Joe Poznanski portfolio",
			description:
				"A case-study detail route with redacted evidence, implementation notes, and lessons.",
			canonicalPath: "/case-studies/[slug]/",
			ogImage: "/social/default.png",
			robots: "index,follow",
		},
	},
	{
		id: "notes-build-log",
		label: "Notes / build log",
		path: "/notes/",
		owner: "content",
		status: "draft",
		seo: {
			title: "Notes and build log | Joe Poznanski portfolio",
			description:
				"Short engineering notes, build logs, and process write-ups that support the launch story.",
			canonicalPath: "/notes/",
			ogImage: "/social/default.png",
			robots: "index,follow",
		},
	},
	{
		id: "resume",
		label: "Resume",
		path: "/resume/",
		owner: "content",
		status: "draft",
		seo: {
			title: "Resume | Joe Poznanski portfolio",
			description:
				"HTML resume and downloadable PDF entry point for recruiter fast-path review.",
			canonicalPath: "/resume/",
			ogImage: "/social/default.png",
			robots: "index,follow",
		},
	},
	{
		id: "contact",
		label: "Contact",
		path: "/contact/",
		owner: "page-composition",
		status: "planned",
		seo: {
			title: "Contact | Joe Poznanski portfolio",
			description:
				"A direct contact route with fallback paths for email and form delivery.",
			canonicalPath: "/contact/",
			ogImage: "/social/default.png",
			robots: "index,follow",
		},
	},
	{
		id: "sitemap",
		label: "Sitemap",
		path: "/sitemap-index.xml",
		owner: "page-composition",
		status: "generated",
		seo: {
			title: "Sitemap | Joe Poznanski portfolio",
			description:
				"Machine-readable route index for the public portfolio site.",
			canonicalPath: "/sitemap-index.xml",
			ogImage: "/social/default.png",
			robots: "noindex,nofollow",
		},
	},
	{
		id: "robots",
		label: "Robots",
		path: "/robots.txt",
		owner: "page-composition",
		status: "generated",
		seo: {
			title: "Robots | Joe Poznanski portfolio",
			description: "Search crawler directives for the public portfolio site.",
			canonicalPath: "/robots.txt",
			ogImage: "/social/default.png",
			robots: "noindex,nofollow",
		},
	},
	{
		id: "fallback-error",
		label: "Fallback error page",
		path: "/404",
		owner: "page-composition",
		status: "planned",
		seo: {
			title: "Page not found | Joe Poznanski portfolio",
			description: "Fallback error page for missing routes and stale links.",
			canonicalPath: "/404",
			ogImage: "/social/default.png",
			robots: "noindex,nofollow",
		},
	},
	{
		id: "now",
		label: "Now",
		path: "/now/",
		owner: "content",
		status: "draft",
		seo: {
			title: "Now | Joe Poznanski portfolio",
			description:
				"What Joe Poznanski is focused on right now — current projects, working context, and active learning.",
			canonicalPath: "/now/",
			ogImage: "/social/default.png",
			robots: "index,follow",
		},
	},
	{
		id: "uses",
		label: "Uses",
		path: "/uses/",
		owner: "content",
		status: "draft",
		seo: {
			title: "Uses | Joe Poznanski portfolio",
			description:
				"Hardware, software, and tooling that Joe Poznanski uses day-to-day as a Principal Engineer and systems builder.",
			canonicalPath: "/uses/",
			ogImage: "/social/default.png",
			robots: "index,follow",
		},
	},
	{
		id: "reading",
		label: "Reading",
		path: "/reading/",
		owner: "content",
		status: "draft",
		seo: {
			title: "Reading | Joe Poznanski portfolio",
			description:
				"Books, papers, posts, and talks that Joe Poznanski is reading or has read, with one-sentence takeaways.",
			canonicalPath: "/reading/",
			ogImage: "/social/default.png",
			robots: "index,follow",
		},
	},
] as const satisfies readonly RouteInventoryEntry[];

export const routeInventoryById = Object.fromEntries(
	routeInventory.map((route) => [route.id, route]),
) as Readonly<
	Record<(typeof routeInventory)[number]["id"], (typeof routeInventory)[number]>
>;
