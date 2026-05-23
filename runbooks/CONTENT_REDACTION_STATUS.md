# Content Redaction Status

Date: 2026-05-23
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

## Redaction Matrix

| Candidate                                             | Publication status | Redaction status | Current evidence                                                                                                                                 | Launch-safe next action                                                                                                                                                                                      |
| ----------------------------------------------------- | ------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CLI Fleet Synchronization and MCP Rollout             | `publish`          | `reviewed`       | Generalized body now includes a public-safe architecture sketch, summarized verification matrix, and sanitized operator checklist.               | Complete every guide checklist item and inspect any linked artifacts before changing status to `approved`.                                                                                                   |
| Creative Web Systems Atlas Demo                       | `publish`          | `reviewed`       | Safe outline with partial review; actual atlas fallback evidence is still missing because the visual layer is not the proof source yet.          | Attach real accessible-fallback and performance evidence from the implemented atlas; inspect any screenshots or generated artifacts before approval.                                                         |
| HumanKaylee Portfolio Build                           | `publish`          | `reviewed`       | Safe meta-case-study outline with partial review; body and launch implementation evidence are still placeholders.                                | Replace the placeholder with final static-first architecture, verification summary, deployment evidence, and redaction-safe build artifacts after launch implementation matures.                             |
| Kalshi Migration or Analytics Tooling                 | `defer`            | `blocked`        | Deferred candidate; current public boundary is not safe enough for finance/account-linked work.                                                  | Keep out of v1 unless a reviewer approves a synthetic or heavily generalized abstraction with no private financial, account, repository, path, or operational details.                                       |
| Remote Workstation Recovery and Operational Debugging | `publish`          | `reviewed`       | Generalized body now includes a public-safe troubleshooting narrative, sanitized diagnostic flow, verification matrix, and prevention checklist. | Complete final checklist review and inspect linked artifacts before changing status to `approved`; keep hostnames, access paths, credentials, exact recovery sequences, and raw logs out of public evidence. |
| YouTube AI Video Pipeline                             | `needs-redaction`  | `blocked`        | Blocked candidate; the draft says private channel details, account identifiers, and private-asset workflow edges still need removal.             | Keep blocked until a public-safe proof narrative, synthetic examples, and sanitized artifact pack are reviewed and approved.                                                                                 |

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
