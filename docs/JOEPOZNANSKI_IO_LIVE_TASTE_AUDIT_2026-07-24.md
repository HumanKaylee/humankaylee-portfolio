# joepoznanski.io live taste audit

Date: 2026-07-24  
Scope: public live navigation surfaces only (`/`, `/projects/`, `/now/`, `/uses/`, `/reading/`, `/resume/`, and `/contact/`).

## Design read

Reading this as a technical personal portfolio for recruiters and senior engineers, with a systems-atelier language, leaning toward a precise editorial technical system.

- Design variance: 6 / 10
- Motion intensity: 3 / 10
- Visual density: 5 / 10
- Mode: targeted evolution. Preserve URLs, navigation labels, public safety boundaries, static-first behavior, focus states, and reduced-motion support.

## Baseline inspected

Full-page desktop and 390 x 844 Chromium renders were captured from the live `.io` site for all seven navigation destinations. The shell, two-row mobile navigation, home primary CTA, resume scan path, dark-theme token system, and responsive collapse are working well.

## Findings and repair plan

| Priority | Finding | Evidence | Repair |
| --- | --- | --- | --- |
| P0 | Shared display scale is applied inside dense project and now cards. | Desktop project cards use oversized multi-line serif titles that crowd descriptions, tags, and actions. The home project row repeats the same defect. | Give compact-card headings their own scale and line-height, shorten the visible project CTA, and assert no horizontal/card-content collision in browser tests. |
| P1 | The projects route repeats the same project set after the atlas, constellation artifacts, and category nodes have already exposed it. | The lower duplicate grid adds a third presentation of the four projects on desktop. | Keep the accessible atlas and category links, remove the duplicate project-card grid, and retain the mobile fallback category presentation. |
| P1 | Reading links inherit generic project-button styling. | Linked book and paper titles render as pale pill buttons that overlap the card boundary, while unlinked titles render as plain text. | Restrict project CTA styling to direct CTA children and add a dedicated reading-link treatment. |
| P1 | `/now` and `/uses` are stale and expose more operational detail than a public portfolio needs. | Both pages show May review dates; `/now` describes a pre-deploy state, and `/uses` names a private host role and an outdated hosting plan. | Update the dates and public-safe wording using only verified current facts. Generalize private infrastructure details and remove unverified deployment claims. |
| P1 | Contact leads with implementation mechanics and repeats fallback copy in three places. | The headline, panel eyebrow, panel introduction, and status note each foreground API fallback behavior. | Reframe the route around the visitor's action, preserve the visible mailto fallback, and keep the API behavior as concise supporting context. |
| P2 | Long-form `/uses`, `/reading`, and `/now` content lacks page-specific rhythm. | Dense definition-list blocks and closing prose read as uninterrupted walls; reading cards lack a distinct title/link hierarchy. | Add explicit, responsive list/group styling and a readable content measure without adding decorative chrome. |
| P2 | Visible em dashes conflict with the adopted Taste pre-flight rule. | Present in the `/uses`, `/reading`, `/now`, and resume-visible content. | Replace with direct sentences, colons, or hyphens while preserving the claims and content hierarchy. |

## Verification plan

1. Add behavior-level coverage for compact project-card headings, direct project CTA styling, reading-link presentation, removal of the duplicate projects grid, and concise contact content.
2. Run typecheck, unit/contract tests, build, focused E2E/accessibility/responsive checks, and a dedicated local visual capture suite.
3. Inspect desktop and mobile screenshots for every tab after changes, then deploy the verified static build to the existing Pages project and recheck the live `.io` routes.
4. Record any unrelated dirty-worktree or pre-existing lint condition without formatting unrelated files.

## Rollback

Cloudflare Pages retains production deployment history. If a live regression is observed, restore the immediately preceding production deployment through the Pages dashboard, then compare the affected route against the baseline captures.

## Repair and recheck results

- Replaced the repeated lower Projects card grid with atlas-led project-detail links. The static category nodes and the desktop constellation still lead to each project's accessible detail route.
- Added compact heading, CTA, reading-link, Now-card, and responsive list rules without changing primary navigation or the portfolio's systems-atelier visual language.
- Updated `/now` and `/uses` to 2026-07-24, replaced stale pre-deployment wording, and removed public references to private host roles and outdated hosting details.
- Simplified the contact route around sending a note while retaining the visible email fallback and no-JavaScript behavior.
- Replaced visible em and en dashes on the audited public tabs with direct sentences, colons, or hyphens.

Verification completed before deployment:

- `pnpm typecheck`: passed with 0 errors.
- `pnpm test`: 28 Vitest tests and 105 Node-contract tests passed; 3 optional live checks skipped by design.
- Targeted browser repair suite: 5/5 passed.
- Impacted E2E suite: 43/43 passed, including keyboard, no-JavaScript, reduced-motion, accessibility, responsive, atlas, contact-outage, and static-route coverage.
- `pnpm build`: passed, producing 22 static pages.
- Manual visual recheck: desktop and 390 x 844 Chromium captures for all seven public navigation routes. No horizontal overflow, clipped controls, or unresolved typography/link-treatment defect was observed.

## Formatter follow-up

The authorized repository-wide formatter follow-up completed after the taste repair:

- `pnpm format` normalized 81 files in the configured Astro, TypeScript, test, script, and configuration scope.
- The formatter exposed 10 real lint rules in four files. Those were repaired with import ordering, null-safe taste-audit capture handling, and behavior-preserving string/style cleanups.
- `pnpm lint` now passes for all 128 configured files.
- `pnpm test` passes with 28 Vitest tests and 105 Node-contract tests; 3 optional live checks remain intentionally skipped.
- `pnpm typecheck` has 0 errors, and `pnpm build` completes successfully with 22 static pages.

The formatter-only changes do not alter rendered portfolio behavior, so the verified production deployment was left in place.
