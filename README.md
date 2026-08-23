# HumanKaylee Portfolio

Status: not launch-ready. Final frontend domain, Final API domain, provider
projects, and required secrets are still pending. See
[runbooks/LAUNCH_EVIDENCE.md](runbooks/LAUNCH_EVIDENCE.md) for the current
blocker record.

This repository is the implementation and operations workspace for the
portfolio. For broader operating context, use
[docs/OPERATIONS.md](docs/OPERATIONS.md) and the deployment runbook at
[runbooks/DEPLOYMENT.md](runbooks/DEPLOYMENT.md). Privacy behavior and contact
handling are documented in [docs/PRIVACY.md](docs/PRIVACY.md).

## Live Shipped Work

- [Prompt Starter Pack](https://github.com/HumanKaylee/prompt-starter-pack) -- 20 free developer prompt templates plus worked examples and a GitHub Pages preview.
- [Prompt Starter Pack Premium](https://flamewulfe.gumroad.com/l/prompt-starter-pack-premium) -- 40+ battle-tested templates for code review, architecture, security, and AI/LLM workflows. Launch discount: `LAUNCH9`.

## Local Development

### Frontend Local Development

```bash
pnpm install --frozen-lockfile
pnpm exec astro dev --host 127.0.0.1 --port 4321
```

If the frontend needs a local API, set `PUBLIC_API_BASE_URL` in an ignored
environment file before starting the dev server.

### Backend Local Development

```bash
cargo run --manifest-path apps/api/Cargo.toml --bin humankaylee-api
```

Set `HK_API_HOST=127.0.0.1`, `HK_API_PORT=8787`, and
`HK_API_ALLOWED_ORIGINS=http://127.0.0.1:4321` for the local loop. Keep
`HK_API_ALLOWED_ORIGINS` as one or more comma-separated valid `http`/`https`
origins with no blank entries. Keep `HK_API_CONTACT_DELIVERY_MODE=disabled`
unless an approved store path exists, and keep local env files ignored.

## Environment Variables

Frontend public variables:

- `PUBLIC_SITE_URL`
- `PUBLIC_API_BASE_URL`
- `PUBLIC_ANALYTICS_ENABLED`
- `PUBLIC_RELEASE_VERSION`
- `PUBLIC_GIT_COMMIT_SHA`

Backend variables:

- `HK_API_HOST`
- `HK_API_PORT`
- `HK_API_ALLOWED_ORIGINS`
- `HK_API_CONTACT_DELIVERY_MODE`
- `HK_API_CONTACT_STORE_PATH`
- `HK_API_EVENT_LOGGING_ENABLED`
- `HK_API_RATE_LIMIT_REQUESTS_PER_MINUTE`
- `HK_API_CONTACT_RATE_LIMIT_PER_HOUR`
- `HK_API_VERSION`
- `RUST_LOG`

Rules:

- Do not commit secret values or provider credentials.
- Keep local overrides in ignored files or host-native secret stores.
- Use [docs/OPERATIONS.md](docs/OPERATIONS.md) for the full environment matrix
  and secret-storage guidance.

## Tests And Quality Checks

Run from the repository root:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm preview
pnpm lighthouse:local
cargo fmt --manifest-path apps/api/Cargo.toml --check
cargo clippy --manifest-path apps/api/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path apps/api/Cargo.toml
cargo check --manifest-path apps/api/Cargo.toml --features shuttle --bin humankaylee-api-shuttle
pnpm run audit
sudo podman build -t humankaylee-api:local-check -f apps/api/Dockerfile apps/api
```

`pnpm test` includes the Node contract tests that validate this README and the
other repository contracts.

For launch-quality local verification, run `pnpm build && pnpm bundle:budget`
after route, script, or visual changes. Container smoke evidence should follow
the deployment runbook: start `humankaylee-api:local-check`, check
`http://127.0.0.1:8788/api/health`, then stop the container with
`sudo podman stop --time 1 <container-id>`.

## Frontend Deployment

Preferred frontend host: Cloudflare Pages. The detailed workflow and rollback
steps live in [runbooks/DEPLOYMENT.md](runbooks/DEPLOYMENT.md).

1. Build the static site with `pnpm build`.
2. Deploy the `dist` output through the selected Cloudflare Pages path.
3. Record the deployment ID and smoke checks in
   [runbooks/LAUNCH_EVIDENCE.md](runbooks/LAUNCH_EVIDENCE.md).

Direct-upload example:

```bash
pnpm exec wrangler pages deploy dist \
  --project-name "$CLOUDFLARE_PAGES_PROJECT" \
  --branch main
```

## Backend Deployment

Current API hosting note: Shuttle is not a viable new launch target as of the
2026-05-24 official-source snapshot
https://docs.shuttle.dev/docs/shuttle-shutdown. Fly.io, Railway, or another
approved host are the approved current-host comparison set for #64; Cloudflare
Workers/Pages Functions require an edge/runtime rewrite, and Hetzner is a
higher-ops VPS fallback. See
[runbooks/DEPLOYMENT.md](runbooks/DEPLOYMENT.md) for provider-specific steps and
rollback notes.

1. Prepare the API environment variables and secret store for the selected
   host.
2. Deploy with the chosen provider command. Do not use Shuttle for a new
   production launch; keep the Shuttle binary check as legacy compatibility
   only until it is removed or replaced.

3. Capture the deployment ID, logs, and smoke checks in
   [runbooks/LAUNCH_EVIDENCE.md](runbooks/LAUNCH_EVIDENCE.md).

## Common Failure Modes And Recovery

- Frontend dev server will not start: rerun `pnpm install --frozen-lockfile`
  and then `pnpm exec astro dev --host 127.0.0.1 --port 4321`.
- API boot or contact behavior looks wrong: verify `HK_API_ALLOWED_ORIGINS`,
  `HK_API_CONTACT_DELIVERY_MODE`, and `HK_API_VERSION`, then rerun
  `cargo run --manifest-path apps/api/Cargo.toml --bin humankaylee-api`.
- Frontend deploy fails preflight checks: rerun `pnpm lint`, `pnpm typecheck`,
  `pnpm test`, and `pnpm build`, then follow
  [runbooks/DEPLOYMENT.md](runbooks/DEPLOYMENT.md).
- Roll back a bad release: list deployments with
  `pnpm exec wrangler pages deployment list --project-name "$CLOUDFLARE_PAGES_PROJECT" --environment production`
  for Cloudflare Pages. For Fly.io, use
  `fly releases --app "$FLY_APP" --image`, then redeploy a known-good image
  with `fly deploy --app "$FLY_APP" --image "$KNOWN_GOOD_IMAGE"`. Use
  `railway deployment list` for Railway history, then record the recovery in
  [runbooks/LAUNCH_EVIDENCE.md](runbooks/LAUNCH_EVIDENCE.md).
