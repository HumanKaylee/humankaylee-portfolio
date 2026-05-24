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
| #5 Phase 7-9: Hardening, deployment, operations, and launch evidence  | Launch, production blockers, evidence, rollback, and post-launch ops | B-057 through B-068                                | `priority:p0`, `type:qa`, `type:docs`, `area:infra`, `area:ops`, `area:performance`, `area:security`, `phase:6-hardening`, `phase:7-launch`, `phase:8-post-launch`, `agent-strong`              | `phase-5`              |

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

Phase 0 issue sync status: complete and closed. #7 through #11 are closed, and
the parent #1 is closed after B-001 through B-005 completed. Latest closure
evidence for B-005 is PR #6 commit `1e6cee5`, Phase 0 CI run `26358424380`,
Frontend verification job `77589342600`, and Rust verification job
`77589342623`.

Phase 1 backlog issues now live as the next granular sync layer, with #3
remaining the parent epic until the GitHub Project board can take over status
views:

| Issue | Backlog item                                | Parent | Labels                                                                                              |
| ----- | ------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| #12   | B-006: Scaffold Astro TypeScript frontend   | #3     | `priority:p0`, `type:task`, `area:frontend`, `phase:1-foundation`, `agent-standard`                 |
| #13   | B-007: Configure content collections        | #3     | `priority:p0`, `type:task`, `area:frontend`, `area:content`, `phase:1-foundation`, `agent-standard` |
| #14   | B-008: Build base layout and semantic shell | #3     | `priority:p0`, `type:feature`, `area:frontend`, `area:a11y`, `phase:1-foundation`, `agent-standard` |
| #15   | B-009: Establish CSS token system           | #3     | `priority:p0`, `type:task`, `area:design`, `area:frontend`, `phase:1-foundation`, `agent-strong`    |
| #16   | B-010: Add baseline CI checks               | #3     | `priority:p0`, `type:task`, `area:infra`, `phase:1-foundation`, `agent-standard`                    |
| #17   | B-011: Add frontend test harness            | #3     | `priority:p0`, `type:task`, `area:frontend`, `phase:1-foundation`, `agent-standard`                 |
| #18   | B-012: Add Playwright smoke-test harness    | #3     | `priority:p1`, `type:qa`, `area:frontend`, `area:a11y`, `phase:1-foundation`, `agent-strong`        |

Phase 2 backlog issues now live as the next granular sync layer, with #3
remaining the parent epic until the GitHub Project board can take over status
views:

| Issue | Backlog item                                                                   | Parent | Labels                                                                                              |
| ----- | ------------------------------------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------- |
| #19   | B-013: Write launch home-page content package                                  | #3     | `priority:p0`, `type:content`, `area:content`, `phase:2-content`, `agent-standard`                  |
| #20   | B-014: Draft case study: CLI fleet synchronization and MCP rollout             | #3     | `priority:p0`, `type:content`, `area:content`, `area:privacy`, `phase:2-content`, `agent-strong`    |
| #21   | B-015: Draft case study: remote workstation recovery and operational debugging | #3     | `priority:p0`, `type:content`, `area:content`, `area:privacy`, `phase:2-content`, `agent-strong`    |
| #22   | B-016: Draft case study: HumanKaylee portfolio build                           | #3     | `priority:p0`, `type:content`, `area:content`, `phase:2-content`, `agent-standard`                  |
| #23   | B-017: Draft case study: creative web demo                                     | #3     | `priority:p1`, `type:content`, `area:content`, `area:design`, `phase:2-content`, `agent-strong`     |
| #24   | B-018: Evaluate Kalshi or analytics tooling publication safety                 | #3     | `priority:p1`, `type:research`, `area:content`, `area:privacy`, `phase:2-content`, `agent-standard` |
| #25   | B-019: Evaluate YouTube AI video pipeline publication safety                   | #3     | `priority:p1`, `type:research`, `area:content`, `area:privacy`, `phase:2-content`, `agent-standard` |
| #26   | B-020: Build resume content source                                             | #3     | `priority:p0`, `type:content`, `area:content`, `phase:2-content`, `agent-standard`                  |
| #27   | B-021: Create notes/build-log starter content                                  | #3     | `priority:p1`, `type:content`, `area:content`, `phase:2-content`, `agent-standard`                  |

Phase 2 issue sync status: partial. #22 and #23 are closed as draft-content
tasks with local route, quality, and visual evidence while keeping their
case-study redaction status at `reviewed`. #20 and #21 remain open for
openItems/artifact review and final human signoff; their non-approval evidence
inventory is progress evidence only and does not change redaction status or the
Content Redaction Guide launch gate. #24 and #25 remain open because the
publication-safety record recommends excluding/deferring sensitive candidates
from v1, records HumanKaylee owner decision as pending, and treats any
synthetic proof pack as review evidence only. This is not publication approval
and does not replace the Content Redaction Guide launch gate.

Phase 3 backlog issues now live as the next granular sync layer, with #3
remaining the parent epic until the GitHub Project board can take over status
views:

| Issue | Backlog item                                           | Parent | Labels                                                                                                        |
| ----- | ------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------- |
| #28   | B-022: Implement static home page                      | #3     | `priority:p0`, `type:feature`, `area:frontend`, `area:content`, `phase:3-static-experience`, `agent-standard` |
| #29   | B-023: Implement project index and category filters    | #3     | `priority:p0`, `type:feature`, `area:frontend`, `area:content`, `phase:3-static-experience`, `agent-standard` |
| #30   | B-024: Implement case-study routes                     | #3     | `priority:p0`, `type:feature`, `area:frontend`, `area:content`, `phase:3-static-experience`, `agent-standard` |
| #31   | B-025: Implement resume HTML page and PDF link         | #3     | `priority:p0`, `type:feature`, `area:frontend`, `area:content`, `phase:3-static-experience`, `agent-standard` |
| #32   | B-026: Implement contact page or section with fallback | #3     | `priority:p0`, `type:feature`, `area:frontend`, `area:privacy`, `phase:3-static-experience`, `agent-standard` |
| #33   | B-027: Implement notes/build-log pages and RSS         | #3     | `priority:p1`, `type:feature`, `area:frontend`, `area:seo`, `phase:3-static-experience`, `agent-standard`     |
| #34   | B-028: Add SEO metadata and structured data            | #3     | `priority:p0`, `type:feature`, `area:seo`, `area:frontend`, `phase:3-static-experience`, `agent-standard`     |
| #35   | B-029: Add sitemap and robots.txt                      | #3     | `priority:p0`, `type:task`, `area:seo`, `area:frontend`, `phase:3-static-experience`, `agent-standard`        |
| #36   | B-030: Add static project metadata fallback            | #3     | `priority:p0`, `type:task`, `area:frontend`, `area:content`, `phase:3-static-experience`, `agent-standard`    |

Phase 4 backlog issues now live as the next granular sync layer, with #2
remaining the parent epic until the GitHub Project board can take over status
views:

| Issue | Backlog item                                       | Parent | Labels                                                                                                    |
| ----- | -------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| #37   | B-031: Implement art-directed page surfaces        | #2     | `priority:p1`, `type:feature`, `area:design`, `area:frontend`, `phase:4-visual-motion`, `agent-strong`    |
| #38   | B-032: Implement static hero poster and fallback   | #2     | `priority:p0`, `type:feature`, `area:design`, `area:performance`, `phase:4-visual-motion`, `agent-strong` |
| #39   | B-033: Implement accessible project atlas fallback | #2     | `priority:p0`, `type:feature`, `area:frontend`, `area:a11y`, `phase:4-visual-motion`, `agent-standard`    |
| #40   | B-034: Implement desktop project constellation     | #2     | `priority:p1`, `type:feature`, `area:motion`, `area:frontend`, `phase:4-visual-motion`, `agent-strong`    |
| #41   | B-035: Add purposeful scroll and reveal motion     | #2     | `priority:p1`, `type:feature`, `area:motion`, `area:design`, `phase:4-visual-motion`, `agent-strong`      |
| #42   | B-036: Add view transitions or route continuity    | #2     | `priority:p2`, `type:feature`, `area:motion`, `area:frontend`, `phase:4-visual-motion`, `agent-standard`  |
| #43   | B-037: Add visual regression snapshots             | #2     | `priority:p1`, `type:qa`, `area:design`, `area:frontend`, `phase:4-visual-motion`, `agent-standard`       |

Phase 4 issue sync status: complete. B-031 through B-037 are mirrored as #37
through #43. This is only GitHub issue mirror evidence; it is not a Project
board recovery, production launch, or launch-readiness claim.

Phase 5 backlog issues now live as the next granular sync layer, with #4
remaining the parent epic until the GitHub Project board can take over status
views:

| Issue | Backlog item                                           | Parent | Labels                                                                                              |
| ----- | ------------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------- |
| #44   | B-038: Scaffold Rust Axum API service                  | #4     | `priority:p0`, `type:task`, `area:backend`, `phase:5-backend`, `agent-standard`                     |
| #45   | B-039: Implement `GET /api/health`                     | #4     | `priority:p0`, `type:feature`, `area:backend`, `phase:5-backend`, `agent-standard`                  |
| #46   | B-040: Implement cached `GET /api/projects/live`       | #4     | `priority:p1`, `type:feature`, `area:backend`, `phase:5-backend`, `agent-standard`                  |
| #47   | B-041: Implement contact endpoint validation           | #4     | `priority:p0`, `type:feature`, `area:backend`, `area:security`, `phase:5-backend`, `agent-standard` |
| #48   | B-042: Add contact rate limiting and abuse controls    | #4     | `priority:p0`, `type:feature`, `area:backend`, `area:security`, `phase:5-backend`, `agent-standard` |
| #49   | B-043: Add contact delivery or storage adapter         | #4     | `priority:p0`, `type:feature`, `area:backend`, `area:privacy`, `phase:5-backend`, `agent-standard`  |
| #50   | B-044: Implement optional privacy-safe events endpoint | #4     | `priority:p2`, `type:feature`, `area:backend`, `area:privacy`, `phase:5-backend`, `agent-standard`  |
| #51   | B-045: Configure backend CORS and security middleware  | #4     | `priority:p0`, `type:task`, `area:backend`, `area:security`, `phase:5-backend`, `agent-standard`    |
| #52   | B-046: Add backend Dockerfile and Shuttle deploy path  | #4     | `priority:p0`, `type:task`, `area:backend`, `area:infra`, `phase:5-backend`, `agent-standard`       |
| #53   | B-047: Integrate frontend with API fallbacks           | #4     | `priority:p0`, `type:feature`, `area:frontend`, `area:backend`, `phase:5-backend`, `agent-standard` |

Phase 5 issue sync status: complete. B-038 through B-047 are mirrored as #44
through #53. This is only GitHub issue mirror evidence; it is not a Project
board recovery, production launch, or launch-readiness claim.

Phase 6 backlog issues now live as the next granular sync layer, with #4
remaining the parent epic until the GitHub Project board can take over status
views:

| Issue | Backlog item                                       | Parent | Labels                                                                                                       |
| ----- | -------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| #54   | B-048: Add accessibility audit pass                | #4     | `priority:p0`, `type:qa`, `area:a11y`, `phase:6-hardening`, `agent-standard`                                 |
| #55   | B-049: Add reduced-motion and no-WebGL QA pass     | #4     | `priority:p0`, `type:qa`, `area:a11y`, `area:motion`, `phase:6-hardening`, `agent-standard`                  |
| #56   | B-050: Add Lighthouse production-like checks       | #4     | `priority:p0`, `type:qa`, `area:performance`, `area:seo`, `area:a11y`, `phase:6-hardening`, `agent-standard` |
| #57   | B-051: Add bundle analysis and performance budgets | #4     | `priority:p0`, `type:qa`, `area:performance`, `area:frontend`, `phase:6-hardening`, `agent-standard`         |
| #58   | B-052: Add Playwright journey smoke tests          | #4     | `priority:p0`, `type:qa`, `area:frontend`, `phase:6-hardening`, `agent-standard`                             |
| #59   | B-053: Add security headers and dependency audit   | #4     | `priority:p0`, `type:qa`, `area:security`, `area:infra`, `phase:6-hardening`, `agent-standard`               |
| #60   | B-054: Add privacy documentation                   | #4     | `priority:p0`, `type:docs`, `area:privacy`, `phase:6-hardening`, `agent-standard`                            |
| #61   | B-055: Add cross-browser and responsive QA pass    | #4     | `priority:p0`, `type:qa`, `area:frontend`, `area:design`, `phase:6-hardening`, `agent-standard`              |
| #62   | B-056: Add API outage resilience test              | #4     | `priority:p0`, `type:qa`, `area:backend`, `area:frontend`, `phase:6-hardening`, `agent-standard`             |

Phase 6 issue sync status: complete. B-048 through B-056 are mirrored as #54
through #62. This is only GitHub issue mirror evidence; it is not a Project
board recovery, production launch, or launch-readiness claim.

Phase 7 backlog issues now live as the next granular sync layer, with #5
remaining the parent epic until the GitHub Project board can take over status
views:

| Issue | Backlog item                                          | Parent | Labels                                                                                         |
| ----- | ----------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| #63   | B-057: Configure Cloudflare Pages frontend deployment | #5     | `priority:p0`, `type:task`, `area:infra`, `phase:7-launch`, `agent-standard`                   |
| #64   | B-058: Deploy Rust API to selected host               | #5     | `priority:p0`, `type:task`, `area:backend`, `area:infra`, `phase:7-launch`, `agent-standard`   |
| #65   | B-059: Configure production domain and canonical URLs | #5     | `priority:p0`, `type:task`, `area:infra`, `area:seo`, `phase:7-launch`, `agent-standard`       |
| #66   | B-060: Write local development and deployment README  | #5     | `priority:p0`, `type:docs`, `area:ops`, `phase:7-launch`, `agent-standard`                     |
| #67   | B-061: Write content update and redaction runbook     | #5     | `priority:p0`, `type:docs`, `area:content`, `area:privacy`, `phase:7-launch`, `agent-standard` |
| #68   | B-062: Write rollback and incident runbook            | #5     | `priority:p0`, `type:docs`, `area:ops`, `area:infra`, `phase:7-launch`, `agent-standard`       |
| #69   | B-063: Complete launch checklist                      | #5     | `priority:p0`, `type:qa`, `area:ops`, `phase:7-launch`, `agent-standard`                       |

Phase 7 issue sync status: complete. B-057 through B-063 are mirrored as #63
through #69. #66, #67, and #68 are closed as docs/runbook tasks. #63 remains
open because the Cloudflare Pages frontend provider/project and production
deploy evidence are not complete; #64 remains open because the API
host/provider and public /api/health evidence are not complete; #65 remains
open because the final domain, canonical URLs, DNS, and TLS evidence are not
complete; #69 remains open because launch validation evidence is not complete.
This is only GitHub issue mirror evidence; it is not a Project board recovery,
production deployment, or launch-readiness claim.

Phase 7 deployment decision packet status: progress evidence only.
`runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md` records the provider, API,
domain, production smoke, Lighthouse, rollback, contact-handling, and redaction
evidence still required for #63, #64, #65, and #69. #63, #64, #65, and #69
remain open until real production evidence exists.

Phase 7 local readiness contract status: local-readiness only; production
remains blocked. `scripts/phase-7-local-readiness-contract.test.mjs` now guards
the safe local frontend, API, metadata, and evidence commands that can run
before provider accounts, domains, production secrets, or rollback targets
exist. #63, #64, #65, and #69 remain open until real production evidence and
four approved case studies exist.

Phase 7 blocker traceability status: issue-to-evidence mapping only; production
remains blocked. `runbooks/LAUNCH_BLOCKERS_REGISTER.md` now maps #63, #64, #65,
and #69 to their controlling launch-blocker decisions and the replacement
evidence rows required before issue closure. This is traceability evidence only;
it is not production deploy evidence, launch-readiness evidence, or permission
to close #63, #64, #65, or #69.

Phase 8 backlog issues now live as the next granular sync layer, with #5
remaining the parent epic until the GitHub Project board can take over status
views:

| Issue | Backlog item                                     | Parent | Labels                                                                                                                  |
| ----- | ------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| #70   | B-064: Evaluate portfolio assistant scope        | #5     | `priority:p2`, `type:research`, `area:backend`, `area:privacy`, `phase:8-post-launch`, `agent-standard`                 |
| #71   | B-065: Add portfolio assistant prototype         | #5     | `priority:p2`, `type:feature`, `area:backend`, `area:frontend`, `area:privacy`, `phase:8-post-launch`, `agent-standard` |
| #72   | B-066: Add richer public status or metadata page | #5     | `priority:p2`, `type:feature`, `area:backend`, `area:frontend`, `phase:8-post-launch`, `agent-standard`                 |
| #73   | B-067: Add additional notes and postmortems      | #5     | `priority:p2`, `type:content`, `area:content`, `phase:8-post-launch`, `agent-standard`                                  |
| #74   | B-068: Evaluate API hosting migration            | #5     | `priority:p2`, `type:research`, `area:infra`, `area:backend`, `phase:8-post-launch`, `agent-standard`                   |

Phase 8 issue sync status: complete. B-064 through B-068 are mirrored as #70
through #74. This is only GitHub issue-sync evidence; it is not a Project
board recovery, production launch, launch-readiness claim, or post-launch
feature approval, and it is not authorization to build the assistant before
#70 has B-063 launch evidence, HumanKaylee approval, and an approved outcome
of `build`.

Phase 8 prep status: pre-launch planning only. `runbooks/POST_LAUNCH_FEATURE_PREP.md`,
`docs/ASSISTANT_SCOPE_DECISION.md`, and
`scripts/post-launch-feature-prep-contract.test.mjs` record safe decision inputs
for the assistant scope, assistant prototype gate, public status/metadata page,
additional notes/postmortems, and API hosting migration. The assistant scope
note recommends deferring implementation until B-063 launch evidence and
HumanKaylee approval exist. #70 remains open until B-063 launch evidence and
HumanKaylee approval exist. B-065 remains blocked until #70 has that approval
and the approved outcome is `build`. #70 through #74 remain open until their
launch, approval, and production-evidence dependencies are satisfied.

Granular live GitHub issue verification now covers all documented granular
issues #7 through #74 with paginated GitHub API results. Completed granular
issues may be open or closed as execution advances, but unresolved blocker,
content-redaction, deployment, launch-checklist, and post-launch guard issues
must remain open until their external decision or evidence gate is satisfied.
This keeps the Project board scope blocker wording above unchanged while
verifying the repo issue bridge more broadly.

Run live granular issue verification explicitly with:

```bash
HK_VERIFY_GITHUB_LIVE=1 node --test scripts/github-live-issue-sync.test.mjs
```

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
| `FLY_API_TOKEN`         | Fly.io API deploy                         | Only if Fly.io is selected.                                |
| `RAILWAY_TOKEN`         | Railway API deploy                        | Only if Railway is selected.                               |

Exact provider commands and rollback steps are maintained in
`runbooks/DEPLOYMENT.md`.
