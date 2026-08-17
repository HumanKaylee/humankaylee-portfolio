# Accessibility Audit Runbook

Date: 2026-08-15
Scope: B-048 accessibility audit pass for the Signal / Proof release
Status: local and CI evidence only; not production launch evidence

## Purpose

This runbook records the page-by-page accessibility target for the public
Signal / Proof portfolio. Automated Axe, keyboard, responsive, reduced-motion,
and print checks provide repeatable evidence. Human assistive-technology review
remains required on the final public origin.

## Commands

Run the serious-and-critical Axe scan:

```bash
pnpm test:e2e -- --grep "@accessibility"
```

Run the focused keyboard gate:

```bash
pnpm test:e2e -- --grep "@keyboard"
```

Run responsive, reduced-motion, and static/no-JavaScript coverage:

```bash
pnpm test:e2e -- --grep "@responsive|@reduced-motion|@noscript"
```

Run the contract for this artifact:

```bash
node --test scripts/accessibility-and-fallback-qa-contract.test.mjs
```

## Page-by-page checklist

| Route | Headings | Landmarks | Keyboard | Contrast | Touch targets | Alt text | Animation summary | Evidence | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Identity, selected-proof, and capability headings keep semantic order | Header, primary navigation, main, and footer | Primary links and every selected Work link are reachable | Flat canvas and technical evidence text pass the local Axe gate | Primary actions meet the 44 px contract | Authentic Cryogenic media has descriptive text | ProofGallery and CapabilityMatrix content remains complete while reduced motion suppresses video loading | `@accessibility`, `@keyboard`, `@noscript` | Pass locally |
| `/work/` | Flagship, supporting, and archive headings are ordered | Header, navigation, main, Work sections, and footer | Every published Work link uses a native anchor | Work and evidence surfaces pass the local Axe gate | Work rows remain reachable at mobile widths | MediaFrame text identifies meaningful project media | Work rows remain static and readable without animation | `@accessibility`, `@responsive`, `@noscript` | Pass locally |
| `/work/cryo-flow-sim/` | Narrative and Proof sections retain logical order | Header, main article, sections, and footer | Video controls, fallback link, and next-work link are reachable | Media caption and EvidenceStrip pass the local Axe gate | Video fallback and primary links meet the target contract | Authentic media retains descriptive text and a caption | The poster and complete narrative work without playback | `@accessibility`, `@work`, `@noscript` | Pass locally |
| `/work/cli-fleet-synchronization-and-mcp-rollout/` | Narrative and decision headings retain logical order | Header, main article, sections, and footer | Evidence and next-work links are reachable | Technical proof surfaces pass the local Axe gate | Primary links remain mobile-safe | Semantic evidence does not depend on screenshots | EvidenceStrip and text remain complete without motion | `@accessibility`, `@work`, `@noscript` | Pass locally |
| `/work/remote-workstation-recovery-and-operational-debugging/` | Narrative and reflection headings retain logical order | Header, main article, sections, and footer | Evidence and next-work links are reachable | Technical proof surfaces pass the local Axe gate | Primary links remain mobile-safe | Semantic evidence does not depend on screenshots | Recovery proof remains static and readable | `@accessibility`, `@work`, `@noscript` | Pass locally |
| `/work/black-scholes-wasm/` | Technical narrative and demo labels preserve order | Header, main article, demo region, and footer | Inputs, output, fallback, and next-work link are reachable | Controls and output pass the local Axe gate | Controls meet the target contract | The tool is text and controls rather than image-only output | Static explanation and unavailable-WASM fallback remain useful | `@accessibility`, Black-Scholes runtime test | Pass locally |
| `/about/` | Biography and supporting headings preserve scan order | Header, main, sections, and footer | All profile links are reachable | Local Axe gate passes | Links remain mobile-safe | Meaning does not depend on images | Content is static-first | `@accessibility`, `@responsive` | Pass locally |
| `/resume/` | Résumé sections preserve scan order | Header, main, print sheet, and footer | PDF and contact links are reachable | Screen and print canvases pass the local checks | Résumé links remain mobile-safe | Meaning does not depend on images | Print mode removes shared chrome only on this route | `@accessibility`, résumé print checks | Pass locally |
| `/notes/` | Note list headings are ordered | Header, main, list, and footer | Note links are reachable | Text surfaces pass responsive and visual checks | Links avoid horizontal overflow | Meaning does not depend on images | Notes are static-first HTML | `@responsive`, visual regression | Pass locally |
| `/contact/` | Contact heading and channel labels are meaningful | Header, main, channel list, and footer | Email, LinkedIn, and GitHub links are reachable | Local Axe gate passes | Direct-channel links meet mobile targets | Meaning does not depend on images | Static direct contact channels require no animation or backend state | `@accessibility`, `@api-down`, `@noscript` | Pass locally |

ProofGallery, CapabilityMatrix, Work rows, EvidenceStrip, native media controls,
and Static direct contact channels are the named public accessibility surfaces
for this release.

## Manual review notes

- Re-run the automated checks against the final public origin, then verify
  landmarks, heading navigation, link purpose, control names, and reading order
  with at least one screen reader.
- Verify visible focus at desktop and mobile widths; do not infer focus quality
  from a screenshot.
- Verify the résumé PDF has a meaningful filename, opens from the native link,
  and preserves readable print contrast.
- Confirm the Cryogenic video can be understood from its caption, evidence
  summary, and fallback link without requiring playback.
- Record any production-only issue in `runbooks/LAUNCH_EVIDENCE.md` as a blocker,
  polish item, or post-launch item before approval.
