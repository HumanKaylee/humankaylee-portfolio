---
title: "Cryogenic Flow Simulation"
slug: "cryo-flow-sim"
discipline: "simulation"
year: 2026
placement: "flagship"
featuredOrder: 1
lede: "A deterministic Rust cryogenic-flow simulator scaling to 29,500 entities, sustaining 30 Hz, and replaying identical state from a fixed seed."
problem: "Visualizing fluid dynamics in a cryogenic system requires accurate, reproducible state transitions across valves, tanks, and pipes, without depending on live hardware or an unpredictable animation loop."
stakes: "An incorrect simulation misleads about system behavior at the exact boundary conditions where engineering errors are most costly: low temperatures, pressure differentials, and timed valve sequencing."
role: "Rust workspace architecture, simulation implementation, capture pipeline, and artifact validation."
constraints:
  - "All behavior must be deterministic from a fixed seed so artifacts are reproducible and auditable."
  - "No live hardware dependency; the simulation must run entirely from a Rust service with a browser-rendered UI."
  - "The capture pipeline must verify its own output with measurable thresholds, not just visual inspection."
architecture:
  overview: "A Rust workspace drives three crates: cryo-core owns the physics domain model, cryo-service exposes an Axum HTTP layer, and cryo-web serves the browser-rendered SVG/HTML/CSS dashboard. Playwright orchestrates the Stage 1 capture scenario and validates the artifact."
  diagramAlt: "A three-crate Rust workspace with a physics core, Axum service layer, and browser-rendered SVG/HTML/CSS dashboard captured by a Playwright scenario harness."
decisions:
  - title: "Fixed-seed capture"
    choice: "Drive the Stage 1 scenario from a fixed seed and scenario name."
    alternatives:
      - "Depend on live hardware or an unpredictable animation loop."
    tradeoff: "The capture favors reproducibility and auditability over live-system variability."
  - title: "Threshold-based validation"
    choice: "Validate OCR, motion, flow, tank, pipe, telemetry, and clamp thresholds after capture."
    alternatives:
      - "Rely on visual inspection alone."
    tradeoff: "Thresholds are more trustworthy than inspection alone but require calibration against known-good runs."
outcome: "The scaled system ran 29,500 entities at 30 Hz, recovered to 30 Hz after deliberate overload, and reproduced a byte-identical 1,800-frame raw capture within its pinned executable, seed, GPU-adapter, and driver scope. Its representative warmed transport update fell from a 3.53 MB JSON snapshot to a 6.8 KB binary delta, while the new deterministic video changed 24.3% of fleet pixels (excluding labels) versus 1.0% in the prior capture."
lessons:
  - "Deterministic seeds make simulation artifacts auditable in a way that live hardware captures cannot be."
  - "Separating domain logic into a no-I/O core crate forces the physics model to be fully unit-testable before any service or UI code depends on it."
  - "Threshold-based artifact validation is more trustworthy than visual inspection alone, but the thresholds need calibration against known-good runs."
evidence:
  label: "Scale simulation proof"
  summary: "Measured scale, real-time recovery, and byte-identical deterministic replay for the 29,500-entity generated plant."
  values:
    - label: "System scale"
      value: "29,500 entities"
      detail: "5,000 tanks, 15,000 valves, 4,500 pipes, and 5,000 sensors share one authoritative state."
    - label: "Real-time runtime"
      value: "30 Hz"
      detail: "1,200 ticks across 40 seconds of selected normal and recovery windows, with zero dropped ticks in those windows."
    - label: "Deterministic replay"
      value: "1,800 frames"
      detail: "Byte-identical raw replay for the same executable, seed, GPU adapter, and driver."
  scope: "Generated-scale evidence combines a deterministic offline capture from a fixed seed with a separately measured live real-time run; source commits and measured validation thresholds are recorded."
  limits: "Byte determinism is scoped to the same executable, seed, GPU adapter, and driver; the deterministic offline capture does not claim wall-clock real-time performance."
media:
  kind: "video"
  src: "/media/cryo-flow-sim-stage1.mp4"
  poster: "/media/cryo-flow-sim-stage1-1440.webp"
  responsivePosterSources:
    - src: "/media/cryo-flow-sim-stage1-640.webp"
      width: 640
    - src: "/media/cryo-flow-sim-stage1-960.webp"
      width: 960
    - src: "/media/cryo-flow-sim-stage1-1440.webp"
      width: 1440
  width: 1920
  height: 1080
  alt: "Cryogenic flow simulation dashboard during a verified valve-transition scenario."
  caption: "Deterministic Stage 1 capture at 1920 by 1080."
  loop:
    src: "/media/cryo-flow-sim-loop-960.mp4"
    poster: "/media/cryo-flow-sim-loop-960.webp"
    width: 960
    height: 540
    durationSeconds: 10
    sizeBytes: 222403
    alt: "Cryogenic flow dashboard showing coordinated valve travel and changing telemetry."
    description: "A ten-second silent loop: the overview transitions into coordinated valve movement, active transfer flow, and changing tank telemetry before returning to a stable frame."
evidenceMedia:
  - kind: "video"
    src: "/media/cryo-flow-sim-scale/cryo-scale-deterministic-960.mp4"
    poster: "/media/cryo-flow-sim-scale/cryo-scale-deterministic-960.webp"
    responsivePosterSources:
      - { src: "/media/cryo-flow-sim-scale/cryo-scale-deterministic-960.webp", width: 960 }
    width: 960
    height: 540
    alt: "Deterministic Cryogenic flow simulation showing spatial valve-command waves and actual tank, pipe, and sensor response across 29,500 generated entities."
    caption: "Deterministic offline proof of all 29,500 generated entities: spatial valve-command waves close, open, and restore cohorts while actual tank, pipe, and sensor state responds across the fleet."
  - kind: "video"
    src: "/media/cryo-flow-sim-scale/cryo-scale-realtime-960.mp4"
    poster: "/media/cryo-flow-sim-scale/cryo-scale-realtime-960.webp"
    responsivePosterSources:
      - { src: "/media/cryo-flow-sim-scale/cryo-scale-realtime-960.webp", width: 960 }
    width: 960
    height: 540
    alt: "Live Cryogenic flow simulator runtime moving from a normal 30 Hz window through deliberate stress and back to a 30 Hz recovery window."
    caption: "Live 60-second runtime proof: normal 30 Hz, deliberate stress degradation, then recovery to 30 Hz with zero dropped ticks in the recovery window."
publicationStatus: "publish"
redactionStatus: "reviewed"
redactionReview:
  guidePath: "docs/CONTENT_REDACTION_GUIDE.md"
  reviewer: "operator"
  reviewedOn: "2026-05-26"
  checklistStatus: "partial"
  openItems:
    - "Production domain, provider, and deploy evidence are blocked in this repository snapshot."
    - "Final human signoff and approvalEvidence required before launch-eligible status."
  notes: "Public-safe narrative uses role labels only. No private hostnames, private repo paths, account identifiers, raw logs, credentials, or internal access paths are present. The simulation artifact is self-contained."
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
  title: "Cryogenic Flow Simulation | Joe Poznanski"
  description: "A deterministic Rust simulation and verified capture pipeline."
  canonicalPath: "/work/cryo-flow-sim/"
  ogImage: "/social/default.png"
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
    All artifact validation thresholds passed. The run record includes the
    source commit, fixed seed, and measured threshold results across 92 tests.
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
- **cryo-web** renders the live dashboard in SVG, HTML, and CSS, sampling screenshots on
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
telemetry changed count, and clamp-condition violations. All thresholds passed
on the Stage 1 final artifact and were recorded with its fixed seed and source
commit.

| Validation check | Threshold | Stage 1 result |
| --- | --- | --- |
| OCR match ratio | ≥ 0.90 | 0.905 (19/21 samples) |
| Valve motion score | ≥ 8 | 85 |
| Flow active pairs | ≥ 3 | 6 |
| Tank fill delta | ≥ 8 px | 10.694 px |
| Pipe cold monotonic pairs | ≥ 4 | 6 |
| Telemetry changed count | ≥ 12 | 30 |
| Clamp-condition violations | 0 | 0 |

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

The SVG/HTML/CSS dashboard screenshots could also be generated at a lower
resolution for the poster use case, rather than downscaling the 1920x1080
capture after the fact. That would reduce the poster asset size without a
separate conversion step.

## Stage 2

Stage 2 scope is deferred and will require a separate approval pass. The
current artifact establishes the pipeline and validation contract. Stage 2
will extend the scenario set, add multi-node tank network behavior, and
validate against a broader set of cryogenic event types.
