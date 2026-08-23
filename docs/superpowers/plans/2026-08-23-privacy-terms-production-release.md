# Privacy And Terms Production Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish accurate Privacy and Terms pages on `joepoznanski.io`, reconcile the repository privacy contract with the static site, harden the identified local Google token files without reading them, and deploy the exact verified Git commit with a tested rollback reference.

**Architecture:** Keep the portfolio static-first in Astro. Extend the existing route inventory, footer, and sitemap for two legal routes; keep policy copy in the route components; use source-contract and browser tests to prevent factual regressions; treat token hardening as a metadata-only local operation outside Git; and publish a clean `main` artifact directly to the existing Cloudflare Pages project.

**Tech Stack:** Astro 7, TypeScript 5, Vitest 4, Node test runner, Playwright 1.60, pnpm 10.33.2, Rust/Cargo, Git/GitHub CLI, WSL file-mode tools, Cloudflare Wrangler 4.123.0.

**Spec:** `docs/superpowers/specs/2026-08-23-privacy-terms-production-release-design.md`

## Global Constraints

- Work only in the clean recovery clone on `feat/privacy-and-terms`; do not merge or copy the unrelated dirty canonical checkout.
- Preserve every pre-existing edit in the scoped legal-page work. Read each file again immediately before editing it.
- Start every behavioral correction with a failing assertion and observe the expected failure before changing implementation copy.
- Do not weaken tests, refresh a golden image merely to make CI green, or describe a skipped check as passing.
- Do not add a runtime dependency, contact form, analytics provider, OAuth flow, credential rotation, or backend feature.
- Do not read, print, copy, hash, upload, or place token contents on a command line. Token checks may emit only basenames, modes, and owner/group metadata.
- Do not commit an absolute private filesystem path, account identifier, credential, provider token, or raw provider log.
- Cloudflare publication and `main` update are already owner-approved by the user for this release. If Cloudflare authentication is unavailable, stop for the operator's interactive authorization; do not create credentials or change account permissions.
- A `200` response is not route proof. Verify title, canonical, H1, or another route-specific marker.
- Keep the previous production deployment reachable until the new production route, security, console, and WASM checks pass.
- Any out-of-scope failure is reported and isolated; do not refactor unrelated code while fixing it.

## Interfaces And Contracts

### Route inventory

`RouteId` gains `privacy` and `terms`. Both routes are non-primary, static, indexable pages with these canonical paths:

```ts
privacy: "/privacy/"
terms: "/terms/"
```

Their SEO records must include `title`, `description`, `canonicalPath`, `ogImage`, and `robots: "index,follow"`.

### Navigation and sitemap

`legalNavigation` is a readonly list consumed by `SiteFooter.astro`:

```ts
export const legalNavigation = [
	{ label: "Privacy", href: "/privacy/" },
	{ label: "Terms", href: "/terms/" },
] as const;
```

The XML sitemap must contain both canonical route URLs exactly once.

### Public privacy claims

The rendered Privacy page must:

- disclose Cloudflare request processing, Cloudflare Web Analytics, and email obfuscation as separate behavior;
- say Web Analytics is cookie-free and uses neither cookies nor `localStorage` for its metrics;
- state the full provider-granted capabilities of the Calendar and Gmail scopes;
- distinguish those capabilities from the operator's narrower personal workflow;
- disclose task-specific transmission to the AI API without unsupported retention or training promises; and
- avoid the contradicted claims enumerated in Task 1.

### Operational permission contract

The four identified token artifacts—two current files and their `bak-20260823-refreshtest` copies—must all report mode `600`. The operation addresses them by basename from their existing private directory and never emits file contents.

### Release identity

The commit pushed to `origin/main`, the `--commit-hash` attached to the Cloudflare Pages deployment, and the locally tested `HEAD` must be the same SHA. Any mismatch aborts publication.

---

## Task 1: Add Failing Legal-Page Factual Contracts

**Files:**

- Create: `apps/web/src/pages/legal-pages.test.ts`
- Modify: `tests/e2e/route-coverage.spec.ts`
- Modify: `tests/e2e/page-metadata.spec.ts`

**Success criterion:** Focused tests fail against the current draft specifically because the Privacy page still contains contradicted claims, while route identity, metadata, footer, and sitemap assertions define the complete legal-page contract.

- [ ] **Step 1: Read the route pages and existing test patterns**

Read `apps/web/src/pages/privacy/index.astro`, `apps/web/src/pages/terms/index.astro`, `tests/e2e/route-coverage.spec.ts`, `tests/e2e/page-metadata.spec.ts`, and `apps/web/src/data/content-inventory.test.ts` completely. Confirm no concurrent edits appeared with `git status --short` and `git diff --check`.

- [ ] **Step 2: Create the source-level negative contract**

Add `apps/web/src/pages/legal-pages.test.ts` with normalized-whitespace assertions. Use this complete shape:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const privacySource = readFileSync(
	new URL("./privacy/index.astro", import.meta.url),
	"utf8",
).replace(/\s+/g, " ");

describe("legal page factual contracts", () => {
	it("describes the active Cloudflare services without categorical no-collection claims", () => {
		expect(privacySource).toContain("Cloudflare Web Analytics");
		expect(privacySource).toContain("cookie-free performance beacon");
		expect(privacySource).toContain("email-obfuscation script");

		for (const contradictedClaim of [
			"this website collects nothing about you",
			"sends no data about your visit anywhere",
			"There is no analytics",
			"it does not track anything",
		]) {
			expect(privacySource.toLowerCase()).not.toContain(
				contradictedClaim.toLowerCase(),
			);
		}
	});

	it("states the provider-granted Google capabilities and avoids unsupported promises", () => {
		expect(privacySource).toContain("compose and send messages");
		expect(privacySource).toContain("restore messages from Trash");
		expect(privacySource).toContain("share and permanently delete calendars");
		expect(privacySource).toContain("immediate permanent deletion that bypasses Trash");

		for (const unsupportedClaim of [
			"cannot send mail as him",
			"readable only by his own account",
			"not used to train, fine-tune, or improve any machine learning or AI model",
			"deleted on request",
			"cached copies are overwritten as they refresh",
		]) {
			expect(privacySource.toLowerCase()).not.toContain(
				unsupportedClaim.toLowerCase(),
			);
		}
	});
});
```

- [ ] **Step 3: Extend route coverage with legal page identity and rendered-copy assertions**

Add these two entries to `implementedRoutes` in `tests/e2e/route-coverage.spec.ts`:

```ts
{
	path: "/privacy/",
	heading: /What this site and the personal Google tool process/i,
	marker: /Cloudflare Web Analytics/i,
},
{
	path: "/terms/",
	heading: /Short terms for a personal site/i,
	marker: /Provided as-is/i,
},
```

Add a `@legal` test that loads `/`, checks the footer links to `/privacy/` and `/terms/`, requests `/sitemap-index.xml`, and asserts each absolute legal URL occurs exactly once. Add another `@legal` test that loads `/privacy/`, asserts the main content includes `Cloudflare Web Analytics` and `compose and send messages`, and asserts it does not contain `/collects nothing|cannot send mail|readable only by his own account/i`.

- [ ] **Step 4: Extend metadata coverage**

Add Privacy and Terms to `socialImageRoutes`. Add a `@legal` test that checks each page's canonical, `og:url`, and `meta[name="robots"]` against `routeInventoryById`-equivalent expected values:

```ts
const legalRoutes = [
	{ path: "/privacy/", title: "Privacy Policy | Joe Poznanski" },
	{ path: "/terms/", title: "Terms of Service | Joe Poznanski" },
] as const;
```

For each entry, assert the document title, canonical `${expectedSiteUrl}${path}`, Open Graph URL, non-empty description, and `index,follow` robots content.

- [ ] **Step 5: Observe the expected red state**

Run:

```powershell
pnpm exec vitest run apps/web/src/pages/legal-pages.test.ts apps/web/src/data/content-inventory.test.ts
pnpm exec playwright test tests/e2e/route-coverage.spec.ts tests/e2e/page-metadata.spec.ts
```

Expected: the source test and rendered Privacy-copy assertion fail on the contradicted analytics/Gmail/storage wording. If they do not fail for that reason, strengthen only the missing factual assertion before proceeding.

## Task 2: Correct The Public Privacy Page And Legal Route Integration

**Files:**

- Modify: `apps/web/src/pages/privacy/index.astro`
- Review/preserve: `apps/web/src/pages/terms/index.astro`
- Review/preserve: `apps/web/src/components/SiteFooter.astro`
- Review/preserve: `apps/web/src/data/site-navigation.ts`
- Review/preserve: `apps/web/src/data/routes.ts`
- Review/preserve: `apps/web/src/data/content-inventory.ts`
- Review/preserve: `apps/web/src/data/content-inventory.test.ts`
- Review/preserve: `apps/web/src/pages/sitemap-index.xml.ts`

**Success criterion:** The public copy matches the approved design, both routes remain integrated and indexable, and every focused legal-page test passes without changing unrelated content or styles.

- [ ] **Step 1: Replace the categorical website summary**

Change the Privacy H1 to `What this site and the personal Google tool process.` and change the lede to:

```astro
<p class="legal-lede">
	Short version: this static portfolio has no account, contact form, comment
	system, or first-party visitor database. Cloudflare serves and protects the
	site, runs cookie-free Web Analytics, and decodes the published email address.
	The second half of this page covers a separate personal tool that connects to
	the operator's own Google account.
</p>
```

Rename the website section to `What this website and its host process`. Replace the `Nothing` callout with: `This site does not ask visitors to create an account or submit personal information through the site itself.`

- [ ] **Step 2: Replace the website-processing list and Cloudflare paragraphs**

Use copy that states all of the following, without broader promises:

```astro
<ul>
	<li>The Astro pages are pre-rendered static files.</li>
	<li>There is no contact form, login, account, comment system, advertising pixel, or first-party visitor database.</li>
	<li>The site's own code does not write cookies, <code>localStorage</code>, or <code>sessionStorage</code>.</li>
	<li>Contact happens through direct email or the linked social profiles, on the visitor's initiative.</li>
</ul>
```

Then state that Cloudflare processes request metadata such as IP address, requested URL, and user-agent to deliver and protect the site. Add a distinct Web Analytics paragraph containing this exact capability boundary:

```text
Cloudflare Web Analytics adds a cookie-free performance beacon. Cloudflare says those metrics do not use cookies or localStorage. The service records performance timing and aggregate dimensions such as page path, referrer host, country, device type, browser, and operating system. Cloudflare controls that processing and its retention under Cloudflare's current documentation and privacy terms.
```

Add a separate email-obfuscation paragraph containing `Cloudflare's email-obfuscation script decodes published email addresses in the browser`. Do not claim that script or the wider Cloudflare service “does not track anything.” Link the four official Cloudflare documentation URLs already recorded in the approved spec.

- [ ] **Step 3: Correct the Google scope capability descriptions**

Keep the exact scope names. Replace the Calendar description with wording that says the granted scope can `view, edit, share and permanently delete calendars the account can access`, followed by a separate sentence that the personal workflow uses it to inspect and manage the operator's own events.

Replace the Gmail description with wording that says the granted scope can `read, compose and send messages; apply and remove labels; archive messages; move messages to Trash; and restore messages from Trash`. State that it does not allow `immediate permanent deletion that bypasses Trash`.

Keep the statement that `https://mail.google.com/` is not requested, and explain that this broader scope is required for immediate permanent deletion. Remove categorical claims about Drive, Contacts, Photos, or location unless live client evidence proves they apply to this exact OAuth client.

- [ ] **Step 4: Narrow AI transfer, storage, retention, and deletion wording**

Replace the data-handling list with supportable statements:

- the operator uses retrieved data for his own calendar and mail tasks;
- the operator does not sell it or use it for advertising;
- the specific content needed for a requested task may be transmitted to the AI API that executes the task;
- that provider processes the transmitted content under its current service terms and retention settings; and
- Google's verification guidance treats the Calendar scope as sensitive and `gmail.modify` as restricted, even when the personal workflow uses a narrower subset.

Replace the token paragraph with exactly this durable boundary: `Access tokens are stored on hardware the operator controls. They can be revoked through Google Account permissions.` Remove exclusivity, backup, bulk-export, automatic-cache-disposal, model-training, and deletion-on-request promises.

Rewrite the retention section to distinguish Cloudflare-controlled request/analytics retention, ordinary direct-email correspondence, and the personal Google automation. Say that retention for Cloudflare is governed by Cloudflare, email remains in the mailbox until the operator manages it, and revocation stops future Google API access. Do not promise automatic deletion or a fixed cache lifetime.

- [ ] **Step 5: Preserve the Terms page and route plumbing unless a focused test proves a defect**

Review the pre-existing Terms, footer, route inventory, content inventory, navigation, and sitemap edits against the Interfaces section. Change only a mismatched title, path, robots value, duplicate URL, inaccessible label, or test-proven defect. Do not extract a shared legal-page style component in this release.

- [ ] **Step 6: Run the focused green checks**

Run:

```powershell
pnpm exec vitest run apps/web/src/pages/legal-pages.test.ts apps/web/src/data/content-inventory.test.ts
pnpm exec playwright test tests/e2e/route-coverage.spec.ts tests/e2e/page-metadata.spec.ts
git diff --check
```

Expected: all focused tests pass. Inspect the diff and verify every changed line maps to the approved policy or legal-route integration.

- [ ] **Step 7: Commit the public legal-page unit**

Stage only the page, navigation, route, inventory, sitemap, footer, and their focused tests. Review with `git diff --cached --check` and `git diff --cached`. Commit:

```powershell
git commit -m "feat: add accurate privacy and terms pages"
```

## Task 3: Reconcile The Practical Privacy Document And Contract

**Files:**

- Modify: `scripts/privacy-doc-contract.test.mjs`
- Modify: `docs/PRIVACY.md`

**Success criterion:** The repository privacy summary describes the current static portfolio and direct-contact behavior, its test rejects the stale contact/API/events narrative, and the focused Node contract passes.

- [ ] **Step 1: Replace stale positive expectations with current-site expectations**

In `scripts/privacy-doc-contract.test.mjs`, retain the README index check, date-shape check, private-path/secret guards, and unsupported legal-compliance guards. Replace the current-contact/API/event expectations with these required current facts:

```js
expectAll(content, [
	"## Current Public Site",
	"static Astro site",
	"does not expose a contact form",
	"direct email and linked social profiles",
	"Cloudflare Web Analytics",
	"cookie-free performance beacon",
	"Cloudflare's email-obfuscation script",
	"## Personal Google Automation",
	"https://www.googleapis.com/auth/calendar",
	"https://www.googleapis.com/auth/gmail.modify",
	"Access tokens are stored on hardware the operator controls.",
	"## Implementation Review",
	"apps/web/src/pages/privacy/index.astro",
	"apps/web/src/pages/contact/index.astro",
]);
```

Add a loop that rejects stale current-state claims and paths:

```js
for (const staleCurrentClaim of [
	"`POST /api/contact`",
	"`POST /api/events`",
	"`HK_API_CONTACT_DELIVERY_MODE=store`",
	"`HK_API_EVENT_LOGGING_ENABLED`",
	"`apps/web/src/components/ContactForm.astro`",
]) {
	assert.ok(
		!content.includes(staleCurrentClaim),
		`privacy doc should not describe removed current behavior: ${staleCurrentClaim}`,
	);
}
```

Delete the `privacy and operations docs align contact storage retention boundaries` test and the local-resume-publication test because neither describes this document's current responsibility. Narrow `events docs do not imply a shipped analytics provider, sink, or retention policy` to `docs/ARCHITECTURE.md` and `docs/OPERATIONS.md` only; that contract concerns the optional first-party events API, not the active Cloudflare edge beacon. Remove `docs/PRIVACY.md` from that test's loops. Do not change `docs/ARCHITECTURE.md` or `docs/OPERATIONS.md`; those may retain explicitly future/optional backend architecture, but `docs/PRIVACY.md` must not describe it as shipped.

- [ ] **Step 2: Observe the expected contract failure**

Run:

```powershell
node --test scripts/privacy-doc-contract.test.mjs
```

Expected: failure because `docs/PRIVACY.md` still describes the removed form/API/events behavior and lacks the current Cloudflare/Google statements.

- [ ] **Step 3: Rewrite the practical privacy summary narrowly**

Keep the title `# HumanKaylee Portfolio Privacy Notes`, the date, the warning that it is not legal advice, and the public-safety guards. Replace the operational body with these sections:

1. `## Current Public Site` — static Astro pages; no public form, login, account, comments, or first-party client storage; direct email/social contact only.
2. `## Cloudflare Processing` — ordinary request metadata, Web Analytics' cookie-free beacon and aggregate dimensions, and separate email-obfuscation behavior.
3. `## Personal Google Automation` — exact Calendar and Gmail scopes, provider capability versus narrower workflow, task-specific AI API transfer, and revocation.
4. `## Retention And Storage` — Cloudflare-controlled retention, ordinary mailbox correspondence, and tokens on operator-controlled hardware without backup/exclusivity promises.
5. `## Privacy Contact` — direct channels on `/contact/`.
6. `## Implementation Review` — current page, contact route, footer/navigation, route inventory, sitemap, and the legal-page tests.

The document must not claim GDPR, HIPAA, or CCPA compliance; expose a private path; state that no analytics exist; or describe the optional Rust contact/events API as current production behavior.

- [ ] **Step 4: Run the focused green contract and diff guard**

Run:

```powershell
node --test scripts/privacy-doc-contract.test.mjs
git diff --check
```

Expected: all privacy-document contract tests pass.

- [ ] **Step 5: Commit the documentation unit**

Stage only `docs/PRIVACY.md` and `scripts/privacy-doc-contract.test.mjs`, inspect the cached diff, and commit:

```powershell
git commit -m "docs: align privacy notes with the static site"
```

## Task 4: Harden The Identified Google Token File Modes

**Files:**

- Modify outside Git: the four already-identified token artifacts in their existing private WSL directory
- Do not modify: token contents, OAuth client configuration, credentials, or repository files

**Success criterion:** A metadata-only check reports mode `600` for all four basenames before any later release claim, and no secret or absolute private path appears in Git or captured release evidence.

- [ ] **Step 1: Run the metadata-only red check**

From PowerShell, run this WSL command. It changes into the existing private directory through the WSL account's own home expansion, emits basenames and modes only, and exits nonzero if any file is not `600`:

```powershell
wsl.exe -d Ubuntu -- bash -lc 'cd "$HOME/clawd/scripts" && status=0; for file in calendar_token.json calendar_token_rw.json calendar_token.json.bak-20260823-refreshtest calendar_token_rw.json.bak-20260823-refreshtest; do mode=$(stat -c "%a" -- "$file") || exit 2; printf "%s %s\n" "$file" "$mode"; [ "$mode" = 600 ] || status=1; done; exit $status'
```

Expected: nonzero because at least the two current files were observed at `0644`. Do not open a file to investigate any mismatch.

- [ ] **Step 2: Apply the minimum permission change**

Run:

```powershell
wsl.exe -d Ubuntu -- bash -lc 'cd "$HOME/clawd/scripts" && chmod 600 -- calendar_token.json calendar_token_rw.json calendar_token.json.bak-20260823-refreshtest calendar_token_rw.json.bak-20260823-refreshtest'
```

This is the only authorized token mutation. Do not rotate, reauthenticate, rename, copy, or delete anything.

- [ ] **Step 3: Run the metadata-only green check**

Repeat Step 1. Expected: exit `0`, with all four basenames reporting `600`. Record only the aggregate result `4/4 owner-only mode checks passed`; do not copy absolute paths or owner/account names into public evidence.

- [ ] **Step 4: Confirm Git remained untouched by the operational action**

Run `git status --short` in the portfolio clone and confirm it shows only the intended repository work.

## Task 5: Resolve The No-WebGL Gate And Perform Visual Review

**Files:**

- Inspect: `tests/e2e/no-webgl.spec.ts`
- Inspect: `tests/e2e/no-webgl.spec.ts-snapshots/no-webgl-signal-proof-home-linux.png`
- Modify only if visually justified: `tests/e2e/no-webgl.spec.ts-snapshots/no-webgl-signal-proof-home-linux.png`
- Temporary only: `test-results/`

**Success criterion:** Expected, actual, and diff images are visually inspected together on Linux; any golden change is explicitly justified by intended content rather than CI pressure; and the no-WebGL test passes afterward.

- [ ] **Step 1: Preserve the external failure evidence**

Run:

```powershell
gh pr view 75 --repo HumanKaylee/humankaylee-portfolio --json state,headRefOid,mergeStateStatus,statusCheckRollup
gh run view 32658794831 --repo HumanKaylee/humankaylee-portfolio --job 97241673398 --log-failed
```

Confirm the historical failure is the no-WebGL screenshot at 136,682 differing pixels, not a semantic assertion failure. Treat these IDs as historical evidence only; current local and new `main` CI results are authoritative for release.

- [ ] **Step 2: Reproduce the Linux snapshot comparison without updating it**

Use WSL so Playwright selects the Linux golden:

```powershell
wsl.exe -d Ubuntu --cd "$(Get-Location)" -- bash -lc 'corepack pnpm exec playwright test tests/e2e/no-webgl.spec.ts'
```

If WSL cannot run the repository dependency tree, use a temporary clean Linux worktree or the next GitHub CI run; do not substitute the Windows snapshot as Linux proof. Preserve the expected, generated actual, and generated diff PNGs under ignored `test-results/`.

- [ ] **Step 3: Inspect the three images together**

Open the expected Linux PNG, actual PNG, and diff PNG with the image viewer. Verify the actual image contains the intended current Signal/Proof homepage, the shipped Conformal Cooling content, readable proof cards, no canvas/SVG fallback artifact, no clipped text, and no unexpected spacing or asset failure.

Decision gate:

- If the actual image exposes a defect, fix the smallest source defect, add or strengthen a semantic assertion that would catch it, rerun the failing test, and do not update the golden.
- If the actual image is the intended current design and the old golden is stale, run the update command in Step 4 and document the visual reason in the commit body.

- [ ] **Step 4: Update only a confirmed stale Linux golden**

Only after the visual decision gate passes, run:

```powershell
wsl.exe -d Ubuntu --cd "$(Get-Location)" -- bash -lc 'corepack pnpm exec playwright test tests/e2e/no-webgl.spec.ts --update-snapshots'
```

Inspect the resulting Linux golden again. Confirm the Windows golden is unchanged.

- [ ] **Step 5: Run desktop and mobile legal-page visual QA**

Start the local Astro server and inspect Home, Privacy, Terms, and Contact at 1440×1100 and 390×844 in the browser. Check legibility, focus order, legal footer wrapping, 44px touch targets, long scope strings, external-link behavior, and horizontal overflow. Also run:

```powershell
pnpm exec playwright test tests/e2e/route-coverage.spec.ts tests/e2e/page-metadata.spec.ts tests/e2e/no-webgl.spec.ts
```

Do not infer usability from test status alone; visually inspect each legal page at both sizes.

- [ ] **Step 6: Commit a justified visual or product correction separately**

If and only if Task 5 changed a snapshot or source file, stage just those files, inspect the cached diff, and commit with one of:

```powershell
git commit -m "test: refresh verified no-WebGL homepage snapshot"
git commit -m "fix: preserve intended no-WebGL homepage fallback"
```

If no file changed and the check passes, make no empty commit.

## Task 6: Run The Complete Local Release Gates

**Files:**

- No planned source changes
- Temporary/ignored output: `dist/`, `test-results/`, Playwright output

**Success criterion:** Every required frontend and Rust gate passes against one clean commit; skipped or unavailable checks are named and block publication if they cover a release requirement.

- [ ] **Step 1: Verify the working tree and patch shape**

Run:

```powershell
git status --short --branch
git diff --check
git log --oneline --decorate -5
```

Expected: no unstaged or untracked source changes. If a scoped change remains, either commit it in the correct prior task or stop and review it; never deploy with `--commit-dirty=true`.

- [ ] **Step 2: Run frontend static gates**

Run each separately and preserve exit status:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm bundle:budget
```

Expected: all pass. The build must emit `dist/privacy/index.html` and `dist/terms/index.html`.

- [ ] **Step 3: Prove built legal-page identity**

Inspect the built HTML, not only source. Assert Privacy and Terms each have their own title, H1, canonical, description, robots metadata, and footer links; assert `dist/sitemap-index.xml` contains both canonical URLs exactly once. Assert the built Privacy page includes `Cloudflare Web Analytics` and does not include the contradicted phrases from Task 1.

- [ ] **Step 4: Run the relevant browser gates**

Run:

```powershell
pnpm test:e2e -- --grep "@legal|@quality|@no-webgl"
pnpm test:e2e -- --grep "@static-shell|@static-runtime|@api-down"
pnpm test:e2e -- --grep "@responsive" --browser=all
```

Then run the complete Playwright suite:

```powershell
pnpm test:e2e
```

Expected: all required tests pass. Report the exact pass/skip counts; investigate every unexpected skip.

- [ ] **Step 5: Run Rust gates without changing backend code**

Run:

```powershell
cargo fmt --manifest-path apps/api/Cargo.toml --check
cargo clippy --manifest-path apps/api/Cargo.toml --all-targets --all-features -- -D warnings
cargo test --manifest-path apps/api/Cargo.toml
```

Expected: all pass. If a failure is pre-existing and unrelated, publication remains blocked until the user decides whether that release gate may be narrowed; do not silently waive it.

- [ ] **Step 6: Run launch-readiness and security-boundary checks**

Run:

```powershell
pnpm phase7:provider-preflight -- --summary test-results/phase-7-provider-preflight.json
pnpm phase7:launch-audit -- --summary test-results/phase-7-launch-readiness-audit.json
```

The historical project-wide audit may still report unresolved API/contact/redaction gates. Record that honestly. For this already-live static portfolio's legal-page release, the blocking release criteria are the approved spec's exact frontend, route, policy, token, deployment, and rollback checks; do not close unrelated backlog issues.

- [ ] **Step 7: Perform final secret and private-path review**

Run a staged/committed diff scan for credential assignments, absolute user paths, token values, and private IPs. Inspect every match manually. Basenames in the operational instructions are acceptable; no secret value or absolute private path is.

## Task 7: Push The Verified Feature Commit And Fast-Forward Main

**Files:**

- Git refs only

**Success criterion:** The exact clean, locally verified SHA is present at both `origin/feat/privacy-and-terms` and `origin/main`, with no force push and no unrelated dirty-checkout changes.

- [ ] **Step 1: Capture the release SHA and recheck clean state**

Run:

```powershell
$releaseSha = (git rev-parse HEAD).Trim()
git status --porcelain=v1
git merge-base --is-ancestor origin/main $releaseSha
```

Expected: empty status and exit `0` from the ancestry check.

- [ ] **Step 2: Push and verify the feature branch**

Run:

```powershell
git push -u origin feat/privacy-and-terms
$featureRemoteSha = (git ls-remote origin refs/heads/feat/privacy-and-terms).Split("`t")[0]
if ($featureRemoteSha -ne $releaseSha) { throw "feature branch SHA mismatch" }
```

- [ ] **Step 3: Fetch and revalidate the fast-forward immediately before main update**

Run:

```powershell
git fetch origin main
git merge-base --is-ancestor origin/main $releaseSha
```

If this exits nonzero, stop: `main` moved and must be reviewed/rebased before publication. Do not force push.

- [ ] **Step 4: Fast-forward remote main and verify identity**

Run:

```powershell
git push origin $releaseSha`:refs/heads/main
$mainRemoteSha = (git ls-remote origin refs/heads/main).Split("`t")[0]
if ($mainRemoteSha -ne $releaseSha) { throw "main SHA mismatch" }
```

- [ ] **Step 5: Inspect GitHub checks for the exact SHA**

Use `gh run list --repo HumanKaylee/humankaylee-portfolio --branch main --limit 10` and `gh run view` for runs whose `headSha` equals `$releaseSha`. Required source verification checks must pass. If the Cloudflare deploy workflow fails only because its two configured secrets are absent, record that separately and proceed to the already-approved direct Wrangler path only after local provider authentication is confirmed.

## Task 8: Deploy The Exact Main Artifact To Cloudflare Pages

**Files:**

- Built artifact: `dist/`
- User-facing evidence outside Git: `portfolio-privacy-terms-release-evidence.md` in the active Codex thread's designated outputs directory

**Success criterion:** Cloudflare production associates the deployment with the exact tested `origin/main` SHA, the previous deployment remains a rollback target, and the deployment ID/URL are captured without exposing provider account details.

- [ ] **Step 1: Confirm provider authentication without creating credentials**

Run `pnpm exec wrangler whoami`. If it is already authenticated for the existing `humankaylee-portfolio` project, continue. If not, pause for Joe's interactive Cloudflare authorization; do not create an API token, set GitHub secrets, or persist new credentials autonomously.

- [ ] **Step 2: Record and behaviorally check the pre-release rollback candidate**

List production deployments:

```powershell
pnpm exec wrangler pages deployment list --project-name=humankaylee-portfolio --environment=production
```

Record the current production deployment ID. Check the historical candidate `5a987fa6-6558-45cb-99d7-c50dad92f9a0` only if it is still listed/reachable, and verify its homepage title/H1 rather than relying on HTTP 200. Prefer the newest provider-confirmed, behaviorally correct production deployment as the rollback target.

- [ ] **Step 3: Rebuild from the exact clean remote-main commit**

Run:

```powershell
git fetch origin main
$releaseSha = (git rev-parse HEAD).Trim()
$mainRemoteSha = (git rev-parse origin/main).Trim()
if ($releaseSha -ne $mainRemoteSha) { throw "local HEAD is not origin/main" }
if (git status --porcelain=v1) { throw "dirty tree cannot be deployed" }
pnpm install --frozen-lockfile
pnpm build
```

Recheck the built legal-page identity from Task 6 after this clean rebuild.

- [ ] **Step 4: Publish the exact artifact**

Run:

```powershell
pnpm exec wrangler pages deploy dist --project-name=humankaylee-portfolio --branch=main --commit-hash=$releaseSha --commit-dirty=false
```

Capture the deployment ID and deployment URL from Wrangler output, but do not copy account IDs or authentication details into release evidence.

- [ ] **Step 5: Confirm provider association**

Run the production deployment list again. Verify the newest production record's source commit equals `$releaseSha` and retain the previously recorded deployment as rollback. If association is ambiguous, stop before claiming publication.

## Task 9: Verify Production And Preserve Rollback Evidence

**Files:**

- Create/update outside Git: `portfolio-privacy-terms-release-evidence.md` in the active Codex thread's designated outputs directory
- No planned repository source changes

**Success criterion:** Public route identity, navigation, sitemap, security headers, representative pages, browser console, real WASM interaction, and rollback reachability pass; otherwise the previous known-good deployment is restored and verified.

- [ ] **Step 1: Verify Privacy and Terms identity from the public origin**

For `https://joepoznanski.io/privacy/` and `/terms/`, verify status 200 plus distinct title, H1, canonical, description, Open Graph URL, and `index,follow` robots metadata. Confirm Privacy includes Cloudflare Web Analytics and accurate Calendar/Gmail capability wording. Confirm neither route serves the homepage fallback.

- [ ] **Step 2: Verify discovery surfaces**

Check that Home and Contact expose working Privacy and Terms links. Fetch `/sitemap-index.xml` and confirm both absolute canonical URLs occur exactly once. Check `/robots.txt` does not disallow either route.

- [ ] **Step 3: Run the representative route smoke matrix**

Verify route-specific identity for Home, Work, Cryo Flow, Conformal Cooling, Black-Scholes WASM, About, Resume, Contact, Notes, and the résumé PDF. Verify intended retired routes and alternate hostnames still redirect or remain retired according to existing contracts.

- [ ] **Step 4: Verify production security headers**

On representative HTML routes, assert the deployed response still includes the intended CSP, `Cross-Origin-Opener-Policy`, `X-Frame-Options`, and referrer policy. Check that Cloudflare's Web Analytics and email-obfuscation behavior visible in delivered HTML matches the disclosure.

- [ ] **Step 5: Run browser console and responsive checks**

Inspect Home, Privacy, Terms, Contact, and Black-Scholes in desktop and mobile browser sizes. Require no unexpected console errors, horizontal overflow, clipped scope strings, unusable legal footer links, or broken focus order.

- [ ] **Step 6: Prove the Black-Scholes WASM path with a real input change**

Load the production demo, record its displayed result, change a real numeric input, trigger recalculation, and verify the displayed result changes. A loaded page or mocked value is not sufficient.

- [ ] **Step 7: Verify rollback reachability and define the failure action**

Verify the retained rollback deployment's homepage identity. If any critical policy route, header, résumé asset, or WASM behavior fails, redeploy the retained known-good Git artifact or use the provider dashboard's supported production rollback control, then rerun Steps 1–6 against the restored primary domain. Wrangler 4.123.0 does not expose a `pages deployment rollback` CLI command, so do not follow that stale runbook command blindly.

- [ ] **Step 8: Write the public-safe release evidence**

Create the output Markdown file with:

- release SHA;
- feature and main remote SHA equality;
- Cloudflare deployment ID and public URL;
- previous deployment/rollback ID;
- timestamps and pass/fail status for each live matrix area;
- exact test counts and any skips;
- token permission result as only `4/4 owner-only mode checks passed`; and
- any blocker or rollback action.

Do not include account IDs, token values, absolute private paths, raw provider logs, or personal OAuth identifiers.

- [ ] **Step 9: Final completion check**

Run `git status --short --branch`, verify local `HEAD`, `origin/feat/privacy-and-terms`, and `origin/main` all equal the recorded release SHA, and re-fetch both public legal pages once more. Completion requires all acceptance criteria from the approved spec; otherwise report the precise remaining blocker without calling the release complete.
