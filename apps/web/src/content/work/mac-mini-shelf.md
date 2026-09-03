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
  summary: "The 48.8 N front-edge service case calculated 0.064 mm displacement and 1.42 MPa peak von Mises stress, a 3.5x margin against the selected 5 MPa PLA creep ceiling. The four-times front-edge case was transient analysis evidence, not a recommended service load."
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
    - { src: "/media/mac-mini-shelf/shelf-fit-1440.webp", width: 1400 }
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
      - { src: "/media/mac-mini-shelf/full-stack-1440.webp", width: 1400 }
    width: 1400
    height: 1000
    alt: "FreeCAD render of six translucent Mac mini envelopes stacked above the shelf body."
    caption: "Modeled six-unit stack and clearance envelope; this is a design render, not an installed load test."
  - kind: "image"
    src: "/media/mac-mini-shelf/print-orientation.png"
    responsiveSources:
      - { src: "/media/mac-mini-shelf/print-orientation-640.webp", width: 640 }
      - { src: "/media/mac-mini-shelf/print-orientation-960.webp", width: 960 }
      - { src: "/media/mac-mini-shelf/print-orientation-1440.webp", width: 1400 }
    width: 1400
    height: 1000
    alt: "FreeCAD render of the shelf rotated into its support-free Creality K1C print orientation."
    caption: "Selected one-piece print orientation; 53 sampled sections showed zero outward area growth."
  - kind: "image"
    src: "/media/mac-mini-shelf/fem-constraints.png"
    responsiveSources:
      - { src: "/media/mac-mini-shelf/fem-constraints-640.webp", width: 640 }
      - { src: "/media/mac-mini-shelf/fem-constraints-960.webp", width: 960 }
      - { src: "/media/mac-mini-shelf/fem-constraints-1440.webp", width: 1400 }
    width: 1400
    height: 950
    alt: "CalculiX setup render showing the shelf back face constrained and the governing load applied near the front edge."
    caption: "Modeled boundary conditions: rigid back face and distributed front-edge service load."
  - kind: "image"
    src: "/media/mac-mini-shelf/fem-mesh-underside.png"
    responsiveSources:
      - { src: "/media/mac-mini-shelf/fem-mesh-underside-640.webp", width: 640 }
      - { src: "/media/mac-mini-shelf/fem-mesh-underside-960.webp", width: 960 }
      - { src: "/media/mac-mini-shelf/fem-mesh-underside-1440.webp", width: 1400 }
    width: 1400
    height: 950
    alt: "Underside view of the second-order tetrahedral FEM mesh across the shelf, side walls, and three internal gussets."
    caption: "Underside mesh view: 167,186 nodes and 93,218 second-order tetrahedral elements."
  - kind: "image"
    src: "/media/mac-mini-shelf/fem-vonmises-underside.png"
    responsiveSources:
      - { src: "/media/mac-mini-shelf/fem-vonmises-underside-640.webp", width: 640 }
      - { src: "/media/mac-mini-shelf/fem-vonmises-underside-960.webp", width: 960 }
      - { src: "/media/mac-mini-shelf/fem-vonmises-underside-1440.webp", width: 1400 }
    width: 1400
    height: 950
    alt: "Underside von Mises stress field showing higher stress around the wall junction and gusset load paths."
    caption: "Governing front-edge service stress field: 1.42 MPa peak against the selected 5 MPa creep ceiling."
  - kind: "image"
    src: "/media/mac-mini-shelf/fem-displacement.png"
    responsiveSources:
      - { src: "/media/mac-mini-shelf/fem-displacement-640.webp", width: 640 }
      - { src: "/media/mac-mini-shelf/fem-displacement-960.webp", width: 960 }
      - { src: "/media/mac-mini-shelf/fem-displacement-1440.webp", width: 1400 }
    width: 1400
    height: 950
    alt: "CalculiX displacement field increasing from the fixed back face toward the shelf front edge."
    caption: "Governing service displacement field; calculated maximum displacement is 0.064 mm."
  - kind: "image"
    src: "/media/mac-mini-shelf/fem-deformed.png"
    responsiveSources:
      - { src: "/media/mac-mini-shelf/fem-deformed-640.webp", width: 640 }
      - { src: "/media/mac-mini-shelf/fem-deformed-960.webp", width: 960 }
      - { src: "/media/mac-mini-shelf/fem-deformed-1440.webp", width: 1400 }
    width: 1400
    height: 950
    alt: "Exaggerated CalculiX deformation shape bending downward from the fixed wall face toward the front edge."
    caption: "Exaggerated deformation for visual interpretation; it is not literal physical sag."
publicationStatus: "publish"
redactionStatus: "approved"
redactionReview:
  guidePath: "docs/CONTENT_REDACTION_GUIDE.md"
  reviewer: "operator"
  reviewedOn: "2026-09-03"
  checklistStatus: "complete"
  openItems: []
  notes: "Source claims, authentic digital renders, the complete case-study copy, and responsive presentation passed public-safety review plus agent and browser inspection on the exact Cloudflare provider preview. Joe authorized later production publication in this task on 2026-09-03. This records authorization without claiming he personally inspected the preview. No raw manufacturing file, printer identity, private path, transcript, or physical-completion claim is public."
  checklist:
    secretsRemoved: "yes"
    hostnamesAndAccessPathsGeneralized: "yes"
    userAndAccountNamesGeneralized: "yes"
    screenshotsInspected: "yes"
    logsSummarizedOrSanitized: "not-applicable"
    publicLinksVerified: "not-applicable"
    claimsHaveSafeEvidence: "yes"
    securitySensitiveProceduresRemoved: "yes"
approvalEvidence:
  humanSignoff:
    reviewer: "Joe Poznanski"
    signedOffOn: "2026-09-03"
    decision: "approved"
    notes: "Joe explicitly authorized the feature-branch preview and later production publication in this task on 2026-09-03. This records authorization and does not claim he personally inspected the preview."
  artifactInspection:
    source: "Mac mini shelf case study at source 9c68050b979da07d0437b525e6dedcb3d361271a; agent and browser inspection in this task"
    inspectedOn: "2026-09-03"
    result: "passed"
    notes: "The complete copy, three routes at 390 x 844, 820 x 1180, and 1440 x 1200, responsive images, eight full-size originals, evidence tables, captions, no-overflow behavior, clean console and network activity, no-JavaScript rendering, reduced-motion behavior, canonical and Open Graph metadata, sitemap inclusion, security headers, and Axe results were inspected. No serious or critical accessibility finding, broken media, private material, unsupported physical-completion claim, or runtime error remained."
  productionOrPreviewEvidence:
    source: "Cloudflare Pages preview https://191be978.humankaylee-portfolio.pages.dev; deployment 191be978-8574-4890-9b89-270e44818d3b; source 9c68050b979da07d0437b525e6dedcb3d361271a"
    capturedOn: "2026-09-03"
    result: "passed"
    notes: "Exact-source provider preview passed the full route and viewport inspection matrix. This preview evidence does not claim a production release. Physical print, installation, and load testing remain explicitly unverified and no physical media was published."
seo:
  title: "Agentic AI Mac mini Shelf CAD and FEM Case Study | Joe Poznanski"
  description: "How Agentic AI turned requirements for a six-Mac-mini wall shelf into parametric CAD, checked FEM, support-free slicing, and visually inspected engineering evidence."
  canonicalPath: "/work/mac-mini-shelf/"
  ogImage: "/social/mac-mini-shelf.png"
---
