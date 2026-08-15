#!/usr/bin/env bash
# M4 — read-only production quality smoke for the Signal / Proof portfolio.
# Run only after m3-dns-verify.sh passes for the same approved public origin.

set -euo pipefail

DOMAIN="${DOMAIN:-humankaylee.dev}"
EVIDENCE_FILE="${EVIDENCE_FILE:-runbooks/LAUNCH_EVIDENCE.md}"
WRITE_EVIDENCE="${WRITE_EVIDENCE:-0}"
ARTIFACT_DIR="${ARTIFACT_DIR:-test-results/m4}"

LH_PERF_MIN="0.90"
LH_A11Y_MIN="0.95"
LH_BP_MIN="0.95"
LH_SEO_MIN="0.95"

LIGHTHOUSE_PAGES=(
  "/"
  "/work/"
  "/work/cryo-flow-sim/"
  "/resume/"
  "/contact/"
)

mkdir -p "$ARTIFACT_DIR"

now() { date -u +%Y-%m-%dT%H:%M:%SZ; }
log() { printf '[%s] [M4] %s\n' "$(now)" "$*"; }
fail() { log "FAIL: $*"; exit "${2:-1}"; }
pass() { log "PASS: $*"; }

require() {
  command -v "$1" >/dev/null 2>&1 || fail "missing required tool: $1" 3
}

require curl
require jq
require pnpm
require node

log "Check 1: Lighthouse on ${#LIGHTHOUSE_PAGES[@]} current pages"

pnpm exec lighthouse --version >/dev/null 2>&1 || \
  fail "repository Lighthouse CLI is unavailable; run the locked install before M4" 3

failed_lh=()
for path in "${LIGHTHOUSE_PAGES[@]}"; do
  safe=$(printf '%s' "$path" | tr / _ | sed 's/^_//;s/_$//')
  [ -n "$safe" ] || safe="root"
  out="$ARTIFACT_DIR/lh-${safe}.json"
  rm -f -- "$out"
  log "  Lighthouse https://${DOMAIN}${path}"

  if ! pnpm exec lighthouse \
    "https://${DOMAIN}${path}" \
    --quiet \
    --chrome-flags="--headless=new --no-sandbox" \
    --output=json \
    --output-path="$out" \
    --only-categories=performance,accessibility,best-practices,seo; then
    failed_lh+=("${path}: lighthouse process failed")
    continue
  fi

  if [ ! -s "$out" ]; then
    failed_lh+=("${path}: report missing")
    continue
  fi

  scores=$(jq -r '[
    .categories.performance.score,
    .categories.accessibility.score,
    .categories["best-practices"].score,
    .categories.seo.score
  ] | @tsv' "$out" 2>/dev/null || printf 'x\tx\tx\tx')
  read -r perf a11y bp seo <<<"$scores"

  meets() { awk -v actual="$1" -v expected="$2" 'BEGIN{exit !(actual + 0 >= expected + 0)}'; }
  if meets "$perf" "$LH_PERF_MIN" && \
     meets "$a11y" "$LH_A11Y_MIN" && \
     meets "$bp" "$LH_BP_MIN" && \
     meets "$seo" "$LH_SEO_MIN"; then
    log "  ${path} → P=${perf} A=${a11y} BP=${bp} SEO=${seo}"
  else
    failed_lh+=("${path}: P=${perf} A=${a11y} BP=${bp} SEO=${seo}")
  fi
done

if [ "${#failed_lh[@]}" -gt 0 ]; then
  fail "Lighthouse failed or missed threshold: $(printf '%s; ' "${failed_lh[@]}")" 1
fi
pass "Lighthouse passed on all ${#LIGHTHOUSE_PAGES[@]} current pages"

log "Check 2: optional read-only Playwright public-origin smoke"
if pnpm exec playwright test --list 2>/dev/null | grep -q '@production'; then
  PLAYWRIGHT_BASE_URL="https://${DOMAIN}" \
    pnpm test:e2e -- --grep "@production" --reporter=list \
    2>&1 | tee "$ARTIFACT_DIR/playwright-production.log"
  [ "${PIPESTATUS[0]}" -eq 0 ] || \
    fail "Playwright public-origin smoke failed; inspect $ARTIFACT_DIR/playwright-production.log" 1
  pass "Playwright public-origin smoke passed"
else
  log "  no @production-tagged checks are present; M3 route probes remain authoritative"
fi

log "Check 3: static Contact direct channels"
contact_html="$ARTIFACT_DIR/contact.html"
contact_status=$(curl -sS --connect-timeout 5 --max-time 30 \
  "https://${DOMAIN}/contact/" -o "$contact_html" -w '%{http_code}' || echo "ERR")
[ "$contact_status" = "200" ] || fail "GET /contact/ returned ${contact_status}, expected 200" 1

for channel in 'mailto:' 'linkedin.com' 'github.com'; do
  grep -Fqi "$channel" "$contact_html" || fail "Contact page is missing ${channel}" 1
done
if grep -Eqi '<form|backend delivery|response guarantee' "$contact_html"; then
  fail "Contact page exposes a stateful submission or delivery surface" 1
fi
pass "Contact exposes email, LinkedIn, and GitHub as static direct channels"

log "Check 4: local production build and bundle budget"
pnpm build > "$ARTIFACT_DIR/build.log" 2>&1 || \
  fail "Production build failed; inspect $ARTIFACT_DIR/build.log" 1
node scripts/bundle-budget.mjs > "$ARTIFACT_DIR/bundle-budget.log" 2>&1 || \
  fail "Bundle budget failed; inspect $ARTIFACT_DIR/bundle-budget.log" 1
pass "Production build and bundle budget passed"

if [ "$WRITE_EVIDENCE" = "1" ] && [ -f "$EVIDENCE_FILE" ]; then
  cat >> "$EVIDENCE_FILE" <<EVIDENCE_ROW

| $(now) | M4-signal-proof-smoke | qa | script | PASS | n/a | scripts/launch/m4-production-smoke.sh, ${ARTIFACT_DIR}/ | Read-only public-origin quality probes passed for ${DOMAIN} |
EVIDENCE_ROW
  log "local evidence row appended to $EVIDENCE_FILE"
fi

log "M4 PASS — current Lighthouse, optional browser checks, static Contact, build, and bundle gates are green for $DOMAIN"
printf '{"milestone":"M4","domain":"%s","lighthouse":%s,"contact":"static-direct","status":"pass"}\n' \
  "$DOMAIN" "${#LIGHTHOUSE_PAGES[@]}"
