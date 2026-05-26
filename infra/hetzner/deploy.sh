#!/usr/bin/env bash
# HumanKaylee Portfolio API — Hetzner CX22 bootstrap
# Run on the VPS as root after:
#   apt-get update && apt-get install -y curl ca-certificates jq
#
# Prerequisites before running this script:
#   1. Binary copied to /tmp/humankaylee-api:
#      scp -C target/x86_64-unknown-linux-musl/release/humankaylee-api root@<VPS-IP>:/tmp/
#   2. Service file copied to /tmp/humankaylee-api.service:
#      scp infra/hetzner/humankaylee-api.service root@<VPS-IP>:/tmp/
#   3. Caddyfile snippet copied to /tmp/Caddyfile.snippet:
#      scp infra/hetzner/Caddyfile.snippet root@<VPS-IP>:/tmp/
#   4. Secrets env file ready (file mode 600) at /etc/humankaylee-api.env:
#      Install format — one KEY=VALUE per line, no quotes needed:
#        HK_API_CONTACT_STORE_PATH=/opt/humankaylee-api/data/contacts.jsonl
#        RESEND_API_KEY=re_...
#
# Idempotent — safe to re-run.
# Re-run to upgrade: copy new binary to /tmp/humankaylee-api and re-run.

set -euo pipefail

echo "==> HumanKaylee API bootstrap starting"

# 1. User + dirs
id humankaylee &>/dev/null || useradd --system --shell /usr/sbin/nologin --home-dir /opt/humankaylee-api humankaylee
mkdir -p /opt/humankaylee-api/data
mkdir -p /var/log/caddy
chown -R humankaylee:humankaylee /opt/humankaylee-api

# 2. Caddy
if ! command -v caddy >/dev/null; then
    echo "==> Installing Caddy"
    apt-get install -y caddy
fi
mkdir -p /etc/caddy/conf.d

# 3. systemd unit
echo "==> Installing systemd unit"
cp /tmp/humankaylee-api.service /etc/systemd/system/humankaylee-api.service
systemctl daemon-reload
systemctl enable humankaylee-api

# 4. Caddyfile
echo "==> Installing Caddyfile snippet"
cp /tmp/Caddyfile.snippet /etc/caddy/conf.d/humankaylee-api.conf

# Ensure Caddyfile includes conf.d if not already present
if ! grep -q 'import conf.d' /etc/caddy/Caddyfile 2>/dev/null; then
    echo 'import /etc/caddy/conf.d/*.conf' >> /etc/caddy/Caddyfile
fi

caddy validate --config /etc/caddy/Caddyfile

# 5. Binary
if [ -f /tmp/humankaylee-api ]; then
    echo "==> Installing binary"
    install -m 755 -o humankaylee -g humankaylee /tmp/humankaylee-api /opt/humankaylee-api/humankaylee-api
else
    echo "WARN: /tmp/humankaylee-api not found — skipping binary install"
    echo "      Copy the binary first: scp ... root@<VPS-IP>:/tmp/humankaylee-api"
fi

# 6. Secrets env file check
if [ ! -f /etc/humankaylee-api.env ]; then
    echo "WARN: /etc/humankaylee-api.env not found — service will use default env only"
    echo "      Create /etc/humankaylee-api.env with mode 600 before enabling contact store"
else
    chmod 600 /etc/humankaylee-api.env
    chown root:root /etc/humankaylee-api.env
    echo "==> Secrets env file found and secured"
fi

# 7. Start / restart services
echo "==> Starting services"
systemctl restart humankaylee-api
systemctl reload-or-restart caddy

sleep 3

# 8. Local smoke
echo "==> Running local smoke check"
curl -fsS http://127.0.0.1:8080/api/health | jq -e '.status == "ok"' && echo "PASS: local health check"

# 9. Public smoke (may fail until DNS + TLS propagate)
echo "==> Running public smoke check (may fail until DNS propagates)"
curl -fsS --max-time 10 https://api.humankaylee.dev/api/health | jq -e '.status == "ok"' && \
    echo "PASS: public health check" || \
    echo "WARN: public smoke pending DNS / TLS issuance — verify CF DNS A record points to this VPS IP"

echo ""
echo "==> Hetzner deploy complete"
echo "    Next: verify Cloudflare DNS A record for api.humankaylee.dev points to $(curl -4 -fsS ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
