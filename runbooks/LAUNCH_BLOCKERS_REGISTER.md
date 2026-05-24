# Launch Blockers Register

Date: 2026-05-24
Branch: `goal/portfolio-implementation`
Scope: B-005
Status: decision register only; not launch-ready

This register tracks decisions that can block production launch or post-launch
execution. Resolved rows record decision evidence only; they must not be used as
launch-readiness claims without the linked production smoke evidence.

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
| Final domain name                        | Sets canonical URLs, Open Graph metadata, sitemap URLs, DNS, TLS, Cloudflare Pages custom-domain configuration, and production smoke scope.                                                                                                                                                | Phase 7 launch validation, before deploy    | HumanKaylee      | Blocked / pending decision       | Record selected domain, DNS target, TLS status, and production frontend smoke rows in `runbooks/LAUNCH_EVIDENCE.md`.                                                                                                                                                   |
| Final resume PDF source                  | Determines whether the committed resume asset remains the public resume source or needs replacement before recruiter-facing launch.                                                                                                                                                        | Phase 7 launch validation, before deploy    | HumanKaylee      | Resolved / approved local source | `sha256sum` and `cmp -s` confirmed the downloaded source PDF and committed asset are byte-identical with SHA-256 `3a6f35bf0f565fb9bbf2009665b40ae7a556dd39ff99e0d04043cab8a4c5f477`; still capture production `/resume/` and PDF smoke evidence after frontend deploy. |
| Public-safe case-study approvals         | Controls whether at least four publish-intended case studies can count toward launch without leaking private systems, accounts, or logs.                                                                                                                                                   | Phase 6 QA, before Phase 7 launch checklist | Content owner    | Blocked / pending approval       | Complete approval packets, set approved records only after human signoff, and update `runbooks/CONTENT_REDACTION_STATUS.md`.                                                                                                                                           |
| API host decision after Shuttle shutdown | Selects the production API provider, API origin, deploy command, secret storage model, rollback procedure, and API health smoke target. Shuttle is not a viable new launch target per https://docs.shuttle.dev/docs/shuttle-shutdown; Fly.io and Railway are current Axum PaaS candidates. | Phase 7 launch validation, before deploy    | Operations owner | Blocked / pending decision       | Record selected provider/project/origin, secret storage, deployment ID, `/api/health` output, and rollback target in `runbooks/LAUNCH_EVIDENCE.md`.                                                                                                                    |
| AI assistant v1 vs v2 decision           | Decides whether the post-launch assistant ships as a small safe v1, is deferred, or requires a richer v2 backlog before public exposure.                                                                                                                                                   | Phase 8 post-launch planning                | HumanKaylee      | Blocked / pending decision       | Record launch/no-launch decision, safety boundary, content corpus approval, and issue status updates in `docs/GITHUB_SYNC.md`.                                                                                                                                         |

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
