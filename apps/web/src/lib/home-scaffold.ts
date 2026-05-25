export type ShellLink = Readonly<{
	label: string;
	href: string;
	eyebrow?: string;
}>;

export type TelemetryItem = Readonly<{
	label: string;
	value: string;
	detail: string;
}>;

export type HomeScaffold = Readonly<{
	visualDirection: string;
	palette: readonly string[];
	kicker: string;
	heroTitle: string;
	intro: string;
	noJsNote: string;
	audienceOrder: readonly string[];
	supportStatements: readonly string[];
	primaryNav: readonly ShellLink[];
	ctas: readonly ShellLink[];
	telemetry: readonly TelemetryItem[];
}>;

export function homeScaffold(): HomeScaffold {
	return {
		visualDirection: "The Systems Atelier",
		palette: [
			"warm off-black",
			"paper cream",
			"tungsten amber",
			"signal green",
			"oxidized blue",
		],
		kicker: "The Systems Atelier",
		heroTitle:
			"HumanKaylee's systems atelier for practical AI-assisted systems.",
		intro:
			"A static-first portfolio for automation, infrastructure, backend services, creative web systems, and the evidence that proves they work.",
		noJsNote:
			"Core content is available without JavaScript or WebGL. Optional systems-map enhancements stay additive and never replace the static story.",
		audienceOrder: ["recruiter", "senior-engineer", "collaborator"],
		supportStatements: [
			"Practical AI-assisted systems that turn ambiguous operational work into repeatable tools.",
			"Automation workflows with evidence, rollback paths, and public-safe handoff documentation.",
			"Infrastructure and backend services shaped by Rust, Axum, CI, security headers, and API-failure fallbacks.",
			"Polished user-facing tools that stay readable as static HTML before motion, WebGL, or live APIs load.",
		],
		primaryNav: [
			{ label: "Home", href: "/" },
			{ label: "Projects", href: "/projects/" },
			{ label: "Resume", href: "/resume/" },
			{ label: "Contact", href: "/contact/" },
		],
		ctas: [
			{
				label: "For recruiters",
				href: "/resume/",
				eyebrow: "Resume, scope, proof",
			},
			{
				label: "For engineers",
				href: "/projects/",
				eyebrow: "Systems, tradeoffs, verification",
			},
			{
				label: "Contact",
				href: "/contact/",
				eyebrow: "Static mailto fallback",
			},
		],
		telemetry: [
			{
				label: "Build",
				value: "Static output",
				detail:
					"HTML carries the core story before JavaScript, WebGL, or API calls.",
			},
			{
				label: "Verification",
				value: "Local coverage",
				detail:
					"Vitest and Playwright keep the static shell and fallback paths covered.",
			},
			{
				label: "Accessibility",
				value: "No-JS readable",
				detail:
					"Landmarks, skip link, and fallback content stay visible without hydration.",
			},
			{
				label: "API fallback",
				value: "Graceful fallback",
				detail:
					"Health and cached-project requests can fail without hiding the home page.",
			},
		],
	};
}
