# HumanKaylee Portfolio Architecture

Date: 2026-05-23
Status: Target architecture for implementation planning
Sources: `docs/PRD.md`, `docs/RESEARCH.md`

## 1. Purpose

HumanKaylee Portfolio is a public technical portfolio that must prove, within
30 seconds, that HumanKaylee can design, build, operate, debug, and explain
sophisticated systems. The site should feel like a polished systems lab: fast
enough for recruiters, deep enough for senior engineers, visually distinctive,
and operationally credible.

This document describes the intended architecture. It does not claim that the
frontend, backend, CI, or hosting resources already exist.

## 2. Architectural Goals

- Static-first public content so the portfolio remains readable when JavaScript,
  WebGL, or the backend API fails.
- Selective interactivity through Astro islands, React, Three.js/React Three
  Fiber, and GSAP where the interaction materially improves the story.
- A small Rust Axum backend that provides visible engineering proof without
  becoming a dependency for reading portfolio content.
- Deployment paths that are inexpensive at launch and can graduate to more
  reliable hosting without redesigning the application.
- Clear operational evidence: health checks, tracing, CI, smoke tests, rollback
  instructions, runbooks, failure modes, and documented secrets.
- Accessibility and performance as first-class constraints, not polish added at
  the end.

## 3. Non-Goals

- No full CMS for launch.
- No authentication for the public site.
- No hard dependency on backend availability for case studies, resume, project
  pages, or contact fallback.
- No generative AI feature that requires secrets in frontend code.
- No home-hosted infrastructure for the primary public site.
- No Awwwards-style visual excess that hides the resume, contact path, or
  project evidence.

## 4. System Context

Primary audiences:

- Recruiters and hiring managers who need a fast signal of fit.
- Senior engineers who need evidence of depth, judgment, and operational skill.
- Collaborators or consulting prospects who need proof that HumanKaylee can ship
  useful systems.
- Technical peers who will inspect architecture, demos, runbooks, and source
  links.

External systems:

- GitHub for source repositories, project metadata, and CI triggers.
- Cloudflare Pages for the recommended static frontend host.
- Fly.io and Railway as the current normal Axum PaaS candidates for the launch
  Rust API, pending provider/project/domain evidence.
- Cloudflare Workers/Pages Functions as an edge rewrite option, and Hetzner as a
  higher-ops VPS fallback.
- Shuttle is not a viable new launch target as of the 2026-05-24 official-source
  snapshot: https://docs.shuttle.dev/docs/shuttle-shutdown
- Email or message delivery provider for contact submissions.
- Optional privacy-safe analytics sink.
- Browser clients across desktop, mobile, low-power devices, reduced-motion
  environments, and no-WebGL environments.

## 5. High-Level Architecture

The system is split into a static-first frontend and an independently deployed
Rust API.

```text
Browser
  |
  | HTTPS
  v
Cloudflare Pages CDN
  |
  | Serves static HTML, CSS, JS, images, OG assets, RSS, sitemap
  v
Astro frontend
  |
  | Optional HTTPS API calls
  v
Rust Axum API
  |
  | Optional integrations
  +--> GitHub metadata cache
  +--> Contact delivery/storage
  +--> Privacy-safe events store
  +--> Logs/traces/metrics backend
```

Important boundary: the frontend owns all core content and navigation. The Rust
API enhances contact, live metadata, privacy-safe events, and operational proof,
but it must not gate the ability to read the portfolio.

## 6. Frontend Architecture

### 6.1 Framework

Use Astro as the primary frontend framework.

Reasons:

- Most pages are content-heavy and should ship static HTML.
- Astro islands allow hydration only where interactivity is needed.
- Content collections are a good fit for case studies, notes, resume data, and
  project metadata.
- MDX can support deep case studies with reusable diagrams, evidence snippets,
  image galleries, and callouts.
- Astro View Transitions can provide page continuity without requiring a full
  SPA model.

React should be used only for interactive islands:

- Project atlas or project constellation.
- Case-study artifact viewer.
- Small motion-heavy UI components that need component state.
- Contact form enhancement when the API is available.

The baseline site should render meaningful HTML before island hydration.

### 6.2 Visual System

Target visual concept: "The Systems Atelier."

Design language:

- Warm off-black backgrounds, aged paper or cream surfaces, tungsten amber,
  signal green, and oxidized blue.
- Editorial serif display type for major statements.
- Condensed grotesk type for system labels and navigation accents.
- Monospace type for evidence snippets, logs, commands, and verification notes.
- Layered atmosphere from grids, topographic contours, command traces, and
  project-node constellations.

Motion principles:

- Motion must communicate structure, not decorate empty space.
- Scroll-linked scenes should be used sparingly on high-value sections.
- Native scrolling should remain reliable; Lenis or other smooth-scroll tooling
  must be optional.
- `prefers-reduced-motion` must disable non-essential animation.
- Mobile should receive a faster editorial timeline instead of a heavy desktop
  3D experience.

### 6.3 Page Types

Core pages:

- Home page with immediate positioning, recruiter card, engineer card, featured
  case studies, resume link, contact CTA, and social links.
- Projects index with accessible filters and optional visual atlas.
- Individual case-study pages.
- HTML resume page plus downloadable PDF.
- Notes or build-log index with RSS feed.
- Contact page or section with API-backed form and mailto fallback.
- "How this site was built" case study after launch.

Supporting generated assets:

- Sitemap.
- Robots.txt.
- RSS feed.
- Open Graph images for core pages.
- JSON-LD for Person and WebSite on launch, plus CreativeWork or
  SoftwareSourceCode on project, case-study, and source-backed software pages.

### 6.4 Content Model

Recommended content collections:

```text
src/content/case-studies/
src/content/projects/
src/content/notes/
src/content/resume/
src/content/site/
```

Case-study fields:

- Title.
- Slug.
- Summary.
- Categories: AI, automation, infrastructure, backend, creative web,
  operations.
- Audience tags: recruiter, engineer, collaborator.
- Problem and stakes.
- Constraints.
- Architecture.
- Implementation proof.
- Testing and verification.
- Operational notes.
- Outcome and impact.
- Lessons learned.
- Links to demo, source, docs, screenshots, or redacted artifacts.
- Redaction notes when sensitive details are intentionally omitted.

Project metadata fields:

- Name.
- Category.
- Short impact statement.
- Status.
- Technologies.
- Featured flag.
- Case-study slug.
- Live demo URL.
- Source URL, if safe.
- Image or poster asset.
- Optional live metadata key used by `/api/projects/live`.

### 6.5 Project Atlas

The Project Atlas is the main optional interactive experience.

Desktop behavior:

- Render a constellation or systems map using React Three Fiber, SVG, or canvas.
- Group project nodes by AI, infrastructure, automation, backend, creative web,
  and operations.
- Let users preview case-study cards from nodes.
- Keep text labels, category filters, and links accessible outside WebGL.

Mobile behavior:

- Use a fast card list or timeline.
- Avoid requiring WebGL.
- Keep tap targets at least 44px.
- Keep resume and contact CTA reachable without opening the atlas.

Fallback behavior:

- If WebGL fails, show a designed poster and the same project list in HTML.
- If JavaScript is disabled, show static links to featured case studies.
- If reduced motion is enabled, skip scroll-linked camera choreography.

### 6.5.1 Signature Proof Components

The launch frontend should include three proof-oriented visual systems:

- `SystemsMapHero`: progressive desktop interaction that visualizes project
  clusters and links to static case-study pages.
- `EvidenceDrawer`: reusable case-study artifact panel for sanitized command
  excerpts, diagrams, rollout matrices, screenshots, or test results.
- `BuildTelemetryStrip`: static-first proof panel showing build/test/accessibility
  status, API health link, and deployment notes.

Each component must render meaningful HTML before hydration. The enhanced visual
state may be more impressive, but it cannot be the only way to access the proof.

### 6.6 Frontend Data Flow

Build-time data:

- Markdown/MDX content collections compile into static pages.
- Site metadata generates SEO tags, sitemap, RSS, and JSON-LD.
- Responsive image assets are optimized at build time where practical.

Runtime data:

- `/api/projects/live` can hydrate fresh project metadata after the page is
  usable.
- `/api/contact` can submit the enhanced contact form.
- `/api/events` can record privacy-safe analytics only if enabled.
- Runtime failures must degrade to cached/static content and mailto fallback.

### 6.7 Performance Architecture

Performance budget:

- Lighthouse Performance target: at least 90 on production core pages.
- Accessibility, Best Practices, and SEO targets: at least 95.
- Initial content must be readable without waiting for 3D assets.
- Hero text, resume CTA, project CTA, and contact CTA must appear before heavy
  visual assets load.

Controls:

- Generate static HTML for core pages.
- Lazy-load Three.js/R3F, GSAP scenes, Rive/Lottie assets, and large media.
- Use poster images for 3D scenes.
- Prefer responsive image formats and compressed media.
- Avoid blocking third-party scripts.
- Run bundle analysis before launch.
- Keep analytics small, optional, and privacy-safe.

### 6.8 Accessibility Architecture

Accessibility requirements:

- Semantic HTML landmarks: header, nav, main, article, aside, footer.
- Logical heading structure.
- Keyboard navigation for menus, filters, atlas equivalents, and contact form.
- WCAG AA color contrast or better.
- Reduced-motion support.
- Alt text for meaningful images.
- Captions or summaries for video and animation.
- Touch targets at least 44px.
- HTML equivalents for visual-only diagrams and WebGL interactions.

## 7. Backend Architecture

### 7.1 Framework

Use Rust Axum on Tokio.

Recommended supporting crates and layers:

- `axum` for routing, extractors, response types, and error handling.
- `tokio` for async runtime.
- `tower-http` for CORS, tracing, response compression for text/JSON assets,
  request body limits, timeout layers, and security-related middleware that
  applies to public HTTP APIs.
- `tracing` and `tracing-subscriber` for structured logs.
- `serde` for request and response models.
- `sqlx` if persistent SQLite/Postgres storage is needed.
- A typed configuration layer sourced from environment variables.

The backend is deliberately small. Its job is to demonstrate production taste
and support visible features, not to turn the portfolio into an application
platform before launch.

### 7.2 Initial API Surface

`GET /api/health`

- Returns service status, version, build SHA if available, uptime, and relevant
  dependency health.
- Used by deploy smoke tests, status surfaces, and manual incident checks.
- Must not leak secrets or internal host details.

`GET /api/projects/live`

- Returns cached GitHub or project metadata used to enhance project cards.
- Should be safe to cache and safe to fail.
- Must not block static project content.
- Should include cache age or fetched-at timestamp.

`POST /api/contact`

- Accepts contact form submissions.
- Validates input length and format.
- Applies rate limiting and spam controls.
- Uses a honeypot field.
- Sends or stores messages through a configured provider.
- Returns a generic success or failure response that does not reveal provider
  internals.

`POST /api/events`

- Records privacy-safe events only if analytics are enabled.
- Must avoid invasive tracking and should document exactly what is collected.
- Should accept only an allowlisted event schema.
- Should be safe to disable entirely.

### 7.3 Backend Route Ownership

Suggested module boundaries:

```text
backend/
  src/
    main.rs              # process startup and listener
    app.rs               # router construction and shared state wiring
    config.rs            # typed env config
    error.rs             # API error model and response mapping
    routes/
      health.rs
      projects.rs
      contact.rs
      events.rs
    services/
      project_metadata.rs
      contact_delivery.rs
      rate_limit.rs
      event_sink.rs
    telemetry.rs
    security.rs
```

Boundary rules:

- Routes parse HTTP inputs and map service results to HTTP responses.
- Services own integration logic and should be testable without an HTTP server.
- Config parsing should fail fast on missing required production secrets.
- Error responses should be typed, consistent, and non-leaky.
- Health checks should be cheap and safe to call frequently.

### 7.4 Backend State and Storage

Launch can avoid durable database complexity unless contact/event storage is
required.

Recommended stages:

1. No database: contact submissions go to a provider, project metadata is
   cached in memory with TTL, and events are disabled.
2. SQLite: simple durable storage for contact audit trail or event counts on a
   host with persistent volume support.
3. Postgres: use when deploy target or reliability requirements justify managed
   persistence.

Storage rules:

- Never store frontend secrets because there should not be any.
- Store only the minimum needed for contact handling and privacy-safe analytics.
- Redact sensitive message contents from logs.
- Add migration tooling if SQLx-backed storage is introduced.

### 7.5 Backend Security

Required controls:

- CORS restricted to production and preview frontend origins.
- Request body size limits.
- Input validation for contact and events.
- Rate limiting for contact and event routes.
- Security headers where applicable.
- No secrets in responses, logs, frontend bundles, or generated static pages.
- Generic error messages for external users.
- Dependency auditing before launch.

Contact-specific controls:

- Honeypot field.
- Server-side validation.
- Per-IP and per-window rate limits, with awareness that CDN/proxy headers need
  careful handling.
- Optional provider-level spam filtering.
- Mailto fallback in the frontend.

## 8. Environment Architecture

Recommended environments:

- Local: developer machine, local frontend dev server, local backend server,
  optional mocked external services.
- Preview: every pull request or branch deployment, using restricted preview
  secrets and non-production API origins.
- Production: custom domain, production secrets, production API origin, stable
  observability and rollback path.

Frontend environment variables:

- Public site URL.
- Public API base URL.
- Public analytics-enabled flag.
- Public build metadata, if needed.

Backend environment variables:

- Rust log level.
- Allowed CORS origins.
- Contact provider API key or SMTP credentials.
- Contact destination address.
- Optional database URL.
- Optional GitHub token for metadata fetching.
- Event collection enabled flag.
- Environment name.
- Release version or commit SHA.

Rules:

- Variables exposed to Astro client code must be explicitly public and must not
  contain secrets.
- Production backend startup should fail on missing required secrets.
- Preview should avoid sending real contact email unless explicitly configured.
- Local development should support safe mock modes.

## 9. Hosting Architecture

### 9.1 Recommended Launch Topology

Frontend: Cloudflare Pages.

Backend: Fly.io or Railway candidate, with final host still blocked.

Reasons:

- Cloudflare Pages is a strong fit for static Astro output, private GitHub repo
  deploys, custom domains, TLS, and CDN delivery.
- Fly.io and Railway keep the current Axum API shape deployable without a runtime
  rewrite.
- Shuttle is not a viable new launch target; keep the feature-gated Shuttle
  binary only as legacy compatibility until removed or replaced.
- The frontend remains useful even if the selected API host is unavailable or
  later replaced.

### 9.2 Fallback and Evolution Options

Cloudflare Pages plus Workers:

- Best for edge glue, redirects, very small APIs, or analytics.
- Rust backend would become edge/Wasm-specific rather than normal Axum.
- Useful if the Axum API is not needed or if edge-native features dominate.

Cloudflare Pages plus Fly.io:

- Better for a reliable containerized Rust API.
- Supports always-on services, regions, and Docker-based deploys.
- Costs more than a purely free launch path.

Cloudflare Pages plus Railway:

- Good developer experience for simple app deploys.
- Can be more expensive under always-on workloads.
- Useful when Railway's cost and operational model fit better than Fly.io or a
  self-managed VPS.

Render:

- Simple Git deploys and TLS.
- Useful if the team wants simple web service hosting.
- Evaluate free/paid behavior before relying on it for a polished backend.

Hetzner VPS:

- Strong low-cost control path for static files plus Rust behind Caddy.
- Requires patching, monitoring, firewalling, backups, and incident ownership.
- Better as an advanced ops proof or fallback, not the lowest-friction launch.
- B-068 comparisons must record the official source URL and snapshot date for
  each candidate before any future host-retention recommendation is drafted.

Home self-hosting plus Cloudflare Tunnel:

- Good for demos and homelab proof.
- Not acceptable as the primary public portfolio dependency.

## 10. CI/CD Architecture

CI should run on pull requests and main branch pushes.

Required frontend checks:

- Install dependencies with the chosen package manager.
- Lint.
- Typecheck.
- Build static site.
- Validate content collection schemas.
- Run unit/component tests if present.
- Run Playwright smoke tests for core pages before launch.
- Run Lighthouse or Lighthouse CI against production or preview for release
  gates where practical.

Required backend checks:

- `cargo fmt --check`.
- `cargo clippy -- -D warnings` or equivalent.
- `cargo test`.
- Integration tests for API routes.
- Docker image build if deploying via container host.
- SQLx migration checks if a database is added.

Deployment stages:

- Pull request creates a frontend preview deploy.
- Backend preview is optional at first; route frontend previews to production API
  only when the API is backward compatible and safe.
- Main branch deploys frontend production after CI passes.
- Backend deploy is separate but coordinated through release notes and smoke
  checks.

Important separation:

- A frontend content update should not require a backend deploy.
- A backend deploy should not invalidate static content.
- API contracts should be backward compatible because stale frontend assets can
  live at CDN edges.

## 11. Observability Architecture

Frontend observability:

- Build metadata embedded in HTML or a small static endpoint.
- Privacy-safe analytics only if enabled and documented.
- Client-side error collection is optional and must be privacy reviewed.
- Lighthouse reports for release quality.
- Cloudflare Pages deployment history for frontend rollout status.

Backend observability:

- Structured logs with request IDs.
- Trace spans around route handling and external provider calls.
- Health endpoint with version and uptime.
- Metrics for request counts, latencies, error rates, rate-limit events, contact
  submission outcomes, and metadata cache freshness.
- Host-level deploy and runtime logs from Shuttle/Fly/Railway/etc.

Dashboards or manual checks should answer:

- Is the frontend deploy serving the expected commit?
- Is the API healthy?
- Are contact submissions succeeding?
- Is metadata stale?
- Are rate limits firing unexpectedly?
- Are users encountering backend failures that require frontend fallback review?

## 12. Failure Isolation

The most important architectural decision is that static content is primary and
runtime services are enhancements.

Expected degradation:

- Backend down: pages still load, case studies still read, resume still
  downloads, contact shows mailto fallback.
- GitHub metadata unavailable: project cards show static metadata.
- Contact provider down: form shows a clear failure and mailto fallback.
- Analytics disabled or failing: user experience is unchanged.
- WebGL unavailable: poster and HTML project list replace atlas.
- JavaScript disabled: core content, links, resume, and contact fallback remain
  available.
- Heavy motion disabled: static layout remains coherent.

## 13. Security and Privacy Architecture

Public frontend:

- No secrets in generated assets or client-exposed environment variables.
- Security headers configured at host level where possible.
- External scripts avoided unless necessary.
- Contact fallback does not expose provider credentials.

Rust API:

- Strict CORS.
- Validation and body limits.
- Rate limiting.
- Redacted logs.
- Dependency updates and audits.
- Generic user-facing errors.
- Separate preview and production secrets.

Content security:

- Case studies must redact sensitive operational details before publication.
- Source links should only point to repositories safe for public inspection.
- Screenshots, logs, and runbook excerpts must remove hostnames, credentials,
  private IPs, tokens, account IDs, and customer/private project details unless
  explicitly safe.

## 14. Data Flow Details

### 14.1 Page Request

1. User requests a page from the custom domain.
2. Cloudflare Pages serves static HTML and assets from the nearest edge.
3. HTML contains the core story, CTAs, and project links.
4. Optional JS islands hydrate after the page is usable.
5. Optional runtime calls fetch live metadata or enable contact form behavior.

### 14.2 Contact Submission

1. User fills contact form.
2. Frontend validates required fields for usability.
3. Frontend sends `POST /api/contact` to the Rust API.
4. API validates again, checks honeypot, applies rate limits, and redacts logs.
5. API sends or stores the message through the configured provider.
6. API returns a generic outcome.
7. Frontend shows success, retry guidance, or mailto fallback.

### 14.3 Project Metadata Refresh

1. Frontend renders static project details from content collections.
2. Optional island calls `GET /api/projects/live`.
3. API returns cached metadata with fetched-at timestamp.
4. UI enhances cards with stars, recent activity, status, or other safe details.
5. If the API fails, static metadata remains visible.

### 14.4 Privacy-Safe Event

1. User performs an allowlisted action, such as opening a case study or clicking
   a resume CTA.
2. Frontend checks whether analytics are enabled.
3. Frontend sends a minimal event to `POST /api/events`.
4. API validates schema and stores or forwards only approved fields.
5. Failures are ignored by the UI.

## 15. API Contract Principles

- Version responses implicitly through additive changes until a versioned route
  is needed.
- Prefer stable JSON shapes.
- Include machine-readable error codes for frontend handling.
- Do not expose stack traces or provider errors.
- Document required fields and maximum lengths.
- Keep health response safe for public access.
- Preserve backward compatibility with older static frontend assets.

Example health response shape:

```json
{
  "status": "ok",
  "service": "humankaylee-portfolio-api",
  "version": "2026.05.23-1",
  "commit": "local-dev",
  "uptime_seconds": 1234,
  "environment": "production"
}
```

Example project metadata response shape:

```json
{
  "fetched_at": "2026-05-23T00:00:00Z",
  "cache_status": "fresh",
  "projects": [
    {
      "key": "cli-fleet-sync",
      "status": "active",
      "stars": 0,
      "last_updated": "2026-05-23T00:00:00Z"
    }
  ]
}
```

## 16. Testing Architecture

Frontend test layers:

- Content schema validation for required case-study fields.
- Unit tests for utility functions.
- Component tests for interactive islands where useful.
- Accessibility checks for generated pages.
- Playwright smoke tests for home, projects, case study, resume, and contact.
- Lighthouse checks for core production pages.

Backend test layers:

- Unit tests for validation, config parsing, service logic, and error mapping.
- Route integration tests using Axum test utilities.
- Contact route tests for valid input, invalid input, honeypot, rate limit, and
  provider failure.
- Health route tests for response shape.
- Project metadata cache tests for stale, fresh, and upstream failure behavior.
- Event route tests for disabled analytics and schema rejection.

Release-level verification:

- Build frontend from a clean checkout.
- Build and test backend from a clean checkout.
- Deploy preview.
- Run smoke tests against preview.
- Deploy production.
- Run smoke tests against production.
- Confirm rollback path before announcing launch.

## 17. Rollback Architecture

Frontend rollback:

- Prefer host-native Cloudflare Pages rollback to a previous deployment.
- Keep static content backward compatible with current backend API.
- Avoid destructive data migrations in frontend deploys because the frontend
  should not own durable state.

Backend rollback:

- Prefer redeploying the previous known-good backend build or container image.
- Keep API changes additive whenever possible.
- If storage is introduced, migrations must be backward compatible or include a
  documented down/restore procedure.
- Frontend fallback must handle backend rollback or outage without breaking core
  content.

Operational principle:

- If in doubt during an incident, prioritize making static content and contact
  fallback reliable before restoring enhanced features.

## 18. Key Risks and Controls

| Risk | Control |
| --- | --- |
| Visual work hides substance | Build case studies and recruiter fast path before ornamental pages. |
| 3D payload hurts performance | Lazy-load 3D, use poster fallback, and keep text in HTML. |
| Motion harms accessibility | Respect reduced motion and provide native-scroll fallback. |
| Backend outage breaks contact | Keep mailto fallback and clear failure copy. |
| Backend outage breaks content | Never require API calls for core portfolio pages. |
| Secrets leak to frontend | Restrict public env vars and audit generated assets. |
| Private project details leak | Redact logs, screenshots, runbooks, hostnames, and credentials. |
| Free API host is unreliable | Keep Fly.io/Railway fallback and static-first frontend. |
| CI is too slow or brittle | Separate frontend/backend checks and gate release-critical checks only. |
| Analytics becomes invasive | Keep events allowlisted, optional, and documented. |

## 19. Open Architecture Decisions

- Final domain name.
- Final resume PDF source content.
- Which existing projects are safe to publish in detail.
- Whether the AI assistant remains a v2 demo.
- Whether launch uses Fly.io, Railway, or another current API host.
- Whether contact submissions should be email-only or stored in a database.
- Whether analytics are disabled at launch or implemented with the Rust API.

## 20. Launch Readiness Criteria

Architecture is ready to support launch when:

- Home, projects, at least four flagship case studies, resume, notes/build log,
  and contact are live.
- Frontend production deployment is configured with custom domain instructions.
- Rust API is deployed with health endpoint, tracing, tests, and deployment
  documentation.
- CI runs frontend lint/typecheck/build, backend fmt/clippy/tests, and smoke
  tests.
- Lighthouse targets are met or exceptions are documented.
- Operations runbook covers local dev, deployments, rollback, secrets,
  observability, content updates, and failure modes.
