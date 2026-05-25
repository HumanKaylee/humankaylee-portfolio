import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);
const publicDir = path.join(repoRoot, "apps/web/public");

const cards = [
	["social/default.png", "SYSTEMS ATELIER", "HumanKaylee Portfolio"],
	["social/home.png", "SYSTEMS ATELIER", "Practical AI-Assisted Systems Work"],
	[
		"social/projects.png",
		"PROJECT ATLAS",
		"Automation, Operations, Backend, Creative Web",
	],
	[
		"social/project-detail.png",
		"PROJECT DETAIL",
		"Evidence Snapshot and Static-First Proof",
	],
	["social/case-studies.png", "CASE STUDIES", "Public-Safe Systems Narratives"],
	[
		"social/case-study-detail.png",
		"CASE STUDY",
		"Problem, Constraints, Verification, Operations",
	],
	["social/notes.png", "BUILD LOG", "Notes From the Systems Atelier"],
	["social/resume.png", "RESUME", "Recruiter Fast Path and Static PDF Asset"],
	[
		"social/contact.png",
		"CONTACT",
		"API Enhancement With Visible Email Fallback",
	],
	["social/sitemap.png", "SITEMAP", "Machine-Readable Route Index"],
	["social/robots.png", "ROBOTS", "Search Crawler Directives"],
	["social/404.png", "FALLBACK", "Readable Recovery for Stale Links"],
	[
		"social/examples/example-page.png",
		"EXAMPLE",
		"Content Inventory Preview Contract",
	],
	[
		"social/projects/cli-fleet-synchronization-and-mcp-rollout.png",
		"PROJECT",
		"CLI Fleet Synchronization and MCP Rollout",
	],
	[
		"social/projects/creative-web-systems-atlas-demo.png",
		"PROJECT",
		"Creative Web Systems Atlas Demo",
	],
	[
		"social/projects/humankaylee-portfolio-build.png",
		"PROJECT",
		"HumanKaylee Portfolio Build",
	],
	[
		"social/projects/remote-workstation-recovery-and-operational-debugging.png",
		"PROJECT",
		"Remote Workstation Recovery and Operational Debugging",
	],
	[
		"social/case-studies/cli-fleet-synchronization-and-mcp-rollout.png",
		"CASE STUDY",
		"CLI Fleet Synchronization and MCP Rollout",
	],
	[
		"social/case-studies/creative-web-systems-atlas-demo.png",
		"CASE STUDY",
		"Creative Web Systems Atlas Demo",
	],
	[
		"social/case-studies/humankaylee-portfolio-build.png",
		"CASE STUDY",
		"HumanKaylee Portfolio Build",
	],
	[
		"social/case-studies/remote-workstation-recovery-and-operational-debugging.png",
		"CASE STUDY",
		"Remote Workstation Recovery and Operational Debugging",
	],
	[
		"social/notes/api-offline-resilience.png",
		"BUILD LOG",
		"How the Portfolio Stays Useful When the API Is Offline",
	],
	[
		"social/notes/content-starts-as-data.png",
		"BUILD LOG",
		"Why the Portfolio Content Starts as Data, Not Pages",
	],
	[
		"social/notes/redaction-rules.png",
		"BUILD LOG",
		"Redaction Rules for Portfolio Case Studies",
	],
];

function generateCard([relativePath, kicker, title]) {
	const outputPath = path.join(publicDir, relativePath);
	mkdirSync(path.dirname(outputPath), { recursive: true });

	const result = spawnSync(
		"convert",
		[
			"-size",
			"1200x630",
			"gradient:#091612-#26382f",
			"(",
			"-size",
			"1200x630",
			"xc:none",
			"-fill",
			"#172921",
			"-draw",
			"polygon 740,0 1200,0 1200,630 910,630",
			")",
			"-composite",
			"-fill",
			"#d9a441",
			"-draw",
			"rectangle 86,78 1114,86",
			"-fill",
			"#f5ead1",
			"-font",
			"Helvetica-Bold",
			"-pointsize",
			"34",
			"-gravity",
			"NorthWest",
			"-annotate",
			"+86+118",
			kicker,
			"(",
			"-background",
			"none",
			"-fill",
			"#fff8e7",
			"-font",
			"Helvetica-Bold",
			"-pointsize",
			"72",
			"-size",
			"930x250",
			`caption:${title}`,
			")",
			"-gravity",
			"NorthWest",
			"-geometry",
			"+86+170",
			"-composite",
			"-fill",
			"#c8d7c4",
			"-font",
			"Helvetica",
			"-pointsize",
			"30",
			"-gravity",
			"SouthWest",
			"-annotate",
			"+86+86",
			"Static-first portfolio evidence - public-safe metadata",
			"-fill",
			"#d9a441",
			"-draw",
			"circle 1040,518 1088,518",
			"-fill",
			"#091612",
			"-font",
			"Helvetica-Bold",
			"-pointsize",
			"34",
			"-gravity",
			"SouthEast",
			"-annotate",
			"+104+90",
			"HK",
			"-strip",
			outputPath,
		],
		{ stdio: "inherit" },
	);

	if (result.status !== 0) {
		throw new Error(`Failed to generate ${relativePath}`);
	}
}

for (const card of cards) {
	generateCard(card);
}

console.log(`Generated ${cards.length} social preview assets.`);
