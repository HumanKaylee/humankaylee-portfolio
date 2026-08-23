# Conformal Cooling Channel Case Study Design

**Status:** Approved design
**Date:** 2026-08-17
**Portfolio route:** `/work/conformal-cooling-channel-generation/`
**Portfolio target:** Cloudflare Pages preview; production requires separate explicit approval
**Source project:** `HumanKaylee/ConformalChannelCreator` at capture commit `43346f9b7a92454d8ee2738bc5332897947c595b`

## 1. Purpose

Add ConformalFlow to Joe Poznanski's portfolio as a dedicated, evidence-led flagship case study. The page will show how an injection-mold cavity moves through parameter selection, conformal cooling-channel generation, manufacturability checks, split-mold output, and reviewable 3D artifacts.

The case study must be grounded in a fresh run of the real private application. It will use original synthetic geometry and publish captured media and verified results, not a public deployment of the FastAPI/React application.

## 2. Goals

- Recover the omitted conformal cooling-channel work as a first-class Work entry.
- Make the workflow understandable to both engineering and recruiting audiences.
- Show authentic application UI, generated geometry, mold halves, ports, and validation evidence.
- Demonstrate Joe's work across computational geometry, manufacturing constraints, asynchronous processing, validation, and operator-facing visualization.
- Keep the portfolio static, fast, accessible, and independent of the ConformalFlow backend.
- Leave a clean place for Joe's physical printed-mold photographs when they become available, without shipping placeholders before then.
- Preserve the existing Signal / Proof visual system and preview-before-production release process.

## 3. Non-goals

- No public hosting of the ConformalFlow API or React application.
- No embedded live CAD editor or mandatory WebGL experience in the portfolio.
- No publication of the private source repository, local paths, logs, account information, or development credentials.
- No use of downloaded CAD models with uncertain authorship or licensing.
- No claim that the alpha application or its generated molds are production-qualified.
- No cycle-time, thermal-performance, hydraulic-performance, or manufacturability claim without evidence produced by the fresh capture run.
- No use of the repository README's unverified `20-50%` cycle-time reduction statement.
- No empty physical-prototype section before Joe supplies the photographs.

## 4. Chosen approach

Use a captured-workflow presentation. The private application produces first-party artifacts in a controlled local run; the portfolio receives only optimized media, accessible descriptions, and evidence derived from that run.

This approach is preferred over an embedded 3D viewer because it avoids a WebGL runtime and preserves a complete no-JavaScript experience. It is preferred over hosting the full tool because a public API would add security, availability, and maintenance obligations without improving the core portfolio story.

## 5. Source and evidence boundary

The initial capture source is the restored `HumanKaylee/ConformalChannelCreator` repository at commit `43346f9b7a92454d8ee2738bc5332897947c595b`. The implementation must record the exact source commit actually used. If the source project requires a repair before it can complete the selected workflow, that repair must:

1. reproduce the failure first;
2. add a falsifiable regression test;
3. remain surgical and separately committed in the source repository; and
4. replace the capture commit in the final provenance record.

The portfolio may describe only behavior observed in the final real run or directly supported by inspected source. Mocks, fixtures, hand-created output, and README claims are development aids, not publication evidence.

## 6. Demonstration geometry and workflow

The primary demonstration uses the repository's original parameterized gear cavity. It is visually distinctive, exercises contour-following behavior, and avoids third-party asset provenance.

The recorded workflow is:

1. Generate or load the original gear cavity.
2. Show the input geometry in the left Three.js viewer.
3. Show the selected material and manufacturing constraints.
4. Start a real generation job through the application.
5. Show the progress timeline and live status output.
6. Show the completed cavity wireframe with solid conformal channels.
7. Show a transparent cutaway that makes channel clearance legible.
8. Show separated top and bottom mold halves with inlet and outlet ports.
9. Show the validation results and exportable artifacts.

The capture must not special-case the demo input inside production code. The same public application path used for an ordinary supported input must produce the recorded result.

## 7. Case-study narrative

### Title

**Conformal Cooling Channel Generation**

### Lead copy

> ConformalFlow is an engineering prototype that converts injection-mold cavity geometry into conformal cooling-channel designs for additive manufacturing. It combines parameterized routing, split-mold generation, ports, and manufacturing checks for clearance, continuity, overhangs, powder removal, and flow through a React and Three.js interface backed by a Python geometry and validation engine.

Final copy may tighten rhythm but may not broaden the verified boundary.

### Story structure

The detail page follows the established Work template:

1. Project number, discipline, and year.
2. Direct alpha-prototype outcome statement.
3. Full-width workflow video and poster.
4. At-a-glance role, system boundary, primary constraint, and strongest evidence.
5. Injection-mold cooling problem and engineering stakes.
6. Manufacturing and geometry constraints.
7. Joe's responsibility across architecture, geometry, validation, UI, and capture.
8. Python/FastAPI/WebSocket/React/Three.js system boundary.
9. Critical decisions and tradeoffs.
10. Fresh evidence and known limits.
11. Media gallery.
12. Reflection and next improvement.
13. Transition to the next Work entry.

### Critical decisions

- **Original synthetic geometry:** choose reproducibility and clear provenance over a visually richer downloaded CAD model.
- **Manufacturing-aware generation:** expose clearance, connectivity, overhang, powder-removal, port, and split-mold constraints rather than presenting channel paths as decorative geometry.
- **Captured proof:** publish verified static assets rather than create a public backend or a portfolio-only simulation.

## 8. Portfolio placement and ordering

Conformal Cooling Channel Generation becomes a second `flagship` Work entry. Cryogenic Flow remains the homepage hero and first flagship; Conformal Cooling appears second.

The Work collection gains an explicit positive integer `featuredOrder` for every published entry. Existing entries are updated together so callers no longer infer importance from title sorting:

1. Cryogenic Flow Simulation
2. Conformal Cooling Channel Generation
3. Black-Scholes Rust/WASM
4. CLI Fleet Synchronization
5. Remote Workstation Recovery

The homepage hero selects the first flagship by `featuredOrder`. The homepage proof gallery renders both flagships followed by the supporting Black-Scholes demonstration. The Work index accepts exactly two flagships, one supporting entry, and two archive entries. Visitor-facing singular copy is updated to describe multiple flagship systems.

## 9. Media set

### Primary loop

- Silent H.264 MP4.
- Between 8 and 12 seconds.
- 960 by 540 pixels at 30 frames per second.
- At most 2 MiB, matching the existing loop contract.
- Shows input geometry, active generation, and the completed cavity/channel overlay.
- Includes a poster that communicates the result without playback.
- Does not restart after a visitor manually pauses it.

### Full workflow video

- Silent H.264 MP4 with native controls.
- Target length of 30 to 45 seconds.
- Capture viewport of 1536 by 864 pixels at 30 frames per second.
- At most 20 MiB so the asset remains below Cloudflare Pages' per-file limit with margin.
- Uses `preload="none"`, a descriptive poster, and an adjacent written equivalent.
- Shows the complete sequence defined in Section 6 without jump cuts that imply a step completed when it did not.

### Still gallery

Publish four first-party WebP figures:

1. Input gear cavity.
2. Transparent cavity with conformal channels.
3. Separated mold halves with inlet and outlet ports.
4. Validation and export result.

Each figure has 640, 960, and 1440 pixel renditions, explicit dimensions, concise alternative text, and a caption describing what the image proves. The gallery uses one-column reading order on mobile and a two-column editorial grid at wider viewports.

### Physical prototype photographs

Joe's photographs are a later additive update. When supplied, they receive ownership review, basic color and crop normalization, responsive derivatives, descriptive alt text, and a clearly labeled `Physical prototype` subsection. Until then, the subsection is absent.

Animated GIFs are not part of the production asset set because MP4 provides smaller files, pause controls, and better decoding behavior.

## 10. Capture and provenance pipeline

Capture occurs outside the portfolio repository in a dedicated artifact directory. The pipeline produces:

- the source commit and clean/dirty state;
- the exact environment and commands used;
- source-project test results;
- the input geometry identifier and generation parameters;
- generated output filenames and cryptographic hashes;
- application screenshots and raw video;
- encoded loop, full video, posters, and responsive stills;
- geometry and workflow validation results; and
- a manifest connecting every published asset to the run.

Only final optimized public assets are copied into `apps/web/public/media/conformal-cooling/`. Development logs, raw uploads, local paths, temporary models, and unpublished captures stay outside the portfolio repository.

## 11. Portfolio component and schema changes

The implementation extends existing generic boundaries instead of creating a ConformalFlow-only page component.

### Work schema

- Add required `featuredOrder` to published Work entries.
- Add an optional `evidenceMedia` array for image and video figures.
- Each figure contains its kind, source, optional poster, responsive sources where applicable, dimensions, alt text, and caption.
- Validate that image figures have a source set and video figures have both source and poster.
- Required public assets remain build failures when missing.

### `MediaFrame`

- Remove the Cryogenic Flow-specific responsive poster paths.
- Read responsive sources from the current Work media record.
- Preserve poster-only, controlled-video, fallback-link, and evidence-flow behavior.

### `CaseStudyMediaGallery`

- New generic Astro component that renders `evidenceMedia` in document order.
- Uses semantic `figure` and `figcaption` markup.
- Keeps native video controls and no-JavaScript image parity.
- Omits itself when a Work entry has no additional media.

### Page callers

- Render the gallery on Work detail pages after Proof and before Reflection.
- Sort Work and homepage records by `featuredOrder`.
- Keep Cryogenic Flow as the hero media source.
- Update Work and proof-gallery copy and structural assertions for two flagships.

No frontend framework or runtime dependency is added to the portfolio.

## 12. Data flow

```text
Original gear cavity
        |
        v
Private ConformalFlow application
Python geometry engine -> FastAPI/WebSocket -> React/Three.js UI
        |
        v
Real generation outputs + validation results + capture manifest
        |
        v
Optimized MP4/WebP assets with hashes
        |
        v
Validated Astro Work record
        |
        v
Static homepage, Work index, and case-study HTML on Cloudflare Pages
```

The portfolio never calls the ConformalFlow API. Essential narrative and media metadata are validated at build time and rendered statically.

## 13. Error and fallback behavior

- A source-project test or real generation failure blocks capture acceptance.
- A failed optional source feature is omitted or disclosed as a limit; it is not mocked for publication.
- A missing required video, poster, responsive image, or résumé asset fails the portfolio build.
- Video playback failure leaves the poster, caption, written equivalent, and direct file link usable.
- Reduced-motion visitors receive posters and explicit playback controls with no automatic video request.
- JavaScript failure leaves the complete case-study text, stills, captions, and links readable.
- An absent physical-photo set removes that optional subsection without a placeholder.
- Any asset with uncertain ownership is excluded.

## 14. Accessibility and performance

- All meaningful video content has an adjacent written equivalent.
- Native controls remain visible on the full workflow video.
- The silent loop has an explicit pause/resume control and respects reduced motion.
- Alternative text describes the engineering evidence rather than repeating filenames or captions.
- Captions explain the relationship between cavity, channels, mold halves, ports, and validation.
- Gallery reading order remains logical at every viewport.
- Media has explicit dimensions to prevent layout shift.
- Only the visible loop or poster is eligible for early loading; full video and gallery assets load lazily.
- Existing bundle and Lighthouse budgets remain unchanged.

## 15. Verification strategy

### ConformalFlow source

- Establish the supported Python and Node environments from repository files.
- Run formatting/linting, type checking, backend tests, frontend tests, and frontend build using the project's declared commands.
- Record skips and optional-dependency exclusions rather than reporting them as passes.
- Run the primary gear-cavity workflow against the real backend and UI.
- Assert that the job completes, expected geometry/export artifacts exist, and selected validation checks report real results.
- Include at least one negative validation case that a permissive or disconnected implementation would fail.

### Capture artifacts

- Inspect every still and video visually.
- Use `ffprobe` to verify codecs, dimensions, duration, frame rate, pixel format, audio-stream absence, and MP4 fast-start compatibility.
- Verify posters match meaningful video states.
- Hash the public assets and compare them with the provenance manifest.
- Confirm UI text and geometry remain readable at the published render size.

### Portfolio

- Begin behavioral changes with failing tests.
- Validate the expanded Work schema and required assets.
- Test exactly two flagships, explicit ordering, and Cryogenic Flow hero selection.
- Test the new canonical route, metadata, structured data, sitemap, Next Work sequence, and route coverage.
- Test gallery semantic structure, responsive sources, alt text, captions, and missing-optional-gallery behavior.
- Test loop pause/resume, autoplay rejection, page visibility, reduced motion, and no-JavaScript fallbacks.
- Run lint, type checking, unit tests, production build, bundle budget, Rust formatting/clippy/tests, and the complete browser suite.
- Run axe and keyboard checks on the new case study.
- Capture and inspect desktop and mobile screenshots for Home, Work, and the new detail route.
- Deploy only to a Cloudflare Pages preview after local gates pass.
- Inspect the preview in a real browser and verify its routes, headers, canonicals, media playback, console, responsive layout, and rollback isolation.

Mocks and fixtures may help development but do not satisfy the real-run or preview evidence requirements.

## 16. Release boundary

This feature stops at a verified Cloudflare Pages preview. It does not alter the production deployment as part of implementation. Production requires Joe to inspect and explicitly approve the preview, followed by a separate production deployment and live verification pass with the existing production deployment retained for rollback.

The portfolio branch is not silently merged or pushed as part of the design or planning phases.

## 17. Acceptance criteria

The corrective case study is ready for preview review when all of the following are true:

- The new canonical Work route builds and is linked from Home and Work.
- Home retains Cryogenic Flow as its hero and shows both flagship projects in explicit order.
- The new page accurately explains the alpha prototype, its architecture, its manufacturing constraints, and its limits.
- The published media comes from a fresh real run using original synthetic gear geometry.
- The loop, full workflow video, four still figures, posters, and responsive derivatives pass structural and visual inspection.
- Every public metric is backed by captured run evidence; unsupported performance claims are absent.
- The source project and portfolio verification gates pass with skips and limits reported precisely.
- Reduced-motion, no-JavaScript, keyboard, accessibility, and media-failure experiences remain complete.
- The preview passes desktop and mobile visual inspection and live route, header, canonical, console, and media checks.
- Production remains unchanged pending explicit approval.

## 18. Principal tradeoff

The design favors reproducible captured evidence over a live interactive CAD application. Visitors cannot manipulate the model directly, but they receive a faster, safer, more accessible account of a real end-to-end workflow with clearer evidence and no runtime dependency on a private engineering tool.
