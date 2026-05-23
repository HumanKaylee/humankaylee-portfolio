export type HomeAction = Readonly<{
	label: string;
	href: string;
}>;

export type HomeScaffold = Readonly<{
	kicker: string;
	heroTitle: string;
	intro: string;
	note: string;
	noJsNote: string;
	primaryCta: HomeAction;
	secondaryCta: HomeAction;
	resumeCta: HomeAction;
}>;

export function homeScaffold(): HomeScaffold {
	return {
		kicker: "Phase 0 scaffold stage",
		heroTitle: "HumanKaylee portfolio foundation",
		intro:
			"This repository is the minimal, honest starting point for the portfolio implementation. It proves the command contract, static rendering path, and test harness before any launch claims.",
		note: "This is not the launch version and does not claim the PRD features are complete.",
		noJsNote:
			"No JavaScript required: this scaffold is intentionally readable as static HTML before any interactive portfolio features are added.",
		resumeCta: {
			label: "Resume placeholder",
			href: "#resume",
		},
		primaryCta: {
			label: "Project placeholders",
			href: "#projects",
		},
		secondaryCta: {
			label: "Contact placeholder",
			href: "#contact",
		},
	};
}
