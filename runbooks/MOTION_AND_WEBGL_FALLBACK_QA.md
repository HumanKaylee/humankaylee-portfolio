# Motion And WebGL Fallback QA Runbook

Date: 2026-05-24
Scope: B-049 reduced-motion and no-WebGL QA pass
Status: local and CI evidence only; not production launch evidence

## Purpose

This runbook records the dedicated fallback QA artifact for motion-sensitive,
mobile, and no-WebGL contexts. The portfolio must remain readable as static HTML
before JavaScript, WebGL, route motion, or API calls enhance it.

## Commands

Run the reduced-motion quality gate:

```bash
pnpm test:e2e -- --grep "@reduced-motion"
```

Run the motion choreography gate:

```bash
pnpm test:e2e -- --grep "@motion"
```

Run the project constellation fallback gate:

```bash
pnpm test:e2e -- --grep "@constellation"
```

Run the dedicated no-WebGL screenshot gate:

```bash
pnpm exec playwright test tests/e2e/no-webgl.spec.ts
```

Refresh the no-WebGL screenshot artifact when the project atlas changes:

```bash
pnpm exec playwright test tests/e2e/no-webgl.spec.ts --update-snapshots
```

Run the combined focused gate:

```bash
pnpm test:e2e -- --grep "@reduced-motion|@motion|@constellation"
```

Run the reduced-motion screenshot gate:

```bash
pnpm test:visual
```

Run the contract for this artifact:

```bash
node --test scripts/accessibility-and-fallback-qa-contract.test.mjs
```

## Reduced-motion evidence

The current visual-regression suite forces reduced motion before capturing
snapshots. The generated screenshot artifacts live under
`tests/e2e/visual-regression.spec.ts-snapshots/`.

Representative reduced-motion artifacts:

- `home-desktop-linux.png`
- `home-mobile-linux.png`
- `projects-desktop-linux.png`
- `projects-mobile-linux.png`
- `case-study-desktop-linux.png`
- `resume-mobile-linux.png`

Automated checks verify:

- `prefers-reduced-motion: reduce` suppresses reveal animation.
- Route-continuity CSS removes named transitions for reduced-motion users.
- The project atlas reports `document.body.dataset.constellationReady === "reduced-motion"` when reduced motion is requested.
- Content remains visible without relying on animation timing.

## No-WebGL fallback evidence

The current project atlas implementation is intentionally HTML/SVG first rather
than WebGL first. No core route requires a canvas or WebGL context to read the
content, navigate the project proof, reach the resume, or contact the site.

Fallback artifact evidence:

- `projects-desktop-linux.png` captures the desktop atlas/constellation surface
  in the reduced-motion visual baseline.
- `projects-mobile-linux.png` captures the mobile static atlas path where the
  desktop constellation is skipped.
- `tests/e2e/project-atlas.spec.ts` verifies the mobile fallback state with
  `mobile-skipped`.
- `tests/e2e/project-atlas.spec.ts` also verifies the static atlas remains
  visible when the lazy desktop constellation import fails and records
  `module-error` instead of throwing an uncaught page error.
- `tests/e2e/no-webgl.spec.ts` disables WebGL contexts, keeps the semantic
  project atlas visible, verifies no `canvas` is required, and captures
  `no-webgl-projects-fallback`.
- `tests/e2e/static-shell.spec.ts` verifies the static systems map hero renders
  before any WebGL enhancement.

## QA Matrix

| Surface              | Reduced motion                         | No-WebGL / low capability                                   | Native scrolling                             | Evidence                                    | Result       |
| -------------------- | -------------------------------------- | ----------------------------------------------------------- | -------------------------------------------- | ------------------------------------------- | ------------ |
| Home systems map     | Static poster remains visible          | Core links and proof copy are semantic HTML                 | Page scrolls normally                        | `static systems map hero`, visual snapshots | Pass locally |
| Project atlas        | Motion helper is skipped or simplified | Static atlas and mobile `mobile-skipped` path remain usable | Filter and artifact anchors use native links | `@constellation`, `@reduced-motion`         | Pass locally |
| Case-study narrative | Reveal effects are non-essential       | Markdown body renders as static HTML                        | Long-form reading uses normal document flow  | `@quality`, visual snapshots                | Pass locally |
| Route continuity     | Named transitions disabled             | Navigation still uses standard links                        | Browser handles scroll and navigation        | `@route-continuity`                         | Pass locally |
| Contact fallback     | Status changes are text-based          | Mailto fallback remains available                           | Form remains native and keyboard reachable   | `@api-down`, `@accessibility`               | Pass locally |

## Production Review Notes

- Current screenshots and gates are local/CI evidence only. Capture fresh
  production or owner-approved production-equivalent provider preview screenshots after the frontend domain exists.
- If a future WebGL/R3F/Three.js layer is added, it must keep the same static
  atlas baseline and must not become a dependency for recruiter reading paths.
- Any production-only motion or GPU issue is a launch blocker if it prevents
  reading the home page, project proof, resume, or contact fallback.
