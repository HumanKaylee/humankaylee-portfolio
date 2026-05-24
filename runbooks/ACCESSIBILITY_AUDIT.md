# Accessibility Audit Runbook

Date: 2026-05-24
Scope: B-048 accessibility audit pass
Status: local and CI evidence only; not production launch evidence

## Purpose

This runbook records the dedicated accessibility checklist for the current
portfolio surfaces. It complements the automated Axe and keyboard gates by
showing the page-by-page audit target, result, evidence source, and remaining
production review gap.

## Commands

Run the automated accessibility scan:

```bash
pnpm test:e2e -- --grep "@accessibility"
```

Run the focused keyboard gate:

```bash
pnpm test:e2e -- --grep "@keyboard"
```

Run the contract for this artifact:

```bash
node --test scripts/accessibility-and-fallback-qa-contract.test.mjs
```

## Page-by-page checklist

| Route | Headings | Landmarks | Keyboard | Contrast | Touch targets | Alt text | Animation summary | Evidence | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Ordered hero, proof, and section headings | Header, main, navigation, footer | Primary links reachable | Systems Atelier tokens meet local Axe gate | Mobile CTA/link targets covered by responsive gate | Decorative systems SVG is named or hidden as appropriate | Static hero and copy work before motion/WebGL | `@accessibility`, `@keyboard`, `@responsive` | Pass locally |
| `/projects/` | Project atlas and category headings are meaningful | Header, main, atlas region, footer | Filters, atlas links, and constellation links reachable | Local Axe gate passes | Mobile atlas links remain readable and reachable | Visual atlas text is semantic HTML | Constellation is progressive and the atlas stays readable | `@accessibility`, `@keyboard`, `@constellation` | Pass locally |
| `/case-studies/cli-fleet-synchronization-and-mcp-rollout/` | Narrative sections keep logical order | Header, main, evidence drawer, footer | Links and evidence controls reachable | Local Axe gate passes | Long-form content has no mobile overflow | No private raw screenshots are required for comprehension | Case-study narrative has summaries instead of motion dependency | `@accessibility`, `@quality` | Pass locally |
| `/resume/` | Resume sections preserve scan order | Header, main, print sheet, footer | PDF link and contact path reachable | Local Axe gate passes | Resume links remain large enough on mobile | No meaningful images required | Print mode removes chrome only on resume route | `@accessibility`, resume print checks | Pass locally |
| `/notes/` | Notes/build-log headings are ordered | Header, main, list, footer | Note links reachable | Responsive and visual gates cover text surfaces | Tag chips and links avoid horizontal overflow | No meaningful images required | Notes are static-first HTML | `@responsive`, visual regression | Pass locally |
| `/contact/` | Contact and fallback headings are meaningful | Header, main, form, fallback, footer | Form controls and mailto fallback reachable | Local Axe gate passes | Form controls meet mobile target expectations | No meaningful images required | API outage state is announced without motion dependency | `@accessibility`, `@api-down` | Pass locally |

## Manual Review Notes

- Current evidence is local and PR CI evidence only. Re-run against the final
  public URL before production launch.
- Automated Axe coverage checks for serious and critical issues on core routes,
  but it does not replace human assistive-technology review.
- Any future screenshot, video, or interactive media must include equivalent
  text, captions, or a concise summary before the related case study can become
  launch approved.
- If a production-only issue appears, record it in this runbook, classify it as
  launch blocker, polish, or post-launch, and update `runbooks/LAUNCH_EVIDENCE.md`.
