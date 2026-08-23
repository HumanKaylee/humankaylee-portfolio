# Conformal Cooling Case Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Add an evidence-led Conformal Cooling Channel Generation flagship case study to the portfolio, backed by a fresh real run of the private ConformalFlow application, and deliver it to a verified Cloudflare Pages preview without changing production.

**Architecture:** Keep ConformalFlow private and use it only as the evidence producer. A deterministic first-party gear input goes through the real FastAPI/WebSocket/React/Three.js path; a capture pipeline records the completed job, generated exports, test evidence, and source commit. Only sanitized, optimized MP4/WebP media and a manifest enter the static Astro portfolio. The portfolio gains generic ordered-work and evidence-gallery contracts rather than project-specific rendering code.

**Tech Stack:** Python 3.10+, pytest, trimesh, PyVista, FastAPI, Uvicorn, React 18, Three.js, Vite 5, Vitest, Playwright, Node.js, ffmpeg/ffprobe, Astro 7, TypeScript 5, Zod, Vitest, pnpm, Cloudflare Pages/Wrangler.

## Global Constraints

- Use the approved design at docs/superpowers/specs/2026-08-17-conformal-cooling-case-study-design.md as the contract. Do not soften it to match an easier implementation.
- Keep the source application private. Do not deploy its API or React application and do not publish source, raw uploads, logs, credentials, usernames, or machine-local paths.
- Establish evidence from a fresh real application run. A fixture may provide original input geometry, but mocks, replayed responses, hand-authored outputs, and README claims are not publication evidence.
- Use source commit 43346f9b7a92454d8ee2738bc5332897947c595b unless a reproduced defect requires a separately tested source repair. If a repair is necessary, update the capture manifest and case-study evidence boundary to the exact replacement commit.
- The UI/API workflow proves cavity loading, channel generation, validation, progress reporting, and API export. The repository's separate split-mold generator proves split halves and ports. Captions must distinguish those paths and must not imply the UI job created artifacts it did not create.
- Use original synthetic gear geometry only. Do not download third-party CAD.
- Never publish the README's 20-50% performance claim or any unmeasured thermal, hydraulic, cycle-time, or production-qualification claim.
- Preserve Cryogenic Flow as homepage hero and first flagship. Required published order is Cryogenic 1, Conformal 2, Black-Scholes 3, CLI Fleet 4, Remote Recovery 5.
- Do not add a portfolio runtime dependency. Use existing Astro, Zod, MotionLoop, CSS, and native HTML media behavior.
- The primary loop must be silent H.264, 960x540, 30 fps, 8-12 seconds, yuv420p, fast-start, and no larger than 2,097,152 bytes.
- The full workflow must be silent H.264, 1536x864, 30 fps, target 30-45 seconds, yuv420p, fast-start, and no larger than 20 MiB.
- Each of the four stills must have 640, 960, and 1440 pixel WebP renditions with explicit dimensions, engineering-focused alt text, and a truthfully scoped caption.
- Keep production unchanged. Deployment in this plan means a branch preview only. Pushing, merging, and publishing production remain separate outward-facing actions requiring explicit approval.
- Preserve unrelated worktree changes. Before every commit, inspect git diff and stage only the files belonging to that task.
- Follow red-green-refactor. Every behavioral change starts with a falsifiable failing test, and no existing gate may be weakened or deleted to manufacture a pass.
- Commit source-repository and portfolio-repository changes separately. Never combine files from the two repositories in one commit.

## Definition of Done

- A fresh real gear-cavity workflow completes through the application UI and backend, and its expected exports exist and have recorded SHA-256 hashes.
- Source tests, selected negative validation, environment, exact commands, source commit, clean/dirty state, parameters, timestamps, and exported artifact hashes are recorded in a sanitized manifest.
- The accepted media set contains one primary loop, one full workflow video, four stills at three widths, meaningful posters, and no audio stream.
- The portfolio builds a canonical /work/conformal-cooling-channel-generation/ route with accurate narrative, verified limits, gallery semantics, responsive assets, and Next Work navigation.
- Home uses Cryogenic Flow as hero and renders Cryogenic, Conformal, then Black-Scholes in the proof gallery. Work renders two flagships, one supporting item, and two archive items in explicit order.
- Schema, unit, contract, browser, accessibility, visual, build, budget, Rust, and source-project gates pass, with any genuine optional skip reported precisely.
- A Cloudflare branch preview is visually and behaviorally verified on desktop and mobile. The recorded production deployment and rollback state are unchanged.

## Repositories and Working Directories

- Portfolio worktree: C:\Users\joepo\Documents\Codex\work\humankaylee-verify-20260815-112146-4f06d5\.worktrees\signal-proof-rewrite
- ConformalFlow source: C:\Users\joepo\Documents\Codex\work\ConformalChannelCreator-portfolio-recovery-20260817
- Capture artifact root: C:\Users\joepo\Documents\Codex\work\conformal-cooling-capture-20260817
- Portfolio public media destination: apps/web/public/media/conformal-cooling/

Create the capture artifact root outside both repositories. Raw recordings, local manifests, generated STL/3MF files, and logs stay there. Only sanitized public media and the public manifest are copied into the portfolio.

---

## Task 1: Establish Source Baseline and Deterministic Gear Input

**Files:**

- Create: ConformalFlow/scripts/portfolio_capture/generate_gear_fixture.py
- Create: ConformalFlow/tests/test_portfolio_capture.py
- Verify: ConformalFlow/pyproject.toml
- Verify: ConformalFlow/generate_conformal_cooling_molds.py

**Success criterion:** A deterministic, watertight, first-party gear cavity can be generated from a documented function and exported as STL; invalid tooth counts fail loudly; the unchanged source baseline is recorded before edits.

- [ ] Step 1: Record the exact baseline without changing source.

Run from the ConformalFlow repository:

    git status --short --branch
    git rev-parse HEAD
    conda run -n conformal python -m pytest -q
    conda run -n conformal python -m ruff check .
    conda run -n conformal python -m mypy src
    npm test -- --run
    npm run build

Run the npm commands from ConformalFlow/frontend. Save stdout, stderr, exit code, and tool versions under the capture artifact root. If a baseline command fails because an optional dependency is intentionally absent, record the exact exclusion; do not report it as passing and do not broaden this task into unrelated cleanup.

- [ ] Step 2: Add failing tests for the gear fixture.

In tests/test_portfolio_capture.py, import build_gear_cavity and write_gear_fixture. Assert:

    def test_build_gear_cavity_is_watertight_and_deterministic():
        first = build_gear_cavity()
        second = build_gear_cavity()
        assert first.is_watertight
        assert first.faces.shape[1] == 3
        assert first.vertices.tobytes() == second.vertices.tobytes()
        assert first.faces.tobytes() == second.faces.tobytes()
        assert np.allclose(first.extents, [60.0, 60.0, 25.0], atol=0.25)

    def test_build_gear_cavity_rejects_too_few_teeth():
        with pytest.raises(ValueError, match="teeth"):
            build_gear_cavity(teeth=5)

    def test_write_gear_fixture_exports_reloadable_stl(tmp_path):
        evidence = write_gear_fixture(tmp_path / "gear-cavity.stl")
        loaded = trimesh.load_mesh(tmp_path / "gear-cavity.stl")
        assert loaded.is_watertight
        assert evidence["sha256"] == sha256_file(tmp_path / "gear-cavity.stl")

- [ ] Step 3: Run the focused test and watch it fail for the missing module.

    conda run -n conformal python -m pytest tests/test_portfolio_capture.py -q

Expected: FAIL because scripts.portfolio_capture.generate_gear_fixture does not exist.

- [ ] Step 4: Implement the smallest deterministic fixture generator.

Expose these exact interfaces:

    def build_gear_cavity(
        teeth: int = 12,
        inner_radius: float = 24.0,
        outer_radius: float = 30.0,
        height: float = 25.0,
    ) -> trimesh.Trimesh

    def write_gear_fixture(output_path: Path) -> dict[str, object]

Construct alternating inner/outer radius points around the XY perimeter, duplicate them at z=0 and z=height, triangulate top/bottom fans and side quads, and fix consistent face winding. Validate teeth >= 6, positive radii, outer_radius > inner_radius, and positive height. Export STL and return only stable evidence: geometry identifier, parameters, vertex count, face count, watertight flag, extents, output filename, and SHA-256. Do not include an absolute path.

- [ ] Step 5: Run focused and source regression checks.

    conda run -n conformal python -m pytest tests/test_portfolio_capture.py -q
    conda run -n conformal python -m pytest -q
    conda run -n conformal python -m ruff check scripts/portfolio_capture tests/test_portfolio_capture.py
    conda run -n conformal python -m mypy scripts/portfolio_capture/generate_gear_fixture.py

- [ ] Step 6: Generate the real input fixture into the external artifact directory and inspect its evidence.

    conda run -n conformal python scripts/portfolio_capture/generate_gear_fixture.py --output C:\Users\joepo\Documents\Codex\work\conformal-cooling-capture-20260817\input\gear-cavity.stl

Open/render the generated mesh and confirm the 12-tooth gear silhouette, closed top/bottom surfaces, expected height, and no visibly inverted faces.

- [ ] Step 7: Commit only the fixture generator and tests in ConformalFlow.

    git add scripts/portfolio_capture/generate_gear_fixture.py tests/test_portfolio_capture.py
    git diff --cached --check
    git commit -m "test: add deterministic portfolio gear fixture"

---

## Task 2: Make the Development Proxy Selectable Without Disturbing Port 8080

**Files:**

- Create: ConformalFlow/frontend/config/proxy-targets.ts
- Create: ConformalFlow/frontend/config/proxy-targets.test.ts
- Modify: ConformalFlow/frontend/vite.config.ts

**Success criterion:** Existing developers keep the 8080 default, while capture can point both HTTP and WebSocket traffic at 127.0.0.1:18080 through one environment variable. No process using port 8080 is stopped.

- [ ] Step 1: Add failing tests for default, custom HTTP, and derived WebSocket targets.

Define expected behavior:

    resolveProxyTargets({}) ==
        { apiTarget: "http://localhost:8080", wsTarget: "ws://localhost:8080" }

    resolveProxyTargets({ CONFORMAL_API_TARGET: "http://127.0.0.1:18080/" }) ==
        { apiTarget: "http://127.0.0.1:18080", wsTarget: "ws://127.0.0.1:18080" }

    resolveProxyTargets({ CONFORMAL_API_TARGET: "ftp://invalid" })

The invalid protocol case must throw a clear error mentioning CONFORMAL_API_TARGET.

- [ ] Step 2: Run the new test and confirm it fails because the module is missing.

    npm test -- --run config/proxy-targets.test.ts

- [ ] Step 3: Implement and wire the resolver.

Export:

    export type ProxyTargets = {
      apiTarget: string;
      wsTarget: string;
    };

    export function resolveProxyTargets(
      env: Record<string, string | undefined>,
    ): ProxyTargets

Accept only http: or https:. Remove a trailing slash. Derive ws: from http: and wss: from https:. In vite.config.ts, call loadEnv(mode, process.cwd(), "") and use the resolved targets for /api and /ws. Preserve every existing Vite option.

- [ ] Step 4: Run focused, frontend, and build checks.

    npm test -- --run config/proxy-targets.test.ts
    npm test -- --run
    npm run build

- [ ] Step 5: Live-smoke the custom proxy without stopping the existing process on 8080.

Start the backend from the ConformalFlow root:

    conda run -n conformal python -m uvicorn conformal_cooling.api.server:app --host 127.0.0.1 --port 18080

In a separate PowerShell launched in ConformalFlow/frontend:

    $env:CONFORMAL_API_TARGET = "http://127.0.0.1:18080"
    npm run dev -- --host 127.0.0.1 --port 3001

Verify http://127.0.0.1:3001 loads and a request through /api reaches the backend. Confirm the owner of port 8080 before and after the smoke check; it must remain untouched.

- [ ] Step 6: Commit the proxy change in ConformalFlow.

    git add frontend/config/proxy-targets.ts frontend/config/proxy-targets.test.ts frontend/vite.config.ts
    git diff --cached --check
    git commit -m "feat: make development API proxy configurable"

---

## Task 3: Add a Real Workflow Capture and Provenance Harness

**Files:**

- Create: ConformalFlow/scripts/portfolio_capture/capture_workflow.mjs
- Create: ConformalFlow/scripts/portfolio_capture/capture_workflow.test.mjs
- Modify: ConformalFlow/package.json only if a capture script entry is useful and follows the existing package layout

**Success criterion:** Playwright drives the ordinary UI against a live backend, waits for a completed job, verifies the real output files, and writes a local provenance manifest. A failed/incomplete job or missing expected export makes the harness fail.

- [ ] Step 1: Add tests for strict result validation and manifest sanitization.

Export pure functions:

    export function assertCompletedCapture(job, artifactRecords)
    export function sanitizeCaptureManifest(manifest, allowedRoot)
    export function sha256File(filePath)

Positive assertions require job.status === "completed" and non-empty records for channels.stl, channels.3mf, cavity.stl, and channels_only.stl. Negative tests must prove that status "running", a missing channels.3mf, a zero-byte file, an absolute Windows path, and a secret-shaped key such as token or password are rejected or removed as appropriate.

- [ ] Step 2: Run the tests and confirm they fail before implementation.

    node --test scripts/portfolio_capture/capture_workflow.test.mjs

- [ ] Step 3: Implement the pure validation helpers.

Use Node standard library only. The sanitized public representation may contain:

- source repository URL/name without credentials;
- source commit and clean/dirty boolean;
- Python/Node/package versions;
- fixture identifier and parameter values;
- job identifier;
- start, event, completion, and capture timestamps in ISO 8601;
- test command, exit status, and concise result;
- artifact basename, byte size, and SHA-256;
- validation name, observed value, pass/fail, and scope;
- published asset basename, byte size, dimensions/duration, and SHA-256.

It must not contain absolute paths, environment dumps, bearer strings, cookies, tokens, passwords, raw logs, or uploaded mesh bytes.

- [ ] Step 4: Implement the browser capture runner.

The runner accepts these argument shapes:

    --base-url http://127.0.0.1:3001
    --input C:\Users\joepo\Documents\Codex\work\conformal-cooling-capture-20260817\input\gear-cavity.stl
    --artifact-root C:\Users\joepo\Documents\Codex\work\conformal-cooling-capture-20260817
    --source-commit 40-character-git-object-id

It launches Chromium at 1536x864 with video recording enabled, selects the gear STL through the real file input, records the visible parameter values, clicks the ordinary Generate action, listens to application/WebSocket progress, and waits for the visible Generation Complete state. It captures named raw screenshots for input, active generation, completed overlay, and validation/export.

After completion, query the real API job response and filesystem result directory, require the four expected UI-job exports, hash them, and persist capture-manifest.local.json under the external artifact root. Do not inject a completed state into the page and do not call an internal generation function instead of the application route.

- [ ] Step 5: Add a deliberate live negative proof before accepting the harness.

Run once against an unreachable backend port or terminate the test backend after upload. The harness must exit nonzero and must not write an accepted manifest. Restore the correct backend and rerun; the complete application path must then succeed.

- [ ] Step 6: Run all capture harness tests and the frontend suite.

    node --test scripts/portfolio_capture/capture_workflow.test.mjs
    npm test -- --run
    npm run build

- [ ] Step 7: Commit the harness in ConformalFlow.

    git add scripts/portfolio_capture/capture_workflow.mjs scripts/portfolio_capture/capture_workflow.test.mjs package.json
    git diff --cached --check
    git commit -m "feat: capture real conformal workflow evidence"

Do not stage package.json if it was not changed.

---

## Task 4: Produce and Validate the Evidence Media

**Files:**

- Create: ConformalFlow/scripts/portfolio_capture/render_evidence.py
- Extend: ConformalFlow/tests/test_portfolio_capture.py
- Produce externally: conformal-cooling-capture-20260817/raw/
- Produce externally: conformal-cooling-capture-20260817/public/
- Produce externally: conformal-cooling-capture-20260817/capture-manifest.json

**Success criterion:** The media set is generated from the accepted run and separately documented split-mold generator, meets every technical contract, is visually legible, and can be traced by hash to the captured outputs.

- [ ] Step 1: Add failing renderer tests.

Test pure camera/scene configuration and an offscreen smoke render. Assert a transparent cavity/channel frame has a nonuniform alpha/content image, a split-mold frame contains two separated bounding boxes, and invalid/non-watertight input causes a clear failure. The tests must fail before render_evidence.py exists.

- [ ] Step 2: Implement deterministic PyVista renders.

Render at 1536x864:

- input-gear: neutral cavity surface with edge definition;
- cavity-channels: transparent cavity, solid high-contrast conformal channels;
- split-mold-ports: separated top/bottom mold halves with inlet/outlet ports visible.

Use fixed camera coordinates, neutral background, consistent materials, and no text baked into the images. Read actual generated meshes; do not recreate the finished channel shape merely for appearance.

- [ ] Step 3: Run source tests and commit the renderer.

    conda run -n conformal python -m pytest tests/test_portfolio_capture.py -q
    conda run -n conformal python -m ruff check scripts/portfolio_capture tests/test_portfolio_capture.py
    conda run -n conformal python -m mypy scripts/portfolio_capture/render_evidence.py

    git add scripts/portfolio_capture/render_evidence.py tests/test_portfolio_capture.py
    git diff --cached --check
    git commit -m "feat: render portfolio geometry evidence"

- [ ] Step 4: Run all applicable source checks immediately before capture.

Record the exact commit after Tasks 1-3, git status, tool versions, and results:

    git status --short
    git rev-parse HEAD
    conda run -n conformal python -m pytest -q
    conda run -n conformal python -m ruff check .
    conda run -n conformal python -m mypy src scripts/portfolio_capture

From frontend:

    npm test -- --run
    npm run build

The source worktree must be clean for an accepted run. If it is dirty, either commit the intended source change with tests or abort capture.

- [ ] Step 5: Execute the real UI capture.

Start backend 18080 and Vite 3001 using the commands in Task 2, generate the gear fixture, then run:

    $captureCommit = git rev-parse HEAD
    node scripts/portfolio_capture/capture_workflow.mjs --base-url http://127.0.0.1:3001 --input C:\Users\joepo\Documents\Codex\work\conformal-cooling-capture-20260817\input\gear-cavity.stl --artifact-root C:\Users\joepo\Documents\Codex\work\conformal-cooling-capture-20260817 --source-commit $captureCommit

Acceptance requires $captureCommit to be a 40-character object ID from the clean source worktree, visible input, a real running state, a completed state, API job status completed, and all four UI-job exports.

- [ ] Step 6: Run the real split-mold generator for the same parameterized gear family.

    conda run -n conformal python generate_conformal_cooling_molds.py --shape gear --resolution 1.0 --validate --output C:\Users\joepo\Documents\Codex\work\conformal-cooling-capture-20260817\split-mold

Record its exact command, output basenames, hashes, validation output, and the fact that it is a separate repository generator path rather than an export of the UI/API job.

- [ ] Step 7: Render the three geometry figures and use the completed UI screenshot as the fourth evidence figure.

The four source figures are:

1. input-gear;
2. cavity-channels;
3. split-mold-ports;
4. validation-export.

The fourth must be the accepted completed application UI state, not a mocked status panel.

- [ ] Step 8: Encode the media with ffmpeg.

Create:

- conformal-workflow-loop.mp4 at 960x540, 30 fps, 8-12 seconds;
- conformal-workflow.mp4 at 1536x864, 30 fps, target 30-45 seconds;
- conformal-workflow-loop-poster-640.webp, -960.webp, -1440.webp;
- conformal-workflow-poster-640.webp, -960.webp, -1440.webp;
- 640/960/1440 WebP derivatives for each of the four stills.

Use libx264, yuv420p, movflags +faststart, no audio mapping, and a quality setting adjusted only as much as necessary to meet size limits. Build the loop and workflow chronology from captured timestamps; do not use a cut that implies completion before the backend completed.

- [ ] Step 9: Validate every public media file mechanically.

Use ffprobe JSON output to assert:

- codec_name h264;
- expected width and height;
- avg_frame_rate 30/1;
- pix_fmt yuv420p;
- duration in the required range;
- zero audio streams;
- loop <= 2,097,152 bytes;
- full video <= 20 MiB.

Use image inspection to assert every WebP is decodable and has its named width. Hash all public files. Generate capture-manifest.json from the sanitizer and reject it if it contains C:\, /Users/, /home/, token, password, cookie, authorization, or bearer.

- [ ] Step 10: Visually inspect the complete media set at desktop and mobile presentation sizes.

Confirm the gear shape, channels, cutaway clearance, separated halves, ports, progress labels, validation labels, and export labels are readable. Confirm posters are meaningful stopped states and that there are no clipped controls, stale notifications, unrelated desktop content, usernames, paths, or secrets. Re-encode or recapture any illegible asset; do not compensate with a misleading caption.

---

## Task 5: Extend the Work Contract and Add Explicit Ordering

**Files:**

- Modify: apps/web/src/lib/contracts/work.ts
- Modify: apps/web/src/lib/contracts/work.test.ts
- Modify: apps/web/src/data/content-inventory.ts
- Modify: apps/web/src/data/content-inventory.test.ts
- Modify: apps/web/src/content/work/cryo-flow-sim.md
- Modify: apps/web/src/content/work/black-scholes-wasm.md
- Modify: apps/web/src/content/work/cli-fleet-synchronization-and-mcp-rollout.md
- Modify: apps/web/src/content/work/remote-workstation-recovery-and-operational-debugging.md

**Success criterion:** All published Work entries have a positive explicit featuredOrder, primary media can declare responsive poster sources, and optional evidence media is structurally validated with negative cases.

- [ ] Step 1: Add failing schema tests.

Add valid examples for:

    featuredOrder: 1
    responsivePosterSources:
      - src: /media/example-640.webp
        width: 640
      - src: /media/example-960.webp
        width: 960
      - src: /media/example-1440.webp
        width: 1440

    evidenceMedia:
      - kind: image
        src: /media/example-1440.webp
        responsiveSources: [...]
        width: 1440
        height: 810
        alt: ...
        caption: ...
      - kind: video
        src: /media/example.mp4
        poster: /media/example-poster-1440.webp
        responsivePosterSources: [...]
        width: 1536
        height: 864
        alt: ...
        caption: ...

Negative tests must reject missing/nonpositive featuredOrder, duplicate responsive widths within one source set, an image without responsiveSources, and a video without src, poster, or responsivePosterSources.

- [ ] Step 2: Run the focused tests and confirm the new expectations fail.

    pnpm exec vitest run apps/web/src/lib/contracts/work.test.ts apps/web/src/data/content-inventory.test.ts

- [ ] Step 3: Add the schemas and exported types.

In work.ts add:

    const workResponsiveSourceSchema = z.object({
      src: z.string().min(1),
      width: z.number().int().positive(),
    });

    const workEvidenceImageSchema = z.object({
      kind: z.literal("image"),
      src: z.string().min(1),
      responsiveSources: z.array(workResponsiveSourceSchema).min(1),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      alt: z.string().min(1),
      caption: z.string().min(1),
    });

    const workEvidenceVideoSchema = z.object({
      kind: z.literal("video"),
      src: z.string().min(1),
      poster: z.string().min(1),
      responsivePosterSources: z.array(workResponsiveSourceSchema).min(1),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      alt: z.string().min(1),
      caption: z.string().min(1),
    });

Add featuredOrder to the Work object, responsivePosterSources to primary media, and optional evidenceMedia as an array of the discriminated union. Enforce unique widths within each source set in superRefine. Export WorkResponsiveSource and WorkEvidenceMedia types.

- [ ] Step 4: Update current records and inventory fixtures together.

Set:

- cryo-flow-sim.md: featuredOrder 1;
- black-scholes-wasm.md: featuredOrder 3;
- cli-fleet-synchronization-and-mcp-rollout.md: featuredOrder 4;
- remote-workstation-recovery-and-operational-debugging.md: featuredOrder 5.

Give Cryogenic Flow's primary video the existing 640/960/1440 poster source set. For non-video/evidence-flow records, use the schema's smallest honest contract; do not invent nonexistent image files. Update content-inventory fixtures to match the final required fields.

- [ ] Step 5: Run the focused tests and content contract.

    pnpm exec vitest run apps/web/src/lib/contracts/work.test.ts apps/web/src/data/content-inventory.test.ts
    node --test scripts/work-content-contract.test.mjs
    pnpm typecheck

- [ ] Step 6: Commit the schema and existing records.

    git add apps/web/src/lib/contracts/work.ts apps/web/src/lib/contracts/work.test.ts apps/web/src/data/content-inventory.ts apps/web/src/data/content-inventory.test.ts apps/web/src/content/work
    git diff --cached --check
    git commit -m "feat: add ordered work evidence media contract"

---

## Task 6: Generalize Primary Media and Add the Evidence Gallery

**Files:**

- Modify: apps/web/src/components/MediaFrame.astro
- Create: apps/web/src/components/CaseStudyMediaGallery.astro
- Modify: apps/web/src/pages/work/[slug].astro
- Modify: tests/e2e/project-detail.spec.ts
- Modify: tests/e2e/accessibility or the closest existing accessibility test only if coverage is not already in project-detail.spec.ts

**Success criterion:** Primary posters come from record data, additional media renders semantically after Proof and before Reflection, video uses native controls/preload none, and records without evidenceMedia remain unchanged.

- [ ] Step 1: Add failing browser assertions for generic media behavior.

Extend project-detail.spec.ts with a temporary existing record path or fixture-driven page assertion that proves:

- MediaFrame's picture source set comes from the current record and does not contain hardcoded cryo-flow-sim-stage1 paths;
- a detail page without evidenceMedia has no [data-case-study-media-gallery];
- when evidenceMedia exists, figures retain source order;
- each image has alt text, explicit width/height, lazy loading, and a figcaption;
- gallery video has controls, preload="none", poster, fallback link, and written caption.

If a real Conformal record is required for the positive case, add the failing test now and keep it red until Task 7 rather than fabricating a production record.

- [ ] Step 2: Run the focused test and confirm the new assertions fail.

    pnpm test:e2e -- tests/e2e/project-detail.spec.ts --workers=1

- [ ] Step 3: Make MediaFrame data-driven.

Generate the WebP srcset by sorting media.responsivePosterSources by width and joining source plus width descriptor. Render the picture source only when sources exist. Keep the existing poster-only path, playback path, MotionLoop path, evidence-flow slot, dimensions, caption, and direct MP4 fallback. No Conformal or Cryogenic filenames may remain in MediaFrame.astro.

- [ ] Step 4: Implement CaseStudyMediaGallery.astro.

Props:

    type Props = {
      items?: WorkEvidenceMedia[];
      title?: string;
    };

Behavior:

- render nothing for undefined/empty items;
- otherwise render a labelled section with data-case-study-media-gallery;
- preserve array order;
- render each image in picture/figure/figcaption using a sorted WebP srcset and loading="lazy";
- render each video with native controls, preload="none", poster, MP4 source, descriptive aria-label, direct fallback link, and figcaption;
- use a single-column mobile flow and two-column wide editorial grid;
- use existing color, spacing, border, typography, and media-radius tokens.

- [ ] Step 5: Insert the gallery at the specified narrative boundary.

Import CaseStudyMediaGallery in pages/work/[slug].astro and render it after the Proof CaseStudySection and before Reflection:

    <CaseStudyMediaGallery items={data.evidenceMedia} />

Do not create a Conformal-only page branch.

- [ ] Step 6: Run component, browser, type, and accessibility checks.

    pnpm typecheck
    pnpm test:e2e -- tests/e2e/project-detail.spec.ts --workers=1
    pnpm exec playwright test tests/e2e/quality-gates.spec.ts --workers=1

- [ ] Step 7: Commit the generic rendering layer.

    git add apps/web/src/components/MediaFrame.astro apps/web/src/components/CaseStudyMediaGallery.astro apps/web/src/pages/work/[slug].astro tests/e2e/project-detail.spec.ts tests/e2e/quality-gates.spec.ts
    git diff --cached --check
    git commit -m "feat: add reusable case study media gallery"

Stage only test files actually changed.

---

## Task 7: Add the Conformal Record, Public Assets, and Two-Flagship Hierarchy

**Files:**

- Create: apps/web/src/content/work/conformal-cooling-channel-generation.md
- Create: apps/web/public/media/conformal-cooling/capture-manifest.json
- Create: apps/web/public/media/conformal-cooling/conformal-workflow-loop.mp4
- Create: apps/web/public/media/conformal-cooling/conformal-workflow.mp4
- Create: apps/web/public/media/conformal-cooling/*.webp
- Create: scripts/conformal-media-contract.test.mjs
- Modify: apps/web/src/pages/index.astro
- Modify: apps/web/src/pages/work/index.astro
- Modify: apps/web/src/pages/work/[slug].astro
- Modify: apps/web/src/components/ProofGallery.astro
- Modify: tests/e2e/signal-proof-home.spec.ts
- Modify: tests/e2e/work-routes.spec.ts
- Modify: tests/e2e/page-metadata.spec.ts
- Modify: tests/e2e/route-coverage.spec.ts
- Modify: tests/e2e/project-detail.spec.ts
- Modify: tests/e2e/quality-gates.spec.ts
- Modify: tests/e2e/taste-audit.spec.ts
- Modify: tests/e2e/visual-regression.spec.ts
- Modify: tests/e2e/visual-surfaces.spec.ts if its explicit route list requires the new page
- Modify: any route inventory assertion that enumerates all Work routes

**Success criterion:** The case study is fully linked and rendered in explicit order, every public asset is contract-tested against the sanitized manifest, all claims stay within observed evidence, and the expected navigation cycle contains five entries.

- [ ] Step 1: Add the media contract test before copying assets.

scripts/conformal-media-contract.test.mjs must:

- require the exact public filenames listed by capture-manifest.json;
- reject absolute paths and secret-shaped keys/values in the public manifest;
- recompute SHA-256 and byte sizes for every asset;
- invoke ffprobe and assert the exact loop/full video contracts;
- decode/inspect WebP dimensions and require 640, 960, and 1440 variants for both posters and all four stills;
- fail if any asset exceeds its limit or if an audio stream exists;
- require the manifest source commit to equal the literal accepted clean source commit.

Run it now and confirm failure because public assets do not exist:

    node --test scripts/conformal-media-contract.test.mjs

- [ ] Step 2: Copy only accepted sanitized public assets.

Copy from the external public artifact directory into apps/web/public/media/conformal-cooling/. Do not copy raw recordings, STL/3MF files, capture-manifest.local.json, logs, or local screenshots that are not part of the approved public set.

- [ ] Step 3: Run the media contract and confirm it passes.

    node --test scripts/conformal-media-contract.test.mjs

- [ ] Step 4: Add failing route, ordering, gallery, and copy assertions.

Update expected published order to:

    [
      "cryo-flow-sim",
      "conformal-cooling-channel-generation",
      "black-scholes-wasm",
      "cli-fleet-synchronization-and-mcp-rollout",
      "remote-workstation-recovery-and-operational-debugging",
    ]

Assert:

- homepage hero link/media still belongs to Cryogenic Flow;
- proof gallery shows three entries in order: Cryogenic, Conformal, Black-Scholes;
- exactly two flagship articles, one supporting article, and two archive articles render;
- Work index flagship order is Cryogenic then Conformal;
- Conformal detail has canonical URL and CreativeWork JSON-LD;
- Conformal detail gallery has five figures total when counting primary media plus four evidence figures;
- its full workflow video has controls and preload none;
- each of the four evidence figures has responsive 640/960/1440 WebP sources and a caption;
- Next Work transitions Cryogenic -> Conformal -> Black-Scholes -> CLI -> Remote -> Cryogenic;
- sitemap and route coverage include the new route;
- page text contains alpha/prototype and the evidence boundary;
- page text does not contain 20-50%, production-qualified, guaranteed, optimized cooling, or other unsupported claims.

Run the focused tests and confirm they fail before record/page changes:

    pnpm test:e2e -- tests/e2e/signal-proof-home.spec.ts tests/e2e/work-routes.spec.ts tests/e2e/page-metadata.spec.ts tests/e2e/route-coverage.spec.ts tests/e2e/project-detail.spec.ts --workers=1

- [ ] Step 5: Create the Work record with the approved evidence boundary.

Use:

- title: Conformal Cooling Channel Generation;
- slug: conformal-cooling-channel-generation;
- discipline: simulation;
- year: 2026, matching the source project's final implementation and validation work;
- placement: flagship;
- featuredOrder: 2;
- publicationStatus: publish;
- redactionStatus and redactionReview values that pass the existing publication-safety contract;
- primary media: full workflow video and responsive workflow poster;
- loop: accepted 960x540 loop and its poster;
- evidenceMedia: input gear, transparent cavity/channels, split mold/ports, validation/export.

Use the approved lead:

    ConformalFlow is an engineering prototype that converts injection-mold cavity geometry into conformal cooling-channel designs for additive manufacturing. It combines parameterized routing, split-mold generation, ports, and manufacturing checks for clearance, continuity, overhangs, powder removal, and flow through a React and Three.js interface backed by a Python geometry and validation engine.

The evidence summary must identify a fresh completed gear-cavity run and its captured artifacts without implying production qualification. The scope must state the exact source commit and distinguish the UI/API exports from the separate split-mold generator. The limits must state that thermal performance, hydraulic performance, cycle-time improvement, shop-floor manufacturability, and physical prototype behavior were not established by this capture.

Use exactly three decisions:

1. Original synthetic gear geometry for provenance and repeatability.
2. Manufacturing-aware generation/validation rather than decorative path rendering.
3. Captured static proof rather than a public backend.

Caption boundaries:

- Input gear: first-party deterministic cavity loaded through the normal UI file input.
- Cavity/channels: completed UI/API job overlay; name only validation states observed in the manifest.
- Split mold/ports: generated by the repository's separate split-mold command for the same gear family, not by the UI/API export job.
- Validation/export: completed real UI state and the exact four UI-job export basenames.

- [ ] Step 6: Replace inferred title ordering with featuredOrder.

In pages/index.astro:

- sort all published work by featuredOrder;
- derive flagships and supporting from that ordered list;
- require exactly two flagships;
- select flagships[0] as cryogenicFlow and assert its slug is cryo-flow-sim;
- define homepageProof as both ordered flagships plus ordered supporting entries.

In pages/work/index.astro:

- sort each placement by featuredOrder;
- require exactly two flagships, one supporting entry, and two archive entries;
- change singular introductory copy to plural flagship systems.

In pages/work/[slug].astro:

- sort the complete published collection by featuredOrder only;
- preserve cyclic Next Work behavior.

In ProofGallery.astro, change visitor copy from a singular flagship to plural flagship systems while preserving existing layout and labels.

- [ ] Step 7: Update all enumerated route and visual lists.

Add the Conformal route to explicit arrays in metadata, route coverage, project detail, quality/taste, visual regression, and visual surface tests. Add desktop and mobile visual snapshot names:

- work-conformal-cooling-desktop;
- work-conformal-cooling-mobile.

Do not update image baselines yet.

- [ ] Step 8: Run focused unit, contract, browser, and build checks.

    pnpm exec vitest run apps/web/src/lib/contracts/work.test.ts apps/web/src/data/content-inventory.test.ts
    node --test scripts/conformal-media-contract.test.mjs scripts/work-content-contract.test.mjs
    pnpm typecheck
    pnpm build
    pnpm test:e2e -- tests/e2e/signal-proof-home.spec.ts tests/e2e/work-routes.spec.ts tests/e2e/page-metadata.spec.ts tests/e2e/route-coverage.spec.ts tests/e2e/project-detail.spec.ts tests/e2e/quality-gates.spec.ts tests/e2e/taste-audit.spec.ts --workers=1

- [ ] Step 9: Review public copy against the manifest before committing.

For every number, validation state, output filename, and technology claim, point to the accepted manifest or inspected source. Search for banned/uncertain language:

    rg -n -i "20.?50|production.qualified|guarantee|cycle.time|thermal performance|hydraulic performance|optimized cooling" apps/web/src/content/work/conformal-cooling-channel-generation.md

Expected: no unsupported claim. Honest statements inside the Known limits section are allowed only when explicitly framed as unverified/not established.

- [ ] Step 10: Commit the complete portfolio capability.

    git add apps/web/src/content/work/conformal-cooling-channel-generation.md apps/web/public/media/conformal-cooling scripts/conformal-media-contract.test.mjs apps/web/src/pages/index.astro apps/web/src/pages/work/index.astro apps/web/src/pages/work/[slug].astro apps/web/src/components/ProofGallery.astro tests/e2e
    git diff --cached --check
    git commit -m "feat: add conformal cooling flagship case study"

Review git diff --cached --name-only before committing so unrelated tests or snapshots are not accidentally included.

---

## Task 8: Run Full Verification and Perform Visual QA

**Files:**

- Modify only if a real defect is found: implementation files from Tasks 5-7
- Modify after manual acceptance: tests/e2e/visual-regression.spec.ts-snapshots/*
- Produce externally: verification logs and review screenshots under the capture artifact root

**Success criterion:** Every applicable local gate passes, screenshots and media are visibly usable at desktop/mobile sizes, accessibility and reduced-motion behavior are confirmed, and any visual baseline update is intentional and reviewed.

- [ ] Step 1: Re-run the complete ConformalFlow verification at the exact manifest commit.

    git status --short --branch
    git rev-parse HEAD
    conda run -n conformal python -m pytest -q
    conda run -n conformal python -m ruff check .
    conda run -n conformal python -m mypy src scripts/portfolio_capture

From frontend:

    npm test -- --run
    npm run build

Confirm the source commit matches capture-manifest.json and the source worktree is clean.

- [ ] Step 2: Run the complete portfolio verification gates.

    pnpm lint
    pnpm typecheck
    pnpm test
    pnpm test:e2e -- --workers=1
    pnpm build
    pnpm bundle:budget
    cargo fmt --manifest-path apps/api/Cargo.toml --all -- --check
    cargo clippy --manifest-path apps/api/Cargo.toml --all-targets --all-features -- -D warnings
    cargo test --manifest-path apps/api/Cargo.toml --all-features
    pnpm lighthouse:local

Do not summarize a failing command as passed. Diagnose and fix only failures caused by this feature; report unrelated baseline failures precisely.

- [ ] Step 3: Run the media and public-data checks again from a clean portfolio worktree.

    node --test scripts/conformal-media-contract.test.mjs
    git grep -n -i -E "token|password|authorization|bearer|C:\\Users|/Users/|/home/" -- apps/web/public/media/conformal-cooling apps/web/src/content/work/conformal-cooling-channel-generation.md
    git status --short

Review every match. Expected public manifest/path result: no secret or local-path leakage.

- [ ] Step 4: Capture fresh local screenshots.

At desktop and mobile sizes capture:

- /;
- /work/;
- /work/conformal-cooling-channel-generation/.

Also inspect Cryogenic Flow and Black-Scholes detail pages to detect generic MediaFrame/gallery regressions. Keep screenshots outside the repository until approved.

- [ ] Step 5: Perform explicit visual and interaction review.

Confirm:

- Cryogenic Flow remains the hero;
- flagship order and numbering are correct;
- headline, paragraphs, evidence labels, and validation/export UI text are readable;
- the gallery is one column on mobile and two columns at wide viewports;
- images do not crop away channels, ports, validation, or export evidence;
- native video controls are visible and keyboard-operable;
- direct video fallback works;
- reduced motion prevents the loop request/autoplay and keeps the poster;
- manually pausing a loop does not allow it to restart;
- no-JavaScript rendering preserves narrative, stills, captions, and links;
- there is no empty physical-prototype placeholder;
- browser console has no error or failed asset request;
- axe reports no serious or critical violations.

- [ ] Step 6: Update visual snapshots only after inspection.

If the new intended layout changes an existing snapshot, state why it is correct, then run:

    pnpm test:visual:update
    pnpm test:visual

Inspect every changed PNG. Never accept a changed golden solely because the command generated it.

- [ ] Step 7: Commit only necessary verification fixes and intentional snapshots.

    git diff --name-only
    git diff --cached --check
    git commit -m "test: verify conformal cooling case study"

Inspect git diff --name-only, then stage each reviewed feature-owned filename explicitly with git add. Skip this commit if there are no file changes. Do not create an artificial file merely to force a verification commit.

---

## Task 9: Deploy and Verify a Cloudflare Pages Preview Only

**Files:**

- No source change expected
- Produce externally: preview deployment record, route/header checks, console results, and desktop/mobile screenshots

**Success criterion:** A branch preview built from the exact clean portfolio commit passes live checks, while the current production deployment and retained rollback remain unchanged.

- [ ] Step 1: Record the release boundary before deployment.

From the portfolio worktree:

    git status --short --branch
    git rev-parse HEAD
    pnpm exec wrangler pages deployment list --project-name humankaylee-portfolio

Record the current production deployment ID and retained rollback deployment ID. Abort if the portfolio worktree is dirty or the full local gate set in Task 8 is not green.

- [ ] Step 2: Build from the exact clean commit.

    pnpm build
    git status --short

Confirm dist was produced and no tracked file changed.

- [ ] Step 3: Deploy a branch preview, never the production branch.

    $portfolioHead = git rev-parse HEAD
    pnpm exec wrangler pages deploy dist --project-name humankaylee-portfolio --branch conformal-cooling-preview --commit-hash $portfolioHead --commit-dirty=false

Require $portfolioHead to be the 40-character object ID verified in Step 1. Record the preview deployment ID and URL. Do not run a production deploy command, merge a branch, or push a branch during this task.

- [ ] Step 4: Verify live preview routes and static assets.

Require HTTP success for:

- /;
- /work/;
- /work/conformal-cooling-channel-generation/;
- the loop MP4;
- the full MP4;
- every poster and still WebP named by capture-manifest.json;
- /sitemap-index.xml;
- /robots.txt.

Check canonical URLs, content type, cache/security headers, asset byte sizes, and sitemap inclusion. Canonicals should continue to use the production joepoznanski.io URLs even on preview.

- [ ] Step 5: Verify the preview in a real browser.

At desktop and mobile widths, inspect Home, Work, and Conformal detail. Exercise loop pause/resume, reduced motion, native full-video playback, direct fallback, keyboard focus, and Next Work. Confirm no console errors, failed requests, horizontal overflow, hidden controls, or illegible media.

- [ ] Step 6: Re-list deployments and prove production was not changed.

    pnpm exec wrangler pages deployment list --project-name humankaylee-portfolio

Compare against Step 1. The production deployment and rollback reference must be identical; only a new preview deployment may appear.

- [ ] Step 7: Stop and present the preview for approval.

Report:

- preview URL and deployment ID;
- exact portfolio commit;
- exact ConformalFlow capture commit;
- complete local/live gate summary;
- known evidence limits;
- confirmation that production remains unchanged;
- retained rollback deployment.

Do not continue to production without a new explicit approval from Joe.

---

## Final Self-Review Checklist

- [ ] Every design acceptance criterion maps to at least one task and verification step.
- [ ] The real UI/API job and separate split-mold generator are never conflated.
- [ ] No command stops or replaces the process currently using port 8080.
- [ ] Every new behavior has a failing test first and at least one negative assertion.
- [ ] Every proposed file path exists or is explicitly marked Create.
- [ ] All schema/type names are consistent across Work records, Astro components, and tests.
- [ ] There is no TODO, TBD, placeholder, fake metric, mock-as-proof, or unverified performance claim.
- [ ] Media dimensions, durations, codecs, audio absence, and size limits match the approved design.
- [ ] Production, push, and merge are outside this plan's authorized execution boundary.
- [ ] Each commit stages only task-owned files and leaves unrelated work untouched.
