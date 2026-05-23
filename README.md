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

Phase 0 status: the frontend and backend are scaffold-stage only. The home page is intentionally honest about incomplete PRD features, and the Rust API currently exposes only `GET /api/health`.
