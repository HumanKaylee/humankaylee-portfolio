# Task 9 report — résumé and direct contact paths

## Outcome

Redesigned `/resume/` and `/contact/` in the shared Signal / Proof system.

- Résumé consumes the approved `resumeContent`, Astro résumé metadata, and shared `profile`. It preserves every approved summary, highlight, experience bullet, skill group, and clearance statement.
- The approved PDF is a prominent `Download résumé PDF` action at `/downloads/joe-poznanski-resume.pdf`.
- Experience is an ordered semantic chronology with thin-rule structure, readable date/place metadata, narrow-width wrapping, 44px links, and print-specific layout.
- Contact is a complete static page with direct email, LinkedIn, and GitHub links sourced from `profile`. It gives concise conversation and useful-context guidance.
- The form, `ContactForm`, page script, API request path, delivery state, telemetry, fallback/readiness language, and response-time implication are absent.
- Neither route uses the retired `paper-panel`, glass surface, pill/chip, shadow-card, or rounded-card treatment.

## TDD evidence

- Initial contract run exposed the stale résumé action label before reaching the Contact assertion. The test was reordered while production remained untouched so the required behavior was the first failure.
- Required RED: `pnpm exec playwright test tests/e2e/about-resume-contact.spec.ts --grep "direct contact" --workers=1` failed 1/1 because `form` resolved to one element while the contract requires zero.
- Focused GREEN: the same command passed 1/1 after the static direct-channel implementation.
- Task 9 route suite: `about-resume-contact.spec.ts` passed 4/4, covering shared approved résumé values, the live PDF asset, exact profile-backed channels, 320px overflow, 44px targets, and print presentation.
- Static contact suite: `contact-api.spec.ts` passed 2/2 and observed no `/api/contact` request. It rejects form/script markup, API/delivery/telemetry/fallback/health/readiness copy, simulated-send copy, and response guarantees.
- Node contract passed 3/3. Its retained fallback negatives require semantic ProjectStage restoration without canvas/WebGL and keep retired ProjectAtlas and ContactForm components absent.

## Visual and accessibility evidence

- Captured and inspected full-page Chromium renders for Résumé and Contact at 1440×1000 and 390×844. The desktop hierarchy, mobile wrapping, link rows, chronology, and PDF prominence remained legible without overflow.
- Inspection found one inherited legacy color that made the Contact context heading too pale; the page now explicitly restores ink color while retaining a thin signal rule.
- The requested quality run then caught acid-lime kicker text below WCAG contrast on both owned routes. Kicker text now uses muted ink, while acid lime remains on the primary action and structural rule.
- Fresh focused axe checks for `/resume/` and `/contact/` pass 2/2 with zero serious or critical violations.
- Temporary screenshots were removed after inspection and were not committed.

## Verification

- Biome on all six existing touched source/test files: PASS, no fixes required.
- `pnpm typecheck`: PASS, 0 errors and 0 warnings; 13 existing deprecation hints remain.
- `node --test scripts/accessibility-and-fallback-qa-contract.test.mjs`: PASS, 3/3.
- `pnpm build`: PASS, 15 pages built; generated contact output contains all three exact direct URLs and the 878,493-byte PDF is present in `dist/downloads/`.
- Final focused Task 9 E2E: PASS, 6/6.
- Final requested combined E2E command: 25 pass and 21 known Task 11 failures. Both owned route axe checks pass; the failures are ten stale no-script cases, ten stale route/copy reduced-motion cases, and one out-of-scope Notes contrast case.

## Deliberately deferred plan work

- Task 10 owns the remaining build notices from `sitemap-index.xml.ts` querying the retired `caseStudies` and `projects` collections. This task did not hide or reframe those notices.
- Task 11 owns replacement of stale `quality-gates.spec.ts` route/copy/no-script expectations and the remaining global Notes color-contrast finding. The requested combined command was run here; Task 9's six tests passed, while the legacy gate still targeted retired `/projects/` and `/case-studies/` routes, old Résumé/Contact copy, and the removed no-script banner. No stale assertion was weakened in Task 9.

## Exact files

- Modified `apps/web/src/pages/resume/index.astro`.
- Replaced `apps/web/src/pages/contact/index.astro`.
- Deleted `apps/web/src/components/ContactForm.astro`.
- Modified `apps/web/src/styles/components.css`.
- Modified `tests/e2e/about-resume-contact.spec.ts`.
- Replaced `tests/e2e/contact-api.spec.ts`.
- Modified `scripts/accessibility-and-fallback-qa-contract.test.mjs`.
- Created this report.

No backend/API, dependency, content record, navigation, metadata, redirect, sitemap, RSS, deployment, or unrelated production file was changed. No push, deploy, publish, or external action was performed.

## Commit

- Message: `feat: clarify resume and direct contact paths`
- Scope: only the Task 9 files listed above.

DONE
