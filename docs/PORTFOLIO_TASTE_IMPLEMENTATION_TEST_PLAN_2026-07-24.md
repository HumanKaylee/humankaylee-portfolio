# Portfolio Taste Implementation and Test Plan

Date: 2026-07-24  
Mode: local, targeted evolution. No deploy, route, navigation-label, or contact-data decision is authorized by this plan.

## Implementation sequence

1. Add behavior-level tests for the renamed public identity/domain/resume file, the non-persistent fallback notice, the supported Fly contact mode, and the CSP API-origin allowlist.
2. Make the smallest visual changes: reduce shared H1 scale, use a natural two-row mobile navigation grid, elevate one homepage CTA, and remove the redundant static banner while preserving `<noscript>`.
3. Repair the invalid Fly mode and use a narrowly allowlisted `connect-src` for the configured API origin. Escape `<` in JSON-LD before `set:html`.
4. Capture new full-page evidence before accepting snapshot updates. Inspect desktop and mobile screenshots rather than treating a green pixel comparison as design approval.
5. Update reusable Taste/Claude workflows and publish a public-safe local report.

## Required visual inspection matrix

| Route | Chromium desktop 1440 x 1200 | Chromium mobile 390 x 844 | WebKit desktop | Review focus |
| --- | --- | --- | --- | --- |
| `/` | Required | Required | Required | First-fold identity, primary CTA, systems-map balance, no redundant banner. |
| `/projects/` | Required | Required | Required | Page-title scale, navigation density, atlas readability. |
| `/case-studies/cli-fleet-synchronization-and-mcp-rollout/` | Required | Required | Optional | Content rhythm and evidence treatment. |
| `/resume/` | Required | Required | Optional | Recruiter scan path, PDF action, print treatment. |
| `/notes/` and a detail page | Required | Required | Optional | Long-form rhythm and no overflow. |
| `/contact/` | Required | Required | Required | Form/fallback contrast, focus states, clear error/fallback behavior. |
| `/now/`, `/uses/`, `/reading/`, and one project detail | Required | Required | Optional | Coverage gap beyond the existing visual snapshot set. |

Use full-page screenshots with `main` as the readiness selector. Review in an image viewer before accepting any baseline. Test reduced motion, no-JavaScript, keyboard navigation, 44px targets, contrast, and horizontal overflow separately from screenshot comparison.

## Automated V&V order

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm build`
5. `pnpm bundle:budget`
6. `pnpm test:e2e -- --grep "@keyboard|@accessibility|@security|@responsive"`
7. `pnpm test:e2e -- --grep "@responsive" --browser=all`
8. `pnpm test:e2e`
9. `pnpm test:visual` (run only when port 4321 is free; do not overwrite baselines first)
10. `pnpm lighthouse:local`
11. `cargo fmt --manifest-path apps/api/Cargo.toml --check`
12. `cargo clippy --manifest-path apps/api/Cargo.toml --all-targets -- -D warnings`
13. `cargo test --manifest-path apps/api/Cargo.toml`
14. `pnpm audit --audit-level moderate` and `cargo audit --file apps/api/Cargo.lock`

## Acceptance criteria

- The homepage exposes a clear primary path without scrolling at the target desktop and mobile sizes.
- Navigation remains complete and keyboard accessible, in natural reading order with a compact two-row mobile layout and no horizontal overflow.
- `<noscript>` remains the static fallback notice; no persistent technical banner is rendered in normal JavaScript-capable pages.
- API configuration and CSP are mutually compatible while contact delivery stays disabled pending an explicit privacy/retention decision.
- No snapshot is updated without actual visual inspection. New or pre-existing failures are reported with their cause and not relabeled as production evidence.

## Follow-up backlog

1. Land a pinned dependency-refresh PR to remediate audit findings, including Astro/Vite/Vitest/Wrangler transitive chains.
2. Move rate limiting to edge/trusted-client-IP controls and a bounded TTL server cache before accepting public traffic.
3. Pin GitHub Actions by immutable SHA and protect deployment environments.
4. Decide contact-storage provider, retention, backup, deletion, encryption, and incident process before enabling contact persistence.
5. Add a deterministic cross-platform visual snapshot policy or run visual snapshots on one declared OS only.
