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

### A contact API is not production delivery by itself

The Rust route can validate, reject honeypots, enforce request-size limits, and return structured errors, but production enablement still needs durable delivery or storage plus stateful rate limiting and CORS middleware. Until then, the mailto fallback remains the reliable contact path and the enhanced API should stay disabled outside controlled integration checks.

### Deployment runbooks must mirror implemented environment names

Provider docs often use generic variables, but this API currently reads `HK_API_*` names. Runbooks should name the variables the binary actually parses, otherwise a deployment can appear configured while the process silently falls back to defaults.

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
