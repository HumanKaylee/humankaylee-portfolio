#!/usr/bin/env bash
# M3 — read-only DNS, TLS, route, canonical, redirect, and asset verification.
# Run only after an operator has approved the target public origin.

set -euo pipefail

DOMAIN="${DOMAIN:-joepoznanski.io}"
EVIDENCE_FILE="${EVIDENCE_FILE:-runbooks/LAUNCH_EVIDENCE.md}"
WRITE_EVIDENCE="${WRITE_EVIDENCE:-0}"
RETRY_DELAYS=(60 120 300)

FINAL_HTML_ROUTES=(
  "/"
  "/work/"
  "/work/cryo-flow-sim/"
  "/work/cli-fleet-synchronization-and-mcp-rollout/"
  "/work/remote-workstation-recovery-and-operational-debugging/"
  "/work/black-scholes-wasm/"
  "/about/"
  "/resume/"
  "/notes/"
  "/notes/wasm-black-scholes-options-pricer/"
  "/contact/"
)

FINAL_ASSET_ROUTES=(
  "/downloads/joe-poznanski-resume.pdf"
  "/sitemap-index.xml"
  "/robots.txt"
  "/.well-known/security.txt"
  "/wasm/blackscholes/blackscholes_wasm_bg.wasm"
)

# Each entry is input|expected canonical destination. These are redirect probes,
# never successful final-page targets.
LEGACY_REDIRECTS=(
  "/projects/|/work/"
  "/projects/cryo-flow-sim/|/work/cryo-flow-sim/"
  "/case-studies/|/work/"
  "/case-studies/cryo-flow-sim/|/work/cryo-flow-sim/"
)

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
require grep

tmp_dir=$(mktemp -d "${TMPDIR:-/tmp}/signal-proof-m3.XXXXXX")
cleanup() { rm -rf -- "$tmp_dir"; }
trap cleanup EXIT

log "Check 1: DNS A record for $DOMAIN"

dns_check() {
  local resolver="$1"
  local resolved
  resolved=$(dig +short A "$DOMAIN" @"$resolver" || true)
  printf '%s\n' "$resolved" | grep -qE '^(104\.(1[6-9]|2[0-9]|3[01])|172\.(6[4-9]|7[01]))\.'
}

dns_attempts=0
until dns_check 1.1.1.1 && dns_check 8.8.8.8; do
  if [ "$dns_attempts" -ge "${#RETRY_DELAYS[@]}" ]; then
    fail "DNS A for $DOMAIN did not resolve to Cloudflare anycast after ${#RETRY_DELAYS[@]} retries. Verify the approved custom-domain binding." 2
  fi
  delay="${RETRY_DELAYS[$dns_attempts]}"
  log "DNS not propagated; retrying in ${delay}s (attempt $((dns_attempts + 1))/${#RETRY_DELAYS[@]})."
  sleep "$delay"
  dns_attempts=$((dns_attempts + 1))
done
pass "DNS A resolves through Cloudflare on both public resolvers"

log "Check 2: TLS certificate for $DOMAIN"
tls_out=$(
  echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN":443 \
    -verify_return_error 2>/dev/null | \
    openssl x509 -noout -subject -issuer -dates 2>/dev/null || true
)
[ -n "$tls_out" ] || fail "TLS handshake to $DOMAIN failed" 2
printf '%s\n' "$tls_out" | grep -q 'notBefore=' || fail "TLS certificate dates are not parseable" 1
pass "TLS certificate is present and valid"

check_canonical() {
  local route="$1"
  local safe="$2"
  local output="$tmp_dir/${safe}.html"
  local status
  local expected="https://${DOMAIN}${route}"

  status=$(curl -sS --connect-timeout 5 --max-time 30 \
    "https://${DOMAIN}${route}" -o "$output" -w '%{http_code}' || echo "ERR")
  [ "$status" = "200" ] || fail "GET ${route} returned ${status}, expected 200" 1
  grep -Fq 'rel="canonical"' "$output" || fail "${route} is missing rel=\"canonical\"" 1
  grep -Fq "href=\"${expected}\"" "$output" || fail "${route} canonical does not equal ${expected}" 1
  grep -Fq 'Joe Poznanski' "$output" || fail "${route} is missing the public identity" 1
  log "  ${route} → 200, canonical ${expected}"
}

log "Check 3: final HTML routes and canonical URLs"
for index in "${!FINAL_HTML_ROUTES[@]}"; do
  check_canonical "${FINAL_HTML_ROUTES[$index]}" "html-${index}"
done
pass "All ${#FINAL_HTML_ROUTES[@]} final HTML routes return 200 with aligned canonical URLs"

log "Check 4: final static assets"
for route in "${FINAL_ASSET_ROUTES[@]}"; do
  status=$(curl -sS --connect-timeout 5 --max-time 30 \
    "https://${DOMAIN}${route}" -o /dev/null -w '%{http_code}' || echo "ERR")
  [ "$status" = "200" ] || fail "GET ${route} returned ${status}, expected 200" 1
  log "  ${route} → 200"
done

pdf_type=$(curl -sS -I --connect-timeout 5 --max-time 15 \
  "https://${DOMAIN}/downloads/joe-poznanski-resume.pdf" | \
  awk 'BEGIN{IGNORECASE=1} /^Content-Type:/{gsub("\\r", ""); print $2; exit}')
[[ "$pdf_type" == application/pdf* ]] || fail "Résumé Content-Type is '${pdf_type:-missing}', expected application/pdf" 1

wasm_type=$(curl -sS -I --connect-timeout 5 --max-time 15 \
  "https://${DOMAIN}/wasm/blackscholes/blackscholes_wasm_bg.wasm" | \
  awk 'BEGIN{IGNORECASE=1} /^Content-Type:/{gsub("\\r", ""); print $2; exit}')
[[ "$wasm_type" == application/wasm* ]] || fail "WASM Content-Type is '${wasm_type:-missing}', expected application/wasm" 1
pass "Résumé PDF, metadata files, security file, and WASM assets are available with required types"

check_legacy_redirect() {
  local input="$1"
  local expected_path="$2"
  local probe
  local status
  local redirect_url
  local expected_url="https://${DOMAIN}${expected_path}"

  probe=$(curl -sS --connect-timeout 5 --max-time 15 \
    "https://${DOMAIN}${input}" -o /dev/null -w '%{http_code}\t%{redirect_url}' || echo "ERR")
  IFS=$'\t' read -r status redirect_url <<<"$probe"
  case "$status" in
    301|308) ;;
    *) fail "Legacy input ${input} returned ${status}, expected a permanent HTTP redirect" 1 ;;
  esac
  [ "$redirect_url" = "$expected_url" ] || fail "Legacy input ${input} redirects to ${redirect_url:-missing}, expected ${expected_url}" 1
  log "  ${input} → ${status} ${redirect_url}"
}

log "Check 5: legacy redirect inputs"
for pair in "${LEGACY_REDIRECTS[@]}"; do
  IFS='|' read -r input expected <<<"$pair"
  check_legacy_redirect "$input" "$expected"
done
pass "All ${#LEGACY_REDIRECTS[@]} legacy inputs redirect to canonical Work destinations"

if [ "$WRITE_EVIDENCE" = "1" ] && [ -f "$EVIDENCE_FILE" ]; then
  cat >> "$EVIDENCE_FILE" <<EVIDENCE_ROW

| $(now) | M3-signal-proof-origin | infra | script | PASS | n/a | scripts/launch/m3-dns-verify.sh | Read-only public-origin probes passed for ${DOMAIN} |
EVIDENCE_ROW
  log "local evidence row appended to $EVIDENCE_FILE"
fi

log "M3 PASS — DNS, TLS, current routes, canonicals, assets, and redirects are green for $DOMAIN"
printf '{"milestone":"M3","domain":"%s","html_routes":%s,"assets":%s,"redirects":%s,"status":"pass"}\n' \
  "$DOMAIN" "${#FINAL_HTML_ROUTES[@]}" "${#FINAL_ASSET_ROUTES[@]}" "${#LEGACY_REDIRECTS[@]}"
