---
title: "How the portfolio stays useful when the API is offline"
slug: "how-the-portfolio-stays-useful-when-the-api-is-offline"
summary: "A build-log note describing the static-first contract that keeps the portfolio credible when enhanced services are unavailable."
tags:
  - "static-first"
  - "resilience"
  - "Rust API"
publishedAt: "2026-05-24"
publicationStatus: "publish"
seo:
  title: "How the portfolio stays useful when the API is offline"
  description: "A build-log note about static-first resilience, API fallback design, and verification."
  canonicalPath: "/notes/how-the-portfolio-stays-useful-when-the-api-is-offline/"
  ogImage: "/social/default.svg"
---

The static shell carries the recruiting story: positioning, projects, case
studies, resume access, contact fallback, and build evidence all render before
any enhanced service is required.

That decision keeps the Rust API in the right role. It demonstrates backend
engineering through health, contact validation, and cached project metadata, but
it does not control whether a reviewer can understand the work. If the API is
slow, absent, or intentionally disabled, the page still shows the public-safe
artifact trail and explains what changed.

The verification path reflects that contract. Browser tests cover API-down
behavior, no-JavaScript routes, notes and RSS output, and the visible telemetry
fallback. Backend tests cover validation and stale-safe metadata behavior. The
tradeoff is duplication between static copy and enhanced status data, but that
is cheaper than making a portfolio's credibility depend on one live service.
