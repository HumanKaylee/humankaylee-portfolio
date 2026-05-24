# Publication Safety Decisions

Date: 2026-05-24
Branch: `goal/portfolio-implementation`
Scope: B-018 and B-019
Status: decision-support record only; not publication approval

This record captures the current publication-safety evaluation for sensitive
case-study candidates. It is not approval to publish either candidate, and it
does not change the launch case-study count.

Authoritative safety sources:

- `docs/CONTENT_REDACTION_GUIDE.md`
- `runbooks/CONTENT_REDACTION_STATUS.md`
- `runbooks/CASE_STUDY_REDACTION_APPROVAL_PACKETS.md`
- `apps/web/src/content/case-studies/kalshi-migration-or-analytics-tooling.md`
- `apps/web/src/content/case-studies/youtube-ai-video-pipeline.md`

## Decision Matrix

| Candidate | Backlog item | Public-safe material | Redacted-only material | Excluded material | Risk concerns | Recommendation | Safer replacement candidate | User decision status | Owner | Public-safe follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Kalshi Migration or Analytics Tooling | B-018 | Broad backend or analytics lessons, synthetic architecture patterns, non-account-specific tradeoffs. | Generalized migration shape after reviewer confirms no private repository, path, data, or account details remain. | Private financial data, account-linked data, customer data, private repository names, internal paths, and raw operational evidence. | Financial and account-linked work has legal, privacy, trust, and account-risk concerns. | exclude from v1 unless a synthetic abstraction proves the engineering lesson without private financial or account-linked evidence. | Creative Web Systems Atlas Demo, because it shows technical judgment without financial or account-linked data. | HumanKaylee decision pending. | HumanKaylee | If reconsidered, create a synthetic example pack and a fresh approval packet before changing `publicationStatus` from `defer`. |
| YouTube AI Video Pipeline | B-019 | High-level automation architecture, public-safe AI workflow lessons, and synthetic examples that do not identify private channels or assets. | Sanitized workflow diagrams and generated examples only after full artifact inspection. | Private channel details, account identifiers, credential-adjacent setup, prompts tied to private assets, and workflow edges that reveal non-public operations. | Private channel, account identifiers, generated assets, and automation edges could expose creator, account, or operational details. | exclude from v1; defer until synthetic proof pack exists and a reviewer approves the public narrative and artifact boundary. | HumanKaylee Portfolio Build, because it already demonstrates agent-assisted automation, verification, and static-first safeguards with public repo evidence. | HumanKaylee decision pending. | HumanKaylee | Define a synthetic proof pack with scrubbed examples, safe screenshots, and explicit prompt/data-source boundaries before any publication change. |

## Operator Rules

- Do not publish either candidate from this record alone.
- Do not use either candidate to satisfy the four-case-study launch minimum.
- Do not copy private prompts, channel data, financial data, account IDs, private
  paths, raw logs, screenshots, or repository names into public evidence.
- Close or keep open GitHub issues only from the explicit issue acceptance
  criteria and current owner decision state.
- If HumanKaylee approves a later publication path, update this record,
  `runbooks/CONTENT_REDACTION_STATUS.md`, the candidate frontmatter, and launch
  evidence with exact reviewer/date/artifact information.

## Current Issue Interpretation

- B-018 has enough repo evidence to recommend excluding the Kalshi or analytics
  candidate from v1 unless a synthetic abstraction is approved.
- B-019 has enough repo evidence to recommend deferring the YouTube AI Video
  Pipeline until a synthetic proof pack and artifact boundary exist.
- Both items still require a HumanKaylee owner decision before publication.
