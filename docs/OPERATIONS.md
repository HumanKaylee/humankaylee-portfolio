# HumanKaylee Portfolio Operations Runbook

Date: 2026-05-23
Status: Target operations runbook for implementation planning
Sources: `docs/PRD.md`, `docs/RESEARCH.md`, `docs/ARCHITECTURE.md`,
`runbooks/DEPLOYMENT.md`

## 1. Operating Principle

The portfolio must stay useful when optional systems fail. Static pages,
case-study content, resume links, project links, and contact fallback are the
highest-priority production behaviors. The Rust API, live metadata, analytics,
and rich visual experiences enhance the site but must not block the core user
journeys.

During incidents, restore the recruiter fast path first:

1. Home page loads.
2. Resume link works.
3. Featured projects and case studies are readable.
4. Contact fallback works.
5. Enhanced API features recover afterward.

## 2. System Components

Planned components:

- Astro frontend hosted as static output.
- React islands for interactive sections.
- Optional Three.js/React Three Fiber atlas and GSAP scroll scenes.
- Rust Axum API for health, live project metadata, contact, and optional events.
- Cloudflare Pages as recommended frontend host.
- Shuttle Community as recommended launch backend host.
- Fly.io or Railway as reliability fallback for the Rust backend.
- Optional database only if contact audit storage or analytics storage is needed.

Core production URLs should be documented after domain selection:

| Component        | URL                            | Owner       | Notes                                   |
| ---------------- | ------------------------------ | ----------- | --------------------------------------- |
| Public site      | Pending final domain selection | HumanKaylee | Custom domain pending.                  |
| Frontend preview | Pending host setup             | HumanKaylee | Usually Cloudflare Pages branch deploy. |
| API production   | Pending backend host selection | HumanKaylee | Shuttle/Fly/Railway endpoint.           |
| API health       | `/api/health`                  | HumanKaylee | Public, safe, non-secret response.      |
| Source repo      | Pending publication decision   | HumanKaylee | Public or private decision pending.     |

## 3. Environments

### 3.1 Local

Purpose:

- Build content.
- Develop Astro pages and React islands.
- Run Rust API locally.
- Test fallbacks without production services.

Expected behavior:

- Frontend can run with mocked or absent API.
- Contact route can run in mock mode.
- Events can be disabled.
- Local secrets should live in ignored environment files, never committed.

### 3.2 Preview

Purpose:

- Validate pull requests and branch changes.
- Share a deployment before production promotion.
- Run smoke checks against realistic URLs.

Expected behavior:

- Frontend deploys from branch or pull request.
- API preview may be optional at first.
- Preview frontend may use production API only if API contracts are backward
  compatible and the operation is safe.
- Preview contact should not send real messages unless explicitly configured.

### 3.3 Production

Purpose:

- Serve the public portfolio from the final custom domain.
- Use production secrets and production contact destination.
- Maintain stable observability and rollback.

Expected behavior:

- Static frontend is served from CDN.
- API has health checks, structured logs, and release metadata.
- Backend failure does not break static content.
- Production deploys happen only after CI and smoke checks pass.

## 4. Secrets and Configuration

Rules:

- Do not commit secrets.
- Do not expose secrets through Astro public environment variables.
- Do not place provider keys in frontend bundles.
- Redact secrets from logs, screenshots, case studies, and runbook excerpts.
- Use separate preview and production secrets where possible.
- Rotate any secret that may have been exposed before continuing deploy work.

### 4.1 Frontend Configuration

Public frontend variables are safe to expose in generated client assets.

| Variable                   | Secret | Required           | Example purpose                     |
| -------------------------- | ------ | ------------------ | ----------------------------------- |
| `PUBLIC_SITE_URL`          | No     | Yes                | Canonical URL, sitemap, Open Graph. |
| `PUBLIC_API_BASE_URL`      | No     | Yes if API enabled | Runtime API calls.                  |
| `PUBLIC_ANALYTICS_ENABLED` | No     | No                 | Enables privacy-safe event posting. |
| `PUBLIC_RELEASE_VERSION`   | No     | No                 | Display or diagnostics.             |

### 4.2 Backend Configuration

Backend variables may contain secrets and must be configured in the backend host.

| Variable                                | Secret | Required    | Purpose                                                    |
| --------------------------------------- | ------ | ----------- | ---------------------------------------------------------- |
| `HK_API_HOST`                           | No     | No          | Bind host; defaults to `127.0.0.1`.                        |
| `HK_API_PORT`                           | No     | No          | Bind port; defaults to `8787`.                             |
| `HK_API_ALLOWED_ORIGINS`                | No     | Before CORS | Comma-separated frontend origins for future CORS plumbing. |
| `HK_API_CONTACT_DELIVERY_MODE`          | No     | No          | `disabled` by default; `store` is integration-only.        |
| `HK_API_EVENT_LOGGING_ENABLED`          | No     | No          | Enables gated privacy-safe events when set true.           |
| `HK_API_RATE_LIMIT_REQUESTS_PER_MINUTE` | No     | No          | Parsed request-limit setting for future middleware.        |
| `HK_API_CONTACT_RATE_LIMIT_PER_HOUR`    | No     | No          | Parsed contact-limit setting for future middleware.        |
| `HK_API_VERSION`                        | No     | Recommended | Health response version label.                             |
| `RUST_LOG`                              | No     | Recommended | Structured logging verbosity.                              |
| Future provider/database variables      | Yes    | Future only | Add only when durable contact delivery/storage lands.      |

### 4.3 Secret Storage Locations

Use the host-native secret store:

- Cloudflare Pages environment variables for public frontend configuration.
- Shuttle secrets for Shuttle-hosted Rust API.
- Fly.io secrets for Fly.io-hosted Rust API.
- Railway variables for Railway-hosted Rust API.
- VPS systemd environment files or secret manager if self-hosting.

Local files:

- `.env.local` or equivalent for frontend local public values.
- Backend local `.env` only if ignored by git.
- Never commit local env files.

## 5. Local Development Runbook

Expected frontend workflow:

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm preview
```

Expected backend workflow:

```bash
cargo fmt --manifest-path apps/api/Cargo.toml --check
cargo clippy --manifest-path apps/api/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path apps/api/Cargo.toml
cargo run --manifest-path apps/api/Cargo.toml --bin humankaylee-api
```

Local verification checklist:

- Home page renders with the API stopped.
- Project pages and case studies render with JavaScript disabled.
- Reduced-motion mode avoids non-essential animation.
- Contact form shows mailto fallback when API is unavailable.
- `GET /api/health` returns safe status when backend is running.
- Logs do not contain contact secrets or message bodies.

## 6. CI Runbook

CI should run for pull requests and main branch pushes.

### 6.1 Frontend CI

Required checks:

- Dependency install.
- Lint.
- Typecheck.
- Content schema validation.
- Static build.
- Unit or component tests, if present.
- Playwright smoke tests for critical routes before launch.
- Lighthouse or Lighthouse CI for release gates where practical.

Critical routes:

- `/`
- `/projects`
- At least one flagship case study.
- `/resume` or equivalent.
- Contact page or contact section.

### 6.2 Backend CI

Required checks:

- `cargo fmt --check`.
- `cargo clippy -- -D warnings`.
- `cargo test`.
- API route integration tests.
- Docker image build if deploying to a container platform.
- SQLx migration checks if a database is introduced.

Critical route tests:

- `GET /api/health` returns expected shape.
- `GET /api/projects/live` handles fresh cache, stale cache, and upstream
  failure.
- `POST /api/contact` handles valid input, invalid input, honeypot, oversized
  payloads, disabled mode, and safe acceptance without echoing private text.
  Stateful rate limiting and provider/storage failure tests remain blocked until
  durable delivery/storage middleware exists.
- `POST /api/events` rejects unknown event types and behaves safely when
  disabled.

### 6.3 CI Release Gates

Do not promote to production if:

- Static build fails.
- Backend tests fail.
- Contact form has no fallback.
- Secrets are required but absent.
- Lighthouse Accessibility is below the PRD target without a documented
  exception.
- Smoke checks fail on the release candidate.

## 7. Deployment Runbook

Use `runbooks/DEPLOYMENT.md` as the exact Phase 8 deployment command source.
This section keeps the operator-level summary and incident context.

### 7.1 Frontend: Cloudflare Pages

Recommended production path:

1. Connect the repository to Cloudflare Pages.
2. Configure the build command for Astro.
3. Configure the output directory for Astro static output.
4. Set public environment variables.
5. Enable preview deployments for branches or pull requests.
6. Configure the custom domain after final domain selection.
7. Configure redirects, headers, and caching rules as needed.
8. Deploy from main after CI passes.
9. Run production smoke checks.

Expected smoke checks are maintained in `runbooks/DEPLOYMENT.md`. Current
minimum checks:

```bash
xh -h "$FRONTEND_ORIGIN/"
xh -h "$FRONTEND_ORIGIN/sitemap-index.xml"
xh -h "$FRONTEND_ORIGIN/robots.txt"
xh -h "$FRONTEND_ORIGIN/rss.xml"
```

Browser checks:

- Home page readable before 3D loads.
- Resume CTA works.
- Project CTA works.
- Contact fallback is visible.
- Open Graph preview assets resolve.
- Reduced-motion mode remains usable.

### 7.2 Backend: Shuttle Community

Recommended launch path:

1. Create the Shuttle project for the Rust API.
2. Configure required secrets.
3. Deploy the API.
4. Confirm `GET /api/health`.
5. Configure frontend `PUBLIC_API_BASE_URL`.
6. Redeploy frontend if the API base URL changed.
7. Run contact and metadata smoke checks.

Expected smoke checks are maintained in `runbooks/DEPLOYMENT.md`. Current
minimum checks:

```bash
xh "$API_ORIGIN/api/health"
xh "$API_ORIGIN/api/projects/live"
```

Contact smoke check:

- Use a non-production test destination in preview.
- In production, send a clearly labeled test message only after rate limits and
  provider configuration are confirmed.
- Confirm no secret or message body is written to logs.

### 7.3 Backend Fallback: Fly.io

Use Fly.io when:

- Shuttle reliability or resource limits are insufficient.
- Always-on behavior is required.
- Container deployment is preferred.

Required preparation:

- Dockerfile for the Rust API.
- `fly.toml` with region and service settings.
- Fly.io secrets configured.
- Health check path set to `/api/health`.
- Logs and deploy history verified.

Promotion steps:

1. Deploy API to Fly.io.
2. Smoke-test `/api/health`, `/api/projects/live`, and contact behavior.
3. Update frontend API base URL.
4. Redeploy frontend.
5. Keep previous backend available until frontend CDN caches have aged out or
   the new API is confirmed stable.

### 7.4 Backend Fallback: Railway

Use Railway when:

- Simple Git-based deploys are more valuable than container control.
- Costs are acceptable for the expected always-on workload.

Required preparation:

- Configure service build and start command.
- Configure secrets.
- Configure health checks if available.
- Confirm logs and deploy rollback behavior.

### 7.5 Advanced Option: Hetzner VPS

Use a VPS only if the project deliberately wants to show self-hosting or needs
more control.

Required operational responsibilities:

- OS patching.
- Firewall.
- SSH hardening.
- Caddy or Nginx TLS termination.
- Systemd service for Rust API.
- Backups if a database is present.
- Log rotation.
- Host monitoring.
- Documented rollback.

This is not the preferred launch path because the PRD explicitly avoids making
the primary site depend on self-managed infrastructure.

## 8. Post-Deploy Verification

Run after every production deployment.

Frontend:

- Home page returns `200`.
- Case-study page returns `200`.
- Resume page or PDF returns `200`.
- Sitemap and robots return `200`.
- OG image returns `200`.
- No obvious console errors on home and one case-study page.
- JavaScript-disabled view still exposes core content.
- Reduced-motion view is usable.

Backend:

- `GET /api/health` returns `status: ok`.
- Response includes expected version or commit.
- `GET /api/projects/live` returns static-safe metadata or a controlled stale
  response.
- Contact test succeeds or fallback is confirmed.
- Logs show request IDs and no secrets.

Quality:

- Lighthouse targets meet PRD goals or exceptions are documented.
- Accessibility scan has no launch-blocking issues.
- Mobile layout exposes resume, projects, and contact without visual breakage.

## 9. Observability Runbook

### 9.1 Frontend Signals

Track:

- Cloudflare Pages deployment status.
- Build duration and failures.
- Production commit or release version.
- Lighthouse reports.
- Optional privacy-safe events, if enabled.
- Broken links from smoke tests or crawler checks.

Useful questions:

- Is production serving the intended commit?
- Are core pages returning 200?
- Are assets loading from the CDN?
- Did a content update break sitemap, RSS, or OG metadata?
- Are users able to reach resume and contact?

### 9.2 Backend Signals

Track:

- Request count.
- Error rate.
- Latency.
- Health status.
- Uptime.
- Contact submission success/failure.
- Rate-limit triggers.
- Project metadata cache age.
- Provider failures.

Logging requirements:

- Use structured logs.
- Include request ID or trace ID.
- Include route, method, status, and latency.
- Redact message bodies and secrets.
- Avoid logging full IP addresses if analytics/privacy policy does not justify
  them.

Alert candidates:

- API health fails for more than a short grace window.
- Contact provider errors exceed threshold.
- Metadata cache is stale beyond expected TTL.
- 5xx rate increases.
- Rate-limit events spike unexpectedly.

## 10. Incident Response

### 10.1 Severity Levels

Sev 1:

- Public site unavailable.
- Resume unavailable.
- Core case studies unavailable.
- DNS or TLS broken.

Sev 2:

- Rust API unavailable.
- Contact form unavailable but mailto fallback works.
- Major visual regression on desktop or mobile.
- Lighthouse/accessibility regression on core pages.

Sev 3:

- Live metadata stale.
- Analytics disabled.
- Non-critical animation broken.
- One non-core note or artifact broken.

### 10.2 General Incident Steps

1. Confirm the user-visible failure from a clean browser or command line.
2. Identify whether the failure is frontend, backend, DNS/TLS, external
   provider, or content-related.
3. Restore the static recruiter fast path first.
4. Roll back the most recent frontend or backend deploy if the failure correlates
   with a release.
5. Disable optional enhancements if they are causing the issue.
6. Verify home, resume, projects, and contact fallback.
7. Record the incident cause and follow-up actions.

### 10.3 Static Site Down

Checks:

```bash
xh -h https://example.com/
xh -h https://example.com/resume
xh -h https://example.com/sitemap.xml
```

Likely causes:

- Cloudflare Pages deploy failed.
- DNS misconfiguration.
- Custom domain/TLS issue.
- Bad redirect/header config.
- Broken build output.

Recovery:

- Roll back to previous Cloudflare Pages deployment.
- Disable new redirect/header rule if recently changed.
- Revert the content or build change that broke static generation.
- Confirm core pages and resume are restored.

### 10.4 API Down

Checks:

```bash
xh https://api.example.com/api/health
xh https://api.example.com/api/projects/live
```

Likely causes:

- Backend host outage.
- Bad deploy.
- Missing secret.
- CORS misconfiguration.
- Runtime panic or failed startup.
- Provider dependency timeout.

Recovery:

- Confirm frontend still serves static content.
- Roll back backend to previous known-good deploy.
- If startup fails on missing secrets, restore required secret values in host
  config.
- If provider integration is failing, disable the dependent feature or route it
  to fallback behavior.
- If Shuttle is unstable, move API to Fly.io or Railway and update frontend API
  base URL.

### 10.5 Contact Form Failing

Checks:

- Submit a test message from production.
- Inspect API logs for validation, rate-limit, or provider errors.
- Confirm mailto fallback is visible.
- Confirm `HK_API_ALLOWED_ORIGINS` includes the production frontend origin once
  CORS middleware is enabled.

Likely causes:

- Provider key invalid or expired.
- Sender identity not verified.
- CORS misconfiguration.
- Rate limiter too strict.
- Request body validation mismatch between frontend and backend.
- Provider outage.

Recovery:

- Keep mailto fallback visible.
- Fix provider credentials or sender verification.
- Adjust CORS origin.
- Loosen incorrect rate-limit settings only after confirming abuse is not active.
- Roll back frontend/backend contract mismatch.

### 10.6 Project Metadata Stale

Checks:

- Inspect `/api/projects/live`.
- Check cache timestamp.
- Check GitHub provider response or rate limits.
- Confirm static project cards remain correct.

Likely causes:

- GitHub token absent or rate-limited.
- Cache refresh task failed.
- Upstream repository renamed or made private.
- API deploy disabled metadata feature.

Recovery:

- Accept stale metadata if static content is accurate.
- Refresh token or reduce refresh frequency.
- Update project metadata keys.
- Disable live metadata enhancement until stable.

### 10.7 WebGL or Motion Regression

Checks:

- Test desktop capable browser.
- Test mobile browser.
- Test reduced-motion mode.
- Test no-JavaScript or blocked-WebGL fallback.

Likely causes:

- Three.js/R3F bundle regression.
- Asset path issue.
- Browser compatibility problem.
- Smooth-scroll conflict.
- Scene blocks main content.

Recovery:

- Disable the interactive island.
- Serve poster fallback.
- Remove or disable smooth-scroll integration.
- Roll back the visual deploy.
- Keep static project list visible.

## 11. Rollback Runbook

Use `runbooks/DEPLOYMENT.md` for exact provider rollback commands and current
provider behavior. This section captures rollback triggers and the generic
decision flow.

### 11.1 Frontend Rollback

Preferred path:

1. Open Cloudflare Pages deployment history.
2. Select the last known-good production deployment.
3. Roll back to it according to Cloudflare Pages workflow.
4. Smoke-test home, projects, resume, sitemap, and contact fallback.
5. Confirm Open Graph assets still resolve.

Cloudflare Pages rollback only targets successful production deployments; use
deployment-list commands in `runbooks/DEPLOYMENT.md` to record deployment IDs.
Preview deployments are not rollback targets.

Rollback triggers:

- Static build deployed but core page is broken.
- Resume/contact CTA missing.
- Severe accessibility regression.
- JavaScript bundle breaks navigation.
- Visual code blocks first meaningful content.

### 11.2 Backend Rollback

Preferred path:

1. Identify the last known-good backend release.
2. Redeploy that release through Shuttle, Fly.io, Railway, or the chosen host
   using `runbooks/DEPLOYMENT.md`.
3. Confirm required secrets are still present.
4. Smoke-test `/api/health`.
5. Smoke-test contact and project metadata.
6. Watch logs for errors.

Rollback triggers:

- API fails startup.
- Health endpoint fails.
- Contact route fails.
- CORS blocks production frontend.
- Error rate spikes after deploy.
- API response contract breaks deployed frontend assets.

### 11.3 Database Rollback

Avoid database-dependent launch features unless necessary.

If a database exists:

- Prefer backward-compatible migrations.
- Back up before production migration.
- Document migration version per release.
- Do not roll back application code across incompatible schema changes without a
  restore or compatibility plan.
- Treat destructive migrations as launch blockers unless there is a tested
  recovery path.

## 12. Content Operations

### 12.1 Adding a Case Study

Checklist:

- Confirm the project is safe to publish.
- Redact secrets, hostnames, private IPs, customer data, account IDs, and
  sensitive logs.
- Include problem, stakes, constraints, architecture, implementation proof,
  testing, operations, outcome, and lessons.
- Add or update project metadata.
- Add images with alt text.
- Add Open Graph metadata.
- Validate links.
- Run build and smoke checks.

### 12.2 Updating Resume

Checklist:

- Update HTML resume content.
- Replace or regenerate resume PDF.
- Confirm PDF link works.
- Confirm print layout.
- Confirm structured data still matches public facts.
- Confirm Open Graph and recruiter card are current.

### 12.3 Publishing Notes or Build Logs

Checklist:

- Confirm no sensitive operational data is exposed.
- Add title, summary, date, tags, and canonical slug.
- Confirm RSS feed includes the entry.
- Confirm internal links and images.
- Run build.

## 13. Security Operations

Routine checks:

- Audit dependencies before launch and periodically after.
- Rotate provider tokens if exposed or no longer needed.
- Review generated frontend assets for accidental secrets.
- Verify CORS origins after domain changes.
- Review security headers after host changes.
- Confirm contact rate limiting after deploy.
- Keep sensitive case-study artifacts redacted.

Security incident steps:

1. Remove exposed secret from host and rotate it.
2. Remove exposed content from the site.
3. Purge CDN cache if needed.
4. Invalidate or replace affected provider credentials.
5. Review logs for use of the exposed secret.
6. Document the incident and prevention step.

## 14. Backup and Data Retention

If no database is used:

- Source repo and host deployment history are the primary recovery assets.
- Contact provider retains messages according to provider policy.
- No event data is retained locally.

If SQLite or Postgres is used:

- Define retention for contact records and events.
- Back up before migrations.
- Store backups outside the runtime instance.
- Test restore before relying on backups.
- Do not retain personal data longer than needed.

Privacy-safe analytics:

- Collect only allowlisted events.
- Avoid persistent user identifiers unless explicitly justified.
- Document event names and fields.
- Provide a simple way to disable event collection.

## 15. Failure Mode Matrix

| Failure                         | User impact                                       | Detection                  | Recovery                                      |
| ------------------------------- | ------------------------------------------------- | -------------------------- | --------------------------------------------- |
| Cloudflare Pages deploy fails   | New release blocked; old site likely remains live | Deploy status, CI          | Fix build, redeploy.                          |
| Bad frontend deploy             | Pages broken or visual regression                 | Smoke tests, browser check | Roll back Pages deployment.                   |
| DNS/TLS failure                 | Site unreachable or certificate warning           | Browser, `xh -h`           | Fix DNS/TLS, verify custom domain.            |
| API host down                   | Live metadata/contact API unavailable             | Health check               | Keep static site live, roll back or move API. |
| Missing backend secret          | API startup or provider call fails                | Logs, health check         | Restore secret and redeploy/restart.          |
| CORS misconfigured              | Browser API calls fail                            | Browser console, logs      | Update `HK_API_ALLOWED_ORIGINS`.              |
| Contact provider down           | Contact form fails                                | Contact test, logs         | Show mailto fallback, retry later.            |
| Rate limit too strict           | Legitimate contact blocked                        | Logs, support report       | Adjust thresholds, redeploy.                  |
| GitHub API rate-limited         | Live metadata stale                               | Cache age, logs            | Use token, reduce refresh, static fallback.   |
| WebGL unsupported               | Atlas unavailable                                 | Browser testing            | Poster and HTML project list.                 |
| JS disabled                     | Interactive features unavailable                  | Manual test                | Static content remains available.             |
| Motion accessibility issue      | Users uncomfortable or blocked                    | QA, accessibility check    | Respect reduced motion, disable scene.        |
| Secret exposed in content       | Security/privacy incident                         | Review, report             | Remove, purge, rotate, document.              |
| Case study leaks private detail | Reputational/security risk                        | Review, report             | Remove, redact, purge cache.                  |
| Database migration fails        | API feature broken                                | CI/deploy logs             | Restore backup or roll back compatible app.   |

## 16. Launch Checklist

Content:

- Home page complete.
- Projects index complete.
- At least four flagship case studies complete.
- Resume HTML and PDF complete.
- Notes or build-log section present.
- Contact path present with fallback.
- Sensitive details redacted.

Frontend:

- Static build passes.
- Core content works without JavaScript.
- Reduced-motion mode works.
- WebGL fallback works.
- Responsive mobile layout passes review.
- Lighthouse targets met or exceptions documented.
- Sitemap, robots, RSS, canonical URLs, and Open Graph assets exist.

Backend:

- Axum API deployed.
- `/api/health` returns version and uptime.
- `/api/projects/live` has safe stale/failure behavior.
- `/api/contact` validates input, rejects honeypot and oversized payloads, and
  stays disabled in production until durable delivery/storage is configured.
- `/api/events` disabled or privacy-reviewed.
- Structured tracing/logging enabled.
- Integration tests pass.

CI/CD:

- Frontend lint/typecheck/build runs.
- Backend fmt/clippy/tests runs.
- Playwright smoke tests run.
- Deployment instructions are reproducible.
- Rollback path verified.

Operations:

- Production URLs documented.
- Secrets configured in host-native stores.
- Observability checks documented.
- Incident response steps documented.
- Fallback hosting options documented.

## 17. Routine Maintenance

Weekly during active build:

- Review CI failures.
- Check dependency update noise.
- Validate key links.
- Confirm production home and resume still load.
- Review open decisions.

Monthly after launch:

- Run dependency audit.
- Re-run Lighthouse on core pages.
- Verify contact form and fallback.
- Check API health and logs.
- Review analytics/event collection if enabled.
- Confirm backups if storage exists.
- Refresh case-study links and screenshots if stale.

After major content or architecture changes:

- Re-run launch checklist sections affected by the change.
- Update architecture and operations docs.
- Confirm no private details were introduced.

## 18. Open Operational Decisions

- Final domain name.
- Final hosting provider for Rust API at launch.
- Contact provider.
- Whether contact submissions are email-only or stored.
- Whether privacy-safe events launch in v1.
- Final package manager and exact local commands.
- Final CI provider and workflow names.
- Final observability backend, if any beyond host logs.

## 19. Minimum Viable Production Standard

The site is production-ready only when a clean operator can:

- Build the frontend from source.
- Build and test the backend from source.
- Deploy frontend and backend using documented steps.
- Verify production health using documented smoke checks.
- Roll back frontend and backend independently.
- Confirm secrets are stored outside the repo.
- Confirm static content still works when the API is unavailable.
- Explain known failure modes and recovery paths from this runbook.

## 20. Required Evidence Files

The implementation must create these runbook artifacts before launch:

- `runbooks/PREFLIGHT.md`: local versions, GitHub auth account, repo remote, package manager, Rust toolchain, and missing-tool notes.
- `runbooks/DEPLOYMENT.md`: exact provider commands, provider CLI version
  checks, environment variable names, domain/DNS/TLS/cache guidance, smoke
  checks, fallback host steps, and rollback steps.
- `runbooks/LAUNCH_EVIDENCE.md`: final verification matrix with command, date, target URL, result, and artifact path.
- `docs/CONTENT_REDACTION_GUIDE.md`: public-safety checklist used by every case study.

Launch is blocked if any required evidence file contains `pending`, `unknown`, empty result fields, secrets, private hostnames, or private access paths.
