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

