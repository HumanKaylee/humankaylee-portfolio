# AGENTS.md - HumanKaylee Portfolio

## Purpose

This repository plans and will implement HumanKaylee's private, resume-ready portfolio site. Treat docs as the current source of truth until product code exists.

## Current Source Order

1. `docs/PRD.md`
2. `docs/RESEARCH.md`
3. `docs/IMPLEMENTATION_AND_TEST_PLAN.md`
4. `docs/ARCHITECTURE.md`
5. `docs/ROADMAP.md`
6. `docs/BACKLOG.md`

## Build Direction

- Static-first frontend with Astro, TypeScript, custom CSS, React islands, progressive Three.js/R3F, and selective GSAP.
- Rust backend with Axum/Tokio for API features that prove backend skill without making static content depend on API uptime.
- Hosting target: Cloudflare Pages frontend plus Shuttle Rust API initially; keep Fly.io/Railway fallback documented.
- Visual direction: "The Systems Atelier", not generic SaaS/purple AI.

## Agent Workflow

- Use the implementation plan before touching product code.
- Prefer non-colliding agents by ownership area: content, shell/layout, visual/WebGL, Rust API, CI/deployment, accessibility/performance.
- Smaller/cheaper models may own mechanical tasks with exact file paths and acceptance criteria.
- Use stronger models for design, architecture, visual-system, security, and final review.
- Never publish secrets, private machine details, passwords, tokens, or unredacted operational logs.

## Verification

Expected final implementation checks will include:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `cargo fmt --check`
- `cargo clippy --all-targets --all-features -- -D warnings`
- `cargo test`
- Playwright smoke tests
- Lighthouse checks on production or preview URLs

Do not claim launch readiness unless the exact commands in `docs/IMPLEMENTATION_AND_TEST_PLAN.md` pass or documented exceptions are approved.

