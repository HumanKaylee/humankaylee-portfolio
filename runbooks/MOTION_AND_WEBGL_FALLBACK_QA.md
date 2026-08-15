# Motion And WebGL Fallback QA Runbook

Date: 2026-08-15
Scope: B-049 reduced-motion and no-WebGL QA pass for Signal / Proof
Status: local and CI evidence only; not production launch evidence

## Purpose

This runbook records the release evidence for motion-sensitive, no-JavaScript,
and no-WebGL contexts. Public comprehension must never depend on animation, a
GPU context, video playback, or a backend request. ProjectStage, WorkRow,
EvidenceStrip, native links, and authentic media provide the complete static
reading path.

## Commands

Run the reduced-motion quality gate:

```bash
pnpm test:e2e -- --grep "@reduced-motion"
```

Run the focused motion choreography gate:

```bash
pnpm test:e2e -- --grep "@motion"
```

Run the no-JavaScript fallback gate:

```bash
pnpm test:e2e -- --grep "@noscript"
```

Run the dedicated no-WebGL behavior and screenshot gate:

```bash
pnpm exec playwright test tests/e2e/no-webgl.spec.ts
```

Refresh that screenshot only after inspecting an intentional ProjectStage
change:

```bash
pnpm exec playwright test tests/e2e/no-webgl.spec.ts --update-snapshots
```

Run the combined focused behavior gate:

```bash
pnpm test:e2e -- --grep "@reduced-motion|@motion|@no-webgl|@noscript"
```

Run cross-platform visual regression and the artifact contract:

```bash
pnpm test:visual
node --test scripts/accessibility-and-fallback-qa-contract.test.mjs
```

## Reduced-motion evidence

The visual-regression suite emulates `prefers-reduced-motion: reduce` and
disables animations before every capture. Current Linux baselines include:

- `home-desktop-linux.png`
- `home-mobile-linux.png`
- `work-desktop-linux.png`
- `work-mobile-linux.png`
- `work-cryo-desktop-linux.png`
- `work-cryo-mobile-linux.png`
- `about-desktop-linux.png`
- `resume-mobile-linux.png`
- `contact-mobile-linux.png`
- `notes-mobile-linux.png`

Automated checks prove:

- `.project-stage`, `.work-row`, and `[data-stage-panel]` content is complete
  immediately for reduced-motion users.
- Signal-link movement is suppressed when reduced motion is requested.
- Route navigation uses native links and normal document scrolling.
- Every Work proof remains visible without animation timing or enhancement
  state.

## No-WebGL fallback evidence

The release is HTML and CSS first. The homepage ProjectStage uses WorkRow,
MediaFrame, and EvidenceStrip content without requesting a canvas, SVG scene,
or GPU context. Work detail, résumé, Notes, About, and Static direct contact
channels likewise remain usable with WebGL disabled.

Current evidence:

- `tests/e2e/no-webgl.spec.ts` disables WebGL and `navigator.gpu`, requires all
  three Work rows and stage panels, requires authentic Cryogenic media and its
  canonical `/work/cryo-flow-sim/` link, and positively requires the complete
  static ProjectStage.
- `no-webgl-signal-proof-home-linux.png` and
  `no-webgl-signal-proof-home-win32.png` are the current platform baselines.
- `tests/e2e/static-shell.spec.ts` verifies meaningful HTML, normal Work links,
  EvidenceStrip proof, résumé PDF access, and direct contact channels before
  enhancement.
- `tests/e2e/motion-choreography.spec.ts` verifies both motion-allowed and
  reduced-motion behavior while preserving the no-JavaScript reading path.

## QA matrix

| Surface | Reduced motion | No-WebGL / low capability | Native scrolling | Evidence | Result |
| --- | --- | --- | --- | --- | --- |
| Home ProjectStage | All three stories are immediately visible | Static Work rows, stage panels, and authentic media remain complete | Normal page scroll and native Work links | `@motion`, `@no-webgl`, current visual baselines | Pass locally |
| Work index | No reveal timing is required | Published Work links and proof text are ordinary HTML | Native anchors and document flow | `@responsive`, `@noscript` | Pass locally |
| Work detail | Reading progress is hidden for reduced motion | Narrative, EvidenceStrip, native media, and fallback links remain usable | Long-form document flow | `@work`, `@noscript` | Pass locally |
| Résumé | Shared motion does not affect scan order | PDF link and print content require no GPU capability | Native links and print flow | résumé print and accessibility checks | Pass locally |
| Contact | Direct-channel links do not animate as a requirement | Static direct contact channels require no GPU or API | Native email and profile links | `@api-down`, `@accessibility` | Pass locally |

## Production review notes

- Current screenshots and checks are local/CI evidence only. Capture fresh
  public-origin or owner-approved provider-preview evidence before launch.
- Any future GPU enhancement must preserve the same complete HTML reading path,
  native links, and platform screenshots.
- Treat any production-only issue that blocks Home, Work proof, résumé PDF, or
  direct contact access as a launch blocker.
