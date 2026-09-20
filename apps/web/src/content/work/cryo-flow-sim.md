---
title: "Cryogenic Flow Simulation"
slug: "cryo-flow-sim"
discipline: "simulation"
year: 2026
placement: "flagship"
featuredOrder: 1
lede: "Three instrumented process pages share one Rust clock: liquid nitrogen, liquid argon and pure liquid methane. Switch pages while independent inventories keep moving, then trace leaks, boiling pools, frost and flare flameout from process state to the field view."
problem: "Control sequences are difficult to rehearse when the real facility is unavailable, incomplete, or too costly to place into every fault and boundary condition. The simulator needed reproducible state transitions across valves, tanks, pipes, and instrumentation without depending on live hardware."
stakes: "A simulation that hides its assumptions can create false confidence at the exact conditions where engineering errors are most costly: low temperatures, pressure differentials, actuator timing, alarms, and recovery sequences."
role: "Controls-domain translation informed by Siemens and Rockwell PLC experience, Rust workspace architecture, simulation implementation, capture pipeline, and artifact validation."
constraints:
  - "All behavior must be deterministic from a fixed seed so artifacts are reproducible and auditable."
  - "No live hardware dependency; the simulation must run entirely from a Rust service with a browser-rendered UI."
  - "The capture pipeline must verify its own output with measurable thresholds, not just visual inspection."
  - "The current demonstration is not plant-calibrated, connected to PLC or DCS control logic, safety-authoritative, or an operational digital twin."
  - "Every increment is graded against an exit criterion fixed before the work starts; a milestone that misses a clause is recorded as not verified, never softened to pass."
architecture:
  overview: "The new process plant keeps three independent circuits inside the existing Rust simulation actor. Each vessel stores mass, internal energy and volume; a bounded pure-fluid saturation table determines its pressure, temperature and phase inventory. Valve travel, enthalpy transfer, heat ingress, vapor discharge and spill evaporation change that state. A pushed snapshot feeds the browser SVG/HTML/CSS P&IDs and qualitative canvas field view; page selection changes only the view. Blender-authored equipment and a separate Unreal scene provide a native visual presentation of recorded state. The earlier LOX topology, large generated fleet, fault library, controller and Unreal camera retain their own evidence boundaries."
  diagramAlt: "One Rust simulation clock advances nitrogen, argon and pure methane circuits; snapshots drive instrumented browser pages and recorded Blender and Unreal field effects."
decisions:
  - title: "One clock, independent circuits"
    choice: "Keep all three process circuits in the Rust runtime; selecting a page changes only the visible instruments."
    alternatives:
      - "Run a separate animation or reset the model whenever a page opens."
    tradeoff: "A shared tick makes cross-page behavior reproducible. Separate fluid inventories avoid mixing incompatible commodities, and the bounded new model leaves the historical oxygen and scale contracts intact."
  - title: "Repeatable captures with measured checks"
    choice: "Drive the Stage 1 scenario from a fixed seed and scenario name, then validate OCR, motion, flow, tank, pipe, telemetry, and clamp thresholds after capture."
    alternatives:
      - "Rely on visual inspection alone."
    tradeoff: "Thresholds are more trustworthy than inspection alone but require calibration against known-good runs. The September 2026 program generalized this: every milestone's exit criterion, budgets and negative controls were written before building and graded clause by clause with three verdict states (pass, fail, unmeasurable); several milestones were graded not verified on a first pass and re-graded only after the gap was measured and fixed."
  - title: "Sell a bounded outcome before a platform"
    choice: "Start with a facility-specific control-sequence rehearsal engagement built from approved customer engineering information and acceptance scenarios."
    alternatives:
      - "Build a general simulation platform or multi-tenant SaaS before proving paid customer demand."
    tradeoff: "Manual customer translation limits early software scale, but it tests the buyer, inputs, fidelity, acceptance criteria, and delivery economics before making a larger product commitment."
outcome: "The new circuits run together while the operator changes pages. A nitrogen leak feeds a boiling pool; isolation closes the valve while residual liquid keeps evaporating. Methane pilot loss extinguishes the flare and raises an alarm. Live P&ID footage and an explicitly labeled native replay show those behaviors alongside the project's retained scale and camera evidence."
lessons:
  - "A dramatic effect needs a physical cause: nitrogen and argon do not burn, a boiling spill can leave liquid after isolation, and frost belongs on cold exposed surfaces or failed insulation. The UI and native scene consume process state; their appearance does not validate consequence physics."
  - "Deterministic seeds make simulation artifacts auditable in a way that live hardware captures cannot be."
  - "Separating domain logic into a no-I/O core crate forces the physics model to be fully unit-testable before any service or UI code depends on it."
  - "Threshold-based artifact validation is more trustworthy than visual inspection alone, but the thresholds need calibration against known-good runs."
  - "An instrument can pass a black frame: the first packaged Unreal scene rendered black because a rotator's positional order is (roll, pitch, yaw), and a file-existence check and an orphan count by the wrong process name both graded it a pass. Both instruments were corrected before any verdict, and a still now carries its measured luminance."
  - "A measurement can name the wrong column: a memory gate summed working sets and read a 14-process browser at 1.03 GiB for the page a 7-process browser rendered at 0.63 GiB; the gate moved to private resident bytes with every earlier reading retained and the budget unmoved."
  - "The instrument's browser is not the owner's browser: ten automated runs of the streamed camera passed while the owner's own browser showed no video, because a decoded-frame callback never fires for a background tab. First-frame detection now uses three signals, and a visual is verified in the owner's client before acceptance."
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
      detail: "Offline determinism, live runtime behavior, and future facility integration are reported as separate claims, and the ten September 2026 milestones (control panel and P&ID, fault library, structured import, two commodities, software controller, engineering-practice workflow, browser projection proof and a localhost Unreal Engine camera) each carry a pre-registered budget file, negative controls and a recorded verdict."
evidence:
  label: "Process behavior and retained scale proof"
  summary: "Three concurrent process circuits extend the project; the figures below retain the scope of the earlier measured scale, replay and camera runs."
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
    - label: "Program gate"
      value: "734 tests"
      detail: "The September 2026 program's Rust workspace gate at its last graded commit: 734 tests passed, 6 skipped, none failed; the reference run's final state hash unchanged across every increment."
    - label: "Unreal camera latency"
      value: "109 ms"
      detail: "Glass-to-glass from the adapter applying a seam-vapour cue to the first changed frame in the browser tab, over a localhost WebRTC stream at 1280 by 720 and 30 fps, one viewer (budget 250 ms)."
  scope: "The new process pages are a separate bounded implementation with source-linked properties, mass and energy accounting, targeted fault controls and real-service browser checks. They do not inherit the large-fleet performance result. Generated-scale evidence combines a deterministic offline capture from a fixed seed with a separately measured live real-time run; source commits and measured validation thresholds are recorded. The September 2026 program figures come from its exit-evidence records on a single Windows workstation and one Linux second device; each is a bounded current project claim, not a customer or facility result. In the retained scale capture, coordinated valve waves changed 24.3% of label-excluded fleet pixels versus a legacy 1.0% whole-percent comparator. A 5.29 MB full JSON state snapshot compared with a 6.8 KB representative warmed binary delta, about 779 times smaller, with static layout retained separately."
  limits: "The new three-circuit plant uses a reduced-order, pure-fluid, two-phase equilibrium model over 1.01325 to 8 bar absolute. Interpolated NIST saturation data supports its property calculations; this is not plant calibration. Pure liquid methane is an LNG surrogate, not a composition-resolved LNG model. Dry-out, compressed all-liquid states, freezing, superheated vapor, detailed two-phase pipe flow and explosion consequences are outside this closure. Frost, fog, pool shape and fire appearance are qualitative: not a concentration, release-rate, dispersion or hazard-distance analysis. The native scene video is a recorded-state replay, not a live camera-latency measurement. Historical scale and 109 ms camera results belong to their earlier workloads and revisions. The practice workflow remains an engineering demonstration, not training, qualification or credit. This public page presents static media; it does not expose an interactive plant backend. Simulation-only, with no write-capable path to live plant, launch hardware or safety systems."
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
    src: "/media/cryo-flow-sim-process/process-live.mp4"
    poster: "/media/cryo-flow-sim-process/process-live-poster-1280.webp"
    responsivePosterSources:
      - { src: "/media/cryo-flow-sim-process/process-live-poster-640.webp", width: 640 }
      - { src: "/media/cryo-flow-sim-process/process-live-poster-1280.webp", width: 1280 }
    width: 1920
    height: 1080
    alt: "Live CryoSim process pages switching between nitrogen, argon and methane while independent inventories advance, followed by flare flameout, a cryogenic leak and isolation."
    caption: "Three pages, one advancing Rust clock. This real-service browser capture switches between liquid nitrogen, liquid argon and pure liquid methane without resetting their inventories. Pilot loss removes the methane flare; nitrogen leak injection creates a modeled liquid pool, and isolation leaves residual evaporation. The field inset is an illustrative model view. Mass and energy are accounted in the reduced-order model; this is an engineering demonstration, not plant or consequence validation."
  - kind: "image"
    src: "/media/cryo-flow-sim-process/nitrogen-pid-1920.webp"
    responsiveSources:
      - { src: "/media/cryo-flow-sim-process/nitrogen-pid-640.webp", width: 640 }
      - { src: "/media/cryo-flow-sim-process/nitrogen-pid-1280.webp", width: 1280 }
      - { src: "/media/cryo-flow-sim-process/nitrogen-pid-1920.webp", width: 1920 }
    width: 1920
    height: 1080
    alt: "Liquid nitrogen P&ID with source and receiver vessels, live pressure temperature level and flow readings, transfer controls, leak alarm and a residual boiling pool in the illustrative field view."
    caption: "Nitrogen transfer and leak response. Tagged pressure, temperature, level and flow indications come from the Rust circuit state. A leak removes liquid from the circuit and feeds a boiling pool; the white cloud depicts atmospheric condensation qualitatively. The schematic is synthetic, with passive equipment symbols distinguished from actuated model elements. Nitrogen does not burn."
  - kind: "image"
    src: "/media/cryo-flow-sim-process/argon-pid-1920.webp"
    responsiveSources:
      - { src: "/media/cryo-flow-sim-process/argon-pid-640.webp", width: 640 }
      - { src: "/media/cryo-flow-sim-process/argon-pid-1280.webp", width: 1280 }
      - { src: "/media/cryo-flow-sim-process/argon-pid-1920.webp", width: 1920 }
    width: 1920
    height: 1080
    alt: "Liquid argon gas-supply P&ID showing source and receiver vessels, transfer flow, vaporizer outlet temperature, vent routing and independently advancing level history."
    caption: "Argon gas supply continues while another page is selected. Its tank equilibrium uses argon-specific saturation properties rather than reusing oxygen constants. The finned vaporizer, instrument tags, vent routing and cold-surface frost provide process context; detailed exchanger sizing and gas-dispersion behavior are outside this demonstration."
  - kind: "video"
    src: "/media/cryo-flow-sim-process/process-yard-replay.mp4"
    poster: "/media/cryo-flow-sim-process/process-yard-poster-1280.webp"
    responsivePosterSources:
      - { src: "/media/cryo-flow-sim-process/process-yard-poster-640.webp", width: 640 }
      - { src: "/media/cryo-flow-sim-process/process-yard-poster-1280.webp", width: 1280 }
    width: 1600
    height: 900
    alt: "Native rendered cryogenic yard with instrumented tanks, frost on cold transfer piping, a contained boiling spill and a separate methane flare driven by recorded process states."
    caption: "Recorded-state cinematic of a new repository-authored industrial yard: 180 simulated seconds condensed into ten seconds. Blender models show transfer equipment, containment, cold-surface frost and a spatially separate methane flare; the corresponding Unreal scene represents one captured state using the same equipment and process channels. Pool size, evaporation, frost and flame eligibility follow recorded Rust snapshots. Motion and appearance are qualitative; this is not a live Unreal camera-latency measurement, combustion CFD or an explosion model."
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
  - kind: "image"
    src: "/media/cryo-flow-sim-m10/cryo-field-scene-1920.webp"
    responsiveSources:
      - { src: "/media/cryo-flow-sim-m10/cryo-field-scene-640.webp", width: 640 }
      - { src: "/media/cryo-flow-sim-m10/cryo-field-scene-960.webp", width: 960 }
      - { src: "/media/cryo-flow-sim-m10/cryo-field-scene-1280.webp", width: 1280 }
      - { src: "/media/cryo-flow-sim-m10/cryo-field-scene-1920.webp", width: 1920 }
    width: 1920
    height: 1080
    alt: "Photoreal synthetic Unreal Engine yard from the fixed CCTV-style camera: a white vertical liquid-oxygen storage tank on a concrete pad, a flanged transfer line with a red globe valve and instrument taps, yellow bollards, a chain-link fence and trees, with no vapour at the seam."
    caption: "Fixed CCTV-style camera on the synthetic liquid-oxygen yard with no leak (Unreal Engine 5.8.2, 1920 by 1080). Every object is repository-authored: the tank, flanged transfer line, globe valve, instrument taps, bollards, pad and fence were modelled and baked in Blender and placed by the scene builder; Lumen lights the yard under a CC0 Poly Haven sky. Why it matters: this is the baseline the adapter drives. A cue is only readable against equipment an operator recognises, and the flange at the tank seam is the pinned anchor where the fault library's seam leak is projected. These stills use Unreal(R) Engine. Unreal(R) is a trademark or registered trademark of Epic Games, Inc. in the United States of America and elsewhere. Unreal(R) Engine, Copyright 1998-2026, Epic Games, Inc. All rights reserved. Qualitative visualization only: a symbolic cue at a synthetic seam anchor, not a concentration, release-rate, dispersion or hazard-distance analysis. Simulation-only; no live-equipment writes."
  - kind: "image"
    src: "/media/cryo-flow-sim-m10/cryo-cue-none-1280.webp"
    responsiveSources:
      - { src: "/media/cryo-flow-sim-m10/cryo-cue-none-640.webp", width: 640 }
      - { src: "/media/cryo-flow-sim-m10/cryo-cue-none-960.webp", width: 960 }
      - { src: "/media/cryo-flow-sim-m10/cryo-cue-none-1280.webp", width: 1280 }
    width: 1280
    height: 720
    alt: "The same synthetic yard rendered by the Shipping package before the simulated seam leak activates: the transfer-line flange is clear and there is no vapour."
    caption: "Read-only adapter on the pinned Shipping package (1280 by 720): cue band none. The committed projection sequence has not yet reached the FLT-315 seam leak's activation tick, so the adapter leaves the flange untouched. Why it matters: the adapter cannot invent a cue, it shows only what the projection document says, and this before frame is the control that gives the leak frame its meaning. Qualitative visualization only: a symbolic cue at a synthetic seam anchor, not a concentration, release-rate, dispersion or hazard-distance analysis. Simulation-only; no live-equipment writes."
  - kind: "video"
    src: "/media/cryo-flow-sim-m10/cryo-seam-vapour-leak-big.mp4"
    poster: "/media/cryo-flow-sim-m10/cryo-seam-vapour-leak-big-poster-960.webp"
    responsivePosterSources:
      - { src: "/media/cryo-flow-sim-m10/cryo-seam-vapour-leak-big-poster-640.webp", width: 640 }
      - { src: "/media/cryo-flow-sim-m10/cryo-seam-vapour-leak-big-poster-960.webp", width: 960 }
      - { src: "/media/cryo-flow-sim-m10/cryo-seam-vapour-leak-big-poster-1280.webp", width: 1280 }
      - { src: "/media/cryo-flow-sim-m10/cryo-seam-vapour-leak-big-poster-1920.webp", width: 1920 }
    width: 1920
    height: 1080
    alt: "Video of the synthetic liquid-oxygen yard in which a dense white vapour cloud pours from the transfer-line flange at the tank seam, billows along the pipe and spreads across the pad while the simulated leak is active."
    caption: "Simulated seam leak on the fixed camera (Unreal Engine 5.8.2, 1920 by 1080, 30 frames per second, ten seconds, silent). The view holds with no leak, then the cue appears: a Mantaflow gas simulation of cold vapour in a twelve-metre domain, baked in Blender into a six-direction lit flipbook and lit in the scene by its own sun, so the illustrative cloud billows from the flange and along the transfer line. This earlier clip holds a preview cue and uses an editorial transition; it does not measure ground-level dispersion or a live injected fault. Why it matters: this is cue band medium, the state the adapter switches on at the fault library's activation tick at the pinned seam anchor, and it has to be unmistakable from a camera view. It illustrates where and when, never how much. These frames use Unreal(R) Engine. Unreal(R) is a trademark or registered trademark of Epic Games, Inc. in the United States of America and elsewhere. Unreal(R) Engine, Copyright 1998-2026, Epic Games, Inc. All rights reserved. Qualitative visualization only: a symbolic cue at a synthetic seam anchor, not a concentration, release-rate, dispersion or hazard-distance analysis. Simulation-only; no live-equipment writes."
  - kind: "image"
    src: "/media/cryo-flow-sim-m10/cryo-yard-wide-leak-1920.webp"
    responsiveSources:
      - { src: "/media/cryo-flow-sim-m10/cryo-yard-wide-leak-640.webp", width: 640 }
      - { src: "/media/cryo-flow-sim-m10/cryo-yard-wide-leak-960.webp", width: 960 }
      - { src: "/media/cryo-flow-sim-m10/cryo-yard-wide-leak-1280.webp", width: 1280 }
      - { src: "/media/cryo-flow-sim-m10/cryo-yard-wide-leak-1920.webp", width: 1920 }
    width: 1920
    height: 1080
    alt: "Wide view of the whole synthetic liquid-oxygen yard from a raised inspection camera: the tank, transfer line, vaporizer bank, bollards, signage and fence, with the vapour cloud from the seam leak spreading across the pad."
    caption: "The whole yard from the raised inspection camera while the seam leak is active (Unreal Engine 5.8.2, 1920 by 1080): tank, flanged transfer line, globe valve, ambient vaporizer bank, bollards, hazard sign and fence, all repository-authored, with the vapour cloud rolling away from the flange and along the pad. Why it matters: the fixed CCTV camera is one anchor's view; this frame shows the same cue in the context of the equipment around it, which is how an operator would judge where a cloud is heading. It illustrates where and when, never how much. These stills use Unreal(R) Engine. Unreal(R) is a trademark or registered trademark of Epic Games, Inc. in the United States of America and elsewhere. Unreal(R) Engine, Copyright 1998-2026, Epic Games, Inc. All rights reserved. Qualitative visualization only: a symbolic cue at a synthetic seam anchor, not a concentration, release-rate, dispersion or hazard-distance analysis. Simulation-only; no live-equipment writes."
publicationStatus: "publish"
redactionStatus: "approved"
redactionReview:
  guidePath: "docs/CONTENT_REDACTION_GUIDE.md"
  reviewer: "operator"
  reviewedOn: "2026-09-20"
  checklistStatus: "complete"
  openItems: []
  notes: "The September 20 extension uses repository-authored synthetic equipment, real local-service browser captures and explicitly labeled native replay. Agent inspection found no private paths, hostnames, account identifiers or proprietary employer implementation in visible media or captions. Pure-fluid, saturation-domain, methane-surrogate and qualitative-effect limits are explicit. The current provider preview was inspected on desktop and mobile with both new videos playing."
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
    signedOffOn: "2026-09-20"
    decision: "approved"
    notes: "Joe requested implementation, tests and visual inspection, and instructed: \"Once again, post it to my personal site on the existing project and flesh it out even more.\" This records publication authorization, not a claim that Joe personally inspected the preview."
  artifactInspection:
    source: "CryoSim implementation d902edc4cae9cb9ad4ca62f00bb11c5f7cfd1ad8; independently inspected browser capture, Blender replay and native Unreal scene; process media manifest v1"
    inspectedOn: "2026-09-20"
    result: "passed"
    notes: "All 12 new served media files are hashed. H.264 dimensions and durations were checked; native and browser frames were visually inspected. The portfolio lint, type, 76 unit and 172 passing node-contract checks, build and bundle budget passed; 84 focused browser checks covered media play/seek, manifests, no-JavaScript, reduced motion, mobile overflow and accessibility. Rust workspace checks passed 809 tests with eight existing optional instruments ignored. Historical scale and camera measurements are retained with their original scope."
  productionOrPreviewEvidence:
    source: "Cloudflare Pages preview https://c75d3733.humankaylee-portfolio.pages.dev; source 5148e23bd4536ffd9de0994b3997b20e41b77792 (the follow-up adds inspection metadata and Linux screenshot baselines only; rendered output identical)"
    capturedOn: "2026-09-20"
    result: "passed"
    notes: "The page returned HTTP 200; desktop and 390-pixel mobile inspection found no overflow or browser errors, and both new videos played. All 12 new media files matched their manifest SHA-256. Preview byte-range requests returned 200 for both new and retained media, so preview seeking is not claimed: the strict range/seek check remains a production release check. The existing custom-domain video returned 206. Local browser seek/resume tests and all Lighthouse thresholds passed; CryoSim scored 91 performance and 100 accessibility, best practices and SEO."
seo:
  title: "Cryogenic Flow Simulation | Joe Poznanski"
  description: "Concurrent nitrogen, argon and methane process pages, mass and energy accounting, cryogenic spill and flare visuals, and retained Rust simulation scale evidence."
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
