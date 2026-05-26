---
title: "Cryo Flow Sim — Stage 1 Showcase"
slug: "cryo-flow-sim"
category: "infrastructure"
summary: "A deterministic simulation of cryogenic valve transients and pressure cascades, captured as a 96.9-second 1080p video artifact verified by 92 passing tests and zero unexpected clamp events."
audienceFit:
  - "senior-engineer"
  - "recruiter"
problem: "Visualizing fluid dynamics in a cryogenic system requires accurate, reproducible state transitions across valves, tanks, and pipes, without depending on live hardware or an unpredictable animation loop."
stakes: "An incorrect simulation misleads about system behavior at the exact boundary conditions where engineering errors are most costly — low temperatures, pressure differentials, and timed valve sequencing."
constraints:
  - "All behavior must be deterministic from a fixed seed so artifacts are reproducible and auditable."
  - "No live hardware dependency; the simulation must run entirely from a Rust service with a browser-rendered UI."
  - "The capture pipeline must verify its own output with measurable thresholds, not just visual inspection."
architecture:
  overview: "A Rust workspace drives three crates: cryo-core owns the physics domain model, cryo-service exposes an Axum HTTP layer, and cryo-web serves the Three.js dashboard. Playwright orchestrates the Stage 1 capture scenario and validates the artifact."
  diagramAlt: "A three-crate Rust workspace with a physics core, Axum service layer, and browser-rendered Three.js dashboard captured by a Playwright scenario harness."
implementation:
  - "cryo-core models valve state machines, pipe cooldown curves, and tank fill deltas as pure Rust structs with no I/O; tokio provides async orchestration for the service boundary."
  - "cryo-service exposes REST endpoints that stream telemetry state to cryo-web; all API responses are typed with serde so the dashboard never deserializes unverified data."
  - "cryo-web renders the live dashboard in Three.js, sampling dashboard screenshots on a fixed-interval loop so the capture harness has a reliable visual trace."
  - "The Stage 1 capture scenario is scripted in Playwright against a seeded server instance, producing an MP4, a full GIF, a detail GIF, and a set of dashboard screenshots in a single deterministic run."
  - "Artifact validation runs as a separate PowerShell script that reads run-metadata.json and asserts thresholds: OCR match ratio, valve motion score, flow active pair count, tank fill delta, pipe cold monotonic pairs, and telemetry changed count."
verification:
  - "92 cargo-nextest tests passed across all workspace crates with zero skipped, exercising valve transitions, pressure cascade logic, telemetry aggregation, and API contract boundaries."
  - "cargo clippy --all-targets --all-features exited with no warnings; cargo fmt checked clean; cargo audit scanned 136 dependencies with zero advisory blockers."
  - "The Playwright stage1-showcase spec passed on Chromium 148 at viewport 1920x1080 with seed 20260524."
  - "Artifact validation passed all measurable thresholds: OCR match ratio 0.90 (achieved 0.9048), valve motion score 85 (threshold 8), flow active pairs 6 (threshold 3), tank fill total delta 10.694 px (threshold 8 px), pipe cold monotonic pairs 6 (required 4), telemetry changed count 30 (threshold 12), unexpected clamps 0."
operations:
  - "The capture pipeline is reproducible: re-run with the same seed and scenario name to regenerate identical artifacts for audit."
  - "run-metadata.json records the git SHA, browser version, viewport, seed, command log hash, final state hash, and per-threshold validation results so any reviewer can verify provenance without rerunning the capture."
  - "cryo-service exits cleanly on SIGTERM; the capture harness stops the server after the scenario completes so no background process leaks."
outcome: "Stage 1 produced a verified 1920x1080 at 30fps, 96.9-second simulation video (13.2 MB) with 92 passing tests, all artifact thresholds met, and zero unexpected system behaviors. The Rust workspace, capture pipeline, and validation contract are stable enough to serve as the foundation for Stage 2 scenario work."
lessons:
  - "Deterministic seeds make simulation artifacts auditable in a way that live hardware captures cannot be — every threshold failure points to a reproducible code change, not ambient hardware noise."
  - "Separating domain logic into a no-I/O core crate forces the physics model to be fully unit-testable before any service or UI code depends on it."
  - "Threshold-based artifact validation is more trustworthy than visual inspection alone, but the thresholds themselves need calibration against known-good runs before they become gating criteria."
featuredEvidence:
  label: "Stage 1 verified artifact"
  summary: "1920x1080 at 30fps MP4 capture, 92 tests passed, all validation thresholds met, zero unexpected clamp events, and a run-metadata.json provenance record with git SHA, seed, and per-threshold results."
  scope: "Local artifact evidence; Stage 2 scope requires a separate approval pass."
links:
  artifacts:
    - "run-metadata.json provenance record with git SHA, seed, and validation results"
    - "Playwright stage1-showcase capture spec"
    - "cargo-nextest and cargo-audit verification logs"
publicationStatus: "publish"
redactionStatus: "reviewed"
issueTrace:
  backlogId: "B-020"
  githubIssue: 26
  parentIssue: 3
  closureRule: "Issue #26 may be closed once cryo-flow-sim Stage 1 video embed, poster, production deploy evidence, and final human signoff are recorded."
redactionReview:
  guidePath: "docs/CONTENT_REDACTION_GUIDE.md"
  reviewer: "operator"
  reviewedOn: "2026-05-26"
  checklistStatus: "partial"
  openItems:
    - "Production domain, provider, and deploy evidence are blocked in this repository snapshot."
    - "Final human signoff and approvalEvidence required before launch-eligible status."
  notes: "Public-safe narrative uses role labels only. No private hostnames, private repo paths, account identifiers, raw logs, credentials, or internal access paths are present. The simulation artifact is a self-contained video and metadata record with no connection to live infrastructure. Stage 2 scope is explicitly deferred. Redaction stays reviewed until production evidence and final signoff exist."
  checklist:
    secretsRemoved: "yes"
    hostnamesAndAccessPathsGeneralized: "yes"
    userAndAccountNamesGeneralized: "yes"
    screenshotsInspected: "yes"
    logsSummarizedOrSanitized: "yes"
    publicLinksVerified: "not-applicable"
    claimsHaveSafeEvidence: "yes"
    securitySensitiveProceduresRemoved: "yes"
seo:
  title: "Cryo Flow Sim — Stage 1 Showcase"
  description: "A deterministic cryogenic simulation captured as a verified 1080p video artifact, built with a three-crate Rust workspace and validated by 92 passing tests."
  canonicalPath: "/case-studies/cryo-flow-sim/"
  ogImage: "/social/default.svg"
---

## Stage 1 showcase video

<video
  src="/media/cryo-flow-sim-stage1.mp4"
  poster="/media/cryo-flow-sim-stage1-poster.png"
  preload="metadata"
  playsinline
  controls
  width="1280"
  aria-label="Cryo-flow-sim Stage 1 — 96.9-second simulation of valve transients and pressure cascade at 1920x1080 30fps"
>
  <p>
    This browser does not support the HTML video element. The Stage 1 showcase
    is a 96.9-second, 1920x1080 at 30fps simulation of cryogenic valve
    transients and pressure cascades across six scenario phases: overview,
    fill start, pipe chilldown, valve travel, tank transfer, and vent recovery.
    All artifact validation thresholds passed. 92 tests passed with zero
    unexpected clamp events.
  </p>
</video>

## What the simulation models

The Stage 1 scenario covers six phases of a cryogenic system startup: an
initial overview, a fill start that opens the primary inlet valve, a pipe
chilldown that cools the transfer line from ambient to cryogenic temperature,
valve travel that exercises the full range of actuator positions, a tank
transfer that moves fluid across the tank network, and a vent recovery that
restores system pressure after an overpressure event.

Each phase produces measurable state transitions. Valve positions move through
discrete actuator steps. Tank fill levels change monotonically during transfer.
Pipe temperatures follow a cooldown curve from ambient to cryogenic. Telemetry
event counts advance as the simulation progresses. The artifact validation
script checks each of these transitions against calibrated thresholds, not just
visual inspection.

## Crate structure

The Rust workspace separates concerns into three crates:

- **cryo-core** holds all domain logic: valve state machines, pipe cooldown
  curves, tank fill deltas, and telemetry aggregation. It has no I/O and no
  service dependencies, which makes every physics behavior directly unit-testable.
- **cryo-service** exposes an Axum HTTP layer that drives cryo-core and streams
  telemetry state to the browser. All responses are typed with serde so the
  dashboard never deserializes unverified data.
- **cryo-web** renders the live dashboard in Three.js, sampling screenshots on
  a fixed interval so the capture harness has a reliable visual trace to work
  from.

## Capture and validation pipeline

The Stage 1 capture runs through a Playwright scenario script that starts the
service with a fixed seed, drives the scenario to completion, and extracts the
MP4, full GIF, detail GIF, and a set of dashboard screenshots in a single
deterministic run. The same seed and scenario name always produce the same
output, which makes the artifact auditable against its source commit.

After capture, a validation script reads `run-metadata.json` and checks seven
threshold groups: OCR match ratio on dashboard labels, valve motion score,
flow active pair count, tank fill total delta, pipe cold monotonic pairs,
telemetry changed count, and unexpected clamp events. All thresholds passed on
the Stage 1 final artifact with zero unexpected clamps.

| Validation check | Threshold | Stage 1 result |
| --- | --- | --- |
| OCR match ratio | ≥ 0.90 | 0.905 (19/21 samples) |
| Valve motion score | ≥ 8 | 85 |
| Flow active pairs | ≥ 3 | 6 |
| Tank fill delta | ≥ 8 px | 10.694 px |
| Pipe cold monotonic pairs | ≥ 4 | 6 |
| Telemetry changed count | ≥ 12 | 30 |
| Unexpected clamps | 0 | 0 |

## Test and quality results

The Rust workspace shipped 92 nextest tests across all crates. All passed.
Zero skipped. cargo clippy exited with no warnings across all targets and
features. cargo audit scanned 136 dependencies with zero advisory blockers.
The single duplicate-crate warning (wit-bindgen) was recorded and did not block
the audit.

Code coverage was captured with cargo-llvm-cov across the same 92 tests. The
lcov report is committed to the artifact archive alongside the capture logs,
clippy output, and nextest summary for auditability.

## What I would do differently

The current validation thresholds were calibrated manually against the first
successful run. A better approach would be to run the scenario across a range
of seeds first and derive threshold ranges from the distribution, so a
regression is detectable without a known-good baseline run as the only
reference point.

The Three.js dashboard screenshots could also be generated at a lower
resolution for the poster use case, rather than downscaling the 1920x1080
capture after the fact. That would reduce the poster asset size without a
separate conversion step.

## Stage 2

Stage 2 scope is deferred and will require a separate approval pass. The
current artifact establishes the pipeline and validation contract. Stage 2
will extend the scenario set, add multi-node tank network behavior, and
validate against a broader set of cryogenic event types.
