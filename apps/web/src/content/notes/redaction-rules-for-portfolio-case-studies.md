---
title: "Redaction rules for portfolio case studies"
slug: "redaction-rules-for-portfolio-case-studies"
summary: "A build-log note summarizing the publication safety boundary for case-study evidence."
tags:
  - "redaction"
  - "case studies"
  - "public safety"
publishedAt: "2026-05-23"
publicationStatus: "publish"
seo:
  title: "Redaction rules for portfolio case studies"
  description: "A build-log note about keeping case-study artifacts safe for public review."
  canonicalPath: "/notes/redaction-rules-for-portfolio-case-studies/"
  ogImage: "/social/default.png"
---

Public proof should preserve the engineering story while removing credentials,
private hostnames, private paths, raw logs, and sensitive operational details.

The useful evidence is the pattern: inventory first, isolate the smallest safe
change, verify it with commands that a reviewer can rerun, and record the
remaining blocker instead of turning it into marketing copy. That is enough to
show operating judgment without publishing sensitive recovery details.

The tradeoff is that some case studies stay in a reviewed state even when their
public narrative is readable. Launch approval requires a completed checklist,
safe linked artifacts, and human review; until then the site can explain the work
while making the approval boundary explicit.
