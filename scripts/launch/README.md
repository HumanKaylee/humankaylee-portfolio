# Launch harness — M3 + M4 scripts

Pre-prepared scripts that run the deterministic parts of M3 (DNS+TLS+routes) and M4 (production Lighthouse + Playwright + contact-form smoke) once the operator finishes the 8 manual steps in `runbooks/DEPLOYMENT.md § "M1 — Frontend Deploy: Operator Handoff"` and the D-03 hosting decision in `runbooks/HUMAN_DECISIONS_QUEUE.md`.

## Files

| Script | Purpose | Runtime | Idempotency |
|---|---|---|---|
| `m3-dns-verify.sh` | DNS A → CF anycast, TLS valid, 12 critical routes 200, API /api/health, WASM `application/wasm` content-type | < 5 min if DNS already propagated; up to 15 min with retry ladder | Safe — read-only |
| `m4-production-smoke.sh` | Lighthouse on 5 pages, Playwright @production, contact-form e2e | ~5–10 min | One contact-form POST per run, tagged `M4-smoke-<ts>` for cleanup |

## Usage

After the operator completes the 8 manual steps (Cloudflare account + Pages project + domain + API token + GitHub secrets + custom-domain binding + first deploy + backend deploy per D-03 pick):

```bash
cd /c/Users/joepo/projects/humankaylee-portfolio
chmod +x scripts/launch/*.sh

# M3 — DNS + TLS + routes + API + WASM
./scripts/launch/m3-dns-verify.sh

# M4 — production Lighthouse + Playwright + contact form
./scripts/launch/m4-production-smoke.sh
```

Both scripts:
- Read `DOMAIN` (default `humankaylee.dev`) and `API_DOMAIN` (default `api.humankaylee.dev`) from env.
- Append a structured row to `runbooks/LAUNCH_EVIDENCE.md` on PASS.
- Exit with codes from the goal-plan Section 11B halt-on-failure table (0=PASS, 1=permanent, 2=transient exhausted, 3=preflight fail, 4=operator-pause).

## Override examples

```bash
DOMAIN=joepo.engineering API_DOMAIN=api.joepo.engineering ./scripts/launch/m3-dns-verify.sh
```

## Retry behavior

`m3-dns-verify.sh` has a retry ladder of `[60, 120, 300]` seconds for DNS propagation, matching the canonical plan's transient-retry policy. Max wait per check ≈ 7.7 min.

`m4-production-smoke.sh` does NOT auto-retry — Lighthouse score variance is real and a failed run is usually a real signal, not a transient blip.

## After M4 passes

M5 redaction is already approved (4/4 case studies green). M6 launch checklist closure runs:

```bash
# M6 closure (manual or scripted)
node scripts/final-launch-checklist-contract.test.mjs    # all rows green
gh pr view 6 --json mergeStateStatus -q .mergeStateStatus  # expect CLEAN
gh pr merge 6 --merge --delete-branch=false                # operator click
git tag v1.0.0 && git push origin v1.0.0
```

Then the 4 P0 issues (#63, #64, #65, #69) auto-close on merge if the PR description has `Closes #63, #64, #65, #69`; otherwise close them manually with a reference to the v1.0.0 tag.
