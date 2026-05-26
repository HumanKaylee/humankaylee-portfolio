---
title: "Why the portfolio content starts as data, not pages"
slug: "why-the-portfolio-content-starts-as-data-not-pages"
summary: "A build-log note explaining why Phase 1 establishes structured inventory before visual page composition."
tags:
  - "content model"
  - "contracts"
  - "static-first"
publishedAt: "2026-05-23"
publicationStatus: "publish"
seo:
  title: "Why the portfolio content starts as data"
  description: "A build-log note about schema-first portfolio content planning."
  canonicalPath: "/notes/why-the-portfolio-content-starts-as-data-not-pages/"
  ogImage: "/social/default.svg"
---

Phase 1 starts with contracts and safe inventory so later page work can assemble
content without exposing private details or relying on API availability.

The decision is deliberately unglamorous: content schemas define the launch
shape before page composition starts. That makes it harder for a visual pass to
hide missing proof, unsafe evidence, or routes that only work when JavaScript is
available.

Verification lives next to the content model. The build checks parse real
examples, reject invalid metadata, and keep the notes, project catalog, resume,
and case-study routes aligned with the PRD. The tradeoff is more frontmatter and
slower authoring, but the result is a portfolio that can be reviewed as evidence
rather than as a hand-built brochure.
