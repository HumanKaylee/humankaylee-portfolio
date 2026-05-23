# Phase 8 Deployment Runbook

Date: 2026-05-23
Status: Phase 8 operations draft; production domains and provider accounts are
not yet selected.

This runbook covers the static Astro frontend and Rust Axum API. It is written
so another operator can deploy without private context. Replace placeholder
domains and provider project names only after they are selected.

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
- Shuttle CLI:
  `https://docs.shuttle.dev/guides/cli`
- Shuttle projects:
  `https://docs.shuttle.dev/docs/projects`
- Shuttle secrets:
  `https://docs.shuttle.dev/resources/shuttle-secrets`
- Shuttle logs:
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
FRONTEND_ORIGIN="https://www.example.com"
API_ORIGIN="https://api.example.com"
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
need frontend secrets for a static-only launch.

```bash
pnpm exec wrangler pages secret put PUBLIC_RELEASE_VERSION \
  --project-name "$CLOUDFLARE_PAGES_PROJECT"
```

### 3.2 API: Shuttle

| Name                                    | Secret | Required    | Notes                                                       |
| --------------------------------------- | ------ | ----------- | ----------------------------------------------------------- |
| `HK_API_HOST`                           | No     | No          | Bind host; defaults to `127.0.0.1`.                         |
| `HK_API_PORT`                           | No     | No          | Bind port; defaults to `8787`.                              |
| `HK_API_ALLOWED_ORIGINS`                | No     | Before CORS | Comma-separated frontend origins for future CORS plumbing.  |
| `HK_API_CONTACT_DELIVERY_MODE`          | No     | No          | Keep `disabled` in production until durable delivery lands. |
| `HK_API_EVENT_LOGGING_ENABLED`          | No     | No          | Keep false unless privacy-reviewed.                         |
| `HK_API_RATE_LIMIT_REQUESTS_PER_MINUTE` | No     | No          | Parsed setting for future stateful middleware.              |
| `HK_API_CONTACT_RATE_LIMIT_PER_HOUR`    | No     | No          | Parsed setting for future stateful middleware.              |
| `HK_API_VERSION`                        | No     | Recommended | Health response version label.                              |

Shuttle secrets are stored in a TOML file at deploy time. Keep
`Secrets*.toml` ignored and outside commits.

```bash
shuttle deploy --name "$SHUTTLE_PROJECT" --secrets Secrets.production.toml
```

### 3.3 API Fallback: Fly.io

| Name                                    | Secret | Required    | Notes                                                       |
| --------------------------------------- | ------ | ----------- | ----------------------------------------------------------- |
| `HK_API_HOST`                           | No     | No          | Bind host; defaults to `127.0.0.1`.                         |
| `HK_API_PORT`                           | No     | No          | Bind port; defaults to `8787`.                              |
| `HK_API_ALLOWED_ORIGINS`                | No     | Before CORS | Comma-separated frontend origins for future CORS plumbing.  |
| `HK_API_CONTACT_DELIVERY_MODE`          | No     | No          | Keep `disabled` in production until durable delivery lands. |
| `HK_API_EVENT_LOGGING_ENABLED`          | No     | No          | Keep false unless privacy-reviewed.                         |
| `HK_API_RATE_LIMIT_REQUESTS_PER_MINUTE` | No     | No          | Parsed setting for future stateful middleware.              |
| `HK_API_CONTACT_RATE_LIMIT_PER_HOUR`    | No     | No          | Parsed setting for future stateful middleware.              |
| `HK_API_VERSION`                        | No     | Recommended | Health response version label.                              |

Fly secrets are set as runtime environment variables. Prepare an ignored
environment file or use shell variables outside this repository; do not paste
values into this file.

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
provider/database secrets only after the API has durable delivery or storage.

## 4. Frontend: Cloudflare Pages

### 4.1 Recommended Git Integration

1. In Cloudflare, create a Pages project connected to the GitHub repository.
2. Use the production branch selected for launch.
3. Set the build command to `pnpm build`.
4. Set the build output directory to `dist`.
5. Set production and preview variables from the frontend matrix.
6. Keep preview deployments enabled for pull requests or branch checks.
7. Do not add frontend secrets unless Pages Functions are introduced.
8. Deploy only after CI gates pass.

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
6. Run frontend smoke checks.
7. Record the deployment ID and smoke-check output in launch evidence.

CLI-assisted evidence:

```bash
pnpm exec wrangler pages deployment list \
  --project-name "$CLOUDFLARE_PAGES_PROJECT" \
  --environment production
```

If rollback is not available or not enough, redeploy the last known-good Git
commit through the same CI/deploy path and run smoke checks.

## 5. API: Shuttle Community

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

Contact smoke check, only when `HK_API_CONTACT_DELIVERY_MODE=store` is
intentionally enabled for an integration environment. Keep production disabled
until durable delivery or storage exists:

```bash
xh POST "$API_ORIGIN/api/contact" \
  Origin:"$FRONTEND_ORIGIN" \
  name="Deployment Smoke Test" \
  email="smoke@example.invalid" \
  subject="Deployment smoke test" \
  message="Smoke test from deployment runbook; safe to ignore."
```

Do not treat a `202` response as delivered mail. Current `store` mode is a
validation/integration path, not a production delivery provider.

### 5.4 Shuttle Rollback

Shuttle's current CLI exposes deployment listing and redeploy commands. Use a
known-good deployment ID when available.

```bash
shuttle deployment list --name "$SHUTTLE_PROJECT"
shuttle deployment redeploy "$KNOWN_GOOD_SHUTTLE_DEPLOYMENT_ID" \
  --name "$SHUTTLE_PROJECT"
shuttle deployment status --name "$SHUTTLE_PROJECT"
shuttle logs --latest --name "$SHUTTLE_PROJECT"
xh "$API_ORIGIN/api/health"
```

If the known-good deployment cannot be redeployed, check out the known-good Git
commit, confirm secrets are still configured, run backend tests, deploy again,
and run API smoke checks. If Shuttle itself is unavailable or unreliable, use
the Fly.io or Railway fallback.

## 6. API Fallback: Fly.io

Use Fly.io if Shuttle access, reliability, resource limits, custom-domain needs,
or rollback behavior are not sufficient for launch. This path requires a
Dockerfile or Fly-compatible build setup for the API.

### 6.1 Deploy

```bash
fly auth login
fly launch --name "$FLY_APP" --no-deploy
fly secrets list --app "$FLY_APP"
fly deploy --app "$FLY_APP" --config fly.toml
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
`railway up`; `railway deploy` is for templates.

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

### 8.2 API Domain

Recommended pattern:

- `www.example.com` or apex domain for the static frontend.
- `api.example.com` for the Rust API.
- Keep the frontend usable if `api.example.com` fails.

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
- Production provider variables are configured by name.
- Final frontend and API domains are selected.
- Frontend works with the API stopped.
- API health checks pass from outside local infrastructure.
- Rollback target is known for frontend and API.

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
