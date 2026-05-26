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
			title: "HumanKaylee portfolio",
			description:
				"A systems-focused portfolio home page that introduces HumanKaylee's work, proof, and contact paths.",
			canonicalPath: "/",
			ogImage: "/social/home.png",
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
			title: "Projects | HumanKaylee portfolio",
			description:
				"A curated project index with accessible summaries for recruiter and engineer review.",
			canonicalPath: "/projects/",
			ogImage: "/social/projects.png",
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
			title: "Project detail | HumanKaylee portfolio",
			description:
				"A project detail route for deep-dive evidence, implementation notes, and artifacts.",
			canonicalPath: "/projects/[slug]/",
			ogImage: "/social/project-detail.png",
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
			title: "Case studies | HumanKaylee portfolio",
			description:
				"Flagship case studies with problem, constraints, verification, operations, and lessons.",
			canonicalPath: "/case-studies/",
			ogImage: "/social/case-studies.png",
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
			title: "Case study detail | HumanKaylee portfolio",
			description:
				"A case-study detail route with redacted evidence, implementation notes, and lessons.",
			canonicalPath: "/case-studies/[slug]/",
			ogImage: "/social/case-study-detail.png",
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
			title: "Notes and build log | HumanKaylee portfolio",
			description:
				"Short engineering notes, build logs, and process write-ups that support the launch story.",
			canonicalPath: "/notes/",
			ogImage: "/social/notes.png",
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
			title: "Resume | HumanKaylee portfolio",
			description:
				"HTML resume and downloadable PDF entry point for recruiter fast-path review.",
			canonicalPath: "/resume/",
			ogImage: "/social/resume.png",
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
			title: "Contact | HumanKaylee portfolio",
			description:
				"A direct contact route with fallback paths for email and form delivery.",
			canonicalPath: "/contact/",
			ogImage: "/social/contact.png",
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
			title: "Sitemap | HumanKaylee portfolio",
			description:
				"Machine-readable route index for the public portfolio site.",
			canonicalPath: "/sitemap-index.xml",
			ogImage: "/social/sitemap.png",
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
			title: "Robots | HumanKaylee portfolio",
			description: "Search crawler directives for the public portfolio site.",
			canonicalPath: "/robots.txt",
			ogImage: "/social/robots.png",
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
			title: "Page not found | HumanKaylee portfolio",
			description: "Fallback error page for missing routes and stale links.",
			canonicalPath: "/404",
			ogImage: "/social/404.png",
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
			title: "Now | HumanKaylee portfolio",
			description:
				"What HumanKaylee is focused on right now — current projects, working context, and active learning.",
			canonicalPath: "/now/",
			ogImage: "/social/now.png",
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
			title: "Uses | HumanKaylee portfolio",
			description:
				"Hardware, software, and tooling that HumanKaylee uses day-to-day as a Principal Engineer and systems builder.",
			canonicalPath: "/uses/",
			ogImage: "/social/uses.png",
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
			title: "Reading | HumanKaylee portfolio",
			description:
				"Books, papers, posts, and talks that HumanKaylee is reading or has read, with one-sentence takeaways.",
			canonicalPath: "/reading/",
			ogImage: "/social/reading.png",
			robots: "index,follow",
		},
	},
] as const satisfies readonly RouteInventoryEntry[];

export const routeInventoryById = Object.fromEntries(
	routeInventory.map((route) => [route.id, route]),
) as Readonly<
	Record<(typeof routeInventory)[number]["id"], (typeof routeInventory)[number]>
>;
