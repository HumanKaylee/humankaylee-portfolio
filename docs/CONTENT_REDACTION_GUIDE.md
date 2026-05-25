# Content Redaction Guide

Date: 2026-05-23
Status: Required checklist for every publishable case study
Source: `docs/CONTENT_STRATEGY.md`

## Purpose

This guide prevents portfolio content from publishing secrets, private infrastructure details, private account data, or operational details that increase risk. Every real-work case study can count toward launch only after it links to this guide and records a redaction status.

## Redaction Statuses

Use these statuses in content frontmatter or data as `redactionStatus`:

| Status | Meaning | Launch Eligible |
| --- | --- | --- |
| `draft` | Content exists but has not been reviewed for sensitive details. | No |
| `reviewed` | A reviewer has checked the item and requested no further redaction or listed required edits. | No |
| `approved` | The item has completed review, open-items clearance, artifact inspection, human signoff, and any required production or owner-approved production-equivalent provider preview evidence. | Yes |
| `blocked` | The item cannot be published without missing approval, unsafe details, or loss of credibility after redaction. | No |

`reviewed` is never launch-eligible; the launch-eligible case-study count stays
`0` until real human approval evidence exists.

Use these publication statuses for case-study launch selection as `publicationStatus`:

| Status | Meaning |
| --- | --- |
| `publish` | Intended for v1 launch after redaction status becomes `approved`. |
| `needs-redaction` | Candidate is valuable but blocked until redaction review is complete. |
| `defer` | Not part of v1 launch. |

## Never Publish

- Passwords, API keys, tokens, session IDs, private keys, recovery codes, cookies, auth headers, OAuth codes, or credential hints.
- Private IPs, tailnet addresses, internal hostnames, SSH aliases, VPN details, exact remote access paths, or firewall bypass details.
- Customer, employer, client, account, financial, or personally identifying data without explicit approval.
- Raw logs that include usernames, email addresses, secrets, absolute private paths, hostnames, account IDs, or security-sensitive errors.
- Exact security controls, bypass methods, firewall rules, recovery commands, or operational sequences that would help an attacker.
- Private repository names, private branch names, or private paths unless they are intentionally disclosed.
- Screenshots showing browser profiles, terminals, tokens, credentials, chat history, private dashboards, private URLs, or account identifiers.

## Generalize Before Publishing

- Replace hostnames with role labels such as `workstation-a`, `api-host`, `remote-linux-node`, or `portfolio-api`.
- Replace usernames with role labels such as `operator`, `admin`, `service-user`, or `local-user`.
- Replace private paths with project-relative paths.
- Replace exact timestamps with dates or sequence descriptions unless precise timing is essential and safe.
- Replace private metrics with ranges or relative improvements when exact numbers are sensitive.
- Replace raw command output with summarized evidence unless the exact output has been reviewed and sanitized.
- Replace direct screenshots with cropped or recreated diagrams when the original context reveals private information.

## Allowed With Review

- Redacted architecture diagrams.
- Sanitized rollout matrices.
- Cropped screenshots that show product behavior without private context.
- Public repository, demo, documentation, or package links.
- Synthetic data that preserves the shape of the problem without real records.
- Incident summaries focused on diagnosis, tradeoffs, and controls rather than exploitable details.

## Required Checklist

Each case study must include a review record that answers all items:

| Check | Required Answer |
| --- | --- |
| Secrets removed | `yes` |
| Hostnames and access paths generalized | `yes` |
| Usernames and account names generalized or intentionally public | `yes` |
| Screenshots inspected at full resolution | `yes` or `not-applicable` |
| Logs summarized or sanitized | `yes` or `not-applicable` |
| Repo/demo links are public and intentional | `yes` or `not-applicable` |
| Claims have safe supporting evidence | `yes` |
| Security-sensitive procedures removed or generalized | `yes` |
| Redaction reviewer recorded | `yes` |
| Redaction status | `approved`, `blocked`, `reviewed`, or `draft` |

## Launch Gate

A case study may be counted toward the v1 launch minimum only when:

- `publicationStatus` is `publish`.
- `redactionStatus` is `approved`.
- The case study remains understandable without private context.
- Every artifact linked from the page has passed this checklist.

If fewer than four case studies can meet this standard, pause implementation and resolve the content decision before continuing toward launch.
