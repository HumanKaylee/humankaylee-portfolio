# HumanKaylee Portfolio

Planning and execution repository for a private, resume-ready personal portfolio site for `HumanKaylee`.

## Current Status

- Research brief: [docs/RESEARCH.md](docs/RESEARCH.md)
- Product requirements: [docs/PRD.md](docs/PRD.md)
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Roadmap: [docs/ROADMAP.md](docs/ROADMAP.md)
- Backlog: [docs/BACKLOG.md](docs/BACKLOG.md)
- Implementation and test plan: [docs/IMPLEMENTATION_AND_TEST_PLAN.md](docs/IMPLEMENTATION_AND_TEST_PLAN.md)
- Operations runbook: [docs/OPERATIONS.md](docs/OPERATIONS.md)
- Deployment runbook: [runbooks/DEPLOYMENT.md](runbooks/DEPLOYMENT.md)
- Content update and redaction runbook: [runbooks/CONTENT_UPDATE_AND_REDACTION.md](runbooks/CONTENT_UPDATE_AND_REDACTION.md)
- Content strategy: [docs/CONTENT_STRATEGY.md](docs/CONTENT_STRATEGY.md)

## Working Decision

Build a static-first, visually distinctive portfolio with progressive 3D and motion. Use Rust where it creates credible backend proof, not as unnecessary complexity in the critical rendering path.

## Local Command Contract

Run from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm preview
pnpm lighthouse:local
cargo fmt --manifest-path apps/api/Cargo.toml --check
cargo clippy --manifest-path apps/api/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path apps/api/Cargo.toml
cargo run --manifest-path apps/api/Cargo.toml --bin humankaylee-api
```

Current pre-launch status: the static frontend includes home, projects, reviewed
case-study routes, resume, notes/RSS, sitemap/robots, metadata, and an
accessible project atlas fallback. The Rust API exposes `GET /api/health`,
`GET /api/projects/live`, `POST /api/contact`, and gated `POST /api/events`.
Production launch still requires approved case-study redaction, final
deployment targets, and an approved persistent contact store path or provider.
