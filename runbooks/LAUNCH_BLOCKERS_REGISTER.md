# Launch Blockers Register

Date: 2026-05-24
Branch: `goal/portfolio-implementation`
Scope: B-005
Status: decision register only; not launch-ready

This register tracks decisions that can block production launch or post-launch
execution. Resolved rows record decision evidence only; they must not be used as
launch-readiness claims without the linked production smoke evidence.
For Phase 7, this register tracks the open launch blocker set #63, #64, #65,
and #69 as traceability targets only.

Authoritative follow-through remains in `runbooks/FINAL_LAUNCH_CHECKLIST.md`,
`runbooks/LAUNCH_EVIDENCE.md`,
`runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md`, and `docs/GITHUB_SYNC.md`.
Replace `Blocked / pending` statuses only after the owner records a concrete
decision, target, approval, or command artifact in the linked evidence docs.
Phase 7 deployment decision packets are issue-progress evidence only; they do
not resolve any blocker by themselves.

## Decision Register

| Decision                                 | Impact                                                                                                                                                                                                                                                                                     | Latest acceptable resolution phase          | Owner            | Status                           | Next evidence                                                                                                                                                                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ---------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend provider/project target         | Selects the Cloudflare Pages project, production branch, deploy mode, environment-variable scope, custom-domain target, preview behavior, and frontend rollback evidence scope.                                                                                                            | Phase 7 launch validation, before deploy    | Operations owner | Blocked / pending decision       | Record provider project name, production branch, deployment URL, environment variables, custom-domain target, and rollback target in `runbooks/LAUNCH_EVIDENCE.md`.                                                                                                    |
| Final domain name                        | Sets canonical URLs, Open Graph metadata, sitemap URLs, DNS, TLS, Cloudflare Pages custom-domain configuration, and production smoke scope.                                                                                                                                                | Phase 7 launch validation, before deploy    | HumanKaylee      | Blocked / pending decision       | Record selected domain, DNS target, TLS status, and production frontend smoke rows in `runbooks/LAUNCH_EVIDENCE.md`.                                                                                                                                                   |
| Final resume PDF source                  | Determines whether the committed resume asset remains the public resume source or needs replacement before recruiter-facing launch.                                                                                                                                                        | Phase 7 launch validation, before deploy    | HumanKaylee      | Resolved / approved local source | `sha256sum` and `cmp -s` confirmed the downloaded source PDF and committed asset are byte-identical with SHA-256 `3a6f35bf0f565fb9bbf2009665b40ae7a556dd39ff99e0d04043cab8a4c5f477`; still capture production `/resume/` and PDF smoke evidence after frontend deploy. |
| Public-safe case-study approvals         | Controls whether at least four publish-intended case studies can count toward launch without leaking private systems, accounts, or logs.                                                                                                                                                   | Phase 6 QA, before Phase 7 launch checklist | Content owner    | Blocked / pending approval       | Complete approval packets, set approved records only after human signoff, and update `runbooks/CONTENT_REDACTION_STATUS.md`.                                                                                                                                           |
| API host decision after Shuttle shutdown | Selects the production API provider, API origin, deploy command, secret storage model, rollback procedure, and API health smoke target. Shuttle is not a viable new launch target per https://docs.shuttle.dev/docs/shuttle-shutdown; Fly.io, Railway, or another approved host are the approved current-host comparison set for #64. | Phase 7 launch validation, before deploy    | Operations owner | Blocked / pending decision       | Record selected provider/project/origin, secret storage, deployment ID, `/api/health` output, and rollback target in `runbooks/LAUNCH_EVIDENCE.md`.                                                                                                                    |
| Contact production handling              | Decides whether launch uses mailto-only as an approved exception or enables the Rust contact endpoint with an approved persistent store or provider plus retention, backup, rotation, and deletion decisions.                                                                              | Phase 7 launch validation, before launch    | HumanKaylee      | Blocked / pending decision       | Record selected contact path, storage/provider configuration, retention policy, backup/rotation/deletion decisions, and production contact smoke result in `runbooks/LAUNCH_EVIDENCE.md`.                                                                              |
| AI assistant v1 vs v2 decision           | Decides whether the post-launch assistant ships as a small safe v1, is deferred, or requires a richer v2 backlog before public exposure.                                                                                                                                                   | Phase 8 post-launch planning                | HumanKaylee      | Blocked / pending decision       | Record launch/no-launch decision, safety boundary, content corpus approval, and issue status updates in `docs/GITHUB_SYNC.md`.                                                                                                                                         |

## Phase 7 Issue Traceability

Traceability rows explain which launch issue stays open, which blocker register
decision controls it, and which evidence row must be replaced before closure.
They are audit aids only; they do not authorize deployment, issue closure, or a
launch-ready claim.

| Backlog issue | Controlling blocker decisions                                                                                                                                                                   | Evidence row to replace before closure                                                                                             | Closure rule                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| B-057 / #63   | Frontend provider/project target and Final domain name for Cloudflare Pages frontend deployment.                                                                                                | Production frontend smoke with provider project, deployment URL, custom-domain target, and rollback target.                        | Keep #63 open until the production or approved-preview frontend deploy record exists.           |
| B-058 / #64   | API host decision after Shuttle shutdown; contact production handling decision for Rust API deployment.                                                                                         | Production API smoke with public API origin, secret storage, contact handling, CORS result, `/api/health`, and rollback target.    | Keep #64 open until the API host, origin, secrets, contact handling, and health evidence exist. |
| B-059 / #65   | Final domain name and canonical URL decision for Production domain and canonical URLs.                                                                                                          | DNS/TLS, canonical metadata, sitemap, Open Graph, robots, RSS, and production route metadata smoke evidence.                       | Keep #65 open until the selected domain resolves with TLS and production metadata checks pass.  |
| B-063 / #69   | Frontend provider/project target, Final domain name, API host decision after Shuttle shutdown, Contact production handling, and Public-safe case-study approvals for Complete launch checklist. | Production Lighthouse, Contact production handling, Rollback evidence, production route/API smoke, and four approved case studies. | Keep #69 open until every B-063 acceptance row has production or approved launch evidence.      |

## Operator Rules

- Do not close launch validation items from this register alone.
- Do not convert a `Blocked / pending` row to pass based on local-only or PR-only
  evidence when the row requires production targets or human approval.
- Do not treat the resolved resume-source row as evidence that `/resume/` or
  the PDF link is live in production.
- Keep private hostnames, usernames, raw logs, credentials, private paths, and
  account-linked financial details out of this register.
- When one row is resolved, update only that row and the corresponding evidence
  record; do not imply unrelated blockers are cleared.
