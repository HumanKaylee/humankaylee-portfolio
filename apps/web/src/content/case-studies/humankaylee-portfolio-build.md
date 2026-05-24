---
title: "HumanKaylee Portfolio Build"
slug: "humankaylee-portfolio-build"
category: "creative web"
summary: "A public-safe case study about building the portfolio as a static-first, Astro-based experience with a Systems Atelier visual system and an optional Rust-backed enhancement layer."
audienceFit:
  - "recruiter"
  - "senior-engineer"
  - "collaborator"
problem: "The site has to prove engineering depth quickly while still working as a clear portfolio without JavaScript, WebGL, or a live API."
stakes: "Because the portfolio is a first-impression artifact, the static story has to be credible before any interactive layer loads and before any backend can be trusted."
constraints:
  - "Must work without JavaScript, WebGL, or backend availability."
  - "Had to avoid inventing final resume content before approval."
  - "Needed a content structure that could survive later schema wiring and redaction review."
architecture:
  overview: "Static pages carry the core story, with Astro content collections feeding route assembly, metadata, and future content wiring."
  diagramAlt: "A static-first portfolio architecture with optional visual and API enhancement layers."
implementation:
  - "Built public-safe case-study routes, content rendering, quality gates, and evidence surfaces around the static portfolio story."
  - "Kept the Rust API as an optional enhancement boundary instead of a dependency for the public story."
verification:
  - "Verified with Playwright no-JS checks, Lighthouse, content rendering checks, Rust clippy, and Rust tests."
operations:
  - "Static deployment remains the default path, with backend behavior treated as optional enhancement work."
outcome: "The project now has a content and tooling backbone that can support recruiter, engineer, and collaborator paths without depending on live backend availability."
lessons:
  - "The cleanest portfolio systems start with a safe content model, not visual polish alone."
featuredEvidence:
  label: "Static-first launch evidence"
  summary: "Route, Lighthouse, Playwright, content, and Rust checks prove the local portfolio contract without claiming production readiness."
  scope: "Local and PR evidence only; production deploy and approval evidence remain blocked."
links:
  artifacts:
    - "local Playwright and Lighthouse evidence"
    - "public-safe content review notes"
publicationStatus: "publish"
redactionStatus: "reviewed"
redactionReview:
  guidePath: "docs/CONTENT_REDACTION_GUIDE.md"
  reviewer: "phase-1-content-review"
  reviewedOn: "2026-05-23"
  checklistStatus: "partial"
  openItems:
    - "Production domain, provider, and deploy evidence are blocked in this repository snapshot."
    - "Launch approval remains blocked until external evidence is captured and reviewed."
  notes: "This case study is reviewed and public-safe, but it is not launch-approved."
  checklist:
    secretsRemoved: "yes"
    hostnamesAndAccessPathsGeneralized: "yes"
    userAndAccountNamesGeneralized: "yes"
    screenshotsInspected: "not-applicable"
    logsSummarizedOrSanitized: "not-applicable"
    publicLinksVerified: "not-applicable"
    claimsHaveSafeEvidence: "yes"
    securitySensitiveProceduresRemoved: "yes"
seo:
  title: "HumanKaylee Portfolio Build"
  description: "A case study about building this portfolio as a static-first, Systems Atelier site with an optional Rust-backed enhancement layer."
  canonicalPath: "/case-studies/humankaylee-portfolio-build/"
  ogImage: "/social/case-studies/humankaylee-portfolio-build.png"
---

## Product goal

The goal of the portfolio is to show engineering judgment fast. It should read as a
carefully built product, not a demo that only works after the first client-side
animation or after a backend responds. The public story is a static-first story:
use the content itself to prove structure, taste, and technical depth.

## Design constraints

The build has to stay usable without JavaScript, without WebGL, and without an
API-down dependency. It also has to stay public-safe, which means no private hostnames,
paths, raw logs, tokens, or account details. Redaction stays `reviewed`, not
approved, because launch approval still needs evidence outside this repository.

## Static-first architecture

Astro provides the page framework, content collections provide the structured
case-study source, and route rendering keeps the main story available even when
the site is accessed with no-JS or API-down conditions. The Rust Axum API is an
optional enhancement boundary, not a core dependency. That keeps the site
honest: the portfolio still ships as a static product if the backend is absent.

## Content model

The content model is built around launch-safe fields and sections that can be
validated before any public release. The body uses markdown headings so the
route tests can verify the exact narrative shape, while the frontmatter keeps
the public metadata concise and redactable.

| Process artifact    | What it proves                                                                                | Scope        |
| ------------------- | --------------------------------------------------------------------------------------------- | ------------ |
| Route test coverage | The case-study body renders the required launch-safe headings                                 | Local and PR |
| Quality-gate scan   | The page stays readable with no-JS, reduced-motion, accessibility, and private-content checks | Local and PR |
| Content review note | The narrative is public-safe and still marked `reviewed`                                      | PR           |
| Production evidence | Not yet available from this snapshot                                                          | Blocked      |

## Visual system

The visual direction is Systems Atelier: editorial, deliberate, and precise
rather than generic purple SaaS styling. The page needs enough visual presence
to feel intentional, but the design must still degrade into a clear reading
experience when motion is reduced or scripting is unavailable. The public
presentation should support a static-first portfolio story instead of hiding it.

## Rust API boundary

Rust is present as an optional backend enhancement boundary through Axum. That
layer can support future interactive behavior, but this case study does not
depend on it for the main story. The important constraint is that the public
site still works if the Rust API is absent, offline, or intentionally withheld.

## Agent-assisted implementation

The implementation was agent-assisted, but bounded by tests, code review,
redaction review, and CI-style evidence. The agent can draft and refine content
inside scoped files, but it cannot upgrade `reviewed` to approved or invent
production proof.

| Evidence item             | Local/PR value                                                  | Production value |
| ------------------------- | --------------------------------------------------------------- | ---------------- |
| Playwright route checks   | Confirms the body headings and phrases are present              | None yet         |
| Lighthouse and a11y scans | Verifies the no-JS and reduced-motion story stays readable      | None yet         |
| Rust validation           | Tracks the optional API boundary separately from static content | None yet         |
| Redaction review          | Confirms the content remains public-safe                        | None yet         |

## Verification matrix

| Tier       | Checks                                                                | Result                                      |
| ---------- | --------------------------------------------------------------------- | ------------------------------------------- |
| Local      | Playwright route checks, quality-gate scans, content rendering checks | Passed after replacing the placeholder body |
| PR / CI    | Mirrors local content and quality expectations after push             | Recorded outside this public body           |
| Production | Domain, provider, and deploy evidence                                 | Blocked                                     |

## Deployment and operations

Operations stay static-first. The portfolio can be deployed as content and
assets without depending on backend availability, and backend work remains an
optional enhancement path rather than a launch blocker for the core site. That
means rollback for the public experience is mostly a content and asset change,
not a risky application-service cutover.

## Launch evidence boundary

This case study is intentionally limited to reviewed, public-safe evidence. It
does not claim production readiness, and it does not present production domain,
provider, or deploy proof. The launch boundary is explicit: local verification
and PR-friendly checks are documented here, while production evidence remains
blocked until it exists.

## Lessons

The strongest version of the portfolio starts with a safe content model and a
clear static-first contract. Visual polish matters, but only after the content
proves it can stand on its own, the API remains optional, and the verification
story is strong enough to survive no-JS, reduced-motion, accessibility, and
private-content scans.
