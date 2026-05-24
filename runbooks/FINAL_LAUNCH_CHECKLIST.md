# Final Launch Checklist

Date: 2026-05-24T17:14:26-04:00
Branch: `goal/portfolio-implementation`
Head: embedded verified PR head `dadb641f19d7a37b5f79c3f34904818b80c7f707`
Status: not launch-ready
Scope: B-063 final launch validation

Do not mark launch-ready from this checklist. It is an embedded-snapshot
validation matrix that separates local and PR evidence from production evidence
that does not exist yet. The authoritative evidence index remains
`runbooks/LAUNCH_EVIDENCE.md`, and the redaction source of truth remains
`runbooks/CONTENT_REDACTION_STATUS.md`. The Launch Blockers Register at
`runbooks/LAUNCH_BLOCKERS_REGISTER.md` tracks unresolved launch decisions and
owners; it does not make this checklist launch-ready. The Phase 7 Deployment
Decision Packets at `runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md` identify
the missing provider, API, domain, smoke, Lighthouse, rollback, contact, and
redaction evidence for #63, #64, #65, and #69 without approving launch.

## Embedded PR Evidence Snapshot

PR #6 is open for `goal/portfolio-implementation`. Snapshot checks at the time
of this checklist update:

| Check                 | Status | Duration | Evidence URL                                                                                    |
| --------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------- |
| Frontend verification | pass   | 6m15s    | `https://github.com/HumanKaylee/humankaylee-portfolio/actions/runs/26372667551/job/77627477189` |
| Rust verification     | pass   | 1m57s    | `https://github.com/HumanKaylee/humankaylee-portfolio/actions/runs/26372667551/job/77627477195` |

These checks are CI evidence, not production launch evidence.

## B-063 Acceptance Matrix

| Requirement                                          | Current status     | Evidence source                                                                                                                                | Next action                                                                                                                                        |
| ---------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home is live                                         | Blocked / not run  | Local route and build evidence in `runbooks/LAUNCH_EVIDENCE.md`; no production frontend target exists.                                         | Select frontend provider/project/domain, deploy intended commit, and record production route smoke output.                                         |
| Projects are live                                    | Blocked / not run  | Local project route evidence in `runbooks/LAUNCH_EVIDENCE.md`; no production frontend target exists.                                           | Smoke-test production `/projects/` after frontend deploy.                                                                                          |
| At least four case studies are live and redacted     | Blocked / not run  | Current approved launch case studies: 0 in `runbooks/CONTENT_REDACTION_STATUS.md`.                                                             | Complete redaction approval packets and inspect linked artifacts before changing any case study to `approved`.                                     |
| Resume HTML and PDF are live                         | Blocked / not run  | Local resume source is approved and the PDF asset checksum is recorded in `runbooks/LAUNCH_EVIDENCE.md`; no production frontend target exists. | Smoke-test production `/resume/` and PDF link after frontend deploy.                                                                               |
| Notes/build-log is live                              | Blocked / not run  | Local notes/RSS route evidence exists; no production frontend target exists.                                                                   | Smoke-test production `/notes/` or RSS route after frontend deploy.                                                                                |
| Contact path works                                   | Blocked / not run  | Local contact fallback and API-down evidence exists; production contact handling is not approved.                                              | Choose mailto-only launch exception or configure approved persistent contact store/provider.                                                       |
| Rust API health is live                              | Blocked / not run  | Local API health evidence exists; no production API domain, provider project, or secrets exist.                                                | Select API host, configure environment, deploy, and record public or owner-approved production-equivalent provider preview `/api/health` response. |
| CI is green                                          | Pass for PR only   | PR #6 checks above and `gh pr checks 6 --repo HumanKaylee/humankaylee-portfolio`.                                                              | Re-run after each commit; production deployment still needs provider/environment gating after provider selection.                                  |
| Lighthouse targets pass or exceptions are documented | Pass locally only  | `pnpm lighthouse:local` row in `runbooks/LAUNCH_EVIDENCE.md`.                                                                                  | Re-run Lighthouse against production or approved production-equivalent preview after deploy.                                                       |
| Deployment and rollback docs are complete            | Pass for docs only | `README.md`, `docs/OPERATIONS.md`, `runbooks/DEPLOYMENT.md`, and rollback contract evidence in `runbooks/LAUNCH_EVIDENCE.md`.                  | Replace blocked production rows only after real provider deployment IDs and rollback targets exist.                                                |

## Production Blockers

- GitHub issues #63, #64, #65, and #69 remain open until provider, deployment,
  domain, and launch evidence exist.
- Review `runbooks/LAUNCH_BLOCKERS_REGISTER.md` before Phase 7 launch work and
  update it when a blocker decision is resolved.
- Phase 7 issue traceability in `runbooks/LAUNCH_BLOCKERS_REGISTER.md` maps
  #63, #64, #65, and #69 to their controlling decisions and required
  replacement evidence.
- The final resume PDF source decision is resolved locally, but production
  `/resume/` and PDF-link smoke evidence is still not run.
- Final frontend domain and frontend provider project are not selected.
- Final API domain and API provider project are not selected.
- Final frontend and API provider projects are not selected or configured.
- Provider auth, required environment variables, and server-side secret storage
  are not configured.
- Contact production handling is not approved; mailto remains the reliable
  fallback until a persistent store path or alternate provider has retention,
  backup, rotation, and deletion decisions.
- Case-study redaction approvals are incomplete.
- Production frontend smoke, Production API smoke, Production Lighthouse,
  Contact production handling, and Rollback evidence remain Blocked / not run.

## Required Evidence Before Launch Approval

Add or update rows in `runbooks/LAUNCH_EVIDENCE.md` with real command output,
target URL, date, result, artifact, and blocker/next-action fields for:

- Production frontend smoke.
- Production API smoke.
- Production Lighthouse.
- Contact production handling.
- Rollback evidence.
- Redaction approvals for at least four case studies.

Any future launch approval claim must be supported by the affected production URL,
deployment ID, check URL, Lighthouse report, API response, redaction approval
record, or rollback target. Local-only checks and PR checks cannot satisfy a
production-live requirement.
