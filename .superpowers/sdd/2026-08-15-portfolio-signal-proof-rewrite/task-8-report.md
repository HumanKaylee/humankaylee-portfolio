# Task 8 report — About and secondary content consolidation

## Outcome

Implemented `/about/` as a static, evidence-led career narrative. The page reads the latest `now`, `uses`, and `reading` entries at build time, selects current focus, tools, and active reading, and combines them with the approved résumé summary and experience context. It also presents operating principles, complete semantic section structure, responsive layouts, and marked 44px links without requiring JavaScript.

Notes now has a quiet technical index centered on the Black–Scholes article. The three portfolio-operation note source files remain intact, while their index entries, direct static routes, and RSS items are intentionally absent. Note chrome no longer calls the writing a build log. The Black–Scholes note links to the canonical Work route that owns the live WASM demo, avoiding duplicate interactive-demo ownership.

Primary navigation remains exactly Work, About, Résumé, Contact. The footer presents Notes, Now, Uses, and Reading under the labeled secondary navigation, separate from GitHub, LinkedIn, and Email.

## TDD evidence

- About RED: `pnpm exec playwright test tests/e2e/about-resume-contact.spec.ts --grep "About" --workers=1` failed 1/1 with `Expected: 200`, `Received: 404` for `/about/`.
- Notes RED: `pnpm exec playwright test tests/e2e/notes-rss.spec.ts --grep "lists published" --workers=1` failed 1/1 because the page still rendered `Notes from the systems atelier.` instead of `Technical notes.`.
- First GREEN pass: the combined About/Notes/RSS suite passed 3/3 after implementation.
- The tests are falsifiable: they assert exact primary link labels, secondary link destinations, collection-derived content, one visible index article, absence of the three internal note titles, and absence of build-log/internal-portfolio copy from visitor-facing index and About output.

## Exact files

- Created `apps/web/src/pages/about/index.astro`.
- Modified `apps/web/src/pages/notes/index.astro`.
- Modified `apps/web/src/pages/notes/[slug].astro`.
- Modified `apps/web/src/components/SiteFooter.astro`.
- Created `tests/e2e/about-resume-contact.spec.ts`.
- Modified `tests/e2e/notes-rss.spec.ts`.
- Created this report.

No content source, global style, navigation data, Work route, sitemap, redirect, dependency, or other task file was changed.

## Verification

- Task 8 E2E: PASS, 3/3 About, Notes, and RSS tests.
- Biome on all six owned code/test files: PASS.
- `pnpm typecheck`: PASS, 0 errors and 0 warnings; 13 pre-existing deprecation hints.
- Initial pre-review `pnpm build`: PASS, 18 pages built. This result was superseded by the corrective build below, which excludes the three operational note routes and builds 15 pages.
- Generated-output probes: PASS; About contains the selected current focus, Rust, Blue Origin, Crafting Interpreters, and secondary footer navigation, while About and the Notes index contain none of the guarded internal/build-log phrases.

The brief's combined E2E command produced 9 passes and 16 failures, all in the out-of-scope, pre-rewrite `tests/e2e/static-shell.spec.ts`. Those stale assertions require removed Systems Atelier hero, Projects routes, atlas/WebGL presentation, old Notes copy, and the deleted noscript banner. The approved plan assigns replacement of that file's stale shell assertions to Task 11; no assertion was weakened or edited here.

The successful build still emits the known missing `caseStudies` and `projects` collection notices from `sitemap-index.xml.ts`. Task 10 owns migration of sitemap/discovery to Work, so those notices were not hidden or repaired in Task 8.

## Risks and tradeoffs

- The index suppression uses an explicit three-slug set. This preserves the source files while preventing accidental publication or removal based on broad title/tag heuristics; a future portfolio-operation note must be classified deliberately.
- The standalone note is now prose plus a clear link to `/work/black-scholes-wasm/`; the Work record remains the only owner of the live demo, matching the unified Work model.
- Build-time selections intentionally omit the `Refining this portfolio` Now item so the About page stays visitor-focused. They retain the latest source-entry sort and will update when newer collection entries are added.
- No push, deploy, publish, or other outward-facing action was performed.

## Commit

- Message: `feat: consolidate the portfolio About story`
- Scope: only the seven Task 8 files listed above.

DONE

---

## Review round 1 corrective pass

This corrective section supersedes the original route/RSS continuity statement above: operational note sources remain preserved, but their public routes and feed items are now intentionally absent.

### Outcome

Addressed every accepted review finding without changing the visible résumé facts or restoring duplicate Note/demo behavior.

- Added one `isPublicNote` predicate with an explicit three-slug suppression boundary. The Notes index, detail static-path generator, and RSS caller all consume it.
- Preserved the three operational Markdown sources while removing their generated routes and RSS items. Their direct URLs now return Astro's standard 404.
- Added one typed `resumeContent` source with approved-source provenance. About consumes its About summary and experience projections; Resume consumes its contact, full summary, highlights, experience, skills, and clearance.
- Filtered Now records to `status === "current"` before date sorting.
- Replaced Notes' `artifact-grid`, `project-card`, `paper-panel`, and `note-tags` hooks with Notes-owned thin-rule editorial styles. Runtime checks prove transparent surfaces, zero radius, no shadow, and a one-pixel rule.
- Revised the Black–Scholes source note to point to `/work/black-scholes-wasm/` in context. The note no longer promises controls below, carries demo metadata, or receives a page-injected duplicate tool link.
- Removed the brittle exactly-one-article assertion. The index test now positively identifies Black–Scholes and explicitly rejects each suppressed title.

### Corrective RED/GREEN evidence

- RED: the first combined corrective run executed four tests and failed three on missing shared résumé provenance, two legacy Notes hooks, and RSS containing suppressed/build-log content.
- Independent RED: after separating behaviors, the focused suite executed seven tests and failed six for the exact review findings: no shared résumé imports, no current-Now filter, legacy Notes hooks, a suppressed direct route returning 200, the broken `adjust ... below` promise, and suppressed/build-log RSS content. The original About behavior remained green.
- GREEN: `pnpm exec playwright test tests/e2e/about-resume-contact.spec.ts tests/e2e/notes-rss.spec.ts --workers=1` passed 7/7.
- Biome: all nine touched TypeScript/Astro test and source files passed after formatting.
- `pnpm typecheck`: PASS with 0 errors and 0 warnings; 13 pre-existing deprecation hints.
- `pnpm build`: PASS, 15 pages built. The only generated Note detail is Black–Scholes; all three suppressed `dist/notes/<slug>/index.html` paths are absent.
- Generated-output probes found no `build-log`, `artifact-grid`, `project-card`, `paper-panel`, or `adjust ... below` occurrence in the Notes index, Black–Scholes detail, or RSS.
- The known Task 10 sitemap notices for removed `caseStudies` and `projects` collections remain unchanged and were not hidden.

### Corrective files

- Created `apps/web/src/data/public-notes.ts`.
- Created `apps/web/src/data/resume.ts`.
- Modified `apps/web/src/pages/about/index.astro`.
- Modified `apps/web/src/pages/resume/index.astro` only to consume shared data; visible résumé content and styling are unchanged.
- Modified `apps/web/src/pages/notes/index.astro`.
- Modified `apps/web/src/pages/notes/[slug].astro`.
- Modified `apps/web/src/pages/rss.xml.ts`.
- Modified `apps/web/src/content/notes/wasm-black-scholes-options-pricer.md`.
- Modified the two Task 8 E2E files and this report.

### Risks and boundaries

- Operational note suppression remains an explicit editorial decision by slug. It cannot accidentally hide a future technical note because of a broad title or tag match.
- The source Markdown files remain in the collection directory, but all public discovery and route callers share the same predicate. Changing a suppressed note back to public requires a deliberate predicate edit and will fail the negative route/feed tests until the contract is intentionally updated.
- The approved résumé metadata remains in the existing content record; the typed source records its provenance path and status while centralizing the human-readable facts used by both pages.
- No global styles, note source files other than Black–Scholes, navigation model, sitemap, redirects, Work route, dependency, or unrelated test was changed.
- No push, deploy, publish, or external state change was performed.

## Corrective commit

- Message: `fix: keep About and Notes visitor focused`

DONE

---

## Review round 2 test-quality pass

Replaced implementation-syntax assertions with behavior that fails when the visitor output or selection rule diverges from shared data.

- RED: `pnpm exec vitest run apps/web/src/data/current-entry.test.ts --configLoader runner` failed because `./current-entry` did not exist. The fixture deliberately placed a newer archived record ahead of an older current record.
- GREEN unit: the same focused Vitest command passed 1/1 after adding `selectLatestCurrentEntry`; the contract also proves the selector does not mutate the input order.
- GREEN E2E: `pnpm exec playwright test tests/e2e/about-resume-contact.spec.ts tests/e2e/notes-rss.spec.ts --workers=1` passed 6/6. About and Résumé assertions import expected summary and experience values from `resumeContent` and compare them to rendered output.
- Biome passed on the two selector files, About page, and About/Resume E2E file.
- `pnpm typecheck` passed with 0 errors and 0 warnings; the same 13 deprecation hints remain outside Task 8 scope.
- About now calls the pure selector. Its rendered output is unchanged.
- Removed the source-file import regexes and inline-filter regex from `tests/e2e/about-resume-contact.spec.ts`.
- Created `apps/web/src/data/current-entry.ts` and `apps/web/src/data/current-entry.test.ts`; modified About, the About/Resume E2E contract, and this report.
- No push, deploy, publish, dependency change, or unrelated edit was performed.

## Review round 2 commit

- Message: `test: verify About from shared data`

DONE
