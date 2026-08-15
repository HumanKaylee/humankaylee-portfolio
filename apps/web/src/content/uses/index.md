---
title: "Uses: hardware, software, and tooling"
lastReviewed: "2026-08-15"
sections:
  - label: "Hardware"
    items:
      - name: "ASUS ROG Strix (Windows 11 + WSL2 Ubuntu 24.04)"
        why: "WSL2 is the canonical runtime for all scripts, cron jobs, and agent orchestration. Windows handles scheduled tasks and the Rust toolchain compiles equally well from both sides."
      - name: "Secondary compute host (Linux)"
        why: "Handles long-running compute and collection workloads outside the primary workstation."
      - name: "Private device network"
        why: "Connects trusted devices with encrypted access while keeping operational addresses and paths out of public documentation."
  - label: "Editor and shell"
    items:
      - name: "VS Code + Helix (situation-dependent)"
        why: "VS Code for anything with a Claude Code CLI session attached; Helix for quick terminal edits where modal keybindings are faster than reaching for the mouse."
      - name: "WezTerm"
        why: "GPU-accelerated, cross-platform, and configurable in Lua without a plugin ecosystem to maintain. Multiplexing replaces most tmux use."
      - name: "Starship prompt"
        why: "Fast and context-aware. Shows git state, Rust toolchain version, and exit codes without shell-startup overhead."
      - name: "Zsh + Atuin"
        why: "Atuin replaces Ctrl-R with a searchable, synced shell history. The delta between remembering a command and finding it in history collapses."
  - label: "Languages and runtimes"
    items:
      - name: "Rust"
        why: "First choice for anything compute-critical, latency-sensitive, or where I want type-system guarantees at integration boundaries. The WASM pricer and API service are both Rust."
      - name: "Python"
        why: "Data pipelines, strategy code, and scripting where the ecosystem (numpy, pandas, scipy) is the right fit. pyright keeps the type boundaries honest."
      - name: "Node / TypeScript"
        why: "Frontend build tooling and Astro. TypeScript with strict mode is a prerequisite because untyped JavaScript has too high a per-change reasoning cost."
      - name: "Bash"
        why: "Glue scripts and cron wrappers. Kept short and single-purpose; anything that needs real logic gets promoted to Rust or Python."
  - label: "AI-assisted development"
    items:
      - name: "Claude Code CLI"
        why: "Primary AI pair-programmer for complex multi-file changes, agent swarm orchestration, and anything that benefits from deep codebase context."
      - name: "Codex CLI"
        why: "Complementary agent runtime for tasks that benefit from a parallel execution lane or a different model's reasoning style."
      - name: "Agent swarm patterns"
        why: "Independent tasks run in parallel lanes with explicit halt-state contracts, SHA sidecar verification, and orphan-runner detection. The overhead pays for itself on anything spanning more than 5 files."
  - label: "Infrastructure"
    items:
      - name: "Cloudflare Pages"
        why: "Static frontend hosting with a global CDN. The build and deployment path stays simple and keeps the primary portfolio routes static-first."
      - name: "Fly.io"
        why: "Hosts a small optional API enhancement while the public site remains useful without it."
      - name: "GitHub Actions"
        why: "CI/CD for the monorepo. The pipeline runs Vitest, TypeScript checks, Playwright, and cargo test before any merge."
      - name: "SQLite"
        why: "A practical transactional database for local tooling and data pipelines where a simple deployment model is the right fit."
  - label: "CLI tooling"
    items:
      - name: "ripgrep (rg)"
        why: "5-10x faster than grep on large repos. Respects .gitignore by default. The single biggest productivity uplift in the 2026-04-28 tooling rollout."
      - name: "fd"
        why: "Replaces find with sane defaults and gitignore awareness. The syntax is intuitive enough to use without consulting the man page."
      - name: "bat, delta, lazygit"
        why: "bat for syntax-highlighted cat output, delta for readable git diffs, lazygit for staged hunks and interactive rebase without leaving the terminal."
      - name: "gh CLI"
        why: "GitHub API from the shell. PR creation, issue management, and CI status without opening a browser tab."
---

The philosophy behind this list: prefer terminal-native, prefer composable, prefer
tools whose failure mode is loud rather than silent. A tool that silently returns
empty results when it can't find something is more dangerous than one that errors.

**Churn-resistance matters more than novelty.** I add something to this list when
it solves a real problem I had before, not when it trends on Hacker News. Most of
the CLI tools here were added in a single deliberate rollout after auditing actual
bottlenecks, not accumulated one-by-one over years of reading newsletters.

**AI pair-programming is default-on.** Claude Code CLI is open for most coding
sessions. The agent context window and file access make it genuinely useful for
the kind of multi-file, multi-layer changes that used to require a whiteboard.
The key shift is treating it as a pair-programmer with a persistent codebase
understanding, not a code-completion widget.

**The Rust/Python/TypeScript split is intentional.** Rust owns anything where
correctness and performance matter at the boundary: APIs, WASM, CLI tools with
production impact. Python owns data pipelines and strategy code where the
ecosystem is the right fit. TypeScript owns the frontend where type-checked
component boundaries prevent the class of silent runtime failures that make
JavaScript codebases hard to maintain at scale.
