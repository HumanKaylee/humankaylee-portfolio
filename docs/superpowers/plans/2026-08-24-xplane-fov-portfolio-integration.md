# X-Plane FOV Portfolio Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a sanitized X-Plane cabin-camera FOV trade study on the homepage and Work section, clarify Cryogenic Flow and Conformal Cooling copy, replace the confusing Conformal geometry view with a reproducible real-geometry render, improve crawler metadata, and verify the exact release on Cloudflare Pages.

**Architecture:** Keep the portfolio static and data-driven. A deterministic local media builder converts the supplied X-Plane archive into sanitized committed MP4/WebP evidence and a public manifest; a separate narrow Conformal source commit rerenders the retained real cavity/channel meshes. The Astro Work collection supplies homepage, Work index, detail route, sitemap, metadata, and JSON-LD, while existing browser and release gates prove the preview and production deployment.

**Tech Stack:** Astro 7, TypeScript 5.9, pnpm 10.33.2, Node test runner, Vitest 4, Playwright 1.60, Biome, ffmpeg/ffprobe, Tesseract OCR, Python 3.12, pytest, NumPy, Pillow, trimesh, Matplotlib, Git, GitHub Actions, Cloudflare Pages/Wrangler.

**Spec:** `docs/superpowers/specs/2026-08-24-xplane-fov-portfolio-integration-design.md`

## Global Constraints

- Start portfolio work from the clean committed plan tip on branch `feat/xplane-fov-portfolio`; verify approved-spec commit `4bd88d2` is its ancestor and never copy the legacy dirty worktree wholesale.
- Start Conformal renderer work from exact commit `2926936a8a5104d6724ef6a00b3f0cfbffb23d21` in `ConformalChannelCreator-portfolio-capture-20260817` and create a new branch before editing.
- Preserve Cryogenic Flow as the first flagship and homepage hero.
- Publish X-Plane as the second supporting Work entry, ordered before Black-Scholes.
- Do not publish `SNV`, drive-letter paths, `XPlaneRecordings`, `LM5`, `LM6`, `LM7`, or `LM8`, case-insensitively.
- Describe the supplied replay as documented, not independently rerun; the source replay harness is absent.
- State that the published configurations differ in both horizontal FOV and pitch.
- Use only real X-Plane frames and real Conformal meshes; do not generate or hand-draw evidence imagery.
- Do not claim physical camera validation, Conformal thermal/hydraulic performance, measured cycle-time reduction, production qualification, or certification.
- No new runtime or package dependency is allowed.
- Every behavioral change begins with a falsifiable RED test and ends with focused and integrated GREEN evidence.
- Do not weaken tests, budgets, accessibility assertions, private-content scans, or visual thresholds.
- Update visual baselines only after inspecting expected, actual, and diff images together.
- Use normal commits and fast-forward pushes only; never force-push or rewrite published history.
- The user's 2026-08-24 approval authorizes production only after every local, review, CI, preview, rollback, and live-verification gate in this plan passes.

---

### Task 1: Correct the Conformal cavity/channel evidence renderer

**Files:**
- Modify: `C:/Users/joepo/Documents/Codex/work/ConformalChannelCreator-portfolio-capture-20260817/scripts/portfolio_capture/render_evidence.py`
- Modify: `C:/Users/joepo/Documents/Codex/work/ConformalChannelCreator-portfolio-capture-20260817/tests/test_portfolio_capture.py`
- Produce externally: `C:/Users/joepo/Documents/Codex/work/conformal-cooling-capture-20260817/revised-20260824/cavity-channels.png`

**Interfaces:**
- Consumes: `render_cavity_channels(cavity_path: Path, channels_path: Path, output_path: Path, *, width: int = 1536, height: int = 864) -> None` and the retained `raw/api-job/cavity.stl` plus `raw/api-job/channels_only.stl` meshes.
- Produces: one reviewed renderer commit, an exact renderer commit SHA for the portfolio manifest, and a 1536 by 864 PNG from the unchanged captured meshes.

- [ ] **Step 1: Verify entry state and create the renderer branch**

Run from `C:/Users/joepo/Documents/Codex/work/ConformalChannelCreator-portfolio-capture-20260817`:

```powershell
$ErrorActionPreference = 'Stop'
git status --short
if ((git rev-parse HEAD) -ne '2926936a8a5104d6724ef6a00b3f0cfbffb23d21') { throw 'Unexpected Conformal entry commit' }
if (git status --porcelain) { throw 'Conformal capture worktree is not clean' }
git switch -c codex/portfolio-evidence-perspective-20260824
```

Expected: clean new branch at the exact renderer base.

- [ ] **Step 2: Add the failing legibility test**

Add the following helpers and test to `tests/test_portfolio_capture.py`. The generated cylinders deliberately cover the cavity from the old camera, so the test catches the current occlusion rather than merely checking for a nonblank PNG.

```python
def _evidence_color_fractions(path: Path) -> tuple[float, float]:
    pixels = np.asarray(Image.open(path).convert("RGB"), dtype=np.int16)
    background = np.array([8, 17, 31], dtype=np.int16)
    content = np.max(np.abs(pixels - background), axis=2) > 18
    orange = content & (pixels[:, :, 0] > pixels[:, :, 1] * 1.25) & (
        pixels[:, :, 1] > pixels[:, :, 2] * 1.4
    )
    cyan = content & (pixels[:, :, 1] > pixels[:, :, 0] * 1.25) & (
        pixels[:, :, 2] > pixels[:, :, 0] * 1.25
    )
    content_count = int(content.sum())
    assert content_count > 0
    return float(orange.sum() / content_count), float(cyan.sum() / content_count)


def test_cavity_channel_render_keeps_both_geometry_classes_legible(tmp_path) -> None:
    cavity_path = tmp_path / "gear-cavity.stl"
    channels_path = tmp_path / "channels.stl"
    output_path = tmp_path / "cavity-channels.png"
    build_gear_cavity().export(cavity_path)

    channels = []
    for offset in (-18.0, -12.0, -6.0, 0.0, 6.0, 12.0, 18.0):
        channel = trimesh.creation.cylinder(radius=1.8, height=76, sections=24)
        channel.apply_transform(
            trimesh.transformations.rotation_matrix(np.pi / 2, (0, 1, 0))
        )
        channel.apply_translation((0.0, offset, 0.0))
        channels.append(channel)
    trimesh.util.concatenate(channels).export(channels_path)

    render_cavity_channels(cavity_path, channels_path, output_path, width=960, height=540)
    orange_fraction, cyan_fraction = _evidence_color_fractions(output_path)

    assert orange_fraction >= 0.16
    assert cyan_fraction >= 0.10
    assert max(orange_fraction, cyan_fraction) <= 0.72
```

- [ ] **Step 3: Run the new test and capture RED**

```powershell
uv run --frozen --python 3.12 --extra dev --extra api --extra simulation `
  pytest tests/test_portfolio_capture.py::test_cavity_channel_render_keeps_both_geometry_classes_legible -q
```

Expected: FAIL on the orange/cyan balance with the current `(21.0, -38.0)` camera and nearly opaque channels. If it does not fail, stop and report that the proposed test does not reproduce the defect; do not change the fixture or thresholds without revising and reviewing the plan.

- [ ] **Step 4: Implement the minimal renderer correction**

Change only the cavity/channel camera and material treatment in `render_evidence.py`:

```python
CAMERAS: dict[str, tuple[float, float]] = {
    "input-gear": (24.0, -42.0),
    "cavity-channels": (34.0, -52.0),
    "split-mold-ports": (23.0, -48.0),
}
```

Use these exact cavity/channel material values:

```python
_add_mesh(
    axis,
    cavity,
    color="#f59e0b",
    alpha=0.42,
    edge_color="#fbbf24",
    line_width=0.30,
)
_add_mesh(
    axis,
    channels,
    color="#22d3ee",
    alpha=0.58,
    edge_color="#083344",
    line_width=0.05,
)
```

Update `test_camera_configuration_is_fixed_for_each_evidence_scene` to require `(34.0, -52.0)`.

- [ ] **Step 5: Run focused and source-wide renderer checks**

```powershell
uv run --frozen --python 3.12 --extra dev --extra api --extra simulation `
  pytest tests/test_portfolio_capture.py -q
uv run --frozen --python 3.12 --extra dev --extra api --extra simulation `
  python -m ruff check scripts/portfolio_capture/render_evidence.py tests/test_portfolio_capture.py
uv run --frozen --python 3.12 --extra dev --extra api --extra simulation `
  python -m black --check scripts/portfolio_capture/render_evidence.py tests/test_portfolio_capture.py
```

Expected: the portfolio-capture tests pass; Ruff and Black pass on the two touched files.

- [ ] **Step 6: Render the real retained meshes**

```powershell
$capture = 'C:\Users\joepo\Documents\Codex\work\conformal-cooling-capture-20260817'
$output = Join-Path $capture 'revised-20260824'
New-Item -ItemType Directory -Force -Path $output | Out-Null
uv run --frozen --python 3.12 --extra dev --extra api --extra simulation `
  python scripts/portfolio_capture/render_evidence.py `
  --input-cavity "$capture\raw\api-job\cavity.stl" `
  --channels "$capture\raw\api-job\channels_only.stl" `
  --split-top "$capture\split-mold\gear_top_conformal.stl" `
  --split-bottom "$capture\split-mold\gear_bottom_conformal.stl" `
  --output-dir $output
```

Expected: three PNGs exist; only `cavity-channels.png` is a release candidate for this task.

- [ ] **Step 7: Inspect the real render at full and reduced sizes**

Open `cavity-channels.png` with the image viewer at original resolution. Create temporary 960 and 640 pixel WebP views outside both repositories and inspect those too. Confirm the gear outline, channel bundle, depth relationship, and dark background remain legible. Reject the render if the channel bundle still reads as an opaque cage or if the gear disappears.

- [ ] **Step 8: Commit the Conformal source correction**

```powershell
git diff --check
git add scripts/portfolio_capture/render_evidence.py tests/test_portfolio_capture.py
git diff --cached --name-only
git commit -m "fix: clarify cavity and channel evidence view"
git status --short
```

Expected: exactly two committed paths, clean worktree, no push yet. Record `git rev-parse HEAD` for Task 6.

---

### Task 2: Build and contract-test sanitized X-Plane public media

**Files:**
- Create: `scripts/build-xplane-fov-media.mjs`
- Create: `scripts/xplane-media-contract.test.mjs`
- Create: `apps/web/public/media/xplane-fov/capture-manifest.json`
- Create: `apps/web/public/media/xplane-fov/fov50-p0-h0.mp4`
- Create: `apps/web/public/media/xplane-fov/fov50-p0-h0-poster.webp`
- Create: `apps/web/public/media/xplane-fov/fov110-m5-h0.mp4`
- Create: `apps/web/public/media/xplane-fov/fov110-m5-h0-poster.webp`
- Create: `apps/web/public/media/xplane-fov/comparison-bank-120-{640,960,1440}.webp`
- Create: `apps/web/public/media/xplane-fov/comparison-bank-180-{640,960,1440}.webp`

**Interfaces:**
- Consumes: `node scripts/build-xplane-fov-media.mjs --source-root <directory> --output-root <directory>` and the two exact source directories `fov50_p0_h0` and `fov110_m5_h0`.
- Produces: eleven committed public files whose names, sizes, hashes, dimensions, frame rates, durations, and evidence limits are recorded in `capture-manifest.json`.

- [ ] **Step 1: Add the failing public-media contract**

Create `scripts/xplane-media-contract.test.mjs` with an exported safety helper and these exact invariants:

```javascript
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = "apps/web/public/media/xplane-fov";
const FORBIDDEN = /SNV|[A-Za-z]:\\|XPlaneRecordings|\bLM[5-8]\b/i;
const EXPECTED = [
  "capture-manifest.json",
  "comparison-bank-120-640.webp",
  "comparison-bank-120-960.webp",
  "comparison-bank-120-1440.webp",
  "comparison-bank-180-640.webp",
  "comparison-bank-180-960.webp",
  "comparison-bank-180-1440.webp",
  "fov50-p0-h0.mp4",
  "fov50-p0-h0-poster.webp",
  "fov110-m5-h0.mp4",
  "fov110-m5-h0-poster.webp",
].sort();

export function assertPublicXplaneMetadata(value) {
  const serialized = JSON.stringify(value);
  assert.doesNotMatch(serialized, FORBIDDEN);
  assert.doesNotMatch(serialized, /token|password|cookie|authorization|bearer/i);
}

function sha256(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function probe(filePath) {
  const result = spawnSync("ffprobe", [
    "-v", "error", "-show_streams", "-show_format", "-of", "json", filePath,
  ], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("X-Plane media matches its sanitized public manifest", () => {
  assert.ok(existsSync(ROOT));
  assert.deepEqual(readdirSync(ROOT).sort(), EXPECTED);
  const manifest = JSON.parse(readFileSync(path.join(ROOT, "capture-manifest.json"), "utf8"));
  assertPublicXplaneMetadata(manifest);
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.evidence.replayHarnessIncluded, false);
  assert.deepEqual(manifest.configurations.map((item) => item.id), ["fov50-p0-h0", "fov110-m5-h0"]);
  assert.equal(manifest.configurations[0].horizontalFovDegrees, 50);
  assert.equal(manifest.configurations[0].pitchOffsetDegrees, 0);
  assert.equal(manifest.configurations[1].horizontalFovDegrees, 110);
  assert.equal(manifest.configurations[1].pitchOffsetDegrees, -5);

  for (const asset of manifest.publishedAssets) {
    const filePath = path.join(ROOT, asset.filename);
    assert.equal(statSync(filePath).size, asset.sizeBytes, asset.filename);
    assert.equal(sha256(filePath), asset.sha256, asset.filename);
    const metadata = probe(filePath);
    const video = metadata.streams.find((stream) => stream.codec_type === "video");
    assert.ok(video, asset.filename);
    assert.equal(video.width, asset.width, asset.filename);
    assert.equal(video.height, asset.height, asset.filename);
  }
});

test("X-Plane public metadata rejects recovered private identifiers", () => {
  for (const unsafe of ["SNV", "E:\\private", "XPlaneRecordings", "LM5", "lm8"]) {
    assert.throws(() => assertPublicXplaneMetadata({ note: unsafe }));
  }
});
```

Add assertions after the loop that both MP4s are H.264, 1440 by 400, `2/1` fps, 249 to 251 seconds, `yuv420p`, fast-start compatible, and have zero audio streams. Assert comparison dimensions are 640 by 356, 960 by 534, and 1440 by 800; posters are 1440 by 400.

- [ ] **Step 2: Run the media contract and capture RED**

```powershell
node --test scripts/xplane-media-contract.test.mjs
```

Expected: FAIL because `apps/web/public/media/xplane-fov` does not exist.

- [ ] **Step 3: Implement the deterministic media builder**

Create `scripts/build-xplane-fov-media.mjs`. Use `parseArgs`, `run`, `sha256`, `probe`, `writeManifest`, and no third-party Node dependency. The sanitizing video filter is fixed at source resolution before scaling:

```javascript
const MASK_FILTER = [
  "drawbox=x=0:y=0:w=48:h=28:color=black:t=fill",
  "drawbox=x=1440:y=0:w=48:h=28:color=black:t=fill",
  "drawbox=x=0:y=400:w=48:h=28:color=black:t=fill",
  "drawbox=x=1440:y=400:w=48:h=28:color=black:t=fill",
  "scale=1440:400:flags=lanczos",
].join(",");

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (result.status !== 0) throw new Error(`${command} failed: ${result.stderr}`);
  return result.stdout;
}
```

For each source video, run the equivalent of:

```javascript
run("ffmpeg", [
  "-y", "-i", source,
  "-map_metadata", "-1", "-an", "-vf", MASK_FILTER,
  "-r", "2", "-c:v", "libx264", "-preset", "slow", "-crf", "30",
  "-pix_fmt", "yuv420p", "-movflags", "+faststart", output,
]);
```

Extract the poster at 120 seconds from each sanitized MP4. Extract frames at 120 and 180 seconds from both MP4s and use `vstack=inputs=2` in the order 50-degree frame above 110-degree frame. Generate the three responsive WebPs with `scale=640:-2`, `scale=960:-2`, and `scale=1440:-2`.

Write a manifest with this public structure and computed asset records:

```javascript
const manifest = {
  schemaVersion: 1,
  source: {
    kind: "user-supplied archive",
    suppliedOn: "2026-08-23",
    sanitizedDerivatives: true,
  },
  configurations: [
    { id: "fov50-p0-h0", horizontalFovDegrees: 50, pitchOffsetDegrees: 0 },
    { id: "fov110-m5-h0", horizontalFovDegrees: 110, pitchOffsetDegrees: -5 },
  ],
  evidence: {
    camerasPerComposite: 4,
    documentedDurationSeconds: 250,
    documentedFrameRate: "2/1",
    replayHarnessIncluded: false,
    physicalCameraEvidence: false,
  },
  publishedAssets,
};
```

Before writing, recursively reject the same `FORBIDDEN` pattern as the contract. Never serialize `sourceRoot`, input filenames containing the original program title, or source-manifest text.

- [ ] **Step 4: Run the builder against the supplied archive**

```powershell
$source = 'C:\Users\joepo\Downloads\xplane_fov_study_content'
$output = 'apps\web\public\media\xplane-fov'
node scripts/build-xplane-fov-media.mjs --source-root $source --output-root $output
```

Expected: exactly the eleven files listed by the contract.

- [ ] **Step 5: Run mechanical and OCR safety checks**

```powershell
node --test scripts/xplane-media-contract.test.mjs
$review = Join-Path $env:TEMP 'xplane-fov-review-20260824'
New-Item -ItemType Directory -Force -Path $review | Out-Null
foreach ($video in @('fov50-p0-h0.mp4','fov110-m5-h0.mp4')) {
  foreach ($second in @(10,120,180,245)) {
    ffmpeg -y -ss $second -i (Join-Path $output $video) -frames:v 1 (Join-Path $review "$($video)-$second.png") 2>$null
  }
}
Get-ChildItem $review -Filter *.png | ForEach-Object {
  & 'C:\Program Files\Tesseract-OCR\tesseract.exe' $_.FullName stdout 2>$null
} | Tee-Object -Variable ocrText
if (($ocrText -join "`n") -match '(?i)SNV|XPlaneRecordings|\bLM[5-8]\b|[A-Za-z]:\\') { throw 'OCR safety scan failed' }
```

Expected: contract PASS and zero forbidden OCR matches. OCR is a release aid, not a substitute for visual inspection.

- [ ] **Step 6: Visually inspect the complete X-Plane media set**

Inspect both 1440 comparison images, both posters, and all eight representative frames from Step 5 at original resolution. Confirm the masks cover only the four camera tokens, generic port/starboard labels remain, no tile is missing, the top image is 50 degrees, the bottom image is 110 degrees, overlay text remains readable, and no private identifier or desktop chrome appears.

- [ ] **Step 7: Commit the media builder, contract, manifest, and assets**

```powershell
pnpm exec biome check scripts/build-xplane-fov-media.mjs scripts/xplane-media-contract.test.mjs
git diff --check
git add scripts/build-xplane-fov-media.mjs scripts/xplane-media-contract.test.mjs apps/web/public/media/xplane-fov
git diff --cached --name-only
git commit -m "feat: add sanitized X-Plane evidence media"
git status --short
```

Expected: only the builder, contract, manifest, and ten media assets are committed.

---

### Task 3: Add the X-Plane Work record, hierarchy, and intrinsic media ratios

**Files:**
- Create: `apps/web/src/content/work/xplane-cabin-camera-fov-trade-study.md`
- Modify: `apps/web/src/content/work/black-scholes-wasm.md`
- Modify: `apps/web/src/content/work/cli-fleet-synchronization-and-mcp-rollout.md`
- Modify: `apps/web/src/content/work/remote-workstation-recovery-and-operational-debugging.md`
- Modify: `apps/web/src/pages/work/index.astro`
- Modify: `apps/web/src/components/CaseStudyMediaGallery.astro`
- Modify: `apps/web/src/lib/contracts/work.ts`
- Modify: `apps/web/src/lib/contracts/work.test.ts`
- Modify: `apps/web/src/data/content-collections.test.ts`
- Modify: `scripts/work-content-contract.test.mjs`
- Modify: `tests/e2e/work-routes.spec.ts`
- Modify: `tests/e2e/project-detail.spec.ts`
- Modify: `tests/e2e/signal-proof-home.spec.ts`
- Modify: `tests/e2e/route-coverage.spec.ts`
- Modify: `tests/e2e/page-metadata.spec.ts`
- Modify: `tests/e2e/sitemap-robots.spec.ts`
- Modify: `tests/e2e/visual-regression.spec.ts`
- Modify: `scripts/visual-regression-contract.test.mjs`

**Interfaces:**
- Consumes: the Task 2 X-Plane asset namespace and the existing `WorkEntryData` schema.
- Produces: published Work slug `xplane-cabin-camera-fov-trade-study`, two flagships/two supporting/two archive ordering, uncropped 3.6:1 video rendering, generated CreativeWork JSON-LD, canonical route, sitemap entry, and a Work-schema approval-evidence gate that can be completed only after preview.

- [ ] **Step 1: Add RED collection, hierarchy, route, metadata, and wide-media assertions**

Update tests before adding the Work file:

```typescript
const expectedPublishedSlugs = [
  "cryo-flow-sim",
  "conformal-cooling-channel-generation",
  "xplane-cabin-camera-fov-trade-study",
  "black-scholes-wasm",
  "cli-fleet-synchronization-and-mcp-rollout",
  "remote-workstation-recovery-and-operational-debugging",
];
```

In `signal-proof-home.spec.ts`, require two supporting records ordered as X-Plane then Black-Scholes and require the full proof order to contain four titles. In `project-detail.spec.ts`, add:

```typescript
{
  slug: "xplane-cabin-camera-fov-trade-study",
  title: "X-Plane Cabin Camera FOV Trade Study",
  marker: /documented X-Plane replay compares four cabin camera views/i,
  galleryItems: 4,
}
```

In `work.test.ts`, require an approved Work record without `approvalEvidence` to fail and the same record with complete structured evidence to pass. In `work.ts`, import the existing `approvalEvidenceSchema`, add `approvalEvidence: approvalEvidenceSchema.optional()`, and add a refinement that rejects `redactionStatus: "approved"` unless the checklist is complete, `reviewedOn` and `approvalEvidence` exist, every required checklist answer is present, safe evidence is `yes`, and `openItems` is empty. Keep `reviewed` records valid so the first preview can be produced without falsely claiming launch approval.

Use the existing schema rather than creating a duplicate evidence type:

```typescript
import {
	approvalEvidenceSchema,
	caseStudyRedactionStatusSchema,
	publicationStatusSchema,
	redactionReviewSchema,
	seoSchema,
	slugSchema,
} from "./content";

// Inside workSchema's object shape:
approvalEvidence: approvalEvidenceSchema.optional(),
```

Append these approved-record checks inside the existing `superRefine` callback:

```typescript
if (entry.redactionStatus === "approved") {
	if (entry.redactionReview.checklistStatus !== "complete") {
		context.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["redactionReview", "checklistStatus"],
			message: "approved work requires a completed redaction checklist",
		});
	}
	if (!entry.redactionReview.reviewedOn) {
		context.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["redactionReview", "reviewedOn"],
			message: "approved work requires a review date",
		});
	}
	if (!entry.redactionReview.checklist) {
		context.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["redactionReview", "checklist"],
			message: "approved work requires checklist answers",
		});
	}
	if (entry.redactionReview.checklist?.claimsHaveSafeEvidence !== "yes") {
		context.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["redactionReview", "checklist", "claimsHaveSafeEvidence"],
			message: "approved work requires safe supporting evidence",
		});
	}
	if (entry.redactionReview.openItems.length > 0) {
		context.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["redactionReview", "openItems"],
			message: "approved work cannot have open redaction items",
		});
	}
	if (!entry.approvalEvidence) {
		context.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["approvalEvidence"],
			message: "approved work requires structured approval evidence",
		});
	}
}
```

Add a route test that loads the X-Plane page and asserts:

```typescript
const wideVideo = page.locator('[data-evidence-media-kind="video"] video').first();
const ratio = await wideVideo.evaluate((element) => {
  const box = element.getBoundingClientRect();
  return box.width / box.height;
});
expect(ratio).toBeGreaterThan(3.5);
expect(ratio).toBeLessThan(3.7);
await expect(page.locator("main")).toContainText(/replay harness.*not.*included/i);
await expect(page.locator("main")).not.toContainText(/SNV|XPlaneRecordings|\bLM[5-8]\b/i);
```

Require the canonical URL `https://joepoznanski.io/work/xplane-cabin-camera-fov-trade-study/`, one CreativeWork record with the X-Plane title, and one sitemap URL. Add this route to the committed desktop/mobile visual matrix. The initial record remains `redactionStatus: "reviewed"`; Task 8 is the only step allowed to change it to `approved`, after real preview evidence exists.

- [ ] **Step 2: Run the focused tests and capture RED**

```powershell
pnpm exec vitest run apps/web/src/data/content-collections.test.ts
node --test scripts/work-content-contract.test.mjs scripts/visual-regression-contract.test.mjs
pnpm exec playwright test tests/e2e/signal-proof-home.spec.ts tests/e2e/project-detail.spec.ts tests/e2e/page-metadata.spec.ts tests/e2e/sitemap-robots.spec.ts
```

Expected: failures for the missing Work record/route, old 2/1/2 hierarchy, and hard-coded 16:9 media.

- [ ] **Step 3: Add the complete X-Plane Work record**

Create the frontmatter below. Keep the Markdown body empty because the current Work detail template renders the validated record fields, not entry body content.

```yaml
---
title: "X-Plane Cabin Camera FOV Trade Study"
slug: "xplane-cabin-camera-fov-trade-study"
discipline: "simulation"
year: 2026
placement: "supporting"
featuredOrder: 3
lede: "A documented X-Plane replay compares four cabin camera views at the same flight moments, making the trade between a narrow 50-degree configuration and a wider 110-degree configuration visible frame by frame."
problem: "A narrow cabin-camera field of view preserves angular detail but can lose the horizon, wing, and surrounding context during a bank; a wider view preserves context while spreading the same pixels across more of the scene."
stakes: "A camera configuration chosen from unmatched flights can turn pilot variation into a false lens conclusion, while a configuration that loses orientation references may fail at the moment those references matter most."
role: "Replay-study design, four-camera comparison workflow, artifact review, and publication-safe evidence presentation."
constraints:
  - "Compare matching moments from the documented scripted flight rather than unrelated hand-flown runs."
  - "Keep all four port/starboard forward/aft views visible together so bank asymmetry remains inspectable."
  - "Preserve camera parameters in each frame while removing internal camera designators and private provenance."
architecture:
  overview: "The supplied artifact set documents a scripted X-Plane takeoff, climb, and opposite-direction bank sequence captured from four cabin cameras and composited into a 2x2 inspection frame for each camera configuration."
  diagramAlt: "A documented X-Plane flight sequence feeding four synchronized cabin views into one 2x2 composite, with matching timestamps compared across two camera configurations."
decisions:
  - title: "Compare complete configurations at matching timestamps"
    choice: "Present the 50-degree baseline-pitch configuration against the 110-degree negative-pitch configuration at the documented 120-second and 180-second bank moments."
    alternatives:
      - "Compare unrelated frames or describe horizontal FOV as the only changed parameter."
    tradeoff: "The comparison is honest about the pitch difference, so it demonstrates the supplied configurations without pretending to isolate one variable."
  - title: "Keep four views in one inspection frame"
    choice: "Retain the port-forward, port-aft, starboard-forward, and starboard-aft tiles in one composite."
    alternatives:
      - "Publish one attractive camera view or crop the wide composite into a conventional 16:9 frame."
    tradeoff: "The wide frame is less cinematic, but it preserves the asymmetry and evidence needed to evaluate a bank."
  - title: "Publish sanitized captured evidence"
    choice: "Mask internal camera tokens and omit private manifests while preserving the real X-Plane pixels and generic camera parameters."
    alternatives:
      - "Publish raw artifacts or recreate the study with invented imagery."
    tradeoff: "The public artifact loses internal provenance labels but remains visually faithful and safer to share."
outcome: "At both supplied bank timestamps, the narrow configuration loses more wing or horizon context while the wider configuration retains more surrounding references; the result is a bounded visual trade study rather than a universal camera-selection rule."
lessons:
  - "Matched flight moments are essential because pilot or geometry variation can overwhelm a camera comparison."
  - "A four-view composite exposes bank asymmetry that a single showcase frame would hide."
  - "Evidence remains useful after redaction when generic camera identity and numeric parameters stay visible."
evidence:
  label: "Two documented camera configurations"
  summary: "Two 250-second, four-camera composites and two matched bank comparisons show the 50-degree baseline-pitch configuration and the 110-degree negative-pitch configuration at the same documented flight moments."
  values:
    - label: "Configurations"
      value: "2 compared"
      detail: "The supplied archive contains a 50-degree baseline-pitch configuration and a 110-degree configuration with a negative 5-degree pitch offset."
    - label: "Camera views"
      value: "4 synchronized"
      detail: "Port forward, port aft, starboard forward, and starboard aft remain visible in every composite."
    - label: "Inspection points"
      value: "120 s and 180 s"
      detail: "The published stills compare the documented opposite-direction bank phases."
  scope: "The public media is a sanitized derivative of a user-supplied X-Plane artifact archive. The included manifests describe a scripted replay, but the replay harness source was not supplied or independently rerun."
  limits: "This evidence does not establish physical camera performance, lens distortion, detection performance, operator performance, flight-test results, certification suitability, or that horizontal FOV was the only changed parameter."
media:
  kind: "image"
  src: "/media/xplane-fov/comparison-bank-120-1440.webp"
  width: 1440
  height: 800
  alt: "Stacked four-camera X-Plane composites comparing the 50-degree and 110-degree camera configurations during the same documented bank phase."
  caption: "The 50-degree configuration is above the 110-degree configuration at the documented 120-second bank moment."
evidenceMedia:
  - kind: "image"
    src: "/media/xplane-fov/comparison-bank-120-1440.webp"
    responsiveSources:
      - { src: "/media/xplane-fov/comparison-bank-120-640.webp", width: 640 }
      - { src: "/media/xplane-fov/comparison-bank-120-960.webp", width: 960 }
      - { src: "/media/xplane-fov/comparison-bank-120-1440.webp", width: 1440 }
    width: 1440
    height: 800
    alt: "Stacked 50-degree and 110-degree four-camera composites at the documented 120-second bank point."
    caption: "First bank comparison: narrow configuration above, wider negative-pitch configuration below."
  - kind: "image"
    src: "/media/xplane-fov/comparison-bank-180-1440.webp"
    responsiveSources:
      - { src: "/media/xplane-fov/comparison-bank-180-640.webp", width: 640 }
      - { src: "/media/xplane-fov/comparison-bank-180-960.webp", width: 960 }
      - { src: "/media/xplane-fov/comparison-bank-180-1440.webp", width: 1440 }
    width: 1440
    height: 800
    alt: "Stacked 50-degree and 110-degree four-camera composites during the opposite documented bank."
    caption: "Opposite bank comparison at 180 seconds, preserving all four camera views."
  - kind: "video"
    src: "/media/xplane-fov/fov50-p0-h0.mp4"
    poster: "/media/xplane-fov/fov50-p0-h0-poster.webp"
    responsivePosterSources:
      - { src: "/media/xplane-fov/fov50-p0-h0-poster.webp", width: 1440 }
    width: 1440
    height: 400
    alt: "Full 250-second four-camera X-Plane composite for the 50-degree baseline-pitch configuration."
    caption: "50-degree horizontal FOV at baseline pitch, encoded at two frames per second for inspection."
  - kind: "video"
    src: "/media/xplane-fov/fov110-m5-h0.mp4"
    poster: "/media/xplane-fov/fov110-m5-h0-poster.webp"
    responsivePosterSources:
      - { src: "/media/xplane-fov/fov110-m5-h0-poster.webp", width: 1440 }
    width: 1440
    height: 400
    alt: "Full 250-second four-camera X-Plane composite for the 110-degree negative-pitch configuration."
    caption: "110-degree horizontal FOV with a negative 5-degree pitch offset, encoded at two frames per second for inspection."
publicationStatus: "publish"
redactionStatus: "reviewed"
redactionReview:
  guidePath: "docs/CONTENT_REDACTION_GUIDE.md"
  reviewer: "operator"
  reviewedOn: "2026-08-24"
  checklistStatus: "complete"
  openItems: []
  notes: "Joe supplied the archive and approved publication. Public derivatives remove the program name, private source paths, and internal camera tokens while preserving generic camera labels and numeric parameters."
  checklist:
    secretsRemoved: "yes"
    hostnamesAndAccessPathsGeneralized: "yes"
    userAndAccountNamesGeneralized: "yes"
    screenshotsInspected: "yes"
    logsSummarizedOrSanitized: "not-applicable"
    publicLinksVerified: "not-applicable"
    claimsHaveSafeEvidence: "yes"
    securitySensitiveProceduresRemoved: "yes"
seo:
  title: "X-Plane Cabin Camera FOV Trade Study | Joe Poznanski"
  description: "A documented X-Plane replay comparing four cabin camera views across 50-degree and 110-degree configurations at matching flight moments."
  canonicalPath: "/work/xplane-cabin-camera-fov-trade-study/"
  ogImage: "/media/xplane-fov/comparison-bank-120-1440.webp"
---
```

- [ ] **Step 4: Update ordering and the Work index invariant**

Set Black-Scholes to `featuredOrder: 4`, CLI Fleet to `5`, and Remote Recovery to `6`. Change the Work index invariant to require `flagshipWork.length === 2`, `supportingWork.length === 2`, and `archiveWork.length === 2`. Update its header copy to `Two flagship engineering systems, two focused technical studies, and an operational archive.`

- [ ] **Step 5: Preserve intrinsic evidence-media aspect ratios**

In `CaseStudyMediaGallery.astro`, put the ratio on each figure:

```astro
<figure
  data-evidence-media-kind={item.kind}
  style={`--evidence-media-aspect: ${item.width} / ${item.height}`}
>
```

Replace the hard-coded gallery rule with:

```css
.case-study-media-gallery img,
.case-study-media-gallery video {
  aspect-ratio: var(--evidence-media-aspect);
  object-fit: contain;
}
```

Keep `width: 100%`, `height: auto`, native controls, `preload="none"`, poster, caption, and direct fallback link behavior unchanged.

- [ ] **Step 6: Run focused GREEN gates**

```powershell
pnpm exec vitest run apps/web/src/data/content-collections.test.ts apps/web/src/lib/contracts/work.test.ts
node --test scripts/work-content-contract.test.mjs scripts/xplane-media-contract.test.mjs scripts/visual-regression-contract.test.mjs
pnpm typecheck
pnpm build
pnpm exec playwright test tests/e2e/signal-proof-home.spec.ts tests/e2e/project-detail.spec.ts tests/e2e/page-metadata.spec.ts tests/e2e/sitemap-robots.spec.ts tests/e2e/route-coverage.spec.ts
```

Expected: all focused gates pass; build emits the new Work page and sitemap entry.

- [ ] **Step 7: Commit the Work route and generic ratio correction**

```powershell
pnpm exec biome check apps/web/src/content/work apps/web/src/pages/work/index.astro apps/web/src/components/CaseStudyMediaGallery.astro apps/web/src/data/content-collections.test.ts tests/e2e scripts/work-content-contract.test.mjs scripts/visual-regression-contract.test.mjs
git diff --check
git add apps/web/src/content/work apps/web/src/pages/work/index.astro apps/web/src/components/CaseStudyMediaGallery.astro apps/web/src/lib/contracts/work.ts apps/web/src/lib/contracts/work.test.ts apps/web/src/data/content-collections.test.ts scripts/work-content-contract.test.mjs scripts/visual-regression-contract.test.mjs tests/e2e
git commit -m "feat: publish X-Plane FOV trade study"
git status --short
```

Expected: clean portfolio worktree with the route, hierarchy, component, and tests together.

---

### Task 4: Clarify homepage copy and crawler semantics

**Files:**
- Modify: `apps/web/src/content/work/cryo-flow-sim.md`
- Modify: `apps/web/src/content/work/conformal-cooling-channel-generation.md`
- Modify: `apps/web/src/components/ProofGallery.astro`
- Modify: `apps/web/src/data/capability-proof.ts`
- Modify: `apps/web/src/data/profile.ts`
- Modify: `apps/web/src/content/site/site.json`
- Modify: `apps/web/src/data/routes.ts`
- Modify: `apps/web/src/layouts/BaseLayout.astro`
- Modify: `apps/web/src/pages/index.astro`
- Modify: `apps/web/src/lib/contracts/content.test.ts`
- Modify: `apps/web/src/data/routes.test.ts`
- Modify: `tests/e2e/signal-proof-home.spec.ts`
- Modify: `tests/e2e/page-metadata.spec.ts`
- Modify: `tests/e2e/work-routes.spec.ts`

**Interfaces:**
- Consumes: published Work hierarchy from Task 3 and existing `profile` data.
- Produces: visitor-readable Cryogenic and Conformal copy, site-wide Person JSON-LD with `jobTitle`, `knowsAbout`, and two `sameAs` URLs, plus matching page descriptions.

- [ ] **Step 1: Add RED copy and structured-data assertions**

Add homepage assertions:

```typescript
await expect(page.locator("main")).not.toContainText(/unexpected clamp events/i);
await expect(page.locator("main")).toContainText(/cooling passages.*injection-mold cavity/i);
await expect(page.locator("main")).toContainText(/metal additive manufacturing/i);
```

In `page-metadata.spec.ts`, parse JSON-LD on `/` and require:

```typescript
expect(person).toMatchObject({
  "@type": "Person",
  name: "Joe Poznanski",
  jobTitle: "Principal Software Engineer",
  sameAs: [
    "https://www.linkedin.com/in/joe-poznanski",
    "https://github.com/HumanKaylee",
  ],
});
expect(person.knowsAbout).toEqual(expect.arrayContaining([
  "Flight simulation",
  "Controls software",
  "Telemetry systems",
  "Rust",
  "C++",
  "Conformal cooling",
  "Metal additive manufacturing",
]));
```

Require the homepage description to contain `flight simulation`, `controls`, `telemetry`, `Rust`, and `C++`; require the Work description to contain `flight simulation`, `manufacturing software`, and `operational systems`.

- [ ] **Step 2: Run focused tests and capture RED**

```powershell
pnpm exec vitest run apps/web/src/lib/contracts/content.test.ts apps/web/src/data/routes.test.ts
pnpm exec playwright test tests/e2e/signal-proof-home.spec.ts tests/e2e/page-metadata.spec.ts tests/e2e/work-routes.spec.ts
```

Expected: old clamp copy, old Conformal lede, and incomplete Person metadata fail.

- [ ] **Step 3: Replace visitor-facing Cryogenic copy**

Use these exact headline fields in `cryo-flow-sim.md`:

```yaml
lede: "A deterministic cryogenic-flow simulation showing timed valve transitions, tank behavior, and pressure cascades in a verified 96.9-second browser capture."
```

Set the evidence summary to:

```yaml
summary: "A 1920x1080, 30fps simulation capture backed by 92 passing tests, recorded validation thresholds, and a provenance record containing the source commit and fixed seed."
```

Replace the `Unexpected clamps` value with:

```yaml
- label: "Run provenance"
  value: "Fixed and recorded"
  detail: "The artifact record includes the source commit, deterministic seed, and measured validation thresholds."
```

Update `capability-proof.ts` to say:

```typescript
evidence: "The Cryogenic Flow case study records a 96.9-second verified artifact, 92 passing tests, and a fixed-seed provenance record.",
```

- [ ] **Step 4: Replace the Conformal lead and search description**

Use this lede:

```yaml
lede: "ConformalFlow automatically designs cooling passages that follow an injection-mold cavity. The goal is to remove heat more evenly so molded parts can reach ejection temperature sooner, while keeping the geometry inspectable and compatible with complex internal passages enabled by metal additive manufacturing."
```

Keep the existing evidence limits unchanged. Set the SEO description to:

```yaml
description: "An engineering prototype for designing and validating conformal cooling passages inside injection molds, including geometries enabled by metal additive manufacturing."
```

Do not add a measured cooling-rate or production-speed claim.

- [ ] **Step 5: Update homepage and proof-gallery positioning**

Set the homepage description and site description to:

`Principal software engineer for flight simulation, controls, telemetry, and operational systems in Rust and C++.`

Set the homepage lede to:

`I build flight simulation, telemetry, controls, and operator-facing software across Rust, C++, distributed systems, and human-in-the-loop AI.`

Change the ProofGallery introduction to:

`The flagship case studies carry captured motion and geometry evidence. Focused technical studies show how the same evidence-first approach applies to camera tradeoffs and browser computation.`

Set the Work route description to:

`Evidence-backed work across flight simulation, engineering simulation, manufacturing software, and operational systems.`

- [ ] **Step 6: Expand Person JSON-LD from public profile data**

Add to `profile.ts`:

```typescript
knowsAbout: [
  "Flight simulation",
  "Aerospace simulation",
  "Controls software",
  "Telemetry systems",
  "Rust",
  "C++",
  "Hardware-in-the-loop testing",
  "Injection molding",
  "Conformal cooling",
  "Metal additive manufacturing",
  "Distributed systems",
  "Operational software",
] as const,
```

Change the Person record in `BaseLayout.astro` to include:

```typescript
jobTitle: profile.role,
knowsAbout: profile.knowsAbout,
sameAs: [profile.linkedin, profile.github],
```

Do not add the email address to structured data.

- [ ] **Step 7: Run focused and build GREEN gates**

```powershell
pnpm exec vitest run apps/web/src/lib/contracts/content.test.ts apps/web/src/data/routes.test.ts
pnpm exec playwright test tests/e2e/signal-proof-home.spec.ts tests/e2e/page-metadata.spec.ts tests/e2e/work-routes.spec.ts
pnpm typecheck
pnpm build
rg -n -i "unexpected clamp events" apps/web/src/data/capability-proof.ts apps/web/src/content/work/cryo-flow-sim.md apps/web/src/pages/index.astro
```

Expected: all tests pass and the final `rg` prints no lines.

- [ ] **Step 8: Commit the copy and crawler semantics**

```powershell
pnpm exec biome check apps/web/src
git diff --check
git add apps/web/src
git commit -m "content: clarify simulation and manufacturing work"
git status --short
```

---

### Task 5: Integrate the corrected Conformal render and rebuild affected public media

**Files:**
- Modify: `apps/web/public/media/conformal-cooling/conformal-cavity-channels-{640,960,1440}.webp`
- Modify: `apps/web/public/media/conformal-cooling/conformal-workflow-loop-poster-{640,960,1440}.webp`
- Modify: `apps/web/public/media/conformal-cooling/conformal-workflow-loop.mp4`
- Modify: `apps/web/public/media/conformal-cooling/conformal-workflow.mp4`
- Modify: `apps/web/public/media/conformal-cooling/capture-manifest.json`
- Modify: `scripts/conformal-media-contract.test.mjs`
- Modify: `apps/web/src/content/work/conformal-cooling-channel-generation.md`
- Modify: `tests/e2e/project-detail.spec.ts`

**Interfaces:**
- Consumes: Task 1 renderer commit and `revised-20260824/cavity-channels.png`; retained authentic input gear, split mold, validation screenshot, and raw workflow recording.
- Produces: updated responsive cavity/channel images, loop poster, loop video, full workflow video, hashes, renderer provenance, captions, and a manifest that matches every committed Conformal asset.

- [ ] **Step 1: Add RED renderer-provenance and caption assertions**

Update `conformal-media-contract.test.mjs` to require a `rendererCommit` different from `2926936...` and equal to the exact Task 1 commit SHA. Update `project-detail.spec.ts` to require the cavity/channel caption to contain `clearer elevated view` and the detail page to retain the cycle-time evidence limitation.

Run:

```powershell
node --test scripts/conformal-media-contract.test.mjs
pnpm exec playwright test tests/e2e/project-detail.spec.ts --grep "Conformal"
```

Expected: RED on old renderer commit and old caption.

- [ ] **Step 2: Generate responsive WebPs from the accepted render**

```powershell
$capture = 'C:\Users\joepo\Documents\Codex\work\conformal-cooling-capture-20260817'
$source = "$capture\revised-20260824\cavity-channels.png"
$public = 'apps\web\public\media\conformal-cooling'
ffmpeg -y -i $source -vf scale=640:360:flags=lanczos "$public\conformal-cavity-channels-640.webp"
ffmpeg -y -i $source -vf scale=960:540:flags=lanczos "$public\conformal-cavity-channels-960.webp"
ffmpeg -y -i $source -vf scale=1440:810:flags=lanczos "$public\conformal-cavity-channels-1440.webp"
Copy-Item "$public\conformal-cavity-channels-640.webp" "$public\conformal-workflow-loop-poster-640.webp"
Copy-Item "$public\conformal-cavity-channels-960.webp" "$public\conformal-workflow-loop-poster-960.webp"
Copy-Item "$public\conformal-cavity-channels-1440.webp" "$public\conformal-workflow-loop-poster-1440.webp"
```

- [ ] **Step 3: Rebuild the homepage loop from real evidence stills**

Use four 2.5-second inputs in this exact order: input gear, revised cavity/channels, separated split molds, completed validation/export UI. Scale each to 960 by 540, concatenate at 30 fps, encode H.264/yuv420p, omit audio, and enable fast-start:

```powershell
ffmpeg -y `
  -loop 1 -t 2.5 -i "$capture\raw\figures\input-gear.png" `
  -loop 1 -t 2.5 -i "$capture\revised-20260824\cavity-channels.png" `
  -loop 1 -t 2.5 -i "$capture\raw\figures\split-mold-ports.png" `
  -loop 1 -t 2.5 -i "$capture\raw\ui-validation-export.png" `
  -filter_complex "[0:v]scale=960:540,setsar=1[v0];[1:v]scale=960:540,setsar=1[v1];[2:v]scale=960:540,setsar=1[v2];[3:v]scale=960:540,setsar=1[v3];[v0][v1][v2][v3]concat=n=4:v=1:a=0,fps=30[out]" `
  -map "[out]" -an -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart `
  "$public\conformal-workflow-loop.mp4"
```

Expected: exactly 10 seconds and no audio.

- [ ] **Step 4: Rebuild the full workflow chronology**

Use the real raw UI recording first, then the three evidence figures and final completed UI, each for six seconds:

```powershell
ffmpeg -y `
  -i "$capture\raw\workflow-raw.webm" `
  -loop 1 -t 6 -i "$capture\raw\figures\input-gear.png" `
  -loop 1 -t 6 -i "$capture\revised-20260824\cavity-channels.png" `
  -loop 1 -t 6 -i "$capture\raw\figures\split-mold-ports.png" `
  -loop 1 -t 6 -i "$capture\raw\ui-validation-export.png" `
  -filter_complex "[0:v]scale=1536:864,setsar=1,fps=30[v0];[1:v]scale=1536:864,setsar=1,fps=30[v1];[2:v]scale=1536:864,setsar=1,fps=30[v2];[3:v]scale=1536:864,setsar=1,fps=30[v3];[4:v]scale=1536:864,setsar=1,fps=30[v4];[v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[out]" `
  -map "[out]" -an -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart `
  "$public\conformal-workflow.mp4"
```

Expected: authentic UI motion followed by four labeled-by-caption evidence stages; 30 to 45 seconds total, no audio, under 20 MiB.

- [ ] **Step 5: Refresh the public manifest mechanically**

Set `source.rendererCommit` to the exact Task 1 commit. Recompute `sizeBytes`, `sha256`, width, height, codec, duration, frame rate, pixel format, and audio-stream count for every listed asset; do not hand-copy old hashes. Preserve the existing UI/API capture commit and its clean-state claim.

Update the caption on the `conformal-cavity-channels` evidence-media item to:

```yaml
caption: "Completed UI/API job shown from a clearer elevated view so the real cavity outline and generated channel relationship remain legible."
```

Keep the source/evidence limit paragraphs unchanged.

- [ ] **Step 6: Run media and page GREEN gates**

```powershell
node --test scripts/conformal-media-contract.test.mjs
pnpm exec playwright test tests/e2e/project-detail.spec.ts --grep "Conformal"
pnpm build
```

Expected: manifest, ffprobe, asset inventory, caption, and page tests pass.

- [ ] **Step 7: Visually inspect the entire affected Conformal sequence**

Inspect the revised 1440/960/640 cavity/channel images, the three loop posters, representative loop frames at 0/2.5/5/7.5 seconds, and full-video frames before and after the new render. Confirm the gear and channel relation is legible, the chronology does not imply generation completed early, and no stale old-render frame remains.

- [ ] **Step 8: Commit the Conformal portfolio evidence update**

```powershell
git diff --check
git add apps/web/public/media/conformal-cooling apps/web/src/content/work/conformal-cooling-channel-generation.md scripts/conformal-media-contract.test.mjs tests/e2e/project-detail.spec.ts
git commit -m "fix: clarify conformal cooling evidence"
git status --short
```

---

### Task 6: Update backlog, redaction, changelog, and release documentation

**Files:**
- Modify: `docs/BACKLOG.md`
- Modify: `docs/CHANGELOG.md`
- Modify: `runbooks/CONTENT_REDACTION_STATUS.md`
- Modify: `runbooks/CASE_STUDY_REDACTION_APPROVAL_PACKETS.md`
- Modify: `runbooks/LAUNCH_EVIDENCE.md`
- Modify: `scripts/content-runbook-contract.test.mjs`
- Modify: `scripts/redaction-approval-packets-contract.test.mjs`
- Modify: `scripts/evidence-surface-contract.test.mjs`

**Interfaces:**
- Consumes: exact X-Plane asset inventory, Conformal renderer commit, portfolio commits, test results, and the approved design.
- Produces: `B-069`, one locally completed redaction-review packet that remains preview-pending, current redaction status, a changelog entry, and release-evidence rows that remain explicitly pre-production until Task 9.

- [ ] **Step 1: Add RED documentation-contract assertions**

Require all three identifiers below to appear in the appropriate documents:

```text
B-069
xplane-cabin-camera-fov-trade-study
X-Plane Cabin Camera FOV Trade Study
```

Require the redaction packet to record: user-supplied ownership/authorization, program-name removal, source-path removal, `LM5`-`LM8` masking, comparison/video visual inspection, public manifest hashes, and the missing replay-harness limit. Require `CONTENT_REDACTION_STATUS` to mark the entry `reviewed`, with the production-equivalent preview evidence and final approval as the only open launch item.

- [ ] **Step 2: Run documentation contracts and capture RED**

```powershell
node --test scripts/content-runbook-contract.test.mjs scripts/redaction-approval-packets-contract.test.mjs scripts/evidence-surface-contract.test.mjs
```

Expected: missing B-069 and X-Plane packet failures.

- [ ] **Step 3: Add B-069 with exact acceptance criteria**

Append:

```markdown
### B-069: Publish X-Plane FOV study and homepage clarity corrections

Priority: P0

Depends on: B-063

- Publish the sanitized X-Plane Work entry on Home, Work, sitemap, and its canonical detail route.
- Preserve two flagship, two supporting, and two archive entries with Cryogenic Flow as hero.
- Remove visitor-facing `unexpected clamp events` copy.
- Explain Conformal Cooling's injection-mold use case and metal-additive-manufacturing boundary without unsupported performance claims.
- Replace the confusing cavity/channel visual with a reviewed render from real retained meshes.
- Pass media, private-content, accessibility, responsive, no-JavaScript, reduced-motion, browser, build, Rust, CI, preview, and production gates.
- Retain the previous Cloudflare production deployment as rollback.
```

Mark implementation evidence current only after the corresponding commands have run.

- [ ] **Step 4: Complete the X-Plane redaction packet and status row**

Record exact public filenames and hashes from Task 2. State that Joe supplied the archive and explicitly approved the design/publication on 2026-08-24. State that the public derivatives omit the raw manifests, program identifier, private path, and camera tokens. Record `replay harness source not supplied` under known limits, not open redaction items. Keep the packet and status at `reviewed` until Task 8 captures the required production-equivalent preview; do not treat design approval alone as artifact or preview evidence.

- [ ] **Step 5: Add pre-release changelog and launch evidence rows**

Add one `Unreleased` entry describing the route, copy, SEO, intrinsic-ratio fix, and real-geometry rerender. In `LAUNCH_EVIDENCE.md`, add rows for local X-Plane media verification and Conformal rerender verification with exact commands/results. Keep preview and production rows labeled `Pending` and do not invent deployment IDs.

- [ ] **Step 6: Run documentation and privacy scans GREEN**

```powershell
node --test scripts/content-runbook-contract.test.mjs scripts/redaction-approval-packets-contract.test.mjs scripts/evidence-surface-contract.test.mjs
rg -n -i "SNV|XPlaneRecordings|\bLM[5-8]\b|[A-Za-z]:\\" apps/web/public/media/xplane-fov apps/web/src/content/work/xplane-cabin-camera-fov-trade-study.md
git diff --check
```

Expected: contracts pass and the public/content scan prints no matches.

- [ ] **Step 7: Commit documentation and its contracts**

```powershell
git add docs/BACKLOG.md docs/CHANGELOG.md runbooks/CONTENT_REDACTION_STATUS.md runbooks/CASE_STUDY_REDACTION_APPROVAL_PACKETS.md runbooks/LAUNCH_EVIDENCE.md scripts/content-runbook-contract.test.mjs scripts/redaction-approval-packets-contract.test.mjs scripts/evidence-surface-contract.test.mjs
git commit -m "docs: track X-Plane portfolio release"
git status --short
```

---

### Task 7: Run integrated local gates and accept only intentional visual changes

**Files:**
- Modify only after triplet inspection: `tests/e2e/visual-regression.spec.ts-snapshots/*linux.png`
- Modify only after triplet inspection: `tests/e2e/visual-regression.spec.ts-snapshots/*win32.png`
- Create externally: a public-safe local verification report under `C:/Users/joepo/Documents/Codex/2026-08-23/go-a/work/xplane-portfolio-release/`

**Interfaces:**
- Consumes: all Task 1-6 commits.
- Produces: a clean release candidate, reviewed visual baselines for every intentional page change, exact local gate results, and an independent code/spec review verdict.

- [ ] **Step 1: Verify clean exact scope before heavy gates**

```powershell
git status --short
git log --oneline 5d6c060b7133dd69617a80ca1970c64f7310db9b..HEAD
git diff --check 5d6c060b7133dd69617a80ca1970c64f7310db9b..HEAD
```

Expected: clean portfolio worktree and only approved commits/files.

- [ ] **Step 2: Run static and unit gates**

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm bundle:budget
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
```

Expected: all exit zero. Existing documented skips remain explicitly counted; no new skip is accepted for X-Plane or Conformal work.

- [ ] **Step 3: Run focused browser gates in an isolated foreground harness**

Use a temporary Playwright config outside tracked paths with port 4319, correct repository working directory, `ASTRO_DEV_BACKGROUND=1`, and `--ignore-lock`. Do not touch any unrelated listener on port 4321.

Run:

```powershell
pnpm exec playwright test --config <isolated-config> --grep '@legal|@quality|@no-webgl'
pnpm exec playwright test --config <isolated-config> --grep '@static-shell|@static-runtime|@api-down'
pnpm exec playwright test --config <isolated-config> --grep '@responsive'
pnpm exec playwright test --config <isolated-config>
```

Expected: all selected nonvisual tests pass; only the existing intentional capture-only skips remain.

- [ ] **Step 4: Run the visual suite without update mode**

```powershell
pnpm exec playwright test --config=playwright.visual.config.ts --grep "@visual-regression"
```

Expected: intentional diffs for Home, Work, X-Plane, Cryogenic Flow, and Conformal pages; no unrelated route diff. If the suite passes without diffs, confirm the new routes were actually selected before trusting it.

- [ ] **Step 5: Inspect every visual triplet and run a ten-surface manual QA**

Inspect expected, actual, and diff images together for all changed snapshots. Separately capture Home, Work, X-Plane, Cryogenic, and Conformal at 390 by 844 and 1440 by 1000. Verify:

- no horizontal overflow;
- 44-pixel touch targets;
- readable 3.6:1 X-Plane videos with all four tiles;
- visible X-Plane homepage title and comparison image;
- no `unexpected clamp events` copy;
- readable Conformal gear/channel relationship;
- no private identifiers;
- correct focus order, native media controls, no-JavaScript content, and reduced-motion behavior.

- [ ] **Step 6: Update only approved visual baselines and rerun without update mode**

```powershell
pnpm test:visual:update
pnpm test:visual
```

Expected: update command changes only the intentionally reviewed routes/platforms; final no-update run passes all selected visual tests.

- [ ] **Step 7: Run Lighthouse and final secret/private-path scans**

```powershell
pnpm lighthouse:local
git grep -n -I -E "SNV|XPlaneRecordings|\\bLM[5-8]\\b|[A-Za-z]:\\\\|ghp_[A-Za-z0-9]{20,}|CLOUDFLARE_API_TOKEN[[:space:]]*=" -- ':!docs/superpowers/*'
git diff --cached --check
git diff --check
```

Expected: Lighthouse stays within repository budgets; committed application/public content has no forbidden match. Internal design/plan provenance paths are excluded from the public-content scan but remain checked for secrets separately.

- [ ] **Step 8: Commit legitimate visual baselines separately**

```powershell
git add tests/e2e/visual-regression.spec.ts-snapshots
git commit -m "test: refresh X-Plane portfolio visuals"
git status --short
```

Expected: snapshot-only commit and clean tree.

- [ ] **Step 9: Request independent spec and code review**

The reviewer must read the approved spec, this plan, every commit since `5d6c060`, the X-Plane manifest/assets through mechanical probes, the Conformal renderer diff/output, and the local gate report. Review findings first. Any Critical or Important finding blocks release; use the original implementer for fix rounds and repeat affected gates.

---

### Task 8: Push the reviewed release candidate, require CI, and verify a Cloudflare preview

**Files:**
- Modify after real preview: `runbooks/LAUNCH_EVIDENCE.md`
- Modify after real preview: `docs/CHANGELOG.md`
- Modify after real preview: `apps/web/src/content/work/xplane-cabin-camera-fov-trade-study.md`
- Modify after real preview: `runbooks/CONTENT_REDACTION_STATUS.md`
- Modify after real preview: `runbooks/CASE_STUDY_REDACTION_APPROVAL_PACKETS.md`
- Create externally: preview screenshots and a public-safe preview report under `C:/Users/joepo/Documents/Codex/2026-08-23/go-a/work/xplane-portfolio-release/preview/`

**Interfaces:**
- Consumes: exact clean reviewed release-candidate commit and current Cloudflare authentication.
- Produces: remote portfolio and Conformal evidence branches, exact-SHA successful CI, isolated preview deployment URL/ID, recorded rollback candidate, browser-verified preview evidence, and a final approved release-candidate commit whose exact preview also passes.

- [ ] **Step 1: Verify authentication and record production rollback before mutation**

```powershell
pnpm exec wrangler whoami
pnpm exec wrangler pages deployment list --project-name humankaylee-portfolio
```

Expected: authenticated account; record the current production deployment ID, commit, branch, URL, and timestamp without exposing tokens. If unauthenticated, stop for the interactive device login; do not create or copy credentials.

- [ ] **Step 2: Push the feature branch normally**

```powershell
git status --short
$releaseSha = git rev-parse HEAD
git push -u origin feat/xplane-fov-portfolio
git ls-remote origin refs/heads/feat/xplane-fov-portfolio
```

Expected: remote feature ref equals `$releaseSha`.

- [ ] **Step 3: Push and verify the Conformal provenance branch**

From the clean Conformal worktree:

```powershell
git push -u origin codex/portfolio-evidence-perspective-20260824
git ls-remote origin refs/heads/codex/portfolio-evidence-perspective-20260824
```

Expected: remote branch equals the renderer commit recorded by the portfolio manifest. Do not merge unrelated Conformal quality branches.

- [ ] **Step 4: Require exact-SHA GitHub CI success**

Use `gh run list` and `gh run view` to identify the Phase 0 CI run whose `headSha` equals `$releaseSha`. Wait on that exact run only. Require frontend, Rust, WASM, browser, visual, build, bundle, and Lighthouse jobs to succeed. A green run for another SHA does not count.

- [ ] **Step 5: Deploy the exact built release to an isolated preview**

Rebuild from the clean exact SHA, hash `dist`, then deploy without the production branch:

```powershell
pnpm build
pnpm exec wrangler pages deploy dist --project-name humankaylee-portfolio --branch feat-xplane-fov-portfolio
```

Record the deployment ID and preview URL returned by Wrangler. Confirm `pages deployment list` maps the preview to `$releaseSha` or the exact uploaded source commit metadata supported by the project.

- [ ] **Step 6: Run preview browser and HTTP verification**

Verify at the preview origin:

- `/` contains `X-Plane Cabin Camera FOV Trade Study` and not `unexpected clamp events`;
- `/work/` shows 2/2/2 hierarchy;
- `/work/xplane-cabin-camera-fov-trade-study/` has route-specific H1, canonical production URL, four evidence figures, two native videos, and no homepage fallback;
- both MP4s return 200 with video content type and range support;
- both comparison images return 200;
- Conformal copy and corrected render are visible;
- sitemap contains the X-Plane URL once;
- CSP, COOP, X-Frame-Options, nosniff, referrer policy, and permissions policy remain correct;
- console and page error collections are empty;
- JavaScript-disabled and reduced-motion visits remain useful;
- mobile and desktop screenshots have no overflow or cropping.

- [ ] **Step 7: Convert the reviewed Work record to approved using the real preview**

Replace only the first-preview `Pending` row with the exact deployment ID, URL, release SHA, commands, results, and retained production rollback ID. Add the preview verification to the Unreleased changelog entry without calling it production. Change the X-Plane Work record from `reviewed` to `approved` and add `approvalEvidence` with:

- the 2026-08-24 user signoff as `humanSignoff`;
- the completed Task 2 full-resolution inspection as `artifactInspection`; and
- the exact Task 8 preview URL, deployment ID, release SHA, and capture date as `productionOrPreviewEvidence`.

Change the redaction packet and status row from `reviewed` to `approved`, clear the preview open item, and retain the missing replay harness only as an evidence limit. Run the focused Work schema, content, documentation, build, and browser tests before committing.

```powershell
pnpm exec vitest run apps/web/src/lib/contracts/work.test.ts apps/web/src/data/content-collections.test.ts
node --test scripts/content-runbook-contract.test.mjs scripts/redaction-approval-packets-contract.test.mjs scripts/work-content-contract.test.mjs
pnpm build
pnpm exec playwright test tests/e2e/project-detail.spec.ts tests/e2e/page-metadata.spec.ts
git add apps/web/src/content/work/xplane-cabin-camera-fov-trade-study.md runbooks/CONTENT_REDACTION_STATUS.md runbooks/CASE_STUDY_REDACTION_APPROVAL_PACKETS.md runbooks/LAUNCH_EVIDENCE.md docs/CHANGELOG.md
git commit -m "docs: approve X-Plane release evidence"
git push origin feat/xplane-fov-portfolio
```

- [ ] **Step 8: Require exact-SHA CI and a second exact preview for the approved tip**

Set `$releaseSha` to the approval commit. Require exact-SHA CI success again, rebuild from the clean commit, and deploy the same preview branch. Verify the full Step 6 matrix against the new deployment and prove `pages deployment list` associates it with the approved tip. Record the second deployment ID and URL in the external preview report; do not create a circular third commit merely to place that ID in tracked documentation. Task 9 may start only from this clean, approved, exact-SHA-previewed commit.

---

### Task 9: Fast-forward production, deploy, verify live, and close documentation

**Files:**
- Modify after first verified production deploy: `runbooks/LAUNCH_EVIDENCE.md`
- Modify after first verified production deploy: `docs/CHANGELOG.md`
- Create externally: final public-safe release report under `C:/Users/joepo/Documents/Codex/2026-08-23/go-a/outputs/`

**Interfaces:**
- Consumes: exact clean feature tip with successful CI, verified preview, current `origin/main`, and recorded rollback deployment.
- Produces: fast-forwarded `origin/main`, exact production deployment, live verification, documentation closeout, second docs-identical deployment if required, and retained rollback evidence.

- [ ] **Step 1: Re-fetch and prove fast-forward safety**

```powershell
git fetch origin --prune
$releaseSha = git rev-parse HEAD
$remoteMain = git rev-parse origin/main
git merge-base --is-ancestor $remoteMain $releaseSha
if ($LASTEXITCODE -ne 0) { throw 'origin/main is not an ancestor of the release tip' }
git status --short
```

Expected: clean tree and fast-forward ancestry. Stop on any concurrent remote divergence.

- [ ] **Step 2: Fast-forward both remote refs without force**

```powershell
git push origin HEAD:feat/xplane-fov-portfolio
git push origin HEAD:main
git ls-remote origin refs/heads/main refs/heads/feat/xplane-fov-portfolio
```

Expected: both refs equal `$releaseSha`.

- [ ] **Step 3: Require exact-SHA production CI success**

Identify the GitHub Actions run with `headSha === $releaseSha` after the main update and require every source verification job to succeed. Treat a Cloudflare workflow failure caused only by a missing CI token separately from source CI; it does not authorize skipping deployment verification.

- [ ] **Step 4: Deploy the exact verified commit to production**

```powershell
pnpm build
pnpm exec wrangler pages deploy dist --project-name humankaylee-portfolio --branch main
```

Record the returned deployment ID and confirm it appears as production for the exact commit. Do not modify DNS or domain settings.

- [ ] **Step 5: Run the complete live verification matrix**

At `https://joepoznanski.io` verify the same preview matrix plus:

- homepage H1 and Cryogenic hero remain unchanged in hierarchy;
- X-Plane title and comparison image are visible on the main landing page;
- X-Plane detail H1 differs from the homepage H1 and returns route-specific HTML;
- canonical URLs use `https://joepoznanski.io`;
- all public media hashes match the committed assets after download;
- Cloudflare analytics loads under the existing CSP without unrelated console errors;
- privacy and terms routes remain distinct and unchanged;
- the live WASM pricer still reprices;
- the prior deployment remains listed and available as rollback.

Repeat homepage and X-Plane route fetches after propagation before declaring success.

- [ ] **Step 6: Record production evidence without circular claims**

Update `LAUNCH_EVIDENCE.md` and `CHANGELOG.md` with the first verified production deployment ID, exact source SHA, live route results, media verification, and rollback ID. Commit and push the closeout documentation:

```powershell
git add runbooks/LAUNCH_EVIDENCE.md docs/CHANGELOG.md
git commit -m "docs: record X-Plane production release"
git push origin HEAD:feat/xplane-fov-portfolio
git push origin HEAD:main
```

Because the closeout commit changes repository state, require exact-SHA CI, rebuild, and deploy it to production. The static site output should be byte-identical because repository docs are outside the Astro build; verify `dist` hashes against the first production build before deploying. Record the final closeout deployment ID in the external release report, avoiding a self-referential third documentation commit.

- [ ] **Step 7: Write the final user-facing release report and verify final state**

Write a concise report under `C:/Users/joepo/Documents/Codex/2026-08-23/go-a/outputs/` containing:

- final portfolio and Conformal renderer SHAs;
- CI run URLs and status;
- preview and production deployment IDs/URLs;
- rollback deployment ID;
- live route/media/browser results;
- exact remaining evidence limits; and
- the fact that the original replay harness was not supplied or rerun.

Final checks:

```powershell
git status --short
git fetch origin --prune
git rev-parse HEAD
git rev-parse origin/main
git rev-parse origin/feat/xplane-fov-portfolio
```

Expected: clean portfolio tree and all three SHAs equal. Recheck the Conformal renderer branch is clean and its remote ref matches. The release is complete only after the final production URL visibly contains the X-Plane homepage entry.
