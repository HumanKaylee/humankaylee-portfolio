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
			"Core content is available without JavaScript or WebGL. Interactive systems maps will enhance this shell later without replacing it.",
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
				label: "Rendering",
				value: "Static-first",
				detail:
					"HTML carries the core story before JavaScript, WebGL, or API calls.",
			},
			{
				label: "Evidence",
				value: "Schema-backed",
				detail:
					"Case studies, projects, resume workflow, and metadata are typed.",
			},
			{
				label: "Backend",
				value: "Rust-ready",
				detail: "API telemetry remains optional until integration phases.",
			},
		],
	};
}
