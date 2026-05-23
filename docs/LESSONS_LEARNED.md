# Lessons Learned

Date: 2026-05-23
Sources: `docs/RESEARCH.md`, `docs/PRD.md`

## Planning Lessons

### Substance has to lead the visual system

The portfolio can use cinematic motion, 3D, and an art-directed "Systems Atelier" identity, but the research and PRD both make the same point: visual impact only works if the underlying case studies prove real engineering judgment. The site should show evidence, outcomes, architecture, tests, tradeoffs, and operational maturity before it spends user attention on ornamental effects.

### Static-first is the safest default

Astro, content collections, and progressive islands fit the portfolio better than a fully dynamic application. Recruiters, hiring managers, and senior engineers need fast access to HTML content, project links, resume details, and contact paths. WebGL, React islands, and backend-powered features should enhance the experience without becoming prerequisites for understanding the work.

### The first 30 seconds matter

The primary product goal is to make a reviewer believe quickly that HumanKaylee can design, build, operate, debug, and explain sophisticated systems. That means the home page needs a readable positioning statement, recruiter fast path, project CTA, resume CTA, and contact CTA before delayed animation or 3D assets load.

### Recruiters and senior engineers need different paths

Recruiters need role fit, skills, resume, strongest projects, and contact information with minimal friction. Senior engineers need constraints, architecture diagrams, implementation proof, tests, operations notes, source links, demos, and runbook evidence. The content model should serve both paths instead of forcing every visitor through the same animated journey.

### Case studies are the core product

The research recommends 4 to 6 deep case studies; the PRD requires at least 4 before launch. Each flagship case study needs problem, constraints, architecture, implementation proof, verification, operational outcome, and lessons learned. Thin project cards are not enough for the intended audience.

### Motion must be purposeful and optional

Scroll-linked systems maps, artifact reveals, and page transitions can create a memorable signature, but they must respect `prefers-reduced-motion`, preserve keyboard navigation, and avoid breaking native scroll. Reduced-motion and no-WebGL modes are launch requirements, not polish tasks.

### The Rust backend must prove capability without creating fragility

The Rust Axum API should power visible features such as contact, health, live project metadata, and optional privacy-safe events. Static portfolio content must remain useful if the API is down. This keeps the backend as proof of engineering depth instead of a reliability dependency for basic reading.

### Redaction is part of the content workflow

The initial content candidates include local runbooks, operational debugging, agentic workflows, analytics tooling, and AI/video pipelines. These can be strong proof, but only if sensitive hostnames, secrets, client data, private repo details, logs, and security-relevant operational specifics are removed or generalized before publication.

### Hosting should optimize reliability and cost

Cloudflare Pages is the recommended frontend baseline because it supports fast static delivery and private repository deploys. Shuttle Community is a good initial Rust API host, with Fly.io, Railway, or a VPS as fallback options if reliability, uptime, or control become more important.

### The launch bar includes operations and documentation

Launch is not just visual completion. The PRD requires deployable frontend and backend paths, CI checks, Lighthouse targets, resume and metadata, smoke tests, README/runbook coverage, rollback instructions, and documented content update workflow.

## Decisions To Preserve

- Use the "Systems Atelier" visual direction: high-end technical studio, mission-control evidence, cinematic but readable.
- Avoid generic purple AI/SaaS styling and default typography choices.
- Build around Astro, TypeScript, content collections, React islands, and selective Three.js/React Three Fiber usage.
- Keep the primary content available as static HTML.
- Treat 3D, motion, and live metadata as progressive enhancements.
- Publish 4 to 6 flagship case studies before launch.
- Include a visible recruiter path and a deeper engineer path.
- Make backend failure non-blocking for the portfolio.
- Make privacy-safe redaction a required review step for every published artifact.

## Implementation Lessons

### Parallel lanes need explicit test ownership

Phase 3 route work split cleanly when each worker owned a route family and its own e2e spec: notes/RSS, case-study routes, and metadata/crawler artifacts. Shared preview-server tests should run sequentially during final integration because Playwright's fixed port can collide when multiple agents run e2e checks at the same time.

### Route scaffolding can advance before redaction approval

Case-study pages can safely render reviewed public-safe outlines without marking them launch-approved. The content model should keep `publicationStatus` separate from `redactionStatus` so route infrastructure, navigation, metadata, and no-JS behavior can mature while the final evidence checklist remains a hard launch gate.

### Dev-server markup is not a privacy evidence source

Astro's development server injects source-file attributes, local paths, font module URLs, and dev-toolbar scripts into `page.content()`. Privacy tests should scan generated build artifacts or user-visible text plus public link/meta attributes, not raw dev-server HTML.

### The atlas fallback is the durable contract

The project atlas should start as keyboard-reachable HTML with category filters and stable links. WebGL or scroll-linked motion can enhance that model later, but the static atlas is the accessibility, no-JS, and reduced-motion source of truth.

### API enhancement copy must preserve static route markers

The contact page can evolve from a static placeholder to an API-enhanced form, but shared route-quality tests still rely on visible static-first markers such as "mailto fallback." Preserve those public markers when replacing placeholder copy so no-JS, reduced-motion, and route-coverage contracts continue to validate the actual user fallback.

### A hardened contact API is not production delivery by itself

The Rust route can validate, reject honeypots, enforce request-size limits, rate-limit repeat submissions, apply CORS, and return structured errors, but production enablement still needs durable delivery or storage. Until then, the mailto fallback remains the reliable contact path and the enhanced API should stay disabled outside controlled integration checks.

### Store mode needs an explicit persistence contract

Accepting contact messages without a configured store path creates false confidence. `store` mode should fail safely until `HK_API_CONTACT_STORE_PATH` points at an approved persistent location, and launch evidence should separately record retention, backup, rotation, and deletion decisions.

### Replace blocker tests when the blocker is removed

The route-coverage suite correctly encoded project detail pages as a 404 blocker while they did not exist. Once static project detail pages shipped, the integration work had to replace that stale negative test with positive detail-route coverage and update project-card links to the new static routes.

### Deployment runbooks must mirror implemented environment names

Provider docs often use generic variables, but this API currently reads `HK_API_*` names. Runbooks should name the variables the binary actually parses, otherwise a deployment can appear configured while the process silently falls back to defaults.

### Privacy docs should describe current defaults, not launch intent

The privacy writeup needs to say exactly what ships now: static pages, a resume PDF asset, a contact route with validation plus mailto fallback, and events disabled by default. If a provider or storage path does not exist yet, the doc should say so plainly instead of implying a retention or analytics story that is not implemented.

### Launch evidence must separate PR checks from production readiness

Passing PR CI is useful evidence, but it is not a production launch signal by itself. The launch runbook should keep PR checks, local final verification, production smoke checks, provider deployment IDs, rollback targets, redaction approvals, and contact-delivery status in separate rows so blocked or not-run production work cannot be mistaken for launch readiness.

### Deployment binaries should preserve local operability

The API should keep its standalone Axum binary for local smoke tests and
container fallback while adding provider-specific entrypoints behind feature
flags. The Shuttle binary can reuse the same router and `HK_API_*` parser
without binding its own listener, which keeps deployment proof from changing the
local development contract.

### Container proof needs start and stop evidence

Building a Docker image is not enough for deployment readiness. A portfolio API
container also needs a health smoke check and a clean stop path, because PID 1
signal behavior can otherwise hide until Fly.io, Railway, or another container
host tries to terminate the service.

### Reviewed content is not launch-approved content

Case-study route scaffolding can use reviewed outlines, but the redaction guide
keeps `reviewed` separate from `approved`. A partial review, placeholder body,
or sanitized label is useful progress, not launch evidence; approval needs a
completed checklist plus public-safe artifacts for each case study.

### Operations stories should publish reasoning, not access procedure

The remote workstation recovery case study is strongest when it shows the
diagnostic order: reachability, role-local state, session inventory, viewer
behavior, smallest recovery action, and verification. The public body should
keep role labels and summarized evidence while omitting private hostnames,
access paths, raw logs, exact command sequences, and account-specific details.

### Static spectacle can still be semantic

The first visual upgrade does not need WebGL to improve the portfolio. A
static systems-map poster can deliver the signature "atelier" moment, link to
real project routes, and remain visible in no-JS contexts while the heavier
constellation stays optional.

### Visual polish needs executable surface contracts

Art direction is easier to preserve when it has measurable, non-pixel-perfect
checks. The `@visual-surfaces` gate verifies deliberate surface treatments,
mobile overflow safety, and touch-target floors across representative routes
without turning design review into brittle screenshot diffs.

### Case-study bodies must be rendered, not just stored

Frontmatter-driven sections are useful for consistent evidence drawers, but the
long-form case-study narrative needs Markdown body rendering. Otherwise
placeholder replacement can look complete in source while the public page still
lacks the deeper architecture, verification, and operator-checklist story.

### Meta case studies still need evidence boundaries

The portfolio-build story is safer than private operations work, but it can
still overclaim if local tests are presented as production proof. Keep local,
PR, and production evidence in separate lanes, and leave redaction at
`reviewed` until real provider/domain/rollback artifacts exist.

### Creative demos need scope gates before spectacle

The creative web systems atlas story can raise the visual bar without implying
that WebGL is already implemented. Treat the semantic atlas fallback and static
systems-map poster as the current proof, then require a separate scope approval
before building any heavier interactive layer.

### QA tags should match launch gates

The plan's cross-phase matrix named keyboard and accessibility checks, but CI
only had a broad E2E job. Tagging existing Playwright coverage with
`@keyboard` and `@accessibility` gives operators precise commands and gives CI a
clearer failure signal without weakening the umbrella test run.

### Static security headers need dual enforcement

Static-host header files are the production contract, but local verification
needs a response-level mechanism too. Mirroring the same policy through Astro
middleware lets Playwright catch missing Content Security Policy, frame denial,
MIME sniffing, referrer, cross-origin, and permissions headers before provider
deployment exists.

## Risks To Revisit During Implementation

| Risk                                                    | Control                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------- |
| The site looks impressive but does not prove capability | Write the flagship case studies before over-investing in ornamental pages |
| 3D or animation harms performance                       | Lazy-load heavy scenes, provide poster fallbacks, and keep text in HTML   |
| Recruiters miss the strongest story                     | Keep resume, top skills, top projects, and contact visible early          |
| Published artifacts expose sensitive details            | Run a redaction checklist before any case study ships                     |
| Rust API adds avoidable downtime                        | Keep core content static and document API fallback behavior               |
| Content scope becomes too broad                         | Launch with 4 strong case studies instead of many shallow entries         |

## Open Review Questions

- Which existing projects are safe to publish in detail?
- Which project should be the primary recruiter-facing proof point?
- Which project should be the deepest senior-engineer proof point?
- Should an AI assistant remain v2 until the core case studies are strong?
- Is Shuttle Community acceptable for launch, or should the API start on a more reliable paid host?
