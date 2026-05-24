# Content Strategy

Date: 2026-05-23
Sources: `docs/RESEARCH.md`, `docs/PRD.md`

## Strategy Summary

The portfolio should make the strongest work understandable quickly, then reward deeper inspection with architecture, evidence, testing, operations notes, and lessons learned. The content should feel like a working systems lab: polished enough for recruiters, specific enough for senior engineers, and explicit about redaction boundaries.

Launch content should prioritize 4 to 6 flagship case studies over a large gallery of shallow project cards. Each case study should explain what changed because of the work, how it was built, how it was verified, and what was learned.

## Audience Paths

### Recruiter Fast Path

Recruiters need a short route to fit and contact.

Required content:

- One-screen positioning statement.
- Resume PDF link.
- HTML resume page.
- Top skills summary.
- 3 to 4 strongest project cards with impact summaries.
- Contact CTA.
- LinkedIn and GitHub links.
- Plain-language explanation of role fit.

### Senior Engineer Deep Path

Senior engineers need enough detail to evaluate judgment.

Required content:

- Architecture diagrams.
- Constraints and tradeoffs.
- Implementation highlights.
- Testing and verification evidence.
- Operational notes and runbook excerpts.
- Source, demo, or redacted artifact links where safe.
- Lessons learned and failure modes.

### Collaborator Or Consulting Path

Potential collaborators and clients need proof of practical delivery.

Required content:

- What problem was solved.
- Why the work mattered.
- Scope and timeline where safe.
- Before/after outcome or measurable impact.
- How risks were handled.
- Clear contact path.

## Flagship Case Study Requirements

Every flagship case study must include:

- `title`: Clear, specific project name.
- `slug`: Stable, readable URL slug.
- `summary`: 2 to 4 sentence plain-English overview.
- `audienceFit`: Recruiter, senior engineer, collaborator, or multiple.
- `problem`: What was broken, missing, slow, risky, or valuable.
- `stakes`: Why it mattered.
- `constraints`: Time, access, security, tooling, reliability, data, or environment limits.
- `architecture`: Diagram plus explanation of major components.
- `implementation`: Key technical choices and build details.
- `verification`: Tests, manual checks, monitoring, validation data, or rollout evidence.
- `operations`: Deployment, recovery, observability, rollback, or maintenance notes.
- `outcome`: What changed because of the work.
- `lessons`: What the project taught.
- `featuredEvidence`: One primary artifact that best proves the story.
- `links`: Repo, demo, screenshots, docs, or redacted artifacts where safe.
- `publicationStatus`: Publish, needs-redaction, or defer.
- `redactionReview`: Reviewer notes, checklist status, reviewed date, and open items.
- `issueTrace`: Optional trace to the open issue or blocking decision that shaped the work.
- `redactionStatus`: Draft, reviewed, approved, or blocked.
- `seo`: Page title, description, canonical path, and Open Graph image.

## Case Study Template

```md
---
title: ""
slug: ""
category: ""
publicationStatus: "defer"
audienceFit:
  - "recruiter"
  - "senior-engineer"
summary: ""
featuredEvidence:
  label: ""
  summary: ""
  scope: ""
links:
  repo: ""
  demo: ""
  docs: ""
  screenshots:
    - ""
  artifacts:
    - ""
redactionStatus: "draft"
redactionReview:
  guidePath: "docs/CONTENT_REDACTION_GUIDE.md"
  reviewer: ""
  reviewedOn: ""
  checklistStatus: "not-started"
  openItems: []
  notes: ""
issueTrace:
  backlogId: "B-000"
  githubIssue: 1
  parentIssue: 1
  closureRule: ""
seo:
  title: ""
  description: ""
  canonicalPath: "/case-studies/example/"
  ogImage: "/social/case-studies/example.png"
---

# Title

## Summary

Explain the project in 2 to 4 sentences. Lead with the outcome and why it matters.

## Problem And Stakes

Describe what needed to change, who was affected, and what made the work worth doing.

## Constraints

List the real constraints: time, permissions, remote access, privacy, cost, reliability, tooling, hardware, or deployment limitations.

## Architecture

Show the system shape. Include a diagram or structured explanation of components, data flow, dependencies, and failure boundaries.

## Implementation Highlights

Explain the most important technical decisions. Focus on decisions that reveal judgment, not routine setup.

## Testing And Verification

Show how correctness was established. Include automated tests, smoke tests, rollout matrices, logs, screenshots, health checks, or manual validation.

## Operations And Recovery

Document deployment, monitoring, rollback, runbooks, incident response, or maintenance considerations.

## Outcome And Impact

State what improved. Use metrics where available; otherwise describe concrete before/after behavior.

## Lessons Learned

Capture what should be repeated, avoided, or investigated next time.

## Artifacts

Link to safe demos, repositories, diagrams, screenshots, docs, or redacted evidence through `links` and `featuredEvidence`.
```

## Short Project Card Template

Use this for project atlas cards, home page previews, and mobile timelines.

```md
### Project Name

One-sentence outcome.

- Category: AI, automation, infrastructure, backend, creative web, or operations.
- Proof: Demo, repo, diagram, runbook excerpt, metric, or screenshot.
- Best for: Recruiters, senior engineers, collaborators, or clients.
- Publication status: `publish`, `needs-redaction`, or `defer`.
```

## Launch Case Study Candidates

Select from real work in `/home/joe`, prior runbooks, and GitHub repositories. Publish only after redaction review.

| Candidate                                             | Primary proof                                            | Notes                                                                        |
| ----------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| CLI fleet synchronization and MCP rollout             | Multi-host inventory, rollout, verification matrix       | Strong agentic workflow and operations proof                                 |
| Remote workstation recovery and operational debugging | Diagnosis, recovery, runbook excerpts                    | Strong debugging and systems reliability proof                               |
| Kalshi migration or analytics tooling                 | Data workflow, migration, analytics decisions            | Publish only if data and account details are safe                            |
| YouTube AI video pipeline                             | Automation, AI workflow, media pipeline                  | Publish only if credentials, private channels, and generated assets are safe |
| HumanKaylee portfolio build                           | Static frontend, Rust API, visual system, CI, deployment | Strong meta case study after launch                                          |
| Creative web demo                                     | 3D, motion, performance, accessibility                   | Useful visual proof if backed by technical explanation                       |

`runbooks/PUBLICATION_SAFETY_DECISIONS.md` is the current decision-support
record only for the Kalshi/analytics and YouTube AI pipeline candidates. It
records safe/redacted/excluded material, recommendations, owner, and pending
user-decision state without approving publication. A synthetic proof pack is not
publication approval and does not replace the Content Redaction Guide launch
gate.

## Redaction Rules

Apply these rules before any project content, screenshot, diagram, log, or artifact becomes public.

### Never Publish

- Passwords, API keys, tokens, session IDs, private keys, recovery codes, cookies, or auth headers.
- Private IPs, private tailnet addresses, internal hostnames, SSH aliases, VPN details, or access paths that increase risk.
- Customer, employer, client, account, financial, or personally identifying data without explicit permission.
- Raw logs that include usernames, email addresses, secrets, file paths exposing sensitive structure, or security-relevant errors.
- Exact security controls, bypass methods, firewall rules, or recovery paths that would help an attacker.
- Private repository names or paths unless the repository is intentionally being disclosed.
- Screenshots showing browser profiles, terminals, secrets, credentials, chat history, private dashboards, or account identifiers.

### Generalize Before Publishing

- Replace hostnames with role labels such as `workstation-a`, `api-host`, or `remote-linux-node`.
- Replace usernames with role labels such as `operator`, `admin`, or `service-user`.
- Replace private paths with project-relative paths where possible.
- Replace exact timestamps with dates or sequence descriptions unless precise timing matters.
- Replace private metrics with ranges or relative improvements when exact numbers are sensitive.
- Replace raw command output with summarized evidence unless the exact output is safe and useful.

### Allowed With Review

- Redacted architecture diagrams.
- Sanitized rollout matrices.
- Cropped screenshots that show product behavior without exposing private context.
- Public repository links.
- Public docs and demos.
- Synthetic data that preserves the shape of the problem without exposing real records.
- Summaries of incidents that focus on diagnosis and controls, not exploitable details.

### Redaction Checklist

Before publishing, verify:

- Secrets are removed.
- Hostnames and access paths are generalized.
- Usernames and account names are generalized unless public identity is intended.
- Screenshots are cropped and inspected at full resolution.
- Logs are summarized or sanitized.
- Repo links are public and intentional.
- Claims are supported by safe evidence.
- The case study has `redactionStatus: "approved"` only after review.

## Launch Content Requirements

Launch should not proceed until these content items exist.

### Core Pages

- Home page with positioning, recruiter CTA, engineer CTA, top projects, resume, and contact.
- Projects or atlas page with accessible HTML fallback.
- At least 4 flagship case studies.
- Resume PDF.
- HTML resume page.
- Notes or build-log index.
- Contact page or contact section with backend fallback behavior.

### Case Study Minimums

Each launch case study must include:

- Summary.
- Problem and stakes.
- Constraints.
- Architecture diagram or structured architecture explanation.
- Implementation highlights.
- Testing and verification.
- Operational notes.
- Outcome and impact.
- Lessons learned.
- Safe links or artifacts.
- Completed redaction checklist.

### SEO And Sharing Content

- Site title and description.
- Page descriptions for all core pages.
- Open Graph image for home page.
- Open Graph image or fallback for each flagship case study.
- JSON-LD for Person and WebSite.
- CreativeWork or SoftwareSourceCode structured data on project, case-study, and source-backed software pages.
- Sitemap and robots.txt.
- Canonical URLs.
- RSS metadata for notes/build-log.

### Proof And Trust Content

- Public health/status link for the Rust API if deployed.
- "How this site was built" note or case study.
- Testing and verification summary.
- Accessibility and reduced-motion notes.
- Deployment and rollback runbook.
- Privacy-safe analytics note if events are enabled.
- Build proof dashboard copy that explains what is verified, when it was last checked, and which evidence is static versus live.
- Artifact drawer content for each flagship case study: one diagram, one verification excerpt, one operational note, and one lesson that can be shown without exposing sensitive details.

## Editorial Standards

- Lead with outcomes, not tools.
- Prefer concrete evidence over broad claims.
- Explain tradeoffs directly.
- Avoid hype language unless the evidence supports it.
- Use plain language for recruiter-facing summaries.
- Use precise technical language in deep sections.
- Keep screenshots and diagrams readable on mobile.
- Make every animation or interactive artifact serve a content purpose.

## Publishing Workflow

1. Draft the case study from the template.
2. Attach or describe supporting artifacts.
3. Run the redaction checklist.
4. Replace sensitive details with generalized labels.
5. Confirm every claim has safe supporting evidence.
6. Mark `redactionStatus` as `reviewed`.
7. Perform final review in page context.
8. Mark `redactionStatus` as `approved`.
9. Publish only after the case study remains understandable without private context.

## Launch Eligibility

Launch eligibility requires all four conditions: `publicationStatus: "publish"`, `redactionStatus: "approved"`, an understandable public story, and an artifact checklist pass.
