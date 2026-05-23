# GitHub Sync Runbook

## Repository

- Owner: `HumanKaylee`
- Repository: `humankaylee-portfolio`
- Visibility: private
- URL: `https://github.com/HumanKaylee/humankaylee-portfolio`

## GitHub Project Board

Attempted:

```bash
gh project create --owner HumanKaylee --title "HumanKaylee Portfolio" --format json
```

Result:

```text
error: your authentication token is missing required scopes [project read:project]
```

`gh auth refresh --hostname github.com -s project,read:project` requires interactive device-code approval. Until that is completed, keep project-board state in repo docs and GitHub issues.

## Issue Sync Plan

Create labels:

```bash
gh label create phase-0 --color 6B7280 --description "Foundation and planning"
gh label create phase-1 --color 2563EB --description "Frontend foundation"
gh label create phase-2 --color 16A34A --description "Content and case studies"
gh label create phase-3 --color C2410C --description "Rust backend"
gh label create phase-4 --color 7C3AED --description "Visual polish and 3D"
gh label create phase-5 --color DC2626 --description "Launch hardening"
gh label create agent-small --color A3E635 --description "Suitable for smaller LLM agent"
gh label create agent-standard --color FACC15 --description "Requires standard model"
gh label create agent-strong --color F97316 --description "Requires strong model or senior review"
```

Create issues from `docs/BACKLOG.md` after the backlog is finalized.

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
