# Changelog

All notable portfolio project changes should be documented here.

This project uses a planning-first changelog during pre-launch work. Entries should separate shipped user-facing changes from planning decisions, content changes, and operational changes.

## [Unreleased]

### Added

- Added art-directed page-surface treatments and a `@visual-surfaces`
  Playwright gate for the home, project index, case-study detail, resume, and
  contact routes.
- Added a static systems-map hero poster on the home page with project links
  and no JavaScript/WebGL dependency.
- Added a static-site security header policy, Cloudflare-compatible `_headers`
  file, and Playwright `@security` launch gate with CI coverage.
- Added explicit Playwright `@keyboard` and `@accessibility` launch gates and
  CI steps for those checks.
- Added rendered Markdown body support for case-study pages and replaced the
  CLI fleet case-study placeholder with a public-safe narrative, verification
  matrix, and operator checklist.
- Added a generalized public-safe body for the remote workstation recovery case
  study, with route coverage and quality-gate scans while keeping its redaction
  status `reviewed`.
- Added a public-safe body for the HumanKaylee portfolio build case study,
  including static-first architecture, optional Rust API boundary, agent
  assistance, verification matrix, and launch evidence boundary coverage.
- Added a public-safe body for the creative web systems atlas demo case study,
  including semantic atlas fallback proof, motion/performance/accessibility
  boundaries, B-017 scope boundary, and quality-gate coverage while keeping its
  redaction status `reviewed`.
- Added a critical JavaScript bundle budget gate with CI coverage and a
  generated summary artifact.
- Added a feature-gated Shuttle API binary, Shuttle dirty-deploy guard,
  container fallback Dockerfile, and CI check for the Shuttle build path.
- Added graceful shutdown handling for the standalone Rust API so container
  hosts can stop it without falling back to SIGKILL.
- Added a content redaction status runbook that keeps every case-study
  candidate out of launch approval until its guide checklist and public-safe
  evidence are complete.
- Added a content update and redaction runbook with an executable contract test
  covering project, case-study, notes/build-log, schema field, redaction
  checklist, publication review, and verification-command expectations.
- Published the approved downloadable resume PDF and linked it from the home recruiter path and resume page.
- Added case-study index and detail routes for current `publicationStatus: publish` entries while preserving redaction statuses.
- Added a safe evidence drawer section for case-study pages using existing sanitized frontmatter.
- Added notes/build-log index and detail routes from the notes content collection.
- Added `/rss.xml`, `/robots.txt`, and `/sitemap-index.xml` static crawler/feed artifacts.
- Added canonical URLs, Open Graph/Twitter image metadata, JSON-LD Person/WebSite data, and a default social preview SVG asset.
- Added static project detail pages for published project entries and linked project cards to those routes.
- Added an accessible project atlas fallback with category filters, keyboard-reachable nodes, and reduced-motion poster behavior.
- Added the Rust API typed environment config and static-safe `GET /api/projects/live` metadata endpoint.
- Added `POST /api/contact` with JSON validation, honeypot rejection, oversized-payload rejection, disabled-mode fallback, and a safe accepted response that does not echo private message text.
- Added required JSONL contact storage for enabled `store` mode via `HK_API_CONTACT_STORE_PATH`, including safe failure when storage is not configured.
- Added backend CORS allowlist middleware, request body limits, timeout, tracing, compression, and in-memory contact rate limiting.
- Added gated `POST /api/events` with disabled-by-default behavior and an allowlisted privacy-safe event shape.
- Added the API-enhanced contact page form with visible mailto fallback, no-JS usefulness, API-down copy, and Playwright coverage.
- Added API-enhanced build telemetry on the home page while preserving the static telemetry fallback.
- Added practical privacy notes documenting current static-site behavior, resume PDF handling, contact validation versus mailto fallback, disabled-by-default events, and redaction expectations.
- Added a privacy documentation contract test covering contact data use,
  transient rate-limit processing, disabled analytics/events, retention limits,
  privacy contact path, and unsupported-promise guards.
- Added the Phase 8 deployment runbook for Cloudflare Pages, Shuttle, Fly.io, Railway, smoke checks, and rollback evidence.
- Added the launch evidence status runbook with current PR evidence, local verification gaps, and explicit production blockers.
- Added route coverage, no-JS, reduced-motion, and rendered-content privacy checks for core routes.
- Added B-056 API outage resilience Playwright coverage and CI gate for
  representative static routes and sanitized contact outage fallback behavior.
- Expanded README local-development and deployment guidance with a contract
  test for B-060 coverage.
- Added a rollback and incident runbook contract for B-062, including dry-run
  evidence requirements for frontend rollback, API rollback or disablement,
  contact fallback, DNS/custom-domain issues, and recovery verification records.
- Added a B-063 final launch checklist and contract that preserve
  not-launch-ready status while production domains, provider projects, contact
  handling, rollback targets, and case-study redaction approvals remain blocked.
- Scoped Phase 0 CI branch pushes to `main` while keeping pull-request checks
  active, preventing duplicate PR-branch Lighthouse runs for the same commit.
- Added a non-scored Lighthouse warm-up audit before the scored route audits so
  CI cold-start variance does not weaken the strict launch thresholds.

### Remaining Blockers

- Four launch case studies still need completed redaction checklists, approved public-safe evidence, and cleared open items before they can be marked launch-approved.
- Final public domain is still unresolved, so metadata currently uses the reserved configured site URL from `apps/web/src/content/site/site.json`.
- Production provider projects and domains still need to be created before
  Cloudflare Pages, Shuttle, Fly.io, or Railway deployment evidence can be
  recorded.
- Contact API production enablement still needs an approved persistent store path, retention policy, backup/rotation decision, or alternate delivery provider before treating API form submissions as production-handled messages.

### Planned

- Build a visually rich, static-first portfolio for HumanKaylee.
- Publish home, projects, at least 4 flagship case studies, resume, notes/build-log, and contact before launch.
- Implement the frontend with Astro, TypeScript, content collections, React islands, and selective Three.js/React Three Fiber enhancements.
- Implement a small Rust Axum API for health, live project metadata, contact, and optional privacy-safe events.
- Deploy the frontend to Cloudflare Pages or a comparable static host.
- Deploy the Rust API to Shuttle Community or a fallback host such as Fly.io or Railway.
- Add CI for lint, typecheck, tests, backend tests, production build, and Playwright smoke tests.
- Meet or document exceptions for Lighthouse targets: Performance >= 90, Accessibility >= 95, Best Practices >= 95, SEO >= 95.

### Open Decisions

- Final domain name.
- Which existing projects are safe to publish in detail.
- Whether the AI assistant ships in v1 or remains a v2 demo.
- Whether Shuttle Community is sufficient for launch API hosting.

## [0.1.0] - 2026-05-23

### Added

- Created the initial research brief for current portfolio patterns, recommended stack, hosting options, content strategy, visual direction, and risk controls.
- Created the initial product requirements document for the HumanKaylee portfolio.
- Defined the primary product goal: make a reviewer believe within 30 seconds that HumanKaylee can design, build, operate, debug, and explain sophisticated systems.
- Defined target audiences: recruiters, hiring managers, senior engineers, collaborators, consulting prospects, and technical peers.
- Defined the "Systems Atelier" visual direction.
- Defined core user journeys for recruiter fast path, senior engineer deep path, visual impression path, and mobile path.
- Defined launch requirements for content, frontend, backend, CI, Lighthouse checks, documentation, deployment, and rollback.

### Decided

- Favor Astro over a fully dynamic framework for the initial portfolio because the site is primarily static content with selective interactive enhancements.
- Use React islands only where interactivity, animation, or WebGL requires client-side JavaScript.
- Use WebGL/3D as a signature progressive enhancement, not as a dependency for reading core content.
- Keep the static portfolio useful when the Rust backend is unavailable.
- Require every flagship case study to include problem, constraints, architecture, implementation proof, verification, outcome, and lessons learned.
- Treat accessibility, reduced motion, mobile usability, and no-WebGL fallbacks as core requirements.

### Not Yet Implemented

- No production website code has been built in this changelog baseline.
- No deployment target has been provisioned.
- No public case study has been selected, redacted, or published.
- No Rust API has been implemented.
- No CI pipeline has been created.
