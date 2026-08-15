# Portfolio Taste and Gap Analysis

Date: 2026-07-24  
Scope: local-only review of the Astro portfolio. This is not production or launch evidence.

## Design read

Reading this as a developer portfolio for recruiters and senior engineers, with a precise systems-atelier language, leaning toward a targeted editorial technical evolution.

- Design variance: 6/10
- Motion intensity: 3/10
- Visual density: 5/10
- Preservation mode: targeted evolution; routes, navigation labels, content safety boundaries, and static-first behavior remain intact.

## Evidence gathered

- Source, content model, route inventory, security headers, local runbooks, and dirty working tree were inspected.
- Desktop and mobile visual regression coverage exists for seven core routes. The test harness has platform-specific snapshots; Windows baselines were missing before this pass and were generated for explicit review.
- Baseline unit/contract run: 27 Vitest tests passed; four Node contracts were stale after the intentional Joe Poznanski/domain/resume rename.
- Baseline visual run briefly collided with another local runner on port 4321. The runner is safe when executed sequentially.
- Frontend dependency audit found 37 advisories (1 critical, 14 high, 17 moderate, 5 low); no broad auto-fix is appropriate.

## What is working well

1. The visual language is specific: warm black, paper, tungsten, green, and oxidized blue are a recognizable systems-atelier palette rather than a default purple AI gradient.
2. The static systems-map hero, self-hosted fonts, semantic layout, no-JavaScript fallback, reduced-motion behavior, route metadata, and visual test harness are strong foundations.
3. The resume gives a clear recruiter-oriented path and has more disciplined first-fold hierarchy than the general page templates.
4. Existing tests cover visual surfaces, no overflow, keyboard targets, reduced motion, no-WebGL fallback, security headers, and route continuity.

## Gaps and decisions

| Priority | Finding | Evidence | Local decision |
| --- | --- | --- | --- |
| P0 | General-page H1 scale hides actions and proof below the first desktop viewport. | Global `h1` was `clamp(3.8rem, 11vw, 8.5rem)` with `13ch`; Home, Projects, and Contact are most affected. | Reduce the shared display scale and increase its measure; preserve the existing type family and hierarchy. |
| P0 | The persistent static-fallback banner repeats technical reassurance on every rendered page. | `BaseLayout` emits it in addition to the purposeful `noscript` notice and page-specific copy. | Remove the persistent banner; retain the `noscript` message and useful static-page copy. |
| P1 | Seven equal navigation pills turn into three rows at 390px. | Mobile visual inspection. | Keep every label and route in natural DOM order, but use a full-width four-column grid so the menu needs only two predictable rows. |
| P1 | Three equal homepage CTA cards dilute the recruiter path. | Equal-width grid in the hero. | Let the recruiter/resume action carry primary visual weight, with retained secondary engineer/contact paths. |
| P1 | Visual snapshot portability was incomplete. | Linux snapshots were committed; a Windows run generated 14 Win32 baselines. | Preserve platform-specific snapshots only after visual review, and run the visual gate sequentially. |
| P0 security | The Fly manifest selects a contact mode the API rejects. | API starts with an unsupported `store_resend_nightly` mode. | Use `disabled` until a contact-store and retention decision are explicitly approved. |
| P0 security | CSP allows only `self` although the configured browser API is external. | Contact and telemetry enhancements use the configured public API origin. | Add the exact configured API origin to `connect-src` without granting arbitrary origins. |
| P1 security | JSON-LD is inserted from repository-controlled data without `<` escaping. | `BaseLayout` serializes structured data with `set:html`. | Escape `<` in the JSON string as defense in depth. |
| P1 security | Direct and transitive frontend dependencies are outdated. | `pnpm audit --audit-level moderate`. | Plan a separately pinned dependency refresh with full V&V; do not auto-fix in this visual change set. |

## Taste review notes

The primary work is hierarchy, not ornament. The existing Fraunces display face is retained as an intentional part of this editorial-systems identity, despite the upstream Taste guide's general caution against it. No remote stock imagery, generated decorative images, new animation framework, route changes, or dependency additions are justified by this targeted remediation.

## Security/launch boundary

The site remains not launch-ready. Two hosting/region decisions remain unresolved, contact-data handling is not approved, and local checks do not replace production evidence. See `runbooks/HUMAN_DECISIONS_QUEUE.md` and `runbooks/LAUNCH_EVIDENCE.md` for authoritative launch gates.
