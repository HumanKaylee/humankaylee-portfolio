---
title: "Goat Bridge: Driving X-Plane from Rust"
slug: "goatbridge"
discipline: "simulation"
year: 2026
placement: "supporting"
featuredOrder: 7
lede: "A Rust bridge turns external flight-state data into observable X-Plane motion, with an operator console and repeatable bench scenarios."
problem: "An external flight model needs a visual world, and the visual simulator needs a trustworthy stream of aircraft state. The integration also needs to return terrain and environment information, show what each link actually observes, and make control ownership explicit."
stakes: "A moving aircraft is only part of the result. Engineers need to distinguish received state from applied state, a live link from an attempted connection, and a synthetic scenario from a physical real-time target."
role: "Joe owns the simulator integration and engineering direction. AI-assisted implementation spans the Rust service, native X-Plane plugin, operator console, repeatable scenarios, and evidence capture. The published recordings document a working engineering bench integration."
constraints:
  - "Keep the external flight model authoritative while applying state through X-Plane's native plugin boundary."
  - "Keep simulator SDK calls on the simulator thread; isolate transport, validation, and operator control from that boundary."
  - "Distinguish software-generated scenario inputs from physical Speedgoat hardware. The supplied demonstrations use synthetic inputs with a real X-Plane instance."
  - "Keep orbit and takeoff as separate scenarios. A validated continuous transition between them is not demonstrated."
architecture:
  overview: "A Rust service receives flight-state datagrams, validates them, and forwards state to an X-Plane plugin. A thin C++ shim reaches the simulator SDK, while Rust handles the plugin logic. Simulator readback and terrain results return through the service; a separate desktop console observes the service and requests control."
  diagramAlt: "Flight-state source to Rust service to native X-Plane plugin to simulator. Readback, terrain, and environment data travel back through the service. A separate operator console observes status and submits commands. Synthetic validator modes replace the hardware source for the recorded bench scenarios."
decisions:
  - title: "Keep the simulator boundary small"
    choice: "Use a thin native shim for SDK access, with Rust owning the service and plugin behavior and thread-affinity guards constraining SDK calls."
    alternatives:
      - "Let the plugin own the inbound socket while a separate application monitors it."
    tradeoff: "Separate components require explicit protocols and lifecycle handling, but keep blocking work away from the simulator's main thread."
  - title: "Measure what the simulator applied"
    choice: "Return plugin readback and observed link state to the console, alongside counters and source provenance."
    alternatives:
      - "Treat a successful send or a connected socket as proof that the aircraft state was applied."
    tradeoff: "More telemetry needs careful interpretation: a sent return packet is not proof of hardware receipt, and an inactive check is not a passing check."
  - title: "Make bench scenarios repeatable"
    choice: "Provide distinct orbit, takeoff, and approach generators so the real service and simulator path can be exercised before hardware integration."
    alternatives:
      - "Require the physical real-time target for every iteration."
    tradeoff: "Software-generated inputs shorten the feedback cycle, but cannot qualify the physical target, deployment, or release behavior."
outcome: "Bench recordings show the bridge driving real X-Plane motion and reporting simulator readback. Physical Speedgoat integration and release qualification remain open."
lessons:
  - "A status indicator needs a defined observation behind it. Connection attempts, transmitted packets, received packets, and applied state answer different questions."
  - "Test generators are valuable only when their synthetic origin stays visible and their results are not presented as hardware validation."
  - "Recording cadence is not information rate: the four-view mosaic holds cached images between updates, even though its video container plays at five frames per second."
recruiterSignificance:
  title: "Making integration behavior inspectable"
  summary: "This work connects systems programming, simulator APIs, operator experience, and evidence-driven debugging across a real application boundary."
  points:
    - label: "Systems integration"
      detail: "Rust services, native SDK access, structured messages, and a desktop console cooperate around one explicit state boundary."
    - label: "Operator visibility"
      detail: "The console exposes link state, traffic, readback, and control ownership so an engineer can investigate what happened."
    - label: "Verification judgment"
      detail: "The case study separates visible simulator behavior from hardware integration and release claims the evidence does not establish."
evidence:
  label: "Recorded simulator bench integration"
  summary: "Separate orbit and takeoff recordings pair real X-Plane motion with a running bridge console and four remote simulator views. The input trajectories are software-generated."
  values:
    - label: "Recorded scenarios"
      value: "2"
      detail: "Orbit climb and takeoff roll, each retained as its own approximately one-minute capture."
    - label: "Observation surfaces"
      value: "3"
      detail: "Bridge console, simulator cockpit, and four-view mosaic recorded during the same scenario window."
    - label: "Remote views"
      value: "4"
      detail: "Cached simulator snapshots; about one new image every six seconds, not five independent images per second."
  scope: "September 2026 source and capture package. Real service-to-plugin operation and visible X-Plane response under synthetic scenario input. Public clips retain source timing, remove audio, and crop or mask private diagnostic details. The recordings are evidence of those bench sessions, not a new hardware run."
  limits: "No physical Speedgoat validation, certified flight model, production-ready release, or end-to-end latency guarantee is claimed. Capture starts were loosely aligned, not frame-synchronized. The mosaic encodes repeated cached snapshots. The package also records link re-establishment and a takeoff autonomy release; continuous fault-free operation and a seamless takeoff-to-orbit transition are not established."
media:
  kind: "video"
  src: "/media/goatbridge/orbit-flight.mp4"
  poster: "/media/goatbridge/orbit-flight-poster.webp"
  responsivePosterSources:
    - { src: "/media/goatbridge/orbit-flight-640.webp", width: 640 }
    - { src: "/media/goatbridge/orbit-flight-960.webp", width: 960 }
    - { src: "/media/goatbridge/orbit-flight-1440.webp", width: 1120 }
  width: 1120
  height: 630
  alt: "X-Plane cockpit and landscape banking through the bridge's software-generated orbit scenario."
  caption: "Orbit climb in a real X-Plane instance, driven by a synthetic bridge scenario. The cockpit view is cropped to exclude private diagnostic logs; original timing is retained."
  loop:
    src: "/media/goatbridge/orbit-loop.mp4"
    poster: "/media/goatbridge/orbit-loop-poster.webp"
    responsivePosterSources:
      - { src: "/media/goatbridge/orbit-loop-640.webp", width: 640 }
      - { src: "/media/goatbridge/orbit-loop-960.webp", width: 960 }
    width: 960
    height: 540
    durationSeconds: 10
    sizeBytes: 610490
    alt: "Cropped X-Plane cockpit view banking over terrain during Goat Bridge's synthetic orbit scenario."
    description: "A silent ten-second excerpt of the recorded orbit scenario. Real X-Plane imagery, software-generated flight-state input."
evidenceMedia:
  - kind: "video"
    src: "/media/goatbridge/orbit-console.mp4"
    poster: "/media/goatbridge/orbit-console-poster.webp"
    responsivePosterSources:
      - { src: "/media/goatbridge/orbit-console-640.webp", width: 640 }
    width: 816
    height: 458
    alt: "Cropped bridge console showing service traffic, plugin readback, and simulator status during the orbit scenario."
    caption: "Orbit console detail from the same capture window as the hero video. This crop focuses on the service, plugin, and simulator links; the input is synthetic. Players run independently."
  - kind: "video"
    src: "/media/goatbridge/orbit-views.mp4"
    poster: "/media/goatbridge/orbit-views-poster.webp"
    responsivePosterSources:
      - { src: "/media/goatbridge/orbit-views-640.webp", width: 640 }
      - { src: "/media/goatbridge/orbit-views-960.webp", width: 960 }
      - { src: "/media/goatbridge/orbit-views-1440.webp", width: 1440 }
    width: 1920
    height: 1080
    alt: "Four remote X-Plane views during the orbit scenario, holding cached images between updates."
    caption: "Four views of the orbit. The source provides roughly one fresh snapshot every six seconds; held frames and black bars are preserved. Machine labels and diagnostic overlays are masked."
  - kind: "video"
    src: "/media/goatbridge/takeoff-flight.mp4"
    poster: "/media/goatbridge/takeoff-flight-poster.webp"
    responsivePosterSources:
      - { src: "/media/goatbridge/takeoff-flight-640.webp", width: 640 }
      - { src: "/media/goatbridge/takeoff-flight-960.webp", width: 960 }
      - { src: "/media/goatbridge/takeoff-flight-1440.webp", width: 1120 }
    width: 1120
    height: 630
    alt: "X-Plane cockpit view looking along the runway during the bridge's synthetic takeoff-roll scenario."
    caption: "Takeoff roll is a separate recorded scenario, not the beginning of the orbit video. Cropping removes the diagnostic log window without changing playback speed."
  - kind: "video"
    src: "/media/goatbridge/takeoff-console.mp4"
    poster: "/media/goatbridge/takeoff-console-poster.webp"
    responsivePosterSources:
      - { src: "/media/goatbridge/takeoff-console-640.webp", width: 640 }
    width: 816
    height: 458
    alt: "Bridge console link and readback detail during the separate takeoff-roll capture."
    caption: "Takeoff console detail. Traffic and readback describe this recorded session; they do not establish physical target integration or fault-free release behavior."
  - kind: "video"
    src: "/media/goatbridge/takeoff-views.mp4"
    poster: "/media/goatbridge/takeoff-views-poster.webp"
    responsivePosterSources:
      - { src: "/media/goatbridge/takeoff-views-640.webp", width: 640 }
      - { src: "/media/goatbridge/takeoff-views-960.webp", width: 960 }
      - { src: "/media/goatbridge/takeoff-views-1440.webp", width: 1440 }
    width: 1920
    height: 1080
    alt: "Four cached simulator views showing the runway takeoff scenario."
    caption: "Four takeoff views with the original low snapshot refresh preserved. The five-fps encode repeats images between updates; it is not a measure of simulator frame rate."
  - kind: "image"
    src: "/media/goatbridge/console-idle.png"
    responsiveSources:
      - { src: "/media/goatbridge/console-idle.webp", width: 1920 }
    width: 1920
    height: 1080
    alt: "Full Goat Bridge console with control ownership, link status, telemetry charts, and diagnostic flags while the bridge is idle."
    caption: "The full operator interface before a run. This original screenshot is IDLE, not a live-traffic claim; the adjacent recordings show the bridge running. Open the full-size image to inspect the console."
publicationStatus: "publish"
redactionStatus: "approved"
redactionReview:
  guidePath: "docs/CONTENT_REDACTION_GUIDE.md"
  reviewer: "Codex"
  reviewedOn: "2026-09-20"
  checklistStatus: "complete"
  openItems: []
  notes: "Joe authorized retrieving the Goatbridge package and creating and publishing a case study on his personal site in this task. This is publication authorization, not a claim that he personally inspected a preview. Private source, operational logs, access details, and original capture configuration stay outside the public site."
  checklist:
    secretsRemoved: "yes"
    hostnamesAndAccessPathsGeneralized: "yes"
    userAndAccountNamesGeneralized: "yes"
    screenshotsInspected: "yes"
    logsSummarizedOrSanitized: "yes"
    publicLinksVerified: "yes"
    claimsHaveSafeEvidence: "yes"
    securitySensitiveProceduresRemoved: "yes"
approvalEvidence:
  humanSignoff:
    reviewer: "Joe Poznanski"
    signedOffOn: "2026-09-20"
    decision: "approved"
    notes: "Joe explicitly authorized transferring the prepared Goatbridge package and creating and publishing its case study on joepoznanski.io in this task. This records publication authorization, not personal inspection of the preview."
  artifactInspection:
    source: "Goat Bridge content and media at portfolio source d2537bd250e07ad8bc101158e297a6bd03584465; supplied source revision 3bfa79ffaf2083628f417424fca63e7b2a333ab6"
    inspectedOn: "2026-09-20"
    result: "passed"
    notes: "Source-backed copy, sampled derivative frames, all posters, original IDLE screenshot, and desktop/mobile layouts were inspected. Six clips plus the homepage loop fully decoded; private diagnostic regions are cropped or masked. Local playback, seeking, no-JavaScript, reduced-motion, responsive and accessibility gates passed. No serious or critical Axe finding; the shared recruiter aside retains a moderate landmark advisory. Windows and Linux visual suites each passed 30 checks."
  productionOrPreviewEvidence:
    source: "Cloudflare Pages preview https://e331377e.humankaylee-portfolio.pages.dev; portfolio source d2537bd250e07ad8bc101158e297a6bd03584465"
    capturedOn: "2026-09-20"
    result: "passed"
    notes: "Hosted home, Work, case-study and sitemap routes returned 200 with the new entry. All 37 public media files matched local SHA256 hashes. Six case-study clips played; desktop/mobile browser inspection found no broken images, horizontal overflow or console errors. The pages.dev host returned 200 for range requests, so preview playback does not establish production seeking. Custom-domain byte-range and seek/resume checks remain required after deployment. Hardware integration and release qualification remain explicitly unverified."
seo:
  title: "Goat Bridge: Rust and X-Plane Integration | Joe Poznanski"
  description: "A Rust service, native simulator plugin, and operator console connect flight-state data to X-Plane. Explore real bench captures and explicit hardware-validation limits."
  canonicalPath: "/work/goatbridge/"
  ogImage: "/social/goatbridge.png"
---
