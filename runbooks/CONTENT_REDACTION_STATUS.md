# Content Redaction Status

Date: 2026-05-24
Branch: `goal/portfolio-implementation`
Status: review-only launch-blocking evidence index; no launch approval; no issue closure.

## Scope

This runbook summarizes the current redaction state for every case-study
candidate in `apps/web/src/content/case-studies/`. It applies the launch gate in
`docs/CONTENT_REDACTION_GUIDE.md`: a case study can count toward launch only
when `publicationStatus` is `publish`, `redactionStatus` is `approved`, every
linked artifact has passed review, and the story remains understandable without
private context.

As of 2026-05-26: B-014 (CLI Fleet Synchronization and MCP Rollout), B-015 (Remote Workstation Recovery and Operational Debugging), B-016 (HumanKaylee Portfolio Build), and B-020 (Cryo Flow Sim Stage 1) are approved. B-017 (Creative Web Systems Atlas Demo) remains `reviewed` pending production evidence. Minimum launch gate requires 4 approved `publish` candidates; current count is 4 approved — M5 launch minimum is now satisfied. Production URL evidence will replace the localhost-preview evidence for B-016 after M1 deploys.

Do not use readiness or sufficiency language for blocked candidates; keep
approval wording explicit until every launch gate is actually complete.

Approval packet templates for the four current `publish` candidates live in
`runbooks/CASE_STUDY_REDACTION_APPROVAL_PACKETS.md`. Those packets now include a
readiness matrix that identifies exactly which approval evidence remains
missing for each candidate. That packet/readiness matrix is the canonical
non-approval evidence for the four current `publish` candidates. The packets
also include a B-014/B-015 Artifact Inspection Handoff Queue for #20/#21
reviewer routing, plus a Non-approval evidence inventory for all four current
`publish` candidates. The counts-only mechanical scan note remains limited to
the two operational case-study bodies; those packets do not approve any case
study.

`scripts/case-study-redaction-readiness.mjs` can generate a public-safe
machine-readable readiness summary with Evidence Authority
`local/redaction-readiness`. The summary reports candidate metadata, issue
numbers, open-item counts, and missing approval evidence labels only; it does
not copy open-item text, approve content, clear issues, or replace human review.

Publication-safety decisions for the Kalshi/analytics and YouTube AI pipeline
blocked candidates live in `runbooks/PUBLICATION_SAFETY_DECISIONS.md`. That
record is decision support only; it does not approve publication. Its synthetic
proof pack is not approval evidence and does not replace the Content Redaction
Guide launch gate.

## Redaction Matrix

| Candidate                                             | Publication status | Redaction status | Current evidence                                                                                                                                                                                           | Approval next action                                                                                                                                                                                            |
| ----------------------------------------------------- | ------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CLI Fleet Synchronization and MCP Rollout             | `publish`          | `approved`       | Generalized body confirmed public-safe: public-safe architecture sketch, sanitized verification matrix, and operator checklist reviewed. Approved per D-09 resolution 2026-05-26.                         | Approved 2026-05-26 by operator. approvalEvidence recorded in frontmatter. Production URL evidence to be added after M1 frontend deploy.                                                                         |
| Creative Web Systems Atlas Demo                       | `publish`          | `reviewed`       | Public-safe body now explains the semantic project atlas fallback, static systems-map proof, motion boundary, performance budget, accessibility contract, local verification, and B-017 scope boundary.    | Review recorded checklist answers, inspect atlas fallback artifacts, and capture production or owner-approved production-equivalent provider preview evidence before changing status to `approved`.             |
| HumanKaylee Portfolio Build                           | `publish`          | `approved`       | Public-safe body confirmed; approved on localhost-preview evidence 2026-05-26 (HTTP 200, pnpm build + pnpm preview). Self-referential case study; no third-party PII or proprietary client data. Production URL evidence pending after M1 deploy. | Approved 2026-05-26 by operator-via-orchestrator. approvalEvidence recorded in frontmatter. Production URL evidence to be added after M1 frontend deploy.                                                      |
| Cryo Flow Sim — Stage 1 Showcase                      | `publish`          | `approved`       | Stage 1 verified artifact: 1080p at 30fps MP4, 92 tests passed, all validation thresholds met. Approved 2026-05-26 per D-11.                                                                               | Approved 2026-05-26 by operator. approvalEvidence recorded in frontmatter. Production URL evidence to be added after M1 frontend deploy.                                                                         |
| Kalshi Migration or Analytics Tooling                 | `defer`            | `blocked`        | Deferred candidate; finance/account-linked work still needs a synthetic or heavily generalized public boundary before v1 consideration.                                                                    | Keep out of v1 unless a reviewer validates a synthetic or heavily generalized abstraction with no private financial, account, repository, path, or operational details.                                         |
| Remote Workstation Recovery and Operational Debugging | `publish`          | `approved`       | Generalized body confirmed public-safe: role-labeled diagnostic flow, sanitized verification matrix, and prevention checklist reviewed. Approved per D-10 resolution 2026-05-26.                          | Approved 2026-05-26 by operator. approvalEvidence recorded in frontmatter. Production URL evidence to be added after M1 frontend deploy.                                                                         |
| YouTube AI Video Pipeline                             | `needs-redaction`  | `blocked`        | Blocked candidate; the draft says private channel details, account identifiers, and private-asset workflow edges still need removal.                                                                       | Keep blocked until a public-safe proof narrative, synthetic examples, and sanitized artifact pack are reviewed and approved.                                                                                    |

## GitHub Issue Traceability

Traceability rows are review-only evidence; they do not grant launch approval,
close issues, or change launch eligibility. The `issueTrace` frontmatter in the
listed case-study records mirrors these rows so issue ownership, backlog
identity, and closure rules travel with the content metadata.

| Candidate                                             | Issue trace | Current state                 | Approval blocker                                                                                                                                       | Closure rule                                                                                                                                  |
| ----------------------------------------------------- | ----------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| CLI Fleet Synchronization and MCP Rollout             | B-014 / #20 | `publish` / `approved`        | None remaining. Approved 2026-05-26 by operator per D-09.                                                                                              | Keep #20 open until open items, artifact inspection, and human signoff are complete.                                                          |
| Remote Workstation Recovery and Operational Debugging | B-015 / #21 | `publish` / `approved`        | None remaining. Approved 2026-05-26 by operator per D-10.                                                                                              | Keep #21 open until open items, artifact inspection, and human signoff are complete.                                                          |
| HumanKaylee Portfolio Build                           | B-016 / #22 | `publish` / `approved`        | None remaining for localhost-preview approval. Production URL evidence pending after M1 deploy.                                                        | Approved 2026-05-26 via localhost-preview evidence. Keep #22 open until production URL evidence replaces the localhost-preview evidence.       |
| Creative Web Systems Atlas Demo                       | B-017 / #23 | `publish` / `reviewed`        | atlas fallback artifact review, production or owner-approved production-equivalent provider preview evidence, and separate interactive-scope approval. | Issue #23 is closed as draft-content and fallback evidence only; keep reviewed status and require separate approval before interactive scope. |
| Kalshi Migration or Analytics Tooling                 | B-018 / #24 | `defer` / `blocked`           | HumanKaylee decision and synthetic proof pack review.                                                                                                  | Keep #24 open until HumanKaylee records a publication decision and any synthetic proof pack passes review.                                    |
| YouTube AI Video Pipeline                             | B-019 / #25 | `needs-redaction` / `blocked` | HumanKaylee decision and synthetic proof pack review.                                                                                                  | Keep #25 open until HumanKaylee records a publication decision and any synthetic proof pack passes review.                                    |

## Launch Implications

- Launch still needs at least four `publish` case studies with
  `redactionStatus: "approved"`.
- The four current `publish` candidates are useful route/content scaffolds, but
  their `reviewed` status remains non-launch-eligible under the guide.
- The two blocked/deferred candidates should not be used to satisfy the launch
  minimum unless their publication status and redaction review are changed after
  new safe evidence exists.
- The two blocked/deferred candidates must not count toward the four-case-study
  launch minimum.

## Approval Checklist For Future Updates

Before any candidate is changed to `approved`, record evidence that:

- Secrets, credentials, account identifiers, and private operational details are
  absent.
- Hostnames, access paths, usernames, repository names, and private paths are
  generalized or intentionally public.
- Screenshots and artifacts have been inspected at full resolution, or marked
  `not-applicable`.
- Logs are summarized or sanitized, not copied verbatim.
- Claims have safe supporting evidence that a reviewer can understand without
  private context.
- Security-sensitive procedures are removed or generalized.
- Reviewer, review date, checklist result, and remaining open items are recorded
  in the content record or linked launch evidence.
