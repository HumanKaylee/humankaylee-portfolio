# Quality Gates

Phase 7 launch gates are enforced locally and in CI.

## Local Checks

- `pnpm test:e2e -- --grep "@quality"` runs no-JS, reduced-motion, privacy, and Axe accessibility checks on the core route set.
- `pnpm lighthouse:local` builds the Astro site, serves a production-equivalent local preview on `127.0.0.1:4322`, and audits home, projects, one case study, resume, and contact.
- `pnpm run audit` runs the frontend pnpm audit and the Rust `cargo audit`
  check.

## Lighthouse Thresholds

The local Lighthouse gate fails if any audited route misses the PRD thresholds:

- Performance >= 90
- Accessibility >= 95
- Best Practices >= 95
- SEO >= 95

Reports are written to `test-results/lighthouse-*.json`, with a combined summary at `test-results/lighthouse-summary.json`.

## Manual Privacy Review

Before launch, inspect rendered pages and build artifacts for private hostnames, home-directory paths, tokens, credentials, private IPs, raw operational logs, and unpublished client details. Any finding is a launch blocker unless the coordinator records an approved exception.
