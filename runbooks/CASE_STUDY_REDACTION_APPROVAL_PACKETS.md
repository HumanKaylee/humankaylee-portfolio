# Case Study Redaction Approval Packets

Date: 2026-05-23
Status: approval packets only; no case study is launch-approved
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

This matrix shows exactly which approval evidence remains missing for each
current publish-intended case study. It does not mark any case study approved.

| Candidate                                             | Current state          | Missing approval evidence                                                                                                     |
| ----------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| CLI Fleet Synchronization and MCP Rollout             | `publish` / `reviewed` | Missing checklist answers, missing `openItems` clearance, and missing artifact evidence source for the sanitized rollout set. |
| Creative Web Systems Atlas Demo                       | `publish` / `reviewed` | Missing checklist answers, missing `openItems` clearance, and missing atlas fallback artifact inspection evidence.            |
| HumanKaylee Portfolio Build                           | `publish` / `reviewed` | Missing checklist answers, missing `openItems` clearance, and missing production domain evidence for launch claims.           |
| Remote Workstation Recovery and Operational Debugging | `publish` / `reviewed` | Missing checklist answers, missing `openItems` clearance, and missing redacted incident summary inspection evidence.          |

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
| Artifact evidence source | Public URL, approved preview URL, local artifact path, or `not-applicable` |
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

- Completed checklist answers in `redactionReview.checklist`.
- Cleared `redactionReview.openItems`.
- Artifact evidence source for the sanitized rollout matrix and operator
  checklist.
- Reviewer confirmation that no credentials, private paths, hostnames, account
  identifiers, or raw operational logs remain.

## Creative Web Systems Atlas Demo

Current state: `publicationStatus: publish`, `redactionStatus: reviewed`.

Approval packet status: not approved until human signoff.

Missing approval evidence:

- Completed checklist answers in `redactionReview.checklist`.
- Cleared `redactionReview.openItems`.
- Artifact evidence source for atlas fallback screenshots or `not-applicable`.
- production or approved-preview evidence for the final public route.
- Reviewer confirmation that no WebGL, R3F, Three.js, or interactive feature is
  claimed as launched unless separately approved.

## HumanKaylee Portfolio Build

Current state: `publicationStatus: publish`, `redactionStatus: reviewed`.

Approval packet status: not approved until human signoff.

Missing approval evidence:

- Completed checklist answers in `redactionReview.checklist`.
- Cleared `redactionReview.openItems`.
- Public artifact inspection for local verification and launch evidence claims.
- production or approved-preview evidence for frontend domain, provider deploy,
  API health, and rollback records before production claims are approved.

## Remote Workstation Recovery and Operational Debugging

Current state: `publicationStatus: publish`, `redactionStatus: reviewed`.

Approval packet status: not approved until human signoff.

Missing approval evidence:

- Completed checklist answers in `redactionReview.checklist`.
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
node --test scripts/redaction-approval-packets-contract.test.mjs
node --test scripts/content-runbook-contract.test.mjs
node --test scripts/final-launch-checklist-contract.test.mjs
pnpm lint
pnpm typecheck
```

Then append launch evidence with the exact command output, reviewer, review
date, artifact evidence source, and approval decision.
