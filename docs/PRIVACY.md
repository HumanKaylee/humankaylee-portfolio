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
- No analytics provider or storage backend is enabled by default.

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

The contact route currently validates input, enforces a request-size limit,
rejects honeypot submissions, applies an in-memory rate limit, and returns safe
response payloads. The codebase does not yet wire a durable delivery provider
or a storage layer, so do not infer message retention guarantees from the
current API shape.

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

- No durable contact storage is implemented yet.
- No analytics storage is enabled by default.
- No deletion workflow is promised for a storage provider that does not exist
  yet.

If a future provider or database is added, document the retention and deletion
story before turning it on.

## Privacy Contact

Use the public contact route at `/contact/` for privacy questions or update
requests. The page keeps the mailto fallback visible when JavaScript or the API
path is unavailable.

If a dedicated privacy contact address is introduced later, update this doc and
the contact route together.
