# X-Plane FOV Portfolio Integration Design

**Status:** Approved in chat; awaiting written-spec review

**Date:** 2026-08-24

**Portfolio route:** `/work/xplane-cabin-camera-fov-trade-study/`

**Portfolio target:** Cloudflare Pages preview followed by production when every release gate passes

**Portfolio base:** `5d6c060b7133dd69617a80ca1970c64f7310db9b`

**Recovered artifact source:** `xplane_fov_study_content.zip`, supplied by Joe Poznanski on 2026-08-23

## 1. Purpose

Recover the X-Plane cabin-camera field-of-view study that Claude Code Desktop prepared in the wrong portfolio checkout, rebuild it in the repository that actually feeds `joepoznanski.io`, correct the related homepage copy and Conformal Cooling presentation, and publish the verified result.

The release must make the work understandable to a nontechnical visitor without weakening the evidence boundary. It must also make the site's flight-simulation, controls, injection-molding, conformal-cooling, metal-additive-manufacturing, Rust, and C++ experience easier for search engines and AI crawlers to identify from visible copy and structured metadata.

## 2. Recovered state

Claude Code Desktop created an untracked case-study draft and nine untracked media files in `C:\Users\joepo\projects\humankaylee-portfolio`, a legacy worktree at commit `030e705258dd3096b15a5a9ae1d524b05bed9473`. That tree contains more than one hundred unrelated dirty or untracked paths and is not a safe release source.

The production repository at `C:\Users\joepo\research-2026-08-23\site-hunt\reconcile` contains no X-Plane Work record, route, media, commit, stash, reflog entry, or dangling commit. Claude's transcript explicitly corrected its earlier claim that the case study was live: the route was a local catch-all response and was never deployed.

The original X-Plane user prompt did not survive Claude transcript compaction. The current request, the supplied archive, Claude's local draft, the surviving manifests, and the exact later homepage request are the controlling inputs. Assistant claims about prior completion are not acceptance evidence.

## 3. Goals

- Publish an evidence-led X-Plane cabin-camera FOV case study from the supplied artifacts.
- Show the case study on the homepage and Work index without displacing either existing flagship.
- Preserve Cryogenic Flow as the homepage hero and first flagship.
- Explain the visible 50-degree versus 110-degree trade in direct language.
- Publish both comparison stills and both full inspection videos without cropping their four-camera composition.
- Remove program identifiers, private source paths, and `LM5` through `LM8` designators from every public artifact and document.
- Remove the visitor-facing Cryogenic Flow phrase `unexpected clamp events` and replace it with meaningful verification language.
- Rewrite Conformal Cooling copy around its practical injection-molding use case and the role of metal additive manufacturing.
- Replace the confusing tubes-over-gear view with a reproducible rendering from the real cavity and channel geometry.
- Improve visible metadata and JSON-LD so crawlers receive the same accurate professional story as human visitors.
- Update the canonical backlog, changelog, redaction records, design, implementation plan, and release evidence.
- Commit and push every accepted source change, deploy the exact verified portfolio commit, verify production, and retain the previous production deployment as rollback.

## 4. Non-goals

- Do not merge or copy the legacy dirty worktree as a whole.
- Do not publish the source archive, original `info.txt` files, raw source paths, program name, or camera designators.
- Do not claim the replay harness was independently executed; the harness source is not in the supplied archive.
- Do not claim physical camera performance, certification, hardware validation, or flight-test results.
- Do not claim the Conformal Cooling prototype proved thermal performance, hydraulic performance, shorter cycle time, or faster production.
- Do not host the ConformalFlow backend or expose a public geometry-generation service.
- Do not introduce a new frontend framework, image-generation dependency, analytics product, or runtime service.
- Do not redesign unrelated pages or disturb the legal-page release.

## 5. Chosen portfolio placement

The X-Plane study becomes the second `supporting` Work entry. This is the truthful level for a focused engineering study with strong visual artifacts but without the supplied replay harness source.

The published Work hierarchy becomes:

1. Cryogenic Flow Simulation — flagship.
2. Conformal Cooling Channel Generation — flagship.
3. X-Plane Cabin Camera FOV Trade Study — supporting.
4. Black-Scholes Rust/WASM — supporting.
5. CLI Fleet Synchronization — archive.
6. Remote Workstation Recovery — archive.

The homepage continues to render all flagships followed by all supporting entries. Cryogenic Flow remains the sole hero. Archive entries remain off the homepage. The Work index contract changes from two flagships, one supporting entry, and two archive entries to two flagships, two supporting entries, and two archive entries.

This approach is preferred over making X-Plane a third flagship because it preserves the existing hierarchy and evidence standard. It is preferred over archive-only placement because the user explicitly requested homepage visibility.

## 6. X-Plane story and evidence boundary

### Title

**X-Plane Cabin Camera FOV Trade Study**

### Lead copy

> A documented X-Plane replay compares four cabin camera views at the same flight moments, making the trade between a narrow 50-degree field of view and a wider 110-degree field of view visible frame by frame.

### Problem

A narrow lens preserves angular detail but can lose the horizon, wing, and surrounding context during a bank. A wider lens preserves situational context but spreads the same pixels across a larger scene. Hand-flying two comparison runs would add pilot variation, so the artifact set documents a scripted takeoff, climb, and opposite-direction bank sequence for both configurations.

### Outcome

At the two supplied bank timestamps, the 50-degree views lose important horizon or wing context while the 110-degree views retain more of those references. The page presents that result as a bounded visual trade study, not as a universal camera-selection rule.

### Verified inputs

The supplied archive contains exactly two configuration directories. Each directory contains:

- one H.264 composite video;
- ten phase-keyed PNG screenshots; and
- one plain-text manifest.

The manifests report a 2880 by 800, 250-second, 2-frames-per-second, four-camera composite. One configuration is 50 degrees with baseline pitch; the other is 110 degrees with a negative 5-degree pitch offset. Therefore the page must not say horizontal FOV is the only changed parameter. It must state that the published comparison is between two complete camera configurations: 50 degrees at baseline pitch and 110 degrees with the documented pitch offset.

### Evidence limits

- The archive documents the replay as deterministic, but the source replay harness and scripts are absent and cannot be independently rerun.
- The two supplied configurations are a subset of a larger sweep described by the manifests.
- The artifacts show rendered X-Plane imagery, not physical camera or aircraft test data.
- The page does not establish sensor resolution, lens distortion, detection performance, operator performance, or certification suitability.
- The page does not identify the original program, source drive, hostname, account, or internal camera naming scheme.

## 7. X-Plane public media pipeline

The public media is rebuilt from the original archive rather than copied from the legacy portfolio derivatives.

### Sanitization

- Remove the leading `LM5`, `LM6`, `LM7`, and `LM8` tokens from every tile overlay with minimal opaque masks.
- Preserve the generic `Port Fwd`, `Port Aft`, `Stbd Fwd`, and `Stbd Aft` labels and the visible FOV, pitch, heading, zoom, and position values.
- Exclude the original manifests because they contain a program identifier and private Windows source paths.
- Generate a new public manifest containing only publication-safe configuration facts, output properties, filenames, hashes, and the evidence limitations from this design.
- Fail the release scan if any public X-Plane file or rendered HTML contains `SNV`, a drive-letter path, `XPlaneRecordings`, `LM5`, `LM6`, `LM7`, or `LM8`, case-insensitively.

### Published assets

Use the following namespace:

`apps/web/public/media/xplane-fov/`

Publish:

1. A sanitized 50-degree composite MP4 at 1440 by 400 and 2 fps.
2. A sanitized 110-degree composite MP4 at 1440 by 400 and 2 fps.
3. One poster for each video.
4. A 120-second comparison still built from sanitized frames for both configurations.
5. A 180-second comparison still built from sanitized frames for both configurations.
6. Responsive 640, 960, and 1440 pixel WebP renditions of both comparison stills.
7. A sanitized `capture-manifest.json` with cryptographic hashes and no private provenance fields.

The homepage uses the 120-second comparison still, not an autoplay video. The detail page shows both comparison stills followed by both videos with native controls and direct-file fallback links. Full videos use `preload="none"`.

### Fidelity rules

- Video frames may be scaled and the four leading camera tokens may be masked; terrain, wing, horizon, camera parameters, and configuration timing must not be generated, retouched, or rearranged.
- Comparison stills must be extracted from the sanitized published videos at the declared timestamps.
- Encoding must preserve readable overlay text at the published desktop size.
- The 50-degree and 110-degree frames must retain their original configuration association and order.
- The public manifest must record that the media is a sanitized derivative of a user-supplied archive, not a fresh replay run.

## 8. Media component correction

The current evidence gallery forces every image and video into a 16:9 box. The X-Plane composites are 3.6:1, so the existing behavior would crop away camera tiles and invalidate the evidence.

`CaseStudyMediaGallery.astro` and the shared media contract will preserve each item's declared width-to-height ratio. Images and videos use the record's intrinsic aspect ratio and `object-fit: contain`; existing 16:9 media remains visually unchanged. The component must not infer one global aspect ratio.

The behavioral test must include a wide video record and fail if the rendered media still receives a hard-coded 16:9 ratio or cropping behavior.

## 9. Homepage and Cryogenic Flow copy

Visitor-facing Cryogenic Flow copy must explain the evidence without internal validation jargon.

Remove `unexpected clamp events` from:

- the Cryogenic Flow Work lede;
- its evidence summary and homepage evidence values;
- the homepage capability proof; and
- any homepage-visible rendered copy or metadata.

Replace the homepage evidence value with a provenance or validation result that a nontechnical visitor can understand, such as the fixed-seed run record and its recorded thresholds. Technical implementation detail may remain in the case-study body only when it helps explain the validation method; it must not return as a headline metric.

Update the proof-gallery introduction from singular supporting-demonstration language to copy that accurately describes two flagship systems and two focused technical studies.

## 10. Conformal Cooling copy

The homepage and Work index must first explain what the system is for:

> ConformalFlow automatically designs cooling passages that follow an injection-mold cavity. The goal is to remove heat more evenly so molded parts can reach ejection temperature sooner, while preserving inspectable geometry and manufacturing constraints.

The same visible introduction must explain that complex curved internal passages are enabled by metal additive manufacturing. The copy must say this is the design goal and industry use case, not a measured result from the current capture.

The detail page retains the explicit evidence limit that the captured run did not establish cycle-time, thermal, hydraulic, shop-floor, or physical-prototype performance.

## 11. Conformal Cooling visual correction

The current `conformal-cavity-channels` image is not acceptable: the cyan channel bundle visually covers the orange gear and makes their spatial relationship difficult to understand.

Regenerate the figure from the real captured meshes using the existing renderer at Conformal source commit `2926936a8a5104d6724ef6a00b3f0cfbffb23d21` as the base. The authoritative inputs already exist under the retained external capture directory:

- `input/gear-cavity.stl`;
- `raw/api-job/cavity.stl`; and
- `raw/api-job/channels_only.stl`.

Create a narrow Conformal renderer branch and a separate source commit. Begin with a falsifiable rendering test that measures visible cavity and channel regions and rejects the current camera/occlusion result. Change only camera, transparency, face sampling, or evidence-render composition required to make both meshes legible. Do not alter production channel geometry or the captured meshes.

The accepted render must:

- visibly expose the gear outline and channel relationship at desktop and mobile sizes;
- retain real channel and cavity geometry;
- avoid opaque channel surfaces hiding most of the cavity;
- pass the renderer's structural tests;
- be visually inspected at 1440, 960, and 640 pixels; and
- record the new renderer commit and output hashes in the Conformal public manifest.

If a real reproducible rerender cannot pass these requirements, publication stops. The image is not replaced with generated art, a hand-drawn approximation, or a misleading composition.

## 12. Search and crawler semantics

Visible copy and structured data must agree. Optimization is descriptive, not keyword stuffing.

### Site-wide person metadata

Expand the existing `Person` JSON-LD with:

- `jobTitle`: `Principal Software Engineer`;
- `knowsAbout` entries for flight simulation, aerospace simulation, controls software, telemetry systems, Rust, C++, hardware-in-the-loop testing, injection molding, conformal cooling, metal additive manufacturing, distributed systems, and operational software; and
- `sameAs` links for the existing public LinkedIn profile and `HumanKaylee` GitHub profile from `apps/web/src/data/profile.ts`; the email address is not added to JSON-LD.

### Page metadata

- Update the site and homepage descriptions to name flight simulation, controls, telemetry, Rust, and C++ directly.
- Update the Work index description to cover flight simulation, engineering simulation, manufacturing software, and operational systems.
- Give the X-Plane route a unique title, description, canonical URL, Open Graph image, and `CreativeWork` JSON-LD.
- Update the Conformal title and description to include injection molds, cooling passages, and metal additive manufacturing without claiming measured production improvement.
- Keep the generated sitemap limited to published Work entries and verify the new canonical route appears exactly once.
- Preserve `index,follow`, canonical host normalization, and the existing robots policy.

## 13. Documentation and backlog

Create backlog item `B-069: Publish X-Plane FOV study and homepage clarity corrections` in `docs/BACKLOG.md`. Its acceptance criteria mirror this design and separate implemented work from retained evidence limits.

Update:

- `docs/CHANGELOG.md` with the exact released scope and deployment evidence;
- `runbooks/CONTENT_REDACTION_STATUS.md` with the X-Plane approval state;
- `runbooks/CASE_STUDY_REDACTION_APPROVAL_PACKETS.md` with the archive ownership, sanitization, visual inspection, and public-manifest evidence;
- `runbooks/LAUNCH_EVIDENCE.md` with the exact preview and production commit/deployment results; and
- the implementation plan in `docs/superpowers/plans/` with test-first tasks and commit boundaries.

No document may say the route is live until a production fetch and browser inspection prove it.

## 14. Error and stop behavior

- A dirty or unexpected portfolio worktree stops implementation until ownership is resolved.
- An unexpected source-archive inventory or hash change stops media derivation.
- Any residual private identifier or path blocks publication.
- Any mismatch between declared timestamps and extracted frames blocks publication.
- A missing poster, responsive image, video, or public-manifest entry fails the content contract.
- A Conformal renderer failure or illegible replacement blocks publication.
- A source or portfolio test failure is investigated; tests and assertions are not weakened to obtain green.
- A visual baseline changes only after expected, actual, and diff images are inspected together and the content change is intentional.
- Video failure leaves a poster, caption, written description, and direct file link usable.
- No-JavaScript and reduced-motion visitors receive the full narrative and still evidence without an automatic media request.
- A preview or production route that returns the homepage fallback instead of route-specific identity is a release failure.
- A Cloudflare authentication or deployment failure stops publication without changing DNS, domains, or credentials.

## 15. Verification strategy

### Test-driven implementation

- Add failing content/schema tests before the new Work record.
- Add failing route, count, ordering, sitemap, metadata, JSON-LD, and private-token tests before implementation.
- Add a failing wide-media contract before correcting the gallery.
- Add a failing Conformal renderer legibility test before changing the render.
- Add negative tests that mutate a sanitized manifest or output with a forbidden identifier and prove the public-safety gate rejects it.

### Media verification

- Inspect the two source manifests and all selected source frames.
- Verify output codec, dimensions, duration, frame rate, pixel format, fast-start layout, and audio-stream absence with `ffprobe`.
- Verify every public filename, byte size, and SHA-256 value against the sanitized manifest.
- Inspect both stills, both posters, representative frames from both videos, and the Conformal replacement at original resolution.
- Confirm wide composites are not cropped on the detail page.

### Portfolio verification

- Run formatting and linting.
- Run Astro type checking.
- Run all unit and Node contract tests.
- Run the production build and bundle budget.
- Run the complete Playwright suite, including route identity, metadata, structured data, no-JavaScript, reduced motion, keyboard, accessibility, responsive, cross-browser, media, no-WebGL, and API-down behavior.
- Run Rust formatting, Clippy with warnings denied, and workspace tests.
- Capture and inspect Home, Work, X-Plane detail, Cryogenic Flow detail, and Conformal detail at desktop and mobile sizes.
- Inspect visual expected, actual, and diff images before accepting any new baseline.
- Scan committed and staged content for credentials, private paths, program identifiers, and camera designators.

### Preview and production verification

- Push the exact release branch and require exact-commit CI success.
- Deploy the built static site to an isolated Cloudflare Pages preview.
- Verify route-specific identity, canonicals, headers, sitemap, structured data, console, media playback, responsive layout, no-JavaScript behavior, and reduced motion on preview.
- Record the current production deployment as rollback.
- The user's 2026-08-24 instruction to publish when ready authorizes production after every gate in this design passes.
- Fast-forward the production branch without force, deploy the exact verified commit, and verify the same live matrix at `https://joepoznanski.io/`.
- Re-fetch the homepage and X-Plane route after deployment propagation and prove the homepage contains the new Work title while the detail route does not return homepage fallback content.

## 16. Acceptance criteria

The work is complete only when all of the following are true:

- The canonical portfolio repository contains one published X-Plane Work record and no legacy case-study copy.
- The homepage visibly includes X-Plane after the two flagships and before Black-Scholes.
- The Work index contains exactly two flagship, two supporting, and two archive entries.
- Cryogenic Flow remains the homepage hero.
- No visitor-facing homepage copy contains `unexpected clamp events`.
- Conformal Cooling copy clearly explains injection-mold cooling, earlier ejection as a design goal, and metal additive manufacturing as an enabling method.
- The Conformal cavity/channel figure is a reproducible real-geometry render that is legible at desktop and mobile sizes.
- The X-Plane page distinguishes the two full camera configurations and does not say FOV was the only changed parameter.
- No public artifact or HTML contains the program identifier, private source path, or `LM5` through `LM8` tokens.
- Both comparison stills and both videos render without cropping, overflow, or illegible overlays.
- The page states that the replay harness was not supplied or independently rerun.
- Homepage, Work, X-Plane, Cryogenic Flow, and Conformal metadata and structured data accurately reflect visible content.
- The backlog, changelog, redaction packet, redaction status, and launch evidence are current and do not claim publication early.
- All local, browser, Rust, media, security, CI, preview, and production gates pass on the exact deployed commit.
- The accepted portfolio commit and the separate Conformal renderer provenance commit are pushed to their respective `origin` remotes without force or history rewrite.
- `joepoznanski.io` serves the new homepage and X-Plane route, and the prior production deployment remains recorded for rollback.

## 17. Principal tradeoff

The design favors an honest, static, sanitized comparison over pretending the missing replay harness can be reproduced or turning the portfolio into an interactive X-Plane application. Visitors receive direct visual evidence and clear engineering reasoning; the page also states exactly what the supplied artifacts do not prove.
