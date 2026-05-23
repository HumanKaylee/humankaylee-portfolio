# Portfolio Website Research Brief

Date: 2026-05-23

## Objective

Find the current patterns, technologies, hosting options, and content strategies most likely to make a personal technical portfolio feel impressive to recruiters, hiring managers, collaborators, and consulting prospects.

## Executive Recommendation

Build a fast static portfolio with an art-directed "systems lab" visual identity, progressive WebGL/WebGPU-enhanced hero moments, scrollytelling case studies, and a small Rust backend that powers contact, live metadata, and optional portfolio-assistant features. The site should be impressive because it demonstrates judgment: cinematic presentation, clear case-study substance, excellent performance, accessible fallbacks, and deployable systems thinking.

Recommended stack:

- Frontend: Astro, TypeScript, React islands, content collections, custom CSS, GSAP ScrollTrigger where cinematic sequencing is needed.
- Visual layer: Three.js with React Three Fiber for one signature 3D experience; Rive or Lottie for small vector motion; CSS View Transitions for page continuity.
- Backend: Rust Axum plus Tokio, tower-http, tracing, SQLx with SQLite/Postgres depending on host.
- Hosting phase 1: Cloudflare Pages for frontend and Shuttle Community for Rust API, with Fly.io or Railway as reliability fallback.
- Content strategy: 4 to 6 deep case studies, each with problem, constraints, architecture, implementation proof, testing, operations, outcome, and lessons learned.

## What Visually Impressive Sites Are Doing Now

Award galleries and recent portfolio examples show a clear split: the strongest sites are not just flashy. They combine interactive polish with fast access to the actual work.

Observed patterns:

- Immersive WebGL/WebGPU or 3D scene used as a signature moment, not as every page.
- Scroll-driven narrative sections with kinetic type, reveal choreography, pinned scenes, and artifact transitions.
- Large editorial typography, high-contrast composition, and strong art direction instead of generic SaaS cards.
- Project galleries that lead with "what changed" and "how it was built", not only screenshots.
- Fast, mobile-first fallbacks for recruiters who open the site from LinkedIn or a phone.
- AI or voice assistant experiments are appearing in portfolios, but they are only valuable if grounded in useful project navigation and privacy-safe implementation.

Evidence:

- Awwwards continues to feature WebGL, 3D, React, GSAP, and Framer categories, and its WebGL gallery frames the category as "technical eye candy" for inspiration: https://www.awwwards.com/websites/webgl/
- CSS Design Awards has 2026 WebGL nominee listings including personal portfolios and 3D-heavy sites: https://www.cssdesignawards.com/website-gallery?feature=WebGL
- Valentin Gassend's 2026 creative developer portfolio explicitly combines WebGL, Three.js, React, GSAP, case studies, performance, accessibility, and SEO: https://valentingassend.com/en/
- Current developer portfolio analysis emphasizes case studies, 3 to 6 focused projects, mobile responsiveness, and sub-2-second load goals: https://portfoliostudio.dev/blog/best-developer-portfolio-examples/
- A 2026 AI/UI portfolio example uses an AI voice assistant, animated sections, and dark premium design, showing the direction but also the risk of becoming gimmicky: https://www.javal.dev/

## Design Trends Worth Using

Use these selectively:

- 3D/WebGL hero: a navigable project constellation, terminal-lab object, or system map.
- Kinetic typography: reveal the value proposition and role labels through scroll and hover, not constant motion.
- Bento or artifact grid: useful for showing logs, screenshots, architecture fragments, metrics, and demos in a dense but readable way.
- Scrollytelling case studies: one project per page with timeline, decision points, diagrams, failure modes, and outcomes.
- Adaptive visual density: rich desktop experience, simplified mobile experience, same content.
- Reduced-motion and no-WebGL modes: mandatory for accessibility and recruiter reliability.

Avoid:

- Purple-on-white generic AI/SaaS look.
- Over-reliance on smooth scroll that breaks native behavior.
- Full-screen 3D that hides the resume, project links, or contact path.
- Animated noise without evidence of engineering skill.

## Technology Findings

### Astro

Astro is the best fit for a portfolio where most content is static, but specific sections need React, WebGL, or motion. Astro Islands hydrate only the components that need JavaScript, which protects performance: https://docs.astro.build/en/concepts/islands/

Astro View Transitions can create SPA-like navigation while retaining a static-first model and reduced-motion support: https://docs.astro.build/en/guides/view-transitions/

Use Astro for:

- Content collections for case studies, notes, talks, demos, and resume data.
- MDX case studies with diagrams and reusable components.
- Low-JS pages for SEO and first-load speed.
- React islands only for interactive pieces.

### Next.js

Next.js App Router is powerful, especially for server components and dynamic apps: https://nextjs.org/docs/app

For this site, Next.js is not the first choice because it adds framework complexity where a portfolio mostly needs static speed and selective interactivity. It becomes more attractive if the site turns into a full authenticated platform or CMS-backed application.

### Three.js, React Three Fiber, and WebGPU

Three.js remains the practical default for browser 3D. Its WebGPU renderer can target WebGPU and fall back to WebGL 2, which makes it useful for forward-looking visual work without abandoning compatibility: https://threejs.org/manual/en/webgpurenderer

Use Three.js/React Three Fiber for one or two high-value sections:

- Hero scene: project constellation, machine room, or animated systems map.
- Case-study artifact viewer: architecture graph, timeline, or 3D exploded view.

Do not make every page depend on WebGL. Lazy-load the scene, show a designed poster fallback, and keep text content in HTML.

### GSAP, Motion, Lenis, Rive, Lottie, Spline

GSAP ScrollTrigger is still the strongest tool for precise scroll choreography and pinned cinematic sequences: https://gsap.com/docs/v3/Plugins/ScrollTrigger/

Motion for React is useful for component-level animation that should not trigger React re-renders: https://motion.dev/motion/component

Lenis is useful for WebGL scroll syncing and parallax, but it must be optional because smooth-scroll libraries can create browser-specific issues: https://github.com/darkroomengineering/lenis

Rive is good for compact interactive vector/state-machine animation, but the runtime has meaningful WASM weight, so use it sparingly: https://rive.app/docs/runtimes/runtime-sizes

Lottie/dotLottie is useful for lightweight motion assets and open formats: https://docs.lottiefiles.com/

Spline is useful for fast 3D prototyping and export, including React integration, but self-host `.splinecode` assets where practical to avoid CORS and vendor dependency: https://www.npmjs.com/package/%40splinetool/react-spline

### Rust Backend Options

Axum is the recommended Rust backend because it is ergonomic, modular, and built on Tokio, Tower, and Hyper. Its docs emphasize routing, extractors, predictable error handling, middleware, and shared state: https://docs.rs/axum/latest/axum/

Leptos and Dioxus can build full-stack Rust apps, but they are a larger bet for a portfolio whose frontend should be visually experimental and recruiter-fast. Leptos server functions are valuable if we want a Rust-first full-stack site later: https://book.leptos.dev/server/25_server_functions.html

Dioxus Fullstack is worth watching because it integrates with Axum and supports SSR, server functions, hot reload, typed routing, SSE, and WebSockets: https://dioxuslabs.com/learn/0.7/essentials/fullstack/

Best Rust backend use cases for this project:

- `POST /api/contact`: rate-limited contact form.
- `GET /api/projects/live`: cached GitHub/project metadata.
- `POST /api/events`: privacy-safe analytics events.
- `GET /api/health`: deployment health.
- Later: portfolio assistant backed by local content embeddings or static index.

## Hosting and Cost Findings

### Cheapest Practical Path

Use Cloudflare Pages for the static frontend and Shuttle Community for Rust API.

Why:

- Cloudflare Pages free tier supports 500 builds per month, 100 custom domains per project, and 20,000 files on the Free plan: https://developers.cloudflare.com/pages/platform/limits/
- Cloudflare Workers free tier includes 100,000 requests per day with CPU limits, useful for edge glue or non-Rust functions: https://developers.cloudflare.com/workers/platform/pricing/
- Shuttle Community is Rust-native and free for hobby projects, with custom domain support and starter resources: https://www.shuttle.dev/pricing2

Tradeoff:

- Shuttle Community is best for demos and learning; use Fly.io, Railway, or a VPS if uptime and control become more important.

### Hosting Options

| Option | Approx cost | Best for | Advantages | Disadvantages |
| --- | ---: | --- | --- | --- |
| Cloudflare Pages only | $0 | Static portfolio | Fast CDN, private GitHub repo support, generous free limits | No Rust backend by itself |
| Cloudflare Pages + Workers | $0 to $5+ | Edge APIs, analytics, redirects | Very cheap, high scale, D1/KV/R2 ecosystem | Rust backend becomes Wasm/edge-specific rather than normal Axum |
| Cloudflare Pages + Shuttle Rust | $0 initially | Rust proof with low ops | Rust-native, fast to deploy, free Community tier | Free tier reliability/resource limits |
| Cloudflare Pages + Fly.io Rust | About $2 to $8/month for tiny always-on shape, usage based | Reliable Rust API near users | Containers, global regions, good Rust/Docker story | No permanent free tier; metered costs |
| Railway Rust | $5/month baseline, usage based | Simple app deploys | Easy DX, included usage credit | Can cost more than expected under always-on workloads |
| Render static + web service | $0 static, paid service for reliable backend | Simple deploys | Easy Git deploys and TLS | Free service behavior and paid tiers may not be ideal for polished backend |
| GitHub Pages | $0 public repo, private repo requires paid plan for Pages | Simple static public site | Simple and familiar | Private repo + Pages limitations on GitHub Free |
| Hetzner VPS | About $4 to $8/month after 2026 price changes | Full self-hosting | Cheap control, Docker/Caddy, can host Rust and static together | You own patching, uptime, monitoring, backups |
| Oracle Always Free | $0 if capacity/account is available | Free VPS experiments | Strong free compute when available | Capacity and account reliability risk |
| Home self-hosting + Cloudflare Tunnel | Existing hardware | Demos, homelab proof | Demonstrates ops ability; very cheap | Resume site should not depend on home power/ISP uptime |

Pricing references:

- Vercel Hobby remains free with usage caps; Pro starts at $20/month: https://vercel.com/pricing
- Netlify Free includes deploys, custom domains with SSL, functions/storage, CDN, and a 300 credit/month limit under current pricing: https://www.netlify.com/pricing
- Fly.io bills Machines per second while started, and stopped/suspended Machines still incur rootfs storage charges: https://fly.io/docs/about/billing/
- Railway Hobby is $5/month with the subscription counting toward resource usage: https://docs.railway.com/pricing
- GitHub Pages supports public repos on GitHub Free; private repository Pages requires GitHub Pro/Team/Enterprise levels: https://docs.github.com/en/pages/getting-started-with-github-pages
- Hetzner announced April 1, 2026 cloud server price changes: https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/
- Oracle documents Always Free resources separately and should be treated as capacity-dependent: https://docs.oracle.com/en-us/iaas/Content/FreeTier/resourceref.htm

## Content That Moves The Needle

The site should answer "Can this person build and operate impressive systems?" within 30 seconds.

Content that matters:

- A short positioning statement: AI systems, automation, infrastructure, product engineering, creative web.
- 4 to 6 flagship case studies with live demo, repo link where safe, architecture diagram, results, tradeoffs, and lessons.
- "Operator proof": runbooks, rollout matrices, system diagrams, verification evidence, before/after metrics.
- "Agentic workflow proof": how Codex/Claude, subagents, MCP, and local tools are used responsibly.
- Rust proof: a live Axum API, health endpoint, tracing, deploy docs, tests, and status badge.
- Resume and LinkedIn path: downloadable PDF, structured resume page, contact CTA, Open Graph preview.
- Recruiter fast path: a `Start here` panel with the best project, strongest skill areas, and direct contact.
- Engineering deep path: architecture, test strategy, postmortems, and links to source artifacts.

Case-study template:

1. Problem and stakes.
2. Constraints and weirdness.
3. Architecture.
4. Implementation highlights.
5. Testing and verification.
6. Operational outcome.
7. What changed because of the work.
8. Lessons learned.

## Recommended Visual Concept

Working concept: "The Systems Atelier".

Tone:

- Cinematic, technical, human, precise.
- More "high-end lab notebook plus mission control" than generic dark cyberpunk.

Visual language:

- Warm off-black, aged paper, tungsten amber, signal green, oxidized blue.
- Expressive typography: editorial serif for major statements, condensed grotesk for system labels, mono for evidence snippets.
- Layered background: subtle grid, topographic contour lines, command traces, project-node constellations.
- Motion: deliberate scene transitions, staggered artifact reveals, scroll-linked system diagrams, cursor as inspection light on desktop only.

Signature interaction:

- Hero starts as a quiet field of project nodes.
- As the user scrolls, nodes assemble into clusters: AI, infrastructure, creative systems, automation, backend.
- Selecting a node opens a case-study artifact card with live links and evidence.
- Mobile version collapses into a fast editorial timeline.

## Risks and Controls

| Risk | Control |
| --- | --- |
| Site looks impressive but content is thin | Build case studies before building ornamental pages |
| 3D harms load time | Lazy-load, poster fallback, budget the hero bundle, static text first |
| Motion annoys users | Respect `prefers-reduced-motion`, keep native scroll fallback |
| Backend adds uptime risk | Static site remains fully useful if API is down |
| Private repo cannot use GitHub Pages on Free | Use Cloudflare Pages from private GitHub repo |
| Recruiters miss the key story | Add a top-level `For recruiters` path and a resume PDF |
| Rust backend feels bolted on | Make backend power visible features: contact, health, live project metadata, status |

## Final Recommendation

Proceed with Astro + React islands + Three.js/R3F + GSAP for the frontend, and Rust Axum for a small API. Host frontend on Cloudflare Pages and start the Rust backend on Shuttle Community. Keep Fly.io and Railway as fallback deploy targets, and document a Hetzner/Caddy/Docker self-host path as an advanced option.

The portfolio should prioritize substance over novelty: the visual wow earns attention, but case studies, evidence, tests, and operational maturity convert that attention into credibility.

