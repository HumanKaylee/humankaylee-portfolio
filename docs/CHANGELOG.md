# Changelog

All notable portfolio project changes should be documented here.

This project uses a planning-first changelog during pre-launch work. Entries should separate shipped user-facing changes from planning decisions, content changes, and operational changes.

## [Unreleased]

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
- Final resume PDF source.
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
