# Backend Deploy — 3-Host Option Matrix

This directory contains operator-runnable infrastructure assets for the
HumanKaylee Portfolio API (Axum). These assets are pre-prepared for M2.
The operator selects one host (D-03) and one region (D-04), then runs the
one-command deploy listed below.

---

## Decision-Routing Table

| Host | Monthly Cost | Setup Command | When to Use |
|------|-------------|---------------|-------------|
| **Hetzner CX22** (recommended) | $4.59 flat | `bash infra/hetzner/deploy.sh` on VPS | D-03 = Hetzner CX22 (default; lowest cost, zero cold-start) |
| **Fly.io** | $0–5 | `fly deploy --config apps/api/fly.toml` | D-03 = Fly.io (PaaS, managed TLS, auto-scale to zero) |
| **Railway** | $5–15 | Connect repo at railway.app, push to deploy | D-03 = Railway (simplest; no CLI required for first deploy) |

Default recommendation: **Hetzner CX22** — flat $4.59/month with no cold-start
penalty, operator controls TLS via Caddy, and the binary is a single static
executable (<10 MB musl). Fly.io is a strong alternative if you want zero-ops
TLS and don't need the instance always warm.

---

## Files In This Directory

```
infra/
  hetzner/
    humankaylee-api.service  — systemd unit (copy to /etc/systemd/system/)
    Caddyfile.snippet         — reverse-proxy config (include from /etc/caddy/Caddyfile)
    deploy.sh                 — idempotent bootstrap script (run as root on VPS)
  railway/
    railway.toml              — Railway service definition (repo root deployment)
  README.md                   — this file
apps/api/
  fly.toml                    — Fly.io app config (operator sets primary_region)
  Dockerfile                  — multi-stage build used by all container-based options
```

---

## How to Deploy (after D-03 + D-04 are resolved)

### Option A — Hetzner CX22

1. Provision a Hetzner CX22 (x86_64 Ubuntu 24.04) and note its IP.
2. Add DNS A record: `api.humankaylee.dev` → VPS IP (Cloudflare proxy off for
   the API subdomain to preserve real client IPs at the API layer; or use
   Cloudflare proxied — either is fine).
3. Cross-compile the binary for x86_64 Linux musl:
   ```bash
   rustup target add x86_64-unknown-linux-musl
   cargo build --release --manifest-path apps/api/Cargo.toml \
     --target x86_64-unknown-linux-musl
   ```
4. Copy assets to VPS:
   ```bash
   VPS_IP=<your-vps-ip>
   scp apps/api/target/x86_64-unknown-linux-musl/release/humankaylee-api root@$VPS_IP:/tmp/
   scp infra/hetzner/humankaylee-api.service root@$VPS_IP:/tmp/
   scp infra/hetzner/Caddyfile.snippet root@$VPS_IP:/tmp/
   ```
5. SSH into VPS and run the bootstrap:
   ```bash
   ssh root@$VPS_IP
   # Create secrets file first:
   cat > /etc/humankaylee-api.env << 'EOF'
   HK_API_CONTACT_STORE_PATH=/opt/humankaylee-api/data/contacts.jsonl
   EOF
   chmod 600 /etc/humankaylee-api.env
   # Then bootstrap:
   bash /tmp/deploy.sh   # or scp deploy.sh first
   ```
6. Smoke verify:
   ```bash
   curl -fsS https://api.humankaylee.dev/api/health
   # Expected: {"status":"ok",...}
   ```

### Option B — Fly.io

1. Install flyctl: `curl -L https://fly.io/install.sh | sh`
2. Authenticate: `fly auth login`
3. Edit `apps/api/fly.toml` — change `primary_region` to your preferred region
   (e.g., `fra` for Frankfurt, `lax` for Los Angeles).
4. Set secrets:
   ```bash
   fly secrets set \
     HK_API_ALLOWED_ORIGINS="https://humankaylee.dev,https://*.humankaylee-portfolio.pages.dev" \
     HK_API_CONTACT_DELIVERY_MODE="store" \
     HK_API_CONTACT_STORE_PATH="/data/contacts.jsonl" \
     --app humankaylee-portfolio-api
   ```
5. Deploy:
   ```bash
   fly deploy --config apps/api/fly.toml
   ```
6. Smoke verify:
   ```bash
   fly status --app humankaylee-portfolio-api
   curl -fsS https://humankaylee-portfolio-api.fly.dev/api/health
   ```
7. Add custom domain:
   ```bash
   fly certs create api.humankaylee.dev --app humankaylee-portfolio-api
   # Follow DNS instructions shown
   ```

### Option C — Railway

1. Go to [railway.app](https://railway.app) and create a new project.
2. Connect the `HumanKaylee/humankaylee-portfolio` GitHub repo.
3. Railway auto-detects the `infra/railway/railway.toml` config.
4. Set environment variables in the Railway dashboard:
   - `HK_API_HOST` = `0.0.0.0`
   - `HK_API_PORT` = `8080`
   - `HK_API_ALLOWED_ORIGINS` = `https://humankaylee.dev,...`
   - `HK_API_CONTACT_DELIVERY_MODE` = `store`
   - `HK_API_CONTACT_STORE_PATH` = `/data/contacts.jsonl`
5. Deploy and add a custom domain for `api.humankaylee.dev`.
6. Smoke verify:
   ```bash
   curl -fsS https://api.humankaylee.dev/api/health
   ```

---

## Environment Variables Reference

All options share the same `HK_API_*` environment variable contract:

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `HK_API_HOST` | No | `127.0.0.1` | Set `0.0.0.0` for container/VPS |
| `HK_API_PORT` | No | `8080` | Internal bind port |
| `HK_API_ALLOWED_ORIGINS` | Yes | (none) | Comma-separated CORS origins |
| `HK_API_CONTACT_DELIVERY_MODE` | No | `disabled` | `disabled` or `store` |
| `HK_API_CONTACT_STORE_PATH` | If store | (none) | JSONL file path |
| `HK_API_EVENT_LOGGING_ENABLED` | No | `false` | Privacy-reviewed before enabling |
| `HK_API_RATE_LIMIT_REQUESTS_PER_MINUTE` | No | `60` | Request rate limit |
| `HK_API_CONTACT_RATE_LIMIT_PER_HOUR` | No | `3` | Contact submission limit |
| `HK_API_VERSION` | No | Cargo version | Version label in health response |

Secrets (contact store path, Resend key if used) go in `/etc/humankaylee-api.env`
(Hetzner), `fly secrets set` (Fly.io), or Railway environment variables panel.
Never commit secret values to this repo.

---

## Cross-Compile for Linux (from Windows/rog-strix-joe)

The Hetzner and musl binary path requires cross-compilation. Run once to set up:

```bash
rustup target add x86_64-unknown-linux-musl
# On Windows/WSL you may also need:
# sudo apt-get install musl-tools
```

Build:
```bash
cargo build --release \
  --manifest-path apps/api/Cargo.toml \
  --target x86_64-unknown-linux-musl
# Binary: apps/api/target/x86_64-unknown-linux-musl/release/humankaylee-api
```

For Fly.io and Railway, Docker handles the build — no cross-compile needed.

---

## Post-Deploy Evidence (for runbooks/LAUNCH_EVIDENCE.md)

After any successful deploy, append a row to `runbooks/LAUNCH_EVIDENCE.md`:

```
| <timestamp> | M2-deploy | backend | <operator> | PASS | <ms> | <provider> | Smoke: https://api.humankaylee.dev/api/health → {"status":"ok"} |
```

Record: provider, deployment ID or release version, public API URL, smoke HTTP
code and response body, TLS validity, CORS preflight result, rollback target.
