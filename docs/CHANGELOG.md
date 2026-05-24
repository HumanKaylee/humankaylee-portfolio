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
- Added a case-study redaction approval packet readiness matrix that lists the
  exact missing approval evidence for each publish-intended candidate while
  preserving the zero-approved launch state.
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
- Hardened contact rate limiting so the default abuse key does not trust spoofable forwarded headers before a trusted proxy boundary exists.
- Added an injectable contact delivery adapter seam with fake success/failure contract coverage while keeping production contact delivery blocked until storage/provider decisions are approved.
- Added gated `POST /api/events` with disabled-by-default behavior and an allowlisted privacy-safe event shape.
- Added the API-enhanced contact page form with visible mailto fallback, no-JS usefulness, API-down copy, and Playwright coverage.
- Added API-enhanced build telemetry on the home page while preserving the static telemetry fallback.
- Strengthened the home telemetry strip into a static-first credibility panel for local build, test, accessibility, and API-fallback posture without claiming production launch readiness.
- Added schema-backed featured evidence hooks and a stronger public-safe proof ledger to case-study evidence drawers while keeping redaction approval boundaries explicit.
- Expanded the notes/build-log surface with required public tags, RSS
  categories, deeper public-safe starter notes, and a new API-offline resilience
  entry explaining the static-first Rust API boundary.
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
- Clarified quality, launch-checklist, and launch-evidence runbooks so launch
  gate wording stays phase-neutral and blocker scope includes operations,
  contact handling, rollback targets, and redaction approvals.
- Scoped Phase 0 CI branch pushes to `main` while keeping pull-request checks
  active, preventing duplicate PR-branch Lighthouse runs for the same commit.
- Added a non-scored Lighthouse warm-up audit before the scored route audits so
  CI cold-start variance does not weaken the strict launch thresholds.
- Added a B-055 cross-browser responsive QA runbook, Playwright `@responsive`
  launch gate, and CI step covering Chromium, Firefox, WebKit, mobile, tablet,
  desktop, and a LinkedIn in-app mobile first-load approximation.
- Expanded the responsive and visual-regression launch gates to include the
  notes index and API-offline note detail surface after notes became part of the
  public evidence trail.
- Added case-study redaction approval packets and a contract test that maps
  guide checklist items to schema fields while preserving the zero-approved
  launch state.
- Updated GitHub sync docs and live repo issue state with the current backlog
  label taxonomy, Phase 0 granular issues B-001 through B-005, and a contract
  test that preserves the Project-scope blocker until interactive auth refresh
  is completed.
- Added native CSS route-continuity hints for browsers with View Transitions
  support, with reduced-motion opt-out and a Playwright `@route-continuity`
  keyboard smoke gate.
- Added a launch-evidence freshness contract that records an embedded PR
  snapshot without converting production blockers into pass evidence.
- Added an opt-in live PR/CI verifier for PR #6 that compares the GitHub PR
  head to the local checkout, requires only the Phase 0 CI frontend/Rust gates,
  and clarified that the embedded launch-evidence row is a point-in-time
  snapshot that can lag the checked-out commit without forcing self-rewriting
  evidence-only commits.
- Refreshed the embedded launch-evidence snapshot row for PR #6 head `ad798c4`
  and CI run `26354144870` while preserving blocked production rows.
- Refreshed the embedded launch-evidence snapshot and final launch checklist PR
  rows for PR #6 head `339afbd` and CI run `26356797852` while preserving
  blocked production rows.
- Aligned the operations local-development runbook with the actual Astro dev
  command because `package.json` does not define a `pnpm dev` script.
- Expanded GitHub sync docs and live repo issue state with Phase 1 granular
  issues B-006 through B-012.
- Expanded GitHub sync docs and live repo issue state with Phase 2 granular
  issues B-013 through B-021.
- Expanded GitHub sync docs and live repo issue state with Phase 3 granular
  issues B-022 through B-030.
- Added a B-037 visual regression gate with desktop/mobile snapshots for home,
  projects, a representative case study, resume, and contact, plus dedicated
  `pnpm test:visual` and `pnpm test:visual:update` commands.
- Added a lightweight Phase 4 implementation-status contract in implementation
  plan/roadmap docs and local PR evidence for B-034 as a desktop-gated
  SVG/HTML project constellation with lazy helper loading and mobile skip
  coverage.
- Added a B-035 purposeful motion gate and CSS-only evidence reveal treatment
  for narrative/artifact surfaces, with reduced-motion and no-JS visibility
  coverage.
- Added Phase 5 granular GitHub issues B-038 through B-047 while preserving the
  Project-board scope blocker and coarse parent epic.
- Added structured JSON startup telemetry for the Rust API standalone and
  Shuttle entrypoints.
- Added stale-safe cached project metadata for `GET /api/projects/live` through
  an injectable provider/cache boundary with refresh-success, refresh-failure,
  and slow-refresh timeout route coverage.
- Added Phase 7 granular GitHub issues B-057 through B-063 while preserving the
  Project-board scope blocker and launch-readiness boundary.
- Added Phase 8 granular GitHub issues B-064 through B-068 while preserving the
  post-launch, assistant-approval, Project-board, and launch-readiness
  boundaries, plus an optional live GitHub issue-sync verifier.
- Broadened the opt-in live GitHub issue-sync verifier to bulk-check the
  documented granular bridge from #7 through #74 while preserving the
  Project-board scope blocker wording in the sync runbook.
- Hardened Phase 0 CI to opt GitHub JavaScript actions into the Node 24 runtime
  and use Node 24-native action majors before GitHub's forced migration.
- Hardened deployment and operations runbooks so frontend/API providers,
  custom domains, contact storage, secret stores, production smoke checks, and
  rollback evidence remain explicit prerequisites for launch.

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
