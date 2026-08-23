# Signal / Proof Portfolio Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current portfolio with the approved Signal / Proof experience and publish a verified `joepoznanski.io` release centered on three evidence-backed engineering stories.

**Architecture:** Astro remains static-first. A single validated `work` content collection drives the homepage, Work index, Work detail pages, metadata, and sitemap; one small framework-free enhancement controls the homepage media stage. Essential content, navigation, evidence, contact paths, and fallbacks render as semantic HTML before JavaScript.

**Tech Stack:** Astro 6.3.7, TypeScript 5.9.3, Astro Content Collections with Zod, plain Astro/TypeScript/CSS, Archivo Variable 5.3.0, JetBrains Mono 5.2.8, Vitest 3.2.4, Playwright 1.60, axe-core, Lighthouse 13.3, Cloudflare Pages/Wrangler 4.94.

**Spec:** `docs/superpowers/specs/2026-08-15-portfolio-signal-proof-rewrite-design.md`

## Global Constraints

- Canonical production domain is exactly `https://joepoznanski.io`.
- Primary navigation is exactly Work, About, Résumé, Contact.
- Joe Poznanski is the primary identity; `Systems Atelier` is secondary signature copy only.
- The three flagships are Cryogenic Flow Simulation, CLI Fleet Synchronization, and Remote Workstation Recovery.
- Do not publish fabricated screenshots, fake dashboards, unverified metrics, blocked Kalshi material, or blocked YouTube pipeline material.
- Essential content must work without JavaScript; animation may enhance presentation only.
- No WebGL, client framework, scroll hijacking, custom cursor, or large animation dependency.
- Required media and the approved résumé PDF fail the build when missing.
- Contact uses direct email, LinkedIn, and GitHub links; it does not render a form.
- Meet WCAG 2.2 AA, provide visible focus and reduced-motion states, and produce no serious or critical axe findings.
- Target mobile LCP below 2.5 seconds and measure bundles only from a fresh build.
- Preserve the user's original dirty checkout. Execute in an isolated worktree/clone and never reset or discard the original tree.
- Use a failing behavioral test before each implementation change. Do not weaken existing gates to obtain green results.
- Publishing is an outward-facing step: stop after preview verification for explicit production confirmation.

## File Structure

### Content and data

- `apps/web/src/lib/contracts/work.ts` — `workSchema`, exported Work field types, and publication guard.
- `apps/web/src/lib/contracts/work.test.ts` — positive and negative schema behavior.
- `apps/web/src/content/work/*.md` — the three flagships plus the Black–Scholes supporting item.
- `apps/web/src/content.config.ts` — registers `work`; stops registering duplicated public project/case-study collections.
- `apps/web/src/data/site-navigation.ts` — four primary links plus explicitly secondary footer links.
- `apps/web/src/data/profile.ts` — one source for public contact and professional profile values.
- `apps/web/src/data/routes.ts` — canonical route inventory for Home, Work, About, Résumé, Contact, Notes, and utilities.

### Presentation

- `apps/web/src/styles/tokens.css` — color, typography, spacing, width, radius, and motion tokens.
- `apps/web/src/styles/base.css` — reset, document defaults, headings, links, focus, and prose.
- `apps/web/src/styles/layout.css` — shell, grid, section, header, footer, and responsive rules.
- `apps/web/src/styles/components.css` — project stage, work rows, media, evidence, résumé, and contact.
- `apps/web/src/styles/motion.css` — entry, crossfade, progress, and reduced-motion behavior.
- `apps/web/src/styles/global.css` — imports the focused style modules only.
- `apps/web/src/components/MediaFrame.astro` — responsive image/video/fallback contract.
- `apps/web/src/components/EvidenceStrip.astro` — verified evidence values.
- `apps/web/src/components/ProjectStage.astro` — semantic project selector and media panels.
- `apps/web/src/components/WorkRow.astro` — reusable project summary link.
- `apps/web/src/components/CaseStudySection.astro` — consistent narrative/media section.
- `apps/web/src/components/ReadingProgress.astro` — optional progress enhancement.
- `apps/web/src/components/NextWork.astro` — deterministic next-project transition.
- `apps/web/src/components/SiteHeader.astro` and `SiteFooter.astro` — redesigned global shell.

### Routes

- `apps/web/src/pages/index.astro` — Signal / Proof homepage.
- `apps/web/src/pages/work/index.astro` — unified Work index.
- `apps/web/src/pages/work/[slug].astro` — unified Work detail.
- `apps/web/src/pages/about/index.astro` — narrative plus current focus/tools/reading modules.
- `apps/web/src/pages/resume/index.astro` — redesigned HTML/PDF résumé.
- `apps/web/src/pages/contact/index.astro` — direct channels only.
- `apps/web/src/pages/notes/index.astro` and `[slug].astro` — quieter technical writing.
- `apps/web/public/_redirects` — legacy `/projects` and `/case-studies` redirects.
- `apps/web/src/pages/sitemap-index.xml.ts`, `rss.xml.ts`, `robots.txt.ts` — canonical discovery surfaces.

### Verification

- `apps/web/src/lib/contracts/work.test.ts` — Work schema contract.
- `apps/web/src/data/routes.test.ts` — canonical route and nav contract.
- `scripts/design-token-contract.test.mjs` — font/token/source-asset contract.
- `scripts/social-preview-assets-contract.test.mjs` — canonical social assets.
- `tests/e2e/signal-proof-home.spec.ts` — homepage story and interaction.
- `tests/e2e/work-routes.spec.ts` — Work index/detail/no-JS/media behavior.
- `tests/e2e/about-resume-contact.spec.ts` — secondary primary routes.
- Existing metadata, route, accessibility, responsive, security, visual, and smoke specs — updated to assert the new behavior rather than old selectors.

---

### Task 1: Establish the unified Work contract

**Files:**
- Create: `apps/web/src/lib/contracts/work.ts`
- Create: `apps/web/src/lib/contracts/work.test.ts`
- Modify: `apps/web/src/content.config.ts`
- Modify: `apps/web/src/lib/contracts/content.ts`

**Interfaces:**
- Consumes: existing `slugSchema`, `seoSchema`, `publicationStatusSchema`, `caseStudyRedactionStatusSchema`, and `redactionReviewSchema` from `content.ts`.
- Produces: `workSchema`, `WorkEntryData`, `WorkMedia`, and Astro collection name `work`.

- [ ] **Step 1: Write schema tests that prove required evidence and publication safety**

```ts
import { describe, expect, it } from "vitest";
import { workSchema } from "./work";

const validWork = {
  title: "Cryogenic Flow Simulation",
  slug: "cryo-flow-sim",
  discipline: "simulation",
  year: 2026,
  featuredOrder: 1,
  lede: "A deterministic cryogenic flow simulation with auditable capture evidence.",
  problem: "Make transient system behavior reproducible without live hardware.",
  stakes: "Incorrect state transitions can misrepresent boundary behavior.",
  role: "Architecture, Rust implementation, capture pipeline, and verification.",
  constraints: ["Fixed-seed determinism", "No live hardware dependency"],
  architecture: {
    overview: "A Rust physics core feeds an Axum service and browser visualization.",
    diagramAlt: "Physics core to service to browser visualization and capture harness.",
  },
  decisions: [{
    title: "Deterministic capture",
    choice: "Drive the scenario from a fixed seed.",
    alternatives: ["Record an uncontrolled live run"],
    tradeoff: "Less variability in exchange for reproducible evidence.",
  }],
  outcome: "A verified 1080p artifact with 92 passing tests.",
  lessons: ["Deterministic artifacts make regressions diagnosable."],
  evidence: {
    label: "Stage 1 verified artifact",
    summary: "92 tests and all capture thresholds passed.",
    values: [{ label: "Tests", value: "92", detail: "cargo-nextest" }],
    scope: "Public Stage 1 artifact",
    limits: "Stage 2 is outside this release.",
  },
  media: {
    kind: "video",
    src: "/media/cryo-flow-sim-stage1.mp4",
    poster: "/media/cryo-flow-sim-stage1-poster.png",
    width: 1920,
    height: 1080,
    alt: "Cryogenic flow simulation dashboard during a valve transition.",
    caption: "Deterministic Stage 1 capture.",
  },
  publicationStatus: "publish",
  redactionStatus: "reviewed",
  redactionReview: {
    guidePath: "docs/CONTENT_REDACTION_GUIDE.md",
    reviewer: "operator",
    checklistStatus: "partial",
    openItems: [],
    notes: "Only the inspected public-safe narrative and evidence labels are rendered.",
  },
  seo: {
    title: "Cryogenic Flow Simulation | Joe Poznanski",
    description: "A deterministic Rust simulation and verified capture pipeline.",
    canonicalPath: "/work/cryo-flow-sim/",
    ogImage: "/social/default.png",
  },
};

describe("workSchema", () => {
  it("accepts a complete public Work entry", () => {
    expect(workSchema.safeParse(validWork).success).toBe(true);
  });

  it.each(["role", "evidence", "media"])("rejects missing %s", (field) => {
    const candidate = structuredClone(validWork) as Record<string, unknown>;
    delete candidate[field];
    expect(workSchema.safeParse(candidate).success).toBe(false);
  });

  it("rejects blocked content marked publish", () => {
    expect(workSchema.safeParse({
      ...validWork,
      redactionStatus: "blocked",
    }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the focused test and confirm the missing-module failure**

Run: `pnpm exec vitest run apps/web/src/lib/contracts/work.test.ts --configLoader runner`

Expected: FAIL because `./work` does not exist.

- [ ] **Step 3: Implement the exact schema and register the collection**

```ts
import { z } from "astro/zod";
import {
  caseStudyRedactionStatusSchema,
  publicationStatusSchema,
  redactionReviewSchema,
  seoSchema,
  slugSchema,
} from "./content";

export const workSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  discipline: z.enum(["simulation", "operations", "reliability", "tools"]),
  year: z.number().int().min(2000).max(2100),
  featuredOrder: z.number().int().positive().optional(),
  lede: z.string().min(1),
  problem: z.string().min(1),
  stakes: z.string().min(1),
  role: z.string().min(1),
  constraints: z.array(z.string().min(1)).min(1),
  architecture: z.object({ overview: z.string().min(1), diagramAlt: z.string().min(1) }),
  decisions: z.array(z.object({
    title: z.string().min(1),
    choice: z.string().min(1),
    alternatives: z.array(z.string().min(1)).min(1),
    tradeoff: z.string().min(1),
  })).min(1).max(3),
  outcome: z.string().min(1),
  lessons: z.array(z.string().min(1)).min(1),
  evidence: z.object({
    label: z.string().min(1),
    summary: z.string().min(1),
    values: z.array(z.object({
      label: z.string().min(1),
      value: z.string().min(1),
      detail: z.string().min(1),
    })).min(1),
    scope: z.string().min(1),
    limits: z.string().min(1),
  }),
  media: z.object({
    kind: z.enum(["image", "video", "evidence-flow"]),
    src: z.string().min(1).optional(),
    poster: z.string().min(1).optional(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: z.string().min(1),
    caption: z.string().min(1),
  }),
  demoComponent: z.literal("BlackScholesDemo").optional(),
  publicationStatus: publicationStatusSchema,
  redactionStatus: caseStudyRedactionStatusSchema,
  redactionReview: redactionReviewSchema,
  seo: seoSchema,
}).superRefine((entry, context) => {
  if (entry.publicationStatus === "publish" && entry.redactionStatus === "blocked") {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["redactionStatus"], message: "blocked work cannot be published" });
  }
  if (entry.media.kind === "video" && (!entry.media.src || !entry.media.poster)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["media"], message: "video work requires source and poster assets" });
  }
  if (entry.media.kind === "image" && !entry.media.src) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["media", "src"], message: "image work requires a source asset" });
  }
});

export type WorkEntryData = z.infer<typeof workSchema>;
export type WorkMedia = WorkEntryData["media"];
```

Register `work` with a glob loader at `./apps/web/src/content/work/**/*.md`. Keep `projects` and `caseStudies` registered during the staged migration; Task 7 removes their callers and collection registrations in the same test cycle.

- [ ] **Step 4: Run schema and existing content contract tests**

Run: `pnpm exec vitest run apps/web/src/lib/contracts/work.test.ts apps/web/src/lib/contracts/content.test.ts --configLoader runner`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/contracts/work.ts apps/web/src/lib/contracts/work.test.ts apps/web/src/content.config.ts apps/web/src/lib/contracts/content.ts
git commit -m "feat: define unified Work content contract"
```

### Task 2: Migrate the approved Work records and media contract

**Files:**
- Create: `apps/web/src/content/work/cryo-flow-sim.md`
- Create: `apps/web/src/content/work/cli-fleet-synchronization-and-mcp-rollout.md`
- Create: `apps/web/src/content/work/remote-workstation-recovery-and-operational-debugging.md`
- Create: `apps/web/src/content/work/black-scholes-wasm.md`
- Create: `scripts/work-content-contract.test.mjs`
- Create: `apps/web/public/media/cryo-flow-sim-stage1-640.webp`
- Create: `apps/web/public/media/cryo-flow-sim-stage1-960.webp`
- Create: `apps/web/public/media/cryo-flow-sim-stage1-1440.webp`
- Modify: `apps/web/src/content.config.ts`

**Interfaces:**
- Consumes: `workSchema` and the existing approved public narratives/media.
- Produces: four valid Work records; `featuredOrder` 1–3 identifies the flagships.

- [ ] **Step 1: Write a file-level contract that rejects duplicates, blocked public entries, missing media, and missing required assets**

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import path from "node:path";

test("Work content has three unique flagships and required local assets", () => {
  const dir = "apps/web/src/content/work";
  const files = readdirSync(dir).filter((name) => name.endsWith(".md"));
  const source = files.map((name) => readFileSync(path.join(dir, name), "utf8"));
  assert.equal(source.filter((entry) => /^featuredOrder:\s*[1-3]$/m.test(entry)).length, 3);
  assert.equal(new Set(files).size, files.length);
  assert.ok(source.every((entry) => !/^redactionStatus:\s*blocked$/m.test(entry)));
  assert.ok(existsSync("apps/web/public/media/cryo-flow-sim-stage1-poster.png"));
  for (const width of [640, 960, 1440]) {
    assert.ok(existsSync(`apps/web/public/media/cryo-flow-sim-stage1-${width}.webp`));
  }
  assert.ok(existsSync("apps/web/public/media/cryo-flow-sim-stage1.mp4"));
  assert.ok(existsSync("apps/web/public/downloads/joe-poznanski-resume.pdf"));
});
```

- [ ] **Step 2: Run the contract and confirm it fails because `content/work` is absent**

Run: `node --test scripts/work-content-contract.test.mjs`

Expected: FAIL with `ENOENT` for `apps/web/src/content/work`.

- [ ] **Step 3: Create the four Work records**

For the three flagships, preserve the existing public-safe narrative body verbatim from the corresponding file in `content/case-studies`, then replace the frontmatter with the Task 1 schema. Use these fixed identities and order:

```yaml
# cryo-flow-sim.md
title: "Cryogenic Flow Simulation"
slug: "cryo-flow-sim"
discipline: "simulation"
year: 2026
featuredOrder: 1
media:
  kind: "video"
  src: "/media/cryo-flow-sim-stage1.mp4"
  poster: "/media/cryo-flow-sim-stage1-poster.png"
  width: 1920
  height: 1080
  alt: "Cryogenic flow simulation dashboard during a verified valve-transition scenario."
  caption: "Deterministic Stage 1 capture at 1920 by 1080."
```

```yaml
# cli-fleet-synchronization-and-mcp-rollout.md
title: "CLI Fleet Synchronization"
slug: "cli-fleet-synchronization-and-mcp-rollout"
discipline: "operations"
year: 2026
featuredOrder: 2
media:
  kind: "evidence-flow"
  width: 1600
  height: 1000
  alt: "Public-safe flow from target inventory through local verification and a final status matrix."
  caption: "Account-local rollout and verification sequence."
```

```yaml
# remote-workstation-recovery-and-operational-debugging.md
title: "Remote Workstation Recovery"
slug: "remote-workstation-recovery-and-operational-debugging"
discipline: "reliability"
year: 2026
featuredOrder: 3
media:
  kind: "evidence-flow"
  width: 1600
  height: 1000
  alt: "Layered diagnostic sequence separating viewer, reachability, session, account, and host state."
  caption: "Evidence-first recovery path."
```

Create `black-scholes-wasm.md` as `discipline: "tools"`, without `featuredOrder`, with `demoComponent: "BlackScholesDemo"`. Preserve the complete verified body from `content/notes/wasm-black-scholes-options-pricer.md`; set its role to `Rust implementation, WASM boundary hardening, browser integration, and unit verification`, its evidence values to `62 KB raw`, `27 KB gzipped`, and `6 Rust unit tests`, and its limit to `European options on a non-dividend-paying underlying; this is an educational tool, not financial advice`. Do not copy blocked candidates into `work`.

Generate committed responsive WebP variants from the verified PNG poster with the already-installed FFmpeg tool:

```powershell
ffmpeg -y -i apps/web/public/media/cryo-flow-sim-stage1-poster.png -vf scale=640:-2 -c:v libwebp -q:v 82 -compression_level 6 apps/web/public/media/cryo-flow-sim-stage1-640.webp
ffmpeg -y -i apps/web/public/media/cryo-flow-sim-stage1-poster.png -vf scale=960:-2 -c:v libwebp -q:v 82 -compression_level 6 apps/web/public/media/cryo-flow-sim-stage1-960.webp
ffmpeg -y -i apps/web/public/media/cryo-flow-sim-stage1-poster.png -vf scale=1440:-2 -c:v libwebp -q:v 82 -compression_level 6 apps/web/public/media/cryo-flow-sim-stage1-1440.webp
```

Verify each output with `ffprobe -v error -show_entries stream=width,height,codec_name -of json <file>` and require `codec_name` to be `webp` with the requested width. The original PNG remains the fallback format.

- [ ] **Step 4: Run content contracts and Astro content type generation**

Run: `node --test scripts/work-content-contract.test.mjs`

Run: `pnpm exec astro sync`

Expected: both PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/content/work apps/web/src/content.config.ts scripts/work-content-contract.test.mjs
git commit -m "content: migrate evidence-backed Work stories"
```

### Task 3: Replace the route and navigation model

**Files:**
- Create: `apps/web/src/data/site-navigation.ts`
- Create: `apps/web/src/data/profile.ts`
- Modify: `apps/web/src/data/routes.ts`
- Modify: `apps/web/src/data/routes.test.ts`
- Modify: `apps/web/src/data/content-inventory.ts`
- Modify: `apps/web/src/data/content-inventory.test.ts`
- Modify: `apps/web/src/lib/home-scaffold.ts`
- Modify: `apps/web/src/lib/home-scaffold.test.ts`

**Interfaces:**
- Produces: `primaryNavigation`, `secondaryNavigation`, `profile`, `routeInventoryById.work`, and `routeInventoryById.about`.

- [ ] **Step 1: Replace the route test with the approved primary model and a negative assertion**

```ts
expect(routeInventory.filter((route) => route.primary).map((route) => route.path)).toEqual([
  "/work/", "/about/", "/resume/", "/contact/",
]);
expect(routeInventory.filter((route) => route.primary).map((route) => route.path)).not.toContain("/projects/");
expect(primaryNavigation.map((item) => item.label)).toEqual(["Work", "About", "Résumé", "Contact"]);
expect(secondaryNavigation.map((item) => item.href)).toEqual([
  "/notes/", "/now/", "/uses/", "/reading/",
]);
```

- [ ] **Step 2: Run the focused route tests and confirm the old seven-link model fails**

Run: `pnpm exec vitest run apps/web/src/data/routes.test.ts apps/web/src/data/content-inventory.test.ts --configLoader runner`

Expected: FAIL because Work/About and the new navigation exports do not exist.

- [ ] **Step 3: Implement navigation, profile, and route inventory**

```ts
export const primaryNavigation = [
  { label: "Work", href: "/work/" },
  { label: "About", href: "/about/" },
  { label: "Résumé", href: "/resume/" },
  { label: "Contact", href: "/contact/" },
] as const;

export const secondaryNavigation = [
  { label: "Notes", href: "/notes/" },
  { label: "Now", href: "/now/" },
  { label: "Uses", href: "/uses/" },
  { label: "Reading", href: "/reading/" },
] as const;
```

```ts
export const profile = {
  name: "Joe Poznanski",
  role: "Principal Software Engineer",
  location: "Titusville, Florida, USA",
  email: "josephpoznanski@gmail.com",
  linkedin: "https://www.linkedin.com/in/joe-poznanski",
  github: "https://github.com/HumanKaylee",
} as const;
```

Define canonical entries for Home, Work, Work detail, About, Résumé, Contact, Notes, note detail, sitemap, robots, and 404. Keep Now/Uses/Reading as secondary content routes. Mark the existing Project and Case Study route records `primary: false` and `legacy: true` until Task 7 removes their page callers. Update `homeScaffold()` to import and expose `primaryNavigation` temporarily so the existing homepage continues to compile; Task 5 deletes the scaffold after its final caller is replaced.

- [ ] **Step 4: Run the focused tests**

Run: `pnpm exec vitest run apps/web/src/data/routes.test.ts apps/web/src/data/content-inventory.test.ts --configLoader runner`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/data apps/web/src/lib/home-scaffold.ts apps/web/src/lib/home-scaffold.test.ts
git commit -m "refactor: center navigation on Work"
```

### Task 4: Build the Signal / Proof visual foundation and global shell

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `apps/web/src/styles/tokens.css`
- Create: `apps/web/src/styles/base.css`
- Create: `apps/web/src/styles/layout.css`
- Create: `apps/web/src/styles/components.css`
- Create: `apps/web/src/styles/motion.css`
- Modify: `apps/web/src/styles/global.css`
- Modify: `apps/web/src/layouts/BaseLayout.astro`
- Modify: `apps/web/src/components/SiteHeader.astro`
- Modify: `apps/web/src/components/SiteFooter.astro`
- Modify: `scripts/design-token-contract.test.mjs`

**Interfaces:**
- Consumes: `primaryNavigation`, `secondaryNavigation`, and `profile`.
- Produces: stable `.site-header`, `.site-footer`, `.page-shell`, `.section-grid`, `.signal-link`, and token contracts for later pages.

- [ ] **Step 1: Add failing design-token assertions**

```js
assert.match(tokens, /--color-canvas:\s*#f2f1eb/i);
assert.match(tokens, /--color-ink:\s*#11120f/i);
assert.match(tokens, /--color-signal:\s*#d9ff43/i);
assert.match(tokens, /--font-display:\s*"Archivo Variable"/i);
assert.doesNotMatch(globalCss, /Fraunces|Archivo Narrow/);
assert.deepEqual(primaryLabels, ["Work", "About", "Résumé", "Contact"]);
```

- [ ] **Step 2: Run the contract and confirm the old theme fails**

Run: `node --test scripts/design-token-contract.test.mjs`

Expected: FAIL on missing Signal / Proof tokens and old font references.

- [ ] **Step 3: Change the font dependency deliberately**

Run: `pnpm remove @fontsource/fraunces @fontsource/archivo-narrow`

Run: `pnpm add -D @fontsource-variable/archivo@5.3.0`

The only new dependency is the selected self-hosted variable font. No animation or UI framework is added.

- [ ] **Step 4: Implement the five CSS modules and redesigned shell**

Start `tokens.css` with:

```css
@font-face {
  font-family: "Archivo Variable";
  src: url("@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2") format("woff2-variations");
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}

:root {
  --color-canvas: #f2f1eb;
  --color-ink: #11120f;
  --color-signal: #d9ff43;
  --color-muted: #666a63;
  --color-media: #ffffff;
  --color-technical: #090a09;
  --font-display: "Archivo Variable", Arial, sans-serif;
  --font-evidence: "JetBrains Mono", ui-monospace, monospace;
  --content-max: 92rem;
  --reading-max: 44rem;
  --focus-ring: 0 0 0 3px var(--color-canvas), 0 0 0 6px var(--color-ink);
}
```

Add the ordered module imports at the top of `global.css` and update shared root/shell rules, but leave existing route-specific selectors in place while their pages are still being migrated. Task 11 removes unreachable legacy selectors and reduces `global.css` to imports after all replacement pages pass. `BaseLayout` removes visitor-facing no-JS/fallback banners and old WebGL/status data attributes while retaining the skip link, JSON-LD escaping, icons, and `data-enhancement="static-first"`. `SiteHeader` uses the four-link model and marks `/work/<slug>/` as Work. The footer exposes secondary pages without repeating the entire primary navigation as a dense row.

- [ ] **Step 5: Run contracts, type checks, and a shell route smoke**

Run: `node --test scripts/design-token-contract.test.mjs`

Run: `pnpm exec tsc -p tsconfig.json --noEmit`

Run: `pnpm exec playwright test tests/e2e/static-shell.spec.ts --workers=1`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml apps/web/src/styles apps/web/src/layouts/BaseLayout.astro apps/web/src/components/SiteHeader.astro apps/web/src/components/SiteFooter.astro scripts/design-token-contract.test.mjs
git commit -m "feat: establish Signal Proof visual system"
```

### Task 5: Build the static homepage story

**Files:**
- Create: `apps/web/src/components/MediaFrame.astro`
- Create: `apps/web/src/components/EvidenceStrip.astro`
- Create: `apps/web/src/components/WorkRow.astro`
- Create: `apps/web/src/components/ProjectStage.astro`
- Replace: `apps/web/src/pages/index.astro`
- Delete: `apps/web/src/components/BuildTelemetryStrip.astro`
- Delete: `apps/web/src/components/CtaCluster.astro`
- Delete: `apps/web/src/components/SystemsMapHero.astro`
- Delete: `apps/web/src/lib/home-scaffold.ts`
- Delete: `apps/web/src/lib/home-scaffold.test.ts`
- Create: `tests/e2e/signal-proof-home.spec.ts`

**Interfaces:**
- Consumes: published `work` entries sorted by `featuredOrder`.
- Produces: `ProjectStage` DOM contract using `[data-project-stage]`, `[data-stage-trigger]`, and `[data-stage-panel]`.

- [ ] **Step 1: Write the homepage behavior test before changing the page**

```ts
test("presents Joe, a Work action, authentic media, and three flagships", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Principal engineer for systems that cannot drift.");
  await expect(page.getByRole("link", { name: "View selected work" })).toHaveAttribute("href", "/work/");
  await expect(page.getByRole("img", { name: /Cryogenic flow simulation dashboard/i })).toBeVisible();
  await expect(page.locator("[data-stage-trigger]")).toHaveCount(3);
  await expect(page.locator("main")).not.toContainText(/fallback mode|API health|for recruiters|for engineers/i);
});
```

- [ ] **Step 2: Run the test and confirm the current hero fails**

Run: `pnpm exec playwright test tests/e2e/signal-proof-home.spec.ts --workers=1`

Expected: FAIL on the old `Systems built to hold up` heading.

- [ ] **Step 3: Implement semantic static components and homepage**

`ProjectStage` renders all three rows as normal `/work/<slug>/` links. Its first panel contains the real Cryogenic Flow poster. The fleet and recovery panels render truthful labeled HTML flows from their architecture/evidence fields; do not add handcrafted SVGs or fake application chrome. All panels exist in DOM reading order, with only presentation state changing later.

`MediaFrame` accepts `playback?: boolean` (default `false`). The homepage uses the responsive poster; the Cryogenic Flow detail opts into the user-controlled video:

```astro
{media.kind === "video" && !playback ? (
    <picture class="media-poster" data-video-poster>
      <source
        type="image/webp"
        srcset="/media/cryo-flow-sim-stage1-640.webp 640w, /media/cryo-flow-sim-stage1-960.webp 960w, /media/cryo-flow-sim-stage1-1440.webp 1440w"
        sizes="(max-width: 760px) 100vw, 50vw"
      />
      <img src={media.poster} width={media.width} height={media.height} alt={media.alt} />
    </picture>
) : media.kind === "video" ? (
  <video controls preload="none" poster={media.poster} width={media.width} height={media.height}>
    <source src={media.src} type="video/mp4" />
    <a href={media.src}>Open the simulation video</a>
  </video>
) : media.kind === "image" ? (
  <img src={media.src} width={media.width} height={media.height} alt={media.alt} loading="lazy" />
) : (
  <slot />
)}
<figcaption>{media.caption}</figcaption>
```

The homepage sequence is header, split hero, verified proof strip, project stage, compact capability statement, About preview, and closing contact invitation.

- [ ] **Step 4: Run home, no-JS, and static-shell tests**

Run: `pnpm exec playwright test tests/e2e/signal-proof-home.spec.ts tests/e2e/static-shell.spec.ts tests/e2e/api-outage-resilience.spec.ts --workers=1`

Expected: PASS, including with JavaScript disabled in the existing no-JS project.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/MediaFrame.astro apps/web/src/components/EvidenceStrip.astro apps/web/src/components/WorkRow.astro apps/web/src/components/ProjectStage.astro apps/web/src/components/BuildTelemetryStrip.astro apps/web/src/components/CtaCluster.astro apps/web/src/components/SystemsMapHero.astro apps/web/src/lib/home-scaffold.ts apps/web/src/lib/home-scaffold.test.ts apps/web/src/pages/index.astro tests/e2e/signal-proof-home.spec.ts
git commit -m "feat: rewrite the portfolio homepage"
```

### Task 6: Add the progressive project-stage interaction

**Files:**
- Modify: `apps/web/src/components/ProjectStage.astro`
- Modify: `apps/web/src/styles/components.css`
- Modify: `apps/web/src/styles/motion.css`
- Modify: `tests/e2e/signal-proof-home.spec.ts`
- Modify: `tests/e2e/motion-choreography.spec.ts`

**Interfaces:**
- `data-stage-trigger=<slug>` selects `data-stage-panel=<slug>`.
- Selected trigger uses `aria-current="true"`; inactive panels use `hidden` only after enhancement activates.

- [ ] **Step 1: Add failing pointer, keyboard, and reduced-motion behavior**

```ts
test("changes the stage from pointer and keyboard focus", async ({ page }) => {
  await page.goto("/");
  const recovery = page.locator('[data-stage-trigger="remote-workstation-recovery-and-operational-debugging"]');
  await recovery.focus();
  await expect(recovery).toHaveAttribute("aria-current", "true");
  await expect(page.locator('[data-stage-panel="remote-workstation-recovery-and-operational-debugging"]')).toBeVisible();
  await expect(page.locator('[data-stage-panel="cryo-flow-sim"]')).toBeHidden();
});

test("removes nonessential transitions for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-project-stage]")).toHaveCSS("scroll-behavior", "auto");
  const duration = await page.locator("[data-stage-panel]").first().evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(duration.split(",").every((value) => Number.parseFloat(value) <= 0.001)).toBe(true);
});
```

- [ ] **Step 2: Run and confirm focus does not yet select a panel**

Run: `pnpm exec playwright test tests/e2e/signal-proof-home.spec.ts tests/e2e/motion-choreography.spec.ts --workers=1`

Expected: FAIL on `aria-current` and panel visibility.

- [ ] **Step 3: Add the smallest framework-free enhancement**

The component script finds its own stage, activates exactly one slug, and binds `pointerenter`, `focusin`, and `click`. It must not prevent the normal link click. On initialization it adds `data-enhanced="true"`, then hides inactive panels; without script, all Work rows and their supporting summaries remain readable.

```ts
function activate(stage: HTMLElement, slug: string) {
  for (const trigger of stage.querySelectorAll<HTMLElement>("[data-stage-trigger]")) {
    trigger.setAttribute("aria-current", String(trigger.dataset.stageTrigger === slug));
  }
  for (const panel of stage.querySelectorAll<HTMLElement>("[data-stage-panel]")) {
    panel.hidden = panel.dataset.stagePanel !== slug;
  }
}
```

- [ ] **Step 4: Run interaction, no-JS, and motion tests**

Run: `pnpm exec playwright test tests/e2e/signal-proof-home.spec.ts tests/e2e/motion-choreography.spec.ts tests/e2e/no-webgl.spec.ts --workers=1`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/ProjectStage.astro apps/web/src/styles/components.css apps/web/src/styles/motion.css tests/e2e/signal-proof-home.spec.ts tests/e2e/motion-choreography.spec.ts
git commit -m "feat: progressively enhance the project stage"
```

### Task 7: Implement Work index and case-study detail routes

**Files:**
- Create: `apps/web/src/components/CaseStudySection.astro`
- Create: `apps/web/src/components/ReadingProgress.astro`
- Create: `apps/web/src/components/NextWork.astro`
- Create: `apps/web/src/pages/work/index.astro`
- Create: `apps/web/src/pages/work/[slug].astro`
- Create: `tests/e2e/work-routes.spec.ts`
- Modify: `apps/web/src/content.config.ts`
- Modify: `apps/web/src/data/content-collections.test.ts`
- Modify: `apps/web/src/data/routes.ts`
- Modify: `apps/web/src/data/routes.test.ts`
- Modify: `apps/web/src/data/content-inventory.ts`
- Modify: `apps/web/src/data/content-inventory.test.ts`
- Modify: `tests/e2e/page-metadata.spec.ts`
- Modify: `tests/e2e/project-detail.spec.ts`
- Delete: `apps/web/src/pages/projects/index.astro`
- Delete: `apps/web/src/pages/projects/[slug].astro`
- Delete: `apps/web/src/pages/case-studies/index.astro`
- Delete: `apps/web/src/pages/case-studies/[slug].astro`
- Delete: `apps/web/src/components/ProjectAtlas.astro`
- Delete: `apps/web/src/components/ProjectCard.astro`
- Delete: `apps/web/src/components/EvidenceDrawer.astro`

**Interfaces:**
- Work index and detail consume only `CollectionEntry<"work">`.
- `NextWork` receives `{ title: string; slug: string; discipline: string }`.

- [ ] **Step 1: Write failing Work route, content-order, JSON-LD, and unknown-slug tests**

```ts
test("renders the three flagships in approved order", async ({ page }) => {
  await page.goto("/work/");
  await expect(page.locator("[data-featured-work] h2")).toHaveText([
    "Cryogenic Flow Simulation", "CLI Fleet Synchronization", "Remote Workstation Recovery",
  ]);
});

test("renders a complete flagship narrative and next transition", async ({ page }) => {
  await page.goto("/work/cryo-flow-sim/");
  for (const heading of ["The situation", "Constraints", "My responsibility", "The system", "Critical decisions", "Proof", "Reflection"]) {
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: /Next project: CLI Fleet Synchronization/i })).toBeVisible();
});
```

- [ ] **Step 2: Run the test and confirm `/work/` is missing**

Run: `pnpm exec playwright test tests/e2e/work-routes.spec.ts --workers=1`

Expected: FAIL with a 404 for `/work/`.

- [ ] **Step 3: Implement the Work pages and reusable sections**

The detail page uses `getStaticPaths()` over published Work entries, sorts flagships by `featuredOrder`, computes the next published item cyclically, renders item-specific `CreativeWork` JSON-LD, and never renders redaction workflow fields. Map `demoComponent: "BlackScholesDemo"` to the existing `BlackScholesDemo.astro` component and render it after the supporting Work narrative. `ReadingProgress` is an optional 1–100 visual indicator with `aria-hidden="true"`; the document remains fully navigable without it.

After the new callers pass, remove the old Project/Case Study pages and presentation components, remove their legacy route-inventory/content-inventory records, and stop exporting `projects` and `caseStudies` from `content.config.ts`. Keep their source files on disk as unpublished editorial archives; they are no longer Astro collections and cannot generate routes. Update `content-collections.test.ts` to require `work` and reject the duplicate public collection names.

- [ ] **Step 4: Run Work, metadata, and project-detail tests**

Run: `pnpm exec playwright test tests/e2e/work-routes.spec.ts tests/e2e/page-metadata.spec.ts tests/e2e/project-detail.spec.ts --workers=1`

Expected: PASS with JSON-LD URLs under `https://joepoznanski.io/work/`.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/content.config.ts apps/web/src/data apps/web/src/components/CaseStudySection.astro apps/web/src/components/ReadingProgress.astro apps/web/src/components/NextWork.astro apps/web/src/components/ProjectAtlas.astro apps/web/src/components/ProjectCard.astro apps/web/src/components/EvidenceDrawer.astro apps/web/src/pages/work apps/web/src/pages/projects apps/web/src/pages/case-studies tests/e2e/work-routes.spec.ts tests/e2e/page-metadata.spec.ts tests/e2e/project-detail.spec.ts
git commit -m "feat: unify project stories under Work"
```

### Task 8: Build About and consolidate secondary content

**Files:**
- Create: `apps/web/src/pages/about/index.astro`
- Modify: `apps/web/src/pages/notes/index.astro`
- Modify: `apps/web/src/pages/notes/[slug].astro`
- Modify: `apps/web/src/components/SiteFooter.astro`
- Create: `tests/e2e/about-resume-contact.spec.ts`
- Modify: `tests/e2e/notes-rss.spec.ts`

**Interfaces:**
- About consumes the latest `now`, `uses`, and `reading` entries at build time.
- Footer exposes Notes/Now/Uses/Reading as secondary destinations without placing them in primary navigation.

- [ ] **Step 1: Write failing About/consolidation behavior**

```ts
test("presents a human About narrative with selected secondary material", async ({ page }) => {
  await page.goto("/about/");
  await expect(page.getByRole("heading", { level: 1, name: /engineering judgment/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current focus" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Selected tools" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current reading" })).toBeVisible();
  await expect(page.getByLabel("Primary navigation")).not.toContainText(/Now|Uses|Reading/);
});
```

- [ ] **Step 2: Run and confirm `/about/` is missing**

Run: `pnpm exec playwright test tests/e2e/about-resume-contact.spec.ts --grep "About" --workers=1`

Expected: FAIL with a 404.

- [ ] **Step 3: Implement About and quiet Notes**

About uses the verified résumé summary and experience context, then selects a small number of current focus, tool, and reading items from existing collections. Notes removes `build log` framing and internal portfolio-operation copy from its index; the Black–Scholes note remains visible. Do not delete source notes during this task.

- [ ] **Step 4: Run About, Notes, RSS, and navigation tests**

Run: `pnpm exec playwright test tests/e2e/about-resume-contact.spec.ts tests/e2e/notes-rss.spec.ts tests/e2e/static-shell.spec.ts --workers=1`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/pages/about apps/web/src/pages/notes apps/web/src/components/SiteFooter.astro tests/e2e/about-resume-contact.spec.ts tests/e2e/notes-rss.spec.ts
git commit -m "feat: consolidate the portfolio About story"
```

### Task 9: Redesign Résumé and replace the contact form with direct channels

**Files:**
- Modify: `apps/web/src/pages/resume/index.astro`
- Replace: `apps/web/src/pages/contact/index.astro`
- Delete: `apps/web/src/components/ContactForm.astro`
- Modify: `apps/web/src/styles/components.css`
- Modify: `tests/e2e/about-resume-contact.spec.ts`
- Modify: `tests/e2e/contact-api.spec.ts`
- Modify: `scripts/accessibility-and-fallback-qa-contract.test.mjs`

**Interfaces:**
- Consumes: `profile` and `resume.data.pdfDownloadPath`.
- Produces: direct `mailto`, LinkedIn, GitHub, and approved PDF links; no form endpoint.

- [ ] **Step 1: Add positive direct-link and negative form assertions**

```ts
test("offers reliable résumé and direct contact paths", async ({ page, request }) => {
  await page.goto("/resume/");
  const download = page.getByRole("link", { name: /Download résumé PDF/i });
  await expect(download).toHaveAttribute("href", "/downloads/joe-poznanski-resume.pdf");
  expect((await request.get("/downloads/joe-poznanski-resume.pdf")).status()).toBe(200);

  await page.goto("/contact/");
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Email Joe/i })).toHaveAttribute("href", "mailto:josephpoznanski@gmail.com");
  await expect(page.getByRole("link", { name: /LinkedIn/i })).toHaveAttribute("href", "https://www.linkedin.com/in/joe-poznanski");
  await expect(page.getByRole("link", { name: /GitHub/i })).toHaveAttribute("href", "https://github.com/HumanKaylee");
});
```

- [ ] **Step 2: Run and confirm the current contact form violates the contract**

Run: `pnpm exec playwright test tests/e2e/about-resume-contact.spec.ts --grep "direct contact" --workers=1`

Expected: FAIL because a form is present and social links are incomplete.

- [ ] **Step 3: Implement the approved direct-channel layout**

Move contact constants out of the résumé page and consume `profile`. Keep the existing verified résumé bullets, fix narrow-width metadata wrapping, place the PDF action prominently, and add print styles. Contact copy states the useful context to include and the conversations Joe welcomes, without a response-time guarantee.

- [ ] **Step 4: Run résumé/contact/accessibility tests**

Run: `pnpm exec playwright test tests/e2e/about-resume-contact.spec.ts tests/e2e/contact-api.spec.ts tests/e2e/quality-gates.spec.ts --workers=1`

Run: `node --test scripts/accessibility-and-fallback-qa-contract.test.mjs`

Expected: PASS. `contact-api.spec.ts` now proves the page does not claim API delivery rather than exercising a removed form.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/pages/resume/index.astro apps/web/src/pages/contact/index.astro apps/web/src/components/ContactForm.astro apps/web/src/styles/components.css tests/e2e/about-resume-contact.spec.ts tests/e2e/contact-api.spec.ts scripts/accessibility-and-fallback-qa-contract.test.mjs
git commit -m "feat: clarify resume and direct contact paths"
```

### Task 10: Complete canonical routes, redirects, discovery, and social metadata

**Files:**
- Modify: `apps/web/public/_redirects`
- Modify: `apps/web/src/content/site/site.json`
- Modify: `apps/web/src/pages/sitemap-index.xml.ts`
- Modify: `apps/web/src/pages/rss.xml.ts`
- Modify: `apps/web/src/pages/robots.txt.ts`
- Modify: `apps/web/src/layouts/BaseLayout.astro`
- Modify: `apps/web/src/middleware.ts`
- Modify: `apps/web/public/_headers`
- Modify: `scripts/generate-social-preview-assets.mjs`
- Modify: `scripts/social-preview-assets-contract.test.mjs`
- Modify: `apps/web/public/social/default.png`
- Modify: `tests/e2e/route-continuity.spec.ts`
- Modify: `tests/e2e/sitemap-robots.spec.ts`
- Modify: `tests/e2e/page-metadata.spec.ts`
- Modify: `tests/e2e/security-headers.spec.ts`

**Interfaces:**
- Produces canonical Work URLs and permanent legacy redirects.

- [ ] **Step 1: Write failing redirect and discovery assertions**

```ts
expect(redirects).toContain("/projects/*  /work/:splat  301");
expect(redirects).toContain("/case-studies/*  /work/:splat  301");
expect(sitemap).toContain("https://joepoznanski.io/work/cryo-flow-sim/");
expect(sitemap).not.toContain("/projects/");
expect(sitemap).not.toContain("/case-studies/");
expect(canonical).toBe("https://joepoznanski.io/work/cryo-flow-sim/");
expect(socialGenerator).toContain("cryo-flow-sim-stage1-poster.png");
expect(socialGenerator).not.toMatch(/SYSTEMS ATELIER|gradient:#091612/i);
```

- [ ] **Step 2: Run route, metadata, sitemap, and security tests**

Run: `pnpm exec playwright test tests/e2e/route-continuity.spec.ts tests/e2e/sitemap-robots.spec.ts tests/e2e/page-metadata.spec.ts tests/e2e/security-headers.spec.ts --workers=1`

Expected: FAIL on old project/case-study discovery URLs.

- [ ] **Step 3: Implement canonical discovery surfaces and exact redirects**

Set the site description to the approved direct positioning. Generate sitemap Work paths from only `publicationStatus === "publish"` entries. Keep Notes in RSS. Replace the old synthetic green-gradient social generator with one 1200x630 Signal / Proof card composed from the real Cryogenic Flow poster, an off-white text field, Joe Poznanski's name, and the approved positioning line; this is promotional composition around authentic media, not a fabricated interface. Generate and commit `social/default.png`, then verify its PNG signature and dimensions with the existing contract. Remove the now-unused API origin from `connect-src` if no remaining frontend request uses it; preserve the WASM allowance required by the Black–Scholes demo. Keep middleware and `_headers` semantically identical.

- [ ] **Step 4: Run metadata, route, security, and Node contracts**

Run: `node scripts/generate-social-preview-assets.mjs`

Run: `pnpm exec playwright test tests/e2e/route-continuity.spec.ts tests/e2e/sitemap-robots.spec.ts tests/e2e/page-metadata.spec.ts tests/e2e/security-headers.spec.ts --workers=1`

Run: `node --test scripts/*.test.mjs`

Expected: PASS with only intentional existing skips.

- [ ] **Step 5: Commit**

```bash
git add apps/web/public/_redirects apps/web/public/_headers apps/web/src/content/site/site.json apps/web/src/pages/sitemap-index.xml.ts apps/web/src/pages/rss.xml.ts apps/web/src/pages/robots.txt.ts apps/web/src/layouts/BaseLayout.astro apps/web/src/middleware.ts tests/e2e scripts
git commit -m "feat: canonicalize the portfolio under Work"
```

### Task 11: Replace stale visual assertions and verify the complete local release

**Files:**
- Modify: `tests/e2e/route-coverage.spec.ts`
- Modify: `tests/e2e/journey-smoke.spec.ts`
- Modify: `tests/e2e/visual-surfaces.spec.ts`
- Modify: `tests/e2e/responsive-cross-browser.spec.ts`
- Modify: `tests/e2e/visual-regression.spec.ts`
- Modify: `tests/e2e/visual-regression.spec.ts-snapshots/*`
- Modify: `tests/e2e/taste-audit.spec.ts`
- Modify: `tests/e2e/no-webgl.spec.ts`
- Delete: `tests/e2e/project-atlas.spec.ts`
- Delete: `tests/e2e/case-study-routes.spec.ts`
- Delete: `tests/e2e/api-telemetry.spec.ts`
- Delete: `tests/e2e/portfolio-evolution-2026-08-15.spec.ts`
- Delete: `tests/e2e/taste-evolution-2026-07-25.spec.ts`
- Delete: `tests/e2e/taste-repair.spec.ts`
- Modify: `scripts/evidence-surface-contract.test.mjs`
- Modify: `scripts/post-launch-feature-prep-contract.test.mjs`
- Modify: `scripts/bundle-budget.mjs`
- Modify: `scripts/bundle-budget.test.mjs`
- Modify: `apps/web/src/styles/global.css`

**Interfaces:**
- Produces: a complete local verification matrix and human-approved Signal / Proof snapshots.

- [ ] **Step 1: Update behavior tests first and run them against the old expectations**

Replace selectors for removed atlas/cards/telemetry with assertions for `.project-stage`, `.work-row`, `.evidence-strip`, canonical Work journeys, no overflow, 44px primary targets, and the absence of generic gradient/card-wall styling. Preserve negative cases that would fail if navigation, links, or layouts regressed.

Run: `pnpm exec playwright test tests/e2e/route-coverage.spec.ts tests/e2e/journey-smoke.spec.ts tests/e2e/visual-surfaces.spec.ts tests/e2e/responsive-cross-browser.spec.ts --workers=1`

Expected: FAIL until every new surface contract is implemented consistently.

- [ ] **Step 2: Fix only implementation defects exposed by the updated behavior tests**

Do not loosen touch, overflow, route, focus, or semantic assertions. Adjust source CSS/components one defect at a time and rerun the failing spec after each change.

Remove the six iteration-specific E2E files listed above only after their replacement behavior is green: `project-atlas` maps to `signal-proof-home`, `case-study-routes` maps to `work-routes`, `api-telemetry` maps to the static/no-API home contract, and the three dated taste/evolution specs map to the new route, responsive, accessibility, and visual suites. Update `evidence-surface-contract` to require ProjectStage, EvidenceStrip, Work detail, and real-media hooks; update `post-launch-feature-prep-contract` to forbid a deferred WebGL/atlas loader rather than requiring one. This is a deliberate contract replacement for removed product behavior, not deletion to hide failures.

Once all replacement pages pass, delete the now-unreferenced old selectors from `global.css` and reduce it to the five ordered imports. Prove there are no source references to `hero-shell`, `systems-map`, `project-atlas`, `constellation`, `cta-cluster`, `telemetry-strip`, `evidence-drawer`, or `contact-form` with:

`rg -n "hero-shell|systems-map|project-atlas|constellation|cta-cluster|telemetry-strip|evidence-drawer|contact-form" apps/web/src tests/e2e scripts`

Expected: no matches except explicit negative assertions in replacement tests.

- [ ] **Step 3: Run the full non-visual verification matrix**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e -- --workers=1
pnpm build
pnpm bundle:budget
```

Expected: all commands exit 0; reported skips are reviewed and limited to intentionally opt-in screenshot capture cases.

- [ ] **Step 4: Capture and inspect the new visual system before changing baselines**

Run in PowerShell:

```powershell
$captureDir = Join-Path $PWD "artifacts/signal-proof-captures"
New-Item -ItemType Directory -Force -Path $captureDir | Out-Null
$env:TASTE_AUDIT_CAPTURE_DIR = $captureDir
pnpm exec playwright test tests/e2e/taste-audit.spec.ts --workers=1
```

Open the captured Home, Work, flagship, About, Résumé, Contact, and Notes images at desktop and mobile widths. Compare them to the approved Direction A mockup and the written spec. Fix visible hierarchy, crop, spacing, overflow, focus, font, border, and contrast defects in source.

- [ ] **Step 5: Accept the intentional new baselines, then prove they are stable**

Run: `pnpm test:visual:update`

Run: `pnpm test:visual`

Expected: the first command changes only the approved route snapshots; the second exits 0 without further changes.

- [ ] **Step 6: Run Lighthouse from a fresh build**

Run: `pnpm lighthouse:local`

Expected: performance, accessibility, best-practices, and SEO meet the repository thresholds; mobile LCP is below 2.5 seconds for the homepage profile.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src tests/e2e scripts package.json pnpm-lock.yaml
git commit -m "test: verify the Signal Proof portfolio release"
```

### Task 12: Push, verify a preview, and publish with rollback readiness

**Files:**
- Modify: `runbooks/LAUNCH_EVIDENCE.md`
- Create: `docs/PORTFOLIO_SIGNAL_PROOF_RELEASE_2026-08-15.md`

**Interfaces:**
- Consumes: a clean branch containing Tasks 1–11 and a fresh `dist`.
- Produces: remote branch proof, preview URL, production deployment ID, live smoke evidence, and previous-deployment rollback reference.

- [ ] **Step 1: Prove the branch is clean and the exact release commit is verified**

Run: `git status --short --branch`

Run: `git log -1 --format="%H %s"`

Run: `git diff --check HEAD^ HEAD`

Expected: no worktree changes and one exact release SHA recorded.

- [ ] **Step 2: Perform a staged secret and payload scan**

Run: `git grep -n -I -e 'BEGIN .*PRIVATE KEY' -e 'CLOUDFLARE_API_TOKEN=' -e 'FLY_API_TOKEN=' -e 'ghp_' HEAD -- . ':!*.lock'`

Expected: no matches. Also confirm no `.env`, `.pnpm-store`, auth/config file, or credential filename is tracked with `git ls-tree -r --name-only HEAD`.

- [ ] **Step 3: Push the isolated branch and run remote verification**

```powershell
git push -u origin HEAD
$branch = git branch --show-current
gh workflow run portfolio-branch-verification.yml --repo HumanKaylee/humankaylee-portfolio --ref $branch
$runId = gh run list --repo HumanKaylee/humankaylee-portfolio --workflow portfolio-branch-verification.yml --branch $branch --limit 1 --json databaseId --jq '.[0].databaseId'
gh run watch $runId --repo HumanKaylee/humankaylee-portfolio --exit-status
```

Expected: push succeeds and the branch workflow exits 0 with its verification artifact available.

- [ ] **Step 4: Record current production deployment and create a preview deployment**

Run: `pnpm exec wrangler whoami`

If it reports `Not logged in`, stop this task and have Joe complete `pnpm exec wrangler login` in the interactive browser. Re-run `whoami`; do not use a copied token, inspect credential values, or continue unauthenticated.

Run: `pnpm exec wrangler pages deployment list --project-name=humankaylee-portfolio`

Run: `pnpm exec wrangler pages project list`

Record the current production deployment ID and provider-reported production branch before creating anything. Then run:

`pnpm exec wrangler pages deploy dist --project-name=humankaylee-portfolio --branch=signal-proof-preview`

Expected: authenticated account, a recorded current production deployment, and a distinct preview URL serving the release SHA.

- [ ] **Step 5: Verify the preview as a real deployment**

Run the production-smoke Playwright configuration against the preview base URL, then manually inspect Home, Work, Cryogenic Flow, About, Résumé, Contact, Notes, legacy redirects, résumé PDF, canonical tags, and responsive layouts. Confirm response headers come from Cloudflare and no page exposes internal fallback language.

Expected: all preview checks pass. If any fail, fix source, repeat Task 11, push, and redeploy preview. Do not proceed to production.

- [ ] **Step 6: Stop for explicit production confirmation**

Present the preview URL, release SHA, remote verification result, visual comparison summary, current production deployment ID, and rollback path to Joe. Do not mutate production until Joe explicitly confirms go-live.

- [ ] **Step 7: Deploy the exact verified `dist` to production**

After confirmation, require the project listing to report `main` as the production branch. If it reports a different branch, stop and correct the provider configuration deliberately rather than guessing. Once `main` is confirmed, run:

`pnpm exec wrangler pages deploy dist --project-name=humankaylee-portfolio --branch=main`

Record the new production deployment ID and URL. Do not deploy the Fly API unless a frontend change actually requires it; this design does not.

- [ ] **Step 8: Run live verification and preserve rollback evidence**

Verify `https://joepoznanski.io/`, `/work/`, all three flagship URLs, `/about/`, `/resume/`, the PDF, `/contact/`, `/notes/`, sitemap, robots, canonical tags, and both legacy redirect families. If any blocking check fails, use the Cloudflare Pages deployment controls to roll production back to the exact deployment ID recorded in Step 4, then verify that restored deployment live.

- [ ] **Step 9: Reconcile launch documentation and commit evidence**

Update `runbooks/LAUNCH_EVIDENCE.md` and the release note with the verified SHA, deployment IDs, URLs, timestamps, check results, and rollback reference. Do not claim Lighthouse or visual scores that were not actually produced.

```bash
git add runbooks/LAUNCH_EVIDENCE.md docs/PORTFOLIO_SIGNAL_PROOF_RELEASE_2026-08-15.md
git commit -m "docs: record Signal Proof production evidence"
git push
```
