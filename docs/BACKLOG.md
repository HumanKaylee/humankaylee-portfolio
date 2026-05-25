# HumanKaylee Portfolio Backlog

Date: 2026-05-23
Status: Issue backlog for agentic execution
Sources: `docs/RESEARCH.md`, `docs/PRD.md`, `docs/ROADMAP.md`

## Label Taxonomy

Priority labels:

- `priority:p0`: Required for launch.
- `priority:p1`: Important for launch polish or credibility.
- `priority:p2`: Post-launch or optional enhancement.

Type labels:

- `type:feature`: User-visible capability.
- `type:task`: Implementation, configuration, or setup work.
- `type:content`: Writing, editing, redaction, or media work.
- `type:research`: Decision support or spike.
- `type:qa`: Testing, audit, or verification work.
- `type:docs`: Documentation or runbook work.

Area labels:

- `area:product`
- `area:content`
- `area:frontend`
- `area:design`
- `area:motion`
- `area:backend`
- `area:infra`
- `area:seo`
- `area:a11y`
- `area:performance`
- `area:security`
- `area:privacy`
- `area:ops`

Phase labels:

- `phase:0-product-safety`
- `phase:1-foundation`
- `phase:2-content`
- `phase:3-static-experience`
- `phase:4-visual-motion`
- `phase:5-backend`
- `phase:6-hardening`
- `phase:7-launch`
- `phase:8-post-launch`

## Execution Rules

- Work issues in dependency order.
- Keep one issue to one reviewable outcome.
- Use exact acceptance criteria as the completion contract.
- If an issue touches public project evidence, complete redaction review before
  publication.
- Do not make 3D, motion, backend data, or analytics required for reading core
  portfolio content.
- Prefer static HTML, semantic markup, and accessible fallback paths before
  adding enhanced interactions.
- Treat open decisions as blockers only when the issue says they block it.

## Phase 0: Product, Safety, and Execution Setup

### B-001: Confirm launch positioning and audience order

Labels: `priority:p0`, `type:content`, `area:product`, `phase:0-product-safety`

Depends on: none

Scope:

- Convert PRD positioning into concise launch copy.
- Define primary audience order for home page content: recruiter first, senior
  engineer second, collaborators/clients third.

Acceptance criteria:

- A one-sentence first-viewport positioning statement exists.
- A 3 to 5 bullet support statement exists for skills and proof themes.
- The copy mentions practical AI-assisted systems, automation workflows,
  infrastructure, backend services, and polished user-facing tools.
- The copy avoids vague claims that are not supported by case studies.

Verification evidence:

- Copy review against `docs/PRD.md` Product Positioning and Primary Goal.

### B-002: Create public-safety and redaction checklist

Labels: `priority:p0`, `type:content`, `area:privacy`, `area:security`, `phase:0-product-safety`

Depends on: none

Scope:

- Define what must be removed or transformed before publishing case studies,
  screenshots, logs, runbooks, diagrams, metrics, and repo links.

Acceptance criteria:

- Checklist covers secrets, tokens, internal hostnames, private IPs, account
  names, customer names, private repo URLs, private logs, credentials, and
  operationally sensitive commands.
- Checklist distinguishes safe public evidence from evidence that requires
  redaction or exclusion.
- Checklist includes a reviewer signoff field for each case study.

Verification evidence:

- Checklist applied to at least one sample case-study candidate.

### B-003: Inventory case-study candidates

Labels: `priority:p0`, `type:content`, `area:content`, `phase:0-product-safety`

Depends on: B-002

Scope:

- Inventory candidates from PRD Content Inventory.
- Classify each candidate as public, redacted, excluded, or needs user decision.

Acceptance criteria:

- Inventory includes CLI fleet synchronization and MCP rollout.
- Inventory includes remote workstation recovery and operational debugging.
- Inventory includes this portfolio build.
- Inventory evaluates Kalshi migration or analytics tooling for publication
  safety.
- Inventory evaluates YouTube AI video pipeline for publication safety.
- Inventory evaluates one creative web demo for the site.
- At least four candidates are selected for launch or explicitly marked blocked
  by user review.

Verification evidence:

- Case-study inventory reviewed against PRD launch requirement of 4 to 6
  flagship case studies.

### B-004: Define "The Systems Atelier" design brief

Labels: `priority:p0`, `type:content`, `area:design`, `phase:0-product-safety`

Depends on: B-001

Scope:

- Convert the research visual concept into implementable design constraints.

Acceptance criteria:

- Brief defines mood: high-end technical studio, mission-control evidence,
  cinematic but readable.
- Brief defines colors: warm off-black, paper/cream, tungsten amber, signal
  green, oxidized blue.
- Brief defines typography roles: expressive serif display, condensed grotesk
  labels, monospace evidence snippets.
- Brief defines motion principles: deliberate, optional, reduced-motion first.
- Brief explicitly rejects generic purple AI gradients and default system-font
  presentation.

Verification evidence:

- Brief can be used by an implementation agent without rereading the full
  research doc.

### B-005: Resolve launch blockers register

Labels: `priority:p0`, `type:task`, `area:product`, `area:ops`, `phase:0-product-safety`

Depends on: none

Scope:

- Track decisions that can block launch but not early implementation.

Acceptance criteria:

- Register includes final domain name.
- Register includes final resume PDF source.
- Register includes public-safe case-study approvals.
- Register includes current API host decision after Shuttle shutdown.
- Register includes AI assistant v1 versus v2 decision.
- Each decision has impact, latest acceptable resolution phase, and owner.

Current evidence:

- Final resume PDF source is resolved locally: `sha256sum` and `cmp -s`
  confirmed the downloaded source PDF and committed public asset are
  byte-identical with SHA-256
  `3a6f35bf0f565fb9bbf2009665b40ae7a556dd39ff99e0d04043cab8a4c5f477`.
- This does not clear the Phase 7 production `/resume/` route or PDF-link smoke
  evidence, which remains blocked until a frontend deployment target exists.

Verification evidence:

- `runbooks/LAUNCH_BLOCKERS_REGISTER.md` records remaining unresolved launch
  decisions plus the resolved local resume-source decision, with impact, latest
  acceptable resolution phase, owner, status, and next evidence for each blocker
  without claiming launch readiness.
- `node --test scripts/launch-blockers-register-contract.test.mjs`
  verifies the register and its launch evidence cross-links.

## Phase 1: Repository and Frontend Foundation

### B-006: Scaffold Astro TypeScript frontend

Labels: `priority:p0`, `type:task`, `area:frontend`, `phase:1-foundation`

Depends on: B-004

Scope:

- Establish Astro with TypeScript and the project package manager.

Acceptance criteria:

- Local dev server renders a basic page.
- TypeScript config is present and strict enough to catch common content and
  component errors.
- Project has scripts for dev, build, preview, check, format, lint, and test.
- The static build succeeds on a clean checkout.

Verification evidence:

- `pnpm build` succeeds.
- `pnpm typecheck` succeeds.

### B-007: Configure content collections

Labels: `priority:p0`, `type:task`, `area:frontend`, `area:content`, `phase:1-foundation`

Depends on: B-006, B-003

Scope:

- Define schemas for case studies, projects, notes, resume data, and site
  metadata.

Acceptance criteria:

- Case-study schema includes summary, problem, constraints, architecture,
  implementation proof, verification, operational notes, outcome, lessons, links,
  categories, featured status, and publication safety status.
- Project schema supports categories: AI, automation, infrastructure, backend,
  creative web, operations.
- Notes schema supports RSS metadata.
- Resume data supports PDF link, HTML sections, print rendering, and social
  links.
- Invalid content fails the build or content check.

Verification evidence:

- Content validation fails for a deliberately invalid local sample and passes
  after correction.

### B-008: Build base layout and semantic shell

Labels: `priority:p0`, `type:feature`, `area:frontend`, `area:a11y`, `phase:1-foundation`

Depends on: B-006

Scope:

- Create shared layout, navigation, skip link, footer, and metadata slots.

Acceptance criteria:

- Every page has semantic `header`, `nav`, `main`, and `footer` regions.
- Skip link is visible on focus and works.
- Navigation is keyboard accessible.
- Footer includes contact, GitHub, LinkedIn, and resume routes backed by safe public content.
- Page title and description can be set per route.

Verification evidence:

- Keyboard-only smoke test on home route.
- No-JavaScript render still exposes core navigation.

### B-009: Establish CSS token system

Labels: `priority:p0`, `type:task`, `area:design`, `area:frontend`, `phase:1-foundation`

Depends on: B-004, B-006

Scope:

- Create design tokens and global CSS foundations.

Acceptance criteria:

- CSS variables exist for palette, typography scale, spacing, radius, shadows,
  motion durations, easing, layout widths, and z-index.
- Tokens express "The Systems Atelier" palette from the PRD.
- Typography roles exist for display, labels, body, and evidence snippets.
- Base styles preserve readable contrast and responsive sizing.

Verification evidence:

- Visual review of token demo or base page on mobile and desktop.
- Contrast spot-check for primary text, links, cards, and CTAs.

### B-010: Add baseline CI checks

Labels: `priority:p0`, `type:task`, `area:infra`, `phase:1-foundation`

Depends on: B-006

Scope:

- Configure CI for repeatable frontend quality checks.

Acceptance criteria:

- CI installs dependencies using the chosen lockfile.
- CI runs format check.
- CI runs lint.
- CI runs type/content check.
- CI runs tests.
- CI runs static build.

Verification evidence:

- Green CI run on the default branch or implementation branch.

### B-011: Add frontend test harness

Labels: `priority:p0`, `type:task`, `area:frontend`, `phase:1-foundation`

Depends on: B-006

Scope:

- Configure unit/component testing for non-trivial frontend behavior.

Acceptance criteria:

- Test runner can test content helpers, filters, and utility functions.
- At least one sample test runs in CI.
- Test naming convention is documented.

Verification evidence:

- Test command passes locally and in CI.

### B-012: Add Playwright smoke-test harness

Labels: `priority:p1`, `type:qa`, `area:frontend`, `area:a11y`, `phase:1-foundation`

Depends on: B-006, B-008

Scope:

- Prepare browser smoke tests for launch journeys.

Acceptance criteria:

- Playwright can open the built or previewed site.
- Smoke test checks home page, project index, one case study, resume page, and
  contact path when those routes exist.
- Tests are tagged so missing future pages can be enabled as routes land.

Verification evidence:

- Playwright smoke command passes for routes implemented so far.

## Phase 2: Content Foundation and Identity

### B-013: Write launch home-page content package

Labels: `priority:p0`, `type:content`, `area:content`, `phase:2-content`

Depends on: B-001

Scope:

- Write content for hero, recruiter card, engineer card, top skills, top
  projects teaser, and contact CTA.

Acceptance criteria:

- Hero explains HumanKaylee's value without waiting for animation or API data.
- Recruiter card includes resume, top skills, top projects, and contact CTA.
- Engineer card points to architecture, source, demos, runbooks, and verification
  evidence.
- Content is concise enough for first-viewport scanning.

Verification evidence:

- Content reviewed against PRD Recruiter Fast Path and Senior Engineer Deep Path.

### B-014: Draft case study: CLI fleet synchronization and MCP rollout

Labels: `priority:p0`, `type:content`, `area:content`, `area:privacy`, `phase:2-content`

Depends on: B-002, B-003, B-007

Scope:

- Create a launch-grade case study from safe public details.

Acceptance criteria:

- Includes problem and stakes.
- Includes constraints and weirdness.
- Includes architecture or workflow diagram.
- Includes implementation highlights.
- Includes testing and verification approach.
- Includes operational outcome.
- Includes lessons learned.
- Sensitive host, account, secret, and private-path details are redacted or
  generalized.

Verification evidence:

- Case study passes content schema validation.
- Approval packet records the non-approval evidence inventory, counts-only
  mechanical scan note, checklist answers recorded, and required artifact
  inspection before `redactionStatus` can change from `reviewed` to `approved`.

### B-015: Draft case study: remote workstation recovery and operational debugging

Labels: `priority:p0`, `type:content`, `area:content`, `area:privacy`, `phase:2-content`

Depends on: B-002, B-003, B-007

Scope:

- Create a public-safe operations/debugging case study.

Acceptance criteria:

- Shows diagnostic sequence without exposing private credentials or network
  details.
- Includes failure modes, evidence gathering, fix path, verification, and
  prevention.
- Demonstrates operational judgment rather than only command output.
- Uses redacted screenshots or diagrams when raw logs are unsafe.

Verification evidence:

- Case study passes content schema validation.
- Approval packet records the non-approval evidence inventory, counts-only
  mechanical scan note, checklist answers recorded, and required artifact
  inspection before `redactionStatus` can change from `reviewed` to `approved`.

### B-016: Draft case study: HumanKaylee portfolio build

Labels: `priority:p0`, `type:content`, `area:content`, `phase:2-content`

Depends on: B-007

Scope:

- Document this portfolio as an AI-assisted, Rust-backed, visually rich project.

Acceptance criteria:

- Explains product goals, design constraints, architecture, content model,
  frontend stack, backend stack, testing strategy, deployment, and launch
  outcomes.
- Includes before/after or process artifacts once implementation produces them.
- Identifies what was agent-assisted and how it was verified.

Verification evidence:

- Case study passes content schema validation.
- Content links back to public docs and safe implementation artifacts.
- Local route and quality-gate coverage verifies the public-safe body, static
  architecture, optional Rust API boundary, agent-assisted workflow, and launch
  evidence boundary while keeping redaction status `reviewed`.

### B-017: Draft case study: creative web demo

Labels: `priority:p1`, `type:content`, `area:content`, `area:design`, `phase:2-content`

Depends on: B-003, B-007

Scope:

- Plan and draft a creative web demo case study built specifically for the site.

Acceptance criteria:

- Demo concept supports the "Systems Atelier" direction.
- Case study explains visual goal, technical constraints, implementation,
  performance controls, accessibility fallback, and lessons.
- Demo is not required for static portfolio comprehension.

Verification evidence:

- Draft content validates.
- Demo scope is approved before implementation begins.
- Local route and quality-gate coverage verifies the public-safe body,
  semantic project atlas fallback marker, no-JS readability, reduced-motion
  behavior, accessibility scan, private-content scan, and explicit boundary
  that B-017 approves content plus fallback evidence only.

### B-018: Evaluate Kalshi or analytics tooling publication safety

Labels: `priority:p1`, `type:research`, `area:content`, `area:privacy`, `phase:2-content`

Depends on: B-002, B-003

Scope:

- Decide whether a Kalshi migration or analytics tooling story can be safely
  published.

Acceptance criteria:

- Identifies what can be public, redacted, or excluded.
- Identifies legal, financial, privacy, or account-risk concerns.
- Recommends publish, publish redacted, or exclude.
- If excluded, suggests a safer replacement case study.

Verification evidence:

- `runbooks/PUBLICATION_SAFETY_DECISIONS.md` records public-safe,
  redacted-only, excluded, risk, recommendation, owner, and user-decision status
  for this candidate without approving publication, and defines a synthetic
  proof pack review gate.
- `node --test scripts/publication-safety-decisions-contract.test.mjs`
  verifies the decision-support record and blocked publication status.

### B-019: Evaluate YouTube AI video pipeline publication safety

Labels: `priority:p1`, `type:research`, `area:content`, `area:privacy`, `phase:2-content`

Depends on: B-002, B-003

Scope:

- Decide whether the YouTube AI video pipeline can be safely published.

Acceptance criteria:

- Identifies safe architecture, workflow, and results details.
- Identifies unsafe prompts, accounts, tokens, creator data, or private
  automation details.
- Recommends publish, publish redacted, or exclude.
- If publishable, defines the evidence artifacts to include.

Verification evidence:

- `runbooks/PUBLICATION_SAFETY_DECISIONS.md` records public-safe,
  redacted-only, excluded, risk, recommendation, owner, and user-decision status
  for this candidate without approving publication, and defines a synthetic
  proof pack review gate.
- `node --test scripts/publication-safety-decisions-contract.test.mjs`
  verifies the decision-support record and blocked publication status.

### B-020: Build resume content source

Labels: `priority:p0`, `type:content`, `area:content`, `phase:2-content`

Depends on: B-001

Scope:

- Create structured resume content for HTML and PDF output.

Acceptance criteria:

- Resume includes summary, skills, selected work, projects, experience,
  education/certifications if applicable, links, and contact path.
- Resume content aligns with site positioning.
- Public contact details are approved.
- The source can generate or link a downloadable PDF.

Verification evidence:

- Resume reviewed in HTML and print/PDF contexts.

### B-021: Create notes/build-log starter content

Labels: `priority:p1`, `type:content`, `area:content`, `phase:2-content`

Depends on: B-007

Scope:

- Create initial notes or build-log entries.

Acceptance criteria:

- At least one entry explains how the portfolio is being built.
- Entry includes engineering decisions, verification, and tradeoffs.
- Entry has RSS metadata.

Verification evidence:

- Entry appears in notes index and RSS feed once those routes exist.

## Phase 3: Core Static Portfolio Experience

### B-022: Implement static home page

Labels: `priority:p0`, `type:feature`, `area:frontend`, `area:content`, `phase:3-static-experience`

Depends on: B-008, B-009, B-013

Scope:

- Build the static home page before enhanced motion or WebGL.

Acceptance criteria:

- First viewport contains positioning statement, resume CTA, project CTA, and
  contact CTA.
- Home includes recruiter fast-path card.
- Home includes engineer deep-path card.
- Home includes featured case-study summaries.
- Home remains useful with JavaScript disabled.
- Mobile layout keeps CTAs visible and tappable.

Verification evidence:

- No-JavaScript smoke test.
- Mobile and desktop screenshots.

### B-023: Implement project index and category filters

Labels: `priority:p0`, `type:feature`, `area:frontend`, `area:content`, `phase:3-static-experience`

Depends on: B-007, B-008

Scope:

- Create project listing with accessible category filtering.

Acceptance criteria:

- Categories include AI, automation, infrastructure, backend, creative web, and
  operations.
- Each project card includes title, summary, category, impact, and links when
  safe.
- Filtering has an HTML-accessible equivalent and does not hide all content from
  no-JavaScript users.
- Stable, readable slugs are used.

Verification evidence:

- Keyboard test of filters.
- No-JavaScript view shows all projects or a usable fallback.

### B-024: Implement case-study routes

Labels: `priority:p0`, `type:feature`, `area:frontend`, `area:content`, `phase:3-static-experience`

Depends on: B-007, B-014, B-015, B-016

Scope:

- Render case studies from content collections.

Acceptance criteria:

- Each case study renders summary, problem, constraints, architecture, build
  details, verification, operational notes, outcome, lessons, and links.
- Architecture diagrams have text alternatives.
- External links indicate destination and open behavior consistently.
- Unpublished or unsafe case studies are excluded from production routes.

Verification evidence:

- Build succeeds with at least four launch case studies or documented blockers.
- Manual review of one full case-study page.

### B-025: Implement resume HTML page and PDF link

Labels: `priority:p0`, `type:feature`, `area:frontend`, `area:content`, `phase:3-static-experience`

Depends on: B-020, B-008

Scope:

- Add resume route and downloadable PDF path.

Acceptance criteria:

- HTML resume is readable on desktop and mobile.
- Print stylesheet produces a clean document.
- PDF link is visible from home, navigation, and recruiter card.
- Missing final PDF source has a visible safe fallback before launch and becomes
  a blocker in Phase 7.

Verification evidence:

- Browser print preview check.
- Link check for PDF or approved fallback.

### B-026: Implement contact page or section with fallback

Labels: `priority:p0`, `type:feature`, `area:frontend`, `area:privacy`, `phase:3-static-experience`

Depends on: B-008

Scope:

- Create static contact path before API integration.

Acceptance criteria:

- Contact includes clear call to action.
- Mailto or approved fallback works without backend.
- Copy explains fallback if enhanced form is unavailable.
- No secrets or private email-provider credentials appear in frontend code.

Verification evidence:

- Manual click test of fallback contact path.
- Source review for secrets.

### B-027: Implement notes/build-log pages and RSS

Labels: `priority:p1`, `type:feature`, `area:frontend`, `area:seo`, `phase:3-static-experience`

Depends on: B-007, B-021

Scope:

- Add notes index, note detail pages, and RSS feed.

Acceptance criteria:

- Notes index lists title, date, summary, tags, and permalink.
- Note detail pages have metadata and readable article layout.
- RSS feed includes notes with valid titles, links, dates, and summaries.
- Build fails or warns on invalid RSS metadata.

Verification evidence:

- RSS feed validates with a feed validator or local XML check.

### B-028: Add SEO metadata and structured data

Labels: `priority:p0`, `type:feature`, `area:seo`, `area:frontend`, `phase:3-static-experience`

Depends on: B-008, B-022, B-024, B-025

Scope:

- Add metadata required by PRD SEO and Sharing Requirements.

Acceptance criteria:

- Core pages have unique titles and descriptions.
- Canonical URLs are generated.
- Open Graph and Twitter card metadata exist.
- JSON-LD covers Person and WebSite.
- Project or case-study pages use CreativeWork or SoftwareSourceCode where
  appropriate.

Verification evidence:

- Metadata inspection on home, project index, case study, and resume pages.

### B-029: Add sitemap and robots.txt

Labels: `priority:p0`, `type:task`, `area:seo`, `area:frontend`, `phase:3-static-experience`

Depends on: B-024, B-027

Scope:

- Generate search crawler artifacts.

Acceptance criteria:

- Sitemap includes home, projects, public case studies, resume, contact, and
  notes.
- Robots.txt points to sitemap and does not block intended public pages.
- Unpublished or unsafe content is not included.

Verification evidence:

- Generated sitemap reviewed for correct URLs.

### B-030: Add static project metadata fallback

Labels: `priority:p0`, `type:task`, `area:frontend`, `area:content`, `phase:3-static-experience`

Depends on: B-023

Scope:

- Provide static project metadata used when live API data is unavailable.

Acceptance criteria:

- Project cards render meaningful data without API calls.
- Static metadata includes update date or source date where useful.
- UI clearly avoids stale claims when live data is not available.

Verification evidence:

- API-disabled local preview still renders project index and home project cards.

## Phase 4: Visual System, Motion, and Project Atlas

### B-031: Implement art-directed page surfaces

Labels: `priority:p1`, `type:feature`, `area:design`, `area:frontend`, `phase:4-visual-motion`

Depends on: B-009, B-022

Scope:

- Apply "The Systems Atelier" visual language to core page surfaces.

Acceptance criteria:

- Uses warm off-black, paper/cream, tungsten amber, signal green, and oxidized
  blue tokens.
- Uses editorial display typography, condensed labels, and monospace evidence
  snippets.
- Adds layered grid, contour, command-trace, or project-node motifs without
  reducing readability.
- Avoids generic purple AI gradient treatment.

Verification evidence:

- Local `@visual-surfaces` Playwright coverage verifies home, project index,
  case-study detail, resume, and contact surfaces use deliberate Systems
  Atelier treatments without mobile horizontal overflow.
- Local regression coverage verifies static shell, atlas, case-study,
  reduced-motion, and no-JavaScript behavior after the surface pass.

### B-032: Implement static hero poster and fallback

Labels: `priority:p0`, `type:feature`, `area:design`, `area:performance`, `phase:4-visual-motion`

Depends on: B-022, B-031

Scope:

- Add designed hero fallback before 3D loads.

Acceptance criteria:

- Hero text and CTAs are visible before any heavy asset loads.
- Poster/fallback communicates systems-lab concept.
- Fallback is used for reduced-motion, no-WebGL, and mobile if needed.
- Fallback image or CSS treatment is optimized for page load.

Verification evidence:

- Network throttling screenshot showing readable hero before enhanced assets.
- Playwright `static systems map hero` coverage proves the home page exposes a
  no-JS systems-map poster with project links before any WebGL enhancement.

### B-033: Implement accessible project atlas fallback

Labels: `priority:p0`, `type:feature`, `area:frontend`, `area:a11y`, `phase:4-visual-motion`

Depends on: B-023

Scope:

- Build the non-WebGL project atlas experience.

Acceptance criteria:

- Atlas fallback exposes all project nodes as semantic links or buttons.
- Keyboard users can navigate project previews.
- Mobile users get a fast card or timeline list.
- Reduced-motion users do not receive scroll-jacking or heavy animation.

Verification evidence:

- Keyboard and mobile smoke tests.
- Reduced-motion browser setting review.

### B-034: Implement desktop project constellation

Labels: `priority:p1`, `type:feature`, `area:motion`, `area:frontend`, `phase:4-visual-motion`

Depends on: B-033, B-032

Scope:

- Add signature desktop interaction using React Three Fiber, Three.js, SVG, or
  canvas based on implementation fit.

Acceptance criteria:

- Projects cluster by AI, automation, infrastructure, backend, creative web, and
  operations.
- Selecting a node opens or focuses an artifact card with title, summary,
  proof/impact evidence, and links.
- Enhanced helper or heavier future scene is lazy-loaded.
- Scene failure falls back to the accessible atlas.
- Interaction does not block first content paint.

Verification evidence:

- Desktop recording of constellation interaction.
- `pnpm test:e2e -- --grep "@constellation"` for desktop interaction and
  mobile skip coverage.
- Bundle analysis showing the enhanced helper or heavier future scene stays lazy-loaded.

### B-035: Add purposeful scroll and reveal motion

Labels: `priority:p1`, `type:feature`, `area:motion`, `area:design`, `phase:4-visual-motion`

Depends on: B-031, B-022, B-024

Scope:

- Add restrained motion to narrative sections and artifact reveals.

Acceptance criteria:

- Motion emphasizes hierarchy and evidence, not decoration.
- Native scrolling remains usable.
- `prefers-reduced-motion` disables or simplifies motion.
- Motion does not hide content until JavaScript runs.

Verification evidence:

- Reduced-motion review.
- Manual scroll review on desktop and mobile.

### B-036: Add view transitions or route continuity

Labels: `priority:p2`, `type:feature`, `area:motion`, `area:frontend`, `phase:4-visual-motion`

Depends on: B-024, B-028

Scope:

- Add optional page continuity using Astro View Transitions or a lighter
  route-transition approach.

Acceptance criteria:

- Transitions preserve focus management.
- Transitions respect reduced-motion.
- Browser fallback is acceptable when unsupported.
- Metadata and analytics do not break during navigation.

Verification evidence:

- Navigation smoke test with keyboard and reduced-motion enabled.

### B-037: Add visual regression snapshots

Labels: `priority:p1`, `type:qa`, `area:design`, `area:frontend`, `phase:4-visual-motion`

Depends on: B-022, B-024, B-031

Scope:

- Capture core page screenshots to catch visual regressions.

Acceptance criteria:

- Snapshots cover home, project index, one case study, resume, and contact.
- Mobile and desktop viewports are included.
- Dynamic or animated regions are stabilized or masked.

Verification evidence:

- Visual regression command produces baseline screenshots.

## Phase 5: Rust Backend and API-Backed Features

### B-038: Scaffold Rust Axum API service

Labels: `priority:p0`, `type:task`, `area:backend`, `phase:5-backend`

Depends on: B-005

Scope:

- Create the backend service foundation.

Acceptance criteria:

- Axum service starts locally.
- Tokio runtime is configured.
- tower-http middleware foundation is present.
- Structured tracing is initialized.
- Typed environment config is loaded.
- API has a clear package/module structure for routes, config, state, and tests.

Verification evidence:

- Local server starts and logs a startup event.
- Backend test command passes with at least one smoke test.

### B-039: Implement `GET /api/health`

Labels: `priority:p0`, `type:feature`, `area:backend`, `phase:5-backend`

Depends on: B-038

Scope:

- Add health endpoint for deployment and public systems proof.

Acceptance criteria:

- Response includes status, version, and uptime.
- Response does not leak secrets, internal paths, or private hostnames.
- Route has integration test coverage.
- Endpoint can be called from browser or command line.

Verification evidence:

- Test output for health route.
- Local `GET /api/health` response sample.

### B-040: Implement cached `GET /api/projects/live`

Labels: `priority:p1`, `type:feature`, `area:backend`, `phase:5-backend`

Depends on: B-038, B-030

Scope:

- Serve cached public project metadata for frontend enhancement.

Acceptance criteria:

- Endpoint returns safe public metadata only.
- External API calls are cached to avoid rate-limit or availability problems.
- Failure returns a controlled error or stale-safe response.
- Route has integration tests for success and upstream failure.

Verification evidence:

- Test output for cache and failure behavior.
- Frontend can render static fallback when endpoint fails.

### B-041: Implement contact endpoint validation

Labels: `priority:p0`, `type:feature`, `area:backend`, `area:security`, `phase:5-backend`

Depends on: B-038, B-026

Scope:

- Add `POST /api/contact` request validation.

Acceptance criteria:

- Validates name, reply contact, subject or intent, message length, and honeypot
  field.
- Rejects oversized payloads.
- Returns clear, non-leaky errors.
- Route has tests for valid input, missing fields, honeypot trigger, and oversized
  input.

Verification evidence:

- Contact route test output.

### B-042: Add contact rate limiting and abuse controls

Labels: `priority:p0`, `type:feature`, `area:backend`, `area:security`, `phase:5-backend`

Depends on: B-041

Scope:

- Protect public contact endpoint from abuse.

Acceptance criteria:

- Rate limiting is applied by IP or deployment-safe client identity.
- Honeypot submissions are ignored or rejected safely.
- Request size limits are enforced.
- Abuse-control behavior is documented.
- Tests cover rate-limit behavior where practical.

Verification evidence:

- Test or local smoke output showing rate-limit response.

### B-043: Add contact delivery or storage adapter

Labels: `priority:p0`, `type:feature`, `area:backend`, `area:privacy`, `phase:5-backend`

Depends on: B-041, B-042

Scope:

- Deliver or store validated contact submissions without exposing secrets.

Acceptance criteria:

- Adapter uses server-side environment secrets only.
- Frontend code contains no provider secrets.
- Failure mode returns a safe message and preserves mailto fallback.
- Privacy behavior is documented.
- Integration test uses a fake adapter.

Verification evidence:

- Fake-adapter test output.
- Source review confirms no frontend secrets.

### B-044: Implement optional privacy-safe events endpoint

Labels: `priority:p2`, `type:feature`, `area:backend`, `area:privacy`, `phase:5-backend`

Depends on: B-038, B-005

Scope:

- Add `POST /api/events` only if analytics is enabled for launch or post-launch.

Acceptance criteria:

- Endpoint is disabled by default unless explicitly enabled in config.
- Events contain no personal data beyond documented minimal request metadata.
- Retention and purpose are documented.
- Frontend can run without events.

Verification evidence:

- Disabled-by-default test.
- Privacy documentation review.

### B-045: Configure backend CORS and security middleware

Labels: `priority:p0`, `type:task`, `area:backend`, `area:security`, `phase:5-backend`

Depends on: B-038

Scope:

- Lock API access to approved frontend origins and safe request behavior.

Acceptance criteria:

- CORS allowlist is driven by environment config.
- Production config does not allow wildcard origins for sensitive routes.
- Request tracing excludes sensitive body content.
- Compression is configured for text/JSON responses, request body limits are configured for write routes, and timeout layers apply to all public routes.

Verification evidence:

- Backend tests or local smoke checks for allowed and disallowed origins.

### B-046: Add backend Dockerfile and Shuttle deploy path

Labels: `priority:p0`, `type:task`, `area:backend`, `area:infra`, `phase:5-backend`

Depends on: B-039, B-041, B-045

Scope:

- Make the Rust API deployable.

Acceptance criteria:

- Dockerfile builds the API service.
- Shuttle deploy configuration or documented command exists.
- Fly.io or Railway fallback notes exist.
- Required environment variables are documented without secret values.

Verification evidence:

- Container build succeeds.
- Shuttle local or deploy dry-run succeeds when credentials are available.
- `cargo check --manifest-path apps/api/Cargo.toml --features shuttle --bin humankaylee-api-shuttle`
  proves the committed Shuttle entrypoint compiles without provider credentials.
- `apps/api/Dockerfile` is the fallback container build contract for Fly.io,
  Railway, or another container host.

### B-047: Integrate frontend with API fallbacks

Labels: `priority:p0`, `type:feature`, `area:frontend`, `area:backend`, `phase:5-backend`

Depends on: B-026, B-030, B-039, B-040, B-041

Scope:

- Connect frontend contact and project metadata enhancements to the API.

Acceptance criteria:

- Contact form submits to API when configured.
- Contact fallback remains visible or reachable if API is down.
- Project metadata uses live endpoint when available and static metadata when not.
- Loading, success, and failure states are accessible.
- No core content depends on API response.

Verification evidence:

- API-up and API-down manual tests.
- Frontend tests for fallback behavior where practical.

## Phase 6: Quality, Security, Accessibility, and Performance Hardening

### B-048: Add accessibility audit pass

Labels: `priority:p0`, `type:qa`, `area:a11y`, `phase:6-hardening`

Depends on: B-022, B-023, B-024, B-025, B-026, B-033

Scope:

- Audit core pages against PRD accessibility requirements.

Acceptance criteria:

- Headings are ordered and meaningful.
- Landmarks are present.
- Keyboard navigation works for menus, filters, atlas fallback, and contact form.
- Color contrast meets WCAG AA or better.
- Touch targets are at least 44px on mobile.
- Meaningful images have alt text.
- Videos or animations have captions or summaries where needed.

Verification evidence:

- Accessibility checklist with page-by-page results.
- Automated accessibility scan output if tooling is available.
- `runbooks/ACCESSIBILITY_AUDIT.md` records the current page-by-page checklist.
- `pnpm test:e2e -- --grep "@accessibility"` and `pnpm test:e2e -- --grep "@keyboard"` preserve the automated accessibility and keyboard evidence.
- `node --test scripts/accessibility-and-fallback-qa-contract.test.mjs` preserves the dedicated artifact contract.

### B-049: Add reduced-motion and no-WebGL QA pass

Labels: `priority:p0`, `type:qa`, `area:a11y`, `area:motion`, `phase:6-hardening`

Depends on: B-032, B-033, B-034, B-035

Scope:

- Verify enhanced visuals do not block accessibility or content access.

Acceptance criteria:

- `prefers-reduced-motion` disables or simplifies non-essential animation.
- No-WebGL environment receives designed fallback.
- Mobile avoids heavy 3D dependency.
- Native scrolling remains functional.

Verification evidence:

- Reduced-motion screenshots or recording.
- No-WebGL fallback screenshot.
- `runbooks/MOTION_AND_WEBGL_FALLBACK_QA.md` records the current reduced-motion and no-WebGL fallback artifact evidence.
- `pnpm test:e2e -- --grep "@reduced-motion|@motion|@constellation"` covers reduced-motion, motion choreography, and atlas fallback behavior.
- `pnpm test:visual` preserves the reduced-motion screenshot baseline under `tests/e2e/visual-regression.spec.ts-snapshots/`.
- `node --test scripts/accessibility-and-fallback-qa-contract.test.mjs` preserves the dedicated artifact contract.

### B-050: Add Lighthouse production-like checks

Labels: `priority:p0`, `type:qa`, `area:performance`, `area:seo`, `area:a11y`, `phase:6-hardening`

Depends on: B-022, B-024, B-028, B-029, B-032

Scope:

- Measure PRD success metrics.

Acceptance criteria:

- Home page reaches Performance >= 90, Accessibility >= 95, Best Practices >=
  95, SEO >= 95 or documented exception exists.
- Representative case-study page reaches the same thresholds or documented
  exception exists.
- Resume page reaches the same thresholds or documented exception exists.
- Reports are saved or linked for launch review.

Verification evidence:

- Lighthouse report artifacts.

### B-051: Add bundle analysis and performance budgets

Labels: `priority:p0`, `type:qa`, `area:performance`, `area:frontend`, `phase:6-hardening`

Depends on: B-034, B-035

Scope:

- Prevent visual enhancements from harming load performance.

Acceptance criteria:

- Bundle analysis command exists.
- Hero/3D/motion assets are lazy-loaded.
- Performance budget is documented for initial JavaScript, hero asset, images,
  and third-party scripts.
- Budget failures are documented before launch.

Verification evidence:

- `node scripts/bundle-budget.mjs --dry-run` prints the B-051 route source,
  ignored non-executable script types, 8 KiB route budget, and summary path
  without requiring build artifacts.
- Bundle analysis output.
- `pnpm build && pnpm bundle:budget` writes
  `test-results/bundle-budget-summary.json` and fails if executable route
  scripts exceed the budget.
- Budget review note.

### B-052: Add Playwright journey smoke tests

Labels: `priority:p0`, `type:qa`, `area:frontend`, `phase:6-hardening`

Depends on: B-012, B-022, B-023, B-024, B-025, B-026

Scope:

- Cover PRD core user journeys.

Acceptance criteria:

- Recruiter fast path test covers home, resume CTA, project CTA, and contact CTA.
- Senior engineer path covers project or case-study architecture and verification
  sections.
- Mobile path checks navigation and contact/resume visibility.
- Contact fallback or form path is tested according to current implementation.

Verification evidence:

- Playwright CI summary or trace.
- Explicit `pnpm test:e2e -- --grep "@keyboard"` and
  `pnpm test:e2e -- --grep "@accessibility"` launch gates run independently of
  the umbrella E2E suite.

### B-053: Add security headers and dependency audit

Labels: `priority:p0`, `type:qa`, `area:security`, `area:infra`, `phase:6-hardening`

Depends on: B-010, B-045

Scope:

- Harden frontend and backend deployment posture.

Acceptance criteria:

- Frontend security headers are configured for the selected host.
- Backend security headers or middleware are configured where applicable.
- Dependency audit command runs for frontend.
- Dependency audit command runs for backend.
- Exceptions are documented with risk and remedy.

Verification evidence:

- `pnpm test:e2e -- --grep "@security"` output for local route headers.
- Static host header config review for `apps/web/public/_headers`.
- Audit output or documented exceptions.

### B-054: Add privacy documentation

Labels: `priority:p0`, `type:docs`, `area:privacy`, `phase:6-hardening`

Depends on: B-026, B-043, B-044

Scope:

- Document contact handling, analytics/events, and public data usage.

Acceptance criteria:

- Explains what contact data is collected and why.
- Explains whether analytics/events are enabled.
- Explains retention or storage behavior.
- Explains how to contact HumanKaylee about privacy.
- Does not overpromise unsupported legal guarantees.

Verification evidence:

- Privacy doc reviewed against implemented contact/events behavior.
- `docs/PRIVACY.md` now documents the current contact form fields, contact
  purpose, API-disabled fallback, store-mode JSONL behavior, transient
  in-memory rate-limit key, disabled-by-default events, missing analytics
  provider, retention posture, and privacy contact path.
- `scripts/privacy-doc-contract.test.mjs` verifies the privacy documentation
  stays indexed from the README, covers B-054 expectations, avoids unsupported
  legal or deletion promises, and does not expose private local details.

### B-055: Add cross-browser and responsive QA pass

Labels: `priority:p0`, `type:qa`, `area:frontend`, `area:design`, `phase:6-hardening`

Depends on: B-022, B-023, B-024, B-025, B-026, B-034

Scope:

- Validate site across realistic recruiter and engineer environments.

Acceptance criteria:

- Checks cover Chromium, Firefox, and WebKit where tooling is available.
- Checks cover mobile widths, tablet widths, and desktop widths.
- LinkedIn in-app mobile scenario is considered for first-load readability.
- Issues are triaged as launch blocker, polish, or post-launch.

Verification evidence:

- QA matrix with screenshots or notes.
- `runbooks/CROSS_BROWSER_RESPONSIVE_QA.md` documents the Chromium, Firefox,
  WebKit, mobile, tablet, desktop, LinkedIn in-app mobile approximation, and
  issue-triage contract for B-055.
- `tests/e2e/responsive-cross-browser.spec.ts` covers first-load readability,
  primary recruiter paths, notes/build-log readability, and horizontal overflow
  across the launch route set.
- `scripts/responsive-qa-contract.test.mjs` verifies the B-055 runbook, E2E
  spec, CI gate, launch evidence row, and browser installation command stay
  aligned.

### B-056: Add API outage resilience test

Labels: `priority:p0`, `type:qa`, `area:backend`, `area:frontend`, `phase:6-hardening`

Depends on: B-047

Scope:

- Prove backend failure does not break static portfolio content.

Acceptance criteria:

- Home, projects, case studies, resume, notes, and contact fallback remain usable
  when API URL is absent or unreachable.
- UI does not show raw errors to users.
- Contact fallback is still actionable.

Verification evidence:

- API-down smoke-test output or manual test note.
- `pnpm test:e2e -- --grep "@api-down"` covers aborted API requests across
  home, projects, one case-study route, resume, notes, and contact, plus
  sanitized contact outage fallback behavior.

## Phase 7: Deployment, Operations, and Launch

Phase 7 local readiness guard:

- Pre-provider local readiness contract:
  `local-readiness only; production remains blocked`.
- `scripts/phase-7-local-readiness-contract.test.mjs` verifies the safe local
  frontend, API, metadata, and evidence commands that can run before provider
  accounts, domains, production secrets, or rollback targets exist.
- `scripts/phase-7-provider-preflight.mjs` provides a provider auth and target
  preflight that records CLI presence and environment variable names only; it is
  safe to run before provider credentials exist and does not deploy, change DNS,
  run production smoke, or clear launch blockers.
- The provider preflight now detects the repo-managed `wrangler` dev dependency
  for Cloudflare Pages local readiness; `fly` and `railway` remain missing
  unless a later selected API host needs them.
- The contract is progress evidence only; #63, #64, #65, and #69 stay open
  until real provider, domain, production smoke, rollback, contact, Lighthouse,
  four approved case studies, and redaction approval evidence exists.
- Phase 7 issue traceability maps #63, #64, #65, and #69 to their controlling
  launch-blocker decisions and replacement evidence rows.

### B-057: Configure Cloudflare Pages frontend deployment

Labels: `priority:p0`, `type:task`, `area:infra`, `phase:7-launch`

Depends on: B-010, B-050

Scope:

- Deploy static frontend to Cloudflare Pages.

Acceptance criteria:

- Build command and output directory are configured.
- Environment variables are documented.
- Preview and production deploy behavior is understood.
- Private repo compatibility is confirmed if repo is private.

Verification evidence:

- Successful preview or production deploy log.
- `runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md` records the frontend
  provider/project/domain inputs that are still missing before #63 can close,
  while `scripts/phase-7-deployment-decision-packets-contract.test.mjs` keeps
  that packet blocked and non-launch-ready.

### B-058: Deploy Rust API to selected host

Labels: `priority:p0`, `type:task`, `area:backend`, `area:infra`, `phase:7-launch`

Depends on: B-046, B-005

Scope:

- Deploy API to Fly.io, Railway, or another approved host.

Acceptance criteria:

- Health endpoint is reachable from public internet or owner-approved production-equivalent provider preview network.
- Required secrets are configured server-side.
- API origin is added to frontend config.
- CORS allows production frontend and blocks unapproved origins.

Verification evidence:

- Public or preview `GET /api/health` response.
- CORS smoke-check output.
- `runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md` records the API provider,
  origin, secret storage, contact handling, CORS, health, and rollback inputs
  still required before #64 can close.
- `pnpm phase7:contact-decision -- --mode defer --dry-run` records only a
  local/decision-template shape for the contact handling decision; it cannot
  approve contact handling or close #64/#69.

### B-059: Configure production domain and canonical URLs

Labels: `priority:p0`, `type:task`, `area:infra`, `area:seo`, `phase:7-launch`

Depends on: B-005, B-057

Scope:

- Point final domain at frontend deployment and align metadata.

Acceptance criteria:

- DNS records are documented.
- Canonical URL config uses final domain.
- Sitemap uses final domain.
- Open Graph URLs use final domain.
- TLS is active.

Verification evidence:

- DNS/TLS check.
- Metadata inspection on production domain.
- `runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md` records the domain, DNS,
  TLS, canonical URL, sitemap, and Open Graph evidence still required before
  #65 can close.
- Phase 7 metadata readiness verifies RSS uses shared site metadata with the
  sitemap, robots, canonical URL, and Open Graph path; this is local readiness
  only and does not close #65 until final domain, DNS/TLS, and production
  metadata smoke evidence exist.
- `scripts/phase-7-metadata-readiness-contract.test.mjs` guards the shared
  metadata source and preserves the B-059 production blocker boundary.

### B-060: Write local development and deployment README

Labels: `priority:p0`, `type:docs`, `area:ops`, `phase:7-launch`

Depends on: B-006, B-038, B-057, B-058

Scope:

- Document how another agent or developer runs and deploys the project.

Acceptance criteria:

- Covers frontend local dev.
- Covers backend local dev.
- Covers environment variables without secret values.
- Covers tests and quality checks.
- Covers frontend deployment.
- Covers backend deployment.
- Covers common failure modes and recovery commands.

Verification evidence:

- Fresh-agent or clean-checkout dry run follows README through build/test.
- `scripts/readme-contract.test.mjs` verifies README coverage for frontend and
  backend local development, environment variable names without secrets, local
  quality gates, frontend and backend deployment pointers, recovery commands,
  and launch-blocker language.

### B-061: Write content update and redaction runbook

Labels: `priority:p0`, `type:docs`, `area:content`, `area:privacy`, `phase:7-launch`

Depends on: B-002, B-007, B-024

Scope:

- Document safe future content updates.

Acceptance criteria:

- Explains how to add a project.
- Explains how to add a case study.
- Explains how to add a note/build-log entry.
- Includes redaction checklist.
- Includes publication review steps.

Verification evidence:

- Runbook used to add or review one existing content item.
- `runbooks/CONTENT_UPDATE_AND_REDACTION.md` now documents project,
  case-study, note/build-log, resume, and site metadata update paths; preserves
  the approved-only launch gate; and uses Creative Web Systems Atlas Demo as a
  reviewed-but-not-approved example.
- `scripts/content-runbook-contract.test.mjs` verifies the runbook covers the
  required workflows, schema field names, redaction guide/status links, privacy
  rule, review example, and verification commands.
- `runbooks/CASE_STUDY_REDACTION_APPROVAL_PACKETS.md` gives each current launch
  candidate an approval packet template and missing-evidence list without
  marking any candidate launch-approved.
- `scripts/redaction-approval-packets-contract.test.mjs` verifies approval
  packet coverage, required guide checklist mapping, and the current
  zero-approved launch state.

### B-062: Write rollback and incident runbook

Labels: `priority:p0`, `type:docs`, `area:ops`, `area:infra`, `phase:7-launch`

Depends on: B-057, B-058

Scope:

- Document what to do if deploy, API, contact, or domain breaks.

Acceptance criteria:

- Covers frontend rollback.
- Covers API rollback or disablement.
- Covers contact endpoint outage and fallback.
- Covers DNS or custom domain issue.
- Covers how to verify recovery.

Verification evidence:

- Rollback rehearsal note or dry-run evidence.
- `scripts/rollback-runbook-contract.test.mjs` verifies rollback and incident
  runbook coverage for frontend rollback, API rollback or disablement, contact
  endpoint outage fallback, DNS/custom-domain issues, recovery verification,
  and honest blocked status for production rollback evidence until real targets
  exist.

### B-063: Complete launch checklist

Labels: `priority:p0`, `type:qa`, `area:ops`, `phase:7-launch`

Depends on: B-050, B-052, B-053, B-054, B-055, B-056, B-057, B-058, B-059, B-060, B-061, B-062

Scope:

- Final launch validation.

Acceptance criteria:

- Home is live.
- Projects are live.
- At least four case studies are live and redacted.
- Resume route and PDF production smoke evidence exists.
- Notes/build-log is live.
- Contact path works.
- Rust API health is live.
- CI is green.
- Lighthouse targets pass or exceptions are documented.
- Deployment and rollback docs are complete.

Verification evidence:

- Final launch checklist with links to production pages, CI run, Lighthouse
  reports, API health, and runbooks.
- `runbooks/FINAL_LAUNCH_CHECKLIST.md` records current B-063 acceptance status
  with explicit blocker rows for production pages, API health, production
  Lighthouse, contact production handling, rollback evidence, and case-study
  redaction approvals.
- `scripts/final-launch-checklist-contract.test.mjs` verifies the checklist and
  launch evidence keep not-launch-ready status explicit until real production
  targets and approval evidence exist.
- `runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md` records the remaining
  provider, domain, API, contact, Lighthouse, rollback, and redaction evidence
  required before #69 can close, while
  `scripts/phase-7-deployment-decision-packets-contract.test.mjs` prevents this
  prep packet from being treated as launch approval.
- `scripts/phase-7-local-readiness-contract.test.mjs` protects the
  pre-provider local readiness boundary so local build, Lighthouse, e2e, Rust
  API, metadata, and contract evidence cannot be mistaken for production launch
  evidence.
- `scripts/phase-7-blocker-traceability-contract.test.mjs` verifies Phase 7
  issue traceability maps #63, #64, #65, and #69 to their controlling
  launch-blocker decisions and replacement evidence rows.

## Phase 8: Post-Launch Enhancements

### B-064: Evaluate portfolio assistant scope

Labels: `priority:p2`, `type:research`, `area:backend`, `area:privacy`, `phase:8-post-launch`

Depends on: B-063

Scope:

- Decide whether to add an AI assistant after launch.

Acceptance criteria:

- Defines user value beyond novelty.
- Defines privacy model and data sources.
- Defines cost and rate-limit controls.
- Defines no-secret frontend architecture.
- Recommends build, defer, or reject.

Verification evidence:

- Decision note approved before implementation.
- `docs/ASSISTANT_SCOPE_DECISION.md` records draft decision support only,
  recommends deferring assistant implementation until B-063 launch evidence and
  HumanKaylee approval exist, and does not authorize B-065.
- `runbooks/POST_LAUNCH_FEATURE_PREP.md` records the pre-launch decision inputs
  and keeps #70 blocked until B-063 launch evidence exists.
- `scripts/post-launch-feature-prep-contract.test.mjs` verifies the prep record
  does not authorize assistant work before approval.

### B-065: Add portfolio assistant prototype

Labels: `priority:p2`, `type:feature`, `area:backend`, `area:frontend`, `area:privacy`, `phase:8-post-launch`

Depends on: B-064, B-063

Scope:

- Build only if B-063 launch evidence exists and #70/B-064 has a
  HumanKaylee-approved outcome of `build`.

Acceptance criteria:

- Assistant answers from public portfolio content only.
- Assistant discloses limitations.
- Secrets remain server-side.
- Feature can be disabled without affecting the site.
- Abuse and cost controls exist.

Verification evidence:

- Prompt/content tests.
- Disabled-mode smoke test.
- `runbooks/POST_LAUNCH_FEATURE_PREP.md` records the do-not-build gate, public
  content boundary, disabled-mode expectation, and abuse/cost control inputs
  while #71 remains blocked until B-063 launch evidence exists and #70/B-064
  has a HumanKaylee-approved outcome of `build`.

### B-066: Add richer public status or metadata page

Labels: `priority:p2`, `type:feature`, `area:backend`, `area:frontend`, `phase:8-post-launch`

Depends on: B-039, B-040, B-063

Scope:

- Expose API-backed portfolio status if useful after launch.

Acceptance criteria:

- Status page shows safe public uptime or project metadata.
- API failure has static fallback.
- No private deployment details are exposed.
- Public release labels or build versions are used instead of raw private commit
  SHAs, deployment IDs, provider account names, or non-generic environment
  labels unless explicitly approved for public evidence.

Verification evidence:

- API-up and API-down status page checks.
- `runbooks/POST_LAUNCH_FEATURE_PREP.md` records the safe pre-launch contract for
  `/api/health`, `/api/projects/live`, static fallback copy, and no private
  deployment details before any status page is built.
- `scripts/post-launch-feature-prep-contract.test.mjs` verifies the contract
  remains planning-only and blocked by B-063.

### B-067: Add additional notes and postmortems

Labels: `priority:p2`, `type:content`, `area:content`, `phase:8-post-launch`

Depends on: B-027, B-063

Scope:

- Expand engineering writing after launch.

Acceptance criteria:

- Adds at least three notes or postmortems.
- Each entry includes problem, approach, evidence, and lesson.
- RSS feed updates correctly.

Verification evidence:

- Feed and notes index review.
- `runbooks/POST_LAUNCH_FEATURE_PREP.md` records that pre-launch work is limited
  to draft outlines and that publishing still requires redaction review,
  RSS/index verification, and launch completion.

### B-068: Evaluate API hosting migration

Labels: `priority:p2`, `type:research`, `area:infra`, `area:backend`, `phase:8-post-launch`

Depends on: B-058, B-063

Scope:

- After B-058 and B-063 evidence exists, compare the actual launch API host
  against Fly.io, Railway, Hetzner, Cloudflare, or another host.

Acceptance criteria:

- Compares uptime, cost, deploy complexity, custom domain support, observability,
  and rollback.
- Produces a keep-or-move recommendation only after selected-host and launch
  evidence exists.
- If a future host change is recommended, defines provider-move and rollback
  procedures.
- Re-checks official provider docs before any future recommendation.
- Does not choose a provider, perform DNS cutover, run migration commands,
  configure env/secrets, or write rollback steps before B-058/B-063 evidence and
  HumanKaylee approval.

Verification evidence:

- Hosting decision note.
- `runbooks/POST_LAUNCH_FEATURE_PREP.md` records the pre-launch hosting decision
  inputs for Shuttle, Fly.io, Railway, Cloudflare, and Hetzner while #74 remains
  blocked by B-058 and B-063 production evidence.
- The pre-launch comparison matrix records official provider source URLs and a
  source snapshot date for each candidate without ranking candidates or
  authorizing host changes.
- `scripts/post-launch-feature-prep-contract.test.mjs` verifies the matrix is
  decision support only, not a migration authorization.

## Launch-Critical Issue Set

Minimum launch path:

- B-001 through B-016
- B-020
- B-022 through B-030
- B-032 and B-033
- B-038, B-039, B-041 through B-043, B-045 through B-047
- B-048 through B-063

Parallel-safe groups after dependencies are met:

- B-014, B-015, B-016, B-017, B-018, and B-019 can be split across content
  agents after B-002, B-003, and B-007.
- B-023, B-024, B-025, B-026, and B-027 can proceed in parallel after B-008 and
  relevant content dependencies.
- B-039, B-040, B-041, and B-045 can proceed in parallel after B-038 if route
  state interfaces are agreed.
- B-048 through B-056 can be split by QA specialty once their feature
  dependencies are complete.

Known launch blockers:

- `runbooks/LAUNCH_BLOCKERS_REGISTER.md` is the source register for unresolved
  launch decisions and their owners/statuses.
- Final domain name is required for production canonical URLs and DNS.
- Final resume PDF source is resolved locally, but production `/resume/` and
  PDF-link smoke evidence is still required for launch.
- At least four case studies must be approved as public-safe.
- API host must be selected before production API deployment.
- Contact delivery provider or storage approach must be chosen before public
  contact form launch.
