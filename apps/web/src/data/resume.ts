export const resumeContent = {
	provenance: {
		metadataPath: "apps/web/src/content/resume/resume.json",
		sourceStatus: "approved-source",
	},
	contact: {
		title:
			"Principal Software Engineer - Agentic AI Systems / LLM Platform Engineering",
		location: "Titusville, Florida, USA",
		email: "josephpoznanski@gmail.com",
		linkedin: "linkedin.com/in/joe-poznanski",
		linkedinUrl: "https://www.linkedin.com/in/joe-poznanski",
		certs: "PMP · PMI-ACP",
	},
	summary:
		"Principal Software Engineer with 15+ years shipping mission-critical aerospace and high-fidelity simulation software (Otto Aerospace, Blue Origin). I build agentic AI systems and developer automation that turn ambiguous operational goals into reliable, test-backed software: tool-using agents, eval/guardrail pipelines, and self-healing workflows that accelerate requirements-to-code while improving safety and correctness. Deep hands-on delivery across Rust / C / C++ / Python, distributed systems, and operator-grade dashboards.",
	aboutSummary:
		"I am a principal software engineer with 15+ years building mission-critical aerospace and high-fidelity simulation software. I turn ambiguous operational problems into reliable, test-backed systems across Rust, C++, Python, distributed infrastructure, and operator-facing tools.",
	highlights: [
		"Built tool-using agent workflows that automate triage to plan to implementation loops with human-in-the-loop review. The result is repeatable, test-backed changes instead of one-off prompt outputs.",
		"Created AI-assisted QA pipelines (test scaffolds, evidence packaging, regression summaries) that shorten feedback cycles on safety- and mission-critical systems.",
		"Developed ops copilots for log/telemetry summarization and anomaly correlation across distributed services, cutting time-to-diagnosis during integration and drills.",
		"Standardized prompt/playbook libraries and deterministic guardrails so teams can adopt AI workflows safely at scale.",
	],
	experience: [
		{
			company: "Otto Aerospace",
			place: "Ft. Worth, TX",
			role: "Principal Software Engineer - SuperNatural Vision Program",
			dates: "Aug 2025 - Present",
			aboutRole: "Principal Software Engineer, SuperNatural Vision Program",
			aboutDates: "2025–present",
			bullets: [
				"Architected and shipped an 8K video-wall system: synchronized playback across a 4-node Mac Mini cluster (~50 GB/s aggregate) with sub-frame latency, driving immersive executive demos.",
				"Built a Rust/tokio orchestration backend (async SSH dispatch, JSON-RPC playback control) with <100 ms command round-trip; and a Node.js/React operator dashboard with <16 ms UI updates.",
				"Operationalized agentic AI workflows (Claude/Codex + tool-use) for triage, code-gen, and refactoring across Rust/Python/Node. The resulting changes are reviewable, test-backed, and wired into CI/CD.",
			],
		},
		{
			company: "Blue Origin",
			place: "Cape Canaveral, FL",
			role: "Senior Simulation / Aerospace Operations Software Engineer",
			dates: "May 2022 - Aug 2025",
			aboutRole: "Senior Simulation / Aerospace Operations Software Engineer",
			aboutDates: "2022–2025",
			bullets: [
				"Built a Rust-based Simulated Avionics Layer delivering 500k+ telemetry signals at greater than 10 Hz from a single 32-core server. Maintained control-loop jitter below 1 ms at 100 Hz.",
				"Automated test & compliance: Python/pytest + GitLab CI running 800+ unit/functional/HIL tests nightly, auto-generating DO-178C / AS9100 evidence; regression cycles 3 days → 2 hours.",
				"Shipped the first-gen Operations Training Simulator (MVP in 18 months); trainee setup time −70%, NPS 93/100.",
			],
		},
		{
			company: "Avenger Flight Group",
			place: "Dallas, TX / Las Vegas, NV",
			role: "Director of Simulation & Software Engineering",
			dates: "Jun 2014 - May 2022",
			aboutRole: "Director of Simulation & Software Engineering",
			aboutDates: "2014–2022",
			bullets: [
				"Scaled the company 11 → 200+ staff across three countries; hired and mentored the first 30 simulation/software engineers.",
				"Designed a real-time C++17 / VxWorks / ZeroMQ data-bus (<120 ms) now fielded on 18+ aircraft simulators; earned 100% first-pass FAA approvals via CI/CD + automated DO-178C artifacts.",
				"Led technical delivery of a $45M multi-year simulator refresh (A320, 737 MAX, ATR), lifting narrow-body market share 1% → 13%.",
			],
		},
		{
			company: "SIMCOM Training",
			place: "Orlando, FL",
			role: "Flight Simulation Supervisor & Project Manager",
			dates: "Feb 2011 - Jun 2014",
			aboutRole: "Flight Simulation Supervisor & Project Manager",
			aboutDates: "2011–2014",
			bullets: [
				"Built an enterprise C++/SQL analytics platform ingesting Qualification Test Guide data from 12 flight-training devices, auto-generating compliance logs.",
			],
		},
	],
	skillGroups: [
		{
			label: "Languages",
			items:
				"Rust · C · C++ (17/20) · Python · Java · TypeScript/JS · SQL · Bash · PowerShell",
		},
		{
			label: "AI / ML",
			items:
				"Agentic systems & multi-agent orchestration · tool-using agents · evals/guardrails · Claude · OpenAI/Codex · PyTorch · TensorFlow",
		},
		{
			label: "Systems & Tooling",
			items:
				"tokio · Boost · Docker · GitLab/Jenkins CI/CD · AWS · Terraform · Ansible · Linux/RT · Grafana/Loki · React · Node.js",
		},
		{
			label: "Aerospace & Standards",
			items:
				"DO-178B/C · AS9100 · ARP4754A/4761 · FAA Part 60 · MBSE · HIL simulation · DAL-A/E",
		},
	],
	clearance:
		"U.S. Citizen · active DBIDS badge (Cape Canaveral) · eligible for U.S. Secret / Top Secret clearance · able to travel up to 50%.",
} as const;
