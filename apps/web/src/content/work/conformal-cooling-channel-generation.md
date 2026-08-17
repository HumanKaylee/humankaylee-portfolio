---
title: "Conformal Cooling Channel Generation"
slug: "conformal-cooling-channel-generation"
discipline: "simulation"
year: 2026
placement: "flagship"
featuredOrder: 2
lede: "ConformalFlow is an engineering prototype that converts injection-mold cavity geometry into conformal cooling-channel designs for additive manufacturing. It combines parameterized routing, split-mold generation, ports, and manufacturing checks for clearance, continuity, overhangs, powder removal, and flow through a React and Three.js interface backed by a Python geometry and validation engine."
problem: "Cooling paths inside an injection mold need to follow part geometry closely enough to be useful while remaining inspectable as geometry, bounded by manufacturing-oriented checks, and exportable for downstream engineering work."
stakes: "A visually plausible path is not enough: disconnected channels, poor wall clearance, unsupported overhangs, trapped powder, or ambiguous mold interfaces can turn an attractive rendering into unusable geometry."
role: "Prototype architecture, Python geometry and validation engine, React and Three.js workflow, deterministic evidence capture, and public-safe case-study verification."
constraints:
  - "The public portfolio cannot expose a live geometry backend, so the proof must remain useful as captured static media."
  - "Every published artifact must trace to a clean source commit and a real completed browser-driven job."
  - "The UI/API export path and the repository's separate split-mold generator must remain clearly distinguished."
architecture:
  overview: "A React and Three.js client uploads cavity geometry to a FastAPI service, follows generation progress over WebSockets, and exposes completed STL and 3MF exports; a separate Python command generates and validates split mold halves for the same parameterized gear family."
  diagramAlt: "A browser uploads deterministic gear geometry to a Python API, receives generation progress, and downloads channel exports, while a separate generator produces validated split mold halves and ports."
decisions:
  - title: "Original synthetic gear geometry"
    choice: "Generate a deterministic first-party gear cavity so the input, source hash, and resulting evidence can be reproduced without third-party geometry."
    alternatives:
      - "Use an untraceable sample model or customer geometry."
    tradeoff: "The synthetic part is intentionally simple, but its provenance and repeatability are explicit."
  - title: "Manufacturing-aware generation and validation"
    choice: "Treat channels as engineering geometry with clearance, continuity, overhang, powder-removal, and flow checks rather than as decorative path rendering."
    alternatives:
      - "Render attractive centerlines without export or validation boundaries."
    tradeoff: "The pipeline carries more geometric and validation complexity, while the resulting artifacts remain inspectable and exportable."
  - title: "Captured static proof"
    choice: "Publish optimized video and responsive stills from a real local run instead of exposing the prototype backend."
    alternatives:
      - "Host a public geometry-generation service."
    tradeoff: "Visitors cannot submit arbitrary parts, but the portfolio remains fast, secure, and auditable against fixed evidence."
outcome: "The alpha prototype completed a fresh browser-driven gear-cavity job, produced four UI/API export artifacts, and separately generated two watertight split-mold halves with a passing repository validation report and two recorded volume warnings."
lessons:
  - "Geometry evidence is strongest when the input, running state, output meshes, and validation boundary are all preserved together."
  - "Separate generator paths need separate provenance; visual similarity is not evidence that two artifacts came from the same workflow."
  - "A public case study can show a private engineering prototype honestly without operating a public compute service."
evidence:
  label: "Fresh gear-cavity capture"
  summary: "A real browser-driven UI/API job completed in 1.1 seconds with 20 channel segments and four hashed exports; the separate split-mold command produced two watertight mold halves and a PASS report with two retained volume warnings."
  values:
    - label: "UI/API job"
      value: "Completed"
      detail: "The normal file-input, WebSocket progress, generation, and export path completed against source commit 5514afad8321812037c556d6e21b6c2559851a8d."
    - label: "Channel result"
      value: "20 segments"
      detail: "The accepted job reported 1,337.7 mm total channel length using the straight-grid strategy."
    - label: "UI/API exports"
      value: "4 files"
      detail: "channels.stl, channels.3mf, cavity.stl, and channels_only.stl were present, nonempty, and hashed."
    - label: "Split molds"
      value: "2 watertight halves"
      detail: "The separate gear mold generator passed validation while retaining two warnings that both mold volumes seemed too large."
  scope: "UI/API evidence comes from clean source commit 5514afad8321812037c556d6e21b6c2559851a8d. Geometry figures were rendered by commit 2926936a8a5104d6724ef6a00b3f0cfbffb23d21. The split-mold/ports figure comes from a separate repository generator for the same gear family, not from the UI/API exports."
  limits: "This capture did not establish thermal performance, hydraulic performance, cycle-time improvement, shop-floor manufacturability, or physical prototype behavior. The full repository baseline retained five known test failures plus existing Ruff and MyPy debt; the focused capture and renderer checks passed."
media:
  kind: "video"
  src: "/media/conformal-cooling/conformal-workflow.mp4"
  poster: "/media/conformal-cooling/conformal-workflow-poster-1440.webp"
  responsivePosterSources:
    - src: "/media/conformal-cooling/conformal-workflow-poster-640.webp"
      width: 640
    - src: "/media/conformal-cooling/conformal-workflow-poster-960.webp"
      width: 960
    - src: "/media/conformal-cooling/conformal-workflow-poster-1440.webp"
      width: 1440
  width: 1536
  height: 864
  alt: "Conformal cooling workflow progressing from a deterministic gear cavity to generated channels, split mold halves, and completed exports."
  caption: "A 31-second chronology assembled from the accepted gear-cavity capture and its generated evidence figures."
  loop:
    src: "/media/conformal-cooling/conformal-workflow-loop.mp4"
    poster: "/media/conformal-cooling/conformal-workflow-loop-poster-960.webp"
    width: 960
    height: 540
    durationSeconds: 10
    sizeBytes: 143702
    alt: "A short sequence showing the input gear, generated channels, separated mold halves, and completed ConformalFlow UI."
    description: "A silent ten-second loop moves from the deterministic gear input through channel and split-mold evidence to the completed application state."
evidenceMedia:
  - kind: "image"
    src: "/media/conformal-cooling/conformal-input-gear-1440.webp"
    responsiveSources:
      - src: "/media/conformal-cooling/conformal-input-gear-640.webp"
        width: 640
      - src: "/media/conformal-cooling/conformal-input-gear-960.webp"
        width: 960
      - src: "/media/conformal-cooling/conformal-input-gear-1440.webp"
        width: 1440
    width: 1440
    height: 810
    alt: "Neutral rendering of the deterministic gear-shaped cavity used for the accepted capture."
    caption: "First-party deterministic cavity loaded through the normal UI file input."
  - kind: "image"
    src: "/media/conformal-cooling/conformal-cavity-channels-1440.webp"
    responsiveSources:
      - src: "/media/conformal-cooling/conformal-cavity-channels-640.webp"
        width: 640
      - src: "/media/conformal-cooling/conformal-cavity-channels-960.webp"
        width: 960
      - src: "/media/conformal-cooling/conformal-cavity-channels-1440.webp"
        width: 1440
    width: 1440
    height: 810
    alt: "Cyan generated cooling channels surrounding a translucent orange gear cavity."
    caption: "Completed UI/API job overlay; the manifest records a completed job and four nonempty exports without claiming physical performance."
  - kind: "image"
    src: "/media/conformal-cooling/conformal-split-mold-ports-1440.webp"
    responsiveSources:
      - src: "/media/conformal-cooling/conformal-split-mold-ports-640.webp"
        width: 640
      - src: "/media/conformal-cooling/conformal-split-mold-ports-960.webp"
        width: 960
      - src: "/media/conformal-cooling/conformal-split-mold-ports-1440.webp"
        width: 1440
    width: 1440
    height: 810
    alt: "Separated orange and blue mold halves with internal channel geometry and visible port features."
    caption: "Generated by the repository's separate split-mold command for the same gear family, not by the UI/API export job."
  - kind: "image"
    src: "/media/conformal-cooling/conformal-validation-export-1440.webp"
    responsiveSources:
      - src: "/media/conformal-cooling/conformal-validation-export-640.webp"
        width: 640
      - src: "/media/conformal-cooling/conformal-validation-export-960.webp"
        width: 960
      - src: "/media/conformal-cooling/conformal-validation-export-1440.webp"
        width: 1440
    width: 1440
    height: 810
    alt: "Completed ConformalFlow application showing the gear input, generated channels, progress stages, and export console."
    caption: "Completed real UI state with the exact UI-job exports: channels.stl, channels.3mf, cavity.stl, and channels_only.stl."
publicationStatus: "publish"
redactionStatus: "reviewed"
redactionReview:
  guidePath: "docs/CONTENT_REDACTION_GUIDE.md"
  reviewer: "operator"
  reviewedOn: "2026-08-17"
  checklistStatus: "complete"
  openItems: []
  notes: "Only sanitized media and a public manifest are included. Raw captures, local paths, generated CAD exports, and environment details remain outside the portfolio repository."
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
  title: "Conformal Cooling Channel Generation | Joe Poznanski"
  description: "An evidence-backed engineering prototype for generating and validating conformal cooling channels and split injection molds."
  canonicalPath: "/work/conformal-cooling-channel-generation/"
  ogImage: "/social/default.png"
---

## From cavity geometry to inspectable cooling paths

ConformalFlow is an alpha engineering prototype for turning injection-mold
cavity geometry into cooling-channel designs that can be inspected, validated,
and exported. The central problem was not drawing tubes around a part. It was
maintaining an explicit engineering boundary between input geometry,
parameterized routing, validation, mold construction, and the artifacts a user
can actually download.

The accepted evidence run starts with a deterministic gear-shaped cavity built
inside the repository. A browser loads that STL through the normal file input,
submits the selected wall thickness, channel diameter, and spacing, follows the
job through its WebSocket progress states, and reaches the real completed UI.
The result directory contains four nonempty UI/API exports whose hashes are
recorded in the public capture manifest.

## System shape

The browser is a React and Three.js client. It previews the cavity and result,
collects generation parameters, and presents progress and export controls. A
FastAPI service owns upload, job state, WebSocket updates, the Python geometry
pipeline, and the STL and 3MF result files.

```text
deterministic gear STL
  -> React and Three.js file-input workflow
  -> FastAPI job and WebSocket progress
  -> Python channel generation and validation
  -> STL and 3MF UI/API exports

same parameterized gear family
  -> separate split-mold generator
  -> top and bottom mold STL files
  -> repository validation report
```

That second path matters. The split mold and port figure was generated by the
repository's dedicated mold command. It is related evidence for the same gear
family, but it is not presented as an output of the browser job.

## What the accepted run established

The fresh UI/API job reached `completed` status in 1.1 seconds and reported 20
channel segments with 1,337.7 mm total channel length. It produced
`channels.stl`, `channels.3mf`, `cavity.stl`, and `channels_only.stl`; every file
was nonempty and hashed before publication media was derived.

The separate split-mold command produced watertight top and bottom mold meshes.
Its validation report returned PASS and also retained two warnings that the mold
volumes seemed too large. Those warnings are part of the evidence rather than
being hidden to make the result look cleaner.

The source-wide verification baseline is also reported without smoothing it
over: 1,056 tests passed, six skipped, and five known tests failed; the existing
Ruff and MyPy debt remained. The focused capture and renderer tests passed. That
is enough to establish the captured prototype workflow, not to claim that the
entire source repository was green.

## Evidence boundary

The UI/API exports and progress capture trace to clean source commit
`5514afad8321812037c556d6e21b6c2559851a8d`. The deterministic evidence renderer
traces to `2926936a8a5104d6724ef6a00b3f0cfbffb23d21`. The public portfolio contains
only the sanitized manifest, optimized MP4 files, and responsive WebP images;
raw recordings, CAD exports, local paths, and environment details stay outside
the site repository.

This capture did not establish thermal or hydraulic performance, cycle-time
improvement, shop-floor manufacturability, or physical prototype behavior.
Those require simulation or physical validation beyond this evidence run.

## What I would do next

The next engineering step would be to pair the geometry checks with quantified
thermal and pressure-drop analysis, then compare the generated design against a
physical mold and measured cycle data. I would also resolve the five retained
baseline failures and the two split-mold volume warnings before widening the
prototype's validation claims.
