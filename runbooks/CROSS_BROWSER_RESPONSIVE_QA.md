# Cross-Browser And Responsive QA Runbook

Date: 2026-05-23
Scope: B-055 cross-browser and responsive launch gate
Status: local and CI evidence only; not production launch evidence

## Purpose

This runbook records how the portfolio checks realistic recruiter and engineer
viewing environments before production launch. It covers browser engines,
mobile, tablet, desktop widths, a LinkedIn in-app mobile approximation, and
issue triage categories.

## Automated Gate

Run the focused gate:

```bash
pnpm test:e2e -- --grep "@responsive"
```

Run the cross-browser version when browser tooling is available:

```bash
pnpm test:e2e -- --grep "@responsive" --browser=all
```

The dedicated spec is `tests/e2e/responsive-cross-browser.spec.ts`. It checks
the home, projects, representative case study, resume, and contact routes for:

- Visible first-load heading and proof copy.
- Recruiter-path links to resume, project evidence, or contact.
- No horizontal overflow in the main content.
- Static fallback note visibility.
- Mobile, tablet, and desktop viewport readability.
- A LinkedIn in-app mobile user-agent approximation for first-load readability.

## Browser And Viewport Matrix

| Browser  | mobile 390x844 | tablet 820x1180 | desktop 1440x1000 | Evidence source                                       | Triage |
| -------- | -------------- | --------------- | ----------------- | ----------------------------------------------------- | ------ |
| Chromium | Automated      | Automated       | Automated         | `pnpm test:e2e -- --grep "@responsive" --browser=all` | None   |
| Firefox  | Automated      | Automated       | Automated         | `pnpm test:e2e -- --grep "@responsive" --browser=all` | None   |
| WebKit   | Automated      | Automated       | Automated         | `pnpm test:e2e -- --grep "@responsive" --browser=all` | None   |

## LinkedIn In-App Mobile

The automated LinkedIn in-app mobile check is an approximation, not a real
device-app certification. It uses a mobile viewport and LinkedIn-style
user-agent to confirm the first load still exposes the Systems Atelier heading,
the recruiter proof copy, the resume path, and no horizontal overflow.

Real LinkedIn app validation remains a manual production-promotion task because
it requires the final public URL and an actual mobile app surface. If real app
behavior differs from the automated approximation, record it in this runbook and
classify it using the triage categories below.

## Issue Triage

Use these categories for B-055 findings:

- `launch blocker`: Prevents a recruiter or senior engineer from reading the
  home page, project proof, resume path, or contact path on a major browser or
  primary mobile width.
- `polish`: Visual or spacing issue that looks imperfect but does not block the
  core reading or contact journey.
- `post-launch`: Enhancement or long-tail browser refinement that is safe to
  defer because static content, resume, project evidence, and contact fallback
  remain usable.

## Current Notes

- The automated gate is production-like local evidence; it is not production
  evidence until run against the final deployed site or an approved preview URL.
- Screenshots are optional when the automated gate passes, but any triaged
  issue should include a screenshot or concise reproduction note.
- Production launch evidence still belongs in `runbooks/LAUNCH_EVIDENCE.md`.
