# Visual Regression Runbook

Date: 2026-08-17
Scope: B-037 Signal / Proof visual regression snapshots
Status: implementation evidence only; not production launch evidence

## Purpose

This runbook defines the focused visual-regression gate for the current public
portfolio. Chromium captures each named surface at 1440×1200 and 390×844 with
reduced motion and deterministic animation timing. The Black-Scholes surface is
not captured until its real WASM controls initialize and the price readout is
populated.

## Commands

Install the browser dependency before the first run:

```bash
pnpm exec playwright install --with-deps chromium
```

Generate or intentionally update Windows baselines:

```bash
pnpm test:visual:update
```

Validate the named platform against its existing baselines:

```bash
pnpm test:visual
```

Linux baselines must be generated and rerun with Linux Playwright Chromium
against the same source revision. Windows images must never be copied or renamed
as Linux evidence. CI runs the same focused command in the `Run visual
regression gate` job step.

Run the route-matrix contract with:

```bash
node --test scripts/visual-regression-contract.test.mjs
```

## Route And Snapshot Matrix

Each label produces `<label>-desktop-<platform>.png` and
`<label>-mobile-<platform>.png` under
`tests/e2e/visual-regression.spec.ts-snapshots/`.

| Label | Public route | Readiness boundary |
| --- | --- | --- |
| `home` | `/` | Home heading, ProofGallery, and CapabilityMatrix are visible |
| `work` | `/work/` | Work index heading is visible |
| `work-cryo` | `/work/cryo-flow-sim/` | Cryogenic proof surface is visible |
| `work-conformal-cooling` | `/work/conformal-cooling-channel-generation/` | Conformal workflow and evidence gallery are visible |
| `work-cli-fleet` | `/work/cli-fleet-synchronization-and-mcp-rollout/` | CLI fleet proof surface is visible |
| `work-remote-recovery` | `/work/remote-workstation-recovery-and-operational-debugging/` | Recovery proof surface is visible |
| `work-black-scholes` | `/work/black-scholes-wasm/` | Black-Scholes WASM controls are initialized and the real price readout is populated |
| `about` | `/about/` | About heading is visible |
| `resume` | `/resume/` | Résumé heading is visible |
| `contact` | `/contact/` | Static direct-contact heading is visible |
| `notes` | `/notes/` | Published Notes index heading is visible |

## Inspection And Baseline Policy

- Open every new expected, actual, and diff image before changing a baseline.
- Compare desktop and mobile captures with the approved Direction A reference at
  the same viewport and state. Screenshots alone are not QA.
- Check hierarchy, crop, spacing, overflow, focus, font rendering, borders,
  contrast, and control/readout layout.
- Update only an intentional, approved difference. Immediately rerun
  `pnpm test:visual` and require zero further diff.
- Keep Windows and genuine Linux baselines paired for every route and viewport.

The focused visual gate is separate from the umbrella E2E suite so rendering
differences remain diagnosable. Local and CI screenshots are implementation
evidence; they do not prove the final public origin or grant launch approval.
