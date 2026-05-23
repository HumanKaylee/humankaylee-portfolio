# Quality Gates

Phase 7 launch gates are enforced locally and in CI.

## Local Checks

- `pnpm test:e2e -- --grep "@keyboard"` runs the launch keyboard
  reachability gate for primary navigation and the project atlas.
- `pnpm test:e2e -- --grep "@accessibility"` runs the Axe accessibility gate
  for core routes.
- `pnpm test:e2e -- --grep "@quality"` runs no-JS, reduced-motion, privacy,
  and route-quality checks on the core route set.
- `pnpm lighthouse:local` builds the Astro site, serves a production-equivalent local preview on `127.0.0.1:4322`, and audits home, projects, one case study, resume, and contact.
- `pnpm build && pnpm bundle:budget` measures executable JavaScript in built
  HTML and fails if a route exceeds the critical JavaScript budget.
- `pnpm run audit` runs the frontend pnpm audit and the Rust `cargo audit`
  check.

## Lighthouse Thresholds

The local Lighthouse gate fails if any audited route misses the PRD thresholds:

- Performance >= 90
- Accessibility >= 95
- Best Practices >= 95
- SEO >= 95

Reports are written to `test-results/lighthouse-*.json`, with a combined summary at `test-results/lighthouse-summary.json`.

## Bundle Budget

The bundle gate ignores JSON-LD metadata and counts executable inline scripts
plus same-origin Astro script assets referenced by each generated HTML route.
The current route budget is 8 KiB of critical JavaScript per page. Reports are
written to `test-results/bundle-budget-summary.json`.

## Manual Privacy Review

Before launch, inspect rendered pages and build artifacts for private hostnames, home-directory paths, tokens, credentials, private IPs, raw operational logs, and unpublished client details. Any finding is a launch blocker unless the coordinator records an approved exception.
