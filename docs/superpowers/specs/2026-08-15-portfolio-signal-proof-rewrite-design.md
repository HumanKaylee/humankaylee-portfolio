# Joe Poznanski Portfolio — Signal / Proof Rewrite Design

**Status:** Approved design
**Date:** 2026-08-15
**Canonical domain:** `https://joepoznanski.io`
**Production target:** Cloudflare Pages frontend with the existing Fly.io API remaining optional

## 1. Purpose

Rewrite the portfolio as a clear, evidence-led presentation of Joe Poznanski's engineering work. The new experience must identify Joe immediately, make strong work easy to scan, use authentic project material as its visual centerpiece, and provide enough technical depth for senior engineering readers without turning the site into an internal operations dashboard.

The chosen direction is **Signal / Proof**: a restrained editorial system with large typography, warm off-white surfaces, near-black ink, acid-lime signals, asymmetric layouts, and one progressive project-media interaction. `Systems Atelier` remains a quiet secondary signature; it is not the primary identity or hero message.

## 2. Goals

- Make Joe Poznanski, his role, and his engineering value clear within the first viewport.
- Center the experience on three credible flagship stories with public-safe evidence.
- Replace repeated generic cards and internal status language with an intentional editorial hierarchy.
- Create one memorable interaction that reinforces the work rather than distracting from it.
- Use real project images, video, diagrams, interfaces, and evidence. Do not publish fabricated screenshots or decorative fake dashboards.
- Keep all essential content static, semantic, keyboard accessible, and readable without JavaScript.
- Make `joepoznanski.io` the consistent canonical identity across metadata, feeds, sitemaps, and aliases.
- Ship as one cohesive redesign with production verification, not as a series of visibly mismatched partial states.

## 3. Non-goals

- No mandatory WebGL or 3D environment.
- No scroll hijacking, custom cursor, particle field, or animation-dependent navigation.
- No new client framework for the homepage interaction.
- No publication of the Kalshi or YouTube pipeline candidates until their public-safety reviews genuinely pass.
- No restoration of a contact form without an approved and working delivery path.
- No portfolio-about-the-portfolio story among the flagship projects.
- No internal deployment, fallback, API-health, or launch-readiness language in visitor-facing copy.

## 4. Brand and visual system

### Identity

The header leads with **Joe Poznanski**. `Systems Atelier` appears as a small secondary signature in the header lockup, About page, or footer. The primary positioning line is:

> Principal engineer for systems that cannot drift.

Supporting copy explains the work in concrete terms:

> I turn ambiguous operational problems into reliable software, from simulation and infrastructure to automation and recovery.

Final copy may tighten rhythm, but it may not broaden into unproved claims.

### Color

- Canvas: `#F2F1EB`
- Ink: `#11120F`
- Signal: `#D9FF43`
- Muted ink: `#666A63`
- Media surface: `#FFFFFF`
- Technical dark surface: `#090A09`

Signal green marks primary actions, selected work, focus accents, and small pieces of evidence. It is not used as a large decorative gradient.

### Typography

- Display and body: Archivo Variable, self-hosted through the established Fontsource ecosystem.
- Evidence and metadata: JetBrains Mono, already present in the project.
- Fraunces and Archivo Narrow are removed from the active visual system rather than retained as compatibility styles.

Headlines use large, tight sans-serif composition. Body copy remains comfortably sized and constrained to readable measures. Monospace text is reserved for technical metadata, not entire paragraphs.

### Geometry and spacing

- Wide asymmetric grids and large negative space establish hierarchy.
- Thin rules organize content more often than filled containers.
- Media may use modest corner rounding; ordinary content does not become a collection of rounded cards.
- Primary sections use generous vertical separation and visibly different compositions.
- Links preserve familiar affordances through underlines, directional movement, or both.

## 5. Information architecture

### Primary navigation

1. Work
2. About
3. Résumé
4. Contact

### Routes

- `/` — homepage
- `/work/` — work index
- `/work/<slug>/` — unified flagship and supporting work detail
- `/about/` — career narrative, principles, experience, current focus, and selected tools
- `/resume/` — complete web résumé and PDF download
- `/contact/` — direct contact channels
- `/notes/` and `/notes/<slug>/` — quieter technical writing destination linked from the footer

Existing `/projects/` and `/case-studies/` URLs receive permanent redirects to their unified `/work/` equivalents so indexed external links do not break. Existing Now, Uses, and Reading material is consolidated into About or Notes where it strengthens those pages. Legacy route continuity is retained only where it serves an existing public URL; new components and content callers use the new model directly.

## 6. Content strategy

### Editorial voice

Copy is direct, specific, first-person, and evidence-led. Each important claim sits near an artifact, constraint, test result, architecture detail, or explicit limit. The site avoids generic phrases such as `innovative solutions`, `cutting-edge`, and unqualified `AI-assisted systems`.

### Flagship work

1. **Cryogenic Flow Simulation** — the visual and technical anchor: deterministic Rust simulation, Three.js interface, repeatable capture workflow, 92 tests, and measurable artifact validation.
2. **CLI Fleet Synchronization** — a systems-operations story about eliminating configuration drift across machines while preserving account-local security boundaries.
3. **Remote Workstation Recovery** — an evidence-first debugging story that separates reachability, account, session, process, and viewer failures before changing shared state.

### Supporting work

- The WebAssembly Black–Scholes tool, presented as a working technical demonstration.
- Public-safe automation and infrastructure work that has inspectable evidence.
- Substantial technical notes that demonstrate reasoning.

The Creative Web Systems Atlas and the portfolio build are removed from flagship status. The portfolio implementation may be acknowledged briefly in a colophon. Blocked financial and media-pipeline candidates remain excluded from generated public routes.

## 7. Page designs

### Homepage

The homepage is an editorial sequence:

1. Compact header with four primary destinations.
2. Split hero with the positioning statement, short value proposition, primary Work link, and authentic Cryogenic Flow media.
3. Narrow proof strip containing only verified, visitor-relevant facts.
4. Interactive selected-work stage with three project rows and one large media surface.
5. Compact capability statement tied to actual examples rather than a skill-cloud taxonomy.
6. Short About preview focused on judgment, ownership, and operating style.
7. Direct closing invitation and minimal footer.

The first viewport must contain Joe's name, role, value proposition, a Work action, and recognizable project media. It must not contain internal environment status or audience-selection controls.

### Work index

The Work page opens with a concise framing statement and the three flagships in a strong numbered sequence. Each entry includes discipline, problem, Joe's ownership, strongest evidence, and authentic media. Supporting work follows as a denser text-forward index. Filters and capability clusters are omitted unless the final content set becomes too large to scan without them.

### About

The About page combines the strongest material from the former Now, Uses, and Reading surfaces with a human career narrative. Its sections are: introduction, current engineering focus, operating principles, experience timeline, selected tools, and current learning or reading. Tool names support the story; they do not replace it.

### Résumé

The résumé remains complete in HTML and exposes the approved PDF download prominently. Metadata wraps at narrow widths, dates align without compressing descriptions, and print styling produces a usable document. The download path is treated as a required build asset.

### Contact

Contact is intentionally short: a clear invitation, email, LinkedIn, and GitHub. The page does not display a disabled or unreliable form. It explains the kinds of conversations Joe welcomes without implying guaranteed response times.

### Notes

Notes use a quiet editorial index and readable long-form typography. Only substantial technical writing remains. Operational implementation notes and portfolio self-documentation do not compete with the main work narrative.

## 8. Case-study template

Each flagship detail page uses this sequence:

1. Project number, discipline, and year.
2. Direct outcome statement.
3. Full-width authentic media.
4. At-a-glance strip: role, system boundary, primary constraint, strongest evidence.
5. Situation and stakes.
6. Constraints.
7. Joe's responsibility.
8. Verified architecture.
9. Two or three critical decisions, alternatives, and tradeoffs.
10. Evidence and known limits.
11. Reflection and next improvement.
12. One strong transition to the next project.

Desktop layouts may anchor media beside related narrative. Mobile places that media inline in reading order. Diagrams must encode verified public-safe architecture; they are not decorative illustrations presented as evidence.

The Cryogenic Flow story receives the richest treatment: an optimized poster, optional user-controlled video excerpt, architecture view, validation results, and detailed artifact frames. Fleet Synchronization uses a public-safe system flow and evidence matrix. Remote Recovery uses a layered diagnostic sequence and role-labeled verification evidence.

## 9. Component boundaries

- `SiteHeader` — identity, primary navigation, current-route state, and mobile menu behavior.
- `SiteFooter` — secondary destinations, social links, Systems Atelier signature, and colophon link.
- `ProjectStage` — progressive homepage media selection; owns selection state but not project content.
- `WorkRow` — semantic project link and summary consumed by both enhanced and no-JS layouts.
- `MediaFrame` — responsive image, poster, video controls, caption, and fallback behavior.
- `EvidenceStrip` — compact verified facts with accessible labels.
- `CaseStudySection` — repeatable narrative and media alignment without hiding arbitrary content behind accordions.
- `ReadingProgress` — optional case-study progress indicator; removed under reduced motion without changing content.
- `NextWork` — one deterministic next-project transition.

Existing components are replaced or simplified when their current responsibility conflicts with this design. The rewrite does not add a parallel compatibility component layer.

## 10. Content model and data flow

A single validated Work collection replaces the duplicated project-summary and case-study relationship. Each public item contains:

- identity: title, slug, discipline, year, featured order
- narrative: lede, problem, stakes, role, constraints, decisions, outcome, lessons
- evidence: label, summary, values, source boundary, known limits
- media: asset type, source, poster, alt text, caption, dimensions
- publication: status, redaction review, public-safe notes
- metadata: title, description, canonical path, social image

Astro validates the collection at build time and generates the Work index, detail routes, homepage rows, metadata, sitemap entries, and related-work links from the same records. Essential content is never fetched from the API. The homepage enhancement reads pre-rendered project state from the document and changes only presentation; it does not own or request the narrative.

## 11. Interaction and motion

The homepage project rows are normal links. On capable desktop browsers, pointer hover, keyboard focus, or explicit selection changes the adjacent media, caption, and evidence line. Selection remains visible and keyboard focus remains on the initiating control. Mobile renders each project's own media directly with no hover dependency.

Motion consists of short entry reveals, media crossfades, directional link movement, and a slim case-study progress indicator. `prefers-reduced-motion: reduce` removes nonessential movement and produces the complete final visual state immediately. No information appears only after animation.

## 12. Error and fallback behavior

- JavaScript failure leaves the first project image and complete linked project list readable.
- Video failure leaves a verified poster and caption visible.
- Optional API failure is silent because essential content is generated statically.
- Required media, résumé PDF, or invalid published content causes a build failure.
- A missing optional supporting asset omits the optional enhancement without creating a placeholder box.
- Blocked publication status prevents route generation.
- Unknown Work slugs render the standard static 404 page.
- External-link and direct-contact failures remain normal browser behavior; the site does not simulate successful delivery.

## 13. Accessibility requirements

- Meet WCAG 2.2 AA contrast and interaction requirements.
- Provide visible focus styles and logical heading and landmark order.
- Support the full primary journey with keyboard only.
- Preserve an equivalent reduced-motion experience.
- Give images and diagrams concise, meaningful alternative text; complex evidence receives adjacent prose.
- Keep media controls native or equivalently accessible.
- Ensure touch targets are at least 44 by 44 CSS pixels where practical.
- Produce no serious or critical axe findings across primary routes.

## 14. Performance requirements

- Target mobile Largest Contentful Paint below 2.5 seconds under the project's Lighthouse profile.
- Keep the homepage enhancement small and framework-free.
- Generate responsive image formats and explicit dimensions.
- Use `preload="none"` or metadata-only loading for nonessential video and retain a poster.
- Avoid loading project media that is neither visible nor selected.
- Keep essential navigation, copy, and Work links server-rendered.
- Treat a fresh production build, not the existing stale `dist`, as the only valid source for bundle measurements.

## 15. Verification strategy

Implementation follows behavior-first tests. Each meaningful change begins with a failing assertion that captures the intended visitor behavior.

Required verification includes:

- content-schema tests for required evidence, media, publication, and metadata fields
- route and redirect tests for Home, Work, About, Résumé, Contact, Notes, and legacy URLs
- no-JavaScript parity for navigation, selected work, and case-study reading
- keyboard and reduced-motion tests for the project stage and mobile navigation
- media failure and poster fallback tests
- résumé asset and download checks
- metadata, canonical, sitemap, robots, and structured-data checks
- axe scans across every primary page type
- responsive tests at narrow mobile, tablet, desktop, and wide desktop widths
- visual comparisons for Home, Work, one flagship detail, About, Résumé, Contact, and Notes
- explicit visual inspection of reference and implementation at matching viewports before accepting new baselines
- bundle and Lighthouse gates against a fresh build
- production smoke checks for routes, assets, redirects, canonical URLs, and direct contact links

Visual baselines will change because the redesign is intentional. New baselines are accepted only after human-visible comparison confirms the implementation matches this specification; they are not regenerated merely to make a red test green.

## 16. Migration and deployment

Work is performed in an isolated branch built from the verified redesign state, preserving the heavily modified original checkout. The content model is migrated before page callers are changed so validation failures identify incomplete records. Routes and components then move to the new model as a single implementation unit.

Deployment targets the existing Cloudflare Pages project. `joepoznanski.io` is canonical in HTML, structured data, sitemap, RSS, and social metadata. Other bound hostnames should permanently redirect to the canonical domain when the provider configuration allows it; until then they must at minimum emit the canonical `joepoznanski.io` URL consistently.

The release sequence is: local verification, remote branch verification artifact, preview or branch deployment, visual review, production deployment, live smoke verification, and rollback readiness. Publication is not claimed until the production hostname serves the new design and the live checks pass.

## 17. Acceptance criteria

The rewrite is complete when all of the following are true:

- The live first viewport clearly names Joe Poznanski, states his role and value, offers a Work action, and shows authentic project media.
- Primary navigation contains Work, About, Résumé, and Contact with correct current states.
- The homepage presents the three approved flagships and the project-stage enhancement preserves no-JS and keyboard parity.
- Work has one content model and one canonical public detail route per item.
- The three flagship pages follow the approved case-study structure and contain no fabricated evidence.
- Now, Uses, and Reading no longer compete in primary navigation; their strongest content is integrated into About or Notes.
- Résumé HTML and the approved PDF both work.
- Contact exposes reliable direct channels and no nonfunctional form.
- `joepoznanski.io` is canonical across generated discovery surfaces.
- Accessibility, responsive, route, content, asset, no-JS, reduced-motion, bundle, and performance gates pass on a fresh build.
- The deployed production site is visually inspected at desktop and mobile sizes and passes live smoke checks.

## 18. Principal tradeoff

The design chooses clarity, authentic media, and one excellent progressive interaction over a heavier immersive world. This keeps the site memorable while protecting the recruiter scan, technical depth, accessibility, performance, and long-term maintainability.
