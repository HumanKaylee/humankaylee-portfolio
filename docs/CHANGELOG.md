# Changelog

All notable portfolio project changes should be documented here.

This project uses a planning-first changelog during pre-launch work. Entries should separate shipped user-facing changes from planning decisions, content changes, and operational changes.

## [Unreleased]

### Added

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
- Added the Phase 8 deployment runbook for Cloudflare Pages, Shuttle, Fly.io, Railway, smoke checks, and rollback evidence.
- Added the launch evidence status runbook with current PR evidence, local verification gaps, and explicit production blockers.
- Added route coverage, no-JS, reduced-motion, and rendered-content privacy checks for core routes.

### Remaining Blockers

- Four launch case studies still need completed redaction checklists, approved public-safe evidence, and cleared open items before they can be marked launch-approved.
- Final public domain is still unresolved, so metadata currently uses the reserved configured site URL from `apps/web/src/content/site/site.json`.
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
