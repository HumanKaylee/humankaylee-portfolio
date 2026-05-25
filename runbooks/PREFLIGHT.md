# Preflight

Date: 2026-05-25T08:31:42-04:00
Branch: `goal/portfolio-implementation`
Checkout head at refresh: `a1a98cb811f2e9708635b14e7087c9a455f4ea3d`
Scope: local read-only readiness refresh. This file avoids storing secrets,
private hostnames, private access paths, and full local home-directory paths.

## Purpose

Record the current local readiness state for the HumanKaylee portfolio
implementation without turning local, PR, or docs evidence into production
readiness evidence. Future refreshes should keep this file sanitized and record
command output for `date -Is`, `git status --short --branch`,
`git rev-parse HEAD`, `git remote -v`, `node --version`,
`corepack --version`, `pnpm --version`, `rustc --version`,
`cargo --version`, `gh auth status`, `git --version`, and `codex --version`.
Do not store credentials, private paths, hostnames, raw logs, or secrets.
Track GitHub Project scope or sync regressions as Project-board maintenance
issues, not as repository readiness failures. Do not run `gh auth refresh` from
unattended automation.

## Repository

```text
path: humankaylee-portfolio checkout
branch: goal/portfolio-implementation
checkout head at refresh: a1a98cb811f2e9708635b14e7087c9a455f4ea3d
remote fetch: https://github.com/HumanKaylee/humankaylee-portfolio.git
remote push: https://github.com/HumanKaylee/humankaylee-portfolio.git
base branch: main
status at evidence collection: working tree clean at evidence collection
```

## GitHub Authentication

```text
host: github.com
protocol: https
authenticated: yes
account: HumanKaylee
credential value: omitted
repository scopes: present for repo and workflow operations
GitHub Project scopes: available for Project list/create/update maintenance
```

GitHub repository exists and is private:

```text
HumanKaylee/humankaylee-portfolio
https://github.com/HumanKaylee/humankaylee-portfolio
```

## System

```text
Linux x86_64, kernel 6.8.0-111-generic
Linux Mint 22.3 / Ubuntu 24.04 noble base per local operator instructions
```

## Required Tools

| Tool     | Version                       | Path                        | Status                             |
| -------- | ----------------------------- | --------------------------- | ---------------------------------- |
| node     | v22.22.2                      | mise-managed Node 22        | ready                              |
| corepack | 0.34.6                        | mise-managed Node 22        | ready                              |
| pnpm     | 10.33.2                       | user pnpm installation      | ready                              |
| rustc    | 1.95.0 (59807616e 2026-04-14) | user Rust toolchain         | ready                              |
| cargo    | 1.95.0 (f2d3ce0bd 2026-03-21) | user Rust toolchain         | ready                              |
| gh       | 2.92.0 (2026-04-28)           | system GitHub CLI           | ready                              |
| git      | 2.43.0                        | system git                  | ready                              |
| codex    | codex-cli 0.133.0             | user Codex CLI installation | ready                              |

## Helpful Local Tools

| Tool | Version                          | Status                                   |
| ---- | -------------------------------- | ---------------------------------------- |
| mise | 2026.4.24 linux-x64 (2026-04-27) | ready; newer 2026.5.15 available         |
| bun  | 1.3.13                           | available but not selected for this repo |
| uv   | 0.11.8                           | available                                |
| just | 1.50.0                           | available                                |

## Command Evidence Summary

| Check                     | Command                                                                                                                                                                                                                                                        | Sanitized Output                                                                                                                                                                                       | Status                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| Timestamp                 | `date -Is`                                                                                                                                                                                                                                                     | `2026-05-25T08:31:42-04:00`                                                                                                                                                                            | recorded                            |
| Git branch                | `git status --short --branch`                                                                                                                                                                                                                                  | `## goal/portfolio-implementation...origin/goal/portfolio-implementation`; working tree clean at evidence collection                                                                                     | ready                               |
| Git head                  | `git rev-parse HEAD`                                                                                                                                                                                                                                           | `a1a98cb811f2e9708635b14e7087c9a455f4ea3d`                                                                                                                                                             | recorded                            |
| Git remotes               | `git remote -v`                                                                                                                                                                                                                                                | `origin https://github.com/HumanKaylee/humankaylee-portfolio.git (fetch)`; `origin https://github.com/HumanKaylee/humankaylee-portfolio.git (push)`                                                    | ready                               |
| Node                      | `node --version`                                                                                                                                                                                                                                               | `v22.22.2`                                                                                                                                                                                             | ready                               |
| Corepack                  | `corepack --version`                                                                                                                                                                                                                                           | `0.34.6`                                                                                                                                                                                               | ready                               |
| pnpm                      | `pnpm --version`                                                                                                                                                                                                                                               | `10.33.2`                                                                                                                                                                                              | ready                               |
| Rust compiler             | `rustc --version`                                                                                                                                                                                                                                              | `rustc 1.95.0 (59807616e 2026-04-14)`                                                                                                                                                                  | ready                               |
| Cargo                     | `cargo --version`                                                                                                                                                                                                                                              | `cargo 1.95.0 (f2d3ce0bd 2026-03-21)`                                                                                                                                                                  | ready                               |
| GitHub auth               | `gh auth status`                                                                                                                                                                                                                                               | Logged in to `github.com` as `HumanKaylee`; active account true; Git operations use HTTPS; credential value omitted; repository/workflow operations available                                          | ready for repo operations           |
| GitHub Project discovery  | `GH_PROMPT_DISABLED=1 gh project list --owner HumanKaylee --format json`                                                                                                                                                                                       | Command exited `0`: private Project #1 `HumanKaylee Portfolio` exists at `https://github.com/users/HumanKaylee/projects/1` with 19 fields and 15 synced items                                           | ready                               |
| Git                       | `git --version`                                                                                                                                                                                                                                                | `git version 2.43.0`                                                                                                                                                                                   | ready                               |
| Codex                     | `codex --version`                                                                                                                                                                                                                                              | `codex-cli 0.133.0`                                                                                                                                                                                    | ready                               |
| Downloaded resume recheck | `sha256sum ~/Downloads/'Joe Poznanski Resume February 2026.pdf' apps/web/public/downloads/humankaylee-resume.pdf`; `cmp -s ~/Downloads/'Joe Poznanski Resume February 2026.pdf' apps/web/public/downloads/humankaylee-resume.pdf; printf 'cmp_exit=%s\n' "$?"` | Both files hashed to `3a6f35bf0f565fb9bbf2009665b40ae7a556dd39ff99e0d04043cab8a4c5f477`; `cmp_exit=0`                                                                                                  | local approved-source evidence only |

## Readiness Notes

- Local development and verification can proceed with the selected Astro,
  pnpm, and Rust Axum stack.
- Project board access is available. Project #1 exists and contains the current
  open live-bridge issue set; future Project work is maintenance for new or
  relabeled issues.
- Resume source recheck remained byte-identical to the committed static PDF
  asset and did not require an asset update.
- No credentials, private hostnames, private access paths, raw logs, or full
  local home-directory paths are stored in this file.
- This is local preflight evidence only. It does not clear production deploy,
  DNS/TLS, API health, contact handling, rollback, Lighthouse, or redaction
  approval blockers.
