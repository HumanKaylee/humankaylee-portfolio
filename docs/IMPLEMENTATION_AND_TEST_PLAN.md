# HumanKaylee Portfolio Implementation and Test Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` for swarm execution, or `superpowers:executing-plans` for single-session execution. Swarm execution is opt-in: use it when work spans multiple ownership lanes or needs reviewed parallel-safe split work; keep single-lane docs/contract fixes in single-session execution unless the Coordinator identifies a real parallelization benefit. Steps use checkbox syntax for tracking, and every task must respect the path ownership boundaries in this plan.

**Goal:** Build, test, and launch a static-first, visually distinctive `HumanKaylee` portfolio that proves engineering depth within 30 seconds while preserving performance, accessibility, privacy, and reliable static fallbacks.

**Architecture:** Use Astro as the static-first shell with TypeScript, content collections, MDX case studies, and selective React islands for interactive sections. Use a Rust Axum API only for visible backend proof: health, cached project metadata, contact, and optional privacy-safe events. The static portfolio must remain useful when JavaScript, WebGL, motion, or the Rust API are unavailable.

**Tech Stack:** Astro, TypeScript, React islands, Three.js or React Three Fiber for one progressive 3D experience, GSAP ScrollTrigger only where scroll choreography needs it, Rust Axum, Tokio, tower-http, tracing, SQLx only if persistence is needed, Playwright, Lighthouse, Axe, Cloudflare Pages, Fly.io, Railway, or another approved host as the approved current-host comparison set for #64, with Cloudflare Workers/Pages Functions or Hetzner as alternatives if the API shape changes or higher ops are acceptable. Shuttle is not a viable new launch target as of the 2026-05-24 official-source snapshot: https://docs.shuttle.dev/docs/shuttle-shutdown

---

## Source of Truth

Read these before executing any phase:

- `AGENTS.md`: repository-local agent instructions, current source order, hosting boundary, agent workflow, and launch-readiness guardrails.
- `docs/PRD.md`: product requirements, success metrics, journeys, feature requirements, launch definition, open decisions.
- `docs/RESEARCH.md`: recommended stack, visual concept, hosting recommendations, content strategy, risk controls.
- `docs/IMPLEMENTATION_AND_TEST_PLAN.md`: this execution contract, path ownership boundaries, swarm protocol, phase gates, and final verification commands.
- `docs/ARCHITECTURE.md`: static-first frontend architecture, Rust API boundaries, hosting options, failure isolation, and launch criteria.
- `docs/ROADMAP.md`: phase sequencing, current implementation status, and blocked production milestones.
- `docs/BACKLOG.md`: backlog item definitions, issue mapping, acceptance criteria, and agent sizing metadata.
- `docs/CONTENT_STRATEGY.md`: current content model, route inventory, schema names, and public-safe messaging boundaries.
- `docs/CONTENT_REDACTION_GUIDE.md`: publication safety checklist for case studies, projects, artifacts, logs, screenshots, and links.
- `docs/PRIVACY.md`: implemented privacy posture for contact handling, optional events, logging, and visitor data boundaries.
- `docs/OPERATIONS.md`: local, preview, production, deployment, incident, rollback, and maintenance runbooks.
- `docs/GITHUB_SYNC.md`: GitHub issue bridge, Project board state, live issue status, and sync commands.
- `runbooks/LAUNCH_EVIDENCE.md`: current local/PR evidence, production blockers, and evidence boundaries.
- `README.md`: repository status and working decision.

If this plan conflicts with `docs/PRD.md` or `docs/RESEARCH.md`, pause and ask for a planning update before changing code.

## Current Repo State / Issue Overlay

Current goal continuations must treat completed or local-evidence items as guard-check targets, not duplicate implementation tasks.

This section is a resume overlay for execution guidance, not standalone live
evidence: re-run the listed verifiers before acting on issue, PR, CI, Project,
or launch status.

- Phase 0 through Phase 6 have substantial local and PR evidence in the current PR branch; use the guard commands and live issue verifier before reopening or reimplementing those slices.
- Phase 7 and Phase 8 contain planning, runbook, local-readiness, and issue-sync evidence only; production deploy, provider, DNS/TLS, API health, contact handling, rollback, production Lighthouse, and redaction approval gates remain unresolved.
- Keep #20/#21/#24/#25/#63/#64/#65/#69/#70-#74 open unless the live verifier and documented external evidence gates prove otherwise.
- When provider/domain/auth/contact/redaction blockers are unresolved, stop deployment or launch work at the documented pause conditions and continue only non-blocked local-readiness, docs-sync, guardrail, and verification-hardening work.
- Downloaded resume recheck evidence is recorded in `runbooks/LAUNCH_EVIDENCE.md`; do not duplicate resume import work unless a later approved source replacement is recorded.
- Do not close #20/#21/#24/#25/#63/#64/#65/#69/#70-#74 from local-only, PR-only, or docs-only evidence.
- Treat embedded evidence snapshots as historical unless a live verifier or fresh command output proves they match the current checkout.
- This point-in-time overlay may trail the checked-out head after guardrail-only docs commits. Live verifiers are authoritative for current PR, CI, issue, and Project state.
- Do not rewrite this overlay only to chase the checked-out commit after a docs-only guardrail update. Update it only when the guidance or blocker state materially changes future execution.
- Active status source precedence: fresh verifier output is authoritative for live GitHub, PR, CI, and Project state. The Current Repo State / Issue Overlay, `docs/BACKLOG.md`, `docs/GITHUB_SYNC.md`, and launch runbooks provide execution guidance after live verification. The detailed Phase 7, Phase 8, and Phase 9 sections below are retained as historical implementation contracts. Do not infer active remaining work from old unchecked boxes when the overlay, backlog, GitHub sync, or launch evidence records a newer local/PR guard result or blocker. External launch blockers remain the only current blockers to production launch.
- Before resuming new feature work, run `git status --short --branch`,
  `gh pr view 6 --repo HumanKaylee/humankaylee-portfolio --json state,isDraft,headRefOid,mergeStateStatus,statusCheckRollup`,
  `HK_VERIFY_GITHUB_LIVE=1 node --test scripts/github-live-issue-sync.test.mjs`,
  and `HK_VERIFY_LAUNCH_EVIDENCE_LIVE=1 node --test scripts/launch-evidence-live-pr-ci-verifier.test.mjs`.
- Current live recheck snapshot captured at 2026-05-25T16:39:07-04:00 found
  PR #6 open/non-draft at `26c619ebb9ce76e9db490b0417a504b276327c75`,
  `mergeStateStatus: CLEAN`, PR #6 tracked on Project #1 with status
  `In Progress`, and Phase 0 CI run `26418268897` successful for
  Frontend verification job `77767324040` and Rust verification job
  `77767323996`.
  Keep `HK_VERIFY_LAUNCH_EVIDENCE_LIVE=1 node --test scripts/launch-evidence-live-pr-ci-verifier.test.mjs`
  as the authoritative current-head PR/CI check for future continuations.
- Latest non-blocked guardrail slice before the proof-surface refresh:
  active PR Project tracking guardrails in `AGENTS.md`, the installed
  `humankaylee-portfolio` Codex and agents skill mirrors,
  `scripts/agent-instructions-contract.test.mjs`, and `docs/CHANGELOG.md`,
  committed as `4bc6674586fa66c76ba673006cdf1192d6230774`. Treat the B-051 bundle-budget,
  case-study approval-evidence, Project-sync recovery, visual-CI-triage,
  preflight evidence, B-068 deployment sync guardrails, Phase 7
  evidence-authority checks, GitHub Project item verification hardening, the
  deployment-summary rule that provider-specific commands, migration procedures,
  and rollback steps remain reference-only, and the skill-mirror rule that
  fresh verifier output stays authoritative over embedded skill snapshots,
  including Project #1 item/field checks in
  `scripts/github-live-issue-sync.test.mjs` as guard evidence only; do not
  reimplement them when PR CI and the focused contracts are green.
- Latest completed local proof-surface polish slice: public proof surfaces on
  home and projects are guarded against visible scaffold, placeholder, or
  future-promise wording; the static shell, telemetry strip, systems-map hero,
  project atlas, and Creative Web Systems Atlas Demo proof copy now use
  additive progressive-enhancement language. This slice was committed as
  `b992f7300eca35b571836376e62a8e5b0cbff004`, then the no-WebGL fallback
  snapshot was updated as
  `0094a2b99470d3b7dbbabb2630b2c309a217de2b`. Treat this as Phase 4
  copy/quality polish only, not as production launch evidence or case-study
  approval.
- Latest GitHub permission recheck snapshot captured at
  2026-05-25T16:39:07-04:00: the local `gh` token has `repo`,
  full-control `project`, and `workflow` scopes; private repo access reports `ADMIN`;
  `GH_PROMPT_DISABLED=1 gh project view 1 --owner HumanKaylee --format json`
  succeeds for private Project #1 with id `PVT_kwHOB69SNc4BYuyc`, 19 fields,
  and 16 items. Project #1 permissions and item sync are healthy. Project #1 lists/views with 19 fields and 16 total items (15 open
  issue bridge items plus PR #6); `GH_PROMPT_DISABLED=1 gh project field-list 1 --owner
  HumanKaylee --format json` reports `Status` options `Todo`, `In Progress`,
  and `Done`; GraphQL reports Project #1 `viewerCanUpdate: true`; PR #6 has
  Project item `PVTI_lAHOB69SNc4BYuyczgtwPwg` with status `In Progress`; PR #6 is tracked as a
  Project item with status `In Progress`; and
  all 15 open live-bridge issues report Project item status `Todo`. The safe write proof re-applied PR #6 status `In Progress` with no permission error.
  PR #6 is open, non-draft, clean, and at head
  `26c619ebb9ce76e9db490b0417a504b276327c75`; Phase 0 CI run `26418268897`
  passed Frontend verification job `77767324040` and Rust verification job
  `77767323996`; the live issue/Project verifier passes.
  GitHub Project permissions are no longer a current blocker. Treat future Project
  work as maintenance for newly opened or relabeled issues and active PR
  tracking, not as launch readiness or as a current launch blocker.
- Latest provider-auth local preflight slice: `scripts/phase-7-provider-preflight.mjs`
  captured at 2026-05-25T18:41:47.441Z records `local/preflight`
  evidence by checking provider CLI presence and environment variable names
  only. Provider preflight reports `wrangler`, `fly`, and
  `railway` missing on this machine, no provider/API env names present, and keeps deployment,
  DNS/TLS, rollback, production smoke, contact handling, and case-study approval
  work blocked until real provider targets and owner decisions exist. Only environment variable names and command presence are
  recorded; secret values, provider account IDs, URLs, contact payloads, and raw
  provider logs are not captured.
- Latest contact-handling local decision-template slice:
  `pnpm phase7:contact-decision -- --mode defer --dry-run` records
  `local/decision-template` fields for #64/#69 owner approval, selected mode,
  retention, backup, rotation, deletion, store/provider, production smoke,
  rollback or disable plan, blocked issues, and privacy redaction. This helper
  cannot approve contact handling, capture production smoke, close #64/#69, or
  replace the blocked production contact row.
- Latest case-study redaction-readiness slice: `pnpm redaction:readiness`
  captured at `2026-05-25T19:22:49.138Z` records
  `local/redaction-readiness` evidence only. The generated ignored summary at
  `test-results/case-study-redaction-readiness.json` reports `0` approved
  publish candidates out of `4` required, four publish candidates that still
  have `reviewed` redaction status, `partial` checklist status, open-item
  counts, and missing `approvalEvidence`, plus deferred/blocked #24/#25
  candidates. This is reviewer handoff evidence only; it cannot approve case
  studies, clear open items, close #20/#21/#24/#25, or count toward launch.
- What remains is external launch and approval work: complete redaction
  approvals for at least four launch case studies; record HumanKaylee
  publication-safety decisions for #24 and #25; deploy the frontend for #63;
  deploy the Rust API for #64; configure DNS/TLS/canonical production metadata
  for #65; approve contact handling or a mailto-only launch exception; capture
  rollback evidence, production Lighthouse, production route/API/contact smoke,
  and the full B-063 final launch checklist for #69; keep #70 through #74
  planning-only until B-063 launch evidence exists.
- The next goal run should not spend its first slice on Project auth unless a
  live verifier regresses. Prioritize one of these remaining external gates
  instead: content/redaction approval evidence for #20/#21/#24/#25,
  Cloudflare Pages frontend deploy evidence for #63, approved Rust API hosting
  and contact-handling evidence for #64, domain/DNS/TLS metadata evidence for
  #65, or the B-063 production smoke/Lighthouse/rollback checklist for #69.
- If a next goal run resumes before those external blockers are resolved, it
  should first re-run the live checks above, confirm GitHub Project checks do
  not regress, then choose only a small
  non-blocked docs-sync, guardrail, or verification-hardening slice with
  explicit contract evidence. Do not invent deployment, redaction, contact, or
  production evidence.
- Local laptop and `rog-strix-joe` operational checks are outside this
  portfolio repo. Do not reboot either machine from this goal. Current local
  laptop power policy evidence shows suspend/hibernate/DPMS disabled, but a
  live unplug reproduction is still needed if the blank-screen symptom returns.
  Current `rog-strix-joe` evidence shows autologon configured and the console
  user active, but the last reboot showed one Winlogon `1326` authentication
  failure; reset the Windows autologon credential tuple locally before any
  reboot validation.

## Ready-To-Use Codex Goal Objective

```text
/goal Continue the HumanKaylee portfolio from /home/joe/humankaylee-portfolio/docs/IMPLEMENTATION_AND_TEST_PLAN.md using the current repo state. First read AGENTS.md and the Source of Truth docs listed in the plan, then run the current-state preflight/live verifiers named in the Current Repo State / Issue Overlay. Treat the 2026-05-25T16:39:07-04:00 Project recheck as evidence that GitHub Project permissions are healthy unless a live verifier regresses; do not spend the first slice on Project auth recovery. Do not reboot or restart any machine, service, process manager, or remote host. Do not revert or overwrite other agents' work. Treat local, PR, CI, docs, Project, and issue-sync evidence as non-launch-readiness evidence only. Do not claim launch readiness unless runbooks/LAUNCH_EVIDENCE.md blocked production rows are replaced with real production or owner-approved production-equivalent provider-preview evidence and runbooks/FINAL_LAUNCH_CHECKLIST.md requirements are satisfied. Keep #20/#21/#24/#25/#63/#64/#65/#69/#70-#74 open unless the live verifier and documented external gates truly prove closure: redaction/human signoff for #20/#21/#24/#25, provider deploy evidence for #63/#64, final domain DNS/TLS/canonical metadata for #65, production smoke/Lighthouse/contact/rollback/redaction evidence for #69, and B-063 plus HumanKaylee approval dependencies for #70-#74. If external provider/domain/contact/redaction blockers remain unresolved, choose exactly one small non-blocked local-readiness, docs-sync, guardrail, or verification-hardening slice with exact contract evidence; otherwise prioritize one external launch gate. Preserve static-first behavior without JavaScript/WebGL/API availability, preserve "reviewed is not approved", and stop when the selected slice is verified or a documented pause condition is reached.
```

## Optional Claude Code Execution Prompt

```text
Implement the HumanKaylee portfolio from /home/joe/humankaylee-portfolio/docs/IMPLEMENTATION_AND_TEST_PLAN.md. Execute phases in order, use a fresh task context for each ownership lane, verify with the exact commands listed in the plan, stop deployment or launch work at the documented pause conditions when provider/domain/auth/contact/redaction blockers are unresolved, continue only non-blocked local-readiness/docs-sync/guardrail/verification-hardening work in that state, do not close #20/#21/#24/#25/#63/#64/#65/#69/#70-#74 from local-only, PR-only, or docs-only evidence, and stop only when all final launch checks pass or a pause condition is reached.
```

## Execution Rules

- Do not start implementation until the executor has read every file in the Source of Truth list.
- Start with a read-only preflight that records local tool versions, GitHub auth status, available package managers, Rust version, Node version, and current repository remotes in `runbooks/PREFLIGHT.md`.
- Preflight evidence must include sanitized command output for `date`, `git status --short --branch`, `git remote -v`, `node --version`, `corepack --version`, `pnpm --version`, `rustc --version`, `cargo --version`, `gh auth status`, `git --version`, and `codex --version`. Omit tokens, private paths, hostnames, and secrets; record missing Project scopes separately from repository readiness.
- Do not let two agents edit the same file or directory ownership lane at the same time.
- Do not treat visual polish as a substitute for case-study substance.
- Do not put secrets, private keys, API tokens, private email provider credentials, or unredacted sensitive project details in the repo.
- Do not require the Rust API for reading the home page, project pages, resume, notes, or case studies.
- Do not add a full CMS, authentication, or v1 generative AI assistant unless the PRD is updated.
- Do not depend on home-hosted infrastructure for the primary public site.
- Do not merge a phase unless its acceptance criteria and verification commands pass.

## Global Acceptance Criteria

Launch is complete only when all criteria are true:

- Home, projects, at least 4 flagship case studies, resume, notes or build log, and contact are implemented.
- The first viewport includes readable hero text, resume CTA, project CTA, and contact CTA before 3D assets load.
- JavaScript-disabled browsing still exposes core text, project links, resume path, and contact fallback.
- All key content has non-WebGL and reduced-motion fallbacks.
- Lighthouse on production or production-equivalent preview reaches Performance >= 90, Accessibility >= 95, Best Practices >= 95, and SEO >= 95 on home, projects, one case study, resume, and contact.
- Rust backend exposes tested `GET /api/health`, `GET /api/projects/live`, `POST /api/contact`, and gated `POST /api/events`.
- Backend outage does not break static pages or primary navigation.
- CI runs frontend lint, typecheck, unit tests, build, backend fmt, backend clippy, backend tests, Playwright smoke tests, and Lighthouse checks.
- README and runbooks explain local development, deployment, rollback, content updates, redaction, and production verification.
- Sensitive content selected from `/home/joe`, prior runbooks, or GitHub repositories is redacted before publication.

## Repository Command Contract

The repository starts as a planning repo. Phase 0 must create this command contract before later phases depend on it.

Root commands that must exist after Phase 0:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm bundle:budget
pnpm preview
pnpm lighthouse:local
cargo fmt --manifest-path apps/api/Cargo.toml --check
cargo clippy --manifest-path apps/api/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path apps/api/Cargo.toml
cargo run --manifest-path apps/api/Cargo.toml --bin humankaylee-api
```

Expected command meanings:

- `pnpm lint`: lint Astro, TypeScript, CSS, Markdown, and root config files.
- `pnpm typecheck`: run Astro checks and TypeScript checks.
- `pnpm test`: run frontend unit/component tests.
- `pnpm test:e2e`: run Playwright smoke, accessibility, no-JS, reduced-motion, and contact fallback checks.
- `pnpm build`: build the static frontend.
- `pnpm bundle:budget`: fail when generated routes exceed the critical JavaScript budget after a build.
- `node scripts/bundle-budget.mjs --dry-run`: print the B-051 route source,
  ignored script types, budget limit, and summary path without requiring
  `dist/` or writing summary artifacts.
- `pnpm preview`: serve the built frontend locally for manual and Lighthouse checks.
- `pnpm lighthouse:local`: run Lighthouse against local preview routes with the PRD thresholds.
- `cargo fmt`: enforce Rust formatting.
- `cargo clippy`: fail on Rust warnings.
- `cargo test`: run Rust route, config, validation, rate-limit, and integration tests.
- `cargo run`: start the API locally for integration checks.

Pause if a selected tool cannot support this command contract on Linux Mint 22.3 without replacing the stack approved by `docs/RESEARCH.md`.

## Target Structure and Ownership

Only the listed owner may modify a path during a swarm task. If a task needs another path, it must request a handoff.

| Owner                  | Owns                                                                                                                                                                                                                                                                | Must Not Edit                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Coordinator            | Phase sequencing, issue splitting, final merge review, `docs/`, shared contracts                                                                                                                                                                                    | Product code unless resolving integration conflicts                   |
| Foundation Agent       | `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `astro.config.*`, `tsconfig*.json`, `playwright.config.*`, `vitest.config.*`, root `.gitignore`                                                                                                            | Feature components, content, Rust handlers                            |
| CI and Deploy Agent    | `.github/workflows/`, deployment config, `runbooks/`, `runbooks/DEPLOYMENT.md`, `runbooks/LAUNCH_EVIDENCE.md`                                                                                                                                                       | Frontend components, content bodies, Rust route logic                 |
| Visual System Agent    | `apps/web/src/styles/`, `apps/web/src/layouts/BaseLayout.astro`, `apps/web/src/components/SiteHeader.astro`, `apps/web/src/components/SiteFooter.astro`, `apps/web/src/components/BuildTelemetryStrip.astro`, fonts and base visual assets under `apps/web/public/` | Page route files, content collections, API code                       |
| Page Composition Agent | `apps/web/src/pages/`, page-level integration wrappers, sitemap, robots, RSS, and metadata route generation                                                                                                                                                         | Low-level visual components, atlas internals, Rust API                |
| Content Agent          | `apps/web/src/content/`, `apps/web/src/data/`, resume source assets under `apps/web/public/downloads/`, public social images under `apps/web/public/social/`                                                                                                        | Page shell, 3D components, backend                                    |
| Project Atlas Agent    | `apps/web/src/components/ProjectAtlas.astro`, `apps/web/src/components/ProjectCard.astro`, `apps/web/src/components/AudienceChips.astro`, project atlas tests                                                                                                       | Home page route, content bodies, backend                              |
| Motion and 3D Agent    | `apps/web/src/components/SystemsMapHero.astro`, `apps/web/src/components/EvidenceDrawer.astro`, `apps/web/public/scripts/project-constellation.mjs`                                                                                                                 | Case-study content, backend, CI                                       |
| Contact UX Agent       | `apps/web/src/components/ContactForm.astro`, contact page tests                                                                                                                                                                                                     | Rust contact route internals, unrelated pages                         |
| Backend Agent          | `apps/api/`, backend Dockerfile, backend Shuttle config                                                                                                                                                                                                             | Frontend code except documented API contract fixtures                 |
| QA Agent               | `tests/e2e/`, `tests/fixtures/`, Lighthouse config, accessibility reports                                                                                                                                                                                           | Product implementation except tiny test IDs requested through handoff |

Shared contract files must be edited by one owner only:

- `apps/web/src/lib/contracts/`: Foundation Agent creates and owns shared API and content-facing response types.

Top-level shared Astro components are file-owned as listed above. If an agent
needs a component owned by another lane, pause that slice and hand it back to the
coordinator instead of broad-editing `apps/web/src/components/`.

- `docs/CONTENT_REDACTION_GUIDE.md`: Coordinator creates if needed; Content Agent may propose changes through review.
- `runbooks/DEPLOYMENT.md`: CI and Deploy Agent owns after Phase 8 starts.

## Non-Colliding Swarm Protocol

- Swarm execution is opt-in for tasks that span multiple ownership lanes or
  need reviewed parallel-safe split work; single-lane docs/contract fixes should
  stay with one owner in single-session execution unless the Coordinator records
  a concrete parallelization benefit.
- Use one branch or worktree per owner lane.
- Each task request must include exact owned paths, phase number, acceptance checks, and forbidden paths.
- Small agents should receive one phase task, one owner lane, and no more than 6 source files.
- Large agents may coordinate cross-lane integration, but must not directly edit two owners' paths in the same commit unless resolving a reviewed integration failure.
- Page Composition Agent imports stable public components from component owners instead of editing component internals.
- Component owners expose stable props and sample fixtures before page integration begins.
- QA Agent writes failing tests against documented behavior and opens handoff requests for missing test IDs or semantics.
- Coordinator merges only after the owner's local checks pass and the integration command set is green.

## Parallel Execution Matrix

The Coordinator should use this matrix to increase execution speed while avoiding collisions.

| Wave | Can Run In Parallel                                                                                                                                  | Must Wait For                                   | Integration Gate                                      |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| 0A   | Foundation Agent scaffolds `apps/web`; Backend Agent scaffolds `apps/api`; QA Agent scaffolds Playwright; CI Agent drafts CI                         | None                                            | Command contract passes locally                       |
| 1A   | Content Agent defines schemas and safe draft content; Visual System Agent creates tokens/layout primitives; Backend Agent expands health route tests | Phase 0 command contract                        | `pnpm typecheck`, `pnpm build`, `cargo test`          |
| 2A   | Page Composition Agent builds static routes; Content Agent drafts case studies; QA Agent writes no-JS/static-shell tests                             | Content schemas and layout primitives           | Static shell tests pass                               |
| 3A   | Project Atlas Agent builds HTML atlas; Motion/3D Agent builds isolated hero enhancement; Backend Agent implements projects/contact/events routes     | Static routes and API contracts                 | Atlas fallback, backend tests, and bundle budget pass |
| 4A   | Contact UX Agent integrates API fallback; CI Agent adds deployment runbooks; QA Agent adds Lighthouse/Axe/security checks                            | Stable static pages and backend route contracts | Full local verification command set                   |
| 5A   | Deployment Agent handles frontend host; Backend Agent handles API host; Coordinator builds evidence matrix                                           | Final domain, secrets, case-study approvals     | Production smoke checks pass                          |

If two agents both need a shared contract file, stop one agent and let the Coordinator make a single contract edit before both resume.

## Small-Model Ready Task Template

Use this template for cost-saving subagents. Fill every placeholder before dispatch; do not send this template with blank fields.

```text
Task: Implement <one outcome> for Phase <N>.
Owned paths: <exact paths>.
Read-only context: <up to 6 files>.
Forbidden paths: <paths>.
Commands to run: <exact commands>.
Acceptance criteria: <copy from plan/backlog>.
Stop if: you need another path, find sensitive content, or cannot satisfy a command.
Return: changed files, command outputs, and any blocker.
```

Small-model work is safe for scaffolding, content normalization, metadata additions, test additions with fixed selectors, and mechanical docs updates. Do not assign visual invention, WebGL, security review, deployment debugging, or redaction judgment to the smallest models.

## Model-Sizing Guidance

Use the smallest model that can safely complete the task without cross-lane reasoning.

| Task Type                                                    | Recommended Model Size | Safe For Smaller Models                            | Requires Larger Model                                            |
| ------------------------------------------------------------ | ---------------------- | -------------------------------------------------- | ---------------------------------------------------------------- |
| Markdown copyediting, redaction pass, metadata normalization | Small                  | Yes, with source excerpts and exact path           | If sensitive publishing judgment is ambiguous                    |
| Static Astro page layout from existing components            | Small to medium        | Yes, if component APIs are stable                  | If page also changes design system or routing                    |
| CSS tokens, typography, simple responsive tweaks             | Small to medium        | Yes, with screenshots or exact acceptance criteria | If visual direction is being invented                            |
| Content collection schema and data modeling                  | Medium                 | Only after schema is specified                     | If schema affects routing, SEO, and generated pages              |
| Playwright smoke tests and no-JS tests                       | Medium                 | Yes, if routes and selectors already exist         | If debugging hydration or browser-specific failures              |
| Rust route tests and simple handlers                         | Medium                 | Yes, if contracts are fixed                        | If rate limiting, CORS, tracing, or deployment failures interact |
| Project atlas keyboard accessibility                         | Medium to large        | Not recommended for smallest models                | Required if Canvas/WebGL and HTML fallback diverge               |
| WebGL/R3F hero and performance debugging                     | Large                  | No                                                 | Always use larger model or human review                          |
| Security/privacy review                                      | Large                  | No                                                 | Always use larger model or human review                          |
| Deployment debugging across Cloudflare/Shuttle/Fly/Railway   | Large                  | No                                                 | Always use larger model or human review                          |

Small-model prompt pattern:

```text
You are implementing Phase <N>, Owner <Owner Name>. Edit only <paths>. Read only <source files>. Do not change shared configs. Run <commands>. Stop and report if any forbidden path must change.
```

Large-model prompt pattern:

```text
You are coordinating integration for Phase <N>. Compare the PRD requirements to the phase outputs, run all phase verification commands, identify cross-lane conflicts, and make only reviewed integration fixes in paths explicitly assigned by the Coordinator.
```

## Phase 0: Bootstrap Execution Contract

**Primary Owner:** Foundation Agent  
**Supporting Owners:** Backend Agent, CI and Deploy Agent, QA Agent  
**Goal:** Create the minimal monorepo/tooling foundation so all future work has exact commands and stable boundaries.

**Owned Path Boundaries:**

- Foundation Agent owns root JS/TS/Astro config and `apps/web/` scaffold.
- Backend Agent owns `apps/api/` scaffold.
- QA Agent owns initial `tests/e2e/` scaffold.
- CI and Deploy Agent owns `.github/workflows/` and scaffold-stage deployment checks.

**Tasks:**

- [ ] Create `runbooks/PREFLIGHT.md` with versions and readiness checks for `node`, `corepack`, `pnpm`, `rustc`, `cargo`, `gh`, `git`, and `codex`.
- [ ] Scaffold Astro with TypeScript under `apps/web/`.
- [ ] Configure pnpm workspace at the repo root.
- [ ] Add root scripts for the command contract.
- [ ] Add Astro checking, TypeScript strictness, linting, formatting, and test runner config.
- [ ] Scaffold Rust Axum app under `apps/api/` with a compiling health route.
- [ ] Add Playwright config and one smoke test that loads the scaffold-stage home page.
- [ ] Add CI that runs the full command contract except provider deploys.
- [ ] Update README with the exact local command contract.

**Acceptance Criteria:**

- Preflight records exact tool versions, GitHub auth account, repository remote, and any missing tools.
- Root command contract exists and is documented.
- `apps/web/` builds a scaffold-stage static page without production content claims.
- `apps/api/` compiles and serves a scaffold-stage `GET /api/health`.
- CI workflow is present and runs local verification commands.
- No PRD feature is falsely marked complete.

**Verification Commands:**

```bash
test -s runbooks/PREFLIGHT.md
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
cargo fmt --manifest-path apps/api/Cargo.toml --check
cargo clippy --manifest-path apps/api/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path apps/api/Cargo.toml
```

**Pause Conditions:**

- Astro, pnpm, or Rust tooling cannot be installed or run on the target machine.
- Scaffolding choice conflicts with the Astro plus Axum decision in `docs/RESEARCH.md`.
- Any agent needs to edit `docs/PRD.md` or `docs/RESEARCH.md` to proceed.

## Phase 1: Information Architecture and Content Contracts

**Primary Owner:** Content Agent  
**Supporting Owners:** Foundation Agent, Page Composition Agent, Coordinator  
**Goal:** Define content data, route inventory, and publication safety rules before visual or backend embellishment.

**Owned Path Boundaries:**

- Content Agent owns `apps/web/src/content/`, `apps/web/src/data/`, and redacted content media.
- Foundation Agent owns shared content contract types.
- Page Composition Agent may read content fixtures but must not edit content bodies.

**Tasks:**

- [ ] Create `docs/CONTENT_REDACTION_GUIDE.md` from `docs/CONTENT_STRATEGY.md` redaction rules and make it the checklist used by case-study publishing.
- [ ] Define content collections for case studies, notes/build-log entries, project metadata, and resume data.
- [ ] Create route inventory for home, projects, project detail, case studies, notes/build-log, resume, contact, sitemap, robots, and fallback error page.
- [ ] Create 4 to 6 flagship case-study outlines using the PRD template: summary, problem, constraints, architecture, build details, verification, operations, outcome, lessons, links.
- [ ] Mark each candidate case study as `publish`, `needs-redaction`, or `defer`.
- [ ] Create initial project category taxonomy: AI, automation, infrastructure, backend, creative web, operations.
- [ ] Define required SEO fields for each page and content type.
- [ ] Define resume data fields and PDF source workflow. Final resume PDF source is resolved locally; production `/resume/` and PDF-link smoke evidence remains blocked until a frontend deployment target exists.

**Acceptance Criteria:**

- `docs/CONTENT_REDACTION_GUIDE.md` exists and every launch case-study outline links to its redaction status.
- At least 4 case-study outlines are selected for v1 publication or explicitly blocked by redaction review.
- Every content type has required fields, example valid entries, and invalid-entry tests.
- Project categories match the PRD and support recruiter and engineer paths.
- Content can drive static routes without API dependency.

**Verification Commands:**

```bash
pnpm typecheck
pnpm test -- --run content
pnpm build
```

**Pause Conditions:**

- Fewer than 4 safe case studies can be published.
- Resume source content or approved PDF source is unavailable in a future replacement workflow.
- A case study requires sensitive details that cannot be redacted without losing credibility.

## Phase 2: Static Shell, Visual System, and Accessibility Baseline

**Primary Owner:** Visual System Agent  
**Supporting Owners:** Page Composition Agent, QA Agent  
**Goal:** Build the static, accessible, no-JS foundation that delivers the core story before interactive enhancements.

**Owned Path Boundaries:**

- Visual System Agent owns styles, layouts, typography, chroming components, and base design tokens.
- Page Composition Agent owns route files and page assembly.
- QA Agent owns smoke and accessibility tests.

**Tasks:**

- [ ] Implement "The Systems Atelier" visual language: warm off-black, paper/cream, tungsten amber, signal green, oxidized blue.
- [ ] Select and self-host expressive display, condensed label, and monospace evidence fonts with fallbacks.
- [ ] Create semantic layout primitives for header, main, article, aside, footer, skip link, CTA clusters, evidence panels, and artifact grids.
- [ ] Build static home page with first-viewport positioning statement, recruiter CTA, engineer CTA, featured projects, resume CTA, and contact CTA.
- [ ] Build static projects index with accessible card/list rendering.
- [ ] Build static contact page with mailto fallback visible before API integration.
- [ ] Build static `BuildTelemetryStrip` placeholder using local static evidence fields; label it as static evidence until API integration exists.
- [ ] Add `prefers-reduced-motion` baseline styles.
- [ ] Add no-JS and no-WebGL body states or progressive enhancement markers.

**Acceptance Criteria:**

- Core routes render meaningful HTML with JavaScript disabled.
- Keyboard navigation reaches primary nav, recruiter CTA, engineer CTA, resume, projects, and contact.
- Color contrast is WCAG AA or better.
- Touch targets are at least 44px on mobile.
- No generic purple AI gradient theme and no default Inter/Roboto/system-only look.

**Verification Commands:**

```bash
pnpm lint
pnpm typecheck
pnpm test:e2e -- --grep "@static-shell"
pnpm test:e2e -- --grep "@noscript"
pnpm build
```

**Pause Conditions:**

- Typography licenses do not permit self-hosting.
- Visual direction drifts away from the PRD's "Systems Atelier" requirements.
- Static shell requires JavaScript for primary content.

## Phase 3: Case Studies, Resume, Notes, SEO, and Sharing

**Primary Owner:** Content Agent  
**Supporting Owners:** Page Composition Agent, QA Agent  
**Goal:** Publish the content that proves depth, with metadata and sharing support.

**Owned Path Boundaries:**

- Content Agent owns MDX/content bodies, images, diagrams, redaction notes, and resume source.
- Page Composition Agent owns route templates and metadata rendering.
- QA Agent owns content route tests and metadata checks.

**Tasks:**

- [ ] Complete at least 4 flagship case studies with problem, constraints, architecture, build details, testing, operations, outcome, and lessons.
- [ ] Add architecture diagrams or redacted artifact visuals for each flagship case study.
- [ ] Add `EvidenceDrawer` content for every flagship case study: one safe diagram or screenshot, one verification excerpt, one operational note, and one lesson.
- [ ] Add "How this site was built" as a notes/build-log or case-study entry.
- [ ] Implement HTML resume page and link downloadable resume PDF.
- [ ] Implement notes/build-log index and RSS feed.
- [ ] Add sitemap, robots.txt, canonical URLs, Open Graph metadata, Twitter card metadata, and JSON-LD for Person, WebSite, CreativeWork, and SoftwareSourceCode where applicable.
- [ ] Add image alt text and video or animation summaries for meaningful media.

**Acceptance Criteria:**

- At least 4 case studies are publishable and pass redaction review.
- Each flagship case study includes evidence, verification, operational notes, and outcome.
- Resume PDF is reachable from home, resume page, and recruiter path.
- Sitemap, RSS, robots, canonical URLs, and Open Graph metadata are generated in production build.
- Social preview assets exist for home and core content pages.

**Verification Commands:**

```bash
pnpm lint
pnpm typecheck
pnpm test -- --run content
pnpm test:e2e -- --grep "@metadata"
pnpm build
```

**Pause Conditions:**

- A required public link exposes private repositories, secrets, or sensitive operational details.
- Resume PDF content is not approved for publication.
- Generated metadata contains stale, scaffold-only, or misleading claims.

## Phase 4: Project Atlas, Motion, and Progressive 3D

**Primary Owner:** Project Atlas Agent  
**Supporting Owners:** Motion and 3D Agent, Page Composition Agent, QA Agent  
**Goal:** Add one signature interactive experience without compromising recruiter speed, mobile clarity, or accessibility.

**Owned Path Boundaries:**

- Project Atlas Agent owns atlas model, accessible list, filtering, node interactions, and atlas tests.
- Motion and 3D Agent owns hero scene, WebGL capability detection, lazy loading, and animation helpers.
- Page Composition Agent owns route-level placement only.

**Tasks:**

- [ ] Implement accessible HTML project atlas fallback first.
- [ ] Add filters for AI, automation, infrastructure, backend, creative web, and operations.
- [ ] Add keyboard navigation for atlas cards/nodes and preview panels.
- [ ] Add desktop-only progressive 3D or canvas enhancement that lazy-loads after core content.
- [ ] Implement `SystemsMapHero` as the signature interactive moment and connect every node to a static project/case-study URL.
- [ ] Add designed poster fallback for browsers without WebGL or users with reduced motion.
- [ ] Add GSAP ScrollTrigger only for specific scroll-linked assembly moments that improve narrative clarity.
- [ ] Add performance guardrails that skip heavy assets on mobile, low-memory, reduced-motion, or no-WebGL contexts.

**Acceptance Criteria:**

- The atlas is fully usable as HTML without WebGL.
- Mobile users receive a fast card or timeline list, not a heavy 3D dependency.
- Reduced-motion users do not receive scroll-jacking or essential animated-only content.
- Hero and atlas enhancements load after the readable hero and primary CTAs.
- Interaction previews never hide resume, project, or contact paths.

**Verification Commands:**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e -- --grep "@atlas"
pnpm test:e2e -- --grep "static systems map hero"
pnpm test:e2e -- --grep "@reduced-motion"
pnpm build
pnpm lighthouse:local
```

**Pause Conditions:**

- 3D payload prevents Lighthouse Performance >= 90 on production-equivalent preview.
- Keyboard or screen-reader access diverges from the visual atlas.
- Smooth scrolling or pinned animation breaks native browser behavior.

### Phase 4 Implementation Contract Snapshot

- Local PR evidence in place today: `B-031` art-directed page surfaces (`@visual-surfaces`), `B-032` static systems-map hero fallback (`static systems map hero`), `B-033` accessible project atlas fallback (`@atlas`), `B-034` desktop-gated SVG/HTML project constellation with lazy focus helper (`@constellation`), `B-035` purposeful motion (`@motion`), `B-036` route continuity (`@route-continuity`), `B-037` visual-regression coverage (`pnpm test:visual`).
- Keep launch status explicit: Phase 4 has local guard coverage, but it does not remove the separate provider, domain, redaction, production smoke, rollback, or contact-storage launch blockers.
- Do not claim Three.js, R3F, or WebGL is shipping; the current constellation is a lightweight SVG/HTML progressive enhancement with a lazy focus helper.
- Active guard commands for phase 4 status checks:
  - `pnpm test:e2e -- --grep "@visual-surfaces"`
  - `pnpm test:e2e -- --grep "static systems map hero"`
  - `pnpm test:e2e -- --grep "@atlas"`
  - `pnpm test:e2e -- --grep "@constellation"`
  - `pnpm test:e2e -- --grep "@motion"`
  - `pnpm test:e2e -- --grep "@route-continuity"`
  - `pnpm test:visual`

## Phase 5: Rust Axum Backend

**Primary Owner:** Backend Agent  
**Supporting Owners:** Foundation Agent, QA Agent, CI and Deploy Agent  
**Goal:** Build a small, credible Rust API that supports visible portfolio features while keeping static content independent.

**Owned Path Boundaries:**

- Backend Agent owns all `apps/api/` source, tests, backend Dockerfile, backend config, and backend route fixtures.
- Foundation Agent owns shared API contract types in frontend only.
- Contact UX Agent consumes contracts after backend tests pass.

**Tasks:**

- [ ] Implement typed environment config for host, port, allowed origins, contact delivery mode, event logging toggle, rate limits, and version.
- [ ] Implement `GET /api/health` returning status, version, uptime, and build metadata.
- [ ] Implement `GET /api/projects/live` returning cached GitHub/project metadata with graceful stale-cache behavior.
- [ ] Implement `POST /api/contact` with input validation, honeypot rejection, rate limiting, request size limits, structured errors, and safe delivery or storage mode.
- [ ] Implement gated `POST /api/events` for privacy-safe events only when explicitly enabled.
- [ ] Add tower-http CORS restricted to configured origins, trace layer, compression for text/JSON responses, request body limits for write routes, and timeout layers for all public routes.
- [ ] Add integration tests for success, validation failure, rate limit, CORS denial, disabled-events behavior, and health response shape.
- [ ] Add Dockerfile and keep feature-gated Shuttle legacy compatibility config only.

**Acceptance Criteria:**

- All required endpoints are tested.
- Invalid contact submissions cannot crash the service or leak internals.
- CORS allows only configured frontend origins.
- Events are disabled by default.
- Backend logs are structured and do not contain secrets or full private message bodies.
- API downtime does not block static frontend builds.
- Shuttle remains legacy compatibility only. Do not use Shuttle as a new production API host.

**Verification Commands:**

```bash
cargo fmt --manifest-path apps/api/Cargo.toml --check
cargo clippy --manifest-path apps/api/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path apps/api/Cargo.toml
cargo check --manifest-path apps/api/Cargo.toml --features shuttle --bin humankaylee-api-shuttle
sudo podman build -t humankaylee-api:local-check -f apps/api/Dockerfile apps/api
cargo run --manifest-path apps/api/Cargo.toml --bin humankaylee-api
xh :8787/api/health
```

Expected `xh :8787/api/health` result shape:

```json
{
  "status": "ok",
  "version": "<semver-or-git-sha>",
  "uptime_seconds": 1
}
```

**Pause Conditions:**

- Contact delivery provider is not chosen and local storage mode is not acceptable.
- Provider credentials would need to be committed to the repo.
- Rate limiting cannot be implemented without adding unapproved infrastructure.
- Shuttle legacy compatibility checks conflict with the API design.

### Phase 5 Implementation Contract Snapshot

- Local PR evidence in place today: `B-038` has structured JSON tracing startup
  initialization for standalone and Shuttle entrypoints; `B-039` health remains
  tested; `B-040` now uses an injectable cached project metadata provider with
  error and slow-refresh stale-cache fallback tests; `B-041`, `B-044`, `B-045`,
  `B-046`, and `B-047` have local route, middleware, deploy-path, and frontend
  fallback coverage.
- Keep launch status explicit: Phase 5 has local API and container evidence,
  but it does not remove the separate provider, domain, production secret,
  persistent contact storage, production smoke, rollback, or case-study
  redaction blockers.
- Current partial follow-ups: `B-042` contact abuse controls are in-memory and
  now default to normalized sender identity rather than spoofable forwarded
  headers until a trusted proxy boundary exists; `B-043` JSONL storage works
  through an injectable delivery adapter seam with fake success/failure coverage,
  but production contact handling remains blocked until retention, backup,
  rotation, deletion, and store/provider decisions are approved.
- Active guard commands for phase 5 status checks:
  - `cargo fmt --manifest-path apps/api/Cargo.toml --check`
  - `cargo clippy --manifest-path apps/api/Cargo.toml --all-targets -- -D warnings`
  - `cargo test --manifest-path apps/api/Cargo.toml`
  - `cargo check --manifest-path apps/api/Cargo.toml --features shuttle --bin humankaylee-api-shuttle`
  - `cargo audit --file apps/api/Cargo.lock`
  - `sudo podman build -t humankaylee-api:local-check -f apps/api/Dockerfile apps/api`
  - `cargo run --manifest-path apps/api/Cargo.toml --bin humankaylee-api`
  - `xh --check-status --body GET http://127.0.0.1:8787/api/health`
  - `xh --check-status --body GET http://127.0.0.1:8787/api/projects/live`

## Phase 6: Frontend and Backend Integration

**Primary Owner:** Contact UX Agent  
**Supporting Owners:** Backend Agent, Page Composition Agent, QA Agent  
**Goal:** Connect visible frontend features to the Rust API without creating a hard dependency on backend uptime.

**Owned Path Boundaries:**

- Contact UX Agent owns contact component and frontend API client.
- Backend Agent owns route contract changes.
- Page Composition Agent places integrated components into routes.
- QA Agent owns integration and failure-mode tests.

**Tasks:**

- [ ] Add API base URL config with production, preview, and local values.
- [ ] Integrate cached project metadata into optional live badges or freshness indicators.
- [ ] Enhance `BuildTelemetryStrip` with API health and cached project metadata when available, while preserving static fallback values.
- [ ] Integrate contact form with Rust API and keep mailto fallback visible on failure.
- [ ] Add client-side validation that mirrors backend validation without trusting the browser.
- [ ] Add event submission only behind an explicit enable flag and privacy notice.
- [ ] Add backend-down, timeout, validation-error, and success states.
- [ ] Add frontend integration tests using API mocks.

**Acceptance Criteria:**

- Contact form failure shows a useful fallback and does not lose typed message content.
- Static project and case-study content remains visible when API requests fail.
- API base URL is not hardcoded into source in a way that blocks preview environments.
- Event submission is disabled unless configured.

**Verification Commands:**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e -- --grep "@contact"
pnpm test:e2e -- --grep "@api-down"
pnpm build
cargo test --manifest-path apps/api/Cargo.toml
```

**Pause Conditions:**

- Frontend requires secrets or provider credentials.
- API contract changes require breaking already-published static content.
- Contact feature cannot provide a reliable fallback.

## Phase 7: Accessibility, Performance, Security, and Privacy Hardening

**Primary Owner:** QA Agent  
**Supporting Owners:** Visual System Agent, Motion and 3D Agent, Backend Agent, CI and Deploy Agent  
**Goal:** Prove the portfolio meets the PRD's launch quality bar before deployment work begins.

**Owned Path Boundaries:**

- QA Agent owns reports, tests, and test fixtures.
- Implementation owners fix failures only within their lanes.
- Coordinator approves any cross-lane fix.

**Tasks:**

- [ ] Add route coverage for home, projects, one project detail, one case study, resume, notes/build-log, and contact.
- [ ] Add no-JS tests for core content and CTAs.
- [ ] Add reduced-motion tests for hero, atlas, page transitions, and scroll-linked sections.
- [ ] Add keyboard navigation tests for nav, project atlas, contact form, and case-study links.
- [ ] Add Axe accessibility checks in Playwright for core routes.
- [ ] Add Lighthouse checks with PRD thresholds.
- [ ] Add bundle analysis and fail on oversized critical JavaScript.
- [ ] Add dependency audit commands for frontend and backend.
- [ ] Add manual privacy/security checklist for content redaction, headers, CORS, rate limits, analytics, and secrets.

**Acceptance Criteria:**

- Lighthouse thresholds meet PRD targets on production-equivalent local preview.
- Axe reports no serious or critical issues on core routes.
- No-JS and reduced-motion tests pass.
- Backend security checks pass for CORS, request size, contact validation, and disabled events.
- Dependency audit findings are fixed or documented with a launch-approved exception.

**Verification Commands:**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm bundle:budget
pnpm lighthouse:local
pnpm audit --audit-level moderate
cargo fmt --manifest-path apps/api/Cargo.toml --check
cargo clippy --manifest-path apps/api/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path apps/api/Cargo.toml
cargo audit --file apps/api/Cargo.lock
```

**Pause Conditions:**

- Lighthouse thresholds cannot be met without reducing visual scope.
- Accessibility failures require redesign rather than local fixes.
- Dependency audit finds an unfixed high or critical issue in runtime code.
- Sensitive content remains in public build artifacts.

## Phase 8: Deployment, Operations, and Rollback

**Primary Owner:** CI and Deploy Agent  
**Supporting Owners:** Backend Agent, Page Composition Agent, Coordinator  
**Goal:** Deploy the static frontend and Rust API with reproducible runbooks and rollback paths.

**Owned Path Boundaries:**

- CI and Deploy Agent owns deployment config, runbooks, CI deployment jobs, environment docs, and operational checks.
- Backend Agent owns backend deployment settings under `apps/api/`.
- Page Composition Agent owns frontend build integration only if route generation changes.

**Tasks:**

- [ ] Create Cloudflare Pages deployment instructions for frontend.
- [ ] Record that Shuttle is not a viable new launch target and keep any Shuttle
      binary checks as legacy compatibility only.
- [ ] Create Fly.io and Railway deployment instructions for the Rust API, plus
      Cloudflare/Hetzner alternatives if the API shape or ops model changes.
- [ ] Add production environment variable matrix with secret names, not secret values.
- [ ] Add custom domain, DNS, TLS, cache, and rollback runbook.
- [ ] Add health check and smoke check commands for deployed frontend and API.
- [ ] Add CI deployment gates so failing lint, tests, build, or Lighthouse checks block production deployment.
- [ ] Add rollback instructions for frontend deploy and API deploy.

**Acceptance Criteria:**

- A new agent can reproduce deployment from the runbook without hidden context.
- Production secrets are named but not stored in the repo.
- Frontend rollback and API rollback steps are documented.
- Production health and smoke checks are exact commands.

**Verification Commands:**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm lighthouse:local
cargo test --manifest-path apps/api/Cargo.toml
cargo check --manifest-path apps/api/Cargo.toml --features shuttle --bin humankaylee-api-shuttle
xh https://<production-api-domain>/api/health
xh https://<production-frontend-domain>/
```

Provider CLI commands must be confirmed during this phase because provider CLIs change over time. The runbook must record the exact working commands and CLI versions used for Cloudflare Pages plus the selected API host. Shuttle is not a viable new launch target; see https://docs.shuttle.dev/docs/shuttle-shutdown. Shuttle remains legacy compatibility only. Do not use Shuttle as a new production API host.

**Pause Conditions:**

- Final domain name is not selected.
- Cloudflare or selected API host account access is unavailable.
- Provider CLI syntax or pricing changed materially from the research assumptions.
- Production health checks cannot be reached from outside the local network.

## Phase 9: Launch Review and Final Evidence Matrix

**Primary Owner:** Coordinator  
**Supporting Owners:** All owners  
**Goal:** Confirm the PRD launch definition with evidence before announcing the site as ready.

**Tasks:**

- [ ] Re-read `docs/PRD.md` launch definition and map every item to evidence.
- [ ] Re-read `docs/RESEARCH.md` risks and controls and confirm each control is implemented or explicitly accepted.
- [ ] Run final local verification commands.
- [ ] Run final production verification commands.
- [ ] Review generated build artifacts for sensitive terms, secrets, private hostnames, and private paths.
- [ ] Capture Lighthouse, accessibility, test, backend, and deployment evidence in the launch runbook.
- [ ] Create final status matrix with pass/fail/blocker rows.
- [ ] Create `runbooks/LAUNCH_EVIDENCE.md` with command, date, target URL, result, and artifact path for every local and production verification check.

**Acceptance Criteria:**

- Every PRD launch item has pass evidence or a documented launch-blocking exception.
- All final verification commands pass.
- The launch runbook includes commands, dates, target URLs, and result summaries.
- `runbooks/LAUNCH_EVIDENCE.md` exists and has no `pending`, `unknown`, or blank result rows.
- There are no unresolved pause conditions.

**Final Local Verification Commands:**

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm bundle:budget
pnpm lighthouse:local
pnpm audit --audit-level moderate
cargo fmt --manifest-path apps/api/Cargo.toml --check
cargo clippy --manifest-path apps/api/Cargo.toml --all-targets -- -D warnings
cargo check --manifest-path apps/api/Cargo.toml --features shuttle --bin humankaylee-api-shuttle
cargo test --manifest-path apps/api/Cargo.toml
cargo audit --file apps/api/Cargo.lock
sudo podman build -t humankaylee-api:local-check -f apps/api/Dockerfile apps/api
```

**Final Production Verification Commands:**

```bash
xh https://<production-frontend-domain>/
xh https://<production-frontend-domain>/projects/
xh https://<production-frontend-domain>/resume/
xh https://<production-frontend-domain>/contact/
xh https://<production-frontend-domain>/sitemap-index.xml
xh https://<production-api-domain>/api/health
```

Replace `<production-frontend-domain>` and `<production-api-domain>` only after Phase 8 records the chosen domains.

## Cross-Phase Test Matrix

| Requirement                                                   | Test Type  | Command                                                                                            | Owner                  |
| ------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------- | ---------------------- |
| Core pages build static HTML                                  | Build      | `pnpm build`                                                                                       | Page Composition Agent |
| JavaScript-disabled content remains useful                    | E2E        | `pnpm test:e2e -- --grep "@noscript"`                                                              | QA Agent               |
| Reduced motion is respected                                   | E2E        | `pnpm test:e2e -- --grep "@reduced-motion"`                                                        | QA Agent               |
| Keyboard navigation works                                     | E2E        | `pnpm test:e2e -- --grep "@keyboard"`                                                              | QA Agent               |
| Accessibility meets baseline                                  | E2E/Axe    | `pnpm test:e2e -- --grep "@accessibility"`                                                         | QA Agent               |
| Lighthouse thresholds pass                                    | Lighthouse | `pnpm lighthouse:local`                                                                            | QA Agent               |
| Critical JavaScript stays within budget                       | Bundle     | `pnpm build && pnpm bundle:budget`                                                                 | QA Agent               |
| Content schema is valid                                       | Unit       | `pnpm test -- --run content`                                                                       | Content Agent          |
| Project atlas fallback works                                  | E2E        | `pnpm test:e2e -- --grep "@atlas"`                                                                 | Project Atlas Agent    |
| Contact success and fallback work                             | E2E        | `pnpm test:e2e -- --grep "@contact"`                                                               | Contact UX Agent       |
| API-down mode preserves site usefulness                       | E2E        | `pnpm test:e2e -- --grep "@api-down"`                                                              | Contact UX Agent       |
| Rust API route behavior is tested                             | Rust tests | `cargo test --manifest-path apps/api/Cargo.toml`                                                   | Backend Agent          |
| Rust code is warning-free                                     | Rust lint  | `cargo clippy --manifest-path apps/api/Cargo.toml --all-targets -- -D warnings`                    | Backend Agent          |
| Shuttle API binary builds                                     | Rust check | `cargo check --manifest-path apps/api/Cargo.toml --features shuttle --bin humankaylee-api-shuttle` | Backend Agent          |
| API container image builds                                    | Container  | `sudo podman build -t humankaylee-api:local-check -f apps/api/Dockerfile apps/api`                 | Backend Agent          |
| Frontend dependencies have no moderate runtime audit failures | Audit      | `pnpm audit --audit-level moderate`                                                                | QA Agent               |
| Rust dependencies have no known runtime advisory blocker      | Audit      | `cargo audit --file apps/api/Cargo.lock`                                                           | QA Agent               |

## Risk Controls

### Content and Privacy

- Maintain a redaction checklist for every case study before publication.
- Replace private hostnames, usernames, credentials, tokens, customer names, and unpublished business details with generalized labels.
- Prefer architecture diagrams, command excerpts, verification matrices, and outcomes over raw logs.
- Keep source links private when a repository cannot be safely published.

### Performance

- Render key text and CTAs as static HTML.
- Lazy-load 3D, animation libraries, and non-critical media after first content.
- Serve responsive compressed images with explicit dimensions.
- Use poster fallbacks for 3D scenes.
- Skip heavy motion on mobile, reduced-motion, low-memory, no-WebGL, or slow-network contexts.
- Fail launch if visual enhancements prevent Lighthouse Performance >= 90.

### Accessibility

- Build the HTML fallback before Canvas/WebGL.
- Use semantic headings, landmarks, labels, and focus states.
- Ensure every interactive node has keyboard and screen-reader equivalent behavior.
- Respect `prefers-reduced-motion` for page transitions, scroll effects, and hero animation.
- Provide alt text or summaries for meaningful images, videos, diagrams, and animations.

### Backend and Operations

- API features are progressive enhancement only.
- Contact endpoint validates input server-side and rate-limits requests.
- Events are disabled by default and privacy-safe when enabled.
- CORS is restricted to configured production and preview origins.
- Logs avoid secrets and full private message bodies.
- Health endpoint provides operational proof without exposing internals.
- Rollback must restore a static frontend even if API deploy fails.

### Swarm Coordination

- Path ownership violations are launch blockers.
- Root config changes happen in Phase 0 or through Coordinator-approved handoff.
- Shared contract changes must be versioned and communicated before consumers update.
- Integration fixes must include the failing command output and the minimal path assignment.

## Global Pause Conditions

Pause implementation and ask for direction if any condition occurs:

- The single product objective changes.
- Final domain name is required for deployment and has not been chosen.
- Fewer than 4 publishable case studies remain after redaction review.
- Approved resume PDF source is missing in a future replacement workflow, or production `/resume/` smoke evidence is required and no frontend target exists.
- Contact provider is not chosen and mailto fallback is not acceptable for launch.
- A required provider account, token, or domain setting is unavailable.
- Tooling cannot satisfy the command contract on the target environment.
- A smaller model task needs to modify paths outside its ownership lane.
- Lighthouse, accessibility, or security requirements require cutting or redesigning a major feature.
- Any secret, private credential, sensitive hostname, private path, or unsafe project detail enters a public artifact.

## Implementation Order Summary

1. Bootstrap tooling and command contract.
2. Lock content contracts and redaction rules.
3. Build static shell and accessible visual system.
4. Publish case studies, resume, notes, and metadata.
5. Add project atlas and progressive motion/3D.
6. Build Rust API with tests and security controls.
7. Integrate frontend API features with static fallbacks.
8. Harden accessibility, performance, privacy, and security.
9. Deploy with runbooks and rollback.
10. Complete launch evidence matrix.

## Definition of Done

The implementation is done when the final local and production verification commands pass, all PRD launch items have evidence, all pause conditions are resolved, and the portfolio can be reproduced from the repo by a new agent without hidden context.
