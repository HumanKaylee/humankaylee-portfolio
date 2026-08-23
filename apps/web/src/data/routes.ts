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
	primary: boolean;
	seo: RouteSeo;
}>;

const defaultOgImage = "/social/default.png";

export const routeInventory = [
	{
		id: "home",
		label: "Home",
		path: "/",
		owner: "page-composition",
		status: "planned",
		primary: false,
		seo: {
			title: "Joe Poznanski portfolio",
			description:
				"Principal engineer for simulation, controls, and operational software.",
			canonicalPath: "/",
			ogImage: defaultOgImage,
			robots: "index,follow",
		},
	},
	{
		id: "work",
		label: "Work",
		path: "/work/",
		owner: "content",
		status: "planned",
		primary: true,
		seo: {
			title: "Work | Joe Poznanski",
			description:
				"Evidence-backed engineering work across simulation, infrastructure, and automation.",
			canonicalPath: "/work/",
			ogImage: defaultOgImage,
			robots: "index,follow",
		},
	},
	{
		id: "work-detail",
		label: "Work detail",
		path: "/work/[slug]/",
		owner: "content",
		status: "planned",
		primary: false,
		seo: {
			title: "Work detail | Joe Poznanski",
			description:
				"A detailed engineering story with public-safe evidence and lessons.",
			canonicalPath: "/work/[slug]/",
			ogImage: defaultOgImage,
			robots: "index,follow",
		},
	},
	{
		id: "about",
		label: "About",
		path: "/about/",
		owner: "page-composition",
		status: "planned",
		primary: true,
		seo: {
			title: "About | Joe Poznanski",
			description:
				"Engineering judgment, current focus, selected tools, and reading.",
			canonicalPath: "/about/",
			ogImage: defaultOgImage,
			robots: "index,follow",
		},
	},
	{
		id: "resume",
		label: "Résumé",
		path: "/resume/",
		owner: "content",
		status: "draft",
		primary: true,
		seo: {
			title: "Résumé | Joe Poznanski",
			description:
				"Professional experience and a downloadable résumé for Joe Poznanski.",
			canonicalPath: "/resume/",
			ogImage: defaultOgImage,
			robots: "index,follow",
		},
	},
	{
		id: "contact",
		label: "Contact",
		path: "/contact/",
		owner: "page-composition",
		status: "planned",
		primary: true,
		seo: {
			title: "Contact | Joe Poznanski",
			description: "Direct contact paths for Joe Poznanski.",
			canonicalPath: "/contact/",
			ogImage: defaultOgImage,
			robots: "index,follow",
		},
	},
	{
		id: "notes",
		label: "Notes",
		path: "/notes/",
		owner: "content",
		status: "draft",
		primary: false,
		seo: {
			title: "Notes | Joe Poznanski",
			description: "Technical notes from Joe Poznanski.",
			canonicalPath: "/notes/",
			ogImage: defaultOgImage,
			robots: "index,follow",
		},
	},
	{
		id: "note-detail",
		label: "Note detail",
		path: "/notes/[slug]/",
		owner: "content",
		status: "draft",
		primary: false,
		seo: {
			title: "Note | Joe Poznanski",
			description: "A technical note from Joe Poznanski.",
			canonicalPath: "/notes/[slug]/",
			ogImage: defaultOgImage,
			robots: "index,follow",
		},
	},
	{
		id: "sitemap",
		label: "Sitemap",
		path: "/sitemap-index.xml",
		owner: "page-composition",
		status: "generated",
		primary: false,
		seo: {
			title: "Sitemap | Joe Poznanski",
			description:
				"Machine-readable route index for the public portfolio site.",
			canonicalPath: "/sitemap-index.xml",
			ogImage: defaultOgImage,
			robots: "noindex,nofollow",
		},
	},
	{
		id: "robots",
		label: "Robots",
		path: "/robots.txt",
		owner: "page-composition",
		status: "generated",
		primary: false,
		seo: {
			title: "Robots | Joe Poznanski",
			description: "Search crawler directives for the public portfolio site.",
			canonicalPath: "/robots.txt",
			ogImage: defaultOgImage,
			robots: "noindex,nofollow",
		},
	},
	{
		id: "fallback-error",
		label: "Fallback error page",
		path: "/404",
		owner: "page-composition",
		status: "planned",
		primary: false,
		seo: {
			title: "Page not found | Joe Poznanski",
			description: "Fallback error page for missing routes and stale links.",
			canonicalPath: "/404",
			ogImage: defaultOgImage,
			robots: "noindex,nofollow",
		},
	},
	{
		id: "now",
		label: "Now",
		path: "/now/",
		owner: "content",
		status: "draft",
		primary: false,
		seo: {
			title: "Now | Joe Poznanski",
			description: "What Joe Poznanski is focused on right now.",
			canonicalPath: "/now/",
			ogImage: defaultOgImage,
			robots: "index,follow",
		},
	},
	{
		id: "uses",
		label: "Uses",
		path: "/uses/",
		owner: "content",
		status: "draft",
		primary: false,
		seo: {
			title: "Uses | Joe Poznanski",
			description: "Tools and equipment Joe Poznanski uses day-to-day.",
			canonicalPath: "/uses/",
			ogImage: defaultOgImage,
			robots: "index,follow",
		},
	},
	{
		id: "reading",
		label: "Reading",
		path: "/reading/",
		owner: "content",
		status: "draft",
		primary: false,
		seo: {
			title: "Reading | Joe Poznanski",
			description: "Books, papers, posts, and talks Joe Poznanski is reading.",
			canonicalPath: "/reading/",
			ogImage: defaultOgImage,
			robots: "index,follow",
		},
	},
	{
		id: "privacy",
		label: "Privacy",
		path: "/privacy/",
		owner: "page-composition",
		status: "planned",
		primary: false,
		seo: {
			title: "Privacy Policy | Joe Poznanski",
			description:
				"What this site collects, and how the personal Google integration handles the operator's own account data.",
			canonicalPath: "/privacy/",
			ogImage: defaultOgImage,
			robots: "index,follow",
		},
	},
	{
		id: "terms",
		label: "Terms",
		path: "/terms/",
		owner: "page-composition",
		status: "planned",
		primary: false,
		seo: {
			title: "Terms of Service | Joe Poznanski",
			description:
				"The terms that apply to this personal portfolio site, provided as-is.",
			canonicalPath: "/terms/",
			ogImage: defaultOgImage,
			robots: "index,follow",
		},
	},
] as const satisfies readonly RouteInventoryEntry[];

export const routeInventoryById = Object.fromEntries(
	routeInventory.map((route) => [route.id, route]),
) as Readonly<
	Record<(typeof routeInventory)[number]["id"], (typeof routeInventory)[number]>
>;
