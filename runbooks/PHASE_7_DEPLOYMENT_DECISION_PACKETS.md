# Phase 7 Deployment Decision Packets

Date: 2026-05-24
Branch: `goal/portfolio-implementation`
Scope: B-057 through B-059 and B-063
Status: decision packets only; not launch-ready

This runbook records the exact deployment decisions and evidence still needed
for Phase 7. It is progress evidence only. It does not deploy the frontend,
deploy the API, configure DNS, approve contact handling, approve case studies,
or complete launch validation.

Authoritative blockers:

- `runbooks/FINAL_LAUNCH_CHECKLIST.md`
- `runbooks/LAUNCH_EVIDENCE.md`
- `runbooks/LAUNCH_BLOCKERS_REGISTER.md`
- `runbooks/DEPLOYMENT.md`
- `docs/GITHUB_SYNC.md`
- `docs/BACKLOG.md`

## Operator Rules

- Do not close #63, #64, #65, or #69 from this packet alone.
- Do not mark production smoke, DNS, TLS, API health, contact handling,
  rollback, Lighthouse, or redaction approvals as passed from local or PR-only
  evidence.
- Do not replace placeholder domains, provider project names, deployment IDs, or
  rollback targets until the real provider records exist.
- Keep provider account IDs, private repository paths, logs, credentials,
  contact records, and unapproved case-study evidence out of this packet.
- Do not select providers, replace placeholders, run provider commands, or
  clear blocked rows.
- Keep the packet provider-neutral.
- Update `runbooks/LAUNCH_EVIDENCE.md` with command output before changing any
  Phase 7 row from blocked to passed.

## Decision Packet Matrix

| Packet                               | Backlog / issue | Current gate                                                                                                                                    | Safe prep now                                                                                                                                                                                                                                                                                  | Required later evidence                                                                                                                                                            |
| ------------------------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cloudflare Pages frontend deployment | B-057 / #63     | Blocked until provider project, production branch, auth, and custom-domain target are selected.                                                 | Record the expected build command `pnpm build`, output directory `dist`, public variables `PUBLIC_SITE_URL` and `PUBLIC_API_BASE_URL`, preview behavior, private repo compatibility checks, and rollback evidence fields.                                                                      | Successful preview or production deploy log, deployment URL, project name, production branch, environment variables, and frontend smoke output.                                    |
| Rust API deployment                  | B-058 / #64     | Blocked until API host decision, provider project, public API origin, secret store, and contact handling decision exist.                        | Shuttle remains legacy compatibility only and is not an active or primary API host. Compare Fly.io, Railway, or another approved host, record `GET /api/health`, `HK_API_ALLOWED_ORIGINS`, `HK_API_CONTACT_DELIVERY_MODE`, CORS checks, contact handling decision, and rollback target fields. | Public or owner-approved production-equivalent provider preview `GET /api/health`, CORS smoke-check output, secret storage record, deployment ID, API origin, and rollback target. |
| Production domain and canonical URLs | B-059 / #65     | Blocked until final domain and DNS target are selected.                                                                                         | Record DNS record owner, TLS check command, canonical `PUBLIC_SITE_URL`, sitemap, Open Graph, robots, and RSS inspection fields.                                                                                                                                                               | DNS result, active TLS, final canonical URL, sitemap URL, Open Graph URL inspection, and production metadata smoke output.                                                         |
| Final launch checklist               | B-063 / #69     | Blocked until B-057, B-058, B-059, production contact handling, four approved case studies, production Lighthouse, and rollback evidence exist. | Keep the checklist honest: preserve blocked production rows, current PR-only CI rows, and local-only Lighthouse rows until production evidence exists.                                                                                                                                         | Production route smoke, API health, production Lighthouse report, contact handling proof, rollback evidence, and at least four approved public-safe case studies.                  |

## Provider-Neutral Evidence Mapping

Use this mapping when future Phase 7 evidence is ready to record. It does not
select providers, replace placeholders, run provider commands, or clear blocked
rows. Evidence authority must be explicit before any row can replace a blocked
production evidence row.

| Evidence area     | Fields to capture                                                                                                                                                                                                        | Still blocked by                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Frontend evidence | Exact command, target URL or local target, evidence authority, ISO-8601 timestamp, result/status with exit status or HTTP status, artifact/link/deployment ID/rollback target, blocker/next action, and privacy redaction rule.              | Provider project, production deploy URL, production smoke, and frontend rollback evidence.     |
| API evidence      | Exact command, public API origin or local target, evidence authority, ISO-8601 timestamp, result/status with exit status or HTTP status, artifact/link/deployment ID/rollback target, blocker/next action, and privacy redaction rule.       | API host selection, contact handling decision, API health evidence, and API rollback evidence. |
| Domain evidence   | Exact command, final domain or local validation target, evidence authority, ISO-8601 timestamp, result/status with exit status or HTTP status, artifact/link/deployment ID/rollback target, blocker/next action, and privacy redaction rule. | Final domain selection, DNS, TLS, and canonical URL evidence.                                  |
| Rollback evidence | Exact command, deployment ID or rollback target, evidence authority, ISO-8601 timestamp, result/status with exit status or HTTP status, artifact/link/deployment ID/rollback target, blocker/next action, and privacy redaction rule.        | Real deployment IDs, rollback targets, and rollback verification output.                       |

## Pre-Provider Local Readiness Contract

Status: local-readiness only; production remains blocked.

This contract defines the safe local work that can happen before provider
accounts, domains, production secrets, or deployment targets exist. Safe to run
now with no provider credentials, deploy tokens, DNS changes, or production
restarts. Provider-mutating commands stay disabled until real provider records,
domains, secrets, and rollback targets exist. Do not run `wrangler pages deploy`,
`fly deploy`, `railway up`, or production `xh` smoke commands from this local
readiness contract. Record successful local evidence in
`runbooks/LAUNCH_EVIDENCE.md` without closing #63, #64, #65, or #69.

Runnable local command reference:

```bash
pnpm test:e2e -- --grep "@security|@keyboard|@accessibility|@api-down"
pnpm phase7:launch-audit -- --dry-run
pnpm phase7:evidence-template -- --area frontend --dry-run
pnpm phase7:contact-decision -- --mode defer --dry-run
```

| Local readiness lane                      | Safe local evidence                                                                                                                                                                                                                                                               | Records to update                                                                                                | Still blocked by                                                                                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend static build readiness           | `pnpm build && pnpm bundle:budget`; `pnpm lighthouse:local` against local production-equivalent preview.                                                                                                                                                                          | `runbooks/LAUNCH_EVIDENCE.md` final local verification rows.                                                     | frontend provider project, production deployment URL, production branch/auth, and rollback target.                                                   |
| Frontend interaction and safety readiness | Focused Playwright safety grep for route, accessibility, keyboard, security, and API-outage behavior.                                                                                                                                                                             | `runbooks/LAUNCH_EVIDENCE.md` frontend local QA rows.                                                            | production frontend smoke, production Lighthouse, DNS/TLS, and final canonical URL evidence.                                                         |
| Rust API package readiness                | `cargo fmt --manifest-path apps/api/Cargo.toml --check`; `cargo clippy --manifest-path apps/api/Cargo.toml --all-targets -- -D warnings`; `cargo test --manifest-path apps/api/Cargo.toml`; `cargo audit --file apps/api/Cargo.lock`.                                             | `runbooks/LAUNCH_EVIDENCE.md` Rust verification rows.                                                            | API host, secret store, public API origin, contact delivery mode, and rollback target.                                                               |
| Local API smoke readiness                 | `HK_API_CONTACT_DELIVERY_MODE=store HK_API_CONTACT_STORE_PATH=/tmp/humankaylee-contact-local-readiness.jsonl cargo run --manifest-path apps/api/Cargo.toml --bin humankaylee-api` plus local `GET /api/health`, projects, CORS, and contact checks using a temporary JSONL store. | `runbooks/LAUNCH_EVIDENCE.md` local API smoke row.                                                               | persistent contact store, production CORS origin, production `GET /api/health`, and provider deployment ID.                                          |
| Domain and metadata readiness             | Local `PUBLIC_SITE_URL` build checks, `sitemap-index.xml`, Open Graph, robots, RSS, and canonical metadata inspection.                                                                                                                                                            | `runbooks/LAUNCH_EVIDENCE.md` final local verification or metadata rows.                                         | final domain, DNS, TLS, provider custom-domain binding, and production metadata smoke.                                                               |
| Provider auth and target preflight        | `pnpm phase7:provider-preflight -- --summary test-results/phase-7-provider-preflight.json` records `local/preflight` evidence with only environment variable names and command presence; the underlying `node scripts/phase-7-provider-preflight.mjs --summary test-results/phase-7-provider-preflight.json` helper now detects the repo-managed `wrangler` dev dependency while no `wrangler pages deploy`, `fly deploy`, `railway up`, production `xh`, or DNS/TLS changes are run. | `test-results/phase-7-provider-preflight.json` and public-safe `runbooks/LAUNCH_EVIDENCE.md` summary rows.       | frontend provider/project target, final domain name, API host decision, contact production handling, and public-safe case-study approvals.            |
| Contact handling decision template        | `pnpm phase7:contact-decision -- --mode mailto-only-exception --dry-run`, `--mode jsonl-store`, `--mode external-provider`, or `--mode defer` prints a local decision template with status `template only; production contact handling not approved`. It records required owner, retention, backup, rotation, deletion, store/provider, production smoke, rollback/disable, blocked issue, and privacy fields without approving the decision. | Optional local/readiness summary under `test-results/phase-7-contact-decision-template.json`; copy only after replacing template values with owner approval and real production or owner-approved production-equivalent provider preview smoke evidence. | HumanKaylee contact decision, retention, backup, rotation, deletion workflow, store/provider configuration, production smoke, API host, rollback target, and redaction-safe evidence. |
| Production evidence row template          | `pnpm phase7:evidence-template -- --area frontend --dry-run` or `node scripts/phase-7-evidence-template.mjs --area api --summary test-results/phase-7-evidence-template.json` prints a provider-neutral row template with status `template only; production evidence not captured`. It does not select providers, run deployment commands, change DNS/TLS, run production smoke, or close launch blocker issues. | Optional local/readiness summary under `test-results/phase-7-evidence-template.json`; copy only after replacing template values with real evidence. | real provider records, target URLs, deployment IDs, DNS/TLS, contact handling, rollback output, Lighthouse reports, human approvals, and privacy redaction review. |
| Phase 7 launch readiness audit            | `pnpm phase7:launch-audit -- --summary test-results/phase-7-launch-readiness-audit.json` records `local/readiness-audit` evidence that the unresolved external launch gates are still frontend/API deploy, final domain, contact handling, rollback, production Lighthouse, and redaction approvals. It does not deploy, approve content, submit contact payloads, change DNS/TLS, or close launch issues. | Optional public-safe summary under `test-results/phase-7-launch-readiness-audit.json`; copy only as local audit evidence, never as production launch evidence. | real production or owner-approved production-equivalent provider preview evidence for #63, #64, #65, #69, and human approval evidence for #20/#21/#24/#25. |
| Launch evidence readiness                 | `node --test scripts/final-launch-checklist-contract.test.mjs scripts/launch-blockers-register-contract.test.mjs scripts/phase-7-deployment-decision-packets-contract.test.mjs scripts/phase-7-local-readiness-contract.test.mjs`.                                                | `runbooks/FINAL_LAUNCH_CHECKLIST.md`, `runbooks/LAUNCH_BLOCKERS_REGISTER.md`, and `runbooks/LAUNCH_EVIDENCE.md`. | blocked production rows, rollback evidence, contact production handling, production Lighthouse, four approved case studies, and redaction approvals. |

## Official-Source Notes

Snapshot date: 2026-05-24. These notes are decision support only.

- Cloudflare Pages Astro guidance maps to build command `pnpm build` for this
  repo and output directory `dist`; a failed build command marks the build
  failed. Source:
  `https://developers.cloudflare.com/pages/configuration/build-configuration/`
- Cloudflare Direct Upload supports `wrangler pages deploy <directory>` with
  `--project-name` and optional `--branch`, but Direct Upload projects cannot
  later switch to Git integration. Source:
  `https://developers.cloudflare.com/pages/get-started/direct-upload/`
- Cloudflare Pages custom domains must be associated through the Pages custom
  domain flow; apex domains must be Cloudflare zones on the same account, and
  subdomains can use CNAME records. Source:
  `https://developers.cloudflare.com/pages/configuration/custom-domains/`
- Cloudflare Pages rollback: successful production deployments are rollback
  targets; preview deployments are not rollback targets. Source:
  `https://developers.cloudflare.com/pages/configuration/rollbacks/`
- Fly.io deploys with `fly deploy`; secrets are encrypted runtime environment
  variables, and rollback is image-only, not database/config/secrets rollback.
  Sources: `https://fly.io/docs/launch/deploy/`,
  `https://fly.io/docs/apps/secrets/`, and
  `https://fly.io/docs/blueprints/rollback-guide/`
- Railway deploys with `railway up`, and variables are service/environment
  scoped. Railway caution: Older deployments outside plan retention cannot be
  rolled back. Sources:
  `https://docs.railway.com/cli/deploying`,
  `https://docs.railway.com/cli/variable`, and
  `https://docs.railway.com/deployments/deployment-actions`
- Shuttle is ceasing operations and is not a viable new production launch
  target. Source: `https://docs.shuttle.dev/docs/shuttle-shutdown`

## Evidence Fields To Fill Later

Use this shape when the real provider records exist:

| Field              | Required value                                                                        |
| ------------------ | ------------------------------------------------------------------------------------- |
| Provider/project   | Cloudflare Pages project, API provider project, or domain registrar target.           |
| Target URL         | Production or owner-approved production-equivalent provider preview frontend/API URL. |
| Deployment ID      | Provider deployment identifier or release label.                                      |
| Command evidence   | Exact command and relevant success output.                                            |
| Smoke result       | Route, status, and timestamp.                                                         |
| Rollback target    | Previous known-good deployment or provider rollback record.                           |
| Owner decision     | HumanKaylee or operations-owner approval where required.                              |
| Remaining blockers | Any row that still cannot be marked passed.                                           |

## Verification Commands

Run these only after the relevant provider and domain values exist:

```bash
gh issue view 63 --repo HumanKaylee/humankaylee-portfolio --json number,state,title
gh issue view 64 --repo HumanKaylee/humankaylee-portfolio --json number,state,title
gh issue view 65 --repo HumanKaylee/humankaylee-portfolio --json number,state,title
gh issue view 69 --repo HumanKaylee/humankaylee-portfolio --json number,state,title
pnpm build
pnpm bundle:budget
pnpm lighthouse:local
xh -h "$FRONTEND_ORIGIN/"
xh --check-status --body GET "$API_ORIGIN/api/health"
```

Do not paste private provider output into public docs. Summarize only the
public-safe status, URL shape, deployment ID, and command result needed for
launch evidence.
