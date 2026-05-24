# Visual Regression Runbook

Date: 2026-05-23
Scope: B-037 visual regression snapshots
Status: implementation evidence only

## Purpose

This runbook defines the focused visual-regression gate for core portfolio surfaces.
It captures baseline screenshots for:

- Home
- Project index
- One representative case study
- Resume
- Notes index
- API-offline note detail
- Contact

Desktop and mobile snapshots are generated in a deterministic reduced-motion context.

## Commands

Install browser dependency before first run:

```bash
pnpm exec playwright install --with-deps chromium
```

Generate/update baseline screenshots:

```bash
pnpm test:visual:update
```

Validate visuals against generated baselines:

```bash
pnpm test:visual
```

CI runs the same focused gate as a dedicated frontend job step:

```text
Run visual regression gate
```

Run the visual gate contract:

```bash
node --test scripts/visual-regression-contract.test.mjs
```

## Evidence

Expected snapshot artifacts are generated under:

- `tests/e2e/visual-regression.spec.ts-snapshots/`

The artifact set must include desktop and mobile variants for:

- `home`
- `projects`
- `case-study`
- `resume`
- `notes` (`/notes/`)
- `note-detail` (`/notes/how-the-portfolio-stays-useful-when-the-api-is-offline/`)
- `contact`

## Stabilization Notes

- `tests/e2e/visual-regression.spec.ts` forces reduced motion.
- API paths used by the home telemetry panel are stubbed in the test for deterministic
  status text.
- Contact status and telemetry status regions are masked to avoid false positives
  from non-functional text churn.

## Flake Risk

This command is intended to be a focused gate, not part of every standard local
`pnpm test:e2e` run, to avoid broad CI coupling. The main risk is non-content
render jitter from environment font rendering or external CDN timing.
