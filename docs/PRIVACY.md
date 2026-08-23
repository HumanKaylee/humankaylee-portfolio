# HumanKaylee Portfolio Privacy Notes

Date: 2026-08-23
Status: Current implementation summary

This document describes the portfolio as it behaves today. It is a practical
summary, not a legal privacy policy, and it does not promise behavior that has
not been implemented yet.

## Current Public Site

The public portfolio is a static Astro site. It does not expose a contact form,
login, account, comment system, or first-party client storage. The site's own
code does not write cookies, `localStorage`, or `sessionStorage`.

Visitors contact the operator through direct email and linked social profiles
on the public contact route. An email sent through that direct channel reaches
an ordinary mailbox, where the operator can read it and decide whether to
reply.

## Cloudflare Processing

Cloudflare serves and protects the site, processing ordinary request metadata
such as IP address, requested URL, and user agent for that purpose.

Cloudflare Web Analytics adds a cookie-free performance beacon. Cloudflare
describes the resulting metrics as cookie- and localStorage-free and records
performance timing with aggregate dimensions such as page path, referrer host,
country, device type, browser, and operating system. Cloudflare controls this
processing and its retention under its current documentation and privacy terms.

Cloudflare's email-obfuscation script separately decodes published email
addresses in the visitor's browser.

## Personal Google Automation

This section describes separate, single-user personal automation for the
operator's own Google account; it is not part of the public website. The
application requests these two Google scopes:

- `https://www.googleapis.com/auth/calendar` can view, edit, share, and
  permanently delete calendars the authorized account can access. The personal
  workflow uses it to inspect and manage the operator's own events.
- `https://www.googleapis.com/auth/gmail.modify` can read, compose, and send
  messages; apply and remove labels; archive messages; move messages to Trash;
  and restore messages from Trash. It does not allow immediate permanent
  deletion that bypasses Trash.

Those provider-granted capabilities are broader than the narrower personal
workflow. Calendar access is used for the operator's events, and Gmail access
is used for the operator's mail tasks. The specific content needed for a
requested task may be transferred to the AI API that executes that task; that
provider processes transmitted content under its current service terms and
retention settings.

Access tokens are stored on hardware the operator controls. The operator can
revoke access through Google Account permissions, which stops future Google API
access.

## Retention And Storage

Cloudflare controls retention of request and analytics data under its current
documentation and privacy terms. Direct-email correspondence remains in the
ordinary mailbox until the operator manages it. The personal Google automation
accesses calendar and mail data to perform the requested task; revocation stops
future Google API access.

## Privacy Contact

For privacy questions, corrections, or deletion requests, use the direct
channels listed on `/contact/`.

## Implementation Review

Reviewed against the current static implementation on 2026-08-23:

- `apps/web/src/pages/privacy/index.astro` for the public privacy page and its
  Cloudflare and Google disclosures.
- `apps/web/src/pages/contact/index.astro` for direct email and linked social
  contact channels.
- `apps/web/src/layouts/BaseLayout.astro` and
  `apps/web/src/data/site-navigation.ts` for footer and navigation links.
- `apps/web/src/data/routes.ts` for the route inventory.
- `apps/web/src/pages/sitemap-index.xml.ts` for the generated sitemap route.
- `apps/web/src/pages/legal-pages.test.ts` and
  `scripts/privacy-doc-contract.test.mjs` for the legal-page and practical
  privacy-summary contracts.
- `pnpm phase7:contact-decision` as a local decision template; it is not
  production contact evidence.
