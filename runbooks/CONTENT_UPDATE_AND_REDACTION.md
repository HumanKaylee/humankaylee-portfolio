# Content Update And Redaction Runbook

Date: 2026-05-23
Status: Operational guide for safe public content updates
Scope: projects, case studies, notes/build logs, resume, and site metadata

## Where Content Lives

Use these paths for all public-facing content updates:

- Projects: `apps/web/src/content/projects/*.json`
- Case studies: `apps/web/src/content/case-studies/*.md`
- Notes and build-log entries: `apps/web/src/content/notes/*.md`
- Resume metadata: `apps/web/src/content/resume/resume.json`
- Site metadata: `apps/web/src/content/site/site.json`
- Astro collection config: `apps/web/src/content.config.ts`
- Redaction guide: `docs/CONTENT_REDACTION_GUIDE.md`
- Redaction status index: `runbooks/CONTENT_REDACTION_STATUS.md`

Keep the content record next to the content type. Do not invent a second hidden store for launch content.

## Add A Project

Create a new JSON file in `apps/web/src/content/projects/` named after the slug, for example `new-project.json`.

Required fields:

- `name`
- `slug`
- `category`
- `summary`
- `bestFor`
- `proof`
- `links` when there is a safe public artifact
- `publicationStatus`
- `seo`

Use `publicationStatus: "publish"` only when the project is public-safe and intentional. Use `defer` if the item should stay out of launch content.

Minimal project example shape:

```json
{
  "name": "Example Project",
  "slug": "example-project",
  "category": "operations",
  "summary": "One sentence summary.",
  "bestFor": ["senior-engineer"],
  "proof": "Sanitized evidence summary.",
  "publicationStatus": "publish",
  "seo": {
    "title": "Example Project",
    "description": "Public-safe project summary.",
    "canonicalPath": "/projects/example-project/",
    "ogImage": "/social/projects/example-project.png"
  }
}
```

## Add A Case Study

Create or update a markdown file in `apps/web/src/content/case-studies/` using the slug as the filename.

Required frontmatter fields:

- `title`
- `slug`
- `category`
- `summary`
- `audienceFit`
- `problem`
- `stakes`
- `constraints`
- `architecture`
- `implementation`
- `verification`
- `operations`
- `outcome`
- `lessons`
- `links` when safe artifacts exist
- `publicationStatus`
- `redactionStatus`
- `redactionReview`
- `seo`

The redaction fields must use these schema names exactly:

- `guidePath`
- `reviewer`
- `reviewedOn`
- `checklistStatus`
- `openItems`
- `notes`
- `checklist` when the item has a completed checklist record
- `approvalEvidence` only when moving the item to `approved`

A safe case-study record normally moves through this path:

- `draft`: first pass exists, evidence is not yet reviewable.
- `reviewed`: the public-safe story is readable, but open items remain.
- `approved`: the item is launch eligible.
- `blocked`: the item cannot be published safely yet.

Launch eligibility requires all four conditions at the same time:

- `publicationStatus` is `publish`.
- `redactionStatus` is `approved`.
- The case study remains understandable without private context.
- Every linked artifact has passed the redaction checklist.

That means `publicationStatus` may be `publish`, but the case study is not launch-ready until `redactionStatus` is `approved`, the checklist is complete, `openItems` is empty, the story stands without private context, and linked artifacts have been reviewed.

For `redactionStatus: "approved"` only, `approvalEvidence` records human signoff, artifact inspection, and production or owner-approved production-equivalent provider preview evidence. Do not add this block for `reviewed`, `blocked`, or `draft` records, and do not use it to bypass the publication safety checklist.

Minimal case-study review block shape:

```yaml
redactionStatus: "reviewed"
redactionReview:
  guidePath: "docs/CONTENT_REDACTION_GUIDE.md"
  reviewer: "content-review"
  reviewedOn: "2026-05-23"
  checklistStatus: "partial"
  openItems:
    - "Finish artifact inspection."
  notes: "Public-safe outline is ready, but the item is not launch-approved."
```

### No private content rule

Before a case study is shared outside the repo, remove or generalize anything that would reveal private context.

Do not publish:

- Secrets, tokens, cookies, auth headers, private keys, or recovery codes.
- Private hostnames, private IPs, tailnet addresses, SSH aliases, VPN details, or exact access paths.
- Usernames, account names, customer names, employer names, or private repository names unless they are intentionally public.
- Raw logs, terminal captures, or screenshots that expose private paths, identifiers, or sensitive errors.
- Security-sensitive procedures, bypass steps, or operational sequences that would help an attacker.

Generalize by replacing private details with role labels such as `operator`, `admin`, `workstation-a`, `api-host`, or `remote-node`.

## Add A Note Or Build Log Entry

Use `apps/web/src/content/notes/` for notes and build-log entries. There is no separate hidden build-log store.

Required fields for a note:

- `title`
- `slug`
- `summary`
- `publishedAt`
- `publicationStatus`
- `seo`

Use a note when you need a short public-safe process record, launch note, or build-log style update. Keep it concise and avoid raw transcripts.

Example note shape:

```md
---
title: "Example build log"
slug: "example-build-log"
summary: "A public-safe build log note."
publishedAt: "2026-05-23"
publicationStatus: "publish"
seo:
  title: "Example build log"
  description: "A public-safe build log note."
  canonicalPath: "/notes/example-build-log/"
  ogImage: "/social/notes/example-build-log.png"
---

Summarize the decision, the result, and any public-safe follow-up.
```

## Resume And Site Metadata

- Resume data lives in `apps/web/src/content/resume/resume.json`.
- Site metadata lives in `apps/web/src/content/site/site.json`.

Update these only when the public launch story changes. The resume record uses its own workflow fields, so do not force case-study redaction semantics onto it. Keep the site metadata aligned with the approved public content story.

## Redaction Checklist

Use the checklist from `docs/CONTENT_REDACTION_GUIDE.md` for every publishable case study and record the result in `redactionReview`.

Checklist items:

- Secrets removed.
- Hostnames and access paths generalized.
- Usernames and account names generalized or intentionally public.
- Screenshots inspected at full resolution, or marked `not-applicable`.
- Logs summarized or sanitized, or marked `not-applicable`.
- Repo and demo links are public and intentional, or marked `not-applicable`.
- Claims have safe supporting evidence.
- Security-sensitive procedures removed or generalized.
- Redaction reviewer recorded.
- Redaction status recorded.

When the checklist is complete, the `redactionReview.checklistStatus` should be `complete`, `openItems` should be empty, and `redactionStatus` should be `approved` before launch.

An approved case study also needs an `approvalEvidence` block with reviewer signoff, linked-artifact inspection, and production or owner-approved production-equivalent provider preview evidence. This block is required by the content schema only for `redactionStatus: "approved"` records.

## Publication Review Flow

Use this flow for every case study:

1. Draft the content with public-safe language.
2. Mark the item `reviewed` once it is readable and the remaining gaps are explicit.
3. Move to `approved` only after the redaction checklist is complete, `approvalEvidence` is recorded, and the item is launch eligible.
4. Keep the item `blocked` if a reviewer finds unsafe content, missing evidence, or unresolved private details.

Review states and publication states are related but not identical. The redaction review decides whether the content is safe; `publicationStatus` decides whether the item is intended for launch. Launch eligibility requires `publicationStatus: "publish"`, `redactionStatus: "approved"`, private-context-free readability, reviewed linked artifacts, and structured approval evidence.

Current public-safe review example:

- Creative Web Systems Atlas Demo
- `apps/web/src/content/case-studies/creative-web-systems-atlas-demo.md`
- Current state: `publicationStatus: "publish"`, `redactionStatus: "reviewed"`
- Why it is useful: it shows how to keep a case study readable without claiming launch approval.
- Do not change this example to `approved` in order to use it as a reference.

Before changing any case study status, check `runbooks/CONTENT_REDACTION_STATUS.md` to see the current redaction index and blockers. That file is evidence only; it does not approve content by itself.

## Verification Commands

Run these checks after content updates:

- `pnpm test -- --run content`; this is the repository's full unit and Node
  script test command, including content schema and content runbook contracts.
- `pnpm test:e2e -- --grep "case-study routes @case-studies|quality @quality"`
- Prettier check for Markdown runbooks and Markdown content.
- `pnpm lint` for JSON content records, scripts, TypeScript, Astro, and e2e tests.

```bash
pnpm test -- --run content
pnpm test:e2e -- --grep "case-study routes @case-studies|quality @quality"
pnpm exec prettier --check runbooks/CONTENT_UPDATE_AND_REDACTION.md apps/web/src/content/case-studies/*.md apps/web/src/content/notes/*.md
pnpm lint
```

For a launch-candidate content change, run the broader quality path before
claiming readiness:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e -- tests/e2e/case-study-routes.spec.ts
pnpm test:e2e -- tests/e2e/quality-gates.spec.ts
pnpm build && pnpm bundle:budget
```

Run `pnpm lighthouse:local` when the change can affect public performance,
metadata, layout, or launch evidence. Manual privacy review from
`runbooks/QUALITY.md` is still required because automated scans cannot prove
that screenshots, artifacts, or summaries are safe.

If a check fails, fix the content or the review record before trying to publish the item. Do not bypass the redaction gate to make launch timing look better.
