# HUMAN_DECISIONS_QUEUE — 2026-05-26

Status: RESOLVED — all 14 decisions are recorded. M2 may deploy to Fly.io in `iad`; contact delivery remains disabled for v1.

Operator selections recorded on 2026-07-24 supersede earlier host, region, contact-delivery, and retention defaults.

Verification: each decision entry below has a dated resolved value before M2 dispatches.

---

## D-01: Final domain

- Default: `humankaylee.dev`
- Alternatives: `.com`, `joepo.engineering`
- Owner: operator
- Resolution time: 5 min
- Decision: `humankaylee.dev` (RESOLVED 2026-05-26)

---

## D-02: Domain registrar

- Default: `Cloudflare Registrar`
- Alternatives: `Porkbun`, `Namecheap`
- Owner: operator
- Resolution time: 2 min
- Decision: `Cloudflare Registrar` (RESOLVED 2026-05-26)

---

## D-03: API host

- Default: `Hetzner CX22`
- Alternatives: `Fly.io`, `Railway`
- Owner: operator
- Resolution time: 10 min
- Decision: `Fly.io` (RESOLVED 2026-07-24)

> Operator decision: use the prepared Fly.io deployment. This is a managed-container choice for the small stateless Axum API; M2 may proceed after provider authentication.

---

## D-04: API data-center

- Default: `Falkenstein EU`
- Alternatives: `Ashburn US`
- Owner: operator
- Resolution time: 2 min
- Decision: `iad (Ashburn, Virginia, US)` (RESOLVED 2026-07-24)

> Operator decision: deploy Fly.io in `iad` for East Coast US latency. `apps/api/fly.toml` is pinned to the same region.

---

## D-05: Contact delivery

- Default: `store + Resend nightly`
- Alternatives: `mailto-only-exception`
- Owner: operator
- Resolution time: 5 min
- Decision: `disabled for v1` (RESOLVED 2026-07-24)

> Operator decision: do not collect, transmit, store, or email contact-message PII until a separate provider, retention, deletion, encryption, and incident-response review is approved.

---

## D-06: Contact retention

- Default: `90 days`
- Alternatives: `30d`, `1yr`, `indefinite`
- Owner: operator
- Resolution time: 2 min
- Decision: `not applicable while contact delivery is disabled` (RESOLVED 2026-07-24)

> Operator decision: choose and implement retention only before any future contact-delivery enablement.

---

## D-07: CF Pages project name

- Default: `humankaylee-portfolio`
- Alternatives: `Any slug`
- Owner: operator
- Resolution time: 2 min
- Decision: `humankaylee-portfolio` (RESOLVED 2026-05-26)

---

## D-08: Analytics

- Default: `Cloudflare Web Analytics`
- Alternatives: `Umami`, `Plausible`
- Owner: operator
- Resolution time: 2 min
- Decision: `Cloudflare Web Analytics` (RESOLVED 2026-05-26)

---

## D-09: B-014 approval (first case study)

- Default: `Approve with std redactions`
- Alternatives: `Defer`
- Owner: operator
- Resolution time: 15 min read
- Decision: `Approve with std redactions` (RESOLVED 2026-05-26)

---

## D-10: B-015 approval (second case study)

- Default: `Approve with std redactions`
- Alternatives: `Defer`
- Owner: operator
- Resolution time: 15 min read
- Decision: `Approve with std redactions` (RESOLVED 2026-05-26)

---

## D-11: Cryo-flow-sim assets

- Default: `Cloudflare R2`
- Alternatives: `Commit to repo`
- Owner: operator
- Resolution time: 5 min
- Decision: `Cloudflare R2` (RESOLVED 2026-05-26)

---

## D-12: AI assistant

- Default: `Defer to post-launch`
- Alternatives: `Ship v1`
- Owner: operator
- Resolution time: 2 min
- Decision: `Defer to post-launch` (RESOLVED 2026-05-26)

---

## D-13: Hero treatment

- Default: `Evaluate W6-8 post-launch`
- Alternatives: `Pick now`
- Owner: operator
- Resolution time: 5 min
- Decision: `Evaluate W6-8 post-launch` (RESOLVED 2026-05-26)

---

## D-14: Lenis scroll

- Default: `Defer to W6-8`
- Alternatives: `Enable now`
- Owner: operator
- Resolution time: 2 min
- Decision: `Defer to W6-8` (RESOLVED 2026-05-26)

---

**14 of 14 decisions resolved.** M2 is approved for Fly.io in `iad`; production evidence, DNS/TLS verification, and the final launch checklist still require their own completed records.
