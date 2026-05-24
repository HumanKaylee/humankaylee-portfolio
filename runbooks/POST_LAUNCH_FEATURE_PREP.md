# Post-Launch Feature Prep

Date: 2026-05-24
Branch: `goal/portfolio-implementation`
Scope: B-064 through B-068
Status: pre-launch planning only; not authorization to build

This runbook captures safe prep work for post-launch ideas while the portfolio
is still blocked by production launch gates. It is not approval to build the
assistant, status page, postmortems, or API hosting migration, and it does not
change launch readiness.

Authoritative blockers:

- `runbooks/FINAL_LAUNCH_CHECKLIST.md`
- `runbooks/LAUNCH_EVIDENCE.md`
- `runbooks/LAUNCH_BLOCKERS_REGISTER.md`
- `docs/GITHUB_SYNC.md`
- `docs/BACKLOG.md`

## Operator Rules

- Do not close Phase 8 issues from this runbook alone.
- Do not claim launch readiness from this runbook.
- Do not build a portfolio assistant before B-064 has an approved decision note;
  `docs/ASSISTANT_SCOPE_DECISION.md` is draft decision support only.
- Do not expose private deployment details, provider account IDs, logs, private
  paths, credentials, raw contact data, or unapproved case-study evidence.
- Keep any status or metadata concept safe when the API is unavailable; static
  fallback content must remain useful without JavaScript.
- Treat hosting comparisons as decision support until real production launch
  evidence exists.

## Prep Matrix

| Feature lane                     | Backlog / issue | Current gate                                                                                       | Safe prep now                                                                                                                                                                                                          | Required later evidence                                                      |
| -------------------------------- | --------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Portfolio assistant scope        | B-064 / #70     | Blocked until B-063 launch evidence exists.                                                        | Draft decision note only: `docs/ASSISTANT_SCOPE_DECISION.md` defines user value, public data sources, privacy model, cost controls, rate limits, and no-secret frontend architecture without approving implementation. | HumanKaylee-approved build/defer/reject decision after launch.               |
| Portfolio assistant prototype    | B-065 / #71     | Blocked until B-064 approved build recommendation.                                                 | Do not build; document disabled-mode expectations, public-content-only prompt boundaries, and abuse/cost controls for a future prototype.                                                                              | Prompt/content tests and disabled-mode smoke test after approved scope.      |
| Public status or metadata page   | B-066 / #72     | Blocked until B-063 launch evidence exists, with B-039 and B-040 already providing API primitives. | Contract only: limit public data to `/api/health`, `/api/projects/live`, static fallback copy, and no private deployment details.                                                                                      | API-up and API-down page checks against production or owner-approved production-equivalent provider preview URLs. |
| Additional notes and postmortems | B-067 / #73     | Blocked until B-063 launch evidence exists.                                                        | draft outlines only; require problem, approach, evidence, lesson, and redaction review before publishing.                                                                                                              | Feed and notes index review after launch with approved public-safe content.  |
| API hosting migration            | B-068 / #74     | Blocked until B-058 and B-063 provide selected-host and production launch evidence.                | Decision matrix only: use `docs/ARCHITECTURE.md#9-hosting-architecture` as the canonical candidate source and compare every candidate without selecting a provider.                                                    | Future host-retention recommendation after real API host production evidence. |

## Status Page Safe Boundary

A future status or metadata page can use only public-safe API data:

- `GET /api/health`: service name, status, version, commit, uptime, and
  environment if the environment label is public-safe.
- `GET /api/projects/live`: bounded project metadata from the existing static
  provider/cache shape.
- Static fallback copy that says live metadata is unavailable without implying
  the site is down.

Do not show provider account names, deployment IDs, internal hostnames, private
repository paths, log snippets, tokens, contact records, or incident details
that have not passed redaction review.

## B-066 Status / Metadata Implementation Checklist

This is planning guidance only. It does not authorize route or UI work, and it
remains launch-blocked until B-063.

- Permitted data sources: `/api/health`, `/api/projects/live`, static fallback
  copy.
- API-up check.
- API-down fallback check.
- No private deployment, provider, log, or contact data.
- No JavaScript requirement for core content.
- Launch-blocked until B-063.
- No route or UI implementation yet.

## Assistant Safe Boundary

A future assistant must answer only from public portfolio content, disclose its
limitations, keep secrets server-side, and be disableable without changing core
portfolio navigation. The scope decision must explicitly answer:

- What user value exists beyond novelty.
- Which public documents or content collections are allowed sources.
- What data is logged, retained, or excluded.
- What cost and rate-limit controls stop runaway usage.
- How the frontend behaves when the assistant is disabled.

Current draft: `docs/ASSISTANT_SCOPE_DECISION.md` recommends deferring
implementation until B-063 launch evidence exists and HumanKaylee approves the
post-launch assistant decision. This is not B-065 implementation approval.

## Notes And Postmortem Boundary

Draft post-launch writing can be outlined before launch, but publishing waits for
the normal content workflow:

- Problem.
- Approach.
- Evidence.
- Lesson.
- Redaction review.
- RSS/index verification.

## B-067 Draft Outline Contract

Outline status: draft only; not published content.

Do not create `apps/web/src/content/notes/*.md` entries before B-063 launch
evidence exists. Draft outline records can live in planning docs or issue
comments only, and must not update the live notes collection, notes index, or RSS
feed before approved content exists.

Every future B-067 note or postmortem outline must include:

- Working title.
- Problem.
- Approach.
- Evidence plan.
- Lesson.
- Redaction review.
- Launch dependency.
- RSS/index verification after launch.

No RSS feed update is expected before published content exists.

## B-067 Draft Outline Records

Status: planning outlines only; not published content.

These records do not create notes collection entries, RSS feed items, launch evidence, or publication approval.

### Outline: Static-first portfolio launch after-action

- Working title: Static-first portfolio launch after-action.
- Problem: Explain how the launch balanced a visually distinctive portfolio with
  strict no-JavaScript, no-WebGL, and API-down usefulness.
- Approach: Summarize the static shell, progressive enhancement boundaries,
  route coverage, Lighthouse gates, and fallback verification after production
  launch evidence exists.
- Evidence plan: Use final production frontend smoke, production Lighthouse,
  visual regression, accessibility, keyboard, API-down, and rollback evidence
  from the launch evidence runbook.
- Lesson: Static-first design made the impressive layer additive instead of a
  core-content dependency.
- Redaction review: Review for provider IDs, private paths, operational logs,
  credentials, unapproved project details, and any production incident data
  before publication.
- Launch dependency: B-063 launch evidence and approved public-safe content.
- RSS/index verification after launch: Confirm the published note appears in
  `/notes/`, `rss.xml`, sitemap metadata, and notes visual/responsive checks.

### Outline: Redaction-safe case-study production workflow

- Working title: Redaction-safe case-study production workflow.
- Problem: Document how case-study drafts moved from useful private evidence to
  public-safe narratives without treating `reviewed` as `approved`.
- Approach: Cover the content schema, redaction status index, approval packets,
  issue traceability, open-item tracking, and human signoff requirement.
- Evidence plan: Use final approved case-study frontmatter, approval packet
  signoff, content traceability contract output, and launch checklist evidence.
- Lesson: Public credibility improves when approval state is explicit and
  separated from implementation progress.
- Redaction review: Re-check every referenced artifact, source label, proof
  claim, screenshot, hostname, username, and operational detail against the
  content redaction guide.
- Launch dependency: B-063 launch evidence plus case-study records that have a
  completed human redaction approval state.
- RSS/index verification after launch: Confirm the published note appears in
  `/notes/`, `rss.xml`, sitemap metadata, and notes visual/responsive checks.

### Outline: Rust API launch operations postmortem

- Working title: Rust API launch operations postmortem.
- Problem: Explain what the Rust Axum API proves for the portfolio and what
  operational constraints shaped production launch decisions.
- Approach: Cover `/api/health`, `/api/projects/live`, contact delivery,
  cache/stale behavior, container/standalone checks, selected hosting evidence,
  rollback proof, and API-down frontend behavior.
- Evidence plan: Use selected host deployment evidence, production API health
  smoke, project metadata smoke, contact handling decision evidence, rollback
  proof, Rust CI, dependency audit, and container smoke output.
- Lesson: A portfolio backend should prove engineering depth while the static
  frontend remains useful when the API is unavailable.
- Redaction review: Remove provider account details, deployment IDs unless
  approved for public evidence, log snippets, contact payloads, tokens, private
  environment values, and raw operational traces.
- Launch dependency: B-058 selected API host evidence and B-063 launch evidence.
- RSS/index verification after launch: Confirm the published note appears in
  `/notes/`, `rss.xml`, sitemap metadata, and notes visual/responsive checks.

## API Hosting Decision Inputs

Official-source snapshot date: 2026-05-24.
Canonical hosting source: `docs/ARCHITECTURE.md#9-hosting-architecture`.

Record hosting facts from official provider documentation only. At minimum,
compare:

- Shuttle shutdown status: Shuttle is not a viable new launch target.
  Source: https://docs.shuttle.dev/docs/shuttle-shutdown
- Fly.io, Railway, or another approved host as the approved current-host
  comparison set for #64.
  Sources: https://fly.io/docs/about/pricing/ and
  https://docs.railway.com/pricing
- Cloudflare Workers or Pages Functions as a cheap edge/runtime rewrite option.
  Source: https://developers.cloudflare.com/workers/platform/pricing/
- Hetzner as a low-cost, higher-ops VPS fallback.
  Source: https://docs.hetzner.com/cloud/servers/overview

Decision inputs must cover uptime expectations, cost, deploy complexity, custom
domain and TLS support, observability/logs, rollback or deployment history, Rust
Axum fit, cold-start or sleep behavior, and operational risks.

## B-068 Migration Comparison Inputs

Compare-only evidence capture for the future API-hosting recommendation. This
is no ranking, no provider choice, and not launch evidence. Step-by-step
provider-move procedures and rollback procedures are deferred until a later
approved decision exists.

- Current launch host evidence.
- Uptime/availability expectation.
- Monthly cost estimate.
- Deploy complexity.
- Custom domain/TLS support.
- Observability/logs.
- Rollback/deployment history.
- Rust Axum fit.
- Cold-start/sleep behavior.
- Operational risk.
- Provider-move procedure and rollback procedure only after a future
  recommendation exists.

### B-068 Comparison Matrix

| Candidate | Official doc source | Snapshot date | Source-derived comparison inputs | Still blocked by |
| --- | --- | --- | --- | --- |
| Shuttle legacy compatibility | https://docs.shuttle.dev/docs/shuttle-shutdown | 2026-05-24 | Source states Shuttle is ceasing operations. Keep only for legacy binary compatibility evidence, not as a new launch target. | Removal or replacement decision for the legacy binary; not a launch-host candidate. |
| Fly.io normal Axum PaaS candidate | https://fly.io/docs/about/pricing/ | 2026-05-24 | Usage-based Machines pricing, public networking/TLS, logs/metrics, Docker fit, regional runtime, and machine stopped/suspended cost behavior require future selected-host verification. | B-058 selected-host evidence and B-063 production launch evidence. |
| Railway normal Axum PaaS candidate | https://docs.railway.com/pricing | 2026-05-24 | Plan plus resource-usage pricing, app deploy flow, logs/metrics, custom domain/TLS, and always-on or sleep behavior require future selected-host verification. | B-058 selected-host evidence and B-063 production launch evidence. |
| Cloudflare Workers/Pages Functions edge rewrite option | https://developers.cloudflare.com/workers/platform/pricing/ | 2026-05-24 | Request and CPU pricing can be cheap for edge glue, but this option changes the backend runtime model away from normal Axum. | Edge/runtime rewrite decision, API shape decision, and B-063 production launch evidence. |
| Hetzner VPS higher-ops fallback | https://docs.hetzner.com/cloud/servers/overview | 2026-05-24 | VM control, shared or dedicated resources, Primary IP networking, self-managed TLS/logs, patching, backups, and incident ownership require explicit ops evidence. | Ops ownership decision, B-058 selected-host evidence, and B-063 production launch evidence. |

## Verification

Use this contract when changing Phase 8 prep docs:

```bash
node --test scripts/post-launch-feature-prep-contract.test.mjs
```

This command verifies the prep record remains blocked/planning-only and does not
authorize launch readiness or post-launch implementation.
