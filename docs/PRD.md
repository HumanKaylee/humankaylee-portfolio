# HumanKaylee Portfolio PRD

Date: 2026-05-23
Status: Draft ready for implementation planning

## Product Summary

Create a visually stunning personal portfolio website for `HumanKaylee` that can be linked from resumes, LinkedIn, GitHub, and direct outreach. The site must establish credibility quickly, showcase technical range through deep case studies, and demonstrate modern engineering taste through performance, accessibility, motion, 3D, Rust backend work, and high-quality documentation.

## Primary Goal

Make a reviewer believe within 30 seconds that HumanKaylee can design, build, operate, debug, and explain sophisticated systems.

## Target Audiences

- Recruiters and hiring managers evaluating fit quickly.
- Senior engineers evaluating depth and judgment.
- Potential collaborators or consulting clients evaluating capability.
- Technical peers looking for proof through source, runbooks, and demos.

## Product Positioning

HumanKaylee builds practical AI-assisted systems, automation workflows, infrastructure, backend services, and polished user-facing tools. The site should feel like a working studio and systems lab, not a static resume.

## Success Metrics

- Lighthouse targets on production: Performance >= 90, Accessibility >= 95, Best Practices >= 95, SEO >= 95 on core pages.
- Initial contentful page remains useful with JavaScript disabled.
- Hero text, resume CTA, project CTA, and contact CTA visible without waiting for 3D assets.
- 4 to 6 flagship case studies published before launch.
- Every flagship case study includes problem, architecture, implementation proof, verification, outcome, and lessons.
- Rust backend has health endpoint, tests, tracing, deployment docs, and at least one user-visible feature.
- Site has Open Graph metadata, structured data, sitemap, RSS/notes feed, and resume PDF link.
- Deployment can be reproduced from the implementation plan by agentic workers without hidden context.

## Non-Goals

- Do not build a full CMS before launch.
- Do not require authentication for the public site.
- Do not make the Rust backend mandatory for reading project content.
- Do not optimize for Awwwards submission at the expense of recruiter clarity.
- Do not depend on home-hosted infrastructure for the primary public site.
- Do not add generative AI features that require secrets in frontend code.

## Core User Journeys

### Recruiter Fast Path

1. User lands on home page from LinkedIn or resume.
2. Site loads a readable hero immediately.
3. User sees role summary, top skills, top projects, resume PDF, and contact CTA.
4. User opens one flagship case study and sees evidence, outcomes, and links.
5. User contacts HumanKaylee or saves the resume link.

### Senior Engineer Deep Path

1. User lands on a project page.
2. User sees architecture diagram and constraints.
3. User reviews implementation notes, tests, operational runbook excerpts, and source/demo links.
4. User can inspect the Rust API health/status and project metadata endpoint.
5. User leaves with clear evidence of engineering depth.

### Visual Impression Path

1. User lands on home page on a capable desktop browser.
2. Progressive hero scene loads after core text.
3. Project nodes animate into a systems map.
4. User interacts with nodes to preview case studies.
5. Motion remains smooth, purposeful, and optional.

### Mobile Path

1. User opens from LinkedIn mobile app.
2. Site serves the editorial timeline, not a heavy 3D dependency.
3. Navigation, resume link, and contact remain easy to tap.
4. Case-study media uses compressed responsive assets.

## Feature Requirements

### Home Page

- Strong positioning statement in the first viewport.
- Cinematic but performant hero.
- `For recruiters` card with resume, top skills, top projects, and contact.
- `For engineers` card with architecture, source, demos, and runbooks.
- Featured case studies with short impact summaries.
- Live or cached project metadata where useful.
- Clear social links: GitHub, LinkedIn, email/contact.

### Project Atlas

- Interactive desktop project constellation using React Three Fiber or a lighter SVG/canvas fallback.
- Filter projects by category: AI, automation, infrastructure, backend, creative web, operations.
- Each node must have an HTML-accessible equivalent.
- Mobile must use a fast card/timeline list.

### Signature Proof Experiences

The site should include at least three memorable, substance-backed interaction moments by launch:

- `Systems Map Hero`: project nodes assemble into capability clusters and link directly to case studies.
- `Evidence Drawer`: case-study pages reveal sanitized commands, diagrams, rollout matrices, or test evidence in a compact artifact panel.
- `Build Telemetry Strip`: a visible site-build proof section shows latest deploy status, Rust API health, Lighthouse scores, and test status from static or cached data.

Each experience must have an HTML fallback and must not hide the resume, project, or contact path.

### Case Studies

Each case study must include:

- Summary.
- Problem and stakes.
- Constraints.
- Architecture diagram.
- Build details.
- Test and verification approach.
- Operational notes.
- Outcome and impact.
- Lessons learned.
- Links to repo, demo, docs, screenshots, or redacted artifacts.

### Rust Backend

Initial endpoints:

- `GET /api/health`: returns service status, version, and uptime.
- `GET /api/projects/live`: returns cached GitHub/project metadata used by frontend.
- `POST /api/contact`: accepts contact form, validates input, rate-limits requests, and sends or stores messages.
- `POST /api/events`: records privacy-safe events only if enabled.

Backend requirements:

- Rust Axum.
- Tokio runtime.
- tower-http for CORS, trace, compression on text responses, and request body/time limits.
- Structured tracing.
- Typed config from environment variables.
- Integration tests for routes.
- Dockerfile and Shuttle deploy path.
- Backend failure must not break static portfolio content.

### Resume and Identity

- Downloadable resume PDF.
- HTML resume page.
- Structured data for person, website, and projects.
- Open Graph/Twitter cards.
- Print-friendly resume page.

### Notes or Build Log

- Lightweight notes section for engineering writeups.
- RSS feed.
- Optional "How this site was built" case study to show process.

### Build Proof Dashboard

- Show a concise "this site is engineered" panel linking to build notes, API health, accessibility/performance evidence, and deployment runbook.
- Data may be static at first and optionally enhanced by the Rust API.
- Never expose private CI URLs, tokens, internal logs, or sensitive hostnames.

### Contact

- Contact form backed by Rust API or mailto fallback.
- Spam protection through rate limiting and honeypot field.
- No public exposure of email secrets.
- Clear fallback if backend is unavailable.

## Visual Requirements

- Visual direction: "The Systems Atelier".
- Mood: high-end technical studio, mission-control evidence, cinematic but readable.
- Color: warm off-black, paper/cream, tungsten amber, signal green, oxidized blue.
- Typography: expressive serif display, condensed grotesk labels, disciplined monospace evidence snippets.
- Motion: scroll-linked system assembly, artifact reveals, page transitions, subtle cursor inspection on desktop.
- No generic purple AI gradients.
- No default Inter/Roboto/system look unless a design-system dependency forces it internally.

## Accessibility Requirements

- Respect `prefers-reduced-motion`.
- All key content accessible without WebGL.
- Keyboard navigation for project atlas and menus.
- Color contrast WCAG AA or better.
- Touch targets >= 44px on mobile.
- Semantic HTML for headings, nav, main, article, aside, footer.
- Alt text for meaningful images.
- Captions or summaries for videos/animations where needed.

## Performance Requirements

- Static HTML for core pages.
- Lazy-load 3D and heavy animation assets.
- Use compressed responsive images.
- Budget hero 3D payload and provide poster fallback.
- Avoid blocking third-party scripts.
- Frontend should remain useful if backend API is down.
- Add bundle analysis before launch.

## SEO and Sharing Requirements

- Sitemap.
- Robots.txt.
- Canonical URLs.
- Open Graph image per core page.
- JSON-LD for Person and WebSite on launch, plus CreativeWork or SoftwareSourceCode on pages that describe a project, case study, or source-backed software artifact.
- Project slugs stable and readable.

## Security and Privacy Requirements

- No secrets in frontend.
- Contact endpoint validates and rate-limits input.
- CORS locked to production origins.
- Security headers on frontend and backend.
- Analytics must be privacy-safe and documented.
- Dependencies audited before launch.

## Content Inventory

Initial case-study candidates should be selected from real work in `/home/joe`, prior runbooks, and GitHub repositories:

- CLI fleet synchronization and MCP rollout.
- Remote workstation recovery and operational debugging.
- Kalshi migration or analytics tooling, if safe to publish.
- YouTube AI video pipeline, if safe to publish.
- This portfolio build itself as an AI-assisted, Rust-backed, visually rich project.
- A creative web demo built specifically for the site.

All sensitive details must be redacted before publication.

## Launch Definition

Launch is complete when:

- Home, projects, at least 4 case studies, resume, notes/build-log, and contact are live.
- Frontend is deployed to Cloudflare Pages or chosen host with custom domain instructions.
- Rust API is deployed to Shuttle or fallback host.
- CI runs lint, typecheck, unit tests, backend tests, build, and Playwright smoke tests.
- Lighthouse checks meet targets or documented exceptions exist.
- README and runbook explain local dev, deployment, rollback, and content updates.

## Open Decisions

- Final domain name.
- Final resume PDF source content.
- Which existing projects are safe to publish in detail.
- Whether to launch AI assistant in v1 or keep it as a v2 demo.
- Whether to use Shuttle Community for launch or go straight to Fly.io/Railway for reliability.
