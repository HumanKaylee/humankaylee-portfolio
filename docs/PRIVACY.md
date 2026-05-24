# HumanKaylee Portfolio Privacy Notes

Date: 2026-05-24
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

HumanKaylee uses the `name`, `email`, `subject`, and `message` fields to
review the inquiry and reply. The implementation does not use the contact form
for newsletter signup, account creation, or analytics profiling.

The `company` field is not meant for real contact data. It is present so the
API can reject obvious spam submissions.

The contact route validates input, enforces a request-size limit, rejects
honeypot submissions, applies an in-memory rate limit, and returns safe
response payloads. When `HK_API_CONTACT_DELIVERY_MODE=store` is enabled, the
API also requires `HK_API_CONTACT_STORE_PATH` before accepting messages and
appends accepted submissions to a JSONL file at that path. The response still
does not echo message bodies, headers, IP addresses, or honeypot values.

For rate limiting, the API's in-memory rate limit tracks a temporary
abuse-control key from the normalized sender email address. The API does not
trust forwarded client IP headers by default because no trusted proxy boundary
has been approved. The key is used to evaluate an hourly rate-limit window, is
kept only in running API process memory, and is not written to the contact JSONL
record.

If the API is unavailable or disabled, the page keeps the mailto fallback
visible so visitors can still use the static contact path.

## Events And Analytics

`POST /api/events` exists for privacy-safe event plumbing, but it is disabled by
default.

Current behavior:

- `PUBLIC_ANALYTICS_ENABLED` is not required for the static site to work.
- `HK_API_EVENT_LOGGING_ENABLED` defaults to `false`.
- Only allowlisted event names are accepted when events are enabled.
- When events are explicitly enabled, accepted event submissions pass through an
  in-memory per-minute rate limit.
- The event limiter stores only transient hashed abuse-control buckets derived
  from the allowlisted event, path, and optional session value. It does not
  trust forwarded client IP headers for event rate limiting, and it does not
  write raw event payload values or event records to disk.
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

## Implementation Review

Reviewed against current implementation on 2026-05-24:

- `apps/web/src/components/ContactForm.astro` for submitted form fields, visible
  mailto fallback, and typed text preservation when the API path fails.
- `apps/api/src/contact.rs` for validation, honeypot rejection, request-size
  limits, disabled mode, store mode, JSONL storage behavior, and safe responses.
- `apps/api/src/state.rs` for transient hashed abuse-control buckets shared by
  contact and events rate limiting.
- `apps/api/src/config.rs` for disabled contact storage defaults, the
  `HK_API_CONTACT_STORE_PATH` requirement, and disabled event logging defaults.
- `apps/api/src/events.rs` for disabled-by-default event handling and the
  allowlisted event names and rate-limit behavior accepted when event logging is
  explicitly enabled.
- `apps/api/tests/api_contract.rs` for backend coverage of contact storage,
  disabled contact, validation, rate limiting, and disabled events.
- `tests/e2e/contact-api.spec.ts` for frontend API enhancement behavior and
  mailto fallback behavior.
