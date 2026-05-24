# Content Redaction Status

Date: 2026-05-24
Branch: `goal/portfolio-implementation`
Status: launch-blocking evidence index only; this file does not approve content.

## Scope

This runbook summarizes the current redaction state for every case-study
candidate in `apps/web/src/content/case-studies/`. It applies the launch gate in
`docs/CONTENT_REDACTION_GUIDE.md`: a case study can count toward launch only
when `publicationStatus` is `publish`, `redactionStatus` is `approved`, every
linked artifact has passed review, and the story remains understandable without
private context.

No candidate currently meets that launch gate.

Do not use readiness or sufficiency language for blocked candidates; keep
approval wording explicit until every launch gate is actually complete.

Approval packet templates for the four current `publish` candidates live in
`runbooks/CASE_STUDY_REDACTION_APPROVAL_PACKETS.md`. Those packets now include a
readiness matrix that identifies exactly which approval evidence remains
missing for each candidate, a B-014/B-015 Artifact Inspection Handoff Queue for
#20/#21 reviewer routing, plus a Non-approval evidence inventory for all four
current `publish` candidates. The counts-only mechanical scan note remains
limited to the two operational case-study bodies; those packets do not approve
any case study.

Publication-safety decisions for the Kalshi/analytics and YouTube AI pipeline
blocked candidates live in `runbooks/PUBLICATION_SAFETY_DECISIONS.md`. That
record is decision support only; it does not approve publication. Its synthetic
proof pack is not approval evidence and does not replace the Content Redaction
Guide launch gate.

## Redaction Matrix

| Candidate                                             | Publication status | Redaction status | Current evidence                                                                                                                                                                                           | Approval next action                                                                                                                                                                                            |
| ----------------------------------------------------- | ------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CLI Fleet Synchronization and MCP Rollout             | `publish`          | `reviewed`       | Generalized body now includes a public-safe architecture sketch, summarized verification matrix, and sanitized operator checklist.                                                                         | Review recorded checklist answers, inspect linked artifacts through the B-014/B-015 Artifact Inspection Handoff Queue for #20, keep #20 open, keep `reviewed`, and do not clear open items from this queue.     |
| Creative Web Systems Atlas Demo                       | `publish`          | `reviewed`       | Public-safe body now explains the semantic project atlas fallback, static systems-map proof, motion boundary, performance budget, accessibility contract, local verification, and B-017 scope boundary.    | Review recorded checklist answers, inspect atlas fallback artifacts, and capture production or approved preview evidence before changing status to `approved`.                                                  |
| HumanKaylee Portfolio Build                           | `publish`          | `reviewed`       | Public-safe body now explains the static-first architecture, content model, Systems Atelier visual layer, optional Rust API boundary, agent assistance, verification matrix, and launch evidence boundary. | Review recorded checklist answers, inspect public artifacts, and add real production domain, provider, deploy, and rollback evidence before changing status to `approved`.                                      |
| Kalshi Migration or Analytics Tooling                 | `defer`            | `blocked`        | Deferred candidate; finance/account-linked work still needs a synthetic or heavily generalized public boundary before v1 consideration.                                                                    | Keep out of v1 unless a reviewer validates a synthetic or heavily generalized abstraction with no private financial, account, repository, path, or operational details.                                         |
| Remote Workstation Recovery and Operational Debugging | `publish`          | `reviewed`       | Generalized body now includes a public-safe troubleshooting narrative, sanitized diagnostic flow, verification matrix, and prevention checklist.                                                           | Review recorded checklist answers, inspect linked artifacts through the B-014/B-015 Artifact Inspection Handoff Queue for #21, keep #21 open, keep `reviewed`, do not clear open items, and keep hostnames out. |
| YouTube AI Video Pipeline                             | `needs-redaction`  | `blocked`        | Blocked candidate; the draft says private channel details, account identifiers, and private-asset workflow edges still need removal.                                                                       | Keep blocked until a public-safe proof narrative, synthetic examples, and sanitized artifact pack are reviewed and approved.                                                                                    |

## GitHub Issue Traceability

Traceability rows are approval aids only; they do not close issues, approve
publication, or change launch eligibility. The `issueTrace` frontmatter in the
listed case-study records mirrors these rows so issue ownership, backlog
identity, and closure rules travel with the content metadata.

| Candidate                                             | Issue trace | Current state                 | Approval blocker                                                                                                  | Closure rule                                                                                                                                  |
| ----------------------------------------------------- | ----------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| CLI Fleet Synchronization and MCP Rollout             | B-014 / #20 | `publish` / `reviewed`        | openItems clearance, artifact inspection via the handoff queue, and human signoff.                                | Keep #20 open until open items, artifact inspection, and human signoff are complete.                                                          |
| Remote Workstation Recovery and Operational Debugging | B-015 / #21 | `publish` / `reviewed`        | openItems clearance, artifact inspection via the handoff queue, and human signoff.                                | Keep #21 open until open items, artifact inspection, and human signoff are complete.                                                          |
| HumanKaylee Portfolio Build                           | B-016 / #22 | `publish` / `reviewed`        | production domain/provider evidence, rollback proof, redaction approval, and human signoff.                       | Issue #22 is closed as draft-content only; keep reviewed status until production and redaction approval evidence exist.                       |
| Creative Web Systems Atlas Demo                       | B-017 / #23 | `publish` / `reviewed`        | atlas fallback artifact review, production or approved preview evidence, and separate interactive-scope approval. | Issue #23 is closed as draft-content and fallback evidence only; keep reviewed status and require separate approval before interactive scope. |
| Kalshi Migration or Analytics Tooling                 | B-018 / #24 | `defer` / `blocked`           | HumanKaylee decision and synthetic proof pack review.                                                             | Keep #24 open until HumanKaylee records a publication decision and any synthetic proof pack passes review.                                    |
| YouTube AI Video Pipeline                             | B-019 / #25 | `needs-redaction` / `blocked` | HumanKaylee decision and synthetic proof pack review.                                                             | Keep #25 open until HumanKaylee records a publication decision and any synthetic proof pack passes review.                                    |

## Launch Implications

- Launch still needs at least four `publish` case studies with
  `redactionStatus: "approved"`.
- The four current `publish` candidates are useful route/content scaffolds, but
  their `reviewed` status remains non-launch-eligible under the guide.
- The two blocked/deferred candidates should not be used to satisfy the launch
  minimum unless their publication status and redaction review are changed after
  new safe evidence exists.

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
