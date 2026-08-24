# Case Study Redaction Approval Packets

Date: 2026-08-24
Status: review-only launch-blocking evidence index; no launch approval; no issue closure.
Scope: launch-candidate case-study and Work approval evidence

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
| Joe Poznanski Portfolio Build                         | `publish` / `reviewed` | Checklist answers recorded; missing `openItems` clearance and missing production domain evidence for launch claims.           |
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
| Joe Poznanski Portfolio Build                         | Static-first local verification matrix, optional Rust API boundary, and public-safe launch evidence boundary.       | Pending reviewer inspection of local verification and launch evidence claims plus production-domain evidence.         |
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

Current state: `publicationStatus: publish`, `redactionStatus: approved`.

Approval packet status: **approved 2026-05-26** — D-09 resolved in HUMAN_DECISIONS_QUEUE.md.

| Field | Value |
| --- | --- |
| Candidate | CLI Fleet Synchronization and MCP Rollout (`apps/web/src/content/case-studies/cli-fleet-synchronization-and-mcp-rollout.md`) |
| Reviewer | operator |
| Review date | 2026-05-26 |
| Current publication | `publish` |
| Current redaction | `approved` |
| Artifact evidence source | In-page sanitized architecture sketch, verification matrix, and operator checklist — no private paths, hostnames, or raw logs present |
| Linked artifact review | Sanitized rollout matrix and operator checklist reviewed on 2026-05-26; confirmed public-safe |
| Public-safe evidence | Role labels only; architecture sketch, verification matrix, and operator checklist are self-contained in the case-study body |
| Approval decision | `approved` — standard redactions applied, no open items remaining |
| Follow-up owner | operator — production URL evidence to be captured after M1 frontend deploy |

Required checklist mapping:

| Guide check | Schema field | Answer | Evidence note |
| --- | --- | --- | --- |
| Secrets removed | secretsRemoved | yes | No credentials, tokens, or API keys present |
| Hostnames and access paths generalized | hostnamesAndAccessPathsGeneralized | yes | Role labels only; no machine names or private paths |
| Usernames and account names generalized | userAndAccountNamesGeneralized | yes | Role labels only; no account identifiers |
| Screenshots inspected | screenshotsInspected | not-applicable | No screenshots in this case study |
| Logs summarized or sanitized | logsSummarizedOrSanitized | yes | No raw logs; all evidence is summarized in matrices |
| Repo/demo links verified | publicLinksVerified | not-applicable | No external links |
| Claims have safe evidence | claimsHaveSafeEvidence | yes | All claims supported by in-page sanitized evidence |
| Security-sensitive procedures removed | securitySensitiveProceduresRemoved | yes | No auth flows or security procedures described |

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

## Joe Poznanski Portfolio Build

Current state: `publicationStatus: publish`, `redactionStatus: approved`.

Approval packet status: **approved 2026-05-26** — localhost-preview evidence via M5-followup orchestrator task.

Redaction safety rationale: this is a self-referential case study about building this portfolio site. It contains no third-party PII, no proprietary client data, no private hostnames or access paths, no credentials, and no operational procedures that would reveal private infrastructure. The case study describes only publicly observable choices (Astro, Axum, static-first architecture, Systems Atelier visual system) and evidence from local verification runs. Safe to publish on a public-facing portfolio site.

| Field | Value |
| --- | --- |
| Candidate | Joe Poznanski Portfolio Build (`apps/web/src/content/case-studies/humankaylee-portfolio-build.md`) |
| Reviewer | operator-via-orchestrator |
| Review date | 2026-05-26 |
| Current publication | `publish` |
| Current redaction | `approved` |
| Artifact evidence source | `http://localhost:4321/case-studies/humankaylee-portfolio-build/` — HTTP 200, 16752 bytes, SHA256 `fb67031f11f01f49bf8225c0abd26dc4e4dfea97532fbbabea8c691673ae7d1e`, rendered 2026-05-26T17:29:07Z via `pnpm build` + `pnpm preview` on `dist/`; evidence JSON at `test-results/m5-localhost-preview-evidence.json` |
| Linked artifact review | Case-study page rendered correctly from production build; body headings, verification matrix, and launch evidence boundary all visible in rendered HTML. No private identifiers, credentials, or internal paths in the page output. |
| Public-safe evidence | Self-referential portfolio meta-case-study; all claims bounded to local verification and PR evidence; no production claims; no third-party data. |
| Approval decision | `approved` — localhost-preview evidence satisfies the preview gate; promote to production evidence after M1 frontend deploy |
| Follow-up owner | operator — production URL evidence to be captured after M1 frontend deploy; replace `evidence_type` from `localhost_preview` to `production` at that time |

Required checklist mapping:

| Guide check | Schema field | Answer | Evidence note |
| --- | --- | --- | --- |
| Secrets removed | secretsRemoved | yes | No credentials, tokens, or API keys present |
| Hostnames and access paths generalized | hostnamesAndAccessPathsGeneralized | yes | No private machine names, paths, or service endpoints |
| Usernames and account names generalized | userAndAccountNamesGeneralized | yes | No account identifiers; role labels only |
| Screenshots inspected | screenshotsInspected | not-applicable | No screenshots in this case study |
| Logs summarized or sanitized | logsSummarizedOrSanitized | not-applicable | No log excerpts; evidence is summarized in matrices |
| Repo/demo links verified | publicLinksVerified | not-applicable | No external links |
| Claims have safe evidence | claimsHaveSafeEvidence | yes | All claims supported by local/PR evidence, bounded explicitly |
| Security-sensitive procedures removed | securitySensitiveProceduresRemoved | yes | No auth flows or security-sensitive procedures described |

## Remote Workstation Recovery and Operational Debugging

Current state: `publicationStatus: publish`, `redactionStatus: approved`.

Approval packet status: **approved 2026-05-26** — D-10 resolved in HUMAN_DECISIONS_QUEUE.md.

| Field | Value |
| --- | --- |
| Candidate | Remote Workstation Recovery and Operational Debugging (`apps/web/src/content/case-studies/remote-workstation-recovery-and-operational-debugging.md`) |
| Reviewer | operator |
| Review date | 2026-05-26 |
| Current publication | `publish` |
| Current redaction | `approved` |
| Artifact evidence source | In-page role-labeled diagnostic flow, sanitized verification matrix, prevention checklist, redacted incident summary, and operator runbook excerpt — no private hostnames, session identifiers, raw logs, or exact recovery commands present |
| Linked artifact review | Redacted incident summary and operator runbook excerpt reviewed on 2026-05-26; confirmed public-safe with role labels only |
| Public-safe evidence | Role labels only; diagnostic flow, verification matrix, and prevention checklist are self-contained in the case-study body |
| Approval decision | `approved` — standard redactions applied, no open items remaining |
| Follow-up owner | operator — production URL evidence to be captured after M1 frontend deploy |

Required checklist mapping:

| Guide check | Schema field | Answer | Evidence note |
| --- | --- | --- | --- |
| Secrets removed | secretsRemoved | yes | No credentials, tokens, or API keys present |
| Hostnames and access paths generalized | hostnamesAndAccessPathsGeneralized | yes | Role labels only; no machine names, IPs, or private paths |
| Usernames and account names generalized | userAndAccountNamesGeneralized | yes | Role labels only; no account identifiers or session names |
| Screenshots inspected | screenshotsInspected | not-applicable | No screenshots in this case study |
| Logs summarized or sanitized | logsSummarizedOrSanitized | yes | No raw logs; all evidence is role-labeled summaries |
| Repo/demo links verified | publicLinksVerified | not-applicable | No external links |
| Claims have safe evidence | claimsHaveSafeEvidence | yes | All claims supported by in-page sanitized evidence |
| Security-sensitive procedures removed | securitySensitiveProceduresRemoved | yes | No specific recovery commands or access procedures included |

## Cryo Flow Sim — Stage 1 Showcase

Current state: `publicationStatus: publish`, `redactionStatus: reviewed`.

Approval packet status: not yet approved — production deploy evidence and final human signoff required.

| Field | Value |
| --- | --- |
| Candidate | Cryo Flow Sim — Stage 1 Showcase (`apps/web/src/content/case-studies/cryo-flow-sim.md`) |
| Reviewer | operator |
| Review date | 2026-05-26 |
| Current publication | `publish` |
| Current redaction | `reviewed` |
| Artifact evidence source | `apps/web/public/media/cryo-flow-sim-stage1.mp4` (13,157,234 bytes, SHA256 43F517B6380B86AB8F766C400AE0E43F25564B65088F4C3D41334ACD21C8C963) and `apps/web/public/media/cryo-flow-sim-stage1-poster.png` (1920x1080 overview-dashboard screenshot) |
| Linked artifact review | MP4 artifact inspected on 2026-05-26; byte count and SHA256 verified against stage1-artifact-report.md. Poster PNG reviewed. No private identifiers in media files. |
| Public-safe evidence | Self-contained simulation video; no private hostnames, accounts, credentials, or internal paths. Role labels used in case-study body. Stage 2 scope explicitly deferred. |
| Approval decision | not approved until human signoff with production deploy evidence |
| Follow-up owner | operator — production URL evidence to be captured after M1 frontend deploy; Stage 2 scope requires separate approval pass |

Required checklist mapping:

| Guide check | Schema field | Answer | Evidence note |
| --- | --- | --- | --- |
| Secrets removed | secretsRemoved | yes | No credentials, tokens, or API keys present |
| Hostnames and access paths generalized | hostnamesAndAccessPathsGeneralized | yes | No private hostnames or service endpoints; Axum is described generically |
| Usernames and account names generalized | userAndAccountNamesGeneralized | yes | No account identifiers; crate names are the public artifact names |
| Screenshots inspected | screenshotsInspected | yes | overview-dashboard.png poster reviewed at full resolution; no private data visible |
| Logs summarized or sanitized | logsSummarizedOrSanitized | yes | Validation results summarized in table form; no raw log excerpts |
| Repo/demo links verified | publicLinksVerified | not-applicable | No external links; assets are committed locally |
| Claims have safe evidence | claimsHaveSafeEvidence | yes | All metric claims (92 tests, thresholds, MP4 spec) traceable to stage1-artifact-report.md |
| Security-sensitive procedures removed | securitySensitiveProceduresRemoved | yes | No auth, credential rotation, or security-sensitive procedures described |

## X-Plane Cabin Camera FOV Trade Study

This is a Work-record packet, separate from the case-study launch-minimum
matrix. Joe supplied the archive on 2026-08-23; it is recorded as
user-supplied. Joe authorized publication on 2026-08-24 once every release
gate passes. This records conditional authorization and does not claim Joe
personally viewed the provider preview; the agent/browser inspection is
recorded separately below.

| Field | Value |
| --- | --- |
| Candidate | X-Plane Cabin Camera FOV Trade Study (`xplane-cabin-camera-fov-trade-study`) |
| Current publication | `publish` |
| Current redaction | `approved` |
| Reviewer / review date | Joe Poznanski authorization / 2026-08-24; agent/browser preview inspection / 2026-08-24 |
| Public omissions | Raw source manifests, the program identifier, the private source path, and the `LM5`, `LM6`, `LM7`, and `LM8` camera-token families are omitted or masked. |
| Visual inspection | The comparison images and representative video frames were inspected at original resolution; the four-view layout, generic labels, masks, and configuration order remained readable. |
| Artifact inspection | Task 2 original-resolution inspection covered both comparison images, both posters, representative frames from both videos, and the exact manifest-to-byte hashes; result: passed. |
| Preview evidence | Agent/browser inspected `https://1c92ba32.humankaylee-portfolio.pages.dev` (deployment `1c92ba32-fb78-435b-a229-7dfeb8592579`, source `6df39168df3d1374e9e31058b6b7e160a867bcbc`) on 2026-08-24. Routes, headers, full-byte media hashes, direct playback, no-JavaScript, reduced motion, responsive layout, privacy scans, and all eight visual captures passed. Cloudflare `pages.dev` direct range and seek are unsupported and returned full-body 200 responses; a Chromium Blob made from the exact fetched bytes proves artifact seekability only, not provider-host streaming. |
| Production verification | Scoped X-Plane frontend production was verified on 2026-08-24 at `https://joepoznanski.io`, source `8ecf79100f58a7459305c445eb0794867ae4c0c9`, deployment `bdc88d5f-054f-47e6-b961-e23a1235d62e`. Production `206`/`Content-Range` checks passed at `bytes 0-1023/5179542` and `bytes 0-1023/5626106`, exactly 1,024 bytes each. Both direct custom-domain videos played, completed a seek to 5 seconds, remained near the target after 750 ms, and resumed without reset. The post-deploy matrix passed. Rollback `f7a08ad2-16f7-430c-a245-cd600e3d65a9` remains listed and returned 200. |
| Open redaction items | None |
| Open launch items | None for this scoped X-Plane frontend release. B-063, production API, production contact, and broader global launch work remain open. |
| Known evidence limit | `replay harness source not supplied`; this is a study limit, not an open redaction item. |
| Approval boundary | `redactionStatus: approved` records conditional owner authorization, artifact inspection, exact provider-preview evidence, and the verified scoped frontend production release. It does not claim Joe personally viewed the provider preview or live production evidence, close B-063 or any issue, or claim global platform launch completion. |

The following public inventory was recomputed from the committed sanitized
manifest and asset bytes. The public `capture-manifest.json` is a derivative
manifest; the raw source manifests remain omitted.

| Public filename | SHA-256 |
| --- | --- |
| capture-manifest.json | `0a00b99bacbf1c0612bdf873ce2e4bea9387b83425e2315603fcbc30c02eeff6` |
| comparison-bank-120-1440.webp | `8a3ae7d9880fb4b8a49e1f00b63e01d013fbc92fbc641e5a2c0c8c9de6a831aa` |
| comparison-bank-120-640.webp | `740c52d3024c407c438c70f3232579798dd7fa37348c31b95010b4ea339b00f1` |
| comparison-bank-120-960.webp | `41774e412e84b34876cef732ee436870a8d5d2dda62f5fdb30bd1758436b9367` |
| comparison-bank-180-1440.webp | `45d58c7facfee9f4f73d3b19fe5203e5d73481516231e7d9487f4e63288ac2f1` |
| comparison-bank-180-640.webp | `094101fce63b881b3004308b8f5607e96b188dfa97c7b0403e89777c5f75743d` |
| comparison-bank-180-960.webp | `6b3350e3599ebd6c48a808811aad05d33d573faa39584a6b878fed7cadcade28` |
| fov110-m5-h0-poster.webp | `4fe5d3f5bbe8dbe5f21ceced1c9ed4140b75562e936850ffe78e040b9e6029b5` |
| fov110-m5-h0.mp4 | `2a404bcd3e86655601701ac0f7c81d7c377c6978a0fc4b85fa874ec35e23efea` |
| fov50-p0-h0-poster.webp | `c6f844f4904183cddd490e4a1c683cc005f4c36f8a0665ad22e7fc76c3dcbc57` |
| fov50-p0-h0.mp4 | `f58f8308ac7d47a2c5f55826ee0b8ef57952f39333c8f167a46dbdb98a9b681f` |

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
