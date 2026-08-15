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
		heroTitle: "Systems built to hold up.",
		intro:
			"Principal software engineer building reliable AI workflows, aerospace systems, automation, and operator-grade tools.",
		noJsNote:
			"Explore selected systems, the tradeoffs behind them, and the evidence used to verify delivery.",
		audienceOrder: ["recruiter", "senior-engineer", "collaborator"],
		supportStatements: [
			"AI-assisted systems that turn ambiguous operational work into repeatable tools.",
			"Automation with explicit evidence, rollback paths, and useful handoff documentation.",
			"Rust, C++, Python, TypeScript, distributed services, and real-time systems.",
			"Interfaces designed for operators who need fast answers when the system is under pressure.",
		],
		primaryNav: [
			{ label: "Home", href: "/" },
			{ label: "Projects", href: "/projects/" },
			{ label: "Now", href: "/now/" },
			{ label: "Uses", href: "/uses/" },
			{ label: "Reading", href: "/reading/" },
			{ label: "Resume", href: "/resume/" },
			{ label: "Contact", href: "/contact/" },
		],
		ctas: [
			{
				label: "Resume & scope",
				href: "/resume/",
				eyebrow: "Experience, impact, contact",
			},
			{
				label: "Projects",
				href: "/projects/",
				eyebrow: "Systems, tradeoffs, verification",
			},
			{
				label: "Contact Joe",
				href: "/contact/",
				eyebrow: "Direct public-safe route",
			},
		],
		telemetry: [
			{
				label: "Build",
				value: "Fast by default",
				detail:
					"HTML carries the core story before JavaScript, WebGL, or API calls.",
			},
			{
				label: "Verification",
				value: "Behavior tested",
				detail:
					"Vitest and Playwright keep the static shell and fallback paths covered.",
			},
			{
				label: "Accessibility",
				value: "Keyboard ready",
				detail:
					"Landmarks, skip link, and fallback content stay visible without hydration.",
			},
			{
				label: "Resilience",
				value: "Failure aware",
				detail:
					"Health and cached-project requests can fail without hiding the home page.",
			},
		],
	};
}
