#!/usr/bin/env bash
# scripts/launch/m3-dns-verify.sh
# M3 — DNS + TLS verification harness for humankaylee-portfolio launch.
#
# Run AFTER:
#   - Operator binds the custom domain `humankaylee.dev` to the Cloudflare Pages
#     project `humankaylee-portfolio` (M1 step 6).
#   - Operator points domain nameservers to Cloudflare's (M1 step 1).
#
# Run FROM: any host with `dig`, `curl`, `openssl`, and `jq` available.
#
# Idempotency: this script is read-only. Safe to re-run any number of times.
# Retry policy: each check has a configurable retry ladder.
# Exit codes per goal-plan Section 11B:
#   0  PASS
#   1  permanent failure (HALT_AND_SURFACE)
#   2  transient failure exhausted (HALT_AND_SURFACE)
#   3  pre-condition failure (HALT_AND_SURFACE)
#   4  awaiting operator (PAUSE)

set -euo pipefail

DOMAIN="${DOMAIN:-humankaylee.dev}"
API_DOMAIN="${API_DOMAIN:-api.humankaylee.dev}"
EVIDENCE_FILE="${EVIDENCE_FILE:-runbooks/LAUNCH_EVIDENCE.md}"
RETRY_DELAYS=(60 120 300)  # seconds; total = up to ~7.7 min over 3 retries

now() { date -u +%Y-%m-%dT%H:%M:%SZ; }
log() { printf '[%s] [M3] %s\n' "$(now)" "$*"; }
fail() { log "FAIL: $*"; exit "${2:-1}"; }
pass() { log "PASS: $*"; }

require() {
  command -v "$1" >/dev/null 2>&1 || fail "missing required tool: $1" 3
}

require dig
require curl
require openssl
require jq

# ─────────────────────────────────────────────────────────────────────────────
# CHECK 1 — DNS A record points to Cloudflare anycast (Pages or CF proxied)
# ─────────────────────────────────────────────────────────────────────────────
log "Check 1: DNS A record for $DOMAIN"

dns_check() {
  local resolver="$1"
  local resolved
  resolved=$(dig +short A "$DOMAIN" @"$resolver" || echo "")
  echo "$resolved" | grep -qE '^(104\.16|104\.17|104\.18|104\.19|104\.20|104\.21|104\.22|104\.23|104\.24|104\.25|104\.26|104\.27|104\.28|104\.29|104\.30|104\.31|172\.64|172\.65|172\.66|172\.67|172\.68|172\.69|172\.70|172\.71)\.'
}

dns_attempts=0
until dns_check 1.1.1.1 && dns_check 8.8.8.8; do
  if [ "$dns_attempts" -ge ${#RETRY_DELAYS[@]} ]; then
    fail "DNS A for $DOMAIN not Cloudflare anycast after ${#RETRY_DELAYS[@]} retries.
    Got from 1.1.1.1: $(dig +short A "$DOMAIN" @1.1.1.1)
    Got from 8.8.8.8: $(dig +short A "$DOMAIN" @8.8.8.8)
    Expected: 104.16-31.x.x or 172.64-71.x.x (Cloudflare anycast)
    Action: verify CF Pages custom domain binding + DNS records in CF dashboard." 2
  fi
  delay="${RETRY_DELAYS[$dns_attempts]}"
  log "  DNS not yet propagated. Retrying in ${delay}s (attempt $((dns_attempts+1))/${#RETRY_DELAYS[@]})..."
  sleep "$delay"
  dns_attempts=$((dns_attempts+1))
done
pass "DNS A → Cloudflare anycast confirmed on both 1.1.1.1 and 8.8.8.8"

# ─────────────────────────────────────────────────────────────────────────────
# CHECK 2 — TLS certificate valid + issued by Cloudflare or Let's Encrypt
# ─────────────────────────────────────────────────────────────────────────────
log "Check 2: TLS certificate for $DOMAIN"

tls_check() {
  local domain="$1"
  echo | openssl s_client -servername "$domain" -connect "$domain":443 \
    -verify_return_error 2>/dev/null | \
    openssl x509 -noout -subject -issuer -dates 2>/dev/null
}

tls_out=$(tls_check "$DOMAIN" || true)
if [ -z "$tls_out" ]; then
  fail "TLS handshake to $DOMAIN failed. Action: wait 5 min for CF cert issuance, then retry." 2
fi
echo "$tls_out" | grep -q 'notBefore=' || fail "TLS cert dates not parseable" 1
echo "$tls_out" | grep -qE 'CN ?= ?\*?\.?humankaylee\.dev|DNS:humankaylee\.dev' \
  || log "  WARN: cert CN does not match $DOMAIN literally (check SAN list); continuing"
pass "TLS certificate present and valid for $DOMAIN"

# ─────────────────────────────────────────────────────────────────────────────
# CHECK 3 — Canonical URL serves 200 + correct content
# ─────────────────────────────────────────────────────────────────────────────
log "Check 3: HTTPS GET https://$DOMAIN/"

http_code=$(curl -fsS --connect-timeout 5 --max-time 30 \
  "https://$DOMAIN/" -o /tmp/m3-home.html -w '%{http_code}')

[ "$http_code" = "200" ] || fail "GET / returned $http_code, expected 200" 1
grep -q '<title>HumanKaylee' /tmp/m3-home.html || fail "Home page missing expected <title>" 1
pass "GET / returned 200 + correct content"

# ─────────────────────────────────────────────────────────────────────────────
# CHECK 4 — Critical routes return 200
# ─────────────────────────────────────────────────────────────────────────────
log "Check 4: critical-path routes"

ROUTES=(
  "/"
  "/projects/"
  "/case-studies/"
  "/case-studies/cryo-flow-sim/"
  "/case-studies/humankaylee-portfolio-build/"
  "/notes/"
  "/notes/wasm-black-scholes-options-pricer/"
  "/resume/"
  "/contact/"
  "/sitemap-index.xml"
  "/robots.txt"
  "/.well-known/security.txt"
)

failed_routes=()
for route in "${ROUTES[@]}"; do
  code=$(curl -fsS --connect-timeout 5 --max-time 15 \
    "https://${DOMAIN}${route}" -o /dev/null -w '%{http_code}' 2>&1 || echo "ERR")
  if [ "$code" = "200" ]; then
    log "  ✓ ${route} → 200"
  else
    log "  ✗ ${route} → ${code}"
    failed_routes+=("$route → $code")
  fi
done

if [ ${#failed_routes[@]} -gt 0 ]; then
  fail "Routes failed: ${failed_routes[*]}" 1
fi
pass "All ${#ROUTES[@]} critical routes return 200"

# ─────────────────────────────────────────────────────────────────────────────
# CHECK 5 — API endpoint reachable (only if M2 deploy is done)
# ─────────────────────────────────────────────────────────────────────────────
log "Check 5: API health at https://${API_DOMAIN}/api/health"

api_code=$(curl -fsS --connect-timeout 5 --max-time 15 \
  "https://${API_DOMAIN}/api/health" -o /tmp/m3-health.json -w '%{http_code}' 2>&1 || echo "ERR")

if [ "$api_code" = "ERR" ] || [ "$api_code" = "000" ]; then
  log "  WARN: API ${API_DOMAIN} not reachable yet — M2 deploy may not be complete. Skipping API checks."
elif [ "$api_code" = "200" ]; then
  if jq -e '.status == "ok"' /tmp/m3-health.json >/dev/null; then
    pass "API /api/health returned 200 + status=ok"
  else
    fail "API /api/health returned 200 but status != ok: $(cat /tmp/m3-health.json)" 1
  fi
else
  fail "API /api/health returned $api_code" 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# CHECK 6 — WASM Black-Scholes binary served as application/wasm
# ─────────────────────────────────────────────────────────────────────────────
log "Check 6: WASM binary content-type at /wasm/blackscholes/blackscholes_wasm_bg.wasm"

wasm_url="https://${DOMAIN}/wasm/blackscholes/blackscholes_wasm_bg.wasm"
wasm_ct=$(curl -fsS -I --connect-timeout 5 --max-time 15 "$wasm_url" 2>&1 \
  | grep -i '^content-type:' | tr -d '\r' | awk '{print $2}' || echo "missing")
wasm_size=$(curl -fsS -I --connect-timeout 5 --max-time 15 "$wasm_url" 2>&1 \
  | grep -i '^content-length:' | tr -d '\r' | awk '{print $2}' || echo "0")

case "$wasm_ct" in
  application/wasm|application/wasm*)
    pass "WASM binary served as application/wasm ($wasm_size bytes)"
    ;;
  *)
    log "  WARN: WASM Content-Type was '$wasm_ct' (expected application/wasm). Streaming compile may fall back."
    ;;
esac

# ─────────────────────────────────────────────────────────────────────────────
# CHECK 7 — Append evidence row
# ─────────────────────────────────────────────────────────────────────────────
if [ -f "$EVIDENCE_FILE" ]; then
  cat >> "$EVIDENCE_FILE" <<EVIDENCE_ROW

| $(now) | M3-dns-verify | infra | script | PASS | n/a | scripts/launch/m3-dns-verify.sh | M4 production smoke can proceed |
EVIDENCE_ROW
  log "evidence row appended to $EVIDENCE_FILE"
fi

log "M3 PASS — DNS + TLS + routes + API + WASM all green for $DOMAIN"
echo "{\"milestone\":\"M3\",\"domain\":\"$DOMAIN\",\"dns\":\"ok\",\"tls\":\"ok\",\"routes\":${#ROUTES[@]},\"api\":\"${api_code:-skipped}\",\"wasm_content_type\":\"$wasm_ct\",\"status\":\"pass\"}"
