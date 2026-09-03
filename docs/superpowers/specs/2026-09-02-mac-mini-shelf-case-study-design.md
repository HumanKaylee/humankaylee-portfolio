# Mac mini Shelf Case Study Design

Date: 2026-09-02
Status: Approved for implementation
Target route: `/work/mac-mini-shelf/`

## Outcome

Add a media-rich supporting case study that shows how an agentic AI workflow
turned Joe's requirements for a six-Mac-mini wall shelf into a parametric CAD
model, a checked finite-element analysis, a support-free K1C manufacturing
package, and a visually inspected evidence set.

If a completed physical print is later proven by Joe's finished-product
photographs or a matching K1C time-lapse, add that material as a distinct
physical-evidence layer. Do not let pending physical media delay the digital
case-study implementation, and do not let an available recording substitute
for inspection of the finished part.

The public story must distinguish an end-to-end **digital engineering result**
from an unverified physical outcome. The recovered evidence proves the CAD,
geometry checks, FEM runs, validation work, renders, slicing, and reporting. It
does not prove a successful print, installation, drywall-anchor pull-out test,
six-unit load test, or long-term creep performance.

## Success Criteria

1. The homepage explains what the shelf is, why the workflow matters, and which
   parts Agentic AI performed without implying that AI supplied the human goal
   or physically installed the shelf.
2. `/work/mac-mini-shelf/` presents the requirements, design decisions,
   agentic process, assumptions, four FEM cases, validation checks, variant
   study, slicing result, visual-inspection loop, and evidence limits.
3. Every numerical claim is traceable to a retained report or source artifact.
4. Every published visual is an authentic recovered CAD or FEM render, is
   inspected at full resolution, and is described as a render rather than a
   physical photograph.
5. The page remains useful without JavaScript and under reduced motion, has no
   horizontal overflow at 390, 820, and 1440 pixels, and has no serious or
   critical automated accessibility findings.
6. No transcript, session identifier, absolute path, raw log, private host
   information, STL, or G-code is published.
7. Production is released only after an exact-source preview, visual review,
   redaction review, passing CI, retained rollback, and live custom-domain
   verification.
8. A time-lapse or finished-product photograph appears only when its source is
   matched to this shelf and the recovered evidence proves a completed,
   visually acceptable part. Otherwise the physical media section is omitted.

## Placement And Message

The study is supporting work, positioned after OpenXHC and before the
Black-Scholes demonstration. It does not displace either flagship because the
physical manufacturing outcome is not verified.

Recommended title:

> Mac mini Wall Shelf: Agentic CAD, FEM, and Manufacturing Preparation

Homepage lede:

> From Joe's requirements, Agentic AI produced the parametric CAD, four-case
> load analysis, convergence checks, support-free K1C toolpath, and visually
> inspected evidence package for a six-Mac-mini wall shelf.

Homepage evidence summary:

> The governing sustained-load case calculated 0.064 mm deflection and 1.42 MPa
> peak stress, a 3.5x margin against the selected 5 MPa PLA creep ceiling.

The deeper page will explicitly state that Joe supplied the objective and
constraints while the agentic workflow performed toolchain verification,
research, modeling, analysis, iteration, rendering, slicing, and documentation.
This is the accurate meaning of “developed by Agentic AI” for this project.

## Evidence Model

### Recorded facts

- Design envelope: 170 x 160 x 106 mm.
- Modeled device envelope: 127 x 127 x 50 mm.
- Modeled service load: 48.8 N / 4.98 kg, representing six 0.73 kg units plus
  0.60 kg of stacking frames.
- Valid one-piece watertight solid, closed-manifold STL, and K1C build-envelope
  fit.
- Support-free geometry check: 53 sampled sections and zero outward area
  growth in the selected print orientation.
- FEM mesh: 167,186 nodes and 93,218 second-order tetrahedral elements.
- Governing sustained case: 0.064 mm displacement, 1.42 MPa peak von Mises
  stress, and 3.5x margin against the chosen 5 MPa creep ceiling.
- Governing transient overload case: 0.255 mm displacement and 5.69 MPa peak
  stress under a four-times front-edge load. This is not a recommended service
  load.
- Mesh refinement from 6 mm to 4 mm changed displacement by 0.09% and peak
  stress by 1.35%.
- Beam-theory comparison produced a FEM-to-hand deflection ratio of 0.909.
- Variant study creep margins: 3.5x with three internal gussets, 1.7x with one,
  and 1.2x with side walls only.
- OrcaSlicer result: 530 layers, 366.42 g of PLA, 11 h 45 m 52 s, and zero
  support blocks.

### Modeled assumptions

- Linear static FEM with isotropic PLA at E = 3000 MPa and Poisson ratio 0.36.
- A 5 MPa sustained-stress ceiling and 50 MPa transient yield comparison.
- The full back face is held rigidly.
- Loads are applied as distributed pressure rather than through four device
  feet.
- The continuum model treats the body as solid; the intended print uses four
  perimeters and 30% gyroid infill.
- The modeled shelf load does not validate drywall compliance, anchor pull-out,
  stack tipping, layer adhesion, heat exposure, or long-term material creep.

### Physical status

The public status is:

> Digitally validated prototype and manufacturing package. Physical print,
> installation, and load testing were not verified in the recovered evidence.

Follow-up printer history showed incomplete attempts, so the page must not use
“printed,” “installed,” “load-tested,” “production-ready,” or equivalent
language as an accomplished result.

A fresh read-only probe on 2026-09-03 found another matching shelf job active,
while the prior 23.79-hour run still had `printfinish: 0`. The signed-in
Creality Cloud workbench exposed a Time-Lapses tab, but its listing failed to
load and yielded no downloadable recording. These facts keep the physical
status unverified until later evidence changes it.

## Case Study Structure

The standard Work page remains the shell. The Mac mini entry supplies its
summary, problem, stakes, constraints, architecture, decisions, outcome,
lessons, recruiter significance, evidence, approval record, and SEO data.

A focused `MacMiniShelfProcess.astro` component is inserted only for this slug,
following the existing OpenXHC case-specific component pattern. It adds four
sections that the generic Work schema cannot express clearly:

1. **Agentic engineering loop**
   - recover and verify the FreeCAD/CalculiX/OrcaSlicer toolchain;
   - establish the device envelope, service load, printer envelope, and
     one-piece constraint;
   - generate a parametric FreeCAD solid and verify geometry changes;
   - prove K1C fit, watertightness, manifold output, and support-free orientation;
   - solve spread and front-edge service and four-times overload cases;
   - check the result against beam theory, mesh convergence, and a sharp-corner
     singularity demonstration;
   - compare gusset variants and retain the material needed for creep margin;
   - render, visually inspect, slice, cross-check reports, and package the
     evidence.
2. **Assumption register**
   - a compact table marking each item as measured artifact, modeled input,
     calculated result, or not physically verified.
3. **Four-case FEM matrix**
   - spread service, front-edge service, spread four-times overload, and
     front-edge four-times overload with displacement, stress, comparison
     limit, and interpretation.
4. **Why visual inspection mattered**
   - show how geometry, boundary-condition, mesh, stress-location, displacement,
     and print-orientation views exposed mistakes that scalar PASS results could
     hide;
   - explain the correction from a flattering centered-load/yield comparison to
     the governing front-edge/creep case.

The component is deliberately case-specific. A new general process schema is
not justified by one study.

## Visual Design

All visuals come from the retained FreeCAD/CalculiX render set. No generative
replacement, stock imagery, terminal screenshot, transcript screenshot, or
physical-photo claim is allowed.

Primary media:

- Hero/homepage image: the isometric shelf with one transparent Mac mini
  envelope, showing fit and ventilation clearly.

Evidence gallery:

1. Six-unit stack envelope on the shelf.
2. Support-free K1C print orientation.
3. Fixed back-face and applied front-edge boundary conditions.
4. Second-order tetrahedral mesh viewed from the underside.
5. Governing front-edge von Mises stress result.
6. Governing displacement field.
7. Exaggerated deformation shape, explicitly labeled as exaggerated rather
   than literal sag.

Each image keeps its original PNG as the full-size fallback. Responsive WebP
derivatives are generated at 640, 960, and 1440 pixels using the repository's
existing FFmpeg-based deterministic asset tooling. Captions state the load
case and evidentiary meaning. Alt text describes the engineering content, not
colors alone.

A 1200 x 630 social card will be generated deterministically from the authentic
fit render and site typography. It will not invent geometry or a physical
installation.

Optional physical media is handled separately:

- Joe's forthcoming photographs are accepted only from files he supplies for
  this case study, inspected at full resolution, stripped of location and
  device metadata, and captioned with only what is visibly established.
- A K1C time-lapse is accepted only when its cloud or printer history matches
  the shelf job and a completed physical result is also verified.
- If neither source clears those gates before release, no empty panel,
  stand-in image, printer-dashboard screenshot, or completion claim is
  published. The physical evidence can be added in a later scoped release.

## Implementation Shape

Expected new files:

- `apps/web/src/content/work/mac-mini-shelf.md`
- `apps/web/src/components/MacMiniShelfProcess.astro`
- `apps/web/public/media/mac-mini-shelf/` recovered and responsive visuals
- `apps/web/public/social/mac-mini-shelf.png`
- route-specific or content-contract tests needed to falsify unsupported claims

Only after verified physical media exists:

- sanitized photographs under `apps/web/public/media/mac-mini-shelf/physical/`
- a compact web MP4 and poster under the same directory when a matching K1C
  time-lapse is recoverable

Expected surgical edits:

- `apps/web/src/pages/work/[slug].astro` to insert the case-specific process
  component for the new slug.
- `apps/web/src/pages/work/index.astro` to change the supporting-study count and
  truthful index description from three to four.
- `apps/web/src/components/ProofGallery.astro` to broaden the supporting-work
  summary to include physical-product engineering and Agentic AI.
- Existing Work entries' `featuredOrder` values where needed to keep a unique,
  deterministic global sequence.
- Content, route, homepage, visual-surface, and visual-regression tests whose
  current assertions enumerate three supporting studies or the existing route
  set.
- The deterministic social-image generator only if required by its existing
  source map.

No new runtime or development dependency is required.

## Test-First Verification

Before adding the content, tests will be written and observed failing for these
behaviors:

- the homepage and Work index contain four supporting studies in the approved
  order;
- the new canonical route renders and is present in the sitemap;
- the page contains the Agentic AI responsibility boundary, governing creep
  case, assumption register, and unverified physical-status statement;
- the page does not claim a successful physical print or installation;
- all referenced media exists, has the declared dimensions, and comes from the
  approved source inventory;
- any physical photograph or time-lapse has a retained private source record,
  sanitized public derivative, and completed-print evidence;
- the case-specific process component renders only for the Mac mini shelf;
- desktop and mobile layouts have no overflow and retain 44-pixel touch targets;
- no-JavaScript and reduced-motion states retain the complete narrative and
  image evidence;
- the new social asset is a valid 1200 x 630 PNG.

After the red-green implementation cycle:

1. Run formatting/lint, type checking, unit and contract tests, production
   build, Rust formatting/clippy/tests, and focused Playwright checks.
2. Render 390 x 844, 820 x 1180, and 1440 x 1200 captures for the homepage,
   Work index, and case study.
3. Inspect every capture and every published source image at full resolution.
4. Run no-JavaScript, reduced-motion, accessibility, console, broken-link,
   private-content, metadata, sitemap, canonical, and security-header checks.
5. Update visual baselines only after confirming the differences are the
   intentional new Work entry and route.

## Preview, Approval, And Production

The content begins with `redactionStatus: reviewed`. Before setting it to
`approved`, the exact source revision must have:

- passing feature-branch CI;
- a Cloudflare provider preview pinned to that revision;
- agent/browser inspection at desktop and mobile widths;
- full-resolution media inspection and private-content scanning;
- completed-print provenance and metadata sanitization for any physical media;
- recorded artifact-inspection evidence;
- Joe's already-recorded publication authorization, described without claiming
  that he personally inspected the preview.

After those gates, record structured approval evidence, set the case study to
`approved`, rerun CI, and merge through a reviewable pull request. Production
verification must prove:

- main-branch CI and Cloudflare deployment succeeded for the exact merge SHA;
- `/`, `/work/`, and `/work/mac-mini-shelf/` return 200 on the custom domain;
- the sitemap and canonical URL include the new route;
- the published media has the expected bytes/dimensions and cache/security
  headers;
- desktop/mobile, no-JavaScript, reduced-motion, console, accessibility, and
  visual behavior remain correct;
- the prior production deployment remains identified and reachable as the
  rollback target.

This is a scoped frontend content release. It does not close or redefine the
repository's broader API/contact/global-launch issues.

## Exclusions

- No STL, STEP, FCStd, G-code, OrcaSlicer profile, raw FEM input, private
  transcript, or absolute local path is published.
- No physical shelf photograph is fabricated or substituted.
- No printer-dashboard or active-print screenshot is presented as a completed
  physical result.
- No certification, code compliance, anchor qualification, product warranty,
  or safe-load recommendation is claimed.
- No unrelated portfolio refactor, visual-system redesign, dependency change,
  resume edit, or new interactive subsystem is included.
