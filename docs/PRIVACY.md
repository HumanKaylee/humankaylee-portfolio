# HumanKaylee Portfolio Privacy Notes

Date: 2026-05-23
Status: Current implementation summary

This document describes the portfolio as it behaves today. It is a practical
summary, not a legal privacy policy, and it does not promise behavior that has
not been implemented yet.

## Scope

- The public site is a static Astro build.
- The resume is published as a static PDF asset.
- The contact route uses a visible mailto fallback and an API enhancement when
  JavaScript is available.
- Events exist behind an opt-in API flag and are disabled by default.
- No analytics provider is enabled by default.
- Contact storage is disabled by default unless the API is explicitly
  configured with durable local storage.

## What The Site Collects

The only user-submitted data path in the current implementation is the contact
form. When a visitor sends a message, the form includes:

- `name`
- `email`
- `subject`
- `message`
- `company` as a hidden honeypot field

The `company` field is not meant for real contact data. It is present so the
API can reject obvious spam submissions.

The contact route validates input, enforces a request-size limit, rejects
honeypot submissions, applies an in-memory rate limit, and returns safe
response payloads. When `HK_API_CONTACT_DELIVERY_MODE=store` is enabled, the
API also requires `HK_API_CONTACT_STORE_PATH` before accepting messages and
appends accepted submissions to a JSONL file at that path. The response still
does not echo message bodies, headers, IP addresses, or honeypot values.

If the API is unavailable or disabled, the page keeps the mailto fallback
visible so visitors can still use the static contact path.

## Events And Analytics

`POST /api/events` exists for privacy-safe event plumbing, but it is disabled by
default.

Current behavior:

- `PUBLIC_ANALYTICS_ENABLED` is not required for the static site to work.
- `HK_API_EVENT_LOGGING_ENABLED` defaults to `false`.
- Only allowlisted event names are accepted when events are enabled.
- The current repository does not ship an analytics provider, event sink, or
  retention policy for enabled events.

In practice, that means the portfolio ships without analytics unless someone
explicitly configures and reviews a future provider path.

## Public Data And Redaction

Public pages are intended to contain only intentionally published material. The
review standard is redaction, not broad legal anonymization.

Before publishing or linking public artifacts, remove or generalize:

- Secrets, tokens, API keys, and credentials.
- Private hostnames, internal URLs, and account identifiers.
- Client data, unpublished metrics, and operational logs.
- Personal data that is not needed to explain the work.
- Screenshots or transcripts that expose the items above.

The same standard applies to case studies, notes, screenshots, runbook excerpts,
and the resume PDF source material.

## Retention And Storage

Current retention posture:

- Contact storage is off by default.
- If `store` mode is enabled, accepted contact submissions are stored in the
  configured JSONL file until that backend host or operator deletes, rotates, or
  exports the file.
- No analytics storage is enabled by default.
- No public deletion workflow is promised until production contact handling is
  finalized.

Before production launch, choose whether this JSONL store is acceptable for the
selected host. If a future provider or database is added, document the retention
and deletion story before turning it on.

## Privacy Contact

Use the public contact route at `/contact/` for privacy questions or update
requests. The page keeps the mailto fallback visible when JavaScript or the API
path is unavailable.

If a dedicated privacy contact address is introduced later, update this doc and
the contact route together.
