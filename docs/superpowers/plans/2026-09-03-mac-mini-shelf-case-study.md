# Mac mini Shelf Case Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish an evidence-bounded Mac mini wall-shelf case study and homepage entry that explain the Agentic AI CAD, FEM, visual-inspection, and manufacturing-preparation workflow, with physical media included only when completed-print provenance is proven.

**Architecture:** Add one normal `work` collection record plus one slug-specific Astro process component, following the existing OpenXHC pattern. Keep the generic Work schema unchanged, commit authentic PNG sources with deterministic FFmpeg WebP derivatives, extend the existing social-card generator, and update only the route/count/browser contracts that enumerate published Work. Treat K1C time-lapse and Joe-supplied photographs as a separate evidence lane that cannot weaken the digital-versus-physical boundary.

**Tech Stack:** Astro 7, TypeScript 5.9, Zod content collections, Vitest, Node test runner, Playwright 1.60, Axe, FFmpeg, Cloudflare Pages, GitHub Actions, Rust/Axum verification.

**Spec:** `docs/superpowers/specs/2026-09-02-mac-mini-shelf-case-study-design.md`

## Global Constraints

- Work only in the isolated worktree `C:\Users\joepo\Documents\Codex\2026-09-02\i-want-to-add-the-mac\work\portfolio-mac-mini-shelf-20260902`; preserve the dirty legacy checkout.
- Joe supplied the objective and constraints; Agentic AI performed the recovered digital toolchain work. Copy must preserve both halves of that responsibility boundary.
- Public status begins as: `Digitally validated prototype and manufacturing package. Physical print, installation, and load testing were not verified in the recovered evidence.`
- Do not claim a successful print from elapsed time, `printProgress`, or an active-printer image. Require a matching completed history record and full-resolution finished-part inspection.
- Use the governing sustained front-edge case: `0.064 mm`, `1.42 MPa`, and `3.5x` against the selected `5 MPa` PLA creep ceiling.
- The `4x` front-edge case (`0.255 mm`, `5.69 MPa`) is transient analysis evidence, not a recommended service load.
- Publish no STL, STEP, FCStd, G-code, raw FEM input, transcript, session identifier, absolute local path, private hostname, account identifier, printer address, or credential material.
- Do not add a package dependency. Use the repository's existing FFmpeg-based media path.
- Keep the site static-first, complete without JavaScript, reduced-motion safe, keyboard/touch accessible, and free of horizontal overflow at 390, 820, and 1440 pixels.
- Keep `redactionStatus: "reviewed"` until exact-source CI, provider preview, full media inspection, browser checks, and structured approval evidence exist.
- Joe authorized production publication in this task. Record that authorization without claiming that he personally inspected a preview.
- Retain and behaviorally verify the previous production deployment before changing production.
- Do not close or redefine the repository's unrelated API, contact, or historical launch issues.

## File Map

### New files

- `apps/web/src/content/work/mac-mini-shelf.md` — public case-study record, copy, media declarations, bounded evidence, and release metadata.
- `apps/web/src/components/MacMiniShelfProcess.astro` — Agentic AI loop, assumption register, FEM matrix, and visual-inspection explanation for this slug only.
- `scripts/build-mac-mini-shelf-media.mjs` — deterministic 640/960/1440 WebP generation from committed authentic PNGs.
- `scripts/mac-mini-shelf-media-contract.test.mjs` — source hashes, dimensions, derivative inventory, public-copy boundary, and generator contract.
- `apps/web/public/media/mac-mini-shelf/*.png` — eight authentic FreeCAD/CalculiX sources.
- `apps/web/public/media/mac-mini-shelf/*-{640,960,1440}.webp` — responsive derivatives.
- `apps/web/public/social/mac-mini-shelf.png` — deterministic 1200 by 630 social card.
- `tests/e2e/visual-regression.spec.ts-snapshots/work-mac-mini-shelf-{desktop,mobile}-{win32,linux}.png` — intentional route baselines generated on their owning platforms.

### Modified files

- `docs/superpowers/specs/2026-09-02-mac-mini-shelf-case-study-design.md` — record the verified FFmpeg path and physical-media gate.
- `apps/web/src/content/work/black-scholes-wasm.md` — move `featuredOrder` from 5 to 6.
- `apps/web/src/content/work/cli-fleet-synchronization-and-mcp-rollout.md` — move `featuredOrder` from 6 to 7.
- `apps/web/src/content/work/remote-workstation-recovery-and-operational-debugging.md` — move `featuredOrder` from 7 to 8.
- `apps/web/src/pages/work/index.astro` — require and describe four supporting studies.
- `apps/web/src/pages/work/[slug].astro` — render `MacMiniShelfProcess` only for `mac-mini-shelf`.
- `apps/web/src/components/ProofGallery.astro` — extend focused-study summary to Agentic AI physical-product engineering.
- `scripts/work-content-contract.test.mjs` — enumerate eight Work entries, four supporting records, and the shelf assets.
- `scripts/generate-social-preview-assets.mjs` — add the `mac-mini-shelf` project definition and filter.
- `scripts/social-preview-assets-contract.test.mjs` — prove the shelf social card is authentic, valid, and deterministic.
- `tests/e2e/work-routes.spec.ts` — update hierarchy/order/next links and add shelf-specific boundaries.
- `tests/e2e/quality-gates.spec.ts` — add the shelf route to no-JS, reduced-motion, Axe, and private-content coverage.
- `tests/e2e/responsive-cross-browser.spec.ts` — add the shelf route and change homepage proof count from 5 to 6.
- `tests/e2e/visual-regression.spec.ts` — add the shelf route.
- Other route-inventory tests only if their current explicit arrays fail after the new static route is built.

### Conditional physical-media files

Create these only if the evidence gate in Task 7 passes:

- `apps/web/public/media/mac-mini-shelf/physical/finished-shelf.png`
- `apps/web/public/media/mac-mini-shelf/physical/finished-shelf-{640,960,1440}.webp`
- `apps/web/public/media/mac-mini-shelf/physical/k1c-timelapse.mp4`
- `apps/web/public/media/mac-mini-shelf/physical/k1c-timelapse-poster-{640,960,1440}.webp`

If a source does not pass, omit its entire content declaration and public-file set. An omitted lane is correct behavior, not unfinished code.

---

### Task 1: Lock the authentic CAD and FEM media chain

**Files:**
- Create: `scripts/mac-mini-shelf-media-contract.test.mjs`
- Create: `scripts/build-mac-mini-shelf-media.mjs`
- Create: `apps/web/public/media/mac-mini-shelf/shelf-fit.png`
- Create: `apps/web/public/media/mac-mini-shelf/full-stack.png`
- Create: `apps/web/public/media/mac-mini-shelf/print-orientation.png`
- Create: `apps/web/public/media/mac-mini-shelf/fem-constraints.png`
- Create: `apps/web/public/media/mac-mini-shelf/fem-mesh-underside.png`
- Create: `apps/web/public/media/mac-mini-shelf/fem-vonmises-underside.png`
- Create: `apps/web/public/media/mac-mini-shelf/fem-displacement.png`
- Create: `apps/web/public/media/mac-mini-shelf/fem-deformed.png`
- Create: 24 responsive WebP files in the same directory.

**Interfaces:**
- Consumes: the eight named source PNGs from the retained Mac mini shelf `out` directory.
- Produces: public paths rooted at `/media/mac-mini-shelf/`, exact source SHA-256 checks, and responsive WebP names consumed by `mac-mini-shelf.md`.

- [ ] **Step 1: Write the failing source-and-derivative contract**

Create `scripts/mac-mini-shelf-media-contract.test.mjs` with these exact source records:

```js
const originals = {
  "shelf-fit.png": {
    width: 1400,
    height: 1000,
    sha256: "76bb0b95d28d67379590d89c1553378e1283d0441b8445ea478478b42f103c75",
  },
  "full-stack.png": {
    width: 1400,
    height: 1000,
    sha256: "9ce3c8af0dd56cfc7bd781df2998876840b9e5dcff9588549abdfa5c7b96bed2",
  },
  "print-orientation.png": {
    width: 1400,
    height: 1000,
    sha256: "50b5b53643330e3466e1b321f4cb67f84245f9215f6fac45d29b9d4f660670ef",
  },
  "fem-constraints.png": {
    width: 1400,
    height: 950,
    sha256: "329469f133d6f3110be40ded32e16f82059ecb79b541cd64b618c7d0b5a40eff",
  },
  "fem-mesh-underside.png": {
    width: 1400,
    height: 950,
    sha256: "f1fbae01a10ca54d918fb6c9fe5f1e210e4c37709dbbf0bb54c0097425697ccb",
  },
  "fem-vonmises-underside.png": {
    width: 1400,
    height: 950,
    sha256: "4d8291de996585b847e67c6c03b91c623ef2621ffe10cc1b9d094924af09f62a",
  },
  "fem-displacement.png": {
    width: 1400,
    height: 950,
    sha256: "f9c5cd2e033c7ab74527da11b6e85b661cbb8bbc51f4c5acaa8d330baf3e9478",
  },
  "fem-deformed.png": {
    width: 1400,
    height: 950,
    sha256: "27dca48ea546d00be0ffc0d575ef2b33c43bd88e32afe4b58064141eea52ea4d",
  },
};
const responsiveWidths = [640, 960, 1440];
```

Use `node:crypto` for hashes, read PNG IHDR bytes for dimensions, invoke `ffprobe` for WebP dimensions, and assert every derivative exists with its encoded width. Also assert that `scripts/build-mac-mini-shelf-media.mjs` contains all eight original names and all three widths.

- [ ] **Step 2: Run the new test and observe the missing-media failure**

Run:

```powershell
node --test scripts/mac-mini-shelf-media-contract.test.mjs
```

Expected: FAIL because the public directory, originals, and generator do not exist.

- [ ] **Step 3: Copy the eight immutable source images under public-safe names**

Use `Copy-Item -LiteralPath` for binary copies, one explicit source/destination pair at a time. Do not bulk-copy the source directory.

```powershell
$sourceRoot = 'C:\Users\joepo\cnc-cam-tools\projects\macmini-shelf\out'
$publicRoot = 'apps/web/public/media/mac-mini-shelf'
New-Item -ItemType Directory -Path $publicRoot -Force | Out-Null
Copy-Item -LiteralPath "$sourceRoot\05-with-macmini.png" -Destination "$publicRoot\shelf-fit.png"
Copy-Item -LiteralPath "$sourceRoot\07-full-stack.png" -Destination "$publicRoot\full-stack.png"
Copy-Item -LiteralPath "$sourceRoot\08-print-orientation.png" -Destination "$publicRoot\print-orientation.png"
Copy-Item -LiteralPath "$sourceRoot\fem-2-constraints.png" -Destination "$publicRoot\fem-constraints.png"
Copy-Item -LiteralPath "$sourceRoot\fem-3b-mesh-underside.png" -Destination "$publicRoot\fem-mesh-underside.png"
Copy-Item -LiteralPath "$sourceRoot\fem-4b-vonmises-underside.png" -Destination "$publicRoot\fem-vonmises-underside.png"
Copy-Item -LiteralPath "$sourceRoot\fem-5-displacement.png" -Destination "$publicRoot\fem-displacement.png"
Copy-Item -LiteralPath "$sourceRoot\fem-6-deformed.png" -Destination "$publicRoot\fem-deformed.png"
```

- [ ] **Step 4: Implement deterministic responsive generation**

Create `scripts/build-mac-mini-shelf-media.mjs`. It must:

```js
const sourceNames = [
  "shelf-fit.png",
  "full-stack.png",
  "print-orientation.png",
  "fem-constraints.png",
  "fem-mesh-underside.png",
  "fem-vonmises-underside.png",
  "fem-displacement.png",
  "fem-deformed.png",
];
const widths = [640, 960, 1440];
```

For each pair, derive `${basename}-${width}.webp` and run FFmpeg with:

```js
[
  "-hide_banner", "-loglevel", "error", "-y",
  "-i", sourcePath,
  "-vf", `scale=${width}:-2:flags=lanczos`,
  "-frames:v", "1", "-map_metadata", "-1",
  "-c:v", "libwebp", "-quality", "82", "-compression_level", "6",
  outputPath,
]
```

Fail on a missing source or non-zero FFmpeg status. Print one final summary containing `8 originals`, `24 responsive WebP files`, and `640/960/1440`.

- [ ] **Step 5: Generate and verify the media inventory**

Run:

```powershell
node scripts/build-mac-mini-shelf-media.mjs
node --test scripts/mac-mini-shelf-media-contract.test.mjs
git diff --check
```

Expected: 32 media files present; the contract passes; `git diff --check` is silent.

- [ ] **Step 6: Inspect every original at full resolution**

Open all eight source PNGs with the local image viewer used by the agent. Confirm geometry is fully framed, Mac mini envelopes are renders, FEM legends are readable, the stress/displacement views are not mislabeled, and the deformed view is visibly exaggerated. Record findings outside the public tree.

- [ ] **Step 7: Commit the media chain**

```powershell
git add -- scripts/build-mac-mini-shelf-media.mjs scripts/mac-mini-shelf-media-contract.test.mjs apps/web/public/media/mac-mini-shelf
git diff --cached --check
git commit -m "feat: add verified Mac mini shelf media"
```

### Task 2: Add the Work record and deterministic hierarchy

**Files:**
- Create: `apps/web/src/content/work/mac-mini-shelf.md`
- Modify: `apps/web/src/content/work/black-scholes-wasm.md:7`
- Modify: `apps/web/src/content/work/cli-fleet-synchronization-and-mcp-rollout.md:7`
- Modify: `apps/web/src/content/work/remote-workstation-recovery-and-operational-debugging.md:7`
- Modify: `scripts/work-content-contract.test.mjs:12-87`

**Interfaces:**
- Consumes: Task 1 public media paths.
- Produces: Work slug `mac-mini-shelf`, `featuredOrder: 5`, four supporting records, and a complete content entry consumed automatically by the homepage, Work index, sitemap, and detail route.

- [ ] **Step 1: Change the hierarchy contract first**

Update `expectedPublishedSlugs` to:

```js
const expectedPublishedSlugs = [
  "cryo-flow-sim",
  "conformal-cooling-channel-generation",
  "xplane-cabin-camera-fov-trade-study",
  "openxhc-linuxcnc",
  "mac-mini-shelf",
  "black-scholes-wasm",
  "cli-fleet-synchronization-and-mcp-rollout",
  "remote-workstation-recovery-and-operational-debugging",
];
```

Rename the first test to require two flagships, four supporting studies, and two archives. Update the sorted placements and orders to eight values. Add assertions for the shelf original and all `640/960/1440` hero derivatives.

- [ ] **Step 2: Run the hierarchy contract and observe failure**

Run:

```powershell
node --test scripts/work-content-contract.test.mjs
```

Expected: FAIL because the Work record and shifted orders are absent.

- [ ] **Step 3: Add the exact public Work content**

Create `apps/web/src/content/work/mac-mini-shelf.md` with these required values and the complete Zod fields:

```yaml
---
title: "Mac mini Wall Shelf: Agentic CAD, FEM, and Manufacturing Preparation"
slug: "mac-mini-shelf"
discipline: "tools"
year: 2026
placement: "supporting"
featuredOrder: 5
lede: "From Joe's requirements, Agentic AI produced the parametric CAD, four-case load analysis, convergence checks, support-free K1C toolpath, and visually inspected evidence package for a six-Mac-mini wall shelf."
problem: "Six Mac minis and their stacking frames needed a compact wall-mounted shelf that could be modeled as one printable body, fit the K1C envelope, preserve ventilation clearance, and expose its structural assumptions before consuming a day of printer time."
stakes: "A shelf can look plausible in CAD while hiding a weak front edge, a stress singularity, unsupported print geometry, or an anchor assumption that the plastic model never tested. The useful outcome was therefore an auditable engineering chain, not a render and a PASS badge."
role: "Joe defined the objective, device count, printer constraint, and acceptance questions. Agentic AI verified the toolchain, generated the parametric model, checked geometry, ran and challenged the FEM, compared variants, prepared the K1C toolpath, rendered the evidence, and visually inspected the digital package."
constraints:
  - "Fit a 220 x 220 x 250 mm Creality K1C build volume as one support-free PLA body while holding six modeled Mac mini units plus stacking frames."
  - "Use the governing 4.98 kg / 48.8 N front-edge service case and a sustained PLA creep comparison instead of presenting the more flattering centered-load or yield-only result."
  - "Separate solid, isotropic, rigid-wall FEM assumptions from the intended four-perimeter, 30% gyroid print and from untested drywall, anchor, heat, layer-adhesion, tipping, and long-term creep behavior."
  - "Publish authentic CAD and FEM renders without raw machine files, private paths, printer identifiers, transcripts, or unsupported physical-completion claims."
architecture:
  overview: "A scripted FreeCAD model produces one checked shelf solid and print-oriented STL. CalculiX solves spread and front-edge service and four-times overload cases; beam comparison, mesh refinement, a singularity demonstration, and a gusset-variant study challenge the result before OrcaSlicer produces the K1C manufacturing package."
  diagramAlt: "Joe's requirements flow through Agentic AI toolchain verification, parametric CAD, geometry checks, four FEM load cases, hand and mesh validation, variant selection, visual inspection, and K1C slicing, ending at a digital manufacturing package rather than a verified installation."
decisions:
  - title: "Design for the front edge and sustained material behavior"
    choice: "Treat the 48.8 N front-edge service case and the selected 5 MPa PLA creep ceiling as the governing public comparison."
    alternatives:
      - "Lead with the centered spread-load case and compare only against short-term yield."
    tradeoff: "The result is less dramatic than the early yield-margin headline, but it represents the load placement and long-duration behavior that matter more for this shelf."
  - title: "Keep all three internal gussets"
    choice: "Retain the as-designed three-gusset body after the variant analysis produced a 3.5x creep margin."
    alternatives:
      - "Use one gusset at 1.7x creep margin."
      - "Use side walls alone at 1.2x creep margin."
    tradeoff: "The stronger variant uses more PLA, but it preserves materially better sustained-load margin without adding supports or a second printed part."
  - title: "Require scalar checks and visual checks"
    choice: "Pair build, solver, convergence, and slicer reports with explicit views of fit, print orientation, constraints, mesh, stress location, displacement, and exaggerated deformation."
    alternatives:
      - "Accept automated PASS summaries without inspecting the fields and geometry they summarize."
    tradeoff: "The evidence package takes longer to generate, but visual inspection can reveal a reversed orientation, wrong boundary condition, poor mesh region, or misleading peak that a scalar result alone can hide."
outcome: "The result is a digitally validated prototype and manufacturing package: a 170 x 160 x 106 mm watertight shelf, four checked load cases, a converged governing service result, and a support-free K1C slice. Physical print, installation, and load testing were not verified in the recovered evidence."
lessons:
  - "The governing case changed when the load moved from a favorable spread position to the front edge and the comparison changed from short-term yield to sustained PLA creep."
  - "Mesh convergence and a beam-theory comparison made the deflection result falsifiable, while the sharp-corner study showed why a stable-looking peak stress still needs interpretation."
  - "Visual inspection belongs inside an agentic engineering loop because an internally consistent report can still summarize the wrong geometry, load placement, or manufacturing orientation."
recruiterSignificance:
  title: "Why this matters to engineering teams"
  summary: "The shelf demonstrates how Agentic AI can carry a bounded physical-product problem across CAD, simulation, manufacturing preparation, and evidence packaging while keeping human intent and unverified physical claims explicit."
  points:
    - label: "End-to-end tool use"
      detail: "One workflow coordinated FreeCAD, CalculiX, geometry checks, variant analysis, rendering, and OrcaSlicer rather than stopping at generated code or prose."
    - label: "Adversarial validation"
      detail: "The analysis challenged its own attractive result with front-edge loading, a creep ceiling, beam comparison, mesh refinement, and a singularity demonstration."
    - label: "Visual verification"
      detail: "Fit, boundary conditions, mesh placement, stress location, displacement, and print orientation were inspected as engineering evidence."
    - label: "Honest handoff"
      detail: "The public result separates completed digital work from printing, installation, anchors, and long-term material behavior that still require physical proof."
evidence:
  label: "Governing sustained-load analysis"
  summary: "The 48.8 N front-edge service case calculated 0.064 mm displacement and 1.42 MPa peak von Mises stress, a 3.5x margin against the selected 5 MPa PLA creep ceiling."
  values:
    - label: "Service deflection"
      value: "0.064 mm"
      detail: "Maximum displacement in the governing front-edge 48.8 N service case."
    - label: "Service stress"
      value: "1.42 MPa"
      detail: "Peak von Mises stress in the same sustained-load case."
    - label: "Creep margin"
      value: "3.5x"
      detail: "Comparison against the selected 5 MPa sustained-stress ceiling for the modeled PLA."
    - label: "Mesh stability"
      value: "0.09% / 1.35%"
      detail: "Displacement and peak-stress changes when the shelf mesh was refined from 6 mm to 4 mm."
    - label: "Support-free slice"
      value: "530 layers"
      detail: "OrcaSlicer estimated 366.42 g and 11 h 45 m 52 s with zero support blocks for the retained manufacturing package."
  scope: "Evidence covers the retained parametric CAD, one-piece geometry checks, four linear-static CalculiX cases, beam and mesh checks, a sharp-corner singularity demonstration, a three-variant gusset study, authentic rendered fields, and a support-free K1C toolpath."
  limits: "The FEM assumes isotropic PLA, a solid continuum, distributed pressure, and a rigid back face. It does not validate 30% infill behavior, layer anisotropy, wall compliance, anchor pull-out, thermal exposure, stack tipping, long-term creep, a completed print, installation, or physical load testing."
media:
  kind: "image"
  src: "/media/mac-mini-shelf/shelf-fit.png"
  responsivePosterSources:
    - { src: "/media/mac-mini-shelf/shelf-fit-640.webp", width: 640 }
    - { src: "/media/mac-mini-shelf/shelf-fit-960.webp", width: 960 }
    - { src: "/media/mac-mini-shelf/shelf-fit-1440.webp", width: 1440 }
  width: 1400
  height: 1000
  alt: "FreeCAD isometric render of the wall shelf with a translucent Mac mini envelope showing side, rear, and ventilation clearance."
  caption: "Authentic FreeCAD fit render. The translucent volume is a modeled Mac mini envelope, not a physical product photograph."
evidenceMedia:
  - kind: "image"
    src: "/media/mac-mini-shelf/full-stack.png"
    responsiveSources:
      - { src: "/media/mac-mini-shelf/full-stack-640.webp", width: 640 }
      - { src: "/media/mac-mini-shelf/full-stack-960.webp", width: 960 }
      - { src: "/media/mac-mini-shelf/full-stack-1440.webp", width: 1440 }
    width: 1400
    height: 1000
    alt: "FreeCAD render of six translucent Mac mini envelopes stacked above the shelf body."
    caption: "Modeled six-unit stack and clearance envelope; this is a design render, not an installed load test."
  - kind: "image"
    src: "/media/mac-mini-shelf/print-orientation.png"
    responsiveSources:
      - { src: "/media/mac-mini-shelf/print-orientation-640.webp", width: 640 }
      - { src: "/media/mac-mini-shelf/print-orientation-960.webp", width: 960 }
      - { src: "/media/mac-mini-shelf/print-orientation-1440.webp", width: 1440 }
    width: 1400
    height: 1000
    alt: "FreeCAD render of the shelf rotated into its support-free Creality K1C print orientation."
    caption: "Selected one-piece print orientation; 53 sampled sections showed zero outward area growth."
  - kind: "image"
    src: "/media/mac-mini-shelf/fem-constraints.png"
    responsiveSources:
      - { src: "/media/mac-mini-shelf/fem-constraints-640.webp", width: 640 }
      - { src: "/media/mac-mini-shelf/fem-constraints-960.webp", width: 960 }
      - { src: "/media/mac-mini-shelf/fem-constraints-1440.webp", width: 1440 }
    width: 1400
    height: 950
    alt: "CalculiX setup render showing the shelf back face constrained and the governing load applied near the front edge."
    caption: "Modeled boundary conditions: rigid back face and distributed front-edge service load."
  - kind: "image"
    src: "/media/mac-mini-shelf/fem-mesh-underside.png"
    responsiveSources:
      - { src: "/media/mac-mini-shelf/fem-mesh-underside-640.webp", width: 640 }
      - { src: "/media/mac-mini-shelf/fem-mesh-underside-960.webp", width: 960 }
      - { src: "/media/mac-mini-shelf/fem-mesh-underside-1440.webp", width: 1440 }
    width: 1400
    height: 950
    alt: "Underside view of the second-order tetrahedral FEM mesh across the shelf, side walls, and three internal gussets."
    caption: "Underside mesh view: 167,186 nodes and 93,218 second-order tetrahedral elements."
  - kind: "image"
    src: "/media/mac-mini-shelf/fem-vonmises-underside.png"
    responsiveSources:
      - { src: "/media/mac-mini-shelf/fem-vonmises-underside-640.webp", width: 640 }
      - { src: "/media/mac-mini-shelf/fem-vonmises-underside-960.webp", width: 960 }
      - { src: "/media/mac-mini-shelf/fem-vonmises-underside-1440.webp", width: 1440 }
    width: 1400
    height: 950
    alt: "Underside von Mises stress field showing higher stress around the wall junction and gusset load paths."
    caption: "Governing front-edge service stress field: 1.42 MPa peak against the selected 5 MPa creep ceiling."
  - kind: "image"
    src: "/media/mac-mini-shelf/fem-displacement.png"
    responsiveSources:
      - { src: "/media/mac-mini-shelf/fem-displacement-640.webp", width: 640 }
      - { src: "/media/mac-mini-shelf/fem-displacement-960.webp", width: 960 }
      - { src: "/media/mac-mini-shelf/fem-displacement-1440.webp", width: 1440 }
    width: 1400
    height: 950
    alt: "CalculiX displacement field increasing from the fixed back face toward the shelf front edge."
    caption: "Governing service displacement field; calculated maximum displacement is 0.064 mm."
  - kind: "image"
    src: "/media/mac-mini-shelf/fem-deformed.png"
    responsiveSources:
      - { src: "/media/mac-mini-shelf/fem-deformed-640.webp", width: 640 }
      - { src: "/media/mac-mini-shelf/fem-deformed-960.webp", width: 960 }
      - { src: "/media/mac-mini-shelf/fem-deformed-1440.webp", width: 1440 }
    width: 1400
    height: 950
    alt: "Exaggerated CalculiX deformation shape bending downward from the fixed wall face toward the front edge."
    caption: "Exaggerated deformation for visual interpretation; it is not literal physical sag."
publicationStatus: "publish"
redactionStatus: "reviewed"
redactionReview:
  guidePath: "docs/CONTENT_REDACTION_GUIDE.md"
  reviewer: "operator"
  checklistStatus: "partial"
  openItems:
    - "Exact-source provider preview and final artifact-inspection evidence are pending."
  notes: "Source claims and authentic digital renders were bounded against retained CAD, FEM, validation, variant, and slicer reports. No raw manufacturing file, printer identity, private path, transcript, or physical-completion claim is public. Final approval follows exact-source preview inspection."
seo:
  title: "Agentic AI Mac mini Shelf CAD and FEM Case Study | Joe Poznanski"
  description: "How Agentic AI turned requirements for a six-Mac-mini wall shelf into parametric CAD, checked FEM, support-free slicing, and visually inspected engineering evidence."
  canonicalPath: "/work/mac-mini-shelf/"
  ogImage: "/social/mac-mini-shelf.png"
---
```

- [ ] **Step 4: Shift the three later featured orders**

Set Black-Scholes to 6, CLI Fleet to 7, and Remote Workstation to 8. Do not change their copy or placement.

- [ ] **Step 5: Run focused content checks**

```powershell
node --test scripts/work-content-contract.test.mjs scripts/mac-mini-shelf-media-contract.test.mjs
pnpm exec astro check
pnpm build
```

Expected: all commands pass and the build emits `/work/mac-mini-shelf/index.html`.

- [ ] **Step 6: Commit the Work record and order**

```powershell
git add -- apps/web/src/content/work/mac-mini-shelf.md apps/web/src/content/work/black-scholes-wasm.md apps/web/src/content/work/cli-fleet-synchronization-and-mcp-rollout.md apps/web/src/content/work/remote-workstation-recovery-and-operational-debugging.md scripts/work-content-contract.test.mjs
git diff --cached --check
git commit -m "feat: add Mac mini shelf work record"
```

### Task 3: Build the case-specific Agentic engineering narrative

**Files:**
- Create: `apps/web/src/components/MacMiniShelfProcess.astro`
- Modify: `apps/web/src/pages/work/[slug].astro:4-15,84-86`
- Modify: `tests/e2e/work-routes.spec.ts:1-120,640-730`

**Interfaces:**
- Consumes: slug `mac-mini-shelf` and the standard Work page shell.
- Produces: `[data-mac-mini-shelf-process]`, `[data-shelf-agentic-loop]`, `[data-shelf-assumptions]`, `[data-shelf-fem-matrix]`, and `[data-shelf-visual-inspection]` selectors.

- [ ] **Step 1: Add the failing route-specific browser assertions**

Add this test to `tests/e2e/work-routes.spec.ts`:

```ts
test("presents the Mac mini shelf as bounded Agentic AI engineering evidence", async ({ page }) => {
  await page.goto("/work/mac-mini-shelf/");
  const main = page.locator("main");

  await expect(page.getByRole("heading", {
    level: 1,
    name: "Mac mini Wall Shelf: Agentic CAD, FEM, and Manufacturing Preparation",
  })).toBeVisible();
  await expect(main).toContainText(/Joe defined the objective.*Agentic AI/i);
  await expect(page.locator("[data-shelf-agentic-loop] li")).toHaveCount(8);
  await expect(page.locator("[data-shelf-assumptions] tbody tr")).toHaveCount(8);
  await expect(page.locator("[data-shelf-fem-matrix] tbody tr")).toHaveCount(4);
  await expect(main).toContainText(/0\.064 mm.*1\.42 MPa.*3\.5x/is);
  await expect(main).toContainText(/exaggerated deformation/i);
  await expect(main).toContainText(/Physical print, installation, and load testing were not verified/i);
  await expect(main).not.toContainText(/successfully printed|installed and tested|production-ready|safe load/i);
});

test("renders the shelf process component only for the shelf slug", async ({ page }) => {
  for (const work of allPublishedWork) {
    await page.goto(`/work/${work.slug}/`);
    await expect(page.locator("[data-mac-mini-shelf-process]")).toHaveCount(
      work.slug === "mac-mini-shelf" ? 1 : 0,
    );
  }
});
```

Add the shelf entry to `allPublishedWork` between OpenXHC and Black-Scholes and update the cyclic `expectedNext` array to the same order.

- [ ] **Step 2: Run and observe the missing-component failure**

```powershell
pnpm test:e2e -- --grep "Mac mini shelf|process component"
```

Expected: FAIL because the route lacks the process selectors and sections.

- [ ] **Step 3: Implement the process data and semantic sections**

Create `MacMiniShelfProcess.astro` with literal, immutable arrays:

```ts
const processSteps = [
  ["Recover the toolchain", "Verify FreeCAD, CalculiX, meshing, rendering, and OrcaSlicer before modeling."],
  ["Bound the problem", "Set device, stack-frame, service-load, printer-envelope, and one-piece constraints."],
  ["Generate parametric CAD", "Build one FreeCAD solid with side walls, front apron, ventilation slots, and three gussets."],
  ["Check manufacturing geometry", "Prove validity, watertightness, manifold STL output, K1C fit, and support-free orientation."],
  ["Solve four load cases", "Compare spread and front-edge service loads plus their four-times transient overloads."],
  ["Challenge the solver", "Use beam theory, 6-to-4 mm mesh refinement, and a sharp-corner singularity demonstration."],
  ["Compare variants", "Measure the sustained-load cost of reducing the design from three gussets to one or none."],
  ["Inspect and package", "Render fit, constraints, mesh, stress, displacement, deformation, then slice and cross-check reports."],
] as const;

const assumptions = [
  ["Shelf envelope", "Measured artifact", "170 x 160 x 106 mm"],
  ["Service load", "Modeled input", "48.8 N / 4.98 kg"],
  ["PLA material", "Modeled input", "E = 3000 MPa; Poisson ratio = 0.36"],
  ["Sustained ceiling", "Engineering comparison", "5 MPa; not a certification limit"],
  ["Wall boundary", "Modeled input", "Back face held rigidly"],
  ["Device contact", "Modeled input", "Distributed pressure, not four feet"],
  ["Printed body", "Unverified translation", "Solid FEM versus four walls and 30% gyroid"],
  ["Physical system", "Not verified", "Print, anchors, installation, heat, tipping, load test, and long-term creep"],
] as const;

const loadCases = [
  ["A", "Service / spread", "48.8 N", "0.015 mm", "0.26 MPa", "19x to 5 MPa creep ceiling"],
  ["C", "Service / front edge", "48.8 N", "0.064 mm", "1.42 MPa", "Governing sustained case; 3.5x"],
  ["B", "4x / spread", "195 N", "0.060 mm", "1.03 MPa", "48x to 50 MPa yield"],
  ["D", "4x / front edge", "195 N", "0.255 mm", "5.69 MPa", "9x to yield; not a service recommendation"],
] as const;
```

Render:

- an ordered list under `data-shelf-agentic-loop`;
- an accessible assumption table under `data-shelf-assumptions`;
- an accessible load-case table under `data-shelf-fem-matrix`;
- a `data-shelf-visual-inspection` callout explaining the corrected centered-load/yield framing and the role of the seven published views.

Wrap the component in `<section data-mac-mini-shelf-process>` and use existing `--space-*`, `--line`, `--color-*`, `--font-evidence`, and responsive breakpoints. Tables must use an overflow wrapper scoped inside the component so the page itself never overflows.

- [ ] **Step 4: Insert the component only for the exact slug**

Import it in `[slug].astro` and place it after the generic system section:

```astro
import MacMiniShelfProcess from "../../components/MacMiniShelfProcess.astro";
```

```astro
{data.slug === "mac-mini-shelf" ? <MacMiniShelfProcess /> : null}
```

- [ ] **Step 5: Run the focused route and accessibility checks**

```powershell
pnpm test:e2e -- --grep "Mac mini shelf|process component|responsive, accessible"
pnpm exec astro check
pnpm lint
```

Expected: all focused checks pass; the component appears on exactly one route.

- [ ] **Step 6: Commit the process narrative**

```powershell
git add -- apps/web/src/components/MacMiniShelfProcess.astro 'apps/web/src/pages/work/[slug].astro' tests/e2e/work-routes.spec.ts
git diff --cached --check
git commit -m "feat: show the shelf Agentic engineering process"
```

### Task 4: Update homepage and Work-index messaging

**Files:**
- Modify: `apps/web/src/pages/work/index.astro:18-39`
- Modify: `apps/web/src/components/ProofGallery.astro:13-22`
- Modify: `tests/e2e/work-routes.spec.ts:35-100`
- Modify: `tests/e2e/signal-proof-home.spec.ts` where supporting-card text/count is asserted.

**Interfaces:**
- Consumes: the ordered Work collection from Task 2.
- Produces: four supporting cards in order and recruiter-readable homepage framing that includes Agentic AI physical-product engineering.

- [ ] **Step 1: Update browser expectations before copy**

Require four supporting articles with headings:

```ts
[
  "X-Plane Cabin Camera FOV Trade Study",
  "OpenXHC: Reverse-Engineering a CNC Motion Interface",
  "Mac mini Wall Shelf: Agentic CAD, FEM, and Manufacturing Preparation",
  "Black-Scholes Options Pricer in Rust and WASM",
]
```

Require six homepage proof items and assert the shelf card contains both `Agentic AI` and the governing `0.064 mm`, `1.42 MPa`, `3.5x` summary.

- [ ] **Step 2: Run and observe the stale-count/copy failure**

```powershell
pnpm test:e2e -- --grep "approved work hierarchy|Signal / Proof homepage"
```

Expected: FAIL on the hard-coded three-supporting guard or five-card expectation.

- [ ] **Step 3: Change the Work-index guard and visitor copy**

Set `supportingWork.length !== 4`, update the error text to `four supporting studies`, and change the introduction to:

```text
Two flagship engineering systems, four focused technical studies, and an operational archive. Each stays framed by the decisions, evidence, and limits that make the result trustworthy.
```

- [ ] **Step 4: Broaden the homepage proof-gallery description**

Use:

```text
The flagship case studies carry captured motion and geometry evidence. Focused technical studies extend that evidence-first approach to camera tradeoffs, machine-interface reverse engineering, Agentic AI physical-product development, and browser computation.
```

- [ ] **Step 5: Verify and commit the public hierarchy**

```powershell
pnpm test:e2e -- --grep "approved work hierarchy|Signal / Proof homepage"
pnpm exec astro check
git add -- apps/web/src/pages/work/index.astro apps/web/src/components/ProofGallery.astro tests/e2e/work-routes.spec.ts tests/e2e/signal-proof-home.spec.ts
git diff --cached --check
git commit -m "feat: feature the Mac mini shelf on Work surfaces"
```

### Task 5: Generate the authentic social preview

**Files:**
- Modify: `scripts/social-preview-assets-contract.test.mjs:138-258`
- Modify: `scripts/generate-social-preview-assets.mjs:10-120`
- Create: `apps/web/public/social/mac-mini-shelf.png`

**Interfaces:**
- Consumes: `/media/mac-mini-shelf/shelf-fit.png`.
- Produces: generator project key `mac-mini-shelf` and `/social/mac-mini-shelf.png`.

- [ ] **Step 1: Add the failing deterministic-card test**

Mirror the OpenXHC isolated-output test, invoke:

```js
[
  generatorPath,
  "--project",
  "mac-mini-shelf",
  "--output",
  generatedPath,
]
```

Require 1200 by 630, nontrivial file data, identical hashes across two runs, and stdout matching:

```js
/shelf-fit\.png: Mac mini shelf.*0\.064 mm.*3\.5x creep margin/i
```

- [ ] **Step 2: Run and observe the unknown-project failure**

```powershell
node --test scripts/social-preview-assets-contract.test.mjs
```

Expected: FAIL with `Unknown social preview project: mac-mini-shelf`.

- [ ] **Step 3: Add the project definition and filter**

Add:

```js
"mac-mini-shelf": {
  sourceName: "shelf-fit.png",
  sourcePath: path.join(publicDir, "media/mac-mini-shelf/shelf-fit.png"),
  outputPath: path.join(publicDir, "social/mac-mini-shelf.png"),
},
```

Extend the usage text to accept `openxhc|mac-mini-shelf`. Add a dark-panel filter with the exact visible lines:

```text
MAC MINI WALL SHELF
AGENTIC CAD + FEM
0.064 mm deflection
1.42 MPa stress
3.5x creep margin
DIGITAL MANUFACTURING PACKAGE
```

Select the shelf filter and a 516-pixel panel when `project === "mac-mini-shelf"`. Set the summary to `Mac mini shelf | 0.064 mm deflection | 3.5x creep margin`.

- [ ] **Step 4: Generate, verify, and commit**

```powershell
node scripts/generate-social-preview-assets.mjs --project mac-mini-shelf
node --test scripts/social-preview-assets-contract.test.mjs
git add -- scripts/generate-social-preview-assets.mjs scripts/social-preview-assets-contract.test.mjs apps/web/public/social/mac-mini-shelf.png
git diff --cached --check
git commit -m "feat: add Mac mini shelf social preview"
```

### Task 6: Extend release-surface and browser coverage

**Files:**
- Modify: `tests/e2e/quality-gates.spec.ts:4-42`
- Modify: `tests/e2e/responsive-cross-browser.spec.ts:3-65,170-205`
- Modify: `tests/e2e/visual-regression.spec.ts:14-40`
- Modify: route/content scripts identified by failures, only when their explicit published-route inventories require the new Work route.
- Create: visual regression baselines for the shelf route.

**Interfaces:**
- Consumes: completed content and component tasks.
- Produces: no-JS, reduced-motion, Axe, privacy, responsive, touch-target, sitemap, metadata, console, and visual coverage for the new route.

- [ ] **Step 1: Add the shelf to quality and responsive matrices**

Add this `coreRoutes` record:

```ts
{
  path: "/work/mac-mini-shelf/",
  marker: /0\.064 mm.*1\.42 MPa/i,
},
```

Add this `launchRoutes` record:

```ts
{
  path: "/work/mac-mini-shelf/",
  heading: /Mac mini Wall Shelf/i,
  marker: /Agentic engineering loop/i,
  primaryLink: /Open the full-size evidence image/i,
},
```

Change the LinkedIn no-JS homepage count from 5 to 6.

- [ ] **Step 2: Add the shelf visual route and observe the missing baseline**

```ts
{ label: "work-mac-mini-shelf", path: "/work/mac-mini-shelf/" },
```

Run:

```powershell
pnpm test:visual -- --grep "work-mac-mini-shelf"
```

Expected: FAIL because the platform baseline does not exist.

- [ ] **Step 3: Run focused functional gates**

```powershell
pnpm test:e2e -- --grep "mac-mini-shelf|@responsive|@accessibility|@noscript|@reduced-motion"
```

Expected: the shelf route returns 200, has no page-level overflow, retains readable content without JavaScript, honors reduced motion, exposes no private patterns, has no serious/critical Axe finding, and preserves 44-pixel touch targets.

- [ ] **Step 4: Create and inspect the local visual baselines**

Run the owning-platform update only:

```powershell
pnpm test:visual:update -- --grep "work-mac-mini-shelf"
```

Open both generated shelf captures at full resolution. Confirm readable tables, correct image aspect ratios, no clipped FEM captions, no horizontal page overflow, and explicit digital/physical limits. Do not update unrelated snapshots.

- [ ] **Step 5: Verify metadata, sitemap, links, and console behavior**

```powershell
pnpm test:e2e -- --grep "route coverage|sitemap|metadata|Work routes|visual surfaces"
```

If an explicit array fails, add only `/work/mac-mini-shelf/` in the established order and rerun that exact test. Do not broaden unrelated inventories.

- [ ] **Step 6: Commit browser coverage**

```powershell
git add -- tests/e2e scripts
git diff --cached --check
git commit -m "test: cover Mac mini shelf release surfaces"
```

### Task 7: Gate physical photographs and the K1C time-lapse

**Files:**
- Conditionally create only the physical-media files listed in the File Map.
- Conditionally modify: `apps/web/src/content/work/mac-mini-shelf.md`.
- Conditionally modify: `scripts/mac-mini-shelf-media-contract.test.mjs`.
- Retain private inspection evidence outside `apps/web/public`.

**Interfaces:**
- Consumes: Joe-supplied photo files and/or a Creality Cloud time-lapse matched to the shelf job.
- Produces: either a proven physical-media lane or a verified omission with the public digital-only status unchanged.

- [ ] **Step 1: Recheck printer completion read-only**

Run only the canonical getter-based probe:

```powershell
py -3 'C:/Users/joepo/.claude/skills/k1c-printer-ops/probe_k1c.py' --save 'C:/Users/joepo/Documents/Codex/2026-09-02/i-want-to-add-the-mac/work/k1c-physical-gate'
```

Require a matching shelf filename with `printfinish: 1`; then inspect the actual finished part. A long duration, 100% progress, or time-lapse alone does not pass.

- [ ] **Step 2: Attempt signed-in cloud retrieval only after completion**

Open Workbench > Time-Lapses in the already authorized Creality Cloud session. Download only a recording whose displayed job identity and timestamp match the completed shelf run. If the list remains unavailable or no match exists, stop this lane without creating public video files.

- [ ] **Step 3: Inspect Joe-supplied photographs before editing**

Require at least one full-resolution image that visibly shows the finished shelf body. Record source filename, dimensions, capture time if available, and visual findings privately. Reject screenshots of the printer dashboard, CAD renders, unrelated stackers, or images that do not show the whole part clearly.

- [ ] **Step 4: Sanitize accepted physical media**

For each accepted photograph, create a public PNG with metadata removed and responsive WebP derivatives. For an accepted time-lapse, transcode to H.264/yuv420p, remove audio and metadata, create a poster, and keep the public video compact enough for the existing media budget. Verify with `ffprobe` that no GPS, account, device serial, private path, or audio stream remains.

- [ ] **Step 5: Add physical declarations only when the gate passes**

Append accepted photo/video records to `evidenceMedia`. Change copy from `not verified` only for the exact newly proven facts. Do not claim installation, six-unit loading, anchor behavior, safe load, or long-term creep unless Joe supplies separate direct evidence for each.

- [ ] **Step 6: Add falsifying contract assertions and commit only a passed lane**

Extend the media contract with exact public hashes, dimensions, MP4 codec/pixel-format checks, and a negative private-metadata scan. Run the contract, relevant browser test, and full-resolution visual inspection before committing:

```powershell
git add -- apps/web/public/media/mac-mini-shelf/physical apps/web/src/content/work/mac-mini-shelf.md scripts/mac-mini-shelf-media-contract.test.mjs
git diff --cached --check
git commit -m "feat: add verified physical shelf evidence"
```

If no lane passes, create no commit and continue with the accurate digital-only case study.

### Task 8: Run the complete local gate and exact-source preview

**Files:**
- Modify: `apps/web/src/content/work/mac-mini-shelf.md` only after preview evidence exists.
- No tracked evidence log is required; capture provider IDs and screenshots in the task workspace.

**Interfaces:**
- Consumes: clean feature branch with Tasks 1-7 complete or an explicitly omitted physical lane.
- Produces: exact feature SHA, successful CI, Cloudflare branch-preview URL/ID, retained production rollback ID, visual inspection evidence, and an approved Work record.

- [ ] **Step 1: Read the verification skill and run the full local gate**

Use `superpowers:verification-before-completion`. Then run from the repository root:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm bundle:budget
pnpm test:e2e
pnpm test:visual
Push-Location apps/api
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test
Pop-Location
git diff --check
git status --short
```

Expected: every command passes and the tree is clean. The `redaction:readiness` command is expected to report the shelf as pending while status is `reviewed`; it becomes required green after Task 8 Step 7.

- [ ] **Step 2: Scan the exact commit for private or unsupported material**

```powershell
git grep -n -I -E 'C:\\Users\\|/Users/|/home/joe|192\.168\.|K1C-6BDF|flamewulfe|7622613794|BEGIN .*PRIVATE KEY|CLOUDFLARE_API_TOKEN[[:space:]]*=|ghp_[A-Za-z0-9]{20,}' HEAD -- ':!pnpm-lock.yaml' ':!docs/superpowers/**'
```

Expected: no match in public source/content/media metadata. Separately search the shelf content for `successfully printed`, `installed`, `load-tested`, `production-ready`, `safe load`, and `certified`; each must be absent as an accomplished claim.

- [ ] **Step 3: Record rollback and provider authentication without exposing secrets**

```powershell
pnpm exec wrangler whoami
pnpm exec wrangler pages deployment list --project-name=humankaylee-portfolio --environment=production
```

Record the newest behaviorally correct production deployment ID and URL as `$rollbackDeploymentId` and `$rollbackUrl`. Verify its homepage identity before any preview or production mutation.

- [ ] **Step 4: Push the feature branch and require exact-SHA CI**

```powershell
$releaseBranch = 'feat/mac-mini-shelf-case-study-20260902'
$releaseSha = git rev-parse HEAD
git push -u origin $releaseBranch
gh run list --repo HumanKaylee/humankaylee-portfolio --branch $releaseBranch --limit 20 --json databaseId,headSha,status,conclusion,workflowName,url
```

Watch only runs whose `headSha` equals `$releaseSha`. Require the Phase 0 verification jobs to pass. A successful run for another SHA does not count.

- [ ] **Step 5: Deploy a non-production exact-source preview**

Rebuild from the clean commit and deploy:

```powershell
pnpm build
pnpm exec wrangler pages deploy dist --project-name=humankaylee-portfolio --branch=mac-mini-shelf-preview --commit-hash=$releaseSha --commit-dirty=false
pnpm exec wrangler pages deployment list --project-name=humankaylee-portfolio
```

Capture the deployment ID and pages.dev URL whose provider metadata associates it with `$releaseSha`.

- [ ] **Step 6: Inspect the preview in a real browser**

At `/`, `/work/`, and `/work/mac-mini-shelf/`, inspect 390 by 844, 820 by 1180, and 1440 by 1200. Verify complete copy, responsive images, original-image links, tables, captions, no overflow, no console warnings/errors, no serious/critical Axe findings, no-JS readability, reduced-motion stability, canonical/OG metadata, sitemap inclusion, and security headers. Open all published originals at full resolution. If physical media exists, play/seek the MP4 and inspect its poster and final frame.

- [ ] **Step 7: Promote the content record to approved using real evidence**

Change `redactionStatus` to `approved`, set checklist status `complete`, clear `openItems`, set `reviewedOn` to the actual inspection date, include the complete checklist, and add `approvalEvidence`:

- `humanSignoff`: Joe's explicit production authorization from this task, without claiming he viewed the preview;
- `artifactInspection`: exact feature SHA, inspected routes/media, date, and pass result;
- `productionOrPreviewEvidence`: exact Cloudflare preview URL, deployment ID, SHA, date, and pass result.

Commit:

```powershell
git add -- apps/web/src/content/work/mac-mini-shelf.md
git diff --cached --check
git commit -m "docs: approve Mac mini shelf case study"
```

- [ ] **Step 8: Re-run readiness, exact-SHA CI, and a second preview**

```powershell
pnpm redaction:readiness
pnpm test
pnpm build
$approvedSha = git rev-parse HEAD
git push origin $releaseBranch
```

Require CI for `$approvedSha`, then deploy the same branch-preview command with `--commit-hash=$approvedSha`. Repeat the full preview inspection. Store the second preview evidence outside tracked source to avoid a self-referential commit.

### Task 9: Merge, publish, and prove the live release

**Files:**
- No feature files should change during merge/deploy.
- Create a task-workspace release report containing only public-safe SHA, CI, route, deployment, visual, and rollback evidence.

**Interfaces:**
- Consumes: approved, clean, exact-SHA-previewed feature branch.
- Produces: merged main SHA, successful main CI/deploy, verified custom-domain release, and retained rollback.

- [ ] **Step 1: Open the reviewable pull request**

```powershell
gh pr create --repo HumanKaylee/humankaylee-portfolio --base main --head feat/mac-mini-shelf-case-study-20260902 --title "Add Agentic AI Mac mini shelf case study" --body "Adds the approved Mac mini shelf Work entry, authentic CAD/FEM evidence, responsive media, Agentic engineering process, and bounded physical-status language. Verified locally and on an exact-source Cloudflare preview; no raw manufacturing files or private printer data are published."
```

Record the PR number. Verify changed-file scope and require checks for the exact approved head SHA.

- [ ] **Step 2: Merge without bypassing checks**

Use the repository's normal non-force merge path only after the PR is mergeable and required checks pass:

```powershell
gh pr merge --repo HumanKaylee/humankaylee-portfolio --merge --delete-branch=false
git fetch origin main
$productionSha = git rev-parse origin/main
gh pr view --repo HumanKaylee/humankaylee-portfolio --json state,mergeCommit,headRefOid,url
```

Require `$productionSha` to equal the PR merge commit.

- [ ] **Step 3: Require exact main-branch CI and deployment success**

```powershell
gh run list --repo HumanKaylee/humankaylee-portfolio --branch main --limit 20 --json databaseId,headSha,status,conclusion,workflowName,url
```

Watch only Phase 0 CI and Deploy to Cloudflare Pages runs whose `headSha` equals `$productionSha`. If the deploy workflow fails solely because credentials are unavailable while local Wrangler authentication is confirmed, use the already authorized direct production command only after rebuilding from a clean worktree at `$productionSha`:

```powershell
pnpm exec wrangler pages deploy dist --project-name=humankaylee-portfolio --branch=main --commit-hash=$productionSha --commit-dirty=false
```

- [ ] **Step 4: Verify custom-domain routes and metadata**

Require HTTP 200 and correct visible identity for:

```text
https://joepoznanski.io/
https://joepoznanski.io/work/
https://joepoznanski.io/work/mac-mini-shelf/
https://joepoznanski.io/sitemap-index.xml
https://joepoznanski.io/social/mac-mini-shelf.png
```

Verify canonical URL, Open Graph image, CSP, `X-Content-Type-Options`, `X-Frame-Options`, cache headers, and exact media dimensions/bytes.

- [ ] **Step 5: Repeat browser and physical-media checks on production**

Inspect desktop/mobile/tablet, no-JS, reduced motion, Axe, console, overflow, touch targets, all original images, and every responsive derivative. For any MP4, require direct HTTP `206` plus `Content-Range`, then play, seek, and resume on the custom domain. A preview Blob seek does not count as production streaming proof.

- [ ] **Step 6: Prove rollback remains usable**

List production deployments again. Require `$rollbackDeploymentId` to remain listed and `$rollbackUrl` to return the prior homepage identity. If a release-critical check fails, restore the retained known-good artifact using the provider's supported dashboard or an exact rebuild of the retained Git revision, then rerun the live matrix before reporting state.

- [ ] **Step 7: Produce the public-safe release handoff**

Record:

- PR URL and merge SHA;
- exact CI and deployment run URLs;
- Cloudflare production deployment ID and public URL;
- live route, metadata, header, responsive, accessibility, console, no-JS, reduced-motion, and visual results;
- physical-media inclusion or evidence-gated omission;
- rollback deployment ID/URL and behavioral result;
- any remaining limitation.

Do not claim completion until every included fact has fresh output from this release.

---

## Plan Self-Review Checklist

- Spec coverage: Tasks 1-9 cover authentic media, homepage placement, Work detail, Agentic AI responsibility, assumptions, four FEM cases, visual inspection, physical-media gating, social preview, local QA, provider preview, structured approval, production, and rollback.
- Scope: one Work record, one case-specific component, media tooling, enumerated tests, and release state only; no schema redesign, dependency addition, resume edit, or unrelated refactor.
- Type consistency: content uses the current `workSchema` fields; image records use `responsiveSources`; hero media uses `responsivePosterSources`; the route test selectors exactly match Task 3 output.
- Evidence consistency: source PNG hashes and dimensions match the recovered artifacts; the public numerical claims use the governing sustained front-edge case; physical evidence remains optional and falsifiable.
- Execution order: each implementation task begins with a failing contract or browser assertion and ends with a focused passing check and reviewable commit.
