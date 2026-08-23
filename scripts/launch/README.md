# Launch harness — M3 + M4 read-only probes

These scripts cover the deterministic, read-only parts of public-origin
verification after an operator has completed the authorized deployment steps.
They do not deploy, modify remote state, submit visitor data, close issues, or
grant launch approval.

## Files

| Script | Purpose | Runtime | Idempotency |
| --- | --- | --- | --- |
| `m3-dns-verify.sh` | Verify DNS, TLS, final Signal / Proof routes, canonical URLs, résumé PDF, static artifacts, WASM, and legacy redirect inputs | Under 5 minutes after DNS propagation; up to about 8 minutes with the retry ladder | Safe and read-only against the public origin |
| `m4-production-smoke.sh` | Run Lighthouse on five current pages, optional read-only Playwright checks, static Contact direct channels, and the local bundle gate | About 5–10 minutes | Safe and read-only against the public origin |

The old public paths are legacy redirect inputs only. They must redirect to
canonical Work destinations and must never be counted as successful final-page
targets.

## Usage

Run only after the operator has approved the target public origin:

```bash
cd /c/Users/joepo/projects/humankaylee-portfolio
chmod +x scripts/launch/*.sh

# M3 — DNS + TLS + final routes + canonical/redirect/static assets
./scripts/launch/m3-dns-verify.sh

# M4 — production Lighthouse + optional Playwright + static Contact proof
./scripts/launch/m4-production-smoke.sh
```

Both scripts:

- Read `DOMAIN` (default `joepoznanski.io`) from the environment.
- Perform GET, HEAD, DNS, TLS, or browser-audit probes only.
- Write local artifacts under `test-results/` and may append a local evidence
  row after every probe passes.
- Exit using the established halt-on-failure values: 0 pass, 1 permanent
  failure, 2 exhausted transient failure, 3 preflight failure, 4 operator
  pause.

## Override example

```bash
DOMAIN=preview.joepoznanski.io ./scripts/launch/m3-dns-verify.sh
DOMAIN=preview.joepoznanski.io ./scripts/launch/m4-production-smoke.sh
```

## Retry behavior

`m3-dns-verify.sh` uses the `[60, 120, 300]`-second DNS retry ladder. It does
not retry permanent route, canonical, asset, or redirect-contract failures.

`m4-production-smoke.sh` does not auto-retry. Lighthouse variance and a failed
public-origin probe are evidence to inspect, not conditions to hide with a
loop.

## Evidence boundary

A passing M3 or M4 run proves only the named public-origin checks at that time.
It does not authorize a merge, tag, deploy, issue closure, or launch. Record
the exact origin, commit, artifacts, and operator review separately before any
outward-facing action.
