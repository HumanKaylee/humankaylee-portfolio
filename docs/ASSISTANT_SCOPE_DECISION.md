# Portfolio Assistant Scope Decision

Date: 2026-05-24
Backlog / issue: B-064 / #70
Depends on: B-063 launch evidence
Status: draft decision support only; not approved for implementation
Current recommendation: defer

This note defines the safe decision boundary for a future portfolio assistant.
It does not authorize B-065 implementation, does not change launch readiness,
and does not close #70. Implementation can only begin after B-063 launch
evidence exists and HumanKaylee explicitly approves a build/defer/reject
decision.

## User Value Beyond Novelty

A portfolio assistant is only worth building if it helps a recruiter, hiring
manager, or senior engineer reach existing public evidence faster than normal
navigation. Useful jobs:

- Answer "which project should I inspect first for backend skill, operations,
  frontend polish, or AI-assisted workflow design?"
- Point to public case studies, projects, notes, resume sections, and launch
  evidence boundaries without inventing claims.
- Explain how the static-first portfolio remains useful when JavaScript,
  WebGL, motion, or the Rust API is unavailable.

It is not valuable if it mostly restates the home page, hides the actual
portfolio, or creates privacy, cost, moderation, or reliability work before the
site has production launch evidence.

## Allowed Public Data Sources

Any future assistant must answer from public portfolio content only. Allowed
source classes after launch:

- Published public pages generated from `apps/web/src/content/`.
- Public project metadata already visible on `/projects/`.
- Public resume page content and the approved public PDF link.
- Published notes/build-log entries.
- Public-safe runbook summaries that are already linked from the portfolio.

Excluded source classes:

- no raw contact submissions.
- no private repositories.
- no private hostnames, usernames, paths, logs, credentials, or tokens.
- no unpublished case-study drafts, reviewer notes, or redaction open items.
- no GitHub issue comments or CI logs unless a public-safe excerpt has passed
  the content workflow.

## Privacy Model

Default posture: minimize collection and do not train on visitors.

- Do not store full visitor questions unless HumanKaylee approves retention,
  deletion, and review workflows.
- Prefer ephemeral request handling with aggregate counters only.
- If abuse monitoring requires logs, store only timestamp, route, normalized
  anonymous bucket, status, and coarse token/cost counts.
- Never log prompt text, raw contact data, IP addresses, user agents, or model
  provider secrets in application-level records.
- Make the UI disclose that answers are generated from public portfolio content
  and may be incomplete.

## Cost And Rate-Limit Controls

Any approved assistant must include cost controls before public enablement:

- Disabled by default until explicit production configuration exists.
- Per-visitor and global rate limit controls.
- A monthly cost cap with alerting and a kill switch.
- Short responses by default, with bounded context retrieval.
- Provider and model selection documented before launch.
- Abuse handling that can fail closed without affecting static portfolio pages.

## No-Secret Frontend Architecture

Frontend code must not contain model provider keys, embeddings credentials,
private API origins, or privileged admin controls. The browser can only call a
public endpoint that is safe to disable.

Required shape if built later:

- Static pages and normal navigation work with the assistant disabled.
- Client script loads progressively and never blocks content rendering.
- Secret-bearing calls happen server-side only.
- The assistant endpoint validates origin, payload size, rate limits, and
  disabled-mode configuration before calling any provider.
- Retrieval indexes are built only from approved public sources.

## Disabled-Mode Behavior

The disabled state must be a first-class user experience:

- The assistant surface can be hidden or replaced with static "how to evaluate
  this portfolio" links.
- Existing CTAs to resume, projects, case studies, notes, and contact remain
  visible.
- No page should throw, hydrate-fail, or show empty chat chrome when disabled.
- API-down behavior must not imply the portfolio itself is down.

## Build / Defer / Reject Decision

Current recommendation: defer.

Reason: the main launch goal is a fast, static-first portfolio that already has
clear resume, projects, case studies, notes, and contact paths. The assistant
could be useful after launch, but building it before B-063 would add privacy,
cost, rate-limit, moderation, and production-operations surface area without
helping the current launch blockers.

Future decision options:

- Build: only if B-063 is complete, public source boundaries are approved, and
  HumanKaylee wants a differentiated post-launch demo.
- Defer: preferred current state until launch evidence, provider choices, and
  retention decisions exist.
- Reject: choose if the static portfolio and notes are enough, or if the
  assistant would distract from the evidence-first positioning.
