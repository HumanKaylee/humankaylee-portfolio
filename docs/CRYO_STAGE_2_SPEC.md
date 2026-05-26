# Cryo-Flow-Sim Stage 2 — Interactive Embed Spec (Draft 2026-05-26)

**Status:** Draft — implementation deferred to post-launch v1.3+  
**Owner:** Joe Poznanski  
**Last updated:** 2026-05-26  
**Cross-references:**
- `apps/web/src/content/case-studies/cryo-flow-sim.md` (Stage 1 case study)
- `docs/RESEARCH.md` §8.3 (cryo-flow-sim mention)
- `C:\Users\joepo\projects\cryo-flow-sim-showcase\docs\roadmap.md` Phase 6

---

## Goal

Replace the static Stage 1 video on `/case-studies/cryo-flow-sim/` with an
interactive embed: a visitor manipulates 3–5 valve controls in real time, the
Rust simulation backend responds, and the Three.js dashboard renders the live
state. The Stage 1 video remains as a `prefers-reduced-motion` and
`prefers-reduced-data` fallback — it is not removed when Stage 2 lands.

The embed should read as a credible engineering artifact to a senior engineer
or recruiter in the first 10 seconds of interaction: realistic industrial P&ID
aesthetics, live valve travel animations, and telemetry labels that respond to
control inputs.

---

## Stage 1 Recap

Stage 1 (complete as of 2026-05-24) produced:

- A deterministic Rust workspace: `cryo-core` (pure physics, no I/O),
  `cryo-service` (Axum HTTP + SSE), and `cryo-web` (Three.js dashboard).
- A 96.9-second 1920×1080 MP4 and GIFs verified by 92 passing tests and
  zero unexpected clamp events.
- A `run-metadata.json` provenance record with git SHA, seed, and
  per-threshold validation results.
- Playwright automation that drives the service API and captures the recording
  in a single deterministic run.

The key Stage 1 architectural insight for Stage 2: `cryo-core` is a pure Rust
crate with no I/O dependencies. It is WASM-compilable without modification.

---

## Architecture Summary

The Stage 1 system is a three-crate Rust workspace. The service architecture is:

```
Visitor browser
  └── cryo-web (Three.js dashboard, SSE subscriber, control form)
       └── cryo-service (Axum HTTP, SSE broadcaster, runtime actor)
            └── cryo-core (physics: tanks, valves, pipes, sensors — pure Rust, no I/O)
```

For portfolio embed purposes, this architecture presents a hosting dilemma:
keeping `cryo-service` alive means a second always-on Rust process alongside
the main `humankaylee-api`. Embedding Stage 2 in the portfolio means
evaluating two options:

**Option A — Server-side cryo-service:** Run `cryo-service` as a separate
Axum service alongside the portfolio API, proxied or linked via the main
deployment. The dashboard connects via SSE and REST as it does locally.
Cost: an additional long-running process, second service deployment/auth/cost
surface, and non-trivial CORS + proxy configuration.

**Option B — WASM client-side (recommended):** Compile `cryo-core` to
WebAssembly via `wasm-pack`. The simulation runs entirely in the visitor's
browser, with a thin JavaScript glue layer replacing the `cryo-service` SSE
actor. Cost: zero ongoing infrastructure; the embed is a static asset bundle.

---

## Recommendation: WASM Client-Side

For a portfolio case study, Option B is the correct architectural choice.

**Rationale:**

1. `cryo-core` has no I/O by design (per `architecture.md` §Core Boundary:
   "It should not depend on `axum`, browser UI code, Playwright, wall-clock
   time, file paths, or OS APIs."). This was explicitly designed to enable
   WASM compilation.

2. A second always-on Rust service doubles infrastructure complexity and cost
   with no audience benefit. Recruiters and engineers do not care whether the
   simulation runs on a server or in their browser — they care that it runs
   correctly and looks credible.

3. The Three.js rendering layer in `cryo-web` already runs in the browser.
   Replacing the SSE/REST polling loop with a direct WASM call removes network
   latency and eliminates the service-layer attack surface.

4. The WASM binary can be served as a static file from `apps/web/public/wasm/`,
   keeping the embed self-contained within the existing Cloudflare Pages or
   equivalent static host deployment.

5. If a future visitor wants to run the full server-side simulation locally,
   the Stage 1 artifacts and documentation already provide that path.

**What changes vs Stage 1:** The `cryo-service` Axum layer is bypassed in the
embed. A thin `cryo-sim-wasm` crate wraps `cryo-core` for `wasm-pack`, and a
React island replaces the SSE subscriber with a `requestAnimationFrame` loop
that calls the WASM step function and feeds the result to the Three.js scene.

---

## Proposed File Tree

Files that Stage 2 would add to this portfolio repo:

```
apps/
  api/
    crates/
      cryo-sim-wasm/          ← NEW: wasm-pack wrapper crate
        Cargo.toml              cargo workspace member
        src/
          lib.rs                #[wasm_bindgen] exports
  web/
    public/
      wasm/
        cryo-sim/             ← NEW: wasm-pack output (gitignored during dev, committed for deploy)
          cryo_sim_wasm_bg.wasm
          cryo_sim_wasm.js
          package.json
    src/
      components/
        CryoInteractive.astro ← NEW: Astro island shell (client:visible)
        cryo/
          Dashboard.tsx       ← NEW: React island, Three.js scene owner
          ValveControls.tsx   ← NEW: valve slider controls
          useSimulation.ts    ← NEW: WASM init + step loop hook
          types.ts            ← NEW: TypeScript mirror of WASM StateSnapshot
```

The existing `cryo-flow-sim.md` case study and all Stage 1 media files
(`apps/web/public/media/cryo-flow-sim-stage1.mp4`, poster PNG) are unchanged.

---

## WASM API Surface

The `cryo-sim-wasm` crate exports the following surface via `#[wasm_bindgen]`:

```rust
/// Initialize a new simulation with a fixed deterministic seed.
/// Returns an opaque handle.
pub fn init(seed: u64) -> CryoSim;

impl CryoSim {
    /// Advance the simulation by dt seconds.
    pub fn step(&mut self, dt_seconds: f64);

    /// Set a valve's target open fraction (0.0–1.0).
    /// Returns Err if valve_id is unknown or value is out of range.
    pub fn set_valve_position(&mut self, valve_id: &str, value: f64) -> Result<(), JsValue>;

    /// Return the current state snapshot as a JS object.
    /// Shape matches the cryo-core StateSnapshot: tanks[], valves[], pipes[].
    pub fn get_state(&self) -> JsValue;

    /// Reset to deterministic initial state for the given seed.
    pub fn reset(&mut self, seed: u64);
}
```

The `get_state()` return shape (abbreviated):

```typescript
interface StateSnapshot {
  tick: number;
  sim_time_s: number;
  tanks: Array<{
    id: string;
    pressure_kpa: number;
    fill_fraction: number;
    liquid_temp_k: number;
    wall_temp_k: number;
    health: "nominal" | "warning" | "invalid";
  }>;
  valves: Array<{
    id: string;
    kind: "fill" | "transfer" | "vent" | "isolation" | "relief";
    commanded_open_fraction: number;
    actual_open_fraction: number;
    travel_remaining_s: number;
    health: string;
  }>;
  pipes: Array<{
    id: string;
    wall_temp_k: number;
    flow_kg_s: number;
    cold_fraction: number;
  }>;
}
```

This shape is derived from the authoritative contract in
`cryo-flow-sim-showcase/docs/contracts.md §State Snapshot`. The WASM layer
does not invent new types; it re-exports a subset of the existing `cryo-core`
state.

---

## Performance Budget

| Asset | Target | Notes |
| --- | --- | --- |
| `cryo_sim_wasm_bg.wasm` (gzipped) | ≤ 250 KB | cryo-core carries physics state machines; larger than a math-only crate |
| Three.js bundle (gzipped) | ≤ 200 KB | Existing cryo-web already uses Three.js; reuse its scene graph patterns |
| ValveControls + Dashboard JS | ≤ 50 KB gzipped | Thin React island |
| Total JS + WASM on `/case-studies/cryo-flow-sim/` | ≤ 600 KB | Page weight budget for the interactive version |
| Simulation step budget | ≤ 2 ms/tick at 60 Hz | cryo-core headless runs at 10× real time on Threadripper; browser target is lighter |
| Render cadence | 30 fps (Three.js frame loop) | Simulation steps at 60 Hz; render throttled to 30 fps to avoid jank |

The existing portfolio bundle budget gate (`pnpm bundle:budget`) will need a
cryo-case-study exemption row: the 600 KB JS+WASM ceiling replaces the current
0 B critical-JS budget for that route. All other routes stay at their current
budgets.

---

## Visitor Controls

The embed exposes 3–5 valve sliders drawn from the Stage 1 topology (8 tanks,
12 valves). The subset is chosen for comprehensibility to a non-engineer:

- **V-101 Fill valve** — open to start LOX fill from supply tank
- **V-201 Transfer valve** — open to transfer between main tanks
- **V-301 Vent valve** — open to reduce ullage pressure
- **V-401 Isolation valve** — close to isolate a branch (demonstrating
  pressure hold)

A "Reset" button returns the simulation to seed state. A "Pause" toggle stops
the step loop. A scenario preset ("Full fill sequence") replays the Stage 1
showcase command timeline autonomously, letting the visitor watch without
interacting.

The Three.js dashboard renders a simplified version of the Stage 1 P&ID scene:
- Tank fill level animation (fill fraction → rendered liquid height)
- Pipe thermal color shift (cold_fraction → cyan blend on warm green)
- Valve stem position indicator (actual_open_fraction → SVG stem angle)
- Live pressure / temperature / fill labels (monospaced industrial style)

---

## Accessibility

| Concern | Implementation |
| --- | --- |
| Keyboard valve control | Range inputs for each valve; arrow keys adjust ±0.05 steps; Tab order follows physical layout top-to-bottom |
| Screen reader announcements | `aria-live="polite"` region announces valve state changes on keyboard interaction (debounced 500 ms to avoid announcement floods) |
| Reduced motion | `prefers-reduced-motion: reduce` → hide the interactive embed, show the Stage 1 MP4 and poster (existing fallback unchanged) |
| Reduced data | `prefers-reduced-data` media query (where supported) → show static poster PNG instead of autoloading WASM |
| Pause on blur | Simulation step loop pauses when the embed container loses focus or leaves the viewport (`IntersectionObserver`) |
| Contrast | Valve label text meets WCAG AA against the black P&ID background |
| Touch | Valve sliders are native `<input type="range">` elements; minimum touch target 44×44 CSS px |

---

## Build Pipeline

```bash
# Step 1: Build WASM module
wasm-pack build \
  --target web \
  --out-dir apps/web/public/wasm/cryo-sim \
  apps/api/crates/cryo-sim-wasm

# Step 2: Frontend build picks up the WASM output
pnpm --filter @humankaylee/web build
```

The `cryo-sim-wasm` crate is added as a Cargo workspace member in
`apps/api/Cargo.toml`. It depends on `cryo-core` via a path dependency
pointing at the existing cryo-flow-sim-showcase workspace (or a vendored copy
of the crate for the portfolio mono-repo — TBD at implementation time based on
licensing and repo boundary decisions).

CI additions to `.github/workflows/ci.yml` Phase 0 job:

```yaml
- name: Check cryo-sim-wasm WASM target
  run: |
    rustup target add wasm32-unknown-unknown
    cargo check \
      --target wasm32-unknown-unknown \
      --manifest-path apps/api/crates/cryo-sim-wasm/Cargo.toml
```

This is a `cargo check` only (no `wasm-pack` in CI) to keep CI fast and avoid
the `wasm-pack` binary install overhead. A full `wasm-pack build` runs locally
before commits that update the WASM output artifacts.

---

## Tests

**Rust unit tests in `cryo-sim-wasm`:**  
Delegated to `cryo-core`, which already has 92 passing nextest tests covering
valve transitions, pressure cascade logic, telemetry aggregation, and API
contract boundaries. The `cryo-sim-wasm` crate itself has thin smoke tests:
`init()` does not panic, `step()` advances `tick`, `get_state()` deserializes
without error, `set_valve_position()` with an unknown ID returns `Err`.

**Playwright E2E test (`@cryo-interactive`):**

```typescript
test('@cryo-interactive valve interaction', async ({ page }) => {
  await page.goto('/case-studies/cryo-flow-sim/');
  // WASM loads on scroll-into-view (client:visible)
  await page.locator('[data-testid="cryo-embed"]').scrollIntoViewIfNeeded();
  await page.waitForSelector('[data-testid="valve-V-101-slider"]');

  // Drag the fill valve to 80% open
  const slider = page.locator('[data-testid="valve-V-101-slider"]');
  await slider.fill('0.8');

  // Assert the dashboard reflects the valve state change
  await expect(
    page.locator('[data-testid="valve-V-101-label"]')
  ).toContainText('80%', { timeout: 2000 });

  // Assert the aria-live region announced the change
  await expect(
    page.locator('[aria-live="polite"]')
  ).toContainText('V-101');
});
```

This test is tagged `@cryo-interactive` and runs in the default Playwright
suite. It is excluded from the visual regression suite (`playwright.visual.config.ts`).

---

## Decision Log

| Decision | Choice | Rejected alternative | Reason |
| --- | --- | --- | --- |
| Simulation runtime | WASM client-side | Server-side cryo-service | Zero ongoing infra cost; cryo-core designed to be I/O-free and WASM-compilable |
| Rendering | Three.js (reuse cryo-web scene graph patterns) | Pure HTML/Canvas | Existing Stage 1 work already establishes a Three.js scene; reuse is lower risk |
| React island vs Astro-only | React island (`client:visible`) | Pure Astro component | Matches the existing portfolio React island pattern; Three.js scene needs lifecycle hooks |
| Valve control UI | Inline sliders on the embed | Modal overlay or separate `/cryo-demo/` page | Single-glance comprehension for recruiters; no navigation required |
| Valve count | 4 controls (V-101, V-201, V-301, V-401) | All 12 valves | 12 sliders is overwhelming; 4 covers the interesting operational story (fill, transfer, vent, isolate) |
| wasm-pack target | `web` | `bundler` or `nodejs` | Astro + Vite consume `web` target naturally; no additional bundler plugin required |

---

## Estimated Effort

**2–3 wall-clock days** for a single experienced engineer, distributed as:

| Work item | Estimate |
| --- | --- |
| `cryo-sim-wasm` crate skeleton + wasm-bindgen exports | 0.5 days |
| Three.js scene adaptation for embed viewport (320–800 px wide vs 1920 px) | 1.0 day |
| ValveControls.tsx + useSimulation.ts hook + Dashboard.tsx | 0.5 days |
| Accessibility: aria-live, reduced-motion fallback, keyboard, touch | 0.5 days |
| Playwright `@cryo-interactive` E2E test + CI WASM check | 0.25 days |
| Bundle budget gate update + local wasm-pack build script | 0.25 days |

The complexity is concentrated in the Three.js scene-graph adaptation. The
Stage 1 scene was built for a 1920×1080 full-window viewport; the embed needs
to render credibly at 320–800 px on mobile. This requires either a simplified
topology view (fewer nodes, larger labels) or a responsive layout that
collapses the P&ID scene gracefully. The simulation physics itself is stable —
the 92 existing tests cover that boundary.

---

## Dependency on Stage 1

Stage 1 artifacts remain in place as permanent fallbacks:

- `apps/web/public/media/cryo-flow-sim-stage1.mp4` — `prefers-reduced-motion`
  and `prefers-reduced-data` fallback
- `apps/web/public/media/cryo-flow-sim-stage1-poster.png` — static image
  fallback for `prefers-reduced-data` and WASM-load failure

When Stage 2 lands, the case-study page renders:

```
┌─────────────────────────────────────────────────────┐
│  [CryoInteractive embed — client:visible]            │
│  (shows if JS+WASM loads and motion is not reduced)  │
│                                                      │
│  [Stage 1 video fallback — always present in DOM]   │
│  (visible when: reduced-motion, reduced-data,        │
│   WASM load failure, or JS disabled)                 │
└─────────────────────────────────────────────────────┘
```

The fallback is unconditional: even if the WASM embed is rendered, the Stage 1
video element is present in the DOM and becomes visible via CSS media query
when `prefers-reduced-motion: reduce` is active. This preserves the no-JS and
reduced-motion behavior that the existing Playwright quality gates verify.

---

## Out of Scope

- **Multiplayer / shared simulation state** — no synchronization across
  visitors; each embed instance is independent.
- **Saving or exporting simulation output** — no download button, no
  server-side record of visitor interactions.
- **Full 12-valve control surface** — the embed exposes 4 valves; the remaining
  8 operate on autonomous scenario preset logic.
- **Native egui viewer or Tauri packaging** — roadmap items from the
  cryo-flow-sim-showcase backlog; out of scope for the portfolio embed.
- **Two-phase vent discharge** — Stage 1 physics closure: gas-only vent
  discharge; this constraint carries into the WASM embed.
- **Production cryo-service deployment** — the WASM approach intentionally
  avoids this; if a server-side interactive demo is desired in the future, it
  requires a separate scoped decision and deployment runbook.

---

## Open Questions (for implementation sprint)

1. **cryo-core vendoring:** Should the portfolio mono-repo vendor a copy of
   `cryo-core` from the showcase repo, or reference it via a git submodule?
   Vendoring is simpler for CI; submodule keeps a single source of truth.
   Decision deferred to the v1.3 implementation sprint.

2. **Scene-graph scope for the embed:** Full 8-tank topology in a responsive
   viewport, or a simplified 3-tank subset for clarity? The simplified view is
   faster to implement; the full topology is more credible to engineers.
   Recommendation: start with the simplified subset and expand if time permits.

3. **WASM binary hosting:** Serve from `apps/web/public/wasm/` as committed
   static assets, or generate them in CI and upload as release artifacts?
   Committed assets are simpler; CI-generated keeps the repo lighter.
   Recommendation: committed assets for v1.3; revisit if binary size becomes
   a PR review friction point.
