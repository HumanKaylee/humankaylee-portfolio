# Cross-Browser And Responsive QA Runbook

Date: 2026-08-15
Scope: B-055 Signal / Proof cross-browser and responsive launch gate
Status: local and CI evidence only; not production launch evidence

## Purpose

This runbook records the responsive checks for the current portfolio across
Chromium, Firefox, and WebKit. It covers mobile, tablet, and desktop widths plus
a LinkedIn in-app mobile approximation. Every route must expose its H1, proof
marker, and primary path on first load without horizontal overflow.

## Automated Gate

Run the focused Chromium gate:

```bash
pnpm test:e2e -- --grep "@responsive"
```

Run all configured browser engines when their binaries are installed:

```bash
pnpm test:e2e -- --grep "@responsive" --browser=all
```

The executable matrix is `tests/e2e/responsive-cross-browser.spec.ts`.

## Route Matrix

| Public route | First-load behavior |
| --- | --- |
| `/` | Identity, ProofGallery evidence, capability proof, and selected-Work link |
| `/work/` | Work index, flagship proof, and case-study link |
| `/work/cryo-flow-sim/` | Cryogenic proof and authentic video path |
| `/work/conformal-cooling-channel-generation/` | Conformal-channel workflow, evidence gallery, and source-boundary narrative |
| `/work/cli-fleet-synchronization-and-mcp-rollout/` | CLI fleet proof and next-Work path |
| `/work/remote-workstation-recovery-and-operational-debugging/` | Recovery proof and next-Work path |
| `/work/black-scholes-wasm/` | Black-Scholes live-pricer narrative and next-Work path |
| `/about/` | Engineering judgment and selected-Work path |
| `/resume/` | Résumé evidence and PDF download |
| `/notes/` | Published Technical Notes and Black-Scholes note path |
| `/contact/` | Static direct-contact channels |

## Browser And Viewport Matrix

| Browser | mobile 390×844 | tablet 820×1180 | desktop 1440×1000 | Evidence source | Triage |
| --- | --- | --- | --- | --- | --- |
| Chromium | Automated | Automated | Automated | `pnpm test:e2e -- --grep "@responsive" --browser=all` | None |
| Firefox | Automated | Automated | Automated | `pnpm test:e2e -- --grep "@responsive" --browser=all` | None |
| WebKit | Automated | Automated | Automated | `pnpm test:e2e -- --grep "@responsive" --browser=all` | None |

## LinkedIn In-App Mobile

The automated LinkedIn in-app mobile check is an approximation, not a real
device-app certification. It disables JavaScript and uses a mobile viewport plus
a LinkedIn-style user agent. The first load must retain the Home identity, both
selected ProofGallery records, the selected-Work link, and a layout without
horizontal overflow.

Real LinkedIn app validation remains a manual public-origin task. If the real
app differs from the approximation, capture the device, route, viewport, and
reproduction before assigning a triage category.

## Issue Triage

- `launch blocker`: A recruiter or senior engineer cannot read identity, Work
  proof, résumé, or direct-contact paths on a major browser or primary viewport.
- `polish`: A spacing or rendering issue is visible but the core reading and
  navigation journey remains intact.
- `post-launch`: A long-tail browser refinement can wait because the complete
  static content and primary paths remain usable.

The automated gate is production-like local evidence, not final-origin
evidence. Public launch evidence belongs in `runbooks/LAUNCH_EVIDENCE.md`.
