# HUMAN_DECISIONS_QUEUE — 2026-05-26

Status: PARTIALLY RESOLVED — 12 of 14 decisions accepted as defaults; D-03 (API host) and D-04 (region) await operator selection before M2 (backend deploy) dispatches.

To accept the two remaining defaults: replace each `UNRESOLVED` with the default value listed for that row, then commit. To override: replace with your chosen value.

Verify pattern (canonical): `grep -c 'Decision: __________ (UNRESOLVED)' runbooks/HUMAN_DECISIONS_QUEUE.md` — expect `0` to unblock M2.

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
- Decision: __________ (UNRESOLVED)

> Operator override note: leaving this open per operator request "go ahead and do all of that except the actual hosting service". M2 (backend deploy) is blocked until this resolves. M1 (frontend, Cloudflare Pages) and M5 (case-study content + cryo embed) proceed in parallel.

---

## D-04: API data-center

- Default: `Falkenstein EU`
- Alternatives: `Ashburn US`
- Owner: operator
- Resolution time: 2 min
- Decision: __________ (UNRESOLVED)

> Operator override note: depends on D-03. Defaults to `Falkenstein EU` if D-03 = `Hetzner CX22` (Hetzner Falkenstein is the cheapest EU DC); to `iad` (Ashburn) if D-03 = `Fly.io` and US latency matters; to nearest Railway region if D-03 = `Railway`.

---

## D-05: Contact delivery

- Default: `store + Resend nightly`
- Alternatives: `mailto-only-exception`
- Owner: operator
- Resolution time: 5 min
- Decision: `store + Resend nightly` (RESOLVED 2026-05-26)

---

## D-06: Contact retention

- Default: `90 days`
- Alternatives: `30d`, `1yr`, `indefinite`
- Owner: operator
- Resolution time: 2 min
- Decision: `90 days` (RESOLVED 2026-05-26)

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

**12 of 14 resolved. 2 remain: D-03 (API host) + D-04 (region).** These block M2 only; M1 (frontend) and M5 (content + cryo embed) proceed.
