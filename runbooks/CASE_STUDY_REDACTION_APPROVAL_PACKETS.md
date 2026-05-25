# Case Study Redaction Approval Packets

Date: 2026-05-24
Status: review-only launch-blocking evidence index; no launch approval; no issue closure.
Scope: launch-candidate case-study approval evidence

## Purpose

This runbook gives each publish-intended case study a repeatable approval packet
without changing any candidate to `approved`. A packet is not approved until
human signoff, a completed checklist, cleared open items, and reviewed
public-safe evidence exist.

Authoritative sources:

- `docs/CONTENT_REDACTION_GUIDE.md`
- `runbooks/CONTENT_REDACTION_STATUS.md`
- `apps/web/src/lib/contracts/content.ts`

## Approval Gate

A case study can count toward launch only after all of these are true:

- `publicationStatus: publish`
- `redactionStatus: approved`
- `redactionReview.checklistStatus` is `complete`
- `redactionReview.checklist` contains every required answer
- `redactionReview.openItems` is empty
- reviewer and review date are recorded
- linked artifacts inspected and documented
- public-safe evidence is understandable without private context
- approval decision is explicit and traceable

Until those conditions are met, the packet remains review evidence only.

## Packet Readiness Matrix

This Packet Readiness Matrix is the canonical non-approval evidence for the
four current `publish` candidates. It shows exactly which approval evidence
remains missing for each current publish-intended case study. It does not mark
any case study approved.
#20 and #21 remain open until open items, artifact inspection, and human signoff
are complete.

Run `pnpm redaction:readiness` to refresh a machine-readable local readiness
summary at `test-results/case-study-redaction-readiness.json`. The summary is
reviewer handoff input only with Evidence Authority `local/redaction-readiness`;
it cannot approve case studies, clear open items, close issues, or satisfy the
v1 launch minimum.

| Candidate                                             | Current state          | Missing approval evidence                                                                                                     |
| ----------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| CLI Fleet Synchronization and MCP Rollout             | `publish` / `reviewed` | Checklist answers recorded; missing `openItems` clearance and missing artifact evidence source for the sanitized rollout set. |
| Creative Web Systems Atlas Demo                       | `publish` / `reviewed` | Checklist answers recorded; missing `openItems` clearance and missing atlas fallback artifact inspection evidence.            |
| HumanKaylee Portfolio Build                           | `publish` / `reviewed` | Checklist answers recorded; missing `openItems` clearance and missing production domain evidence for launch claims.           |
| Remote Workstation Recovery and Operational Debugging | `publish` / `reviewed` | Checklist answers recorded; missing `openItems` clearance and missing redacted incident summary inspection evidence.          |

## Non-Approval Evidence Inventory

These inventory notes are review-only; they do not grant launch approval or
close issues. They identify which public-safe evidence exists in the current
content and which artifact inspections still need a human reviewer before any
candidate can move from `reviewed` to `approved`.

Counts-only mechanical scan note: the operational case-study bodies were
checked for email-like strings, IP addresses, private home path markers,
Windows absolute paths, credential assignment markers, and raw-log timestamp
prefixes. The counts were zero for each category; matched-text excerpts are
intentionally omitted so this runbook does not publish any private-looking
material if future scans find it.

| Candidate                                             | Current public-safe evidence                                                                                        | Still missing before approval                                                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| CLI Fleet Synchronization and MCP Rollout             | In-page sanitized architecture sketch, In-page sanitized verification matrix, In-page sanitized operator checklist. | Pending reviewer inspection of sanitized rollout matrix and Pending reviewer inspection of operator checklist.        |
| Creative Web Systems Atlas Demo                       | Semantic project atlas fallback, static systems-map poster, and accessibility/performance boundary notes.           | Pending reviewer inspection of atlas fallback evidence and final public route evidence.                               |
| HumanKaylee Portfolio Build                           | Static-first local verification matrix, optional Rust API boundary, and public-safe launch evidence boundary.       | Pending reviewer inspection of local verification and launch evidence claims plus production-domain evidence.         |
| Remote Workstation Recovery and Operational Debugging | In-page role-labeled diagnostic flow, In-page sanitized verification matrix, and role-labeled prevention notes.     | Pending reviewer inspection of redacted incident summary and Pending reviewer inspection of operator runbook excerpt. |

## B-014/B-015 Artifact Inspection Handoff Queue

This queue gives reviewers the exact artifact labels to inspect for #20 and #21.
Each handoff can produce only `reviewed` or `blocked` reviewer notes until
openItems are cleared and a separate approval decision is recorded. These rows
are not approval evidence.

| Artifact label            | Issue | Candidate title                                       | Current status              | Allowed reviewer result  | Forbidden material note                                                                 | Approval boundary                                      |
| ------------------------- | ----- | ----------------------------------------------------- | --------------------------- | ------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| sanitized rollout matrix  | #20   | CLI Fleet Synchronization and MCP Rollout             | pending reviewer inspection | reviewed or blocked only | Forbidden material: credentials, private paths, hostnames, account names, and raw logs. | not approval evidence; do not change redaction status. |
| operator checklist        | #20   | CLI Fleet Synchronization and MCP Rollout             | pending reviewer inspection | reviewed or blocked only | Forbidden material: credentials, access paths, account identifiers, and exact commands. | not approval evidence; do not clear openItems.         |
| redacted incident summary | #21   | Remote Workstation Recovery and Operational Debugging | pending reviewer inspection | reviewed or blocked only | Forbidden material: hostnames, session identifiers, raw logs, and exact recovery steps. | not approval evidence; do not close #21.               |
| operator runbook excerpt  | #21   | Remote Workstation Recovery and Operational Debugging | pending reviewer inspection | reviewed or blocked only | Forbidden material: private access paths, account details, credentials, and raw logs.   | not approval evidence; do not mark content approved.   |

## Packet Template

Use this template when preparing a future approval request. Do not mark the
content record `approved` from the template alone.

| Field                    | Required value or note                                                     |
| ------------------------ | -------------------------------------------------------------------------- |
| Candidate                | Case-study title and content path                                          |
| Reviewer                 | Human reviewer or named review role                                        |
| Review date              | `YYYY-MM-DD`                                                               |
| Current publication      | Current `publicationStatus`                                                |
| Current redaction        | Current `redactionStatus`                                                  |
| Artifact evidence source | Public URL, owner-approved production-equivalent provider preview URL, local artifact path, or `not-applicable` |
| Linked artifact review   | Notes confirming linked artifacts inspected                                |
| Public-safe evidence     | Summary of evidence that supports claims without private context           |
| Approval decision        | `approved`, `blocked`, or `reviewed` with reason                           |
| Follow-up owner          | Person or role responsible for open items                                  |

Required checklist mapping:

| Guide check                                                     | Schema field                                                   | Required answer                               | Packet evidence note |
| --------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------- | -------------------- |
| Secrets removed                                                 | `redactionReview.checklist.secretsRemoved`                     | `yes`                                         | Pending              |
| Hostnames and access paths generalized                          | `redactionReview.checklist.hostnamesAndAccessPathsGeneralized` | `yes`                                         | Pending              |
| Usernames and account names generalized or intentionally public | `redactionReview.checklist.userAndAccountNamesGeneralized`     | `yes`                                         | Pending              |
| Screenshots inspected at full resolution                        | `redactionReview.checklist.screenshotsInspected`               | `yes` or `not-applicable`                     | Pending              |
| Logs summarized or sanitized                                    | `redactionReview.checklist.logsSummarizedOrSanitized`          | `yes` or `not-applicable`                     | Pending              |
| Repo/demo links are public and intentional                      | `redactionReview.checklist.publicLinksVerified`                | `yes` or `not-applicable`                     | Pending              |
| Claims have safe supporting evidence                            | `redactionReview.checklist.claimsHaveSafeEvidence`             | `yes`                                         | Pending              |
| Security-sensitive procedures removed or generalized            | `redactionReview.checklist.securitySensitiveProceduresRemoved` | `yes`                                         | Pending              |
| Redaction reviewer recorded                                     | `redactionReview.reviewer` and `redactionReview.reviewedOn`    | present                                       | Pending              |
| Redaction status                                                | `redactionStatus`                                              | `approved`, `blocked`, `reviewed`, or `draft` | Pending              |

## CLI Fleet Synchronization and MCP Rollout

Current state: `publicationStatus: publish`, `redactionStatus: reviewed`.

Approval packet status: not approved until human signoff.

Missing approval evidence:

- Checklist answers are recorded in `redactionReview.checklist`, but
  `redactionReview.checklistStatus` remains `partial` until open items and
  artifact evidence are cleared.
- Cleared `redactionReview.openItems`.
- Artifact evidence source for the sanitized rollout matrix and operator
  checklist.
- Reviewer confirmation that no credentials, private paths, hostnames, account
  identifiers, or raw operational logs remain.

## Creative Web Systems Atlas Demo

Current state: `publicationStatus: publish`, `redactionStatus: reviewed`.

Approval packet status: not approved until human signoff.

Missing approval evidence:

- Checklist answers are recorded in `redactionReview.checklist`, but
  `redactionReview.checklistStatus` remains `partial` until open items and
  artifact evidence are cleared.
- Cleared `redactionReview.openItems`.
- Artifact evidence source for atlas fallback screenshots or `not-applicable`.
- production or owner-approved production-equivalent provider preview evidence for the final public route.
- Reviewer confirmation that no WebGL, R3F, Three.js, or interactive feature is
  claimed as launched unless separately approved.

## HumanKaylee Portfolio Build

Current state: `publicationStatus: publish`, `redactionStatus: reviewed`.

Approval packet status: not approved until human signoff.

Missing approval evidence:

- Checklist answers are recorded in `redactionReview.checklist`, but
  `redactionReview.checklistStatus` remains `partial` until open items and
  artifact evidence are cleared.
- Cleared `redactionReview.openItems`.
- Public artifact inspection for local verification and launch evidence claims.
- production or owner-approved production-equivalent provider preview evidence for frontend domain, provider deploy,
  API health, and rollback records before production claims are approved.

## Remote Workstation Recovery and Operational Debugging

Current state: `publicationStatus: publish`, `redactionStatus: reviewed`.

Approval packet status: not approved until human signoff.

Missing approval evidence:

- Checklist answers are recorded in `redactionReview.checklist`, but
  `redactionReview.checklistStatus` remains `partial` until open items and
  artifact evidence are cleared.
- Cleared `redactionReview.openItems`.
- Linked artifact inspection for the redacted incident summary and operator
  runbook excerpt.
- Reviewer confirmation that private hostnames, access paths, credentials,
  exact recovery sequences, account details, and raw logs remain excluded.

## Deferred Or Blocked Candidates

Kalshi Migration or Analytics Tooling and YouTube AI Video Pipeline remain
blocked or deferred. They are not eligible for v1 launch approval unless a
future reviewer creates a separate packet with synthetic examples, public-safe
evidence, and no account-linked or private workflow details.

## Verification

Before changing any case study to `approved`, run:

```bash
pnpm test -- --run content
pnpm redaction:readiness
node --test scripts/redaction-approval-packets-contract.test.mjs
node --test scripts/content-runbook-contract.test.mjs
node --test scripts/final-launch-checklist-contract.test.mjs
pnpm lint
pnpm typecheck
```

Then append launch evidence with the exact command output, reviewer, review
date, artifact evidence source, and approval decision.
