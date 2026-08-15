# Quality Gates

Automated launch quality gates are enforced locally and in CI. Manual privacy
review is a separate launch blocker check and cannot be fully enforced by CI.
Assistive-technology and public-origin review also remain separate launch
checks.

Phase 0 CI keeps the `pull_request` trigger for the full suite and scopes the
`push` trigger to `main`, avoiding duplicate feature-branch runs. The
`@keyboard`, `@accessibility`, `@security`, `@api-down`, `@journey`,
`@static-shell`, `@visual-surfaces`, and `@quality` tags run as dedicated
Playwright gates before the umbrella E2E sweep. These focused gates
intentionally duplicate part of the later umbrella sweep to keep CI failures
diagnosable.

## Local checks

- `pnpm test:e2e -- --grep "@keyboard"` verifies keyboard reachability for
  primary navigation, ProjectStage Work links, résumé access, and direct
  contact channels.
- `pnpm test:e2e -- --grep "@accessibility"` runs Axe against the public route
  set and fails on serious or critical findings.
- `pnpm test:e2e -- --grep "@security"` checks the static security-header
  policy used by Astro middleware and static hosting.
- `pnpm test:e2e -- --grep "@api-down"` proves representative public routes and
  static direct channels remain complete when API requests fail.
- `pnpm test:e2e -- --grep "@journey"` verifies the Home-to-Work proof journey,
  resume PDF journey, and direct-email journey.
- `pnpm test:e2e -- --grep "@static-shell|@visual-surfaces"` verifies core
  static shell and art-directed surface coverage, including notes/build-log
  index and detail routes, as local QA evidence only. The gate requires
  meaningful static HTML, ProjectStage, EvidenceStrip, real media, current Work
  routes, and the flat Signal / Proof visual surface.
- `pnpm test:e2e -- --grep "@quality"` runs the static quality matrix:
  no-JavaScript, reduced-motion, privacy, route, and accessibility checks on
  the launch routes.
- `runbooks/ACCESSIBILITY_AUDIT.md` records the B-048 page-by-page checklist and
  the local/CI evidence boundary.
- `runbooks/MOTION_AND_WEBGL_FALLBACK_QA.md` records B-049 reduced-motion,
  no-WebGL, static ProjectStage, and current platform screenshot evidence.
- `node --test scripts/accessibility-and-fallback-qa-contract.test.mjs` keeps
  those artifacts tied to backlog and launch evidence.
- `node scripts/lighthouse-local.mjs --dry-run` prints the B-050 audit plan with
  warm-up/scored route boundaries and artifact paths without launching Chrome.
- `pnpm lighthouse:local` builds the site, serves a production-equivalent local
  preview, runs a non-scored warm-up, and audits home, Work, Cryogenic Flow,
  resume, and contact.
- `node scripts/bundle-budget.mjs --dry-run` prints the B-051 bundle-budget plan
  with the `dist/**/*.html` route source, ignored non-executable script types,
  8 KiB route budget, and `test-results/bundle-budget-summary.json` without
  requiring build artifacts.
- `pnpm build && pnpm bundle:budget` measures executable critical JavaScript in
  generated HTML and fails when a route exceeds budget.
- `pnpm run audit` runs the frontend package audit and Rust `cargo audit`.

## Visual CI Triage

Do not update snapshots, raise diff thresholds, or rerun a failed job until the
failing artifact and job log have been inspected. Inspect its expected, actual,
diff, and pixel count before changing any baseline.

1. Fetch the exact CI log with
   `gh run view <run-id> --repo HumanKaylee/humankaylee-portfolio --job <job-id> --log`.
2. Identify the failing spec, platform snapshot, expected artifact, actual
   artifact, diff, and pixel count.
3. Reproduce the focused failure. For the current no-WebGL surface, run
   `pnpm exec playwright test tests/e2e/no-webgl.spec.ts` and inspect
   `no-webgl-signal-proof-home.png`.
4. Run `pnpm test:e2e` and `pnpm test:visual` to catch ordering or platform
   drift.
5. Inspect `git status --short --branch`; a dirty source, snapshot, or threshold
   change is not evidence of a flake.

Only rerun a failed CI job as a transient visual flake after the focused spec
and the umbrella E2E sweep pass locally without source, snapshot, or threshold
changes. Use
`gh run rerun <run-id> --repo HumanKaylee/humankaylee-portfolio --failed` only
after those preconditions pass. If the same visual check fails again in CI,
treat it as repeatable CI-only drift and investigate before changing snapshots.
Baseline updates are valid only for intentional, public-safe, visually
inspected changes followed by a zero-diff rerun on the named platform.

## Lighthouse thresholds

Every scored route must meet:

- Performance >= 90
- Accessibility >= 95
- Best Practices >= 95
- SEO >= 95

Homepage mobile LCP must be below 2.5 seconds. Reports are written to
`test-results/lighthouse-*.json`; the warm-up is diagnostic only and
`test-results/lighthouse-summary.json` is authoritative.

## Bundle budget

The bundle gate ignores JSON-LD and counts executable inline scripts plus
same-origin Astro script assets referenced by each generated route. The current
limit is 8 KiB of critical JavaScript per page. Results are written to
`test-results/bundle-budget-summary.json`.

## Security headers

Astro middleware covers local/dev responses and `apps/web/public/_headers`
covers static hosting. The gate checks Content Security Policy, frame denial,
MIME sniffing protection, referrer policy, cross-origin isolation, and disabled
browser permissions across the launch routes.

## Manual privacy review

Before launch, inspect rendered pages and built artifacts for private hostnames,
home-directory paths, credentials, private IP addresses, raw operational logs,
and unpublished details. Any finding is a blocker unless an approved exception
is recorded.
