export type CapabilityProof = {
	capability: string;
	summary: string;
	href: string;
	evidence: string;
};

export const capabilityProof: readonly CapabilityProof[] = [
	{
		capability: "Simulation and controls",
		summary:
			"Deterministic models, timed state transitions, and operator-facing system behavior.",
		href: "/work/cryo-flow-sim/",
		evidence:
			"The Cryogenic Flow case study runs 29,500 entities at 30 Hz, reproduces a byte-identical 1,800-frame raw replay in its fixed hardware and software scope, and makes coordinated valve waves visible across all 15,000 valves. A warmed-state transport measurement paired a 5.29 MB full JSON snapshot with a separately scoped 6.8 KB representative incremental delta.",
	},
	{
		capability: "Rust and C++ systems",
		summary:
			"Typed systems software across browser, service, real-time, and hardware-in-the-loop boundaries.",
		href: "/resume/#experience",
		evidence:
			"The résumé documents Rust simulation and orchestration systems plus a C++17, VxWorks, and ZeroMQ data bus fielded on 18+ aircraft simulators.",
	},
	{
		capability: "High-rate telemetry",
		summary:
			"High-volume signal delivery with bounded timing behavior for control and operational use.",
		href: "/resume/#experience",
		evidence:
			"A Rust-based Simulated Avionics Layer delivered 500k+ telemetry signals at greater than 10 Hz while maintaining control-loop jitter below 1 ms at 100 Hz.",
	},
	{
		capability: "Verification and validation",
		summary:
			"Test evidence that shortens feedback cycles without weakening the operational boundary.",
		href: "/resume/#experience",
		evidence:
			"Python, pytest, and GitLab CI ran 800+ unit, functional, and HIL tests nightly and reduced regression cycles from three days to two hours.",
	},
	{
		capability: "Distributed media",
		summary:
			"Synchronized playback and operator control across networked, performance-sensitive nodes.",
		href: "/resume/#experience",
		evidence:
			"An 8K video wall synchronized playback across a four-node cluster at approximately 50 GB/s aggregate with sub-frame latency.",
	},
	{
		capability: "Human-in-the-loop agents",
		summary:
			"Tool-using workflows designed for reviewable changes, explicit guardrails, and human judgment.",
		href: "/resume/#highlights",
		evidence:
			"The résumé describes agent workflows for triage, planning, implementation, QA evidence, and review rather than one-off prompt output.",
	},
];
