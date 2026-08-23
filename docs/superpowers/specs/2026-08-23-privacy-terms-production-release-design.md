# Privacy And Terms Production Release Design

**Status:** Approved in chat; written review pending
**Date:** 2026-08-23
**Production site:** `https://joepoznanski.io/`
**Source repository:** `HumanKaylee/humankaylee-portfolio`
**Implementation branch:** `feat/privacy-and-terms` from `ab4ab802bf858f5253f61b4c19fffe44b5ccf6f9`

## 1. Purpose

Publish accurate, indexable Privacy and Terms pages for Joe Poznanski's personal portfolio, align the repository's privacy documentation with the site that is actually deployed, harden the identified local Google token files without reading their contents, and release the exact verified source commit to Cloudflare Pages with a retained rollback target.

This release also provides the app-domain URLs needed for a later Google OAuth consent-screen review. It does not claim that publishing those URLs will by itself complete Google verification or make the requested scopes eligible for production use.

## 2. Current evidence

- Remote `main` is `ab4ab802bf858f5253f61b4c19fffe44b5ccf6f9`.
- The legal-page implementation is uncommitted on `feat/privacy-and-terms`.
- Production requests to `/privacy/` and `/terms/` return HTTP 200 but serve the homepage fallback: the title is `Joe Poznanski | Principal Engineer` and the canonical is `/`.
- The local static build contains distinct Privacy and Terms pages with correct titles, canonicals, footer links, and sitemap entries.
- Cloudflare currently injects both its email-obfuscation script and a Web Analytics beacon into production pages.
- Two identified original Google token files are mode `0644`; two backup copies are mode `0600`.
- `docs/PRIVACY.md` describes a contact form, API enhancement, and event path that are absent from the current static site.
- The current pull request check failure is a no-WebGL screenshot mismatch. It must be investigated visually; a golden image may change only when the received rendering is confirmed to be the intended current design.

## 3. Goals

- Serve real policy pages at `/privacy/` and `/terms/`, with their own canonical URLs and indexable metadata.
- Describe the site's current collection and hosting behavior truthfully.
- Describe Google OAuth scope capabilities accurately and distinguish provider-granted capability from the operator's narrower intended workflow.
- Remove unsupported claims about credential exclusivity, third-party backups, bulk export, deletion behavior, and model training.
- Reconcile the practical privacy summary and its contract test with the current static contact experience.
- Make the identified token files owner-only without opening, copying, logging, or reissuing credentials.
- Keep all existing portfolio routes, security headers, résumé delivery, and Black-Scholes WASM behavior working.
- Commit and push the source that is actually deployed.
- Preserve and verify a known-good rollback deployment.

## 4. Non-goals

- No legal opinion or guarantee that the pages satisfy every jurisdiction.
- No claim that Google OAuth verification, restricted-scope review, or security assessment is complete.
- No Google login, consent-screen submission, OAuth token creation, or credential rotation in this release.
- No inspection or publication of token contents, client secrets, account identifiers, or private paths.
- No contact form, analytics replacement, backend deployment, or new runtime dependency.
- No merge of the unrelated 192-path dirty canonical checkout.
- No repair of the older pull request's unrelated case-study work beyond what is necessary to understand the visual regression protecting `main`.

## 5. Chosen approach

Correct the existing static pages and related data contracts in the clean recovery clone. Retain Cloudflare Web Analytics and disclose it accurately instead of pretending the production edge does not inject it. Harden the identified token files as a separate operational step, while narrowing public wording so it does not depend on filesystem-mode claims that the site cannot continuously guarantee.

This is preferred over disabling Cloudflare Web Analytics because analytics is already active and useful, is documented by Cloudflare as cookie-free, and can be described precisely. It is preferred over publishing the current draft because the current draft contains material factual contradictions.

## 6. Required policy corrections

### 6.1 Website and Cloudflare

The Privacy page will state that:

- the portfolio is a static Astro site with no account, contact form, comment system, first-party visitor database, or first-party client storage;
- contact occurs through direct email and linked social profiles;
- Cloudflare processes ordinary request metadata needed to serve and protect the site;
- Cloudflare Web Analytics adds a cookie-free performance beacon, records performance timing and aggregate dimensions such as page path, referrer host, country, device type, browser, and operating system, and does not use cookies or `localStorage` for those metrics;
- Cloudflare's email-obfuscation script separately decodes the published email address in the browser; and
- Cloudflare's current public documentation governs Cloudflare's processing and retention.

The page will not say the website “collects nothing,” “sends no data anywhere,” or has “no analytics.”

Official references:

- `https://developers.cloudflare.com/web-analytics/about/`
- `https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/`
- `https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/`
- `https://developers.cloudflare.com/web-analytics/data-metrics/core-web-vitals/`

### 6.2 Google scopes

The Google section will name the exact requested scopes and describe their granted capabilities:

- `https://www.googleapis.com/auth/calendar` permits viewing, editing, sharing, and permanently deleting calendars the account can access.
- `https://www.googleapis.com/auth/gmail.modify` permits reading, composing, sending, labeling, archiving, trashing, and restoring Gmail messages, but does not permit immediate permanent deletion that bypasses Trash.
- `https://mail.google.com/` is not requested; that broader scope is required for immediate permanent deletion.

The page may state that the personal workflow intends to use a narrower subset, but it will not misstate what the granted scopes technically permit. It will disclose that Gmail content transmitted to an AI API is a third-party transfer for task execution and that Google's restricted-scope policy may impose verification or security-assessment requirements. It will not claim that data is never shared, never used for model improvement, or never retained unless those claims are supported by the selected provider's current contract and the live implementation.

Official references:

- `https://developers.google.com/workspace/calendar/api/auth`
- `https://developers.google.com/workspace/gmail/api/auth/scopes`
- `https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send`
- `https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/delete`

### 6.3 Credentials, retention, and deletion

The public page will say only that access tokens are stored on hardware the operator controls and can be revoked through Google Account permissions. It will not claim that tokens are never backed up to a third party, that every cached copy is automatically overwritten, or that all token files are continuously readable by only one account.

The implementation workflow will change the two identified `0644` token files to owner-only mode and recheck the identified originals and backups using metadata-only commands. Token contents must never be printed, copied, hashed, or passed on a command line.

Retention and deletion wording will distinguish:

- Cloudflare-controlled request and analytics retention;
- ordinary email correspondence received through direct contact; and
- the operator's personal Google automation.

Unsupported promises about deletion-on-request, cache lifetime, bulk export, or automatic disposal will be removed or narrowed to behavior that can be demonstrated.

## 7. Repository changes

The implementation is limited to the existing legal-page paths and directly related contracts:

- `apps/web/src/pages/privacy/index.astro`
- `apps/web/src/pages/terms/index.astro`
- `apps/web/src/components/SiteFooter.astro`
- `apps/web/src/data/site-navigation.ts`
- `apps/web/src/data/routes.ts`
- `apps/web/src/data/content-inventory.ts`
- `apps/web/src/data/content-inventory.test.ts`
- `apps/web/src/pages/sitemap-index.xml.ts`
- `docs/PRIVACY.md`
- `scripts/privacy-doc-contract.test.mjs`

Additional test or snapshot files may change only when a failing behavioral test proves they are required by this release. No unrelated canonical-checkout changes are included.

## 8. Test strategy

Behavioral changes begin with failing tests that prove the existing implementation is wrong or incomplete. Tests will cover:

- both legal routes exist in the route inventory and are indexable;
- each route has its own title, description, canonical, and Open Graph metadata;
- footer and sitemap contain both routes;
- the Privacy page does not contain the contradicted no-analytics, no-transmission, cannot-send, or exclusive-token-access claims;
- the Privacy page names Cloudflare Web Analytics and accurately distinguishes it from email obfuscation;
- the practical privacy summary matches the static contact page and does not describe the removed contact API as current behavior; and
- negative assertions fail if the stale or incorrect claims return.

The release gates are:

- `git diff --check`
- the focused privacy/content tests while iterating;
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- the relevant Playwright route, accessibility, no-WebGL, and no-JavaScript tests;
- `cargo fmt --check`
- `cargo clippy --all-targets --all-features -- -D warnings`
- `cargo test`

Any skip, unavailable dependency, or environment-specific exception is reported explicitly and cannot be counted as a pass.

## 9. Visual regression handling

The no-WebGL screenshot failure remains a real gate. The expected, received, and diff images will be inspected together. The golden image may be updated only if the received rendering matches the intended current homepage, including the already-shipped Conformal Cooling content and the newly approved legal footer links. If the received image reveals a layout or rendering defect, production code is fixed instead.

Desktop and mobile renders of Home, Privacy, Terms, and Contact will be inspected for legibility, focus order, touch targets, long scope strings, footer layout, and narrow-screen overflow before release.

## 10. Source-control and deployment sequence

1. Commit this design document alone.
2. Implement the approved policy and documentation corrections with tests.
3. Harden and metadata-check the identified token files as a separate operational action; do not add credential paths or results to Git.
4. Run the complete local release gates and inspect the visual regression.
5. Commit only the scoped implementation paths on `feat/privacy-and-terms` and push that branch.
6. Verify the pushed commit and remote diff.
7. Fast-forward `main` to the verified implementation commit without force-pushing or merging the unrelated dirty checkout.
8. Deploy the exact `main` commit's `dist` artifact to the existing `humankaylee-portfolio` Cloudflare Pages production project.
9. If Cloudflare authentication is unavailable, pause at the authentication boundary for operator authorization; do not create tokens, change account permissions, or claim publication.
10. Record the new deployment identifier and the previous known-good production deployment as the rollback target.

The current GitHub Actions workflow references `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, but neither secret is currently configured. The release may therefore require an operator-authorized Wrangler login or an operator-managed GitHub secret setup.

## 11. Production verification

After deployment, verify from public origins:

- `/privacy/` and `/terms/` return their own titles, H1s, canonicals, descriptions, and indexable robots metadata;
- Home and Contact link to the correct legal routes;
- the sitemap contains both routes;
- the homepage, Work, Cryo Flow, Black-Scholes WASM, About, Resume, Contact, Notes, and résumé PDF continue to return their intended content;
- CSP, `Cross-Origin-Opener-Policy`, `X-Frame-Options`, and referrer-policy headers remain present;
- intended redirects and alternate domains still behave correctly;
- Cloudflare Web Analytics and email obfuscation match the published disclosure;
- the browser console is clean on representative desktop and mobile routes;
- the Black-Scholes demo changes its result after a real input change; and
- the previous known-good deployment remains reachable as a rollback candidate.

An HTTP 200 alone is not route evidence. Verification must check page identity through title, canonical, H1, or another route-specific assertion.

## 12. Rollback

The historical known-good deployment `5a987fa6-6558-45cb-99d7-c50dad92f9a0` remains the initial rollback candidate until Cloudflare provider state supplies a newer confirmed target. If any critical route, policy identity, security header, résumé asset, or WASM behavior regresses, redeploy the confirmed known-good artifact and rerun the production smoke matrix.

Rollback success requires the primary domain to serve the known-good identity and behavior; a reachable deployment URL alone is insufficient.

## 13. Acceptance criteria

The release is complete only when:

- the public policy wording matches verified site, Cloudflare, Google-scope, and credential-storage facts;
- identified token originals and backups have owner-only permissions where supported, with no credential content exposed;
- the stale practical privacy document and its contract test match the current static site;
- focused negative tests and the complete local release gates pass;
- the no-WebGL visual difference is resolved through a verified product fix or an explicitly justified golden update;
- the implementation commit is present on the feature branch and remote `main`;
- Cloudflare production serves the exact tested commit;
- real Privacy and Terms page identities, footer links, sitemap entries, headers, representative routes, console, and WASM interaction pass live verification; and
- a reachable, behaviorally verified rollback target is recorded.

## 14. Principal tradeoff

The release favors narrow, technically supportable statements over categorical privacy promises. The policy becomes less rhetorically absolute, but it remains accurate when Cloudflare injects analytics, when OAuth scopes grant more capability than the personal workflow uses, and when external provider behavior can change outside this repository.
