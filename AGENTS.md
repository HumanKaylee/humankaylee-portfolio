# AGENTS.md - HumanKaylee Portfolio

## Purpose

This repository implements and documents HumanKaylee's private, resume-ready
portfolio site. Treat docs, runbooks, and contract tests as the current source
of truth for implementation state, launch blockers, and production evidence.

## Current Source Order

1. `docs/PRD.md`
2. `docs/RESEARCH.md`
3. `docs/IMPLEMENTATION_AND_TEST_PLAN.md`
4. `docs/ARCHITECTURE.md`
5. `docs/ROADMAP.md`
6. `docs/BACKLOG.md`
7. `docs/CONTENT_STRATEGY.md`
8. `docs/CONTENT_REDACTION_GUIDE.md`
9. `docs/PRIVACY.md`
10. `docs/OPERATIONS.md`
11. `docs/GITHUB_SYNC.md`
12. `runbooks/LAUNCH_EVIDENCE.md`

## Build Direction

- Static-first frontend with Astro, TypeScript, custom CSS, React islands, progressive Three.js/R3F, and selective GSAP.
- Rust backend with Axum/Tokio for API features that prove backend skill without making static content depend on API uptime.
- Hosting target: Cloudflare Pages frontend plus Fly.io, Railway, or another
  approved host as the approved current-host comparison set for #64. Cloudflare
  Workers/Pages Functions are an edge/runtime rewrite option, and Hetzner is the
  higher-ops VPS fallback.
- Shuttle is not a viable new launch target as of the 2026-05-24
  official-source snapshot: https://docs.shuttle.dev/docs/shuttle-shutdown. Do
  not use Shuttle for a new production launch; keep the feature-gated Shuttle
  binary only as legacy compatibility until removed or replaced.
- Visual direction: "The Systems Atelier", not generic SaaS/purple AI.

## Agent Workflow

- Use the implementation plan before touching product code, and check the
  launch evidence runbook before claiming any production state.
- Content, case-study, notes, resume, contact, or analytics work must also read
  the content strategy, redaction guide, and privacy summary before changing
  public-facing evidence.
- `reviewed` is never launch-eligible; the launch-eligible case-study count
  stays `0` until real human approval evidence exists.
- Run `pnpm redaction:readiness` before redaction approval or reviewer handoff
  work. Evidence Authority is `local/redaction-readiness`. Use the generated
  summary as reviewer handoff input only; it cannot approve case studies, clear
  open items, close #20/#21/#24/#25, or count `reviewed` work toward launch.
- Run `pnpm phase7:contact-decision -- --mode defer --dry-run` before contact
  handling decision handoff work. Evidence Authority is
  `local/decision-template`. Use the template only to shape owner approval,
  retention, backup, rotation, deletion, store/provider, smoke,
  rollback/disable, and privacy fields; it cannot approve contact handling,
  capture production smoke, close #64/#69, or replace the blocked production
  contact row.
- Prefer non-colliding agents by ownership area: content, shell/layout, visual/WebGL, Rust API, CI/deployment, accessibility/performance.
- Smaller/cheaper models may own mechanical tasks with exact file paths and acceptance criteria.
- Use stronger models for design, architecture, visual-system, security, and final review.
- Never publish secrets, private machine details, passwords, tokens, or unredacted operational logs.
- Do not close launch blocker issues from local-only, PR-only, or docs-only
  evidence; production frontend/API targets, DNS/TLS, contact handling,
  rollback evidence, production Lighthouse, and redaction approvals remain
  required before launch readiness.

## GitHub And Project Work

- Read `docs/GITHUB_SYNC.md` before changing issues, labels, milestones, or GitHub Project state.
- Use `GH_PROMPT_DISABLED=1 gh project list --owner HumanKaylee --format json` for Project discovery checks.
- Do not run `gh auth refresh` from unattended automation.
- Project board recovery requires every open issue in the live issue bridge to have a Project item or a documented skip reason.
- Active pull requests that need portfolio execution visibility must be tracked on Project #1; PR #6 is the current active implementation PR and should keep a Project item until it is merged or closed.
- Project item tracking for active PRs is triage evidence only, not launch readiness or issue-closure evidence.
- Issue sync evidence is not launch readiness, production deployment evidence, post-launch feature approval, assistant-build approval, or Project board recovery.

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

Do not claim launch readiness unless the exact commands in
`docs/IMPLEMENTATION_AND_TEST_PLAN.md` pass, the production blocker rows in
`runbooks/LAUNCH_EVIDENCE.md` are replaced with real evidence, and documented
exceptions are approved. Until then, describe the repo as not launch-ready.
