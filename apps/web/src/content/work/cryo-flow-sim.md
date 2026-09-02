---
title: "Cryogenic Flow Simulation"
slug: "cryo-flow-sim"
discipline: "simulation"
year: 2026
placement: "flagship"
featuredOrder: 1
lede: "Rust process simulation informed by Siemens and Rockwell PLC experience: 29,500 entities at 30 Hz with fixed-seed replay."
problem: "Control sequences are difficult to rehearse when the real facility is unavailable, incomplete, or too costly to place into every fault and boundary condition. The simulator needed reproducible state transitions across valves, tanks, pipes, and instrumentation without depending on live hardware."
stakes: "A simulation that hides its assumptions can create false confidence at the exact conditions where engineering errors are most costly: low temperatures, pressure differentials, actuator timing, alarms, and recovery sequences."
role: "Controls-domain translation, Rust workspace architecture, simulation implementation, capture pipeline, and artifact validation."
constraints:
  - "All behavior must be deterministic from a fixed seed so artifacts are reproducible and auditable."
  - "No live hardware dependency; the simulation must run entirely from a Rust service with a browser-rendered UI."
  - "The capture pipeline must verify its own output with measurable thresholds, not just visual inspection."
  - "The current demonstration is not plant-calibrated, connected to PLC or DCS control logic, safety-authoritative, or an operational digital twin."
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
  - title: "Sell a bounded outcome before a platform"
    choice: "Start with a facility-specific control-sequence rehearsal engagement built from approved customer engineering information and acceptance scenarios."
    alternatives:
      - "Build a general simulation platform or multi-tenant SaaS before proving paid customer demand."
    tradeoff: "Manual customer translation limits early software scale, but it tests the buyer, inputs, fidelity, acceptance criteria, and delivery economics before making a larger product commitment."
outcome: "The scaled system ran 29,500 entities at 30 Hz and recovered to 30 Hz after deliberate overload. Its fixed-seed deterministic capture produced 1,800 frames with raw output pinned by SHA-256 inside the same executable, seed, GPU-adapter, and driver scope. Coordinated close, open, and restore waves moved across all 15,000 valves; the shipped video changed 24.3% of label-excluded fleet pixels versus a legacy 1.0% whole-percent comparator. A measured warmed 5.29 MB full JSON state snapshot compared with a 6.8 KB representative warmed binary delta, about 779× smaller, with static layout retained separately."
lessons:
  - "Deterministic seeds make simulation artifacts auditable in a way that live hardware captures cannot be."
  - "Separating domain logic into a no-I/O core crate forces the physics model to be fully unit-testable before any service or UI code depends on it."
  - "Threshold-based artifact validation is more trustworthy than visual inspection alone, but the thresholds need calibration against known-good runs."
recruiterSignificance:
  title: "Why this matters to engineering teams"
  summary: "CryoSim connects practical controls-engineering experience with a deterministic software architecture that makes facility behavior easier to rehearse, inspect, and explain."
  points:
    - label: "Controls experience"
      detail: "Earlier facility simulation in integrated Siemens and Rockwell PLC logic modeled commodity inventories, temperatures, pressures, and other sensor and actuator feedback for sequence, interlock, alarm, and recovery rehearsal."
    - label: "Testable domain core"
      detail: "The no-I/O Rust core keeps state transitions deterministic and directly testable before service or browser code is involved."
    - label: "Measured scale"
      detail: "Generated topology, compact transport, and semantic rendering sustain an operator-readable 29,500-entity demonstration."
    - label: "Evidence boundaries"
      detail: "Offline determinism, live runtime behavior, and future facility integration are reported as separate claims."
evidence:
  label: "Scale simulation proof"
  summary: "Measured scale, real-time recovery, and byte-identical deterministic replay for the 29,500-entity generated plant."
  values:
    - label: "System scale"
      value: "29,500 entities"
      detail: "5,000 tanks, 15,000 valves, 4,500 pipes, and 5,000 sensors share one authoritative state."
    - label: "Real-time runtime"
      value: "30 Hz"
      detail: "300 ticks in a 10-second normal window and 300 more after recovery, with zero drops in both; final measured frame-budget headroom was 94%."
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
redactionStatus: "approved"
redactionReview:
  guidePath: "docs/CONTENT_REDACTION_GUIDE.md"
  reviewer: "operator"
  reviewedOn: "2026-09-02"
  checklistStatus: "complete"
  openItems: []
  notes: "The expanded controls narrative, consulting offer, claim boundaries, and refreshed visual baselines passed public-safety review plus agent and browser inspection on the exact Cloudflare provider preview. Joe authorized production publication in this task on 2026-09-02. This records authorization without claiming he personally inspected the preview. No proprietary employer implementation, private paths, credentials, account identifiers, raw logs, or control-system access details are present."
  checklist:
    secretsRemoved: "yes"
    hostnamesAndAccessPathsGeneralized: "yes"
    userAndAccountNamesGeneralized: "yes"
    screenshotsInspected: "yes"
    logsSummarizedOrSanitized: "yes"
    publicLinksVerified: "not-applicable"
    claimsHaveSafeEvidence: "yes"
    securitySensitiveProceduresRemoved: "yes"
approvalEvidence:
  humanSignoff:
    reviewer: "Joe Poznanski"
    signedOffOn: "2026-09-02"
    decision: "approved"
    notes: "Joe explicitly approved this design and production publication in the task on 2026-09-02. This records authorization and does not claim he personally inspected the preview."
  artifactInspection:
    source: "CryoSim case study at source d38ee966d62e7af595723140305afc64369ccd4e; agent and browser review in this task"
    inspectedOn: "2026-09-02"
    result: "passed"
    notes: "The controls-experience narrative, measured claims, limitation language, consulting offer, desktop and mobile captures, no-JavaScript rendering, accessibility, and public-safety boundary were inspected. No unsupported operational-digital-twin claim, private data, serious or critical accessibility finding, overflow, broken image, or runtime error remained."
  productionOrPreviewEvidence:
    source: "Cloudflare Pages preview https://e8126372.humankaylee-portfolio.pages.dev; deployment e8126372-8d39-4c15-9aec-f2d3904ff9db; source d38ee966d62e7af595723140305afc64369ccd4e"
    capturedOn: "2026-09-02"
    result: "passed"
    notes: "Exact-source provider preview returned HTTP 200 with the expected security headers and passed desktop, mobile, no-JavaScript, content, image, console, overflow, and accessibility inspection. The pages.dev preview returned full-body HTTP 200 to the media range probe, so production custom-domain streaming remains a post-deploy gate."
seo:
  title: "Cryogenic Flow Simulation | Joe Poznanski"
  description: "A deterministic Rust process simulator informed by Siemens and Rockwell controls experience, with measured 29,500-entity evidence."
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
  aria-label="Cryo-flow-sim Stage 1 simulation of valve transients and pressure cascade at 1920x1080 30fps"
>
  <p>
    This browser does not support the HTML video element. The Stage 1 showcase
    is a 1920x1080 at 30fps simulation of cryogenic valve
    transients and pressure cascades across six scenario phases: overview,
    fill start, pipe chilldown, valve travel, tank transfer, and vent recovery.
    The run record includes the source commit, fixed seed, and measured
    threshold results for each state transition.
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

## The controls-engineering throughline

Earlier in my controls career, I built similar facility-simulation behavior
into integrated Siemens and Rockwell PLC logic. Those systems modeled
commodity inventories, temperatures, pressures, and other sensor and actuator feedback
so sequences, interlocks, alarms, and recovery behavior could be exercised
without waiting for every field condition to become available.

CryoSim carries that same modeling discipline into a standalone Rust
architecture. State transitions live in a deterministic no-I/O core, typed
service boundaries carry state to the browser, and a fixed seed makes a run
reproducible. This public case study does not reproduce proprietary employer
implementation or claim validation against a specific operating facility.

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

## Scale, runtime, and transport results

The generated plant holds 5,000 tanks, 15,000 valves, 4,500 pipes, and 5,000
sensors in one authoritative 29,500-entity state. A separately measured live
run recorded 300 ticks in a 10-second normal window and another 300 after
recovery, with zero drops in both windows and 94% final frame-budget headroom.

The deterministic capture advances one simulation tick per frame for 1,800
frames. Replaying the same executable and seed on the same GPU adapter and
driver produced the same raw SHA-256 stream. That scope is deliberate:
compressed video bytes and cross-vendor GPU output are not claimed identical.

At warmed tick 61, the full JSON state snapshot measured 5,293,279 bytes. A
representative incremental binary update from tick 60 to 61 measured 6,798
bytes, about 779 times smaller, with unchanged static layout retained separately.
The two payloads have different transport semantics; the comparison shows why
index-stable deltas matter rather than pretending they are interchangeable.

The visible-change capture altered 109,851 of 451,200 label-excluded fleet
pixels, or 24.3%, compared with a legacy 1.0% whole-percent comparator for the
prior deterministic artifact. The public engineering evidence record pins the
source commits, byte counts, pixel counts, replay hash, and comparison scope.

## Commercial application

The most credible next use is a facility-specific control-sequence rehearsal
engagement. A client would provide sanitized P&IDs, an I/O and equipment list,
cause-and-effect or sequence documentation, and agreed acceptance scenarios. I
would translate that material into a bounded model delivered on a
customer-controlled workstation, then use deterministic scenarios to support
sequence reviews, operator workshops, HMI and alarm discussions, and FAT
evidence.

The current demonstration is not plant-calibrated, connected to PLC or DCS control logic, safety-authoritative, or an operational digital twin.
Those descriptions require named facility data, documented validation, and a
defined control-system or operational connection. The present value is a
testable process-simulation foundation and a disciplined way to turn facility
knowledge into repeatable engineering conversations.

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

## Next engineering gates

Product work should begin with customer discovery and one paid, bounded pilot,
not a generic platform build. The first useful additions would be a versioned
customer-model boundary, reusable scenario and acceptance-result formats,
documented fidelity envelopes, and exportable evidence. Read-only OPC UA or FMI
integration can follow when a pilot proves that the interface is required.

Closed hydraulic networks, two-phase flow, arbitrary-fluid support, live control
writes, safety analysis, and multi-tenant hosting remain outside the current
model. Each requires its own validation method, security boundary, and customer
need before it earns implementation scope.
