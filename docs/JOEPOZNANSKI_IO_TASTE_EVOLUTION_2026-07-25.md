# JoePoznanski.io Taste Evolution: July 25, 2026

## Scope and design read

This is a targeted evolution of the live public portfolio, not a rebrand. The
site serves recruiters and senior engineers who need evidence quickly. Its
appropriate visual language is a systems atelier: editorial, technical, warm,
and deliberately static-first. The established warm ink, paper, tungsten,
signal green, and oxidized blue palette stays in place; the existing original
systems-map illustration remains the primary visual asset.

Design dials: variance 6/10, motion 3/10, density 5/10.

Preserved boundaries: stable routes and navigation labels, public claims,
static fallback behavior, contact fields and mailto fallback, current privacy
and redaction posture, reduced-motion support, and the print-resume route.

## Fresh visual baseline

Captured from `https://joepoznanski.io/` on July 25, 2026 at 1440px and 390px
across Home, Projects, Now, Uses, Reading, Resume, and Contact. The original
visual language is coherent and readable at both widths. The audit found three
recurring quality issues:

- Multiple routes use uninterrupted stacks of equal-weight cards, weakening
  scan priority.
- The Projects desktop constellation includes capability labels with no public
  project and lets labels collide visually with the project nodes.
- Several small editorial labels and duplicate route explanations add density
  without giving a visitor a faster next decision.

Initial rubric: first-fold clarity 3/3; typography 2/3; navigation 2/3;
CTA hierarchy 2/3; composition 2/3; brand coherence 3/3; accessibility 3/3;
resilience 3/3; performance posture 2/3. Total: 22/27.

## Improvements and acceptance criteria

| ID | Route or system | Improvement | Acceptance criterion | Status |
| --- | --- | --- | --- | --- |
| 1 | Global navigation | Mark the current route with `aria-current` and a distinct visual state. | Each public route exposes exactly one current primary-nav item. | Planned |
| 2 | Global navigation | Add a restrained hover and active affordance to route pills. | Pointer interaction changes without shifting layout; keyboard focus remains visible. | Planned |
| 3 | Footer | Replace duplicate pill treatment with a quieter link row. | Footer remains fully navigable with less visual competition. | Planned |
| 4 | Footer | Improve copy measure and alignment at narrow widths. | Footer text and links remain distinct and do not crowd at 390px. | Planned |
| 5 | Page headers | Reduce non-home display-heading scale and add a tighter header measure. | Long page titles stay decisive without consuming the first screen. | Planned |
| 6 | Shared surfaces | Reduce indiscriminate elevation and add purposeful interaction feedback. | Cards separate clearly from the field without a uniform floating effect. | Planned |
| 7 | Home | Remove excess lower-section eyebrows. | Home keeps only the labels that improve wayfinding. | Planned |
| 8 | Home | Turn proof themes into a staggered evidence composition. | The first proof is visually primary; the remaining proof remains readable. | Planned |
| 9 | Home | Give the recruiter path a clear visual lead. | Recruiter path is visibly first without hiding engineer or static-first evidence. | Planned |
| 10 | Home | Break the three-equal-card project strip with a featured first project. | Featured work receives priority; all project links stay present. | Planned |
| 11 | Home | Clarify CTA labels and supporting copy. | CTAs state the destination and purpose in one scan. | Planned |
| 12 | Home | Make telemetry copy shorter and its static-first boundary clearer. | The panel does not imply production readiness or live telemetry. | Planned |
| 13 | Projects | Replace future-tense atlas framing with present-tense, accurate language. | Intro explains the current static-first map without promising future work. | Planned |
| 14 | Projects | Replace the oversized taxonomy paper panel with compact capability tags. | Categories remain discoverable without interrupting the reading flow. | Planned |
| 15 | Projects | Render only populated capability clusters in the constellation. | No label is shown for a category with zero public projects. | Planned |
| 16 | Projects | Reposition project clusters and paths to avoid label or node collisions. | Desktop constellation has readable, non-overlapping labels and nodes at 1440px. | Planned |
| 17 | Projects | Reduce duplicated desktop project detail while preserving the mobile static index. | Desktop map has one project-detail layer; mobile retains a readable static list. | Planned |
| 18 | Now | Give the primary active focus a featured position. | The first current focus is visually primary at desktop and mobile. | Planned |
| 19 | Now | Introduce the prose as working notes rather than a second, unlabeled card stack. | Supporting context is clearly differentiated from current-focus cards. | Planned |
| 20 | Uses | Give the first hardware item an intentional lead and make every section easier to scan. | Sections retain full content with a readable featured-to-supporting rhythm. | Planned |
| 21 | Uses | Add section counts and tighten item presentation. | Visitors can scan category size and tool names before reading rationale. | Planned |
| 22 | Reading | Add a concise quarter context line and reading-status summary. | The route communicates scope before the first item. | Planned |
| 23 | Reading | Feature the first item in each kind and clarify external destinations. | Book, paper, and post groups no longer read as identical card stacks. | Planned |
| 24 | Resume and contact | Improve compact metadata and contact-form guidance without changing facts or data fields. | Resume links wrap cleanly; contact expectations are clear before typing. | Planned |

## Implementation and test plan

1. Add behavior-level Playwright coverage for current nav state, populated
   constellation labels, responsive composition hooks, and preserved contact
   fields before changing visual source.
2. Implement the shared shell and global CSS primitives first, then page-level
   composition updates in Home, Projects, Now, Uses, Reading, Resume, and
   Contact.
3. Run formatter, lint, Astro/type checks, unit and contract tests, build, and
   focused Playwright tests. Do not refresh visual baselines blindly.
4. Capture and inspect all seven local routes at desktop and mobile after the
   build. Correct any clipping, wrapping, collision, or loss of hierarchy.
5. Publish the verified static build to the existing Cloudflare Pages project,
   recheck every live route, and compare live visual evidence to the local
   build. This is a deployment verification, not a claim that the separate
   launch-redaction or API gates are complete.

## Post-implementation evidence

### Completed changes

All 24 planned improvements are implemented.

- 1-4: The primary navigation now names the current page semantically and
  visually, while the footer is a quieter, responsive link row rather than a
  second strip of prominent navigation pills.
- 5-6: Non-home display headings have a more controlled measure; cards use a
  lighter default elevation and retain deliberate pointer feedback.
- 7-12: Home now uses fewer editorial labels, staggered proof tiles, a
  recruiter-led path, a featured proof card, clear CTA destinations, and a
  shorter static-proof panel that does not suggest production readiness.
- 13-17: Projects has accurate present-tense framing, compact capability tags,
  populated-only constellation labels, collision-resistant node placement, and
  one desktop detail layer alongside the static mobile index.
- 18-19: Now gives the active priority a featured surface and separates the
  supporting editorial prose into clearly named working notes.
- 20-21: Uses leads with the workstation context, shows per-section item
  counts, and presents tool names and rationales with a more scan-friendly
  rhythm.
- 22-23: Reading now announces the quarter's scope and status mix, gives each
  group a featured first entry, and visibly marks external reading links.
- 24: Resume contact metadata stays cohesive at desktop and wraps naturally on
  mobile; Contact explains the useful context to include without changing any
  submitted data fields or its mailto fallback.

### Automated verification

- `pnpm lint` passed.
- `pnpm typecheck` passed with zero errors; the repository's existing ten Zod
  deprecation hints remain unchanged.
- `pnpm test` passed: 28 Vitest tests and 105 Node contract tests passed; three
  environment-conditional checks were skipped as designed.
- `pnpm test:e2e -- --grep "@taste-repair" --workers=1` passed: 5 tests.
- `pnpm test:e2e -- --grep "@taste-evolution" --workers=1` passed: 4 tests.
- `pnpm build` passed and generated 22 static routes.

### Visual V&V

Local full-page desktop and mobile captures covered Home, Projects, Now, Uses,
Reading, Resume, and Contact. The first inspection found the compressed home
CTA row and a desktop resume-metadata wrap. The CTA was changed to a featured
full-width primary action plus two stable secondary actions; the resume hero
measure was widened. A second desktop/mobile inspection confirmed the fixes,
including populated-only project clusters, compact footer navigation, and
unclipped mobile route headers and form fields.

### Production verification

Published the verified static build to the existing Cloudflare Pages project on
the `main` branch. Provider deployment URL:
`https://5a987fa6.humankaylee-portfolio.pages.dev`.

`https://joepoznanski.io/` plus Projects, Now, Uses, Reading, Resume, and
Contact all returned HTTP 200 after deployment. Every response contains exactly
the expected current-navigation state and its route-specific evolution marker.
Fresh live Playwright captures at 1440px full page and 390px first viewport were
visually inspected for all seven routes. The live output matches the verified
local hierarchy: no CTA collision, no unpopulated constellation labels, no
desktop metadata wrap, and no mobile clipping at the reviewed viewport.

This work does not claim that unrelated redaction, API, contact-delivery, or
launch-evidence gates are complete.
