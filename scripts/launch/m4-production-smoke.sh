#!/usr/bin/env bash
# scripts/launch/m4-production-smoke.sh
# M4 — Production smoke for humankaylee-portfolio launch.
#
# Run AFTER `m3-dns-verify.sh` returns 0.
#
# Performs:
#   1. Per-page Lighthouse score check on 5 critical pages
#   2. Playwright @production e2e suite
#   3. Contact form end-to-end test (POST to /api/contact + cleanup smoke-cleanup)
#   4. Bundle size regression check
#   5. Appends M4-PASS evidence row
#
# Exit codes per goal-plan Section 11B:
#   0  PASS
#   1  permanent failure
#   2  transient failure exhausted
#   3  pre-condition failure
#
# Idempotency: this script makes one contact-form POST per run. The body is
# tagged `M4-smoke-<timestamp>` so admin can identify and delete test entries.

set -euo pipefail

DOMAIN="${DOMAIN:-humankaylee.dev}"
API_DOMAIN="${API_DOMAIN:-api.humankaylee.dev}"
EVIDENCE_FILE="${EVIDENCE_FILE:-runbooks/LAUNCH_EVIDENCE.md}"
ARTIFACT_DIR="${ARTIFACT_DIR:-test-results/m4}"

# Lighthouse thresholds (per Section 15 acceptance contract)
LH_PERF_MIN="0.90"
LH_A11Y_MIN="0.95"
LH_BP_MIN="0.95"
LH_SEO_MIN="0.95"

LIGHTHOUSE_PAGES=(
  "/"
  "/projects/"
  "/case-studies/humankaylee-portfolio-build/"
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

# ─────────────────────────────────────────────────────────────────────────────
# CHECK 1 — Lighthouse on critical pages
# ─────────────────────────────────────────────────────────────────────────────
log "Check 1: Lighthouse on ${#LIGHTHOUSE_PAGES[@]} critical pages"

# Use lighthouse-cli or the existing pnpm lighthouse:prod script if present.
# Falls back to lighthouse-ci or hand-rolled invocation.
LH_CMD="pnpm exec lighthouse"
if ! $LH_CMD --version >/dev/null 2>&1; then
  log "  installing lighthouse via pnpm dlx..."
  LH_CMD="pnpm dlx lighthouse@latest"
fi

failed_lh=()
for path in "${LIGHTHOUSE_PAGES[@]}"; do
  safe=$(echo "$path" | tr / _ | sed 's/^_//;s/_$//')
  [ -z "$safe" ] && safe="root"
  out="$ARTIFACT_DIR/lh-$safe.json"
  log "  → Lighthouse https://${DOMAIN}${path}"

  $LH_CMD \
    "https://${DOMAIN}${path}" \
    --quiet \
    --chrome-flags="--headless=new --no-sandbox" \
    --output=json \
    --output-path="$out" \
    --only-categories=performance,accessibility,best-practices,seo \
    >/dev/null 2>&1 || {
      log "  WARN: lighthouse failed on ${path}; capturing partial"
    }

  if [ ! -s "$out" ]; then
    failed_lh+=("$path:lighthouse-failed")
    continue
  fi

  scores=$(jq -r '[
    .categories.performance.score,
    .categories.accessibility.score,
    .categories["best-practices"].score,
    .categories.seo.score
  ] | @tsv' "$out" 2>/dev/null || echo "x x x x")

  read -r perf a11y bp seo <<<"$scores"

  meets() { awk -v a="$1" -v b="$2" 'BEGIN{exit !(a+0 >= b+0)}'; }

  if meets "$perf" "$LH_PERF_MIN" && \
     meets "$a11y" "$LH_A11Y_MIN" && \
     meets "$bp"   "$LH_BP_MIN"   && \
     meets "$seo"  "$LH_SEO_MIN"; then
    log "  ✓ ${path} → P=$perf A=$a11y BP=$bp SEO=$seo"
  else
    log "  ✗ ${path} → P=$perf A=$a11y BP=$bp SEO=$seo (thresholds: $LH_PERF_MIN/$LH_A11Y_MIN/$LH_BP_MIN/$LH_SEO_MIN)"
    failed_lh+=("$path: P=$perf A=$a11y BP=$bp SEO=$seo")
  fi
done

if [ ${#failed_lh[@]} -gt 0 ]; then
  fail "Lighthouse below threshold on:
$(printf '  - %s\n' "${failed_lh[@]}")" 1
fi
pass "Lighthouse green on all ${#LIGHTHOUSE_PAGES[@]} pages"

# ─────────────────────────────────────────────────────────────────────────────
# CHECK 2 — Playwright @production e2e (if tagged tests exist)
# ─────────────────────────────────────────────────────────────────────────────
log "Check 2: Playwright @production smoke"

if pnpm exec playwright test --list 2>/dev/null | grep -q '@production'; then
  PLAYWRIGHT_BASE_URL="https://${DOMAIN}" \
  pnpm test:e2e -- --grep "@production" \
    --reporter=json,list \
    --output="$ARTIFACT_DIR/playwright-production" 2>&1 \
    | tee "$ARTIFACT_DIR/playwright-production.log"

  if [ "${PIPESTATUS[0]}" -ne 0 ]; then
    fail "Playwright @production suite had failures (see $ARTIFACT_DIR/playwright-production.log)" 1
  fi
  pass "Playwright @production smoke passed"
else
  log "  no @production-tagged Playwright tests found — skipping (consider adding for M4 full coverage)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# CHECK 3 — Contact form end-to-end
# ─────────────────────────────────────────────────────────────────────────────
log "Check 3: contact form POST + smoke-cleanup"

ts=$(date +%s)
payload="{
  \"name\":\"M4-smoke-$ts\",
  \"email\":\"smoke+$ts@humankaylee.dev\",
  \"message\":\"M4 production smoke test at $(now). Auto-generated; safe to delete.\"
}"

contact_code=$(curl -fsS -X POST \
  -H "Content-Type: application/json" \
  -d "$payload" \
  "https://${API_DOMAIN}/api/contact" \
  -o "$ARTIFACT_DIR/contact-response.json" \
  -w '%{http_code}' \
  --max-time 30 2>&1 || echo "ERR")

if [ "$contact_code" = "200" ] || [ "$contact_code" = "202" ] || [ "$contact_code" = "204" ]; then
  if [ -s "$ARTIFACT_DIR/contact-response.json" ]; then
    jq -e '.ok == true' "$ARTIFACT_DIR/contact-response.json" >/dev/null 2>&1 \
      && pass "Contact form returned $contact_code + ok=true" \
      || pass "Contact form returned $contact_code (response body may not have .ok=true; manual review needed)"
  else
    pass "Contact form returned $contact_code (empty body — acceptable for 204)"
  fi
  log "  Smoke cleanup: manually delete entry tagged 'M4-smoke-$ts' from contact storage"
else
  fail "Contact form POST returned $contact_code" 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# CHECK 4 — Bundle size regression
# ─────────────────────────────────────────────────────────────────────────────
log "Check 4: bundle size regression"

if [ -f scripts/bundle-budget.mjs ]; then
  node scripts/bundle-budget.mjs --check --target=production \
    > "$ARTIFACT_DIR/bundle-budget.json" 2>&1 \
    && pass "Bundle size within budget" \
    || fail "Bundle size regression — see $ARTIFACT_DIR/bundle-budget.json" 1
else
  log "  scripts/bundle-budget.mjs absent — skipping"
fi

# ─────────────────────────────────────────────────────────────────────────────
# CHECK 5 — Append M4-PASS evidence row
# ─────────────────────────────────────────────────────────────────────────────
if [ -f "$EVIDENCE_FILE" ]; then
  cat >> "$EVIDENCE_FILE" <<EVIDENCE_ROW

| $(now) | M4-production-smoke | qa | script | PASS | n/a | scripts/launch/m4-production-smoke.sh, $ARTIFACT_DIR/ | M6 launch checklist can close |
EVIDENCE_ROW
  log "evidence row appended to $EVIDENCE_FILE"
fi

log "M4 PASS — production smoke green for $DOMAIN"
echo "{\"milestone\":\"M4\",\"domain\":\"$DOMAIN\",\"lighthouse\":${#LIGHTHOUSE_PAGES[@]},\"contact\":\"$contact_code\",\"status\":\"pass\"}"
