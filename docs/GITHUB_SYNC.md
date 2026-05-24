# GitHub Sync Runbook

## Repository

- Owner: `HumanKaylee`
- Repository: `humankaylee-portfolio`
- Visibility: private
- URL: `https://github.com/HumanKaylee/humankaylee-portfolio`

## GitHub Project Board

GitHub Project board creation is blocked for the current non-interactive CLI
token; repo issues are the synchronization surface until the account has the
required Project scopes.

Attempted:

```bash
gh project create --owner HumanKaylee --title "HumanKaylee Portfolio" --format json
```

Result:

```text
error: your authentication token is missing required scopes [project read:project]
```

Read-only project listing is also blocked:

```bash
gh project list --owner HumanKaylee --format json
```

Result:

```text
error: your authentication token is missing required scopes [read:project]
```

`gh auth refresh --hostname github.com -s project,read:project` requires
interactive device-code approval. Until that is completed, repo issues are the
synchronization surface for status, ownership, labels, and acceptance criteria.

### Project board recovery steps

After interactive auth refresh succeeds:

1. Run `gh project list --owner HumanKaylee --format json` and confirm whether
   `HumanKaylee Portfolio` already exists.
2. If absent, run
   `gh project create --owner HumanKaylee --title "HumanKaylee Portfolio" --format json`.
3. Add the existing repo issues from the current live issue bridge to the board.
4. Add fields for phase, priority, type, area, agent size, status, and blocker.
5. Keep issue bodies as the source of truth; use the project board for triage
   and status views only.

## Issue Sync Plan

Backlog labels are defined in `docs/BACKLOG.md`. The live repo should include
all of these labels in addition to GitHub's defaults.

Priority labels:

- `priority:p0`
- `priority:p1`
- `priority:p2`

Type labels:

- `type:content`
- `type:docs`
- `type:feature`
- `type:qa`
- `type:research`
- `type:task`

Area labels:

- `area:a11y`
- `area:backend`
- `area:content`
- `area:design`
- `area:frontend`
- `area:infra`
- `area:motion`
- `area:ops`
- `area:performance`
- `area:privacy`
- `area:product`
- `area:security`
- `area:seo`

Phase labels:

- `phase:0-product-safety`
- `phase:1-foundation`
- `phase:2-content`
- `phase:3-static-experience`
- `phase:4-visual-motion`
- `phase:5-backend`
- `phase:6-hardening`
- `phase:7-launch`
- `phase:8-post-launch`

Agent routing labels:

- `agent-small`
- `agent-standard`
- `agent-strong`

Create or update labels with:

```bash
gh label create priority:p0 --color B91C1C --description "Required for launch"
gh label create type:feature --color 0EA5E9 --description "User-visible capability"
gh label create area:frontend --color 38BDF8 --description "Frontend UI and Astro implementation"
gh label create phase:7-launch --color 991B1B --description "Launch execution and evidence"
```

If a label already exists, run `gh label edit <name> --color <hex>
--description "<description>"`.

Create or refine issues with:

```bash
gh issue create --title "<backlog item title>" --label "priority:p0,type:task,area:ops,phase:7-launch" --body-file <body.md>
gh issue edit <number> --add-label "priority:p0,type:task,area:ops"
```

Issue bodies should include:

- backlog IDs covered
- dependencies
- acceptance criteria
- exact verification commands
- blocker state, if any
- whether the issue is suitable for `agent-small`, `agent-standard`, or
  `agent-strong`

## Current live issue bridge

The first sync layer is intentionally coarse because GitHub Project scopes are
not available yet. Keep these issues current until the project board exists:

Legacy `phase-0` through `phase-5` labels remain on the coarse issues for
compatibility with the first sync pass. Do not treat them as the current backlog
taxonomy; use the `phase:*` labels below for new filtering and new issues.

| Issue                                                                 | Purpose                                                              | Backlog coverage                                   | Current taxonomy labels                                                                                                                                                                         | Legacy labels retained |
| --------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| #1 Phase 0: Bootstrap execution contract and safety preflight         | Product/safety setup and execution contract                          | B-001 through B-005                                | `priority:p0`, `type:task`, `area:product`, `area:privacy`, `area:security`, `area:ops`, `phase:0-product-safety`, `agent-standard`                                                             | `phase-0`              |
| #2 Phase 4: Systems Map Hero, Project Atlas, motion, and 3D fallbacks | Visual/motion progressive enhancement                                | B-031 through B-037                                | `priority:p1`, `type:feature`, `area:design`, `area:frontend`, `area:motion`, `area:performance`, `phase:4-visual-motion`, `agent-strong`                                                       | `phase-4`              |
| #3 Phase 1-3: Static-first content, shell, case studies, resume, SEO  | Static frontend and public-safe content foundation                   | B-006 through B-030 plus B-061/B-063 runbook gates | `priority:p0`, `type:feature`, `type:content`, `area:frontend`, `area:content`, `area:seo`, `area:a11y`, `phase:1-foundation`, `phase:2-content`, `phase:3-static-experience`, `agent-standard` | `phase-1`, `phase-2`   |
| #4 Phase 5-6: Rust Axum API and frontend API integration              | API, contact, privacy-safe integration, and backend hardening        | B-038 through B-056                                | `priority:p0`, `type:feature`, `area:backend`, `area:security`, `area:privacy`, `phase:5-backend`, `phase:6-hardening`, `agent-standard`                                                        | `phase-3`              |
| #5 Phase 7-9: Hardening, deployment, operations, and launch evidence  | Launch, production blockers, evidence, rollback, and post-launch ops | B-057 through B-064                                | `priority:p0`, `type:qa`, `type:docs`, `area:infra`, `area:ops`, `area:performance`, `area:security`, `phase:6-hardening`, `phase:7-launch`, `phase:8-post-launch`, `agent-strong`              | `phase-5`              |

## Granular Issue Sync

Phase 0 backlog issues were created first because they do not require provider
credentials, Project scopes, production targets, or human redaction approval:

| Issue | Backlog item                                         | Parent | Labels                                                                                                     |
| ----- | ---------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| #7    | B-001: Confirm launch positioning and audience order | #1     | `priority:p0`, `type:content`, `area:product`, `phase:0-product-safety`, `agent-standard`                  |
| #8    | B-002: Create public-safety and redaction checklist  | #1     | `priority:p0`, `type:content`, `area:privacy`, `area:security`, `phase:0-product-safety`, `agent-standard` |
| #9    | B-003: Inventory case-study candidates               | #1     | `priority:p0`, `type:content`, `area:content`, `phase:0-product-safety`, `agent-standard`                  |
| #10   | B-004: Define "The Systems Atelier" design brief     | #1     | `priority:p0`, `type:content`, `area:design`, `phase:0-product-safety`, `agent-strong`                     |
| #11   | B-005: Resolve launch blockers register              | #1     | `priority:p0`, `type:task`, `area:product`, `area:ops`, `phase:0-product-safety`, `agent-standard`         |

Phase 1 backlog issues now live as the next granular sync layer, with #3
remaining the parent epic until the GitHub Project board can take over status
views:

| Issue | Backlog item                                      | Parent | Labels                                                                                               |
| ----- | ------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| #12   | B-006: Scaffold Astro TypeScript frontend         | #3     | `priority:p0`, `type:task`, `area:frontend`, `phase:1-foundation`, `agent-standard`                |
| #13   | B-007: Configure content collections             | #3     | `priority:p0`, `type:task`, `area:frontend`, `area:content`, `phase:1-foundation`, `agent-standard` |
| #14   | B-008: Build base layout and semantic shell       | #3     | `priority:p0`, `type:feature`, `area:frontend`, `area:a11y`, `phase:1-foundation`, `agent-standard` |
| #15   | B-009: Establish CSS token system                | #3     | `priority:p0`, `type:task`, `area:design`, `area:frontend`, `phase:1-foundation`, `agent-strong`    |
| #16   | B-010: Add baseline CI checks                     | #3     | `priority:p0`, `type:task`, `area:infra`, `phase:1-foundation`, `agent-standard`                    |
| #17   | B-011: Add frontend test harness                  | #3     | `priority:p0`, `type:task`, `area:frontend`, `phase:1-foundation`, `agent-standard`                 |
| #18   | B-012: Add Playwright smoke-test harness          | #3     | `priority:p1`, `type:qa`, `area:frontend`, `area:a11y`, `phase:1-foundation`, `agent-strong`        |

Phase 2 backlog issues now live as the next granular sync layer, with #3
remaining the parent epic until the GitHub Project board can take over status
views:

| Issue | Backlog item                                                                      | Parent | Labels                                                                                                        |
| ----- | --------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| #19   | B-013: Write launch home-page content package                                     | #3     | `priority:p0`, `type:content`, `area:content`, `phase:2-content`, `agent-standard`                           |
| #20   | B-014: Draft case study: CLI fleet synchronization and MCP rollout                | #3     | `priority:p0`, `type:content`, `area:content`, `area:privacy`, `phase:2-content`, `agent-strong`            |
| #21   | B-015: Draft case study: remote workstation recovery and operational debugging    | #3     | `priority:p0`, `type:content`, `area:content`, `area:privacy`, `phase:2-content`, `agent-strong`            |
| #22   | B-016: Draft case study: HumanKaylee portfolio build                              | #3     | `priority:p0`, `type:content`, `area:content`, `phase:2-content`, `agent-standard`                           |
| #23   | B-017: Draft case study: creative web demo                                        | #3     | `priority:p1`, `type:content`, `area:content`, `area:design`, `phase:2-content`, `agent-strong`              |
| #24   | B-018: Evaluate Kalshi or analytics tooling publication safety                    | #3     | `priority:p1`, `type:research`, `area:content`, `area:privacy`, `phase:2-content`, `agent-standard`          |
| #25   | B-019: Evaluate YouTube AI video pipeline publication safety                      | #3     | `priority:p1`, `type:research`, `area:content`, `area:privacy`, `phase:2-content`, `agent-standard`          |
| #26   | B-020: Build resume content source                                                 | #3     | `priority:p0`, `type:content`, `area:content`, `phase:2-content`, `agent-standard`                           |
| #27   | B-021: Create notes/build-log starter content                                      | #3     | `priority:p1`, `type:content`, `area:content`, `phase:2-content`, `agent-standard`                           |

Phase 3 backlog issues now live as the next granular sync layer, with #3
remaining the parent epic until the GitHub Project board can take over status
views:

| Issue | Backlog item                                                        | Parent | Labels                                                                                               |
| ----- | ------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| #28   | B-022: Implement static home page                                   | #3     | `priority:p0`, `type:feature`, `area:frontend`, `area:content`, `phase:3-static-experience`, `agent-standard` |
| #29   | B-023: Implement project index and category filters                 | #3     | `priority:p0`, `type:feature`, `area:frontend`, `area:content`, `phase:3-static-experience`, `agent-standard` |
| #30   | B-024: Implement case-study routes                                  | #3     | `priority:p0`, `type:feature`, `area:frontend`, `area:content`, `phase:3-static-experience`, `agent-standard` |
| #31   | B-025: Implement resume HTML page and PDF link                      | #3     | `priority:p0`, `type:feature`, `area:frontend`, `area:content`, `phase:3-static-experience`, `agent-standard` |
| #32   | B-026: Implement contact page or section with fallback              | #3     | `priority:p0`, `type:feature`, `area:frontend`, `area:privacy`, `phase:3-static-experience`, `agent-standard` |
| #33   | B-027: Implement notes/build-log pages and RSS                      | #3     | `priority:p1`, `type:feature`, `area:frontend`, `area:seo`, `phase:3-static-experience`, `agent-standard` |
| #34   | B-028: Add SEO metadata and structured data                         | #3     | `priority:p0`, `type:feature`, `area:seo`, `area:frontend`, `phase:3-static-experience`, `agent-standard` |
| #35   | B-029: Add sitemap and robots.txt                                   | #3     | `priority:p0`, `type:task`, `area:seo`, `area:frontend`, `phase:3-static-experience`, `agent-standard` |
| #36   | B-030: Add static project metadata fallback                         | #3     | `priority:p0`, `type:task`, `area:frontend`, `area:content`, `phase:3-static-experience`, `agent-standard` |

Next sync passes should add granular issues one phase at a time, preserving the
coarse issues as parent epics until a GitHub Project board can take over status
views.

## Deployment Sync Notes

Cloudflare Pages should use the repository's selected production branch for the
static frontend. Required GitHub-side assumptions:

- CI must pass before production deployment is promoted.
- Preview deployments should remain enabled for pull requests or branch checks.
- Provider deploy tokens belong in GitHub repository or environment secrets,
  never in committed files.
- Deployment IDs, URLs, and smoke-check evidence belong in
  `runbooks/LAUNCH_EVIDENCE.md`, not in issue comments that might expose
  provider account details.

Required secret names if CI later deploys directly:

| Secret name             | Used by                                   | Notes                                                      |
| ----------------------- | ----------------------------------------- | ---------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare Pages direct upload            | Token value stays in GitHub Actions secrets.               |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Pages direct upload            | Account identifier; avoid publishing in logs.              |
| `SHUTTLE_API_KEY`       | Shuttle API deploy, if CI deploys backend | Prefer manual deploy until Shuttle CI access is confirmed. |
| `FLY_API_TOKEN`         | Fly.io fallback deploy                    | Fallback only.                                             |
| `RAILWAY_TOKEN`         | Railway fallback deploy                   | Fallback only.                                             |

Exact provider commands and rollback steps are maintained in
`runbooks/DEPLOYMENT.md`.
