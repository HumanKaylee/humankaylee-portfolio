# Content Redaction Status

Date: 2026-08-24
Branch: `feat/xplane-fov-portfolio`
Status: review-only launch-blocking evidence index; no launch approval; no issue closure.

## Scope

This runbook summarizes the current redaction state for every case-study
candidate in `apps/web/src/content/case-studies/`. It applies the launch gate in
`docs/CONTENT_REDACTION_GUIDE.md`: a case study can count toward launch only
when `publicationStatus` is `publish`, `redactionStatus` is `approved`, every
linked artifact has passed review, and the story remains understandable without
private context.

As of 2026-05-26: five candidates are `publish` with `redactionStatus: reviewed`. No candidate has yet reached `approved` status — production domain, provider deploy evidence, and final human signoff remain blocked. Minimum launch gate requires 4 approved `publish` candidates; current approved count is 0. The five publish candidates are B-014 (CLI Fleet Synchronization and MCP Rollout), B-015 (Remote Workstation Recovery and Operational Debugging), B-016 (Joe Poznanski Portfolio Build), B-017 (Creative Web Systems Atlas Demo), and B-020 (Cryo Flow Sim Stage 1).

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
| CLI Fleet Synchronization and MCP Rollout             | `publish`          | `reviewed`       | Generalized body confirmed public-safe: public-safe architecture sketch, sanitized verification matrix, and operator checklist recorded. Checklist answers complete; openItems clearance and artifact inspection pending.                         | review recorded checklist answers, clear open items, inspect linked artifacts, and capture production or owner-approved production-equivalent provider preview evidence before changing status to `approved`.   |
| Creative Web Systems Atlas Demo                       | `publish`          | `reviewed`       | Public-safe body now explains the semantic project atlas fallback, static systems-map proof, motion boundary, performance budget, accessibility contract, local verification, and B-017 scope boundary.    | Review recorded checklist answers, inspect atlas fallback artifacts, and capture production or owner-approved production-equivalent provider preview evidence before changing status to `approved`.             |
| Joe Poznanski Portfolio Build                         | `publish`          | `reviewed`       | Public-safe body confirmed on localhost-preview (HTTP 200, pnpm build + pnpm preview). Self-referential case study; no third-party PII or proprietary client data. Production domain and deploy evidence blocked. | review recorded checklist answers, inspect public artifacts, add real production domain and deploy evidence before changing status to `approved`.                                                              |
| Cryo Flow Sim — Stage 1 Showcase                      | `publish`          | `reviewed`       | Stage 1 verified artifact: 1080p at 30fps MP4, 92 tests passed, all validation thresholds met. Checklist answers recorded; production deploy evidence and final signoff pending.                                   | Review recorded checklist answers, inspect stage1 media artifacts, capture production or owner-approved production-equivalent provider preview evidence and final human signoff before changing status to `approved`. |
| Kalshi Migration or Analytics Tooling                 | `defer`            | `blocked`        | Deferred candidate; finance/account-linked work still needs a synthetic or heavily generalized public boundary before v1 consideration.                                                                    | Keep out of v1 unless a reviewer validates a synthetic or heavily generalized abstraction with no private financial, account, repository, path, or operational details.                                         |
| Remote Workstation Recovery and Operational Debugging | `publish`          | `reviewed`       | Generalized body confirmed public-safe: role-labeled diagnostic flow, sanitized verification matrix, and prevention checklist recorded. Checklist answers complete; openItems clearance and artifact inspection pending.                          | review recorded checklist answers, inspect linked artifacts, keep hostnames and recovery details generalized before changing status to `approved`.                                                              |
| YouTube AI Video Pipeline                             | `needs-redaction`  | `blocked`        | Blocked candidate; the draft says private channel details, account identifiers, and private-asset workflow edges still need removal.                                                                       | Keep blocked until a public-safe proof narrative, synthetic examples, and sanitized artifact pack are reviewed and approved.                                                                                    |

## Work Redaction Matrix

The Work collection uses the same public-safety gate. This record is separate
from the case-study launch-minimum count above.

| Candidate | Slug | Publication status | Redaction status | Current evidence | Approval next action |
| --- | --- | --- | --- | --- | --- |
| X-Plane Cabin Camera FOV Trade Study | `xplane-cabin-camera-fov-trade-study` | `publish` | `approved` | Joe authorized publication on 2026-08-24 once every release gate passes; this does not claim he personally viewed the preview. Task 2 original-resolution artifact inspection passed. Agent/browser preview inspection passed at `https://1c92ba32.humankaylee-portfolio.pages.dev`, deployment `1c92ba32-fb78-435b-a229-7dfeb8592579`, source `6df39168df3d1374e9e31058b6b7e160a867bcbc`. Full-byte hashes and direct playback passed; `pages.dev` direct range/seek is unsupported, while exact-byte Blob seeking proves artifact seekability only. `replay harness source not supplied` remains a known evidence limit, not a redaction item. | Production release remains gated on exact-SHA CI, custom-domain `206`/`Content-Range` for both X-Plane MP4s, direct custom-domain seeking, and the complete post-deploy verification matrix. |

## GitHub Issue Traceability

Traceability rows are review-only evidence; they do not grant launch approval,
close issues, or change launch eligibility. The `issueTrace` frontmatter in the
listed case-study records mirrors these rows so issue ownership, backlog
identity, and closure rules travel with the content metadata.

| Candidate                                             | Issue trace | Current state                 | Approval blocker                                                                                                                                       | Closure rule                                                                                                                                  |
| ----------------------------------------------------- | ----------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| CLI Fleet Synchronization and MCP Rollout             | B-014 / #20 | `publish` / `reviewed`        | openItems clearance, artifact inspection, and human signoff.                                                                                            | Keep #20 open until open items, artifact inspection, and human signoff are complete.                                                          |
| Remote Workstation Recovery and Operational Debugging | B-015 / #21 | `publish` / `reviewed`        | openItems clearance, artifact inspection, and human signoff.                                                                                            | Keep #21 open until open items, artifact inspection, and human signoff are complete.                                                          |
| Joe Poznanski Portfolio Build                         | B-016 / #22 | `publish` / `reviewed`        | production domain/provider evidence and redaction approval; human signoff pending.                                                                       | Issue #22 is closed as draft-content only; keep reviewed status until production and redaction approval evidence exist.                        |
| Creative Web Systems Atlas Demo                       | B-017 / #23 | `publish` / `reviewed`        | atlas fallback artifact review, production or owner-approved production-equivalent provider preview evidence, and separate interactive-scope approval. | Issue #23 is closed as draft-content and fallback evidence only; keep reviewed status and require separate approval before interactive scope. |
| Kalshi Migration or Analytics Tooling                 | B-018 / #24 | `defer` / `blocked`           | Joe Poznanski decision and synthetic proof pack review.                                                                                                  | Keep #24 open until Joe Poznanski records a publication decision and any synthetic proof pack passes review.                                    |
| YouTube AI Video Pipeline                             | B-019 / #25 | `needs-redaction` / `blocked` | Joe Poznanski decision and synthetic proof pack review.                                                                                                  | Keep #25 open until Joe Poznanski records a publication decision and any synthetic proof pack passes review.                                    |

## Launch Implications

- Launch still needs at least four `publish` case studies with
  `redactionStatus: "approved"`.
- The five current `publish` candidates are useful route/content scaffolds, but
  their `reviewed` status remains non-launch-eligible under the guide.
  No candidate currently meets that launch gate.
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
