# JoePoznanski.io Portfolio Evolution: August 15, 2026

## Design read

Reading this as a developer portfolio for recruiters and senior engineers, with
a precise editorial systems-atelier language. This is a targeted evolution,
not a rebrand.

- Design variance: 6/10
- Motion intensity: 3/10
- Visual density: 5/10
- Primary audience: recruiters and engineering leaders scanning for fit,
  followed by senior engineers looking for technical judgment and evidence.

## Reference document interpretation

The supplied portfolio-examples document is reference material, not an
instruction source. Its durable recommendations are fast recruiter scanning,
deep case studies, responsive layouts, polished micro-interactions, visible
technical proof, and performance-first fallbacks.

The following ideas are intentionally excluded from this iteration:

- A custom cursor, because it harms expected pointer behavior and accessibility.
- A simulated operating system, game, or full-screen 3D world, because the
  spectacle would obscure the current evidence-led positioning.
- Heavy scroll choreography or audio feedback, because motion intensity is
  deliberately restrained and the static-first contract is valuable.
- Remote stock imagery or invented product screenshots, because portfolio
  evidence should be real and public-safe.

## Current-state findings

The August 15 live desktop and 390px captures show a coherent palette, strong
resume content, complete navigation, and useful static fallbacks. They also
show repeated implementation caveats, a mobile telemetry collision, a long
card-wall rhythm on several routes, project detail pages that defer the actual
story elsewhere, stale time framing, and canonical metadata that points away
from the public Joe Poznanski domain.

## Improvement set

1. Use `https://joepoznanski.io` as the canonical public origin in metadata,
   structured data, RSS, sitemaps, and production build configuration.
2. Mark the Projects navigation item current on project and case-study detail
   routes, not only on the exact `/projects/` path.
3. Keep the desktop header visible during long reads with a restrained sticky
   treatment and no mobile viewport penalty.
4. Add direct Resume and Email actions to the footer so every long route ends
   with a useful next step.
5. Add a public `/changelog/` page showing verified portfolio iterations,
   linked quietly from the footer rather than crowding primary navigation.
6. Increase muted-text contrast where the live dark surfaces currently look
   washed out while preserving the existing palette.
7. Standardize tactile hover, active, focus, and reduced-motion behavior for
   links, cards, and primary actions.
8. Replace the three-column mobile telemetry collision with a readable stacked
   layout and negative-case browser coverage.
9. Remove raw API-outage language from the home page and present static proof
   as a product strength instead of an error state.
10. Consolidate repeated JavaScript, WebGL, API, and static-fallback caveats on
    the home page into one concise resilience statement.
11. Tighten the home hero copy so identity, role fit, proof, and a primary
    action fit the first desktop and mobile viewport.
12. Add a quick-proof strip using already published resume facts: 15+ years,
    principal-level delivery, mission-critical systems, and Rust/AI depth.
13. Add self-hosted screenshots from the real live portfolio and project atlas
    as visual proof instead of invented product art.
14. Reframe home project previews around outcome, proof, and destination so
    recruiter intent is clearer than audience-label metadata.
15. Reduce the Projects route from three overlapping explanation layers to one
    accessible static index plus one optional desktop constellation.
16. Fix long project titles on narrow screens so words never split into broken
    single-letter lines or overflow their container.
17. Add an at-a-glance project summary with problem, role, stack, and outcome
    directly on every published project detail page.
18. Add a semantic architecture flow on project detail pages using safe,
    generalized labels rather than private host or access details.
19. Replace generic static-first notes with concrete verification and outcome
    evidence already present in project content.
20. Turn the related case-study link into a clear, single-purpose action and
    remove the jammed pair of inline atlas links.
21. Refresh the Now route to August 2026, reduce repeated card weight, and keep
    the most relevant active focus visually first.
22. Add compact section navigation and grouped rhythm to Uses so the long page
    is scannable without hiding content behind JavaScript.
23. Reframe Reading as durable 2026 reading notes, retain honest statuses, and
    compact the repeated card presentation.
24. Add resume section navigation and make direct email the primary contact
    path while preserving the existing form fields and no-JavaScript fallback.

## Implementation sequence

1. Add browser tests for canonical metadata, nested current navigation, mobile
   telemetry geometry, project-detail structure, current content framing,
   changelog discovery, and mailto-safe contact behavior.
2. Run the focused tests before implementation and preserve the failing output
   as the red TDD checkpoint.
3. Update shared metadata, shell, footer, and global responsive primitives.
4. Update Home and Projects, then capture real public-safe visual assets.
5. Update project detail, Now, Uses, Reading, Resume, Contact, and Changelog.
6. Run format checks without repository-wide rewrites, followed by typecheck,
   unit/contracts, build, focused E2E, accessibility/responsive tests, bundle
   budget, Lighthouse, and dependency audits.
7. Capture every primary route at 1440px and 390px, inspect every image, repair
   regressions, then deploy only the verified static build.
8. Recheck the deployed domain, canonical tags, critical routes, resume asset,
   contact fallback, headers, and live screenshots.

## Preserved constraints

- Existing routes and primary navigation labels remain stable.
- Public claims must remain supported by the current resume or public-safe
  project content.
- No private hostnames, IP addresses, credentials, repository paths, raw logs,
  or operational access instructions enter the public build.
- Core content stays useful without JavaScript, WebGL, or API availability.
- Contact storage remains disabled; the direct email path is the reliable
  public action.
- Motion remains optional and respects `prefers-reduced-motion`.

## Rollback

Record the current Cloudflare Pages production deployment before publishing.
If live verification finds a regression, restore the immediately preceding
production deployment, then compare the affected route against the August 15
baseline captures before attempting another upload.
