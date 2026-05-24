# Phase 8 Deployment Runbook

Date: 2026-05-23
Status: Phase 8 operations draft; production domains and provider accounts are
not yet selected. Production launch and rollback remain blocked / not run.

This runbook covers the static Astro frontend and Rust Axum API. It is written
so another operator can deploy without private context. Replace placeholder
domains and provider project names only after they are selected.

This is a deployment and rollback contract, not a launch-readiness claim.
Before any future `/goal` launch step can close, record the selected frontend
provider, API provider, custom domain, contact handling mode, secret storage
location, and rollback targets in `runbooks/LAUNCH_EVIDENCE.md`. Use
`runbooks/LAUNCH_BLOCKERS_REGISTER.md` as the decision register for unresolved
launch choices. Use the Phase 7 Deployment Decision Packets in
`runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md` to prepare #63, #64, #65,
and #69 evidence without claiming production deployment or launch readiness.

## 1.1 Required Launch Decisions

Do not treat production as ready until these choices are explicit:

- Frontend provider, frontend project, and final custom domain.
- API provider, API project, and final public API origin.
- API host decision.
- Contact handling mode: disabled, approved persistent store, or approved
  alternate provider.
- Secret storage location for each provider.
- Frontend and API rollback targets for the intended deployment IDs.
- Production smoke-check URLs and the evidence rows that will capture them.

Current API hosting note: Shuttle is not a viable new launch target as of the
2026-05-24 official-source snapshot:
https://docs.shuttle.dev/docs/shuttle-shutdown. Fly.io, Railway, or another
approved host are the approved current-host comparison set for #64; Cloudflare
Workers/Pages Functions require an edge/runtime rewrite, and Hetzner is a
higher-ops VPS fallback.

## 1. Provider Command Evidence

Installed CLI check from the repo root on 2026-05-23:

| CLI                 | Check command                                         | Result                                                                    |
| ------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| Cloudflare Wrangler | `command -v wrangler && wrangler --version`           | Not installed on PATH. Use `pnpm exec wrangler` or install before deploy. |
| Shuttle CLI         | `command -v shuttle && shuttle --version`             | Not installed on PATH. Install/authenticate before Shuttle deploy.        |
| Cargo Shuttle alias | `command -v cargo-shuttle && cargo shuttle --version` | Not installed on PATH. Current Shuttle docs prefer `shuttle`.             |
| Fly.io CLI          | `command -v fly && fly version`                       | Not installed on PATH. Install/authenticate before Fly fallback.          |
| Railway CLI         | `command -v railway && railway --version`             | Not installed on PATH. Install/authenticate before Railway fallback.      |
| Markdown linter     | `command -v markdownlint ...`                         | Not installed on PATH. Use privacy scan and syntax checks for this draft. |

Official command sources checked on 2026-05-23:

- Cloudflare Pages Wrangler commands:
  `https://developers.cloudflare.com/workers/wrangler/commands/pages/`
- Cloudflare Pages Direct Upload:
  `https://developers.cloudflare.com/pages/get-started/direct-upload/`
- Cloudflare Pages rollback:
  `https://developers.cloudflare.com/pages/configuration/rollbacks/`
- Cloudflare Pages custom domains:
  `https://developers.cloudflare.com/pages/configuration/custom-domains/`
- Cloudflare Pages serving and cache behavior:
  `https://developers.cloudflare.com/pages/configuration/serving-pages/`
- Shuttle CLI, legacy compatibility only:
  `https://docs.shuttle.dev/guides/cli`
- Shuttle projects, legacy compatibility only:
  `https://docs.shuttle.dev/docs/projects`
- Shuttle secrets, legacy compatibility only:
  `https://docs.shuttle.dev/resources/shuttle-secrets`
- Shuttle logs, legacy compatibility only:
  `https://docs.shuttle.dev/docs/logs`
- Fly.io CLI and secrets:
  `https://fly.io/docs/flyctl/`,
  `https://fly.io/docs/flyctl/secrets-set/`
- Railway CLI deploy, variables, status, logs, and rollback:
  `https://docs.railway.com/cli/deploying`,
  `https://docs.railway.com/cli/variable`,
  `https://docs.railway.com/cli/status`,
  `https://docs.railway.com/guides/logs`,
  `https://docs.railway.com/deployments/deployment-actions`

## 2. Production Placeholders

Set these shell variables locally before running smoke checks. Do not commit
the values.

```bash
FRONTEND_ORIGIN="<https-frontend-origin>"
API_ORIGIN="<https-api-origin>"
CLOUDFLARE_PAGES_PROJECT="humankaylee-portfolio"
SHUTTLE_PROJECT="humankaylee-api"
FLY_APP="humankaylee-api"
RAILWAY_SERVICE="humankaylee-api"
RAILWAY_ENVIRONMENT="production"
```

## 3. Environment Variable Matrix

Only names are documented here. Configure values in the provider dashboard or
host-native secret store.

### 3.1 Frontend: Cloudflare Pages

| Name                       | Scope                  | Secret | Required           | Notes                               |
| -------------------------- | ---------------------- | ------ | ------------------ | ----------------------------------- |
| `PUBLIC_SITE_URL`          | Production and preview | No     | Yes                | Canonical frontend origin.          |
| `PUBLIC_API_BASE_URL`      | Production and preview | No     | Yes if API enabled | Public API origin.                  |
| `PUBLIC_ANALYTICS_ENABLED` | Production and preview | No     | No                 | Enables privacy-safe event posting. |
| `PUBLIC_RELEASE_VERSION`   | Production and preview | No     | Recommended        | Build label or release tag.         |
| `PUBLIC_GIT_COMMIT_SHA`    | Production and preview | No     | Recommended        | Public diagnostics only.            |

Cloudflare Pages variables can be set through the dashboard. If using Wrangler
for Pages Functions secrets, use `pages secret put`; this project should not
need frontend secrets for a static-only launch, and public `PUBLIC_*` build
variables should not be stored as Pages secrets.

```bash
pnpm exec wrangler pages project create "$CLOUDFLARE_PAGES_PROJECT" \
  --production-branch main
```

### 3.2 API: Legacy Shuttle Compatibility

| Name                                    | Secret | Required    | Notes                                                                |
| --------------------------------------- | ------ | ----------- | -------------------------------------------------------------------- |
| `HK_API_HOST`                           | No     | No          | Standalone bind host; Shuttle binary does not bind its own listener. |
| `HK_API_PORT`                           | No     | No          | Standalone bind port; Shuttle binary does not bind its own listener. |
| `HK_API_ALLOWED_ORIGINS`                | No     | Yes         | Comma-separated frontend origins allowed by CORS.                    |
| `HK_API_CONTACT_DELIVERY_MODE`          | No     | No          | Keep `disabled` unless `store` has approved storage.                 |
| `HK_API_CONTACT_STORE_PATH`             | No     | If `store`  | JSONL path for accepted contact submissions.                         |
| `HK_API_EVENT_LOGGING_ENABLED`          | No     | No          | Keep false unless privacy-reviewed.                                  |
| `HK_API_RATE_LIMIT_REQUESTS_PER_MINUTE` | No     | No          | Request-limit setting for API hardening.                             |
| `HK_API_CONTACT_RATE_LIMIT_PER_HOUR`    | No     | No          | Contact submission limit used by abuse controls.                     |
| `HK_API_VERSION`                        | No     | Recommended | Health response version label.                                       |

Shuttle is not a viable new launch target. This section exists only to preserve
the current feature-gated binary compatibility contract until it is removed or
replaced. Do not install, authenticate, create, link, deploy, or rollback
Shuttle for a new launch. Run the Shuttle command snippets only when explicitly
preserving or investigating legacy compatibility evidence. Shuttle secrets are
stored in a TOML file at deploy time. The
`humankaylee-api-shuttle` binary maps Shuttle `SecretStore` keys into the same
`HK_API_*` configuration parser used by the standalone binary. Keep
`Secrets*.toml` ignored and outside commits. If contact storage is enabled,
the approved persistent path, retention, backup, rotation, and deletion
decisions must already exist before production deploy.

```bash
shuttle deploy \
  --working-directory apps/api \
  --name "$SHUTTLE_PROJECT" \
  --secrets Secrets.production.toml
```

### 3.3 API Fallback: Fly.io

| Name                                    | Secret | Required    | Notes                                                |
| --------------------------------------- | ------ | ----------- | ---------------------------------------------------- |
| `HK_API_HOST`                           | No     | Yes         | Set to `0.0.0.0` for container hosts.                |
| `HK_API_PORT`                           | No     | No          | Bind port; defaults to `8787`.                       |
| `HK_API_ALLOWED_ORIGINS`                | No     | Yes         | Comma-separated frontend origins allowed by CORS.    |
| `HK_API_CONTACT_DELIVERY_MODE`          | No     | No          | Keep `disabled` unless `store` has approved storage. |
| `HK_API_CONTACT_STORE_PATH`             | No     | If `store`  | JSONL path for accepted contact submissions.         |
| `HK_API_EVENT_LOGGING_ENABLED`          | No     | No          | Keep false unless privacy-reviewed.                  |
| `HK_API_RATE_LIMIT_REQUESTS_PER_MINUTE` | No     | No          | Request-limit setting for API hardening.             |
| `HK_API_CONTACT_RATE_LIMIT_PER_HOUR`    | No     | No          | Contact submission limit used by abuse controls.     |
| `HK_API_VERSION`                        | No     | Recommended | Health response version label.                       |

Fly secrets are set as runtime environment variables. Prepare an ignored
environment file or use shell variables outside this repository; do not paste
values into this file. Do not treat Fly deployment evidence as complete until
the public API origin, secret store, and rollback target are all recorded.

```bash
fly secrets import --app "$FLY_APP" < "$FLY_SECRETS_FILE"
fly secrets list --app "$FLY_APP"
```

### 3.4 API Fallback: Railway

Railway variables are service-scoped. Prefer `--stdin` for sensitive values.

```bash
railway variable set HK_API_CONTACT_DELIVERY_MODE=disabled \
  --service "$RAILWAY_SERVICE" \
  --environment "$RAILWAY_ENVIRONMENT"
```

Use the same API variable names listed for Shuttle and Fly.io. Add
provider/database secrets only if JSONL storage is replaced or supplemented.
Do not promote a Railway deployment until the provider, service, public API
origin, secret store, and rollback target are all recorded in launch evidence.

## 4. Frontend: Cloudflare Pages

### 4.1 Recommended Git Integration

1. In Cloudflare, create a Pages project connected to the GitHub repository.
2. Use the production branch selected for launch.
3. Set the build command to `pnpm build`.
4. Set the build output directory to `dist`.
5. Set production and preview variables from the frontend matrix.
6. Keep preview deployments enabled for pull requests or branch checks.
7. Do not add frontend secrets unless Pages Functions are introduced.
8. Confirm the final custom domain and provider project mapping before the
   first production smoke result is accepted.
9. Deploy only after CI gates pass.

### 4.2 Direct Upload Fallback

Use Direct Upload only when Git integration is unavailable. Cloudflare documents
`wrangler pages deploy <BUILD_OUTPUT_DIRECTORY>` for this path.

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm exec wrangler pages deploy dist \
  --project-name "$CLOUDFLARE_PAGES_PROJECT" \
  --branch main
```

Preview upload:

```bash
pnpm build
pnpm exec wrangler pages deploy dist \
  --project-name "$CLOUDFLARE_PAGES_PROJECT" \
  --branch preview
```

List deployments:

```bash
pnpm exec wrangler pages deployment list \
  --project-name "$CLOUDFLARE_PAGES_PROJECT" \
  --environment production
```

### 4.3 Frontend Smoke Checks

Run after every production frontend deploy.

```bash
xh -h "$FRONTEND_ORIGIN/"
xh -h "$FRONTEND_ORIGIN/projects/"
xh -h "$FRONTEND_ORIGIN/case-studies/"
xh -h "$FRONTEND_ORIGIN/resume/"
xh -h "$FRONTEND_ORIGIN/contact/"
xh -h "$FRONTEND_ORIGIN/sitemap-index.xml"
xh -h "$FRONTEND_ORIGIN/robots.txt"
xh -h "$FRONTEND_ORIGIN/rss.xml"
```

Browser checks:

- Home page has readable hero copy and resume, projects, and contact calls to
  action before interactive assets load.
- JavaScript-disabled view exposes core routes, case studies, resume, and
  contact fallback.
- Reduced-motion view remains usable.
- Open Graph image URL resolves.
- API outage does not block static pages.

### 4.4 Frontend Rollback

Cloudflare Pages supports rollback to any successfully built production
deployment; preview deployments are not rollback targets.

Dashboard path:

1. Open Workers & Pages.
2. Select the Pages project.
3. Open Deployments.
4. Choose the last known-good production deployment.
5. Use the rollback action.
6. Run frontend smoke checks against the final custom domain and the provider
   URL if both exist.
7. Record the previous deployment ID, restored deployment ID, smoke URL, and
   smoke-check output in launch evidence.

CLI-assisted evidence:

```bash
pnpm exec wrangler pages deployment list \
  --project-name "$CLOUDFLARE_PAGES_PROJECT" \
  --environment production
```

If rollback is not available or not enough, redeploy the last known-good Git
commit through the same CI/deploy path and run smoke checks.

## 5. API: Legacy Shuttle Compatibility

Do not use Shuttle for a new production launch. Shuttle is not a viable new
launch target; see https://docs.shuttle.dev/docs/shuttle-shutdown. Keep this
section only as a compatibility reference for the existing feature-gated binary
and for reading historical launch evidence. Legacy Shuttle commands must never
replace Fly.io, Railway, or approved current-host evidence for #64.

### 5.1 Prerequisites

1. Install the current Shuttle CLI.
2. Authenticate with `shuttle login`.
3. Confirm account access with `shuttle account`.
4. Confirm the API crate has Shuttle-compatible entrypoint/configuration before
   attempting deploy.
5. Keep `.shuttle/config.toml` and `Secrets*.toml` out of version control.

### 5.2 Deploy

Create or link the project:

```bash
shuttle project create --name "$SHUTTLE_PROJECT"
shuttle project link --name "$SHUTTLE_PROJECT"
shuttle project status --name "$SHUTTLE_PROJECT"
```

Run local and test checks:

```bash
cargo fmt --manifest-path apps/api/Cargo.toml --check
cargo clippy --manifest-path apps/api/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path apps/api/Cargo.toml
cargo check --manifest-path apps/api/Cargo.toml --features shuttle --bin humankaylee-api-shuttle
sudo podman build -t humankaylee-api:local-check -f apps/api/Dockerfile apps/api
shuttle run --working-directory apps/api --secrets Secrets.production.toml
```

Deploy:

```bash
shuttle deploy \
  --working-directory apps/api \
  --name "$SHUTTLE_PROJECT" \
  --secrets Secrets.production.toml
```

Check status and logs:

```bash
shuttle deployment list --name "$SHUTTLE_PROJECT"
shuttle deployment status --name "$SHUTTLE_PROJECT"
shuttle logs --latest --name "$SHUTTLE_PROJECT"
```

### 5.3 API Smoke Checks

```bash
xh "$API_ORIGIN/api/health"
xh "$API_ORIGIN/api/projects/live"
xh -h OPTIONS "$API_ORIGIN/api/health" Origin:"$FRONTEND_ORIGIN"
```

Contact smoke check, only when `HK_API_CONTACT_DELIVERY_MODE=store` and
`HK_API_CONTACT_STORE_PATH` are intentionally enabled for an integration
environment. Keep production disabled until the store path points at an approved
persistent location or a separate durable provider exists:

```bash
xh POST "$API_ORIGIN/api/contact" \
  Origin:"$FRONTEND_ORIGIN" \
  name="Deployment Smoke Test" \
  email="smoke@example.invalid" \
  subject="Deployment smoke test" \
  message="Smoke test from deployment runbook; safe to ignore."
```

Do not treat a `202` response as delivered mail. Current `store` mode appends a
JSONL record and still needs retention, backup, and deletion decisions before it
is treated as production contact handling. If production contact handling is
still blocked, keep this step marked `not run` in launch evidence and do not
reuse preview or local acceptance as launch proof.

### 5.4 Legacy Shuttle Rollback

Shuttle's historical CLI exposed deployment listing and redeploy commands. Use
these commands only for legacy evidence recovery, not for a new launch.

```bash
shuttle deployment list --name "$SHUTTLE_PROJECT"
shuttle deployment redeploy "$KNOWN_GOOD_SHUTTLE_DEPLOYMENT_ID" \
  --name "$SHUTTLE_PROJECT"
shuttle deployment status --name "$SHUTTLE_PROJECT"
shuttle logs --latest --name "$SHUTTLE_PROJECT"
xh "$API_ORIGIN/api/health"
```

If the known-good deployment cannot be redeployed, check out the known-good Git
commit, confirm secrets are still configured, run backend tests, and use the
selected current API host instead.
Record the deployment ID, rollback target, public API origin, and smoke output
in launch evidence before calling the rollback complete.

## 6. API Fallback: Fly.io

Use Fly.io as a current Axum PaaS candidate when its cost, custom-domain,
observability, and rollback behavior fit launch. This path requires a
Dockerfile or Fly-compatible build setup for the API. The committed
`apps/api/Dockerfile` defaults `HK_API_HOST=0.0.0.0` so container traffic is not
bound to loopback.

### 6.1 Deploy

```bash
fly auth login
fly launch --name "$FLY_APP" --no-deploy
fly secrets list --app "$FLY_APP"
fly deploy --app "$FLY_APP" --dockerfile apps/api/Dockerfile
fly status --app "$FLY_APP"
fly logs --app "$FLY_APP"
```

### 6.2 Rollback

Use Fly releases to identify and revert to a known-good release.

```bash
fly releases --app "$FLY_APP"
fly deploy --app "$FLY_APP" --config fly.toml --image "$KNOWN_GOOD_IMAGE"
fly status --app "$FLY_APP"
xh "$API_ORIGIN/api/health"
```

If the deployment was source-based and no image is recorded, check out the
known-good Git commit, run backend tests, deploy, and smoke-test before updating
the frontend API URL.

## 7. API Fallback: Railway

Use Railway when simple service deployment is preferred and the cost/reliability
tradeoff is acceptable. Railway's current deploy command for local code is
`railway up`; `railway deploy` is for templates. Set `HK_API_HOST=0.0.0.0`
before container launch so the service is reachable through Railway's router.

### 7.1 Deploy

```bash
railway login
railway link
railway status --json
railway variable list \
  --service "$RAILWAY_SERVICE" \
  --environment "$RAILWAY_ENVIRONMENT"
railway up \
  --service "$RAILWAY_SERVICE" \
  --environment "$RAILWAY_ENVIRONMENT"
railway logs \
  --service "$RAILWAY_SERVICE" \
  --environment "$RAILWAY_ENVIRONMENT"
```

Detached deploy:

```bash
railway up \
  --service "$RAILWAY_SERVICE" \
  --environment "$RAILWAY_ENVIRONMENT" \
  --detach
```

### 7.2 Rollback

Railway supports dashboard rollback from a previous deployment when the
deployment is still retained and rollback-capable. The rollback restores the
selected deployment's image and custom variables.

Dashboard path:

1. Open the Railway project.
2. Select the API service.
3. Open Deployments.
4. Choose the last known-good deployment.
5. Use Rollback.
6. Run API smoke checks.

CLI evidence after rollback:

```bash
railway deployment list \
  --service "$RAILWAY_SERVICE" \
  --environment "$RAILWAY_ENVIRONMENT" \
  --json
railway status --json
railway logs \
  --service "$RAILWAY_SERVICE" \
  --environment "$RAILWAY_ENVIRONMENT"
xh "$API_ORIGIN/api/health"
```

## 8. Domain, DNS, TLS, And Cache

### 8.1 Frontend Domain

Cloudflare Pages custom-domain setup:

1. Add the custom domain from the Pages project's Custom domains screen.
2. For an apex domain, the domain must be a Cloudflare zone on the same account.
3. For a subdomain, create or allow Cloudflare to create a CNAME to
   `<project>.pages.dev`.
4. Do not rely on a manually created CNAME alone; associate the domain in Pages.
5. Wait for Cloudflare to provision TLS.
6. If CAA records exist, allow Cloudflare's documented certificate authorities.
7. Verify the final URL with `xh -h "$FRONTEND_ORIGIN/"`.
8. Do not mark the frontend live until the custom domain and the provider URL
   both resolve as expected and the smoke evidence is captured for the final
   public URL.

### 8.2 API Domain

Recommended pattern:

- selected `www` or apex domain for the static frontend.
- selected API subdomain for the Rust API.
- Keep the frontend usable if the API origin fails.
- Record the final API origin and domain mapping in launch evidence before any
  production smoke check is treated as complete.

Provider-specific API domain setup must be recorded in
`runbooks/LAUNCH_EVIDENCE.md` after the provider is selected.

### 8.3 TLS

Checks:

```bash
xh -h "$FRONTEND_ORIGIN/"
xh -h "$API_ORIGIN/api/health"
```

Expected:

- HTTP requests redirect to HTTPS or are not used publicly.
- TLS certificate is valid in a clean browser.
- No mixed-content warnings on frontend pages.

### 8.4 Cache

Cloudflare Pages serves static assets from its CDN and includes default headers
such as `Etag`; uploaded assets can remain in a data center cache after a new
deploy. Use hashed asset names for long-lived assets and avoid caching API
responses unless explicitly designed.

Checks:

```bash
xh -h "$FRONTEND_ORIGIN/" | rg -i '^(cache-control|etag|cf-ray):'
FRONTEND_ASSET_PATH="/_astro/<hashed-asset-from-current-build>.css"
xh -h "$FRONTEND_ORIGIN$FRONTEND_ASSET_PATH" | rg -i '^(cache-control|etag|cf-ray):'
```

Rollback/cache rule:

- Prefer Pages rollback or redeploy over manual purge.
- Purge cache only after confirming the wrong asset is still served after
  rollback.
- Never cache `POST /api/contact` or `POST /api/events`.
- Cache `GET /api/projects/live` only if the API sets explicit safe headers.

## 9. Production Promotion Checklist

Before production promotion:

- Frontend CI gates pass.
- Backend CI gates pass.
- Content redaction approval is complete.
- Frontend provider and project are selected.
- API provider and project are selected.
- Final frontend and API custom domains are selected.
- Production provider variables are configured by name.
- Contact handling mode and storage/retention decision are approved or
  explicitly marked disabled for launch.
- Secrets are stored in provider-native secret stores or other approved host
  secret managers, never in the repo.
- Frontend works with the API stopped.
- API health checks pass from outside local infrastructure.
- Rollback target is known for frontend and API.
- Production smoke URLs are documented, and the evidence rows are ready to fill
  with command output, deployment IDs, and timestamps.

Commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm lighthouse:local
cargo test --manifest-path apps/api/Cargo.toml
xh "$API_ORIGIN/api/health"
xh "$FRONTEND_ORIGIN/"
```

Record command, date, target URL, exit status, and deployment IDs in
`runbooks/LAUNCH_EVIDENCE.md`.

## 10. Rollback And Incident Dry Run

Run this dry run before production promotion and after any provider change. It
does not perform a rollback by itself; it proves the operator can identify the
target, choose the recovery path, and record the evidence without exposing
secrets.

Set target placeholders:

```bash
FRONTEND_ROLLBACK_TARGET="<known-good-cloudflare-pages-deployment-id>"
API_ROLLBACK_TARGET="<known-good-api-deployment-or-image-id>"
KNOWN_GOOD_SHUTTLE_DEPLOYMENT_ID="$API_ROLLBACK_TARGET"
KNOWN_GOOD_IMAGE="$API_ROLLBACK_TARGET"
```

Frontend rollback readiness:

```bash
pnpm exec wrangler pages deployment list \
  --project-name "$CLOUDFLARE_PAGES_PROJECT" \
  --environment production
xh -h "$FRONTEND_ORIGIN/"
xh -h "$FRONTEND_ORIGIN/projects/"
xh -h "$FRONTEND_ORIGIN/resume/"
xh -h "$FRONTEND_ORIGIN/contact/"
```

API rollback readiness:

```bash
shuttle deployment list --name "$SHUTTLE_PROJECT"
fly releases --app "$FLY_APP"
railway deployment list \
  --service "$RAILWAY_SERVICE" \
  --environment "$RAILWAY_ENVIRONMENT" \
  --json
railway status --json
xh "$API_ORIGIN/api/health"
xh "$API_ORIGIN/api/projects/live"
```

Do not run mutating rollback commands during the dry run. For an actual
incident rollback, use the provider-specific rollback command from sections
5.4, 6.2, or 7.2 only after confirming the selected target is the intended
known-good deployment.
Dry-run evidence must name the frontend provider, API provider, custom domain,
and the exact smoke URL that would be used after rollback.

API disablement readiness if rollback is not available:

```bash
export HK_API_CONTACT_DELIVERY_MODE=disabled
export PUBLIC_API_BASE_URL=""
pnpm build
```

Provider console or CLI: set `HK_API_CONTACT_DELIVERY_MODE=disabled` on the API
service before redeploying or restarting it, then rebuild/redeploy the frontend
with `PUBLIC_API_BASE_URL=""` if the safest incident posture is mailto-only
contact and no API enhancement.

When the API is disabled or unavailable, keep the frontend static routes live,
keep the mailto fallback visible, and verify API-down behavior with
`pnpm test:e2e -- --grep "@api-down"` before promoting the disabled frontend.
If using a provider dashboard rather than CLI for rollback, capture the
deployment ID, previous deployment ID, and dashboard timestamp in the evidence
record.

DNS and custom-domain readiness:

```bash
xh -h "$FRONTEND_ORIGIN/"
xh -h "$API_ORIGIN/api/health"
```

Confirm the Pages custom-domain association exists, the CNAME points at
`<project>.pages.dev` for subdomains, CAA records allow Cloudflare certificate
issuance when CAA is present, TLS is valid in a clean browser, and no
mixed-content warnings appear.

Recovery verification evidence must include:

- Incident or dry-run date.
- Provider and environment.
- Deployment ID before rollback.
- Rollback target.
- Smoke-check command and exit status.
- Home, projects, resume, contact fallback, API health, and DNS/TLS result.
- Follow-up action or blocker.

Record command, target, date, exit status, deployment ID, rollback target, and
result in `runbooks/LAUNCH_EVIDENCE.md`. Production rollback targets remain
blocked until real provider deployments exist.
