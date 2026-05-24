# Preflight

Date: 2026-05-23T12:17:23-04:00
Branch: `goal/portfolio-implementation`
Scope: private repository implementation preflight. This file avoids storing secrets, private hostnames, private access paths, and full local home-directory paths.

## Purpose

Record the Phase 0 readiness state before scaffolding the HumanKaylee portfolio implementation.
Future preflight refreshes should keep this file sanitized and record command
output for `date`, `git status --short --branch`, `git remote -v`,
`node --version`, `corepack --version`, `pnpm --version`, `rustc --version`,
`cargo --version`, `gh auth status`, `git --version`, and `codex --version`.
Do not store tokens, private paths, hostnames, or secrets. Track missing GitHub
Project scopes as a Project-board blocker, not as a repository readiness
failure.

## Repository

```text
path: humankaylee-portfolio checkout
branch: goal/portfolio-implementation
remote fetch: https://github.com/HumanKaylee/humankaylee-portfolio.git
remote push: https://github.com/HumanKaylee/humankaylee-portfolio.git
base branch: main
```

## GitHub Authentication

```text
host: github.com
protocol: https
authenticated: yes
token scopes: repo and workflow scopes present; full token and complete scope list intentionally omitted
missing for GitHub Projects: project, read:project
```

GitHub repository exists and is private:

```text
HumanKaylee/humankaylee-portfolio
https://github.com/HumanKaylee/humankaylee-portfolio
```

## System

```text
Linux x86_64, kernel 6.8.0-111-generic
Linux Mint 22.3 / Ubuntu 24.04 noble base per /home/joe/AGENTS.md
```

## Required Tools

| Tool | Version | Path | Status |
| --- | --- | --- | --- |
| node | v22.22.2 | mise-managed Node 22 | ready |
| corepack | 0.34.6 | mise-managed Node 22 | ready |
| pnpm | 10.33.2 | user pnpm installation | ready |
| rustc | 1.95.0 (59807616e 2026-04-14) | user Rust toolchain | ready |
| cargo | 1.95.0 (f2d3ce0bd 2026-03-21) | user Rust toolchain | ready |
| gh | 2.92.0 (2026-04-28) | system GitHub CLI | ready, except Project board scopes |
| git | 2.43.0 | system git | ready |
| codex | codex-cli 0.133.0 | user Codex CLI installation | ready |

## Helpful Local Tools

| Tool | Version | Status |
| --- | --- | --- |
| mise | 2026.4.24 linux-x64 (2026-04-27) | ready; newer 2026.5.15 available |
| bun | 1.3.13 | available but not selected for this repo |
| uv | 0.11.8 | available |
| just | 1.50.0 | available |

## Readiness Notes

- Phase 0 can proceed with the selected Astro, pnpm, and Rust Axum stack.
- GitHub Project board creation remains blocked until `gh auth refresh --hostname github.com -s project,read:project` is completed interactively.
- No secrets, private hostnames, private access paths, or full local home-directory paths are stored in this file.
