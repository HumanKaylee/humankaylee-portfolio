# Task 11 release verification report

Date: 2026-08-15
Scope: complete local Signal / Proof release verification
Status: **DONE — local release matrix, Windows and Linux visual baselines, manual visual review, and Lighthouse are green.** No deploy or push was performed.

## Outcome

Task 11 replaced retired atlas, case-study, telemetry, form, and dated taste expectations with falsifiable Signal / Proof behavior. The replacement coverage requires ProjectStage, Work routes, EvidenceStrip, authentic media, static/no-JavaScript behavior, no-WebGL behavior, API-free contact and Black-Scholes operation, canonical navigation, accessibility, responsive layout, and the absence of retired loaders and surfaces.

Four product defects and one release-runner defect were exposed and fixed test-first:

1. Résumé printing did not propagate a white print canvas through the body. The print contract failed before the selector was narrowed to `body.resume-print-route`; the exact assertion then passed.
2. The Black-Scholes demo's public WASM module URL was transformed by Vite in development. A browser test first reproduced the console/import failure and inaccessible controls. The minimal same-origin inline loader now initializes the real controls and reprices a changed input while retaining no-JavaScript fallback, CSP compatibility, no API calls, and the production build.
3. The newly executable Black-Scholes Axe route exposed three serious contrast failures in the live price, footer, and source link. The exact route failed before the component received a minimal light/dark-safe color correction, then passed with no serious or critical findings.
4. Cryogenic Flow scored 76 for Lighthouse performance because its detail video requested a 1,086,774-byte PNG as LCP. A browser/network assertion failed first. The live Work record now uses the existing authentic 67,702-byte 1440 WebP; the MP4, fallback link, alt text, caption, source PNG, social-card source, and archival editorial content were preserved. Cryogenic Flow then scored 99.
5. Windows Chrome wrote complete Lighthouse reports but sometimes failed to remove a locked temporary profile. The runner now removes any old report before each audit and accepts only a newly written, structurally complete report when the entire normalized CLI output is exactly one cleanup diagnostic plus its known `chrome-launcher` cleanup stack. Navigation, fatal, or other output before or after that diagnostic is rejected. A separate failing contract exposed preview-port drift; the runner rejects an occupied port, starts Astro directly, and tears down the process it started.

## Contract replacement map

| Retired contract | Replacement coverage |
| --- | --- |
| `project-atlas.spec.ts` | `signal-proof-home.spec.ts`, `visual-surfaces.spec.ts`, `no-webgl.spec.ts`, and the evidence-surface Node contract require the three-story ProjectStage, authentic media, canonical Work links, static behavior, and no retired atlas/loader. |
| `case-study-routes.spec.ts` | `work-routes.spec.ts`, `project-detail.spec.ts`, `route-coverage.spec.ts`, and `static-shell.spec.ts` require the Work index, all published Work details, semantic evidence flows, cyclic next links, real media, and negative retired-route behavior. |
| `api-telemetry.spec.ts` | `api-outage-resilience.spec.ts`, `signal-proof-home.spec.ts`, and `contact-api.spec.ts` require static launch routes and direct contact to remain useful with failed API requests and forbid simulated delivery state. |
| `portfolio-evolution-2026-08-15.spec.ts` | Current route, responsive, accessibility, static-shell, and visual suites. |
| `taste-evolution-2026-07-25.spec.ts` | Current hierarchy, responsive, visual-surface, capture, and visual-regression suites. |
| `taste-repair.spec.ts` | Current hierarchy, overflow, touch-target, accessibility, route, and cross-platform visual suites. |
| Old evidence-surface contract | Requires ProjectStage, EvidenceStrip, Work detail, real-media hooks, technical typography, five ordered global imports, and explicit absence of atlas/drawer/telemetry/form surfaces. |
| Deferred constellation/WebGL loader contract | Requires the old loader file to be absent and forbids source imports/data hooks; no-WebGL evidence positively requires the complete static ProjectStage and authentic media. |
| Old metadata, notes, responsive, and visual Node contracts | Require published Notes, current Work routes, current social metadata, current visual labels, and absence of retired public routes. |
| B-049 fallback contract | Positively requires the current no-WebGL spec and Signal / Proof snapshot while retaining negative checks for canvas, SVG, and constellation loading. |
| Active accessibility, motion, and quality runbooks | Require current Work routes, ProjectStage, EvidenceStrip, static/no-WebGL behavior, current Windows/Linux snapshot names, Notes parity, and the existing keyboard/Axe/visual-triage rigor while forbidding retired atlas, telemetry, and form language. |
| Active M3/M4 launch verification surfaces | A named Node contract requires the final public HTML routes, flagship details, PDF/WASM/static assets, canonicals, redirects, Lighthouse pages, and direct Contact channels. Old `/projects` and `/case-studies` routes may occur only as redirect inputs; contact POST/API delivery smoke is forbidden. |

The six old E2E files were deleted only after their mapped replacement behavior was green. The old `project-constellation.mjs`, `.evidence-drawer` rule, two old no-WebGL snapshots, and twelve old case-study/projects/note-detail visual snapshots were likewise removed only after current positive coverage and replacement baselines existed.

## TDD and focused evidence

- First replacement behavior run: 20 passed, 6 failed against retired expectations; final focused replacement run: 26 passed, 0 failed.
- Static/quality legacy run: 23 passed, 39 failed; replacement run initially reached 65/66 and exposed the résumé print defect; exact print assertion then passed and the full set reached 66/66.
- Evidence surface: 1/3 before replacement, 3/3 after replacement.
- Deferred loader: 0/1 before replacement, 1/1 after deletion and negative coverage.
- Metadata readiness: 0/1 before replacement, 1/1 after current published-note/default-social assertions.
- Bundle contract: failed on the retired route import, then passed 6/6 against canonical Signal / Proof routes.
- Black-Scholes runtime: 0/1 with the Vite public-file import error; 1/1 after the loader fix. Related Work, CSP, security, and contact checks passed 22/22.
- Black-Scholes accessibility: 0/1 with three serious color-contrast findings; 1/1 after the component color correction. The final ten-route Axe matrix is included in the serial E2E run.
- Cryogenic poster: 0/1 while the detail requested the PNG; 1/1 after the one-line live Work poster change. The final Home responsive-poster assertion also positively requires the 1440 WebP and negatively forbids the PNG and homepage video playback.
- Lighthouse runner contract: missing cleanup handling failed before implementation; 9/9 passed after it. Occupied-port/direct-process behavior then failed before implementation. Review rounds added mixed prefixed and unprefixed output cases plus the observed benign cleanup stack; the final runner contract passed 12/12.
- Operational docs and launch probes: the focused migration contract began at 1/6 (five failures for missing current Work/B-049/M3/M4/README requirements) and reached 6/6 after the three active runbooks and read-only launch surfaces were migrated. The first full Node sweep then exposed three preserved Quality/Notes/visual-triage omissions; the exact focused set was RED 0/3, the stale `@api-telemetry`/old no-WebGL expectations were replaced with current behavior, and the combined current run finished 9/9. `bash -n scripts/launch/m3-dns-verify.sh scripts/launch/m4-production-smoke.sh` also exited 0.

## Required full matrix

All commands below were run from the final working tree:

| Command | Result |
| --- | --- |
| `pnpm lint` | Exit 0; 141 files checked; no fixes required. |
| `pnpm typecheck` | Exit 0; 70 files; 0 errors, 0 warnings, 13 existing Zod deprecation hints. |
| `pnpm test` | Exit 0; Vitest 50/50; Node 132 total: 129 passed, 0 failed, 3 skipped. |
| `pnpm test:e2e -- --workers=1` | Exit 0; 188 total: 168 passed, 0 failed, 20 intentional capture-only skips; 1.0 minute. This final run occurred after the Black-Scholes visibility/accessibility and ProjectStage reading-order corrections. |
| `pnpm build` | Exit 0; 15 pages built in 2.91 seconds. |
| `pnpm bundle:budget` | Exit 0; summary at `test-results/bundle-budget-summary.json`. |

Final critical JavaScript sizes:

- `/`: 982 B
- `/work/black-scholes-wasm/`: 4,107 B
- Each flagship detail route: 1,212 B
- All other audited routes: 0 B

Reviewed Node skips:

1. Installed portfolio skill mirrors are absent on this runner.
2. Live GitHub issue sync is opt-in through `HK_VERIFY_GITHUB_LIVE=1`.
3. Live PR/CI verification is opt-in through `HK_VERIFY_LAUNCH_EVIDENCE_LIVE=1`.

Reviewed E2E skips: all 20 are capture-only cases gated by `TASTE_AUDIT_CAPTURE_DIR`. The same cases were run explicitly during the capture audit and passed.

## Visual capture and comparison

The approved PowerShell capture command ran the hierarchy check plus all ten desktop/mobile route captures: 21/21 passed. Captures are under `artifacts/signal-proof-captures/`:

- Home: `home-desktop.png`, `home-mobile.png`
- Work: `work-desktop.png`, `work-mobile.png`
- Cryogenic Flow: `work-cryo-desktop.png`, `work-cryo-mobile.png`
- CLI fleet: `work-cli-fleet-desktop.png`, `work-cli-fleet-mobile.png`
- Remote recovery: `work-remote-recovery-desktop.png`, `work-remote-recovery-mobile.png`
- Black-Scholes: `work-black-scholes-desktop.png`, `work-black-scholes-mobile.png`
- About: `about-desktop.png`, `about-mobile.png`
- Résumé: `resume-desktop.png`, `resume-mobile.png`
- Contact: `contact-desktop.png`, `contact-mobile.png`
- Notes: `notes-desktop.png`, `notes-mobile.png`

Direction A comparison artifacts:

- `artifacts/signal-proof-captures/direction-a-reference.png`
- `artifacts/signal-proof-captures/direction-a-vs-home-desktop.png`

Every desktop and mobile capture was opened and inspected. The side-by-side Direction A comparison used the same desktop width. Findings:

- The off-white editorial canvas, sparse four-link navigation, oversized type, lime signal, flat borders/rules, authentic Cryogenic proof, and static mobile reading order match the approved written direction.
- No residual hierarchy, crop, spacing, overflow, font, border, contrast, or layout defect remained after the Black-Scholes Axe correction and focused capture review.
- Keyboard/focus, 44 px targets, reduced motion, and overflow were additionally exercised by behavior tests rather than inferred from screenshots.
- The WebP change produced an intentional 1,082-pixel (0.01%) encoding difference in the Cryogenic desktop poster only. Expected, actual, and diff were inspected; content, crop, hierarchy, and layout were unchanged. Only that approved baseline was refreshed at that point.

Windows visual evidence:

- `pnpm test:visual:update`: 20/20 passed and wrote the approved current-route baselines, including initialized Black-Scholes desktop/mobile states.
- Final `pnpm test:visual`: 20/20 passed with zero further diff.

Linux visual evidence was generated by a Linux browser, not copied or renamed from Windows:

1. An isolated `/tmp/signal-proof-task11.*` copy was made from the current uncommitted source while excluding `.git`, `node_modules`, `dist`, test output, reports, and capture artifacts.
2. `pnpm install --frozen-lockfile` installed 629 locked Linux packages.
3. Linux Playwright 1.60/Chromium generated the original 18 visual baselines and the current no-WebGL baseline. Review round 1 repeated the isolated-current-source procedure to generate the two missing Black-Scholes Linux baselines; the two Cryogenic Linux baselines were byte-unchanged.
4. The final Linux visual regression suite passed 20/20 without update mode. The existing no-WebGL baseline remained covered by its 1/1 executable suite.
5. Only genuinely Linux-generated PNGs were copied back. The verified temporary directories were then removed.

## Lighthouse

Final fresh command: `pnpm lighthouse:local`
Final result: exit 0; thresholds passed; summary at `test-results/lighthouse-summary.json`.

| Route | Performance | Accessibility | Best practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| `/` | 99 | 100 | 100 | 100 |
| `/work/` | 100 | 100 | 100 | 100 |
| `/work/cryo-flow-sim/` | 99 | 100 | 100 | 100 |
| `/resume/` | 99 | 100 | 100 | 100 |
| `/contact/` | 100 | 100 | 100 | 100 |

Homepage mobile LCP: **1,811 ms**, below the strict 2,500 ms threshold. The M4 contract also proves that 2,500 ms itself fails the strict production gate.

The final run began with ports 4322 and 4323 clear, served the audited URL from its own Astro process on 4322, and ended with both ports clear. The earlier mismatched diagnostic run against an orphaned listener was stopped and excluded from evidence; only the final fresh-process scores above are reported.

## Retired-reference proof

`global.css` contains exactly these five ordered imports:

1. `tokens.css`
2. `base.css`
3. `layout.css`
4. `components.css`
5. `motion.css`

The mandated retired-token grep was split so executable visitor source could be distinguished from archival prose and negative assertions:

- Live components, layouts, pages, styles, libraries, Work/Notes content, and public assets: zero matches.
- Active `ACCESSIBILITY_AUDIT`, `MOTION_AND_WEBGL_FALLBACK_QA`, `QUALITY`, and `scripts/launch` surfaces: zero matches.
- Archived editorial source: exactly the preserved `creative-web-systems-atlas-demo.md` and `.json`; Task 7 deliberately retained these non-routed sources.
- Replacement tests/contracts: explicit negative assertions that forbid atlas, constellation, drawer, telemetry, and form surfaces.
- Historical planning, launch-evidence, GitHub-sync, and agent-instruction contracts still contain positive legacy wording. They document prior plans/evidence and are not imported by the visitor site. They were not silently rewritten under Task 11.

`git diff --check` exits 0. The seven exact removed files (`project-constellation.mjs` plus six old specs) do not exist. No live style or executable site reference remains for the retired loader or selector.

## Files changed

Production files:

- Deleted `apps/web/public/scripts/project-constellation.mjs`.
- Updated `apps/web/src/components/BlackScholesDemo.astro`.
- Updated `apps/web/src/components/ProjectStage.astro`.
- Updated `apps/web/src/content/notes/wasm-black-scholes-options-pricer.md`.
- Updated `apps/web/src/content/work/black-scholes-wasm.md`.
- Updated `apps/web/src/content/work/cryo-flow-sim.md` (one live poster path only).
- Updated `apps/web/src/pages/resume/index.astro` (print selector only).
- Reduced `apps/web/src/styles/global.css` to five ordered imports.
- Removed the stale `.evidence-drawer` rule from `apps/web/src/styles/motion.css`.

Node contracts/runners:

- `scripts/accessibility-and-fallback-qa-contract.test.mjs`
- `scripts/bundle-budget.mjs`
- `scripts/bundle-budget.test.mjs`
- `scripts/evidence-surface-contract.test.mjs`
- `scripts/lighthouse-local.mjs`
- `scripts/lighthouse-local.test.mjs`
- `scripts/notes-qa-parity-contract.test.mjs`
- `scripts/phase-7-metadata-readiness-contract.test.mjs`
- `scripts/post-launch-feature-prep-contract.test.mjs`
- `scripts/quality-runbook-contract.test.mjs`
- `scripts/responsive-qa-contract.test.mjs`
- `scripts/signal-proof-launch-surfaces-contract.test.mjs`
- `scripts/visual-regression-contract.test.mjs`

Active verification documentation and read-only launch probes:

- `runbooks/ACCESSIBILITY_AUDIT.md`
- `runbooks/CROSS_BROWSER_RESPONSIVE_QA.md`
- `runbooks/MOTION_AND_WEBGL_FALLBACK_QA.md`
- `runbooks/QUALITY.md`
- `runbooks/VISUAL_REGRESSION.md`
- `scripts/launch/README.md`
- `scripts/launch/m3-dns-verify.sh`
- `scripts/launch/m4-production-smoke.sh`

E2E behavior:

- Updated API-outage, journey, motion, no-WebGL, quality, responsive, route, Home, static-shell, taste-audit, visual-regression, visual-surface, and Work-route specs.
- Deleted the six mapped old iteration specs listed above.
- Replaced old no-WebGL and visual snapshots with current Windows and Linux baselines.
- Added 20 route captures and two Direction A comparison artifacts.

This report is stored at `.superpowers/sdd/2026-08-15-portfolio-signal-proof-rewrite/task-11-report.md`.

## Risks and boundaries

- The active M3/M4 scripts passed their named contract and shell syntax check, but their external DNS/TLS/public-origin probes were intentionally not executed. This task verifies local read-only behavior and script shape; it does not provide production-origin evidence or launch approval.
- Historical planning, launch-evidence, GitHub-sync, and agent-instruction contracts retain prior atlas/telemetry language. These non-visitor records are documented separately from the zero-match result for active runtime and verification surfaces.
- Typecheck reports 13 deprecation hints in existing Zod contracts; there are no type errors or warnings.
- Lighthouse's upstream Windows Chrome cleanup remains platform-specific. The local runner accepts it only after deleting any old report, validating a fresh complete report, trimming surrounding whitespace, and recognizing exactly the observed cleanup diagnostic with its known cleanup stack. Extra CLI output is retained and fails the gate.
- No production deploy, external message, push, issue mutation, or launch approval occurred.

Commit message: `test: verify the Signal Proof portfolio release`.

## Review round 1 corrective verification

Review round 1 closed six release-proof gaps without deploying or changing dependencies:

1. The active visual-regression and cross-browser runbooks now use the same ten-route Signal / Proof matrix as their executable specs, explicitly cover the initialized Black-Scholes detail, and forbid retired Projects, case-study, telemetry, API-form, and old note/fallback expectations.
2. Launch README, M3, and M4 default to `joepoznanski.io`; stale domains are forbidden. M3 accepts only permanent 301/308 redirects and rejects temporary 302/307 responses.
3. The Lighthouse cleanup exception succeeds only when the fresh complete report accompanies exactly one cleanup diagnostic after the known `chrome-launcher` cleanup stack is normalized. Prefixed runtime errors and unprefixed navigation/fatal text before or after cleanup are failing contract cases.
4. The bundle guard requires `/work/black-scholes-wasm/` and has a negative fixture that fails when that route alone is absent.
5. Black-Scholes is present in the visual, capture, responsive, no-JavaScript, reduced-motion, privacy, Axe, and runtime matrices. Windows and genuine Linux desktop/mobile baselines exist and pass with zero diff.
6. M4 now enforces homepage mobile LCP strictly below 2,500 ms; contract boundaries at 2,499.9, 2,500, and 2,500.1 ms prove the comparison.

Focused reviewer contract evidence began at 17/24 passing with seven expected failures and ended at 24/24 passing. The first all-browser responsive run passed Chromium 4/4 but could not launch missing Playwright Firefox/WebKit binaries; after installing the matching Playwright 1.60 browser binaries without changing repository dependencies, the exact matrix passed 12/12 across Chromium, Firefox, and WebKit.

The original full-page Cryogenic desktop capture visibly contained Chromium's native loading ring even though the authentic WebP poster did not. Capture readiness now decodes real images/posters, loads native video metadata, and waits for the painted state. The focused Cryogenic capture rerun passed 2/2; both desktop/mobile outputs were opened, and the ring is absent. The same readiness gate protects visual baselines. Only the verified Cryogenic captures changed; its Linux visual baselines were unchanged.

Review round 1 final local evidence is the full matrix recorded above, Windows visual update 20/20, Windows zero-diff visual run 20/20, genuine Linux zero-diff visual run 20/20, all-browser responsive 12/12, focused Black-Scholes captures 2/2, focused Cryogenic captures 2/2, and the fresh Lighthouse scores recorded above. Lighthouse began with ports 4321 and 4322 clear, served its own audited process on 4322, and left 4322 clear after exit. Its first mixed-error contract rejected a second prefixed runtime line, but re-review later demonstrated that unprefixed error text was still accepted; review round 2 below supersedes that classifier evidence.

Corrective commit message: `test: close Signal Proof release review gaps`.

## Review round 2 cleanup-classifier correction

Re-review directly proved that the round-1 classifier returned `true` when either `Navigation failed: DNS resolution error` appeared before the cleanup line or `Unexpected fatal error` appeared after it. A new table of navigation/fatal text both before and after cleanup failed as intended: 10/11 focused tests passed and the new case failed.

The first anchored implementation accepted only a whitespace-wrapped single diagnostic and made all 11 focused tests pass. A fresh proportional Lighthouse run then truthfully failed on its warm-up audit because Lighthouse appends a duplicate EPERM line and a six-frame `chrome-launcher` cleanup stack for the same locked profile. That observed output became a second positive fixture, which failed at 11/12 before implementation.

The final classifier trims only surrounding whitespace. It recognizes the cleanup path, normalizes only the exact duplicate EPERM line and the six known `rmSync`/`chrome-launcher`/Lighthouse cleanup frames, and then requires the remaining output to match the single cleanup diagnostic. Any extra line or unknown stack shape remains in the output and fails the anchored match.

Final proportional verification:

- `node --test scripts/lighthouse-local.test.mjs`: 12/12 passed.
- Direct probes: whitespace-wrapped cleanup `true`; unprefixed DNS text before cleanup `false`; unprefixed fatal text after cleanup `false`.
- `pnpm lint`: 141 files, exit 0.
- `pnpm test`: Vitest 50/50; Node 129 passed, 3 reviewed skips, 132 total; exit 0.
- `pnpm lighthouse:local`: exit 0 after a fresh 15-page build. Home scored 99/100/100/100 with 1,811 ms mobile LCP; Work scored 100/100/100/100; Cryogenic Flow 99/100/100/100; Résumé 99/100/100/100; Contact 100/100/100/100. The runner accepted only the observed cleanup stack on warm-up, Work, and Contact, and port 4322 was clear after exit.

Round-2 corrective commit message: `fix: require cleanup-only Lighthouse failures`.

## Final branch-wide review correction

The final branch-wide review found two visitor-facing behavior gaps that the earlier release proof had not exercised:

1. Black-Scholes loaded its JavaScript glue and WebAssembly binary as soon as the detail route loaded even though the demo began below the viewport. The focused request test failed with both `/wasm/blackscholes/blackscholes_wasm.js` and `/wasm/blackscholes/blackscholes_wasm_bg.wasm` already present before any scroll. `BlackScholesDemo` now observes the real demo boundary and requests neither asset until it intersects the viewport. After intersection, the exact two assets load, the real price initializes, and a changed spot input reprices. A blocked WASM request leaves the fallback visible and the controls unavailable. Public Work and Note copy now says the module loads when the demo enters view; it no longer claims an Astro `client:visible` directive that is not used.
2. ProjectStage previously rendered all three Work rows followed by all three media panels in source order. The mobile and no-JavaScript adjacency tests failed because no row/panel pairs existed. Each project now owns a same-slug row/panel pair in the DOM, so mobile and static reading order is Cryogenic row → Cryogenic proof, fleet row → fleet proof, and recovery row → recovery proof. Desktop fine-pointer enhancement projects those same pairs into the existing two-column selector and retains pointer, keyboard-focus, normal-link, coarse-pointer, and viewport-transition behavior.

The first complete serial E2E run correctly exposed a serious `aria-hidden-focus` defect after true WASM deferral: six pre-initialization controls were still focusable inside `aria-hidden`. The exact Black-Scholes Axe case was RED before the initial controls became `inert`; successful initialization now removes both `inert` and `aria-hidden`, while failed initialization preserves both. The focused Axe case then passed.

Final correction evidence:

- Initial focused RED: Black-Scholes 0/1 because both assets loaded below the viewport; mobile ProjectStage 0/1 and no-JavaScript ProjectStage 0/1 because the pairs were absent.
- Focused GREEN: Home and Work behavior 24/24; deferred loader/failure paths 2/2; Black-Scholes Axe 1/1.
- Full matrix: lint 141 files; typecheck 70 files with 0 errors, 0 warnings, and 13 existing hints; Vitest 50/50; Node 129 passed with 3 reviewed skips; E2E 168 passed with 20 capture-only skips; 15-page build; bundle budget passed with Black-Scholes at 4,107 B critical JavaScript.
- Home capture audit: desktop/mobile 2/2. Both full-page captures were opened and compared against the prior same-viewport evidence. Desktop preserves the established two-column hierarchy. Mobile now places each authentic proof immediately after its matching project with no crop, overflow, spacing, font, border, or contrast defect.
- Windows visual regression: the intentional Black-Scholes copy change produced text-only differences in its desktop/mobile baselines (2% and 1% respectively). The actuals and diffs were inspected, only that pair was regenerated, and the final Windows suite passed 20/20 with zero further diff.
- Genuine Linux visual regression: an isolated `/tmp/signal-proof-task11-round3` copy was verified byte-for-byte against the current Windows `BlackScholesDemo` and `ProjectStage` sources. Linux Playwright 1.60/Chromium generated only the Black-Scholes desktop/mobile Linux pair (2/2); the full Linux suite then passed 20/20 without update mode. Copied snapshot hashes matched the generated Linux files. The verified temporary copy and both manually started Windows/WSL Astro servers were removed; port 4321 was clear in both environments.

No deploy, push, dependency change, secret mutation, or external launch probe occurred.

Final corrective commit message: `fix: align proof loading and reading order`.
