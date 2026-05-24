# HumanKaylee Portfolio Roadmap

Date: 2026-05-23
Status: Planning baseline for implementation
Sources: `docs/RESEARCH.md`, `docs/PRD.md`

## Goal

Build and launch a visually distinctive, static-first personal portfolio for
HumanKaylee that proves technical depth within 30 seconds and remains credible
under deeper engineering review. The site should combine fast recruiter access,
deep case-study evidence, accessible cinematic presentation, and a small Rust
backend that powers useful public features without making core content depend on
API uptime.

## North Star Outcome

A reviewer can land on the site, immediately understand HumanKaylee's technical
positioning, inspect at least four substantial case studies, download or view a
resume, contact HumanKaylee, and verify that the project itself was designed,
built, tested, deployed, and documented with mature engineering practices.

## Source-of-Truth Constraints

- Use Astro, TypeScript, static HTML, content collections, and selective React
  islands for the frontend.
- Use one signature Three.js or React Three Fiber experience, not WebGL on every
  page.
- Use GSAP ScrollTrigger only where cinematic scroll choreography is worth the
  payload and complexity.
- Use Rust Axum for the backend API with Tokio, tower-http, structured tracing,
  typed environment config, route tests, and deployment documentation.
- Host the frontend on Cloudflare Pages for launch unless a later decision
  explicitly chooses another static host.
- Start the Rust API on a current Axum-capable host. Shuttle is not a viable new
  launch target as of https://docs.shuttle.dev/docs/shuttle-shutdown; Fly.io and
  Railway are the current normal PaaS candidates.
- Keep static portfolio content fully useful if JavaScript, WebGL, or the API is
  unavailable.
- Publish 4 to 6 flagship case studies before launch.
- Redact sensitive details from projects, runbooks, logs, and operational
  evidence before publication.
- Do not build a CMS, public authentication, or an AI assistant as launch
  blockers.
- Avoid generic purple AI/SaaS visuals and default Inter/Roboto/system-led
  visual language.

## Agent Execution Contract

Use this roadmap with `docs/BACKLOG.md`. Agents should work one backlog issue at
a time unless the issues are explicitly marked as parallel-safe.

Execution rules:

- Read `docs/PRD.md`, `docs/RESEARCH.md`, this roadmap, and the selected backlog
  issue before implementation.
- Treat `docs/PRD.md` as the product authority and `docs/RESEARCH.md` as the
  strategy and technology authority.
- Prefer small, reviewable commits by issue.
- Do not publish secrets, private keys, tokens, private hostnames, customer data,
  or unredacted operational logs.
- If a case study depends on sensitive work, publish redacted architecture,
  verification patterns, outcomes, and lessons rather than raw private details.
- If WebGL, animation, backend, or analytics work threatens performance,
  accessibility, or recruiter clarity, preserve the simpler static path first.
- Pause and ask for direction when an open decision blocks irreversible work:
  final domain, production resume smoke target, public-safe case-study
  selection, API host, or AI assistant launch scope. Final resume PDF source is resolved locally; production `/resume/` and PDF-link smoke evidence is still
  required for launch.

## Release Strategy

Ship in three usable increments:

1. Foundation Preview: static shell, content model, visual direction, core pages,
   and clearly marked draft case-study structure that cannot be mistaken for finished public evidence.
2. Beta Portfolio: real case studies, resume, project atlas fallback, contact
   fallback, SEO, accessibility pass, and deployable frontend.
3. Launch: polished visual signature, Rust API, contact flow, live metadata,
   CI, deployment runbooks, security/privacy controls, Lighthouse targets, and
   custom-domain instructions.

Each increment must leave the site coherent. No phase should depend on a future
ornamental feature to explain the portfolio.

## Phase 0: Product, Safety, and Execution Setup

Purpose: Convert the PRD and research into safe implementation boundaries before
any public content or code is shipped.

Key deliverables:

- Confirm final public positioning statement and audience hierarchy.
- Select initial case-study candidates and classify each as public, redacted, or
  excluded.
- Define sensitive-data redaction rules for logs, runbooks, screenshots, repo
  links, hostnames, names, and metrics.
- Establish design principles for "The Systems Atelier" visual direction.
- Create issue tracking labels and execution order from `docs/BACKLOG.md`.

Dependencies:

- Source docs already exist.
- Requires user input for domain and public-safe project set before launch, but
  implementation can begin with safe draft content. The approved local resume
  PDF source is already present; production resume route/PDF smoke remains a
  launch gate.

Exit criteria:

- Agents have a safe content policy and know which work can be public.
- Backlog labels, priorities, and dependencies are usable for implementation.
- No build or design work is blocked by missing strategic direction.

Evidence:

- Content safety checklist committed.
- Case-study inventory records public/redacted/excluded status.
- Open decisions are tracked with owners and impact.

## Phase 1: Repository and Frontend Foundation

Purpose: Establish the static-first frontend architecture, baseline tooling, and
quality gates before feature work.

Key deliverables:

- Astro project configured with TypeScript.
- Content collections for case studies, notes, projects, resume data, and site
  metadata.
- CSS architecture with design tokens for color, type scale, spacing, motion,
  z-index, and layout.
- Base layout with semantic regions, skip link, metadata hooks, and accessible
  navigation.
- Package scripts for format, lint, typecheck, test, build, preview, and bundle
  inspection.
- Initial CI workflow that runs the baseline checks.

Dependencies:

- Phase 0 design principles and content taxonomy.

Exit criteria:

- A static home page renders meaningful content with JavaScript disabled.
- `pnpm build` succeeds.
- `pnpm typecheck` succeeds.
- CI runs repeatable frontend checks.
- Core pages have a stable routing convention and content model.

Evidence:

- Build output artifact or CI log.
- Content schema validation result.
- Screenshot or local preview of the static shell.

## Phase 2: Content Foundation and Identity

Purpose: Build the substance before investing in visual spectacle.

Key deliverables:

- Finalized positioning statement for first viewport.
- Recruiter and engineer fast-path content blocks.
- Approved local resume PDF source, HTML resume route, downloadable PDF link,
  and print-friendly styling.
- 4 to 6 selected flagship case studies drafted with the PRD case-study
  structure.
- Each case study includes summary, problem, constraints, architecture, build
  details, verification, operational notes, outcome, lessons, and safe links or
  artifacts.
- Notes or build-log content model and first "How this site was built" entry.

Dependencies:

- Phase 0 content safety rules.
- Phase 1 content collections.

Exit criteria:

- At least four case studies are publication-ready or explicitly marked blocked
  by redaction/user review.
- Resume route and PDF link exist from the approved local PDF source, while
  production `/resume/` and PDF-link smoke evidence is still required.
- The home page can explain HumanKaylee's value without relying on 3D, motion, or
  API data.

Evidence:

- Case-study drafts reviewed against the PRD checklist.
- Redaction checklist completed for each real-work case study.
- Resume page passes print preview review.

## Phase 3: Core Static Portfolio Experience

Purpose: Build the recruiter-fast and engineer-deep paths as accessible static
HTML first.

Key deliverables:

- Home page with hero copy, top skills, top projects, recruiter card, engineer
  card, resume CTA, project CTA, and contact CTA.
- Project index with category filters for AI, automation, infrastructure,
  backend, creative web, and operations.
- Case-study detail pages from content collections.
- Notes/build-log index and detail pages with RSS feed.
- Contact page or section with mailto fallback.
- Sitemap, robots.txt, canonical URLs, Open Graph metadata, and JSON-LD.

Dependencies:

- Phase 1 routes and content collections.
- Phase 2 content drafts.

Exit criteria:

- A user can complete the recruiter fast path without JavaScript.
- A senior engineer can navigate from a project to architecture, verification,
  operational notes, and links.
- Mobile navigation, resume link, and contact path are obvious and tappable.

Evidence:

- Manual no-JavaScript smoke test.
- Mobile viewport screenshots for home, project index, case study, resume, and
  contact.
- Generated sitemap and RSS artifacts.

## Phase 4: Visual System, Motion, and Project Atlas

Purpose: Add the visual "wow" without compromising clarity, accessibility, or
performance.

Key deliverables:

- "The Systems Atelier" art direction implemented through typography, color,
  texture, grid/contour motifs, artifact cards, and evidence snippets.
- Responsive static poster/fallback for the hero.
- Desktop signature interaction: project constellation or systems map.
- HTML-accessible atlas equivalent for keyboard users, mobile users, reduced
  motion users, and no-WebGL environments.
- Purposeful scroll-linked reveals and page transitions.
- `prefers-reduced-motion` support across animation features.
- Bundle and performance budgets for hero and animation payloads.

Dependencies:

- Phase 3 static pages.
- Real project content from Phase 2.

Exit criteria:

- The visual layer enhances the same content that is already available in static
  HTML.
- Reduced-motion and no-WebGL modes are complete, not degraded afterthoughts.
- Hero text, resume CTA, project CTA, and contact CTA are visible before heavy
  assets load.

Evidence:

- Local visual-surface Playwright coverage verifies the art-directed home,
  project index, case-study detail, resume, and contact surfaces. This is
  implementation evidence, not a production-launch claim.
- Desktop recording of the signature interaction.
- Reduced-motion recording or screenshots.
- Bundle analysis showing heavy assets are lazy-loaded.
- Lighthouse or equivalent performance pass on representative pages.
- Current PR status: B-031/032/033/034/035/036/037 have local guard coverage above. `B-034` is represented by a desktop-gated SVG/HTML constellation with a lazy focus helper, not by a WebGL/R3F shipping claim.

## Phase 5: Rust Backend and API-Backed Features

Purpose: Add a small, visible Rust systems proof while preserving static-site
resilience.

Key deliverables:

- Axum API with `GET /api/health`.
- Cached `GET /api/projects/live` metadata endpoint.
- `POST /api/contact` with validation, rate limiting, honeypot support, and safe
  message delivery or storage.
- Optional `POST /api/events` with privacy-safe analytics only if enabled.
- Typed environment configuration.
- CORS restricted to approved origins.
- Request size limits, compression where useful, and structured tracing.
- Integration tests for all enabled routes.
- Dockerfile and Shuttle deploy path, with Fly.io/Railway fallback notes.
- Frontend integration that degrades cleanly when the API is down.

Dependencies:

- Phase 3 contact UI and project metadata UI.
- Open decision on API host before production launch.

Exit criteria:

- Static pages remain useful when the API is unreachable.
- API tests pass.
- Contact abuse controls are present before public exposure.
- Health endpoint exposes status, version, and uptime without leaking secrets.

Evidence:

- Backend test output.
- Local API smoke-test output.
- Deployed health endpoint response.
- API-down frontend fallback screenshot.
- Current PR status: B-038/039/040/041/044/045/046/047 have local guard
  coverage, including structured JSON startup telemetry, health response shape,
  stale-safe cached project metadata, disabled-by-default events, configured CORS
  and middleware, Shuttle/container build paths, and frontend API fallback
  behavior.
- Current production blockers: B-042 remains local in-memory abuse-control
  evidence, now avoiding untrusted forwarded headers by default. B-043 remains blocked for production.
  Persistent contact storage or a delivery provider still needs approved
  retention, backup, rotation, deletion, and operational handling decisions.
  B-043 now has a tested delivery adapter seam for local backend coverage only.

## Phase 6: Quality, Security, Accessibility, and Performance Hardening

Purpose: Make launch measurable and defensible.

Key deliverables:

- Accessibility review for headings, landmarks, keyboard navigation, color
  contrast, alt text, captions/summaries, and touch targets.
- Lighthouse targets on production-like pages: Performance >= 90,
  Accessibility >= 95, Best Practices >= 95, SEO >= 95.
- Playwright smoke tests for the core user journeys.
- Dependency audit and documented exceptions.
- Security headers for frontend and backend.
- Privacy documentation for analytics/events.
- Backend outage and contact-fallback checks.
- Cross-browser and responsive checks for desktop and mobile.

Dependencies:

- Phases 3, 4, and 5.

Exit criteria:

- All launch metrics pass or have documented exceptions with owner and remedy.
- Core journeys have automated smoke coverage.
- Manual accessibility and reduced-motion checks are complete.

Evidence:

- Lighthouse reports.
- Playwright trace or CI summary.
- Accessibility checklist.
- Security/privacy checklist.

## Phase 7: Deployment, Operations, and Launch

Purpose: Publish the site with reproducible deployment, rollback, and update
procedures.

Key deliverables:

- Cloudflare Pages deployment for the frontend.
- Rust API deployment to Fly.io, Railway, or another approved host.
- Custom domain instructions and final production environment settings.
- README and runbook covering local dev, build, deployment, rollback, content
  updates, and redaction policy.
- Status and health checks.
- Launch review checklist.

Dependencies:

- Open decisions resolved: domain, production resume smoke target, case-study
  approvals, API host.
- Phase 6 quality gates.

Exit criteria:

- Home, projects, at least four case studies, resume, notes/build-log, and
  contact are live.
- CI runs lint, typecheck, tests, build, backend tests, and smoke tests.
- Deployment can be reproduced by another agent from the docs without hidden
  context.
- Rollback path is documented and tested at least once.

Evidence:

- Production URL.
- CI green run.
- Deployment logs.
- Rollback rehearsal note.
- Final launch checklist.

## Phase 8: Post-Launch Enhancements

Purpose: Add optional credibility features after the core portfolio is already
valuable.

Candidates:

- Portfolio assistant backed by local content index or embeddings, with strict
  privacy and no frontend secrets.
- Additional creative web demo as a standalone case study.
- Public status page or richer live project metadata.
- More notes/build-log entries.
- Advanced self-hosting or API host migration if uptime, cost, or operations
  needs exceed the chosen launch host's fit.

Pre-launch prep for these candidates lives in
`runbooks/POST_LAUNCH_FEATURE_PREP.md` and is pre-launch planning only. It does
not authorize implementation, post-launch feature approval, or launch readiness.

Entry criteria:

- Launch is complete.
- New work does not compromise performance, accessibility, or recruiter clarity.
- Any AI assistant work has a privacy and cost plan before implementation.

## Critical Dependency Graph

1. Product safety and content selection before case-study publication.
2. Content collections before core pages.
3. Static core pages before visual/WebGL enhancements.
4. Contact fallback before Rust contact endpoint.
5. Backend tests and abuse controls before public contact endpoint launch.
6. Accessibility and performance hardening before production launch.
7. Domain, production resume smoke evidence, case-study approvals, and a
   current API host before final launch.

## Definition of Ready for Implementation Issues

A backlog issue is ready when it has:

- A single outcome.
- Labels.
- Dependencies.
- Files or areas likely to change.
- Acceptance criteria.
- Verification evidence.
- A clear pause condition if it depends on an open decision.

## Definition of Done for Launch

Launch is done when:

- Production home page explains HumanKaylee's positioning immediately.
- Recruiter fast path works on mobile and desktop without JavaScript.
- Senior engineer deep path exposes architecture, verification, operations, and
  outcomes.
- At least four flagship case studies are live and redacted safely.
- Resume PDF and HTML resume are available.
- Contact works through API or documented fallback.
- Rust API health and at least one user-visible API-backed feature are live.
- Lighthouse targets meet the PRD thresholds or documented exceptions exist.
- Accessibility, security, privacy, and dependency checks are complete.
- Deployment, rollback, and content-update runbooks are documented.
