---
title: "Black-Scholes Options Pricer in Rust and WASM"
slug: "black-scholes-wasm"
discipline: "tools"
year: 2026
placement: "supporting"
featuredOrder: 4
lede: "A Rust crate compiled to WebAssembly powers a live, in-browser European options pricer with real-time Greeks and no server round-trip."
problem: "A live browser pricer needs deterministic calculation, explicit handling of degenerate inputs, and a safe boundary for malformed data without a server round-trip."
stakes: "Incorrect pricing or a malformed browser boundary would undermine an educational tool that presents option prices and Greeks."
role: "Rust implementation, WASM boundary hardening, browser integration, and unit verification"
constraints:
  - "The model prices European options on a non-dividend-paying underlying."
  - "Degenerate time-to-expiry and volatility inputs must return intrinsic value rather than NaN or a panic."
  - "Malformed input at the WASM boundary must return zeroed output rather than throw."
architecture:
  overview: "Rust is compiled with wasm-pack; a wasm_bindgen entry point deserializes input through serde-wasm-bindgen and the browser loads the module when the demo enters view."
  diagramAlt: "Browser inputs pass through generated JavaScript glue to a Rust WebAssembly module that returns option prices and Greeks."
decisions:
  - title: "Rust compiled to WASM"
    choice: "Use Rust as the specification and compile it to WebAssembly for the browser pricer."
    alternatives:
      - "Implement the calculation directly in JavaScript."
    tradeoff: "JavaScript would be sufficient for this precision, while Rust makes boundary cases explicit and keeps the source as the specification."
  - title: "Hardened input boundary"
    choice: "Return intrinsic value for T ≤ 0 or σ ≤ 0 and zeroed output for malformed WASM input."
    alternatives:
      - "Allow NaN, panic, or a thrown malformed-input error."
    tradeoff: "The boundary avoids browser failures while making degenerate cases explicit."
outcome: "The compiled module is 62 KB raw and 27 KB gzipped, loads when the demo enters view, and computes sub-millisecond on a device capable of loading the page."
lessons:
  - "A JavaScript implementation would be concise and sufficient for this precision, but Rust makes degenerate cases and the browser boundary explicit."
evidence:
  label: "WASM browser pricer"
  summary: "A Rust crate compiled to WebAssembly provides browser-side European option prices and Greeks without a server round-trip."
  values:
    - label: "Compiled binary"
      value: "62 KB raw"
      detail: "The compiled WebAssembly binary size."
    - label: "Compressed binary"
      value: "27 KB gzipped"
      detail: "The gzip-compressed WebAssembly binary size."
    - label: "Unit tests"
      value: "6 Rust unit tests"
      detail: "Tests cover textbook values, put-call parity, deep-OTM pricing, and deep-ITM put delta."
  scope: "Educational browser-side pricing demonstration using the Black-Scholes closed-form model."
  limits: "European options on a non-dividend-paying underlying; this is an educational tool, not financial advice."
media:
  kind: "evidence-flow"
  width: 1600
  height: 1000
  alt: "Browser inputs routed through a Rust WebAssembly module to option prices and Greeks."
  caption: "Browser-side Black-Scholes calculation without a server round-trip."
demoComponent: "BlackScholesDemo"
publicationStatus: "publish"
redactionStatus: "reviewed"
redactionReview:
  guidePath: "docs/CONTENT_REDACTION_GUIDE.md"
  reviewer: "operator"
  checklistStatus: "partial"
  openItems:
    - "No standalone redaction review date was recorded for the existing public note."
  notes: "The existing public note describes an educational in-browser tool and contains no private hostnames, account names, credentials, raw logs, or access paths."
  checklist:
    secretsRemoved: "yes"
    hostnamesAndAccessPathsGeneralized: "yes"
    userAndAccountNamesGeneralized: "yes"
    screenshotsInspected: "not-applicable"
    logsSummarizedOrSanitized: "not-applicable"
    publicLinksVerified: "not-applicable"
    claimsHaveSafeEvidence: "yes"
    securitySensitiveProceduresRemoved: "yes"
seo:
  title: "Black-Scholes Options Pricer in Rust and WASM | Joe Poznanski"
  description: "How Rust compiled to WebAssembly powers a live, in-browser European options pricer with real-time Greeks."
  canonicalPath: "/work/black-scholes-wasm/"
  ogImage: "/social/default.png"
---

## What Black-Scholes computes

The Black-Scholes model prices European options on a non-dividend-paying
underlying. Given five market inputs — spot price (S), strike (K), time to
expiry (T), risk-free rate (r), and implied volatility (σ) — the formula
produces a fair-value price plus five sensitivity measures called the Greeks:
Delta (Δ, price sensitivity to spot), Gamma (Γ, rate of change of delta),
Theta (Θ, daily time decay), Vega (sensitivity to volatility), and Rho (ρ,
sensitivity to the risk-free rate). The formula is closed-form — no simulation,
no iteration — so it is fast and deterministic for a given set of inputs.

The formulas here follow the standard derivation from Fischer Black and Myron
Scholes (1973), with the cumulative normal distribution approximated via the
Abramowitz and Stegun 26.2.17 rational polynomial (maximum absolute error
7.5×10⁻⁸). All arithmetic is IEEE 754 double-precision.

## Why Rust compiled to WASM, not JavaScript

A JavaScript implementation would be concise and fully sufficient for this
level of precision. The reason to use Rust compiled to WebAssembly here is
signal rather than necessity: the Network tab shows a `.wasm` binary loading,
the JavaScript glue is generated automatically by `wasm-pack`, and the Rust
source is the specification — not a translation layer that can diverge from
intent.

The other consideration is correctness in the tail. Rust's type system makes
the degenerate cases explicit. When T ≤ 0 or σ ≤ 0 the function returns the
intrinsic value rather than NaN or a panic. The `#[wasm_bindgen]` entry point
deserialises its input with `serde-wasm-bindgen`; if the input is malformed it
returns zeroed output rather than throwing. That boundary hardening is easier
to express and verify in Rust than in hand-written JavaScript.

The compiled binary is 62 KB raw, 27 KB gzipped — smaller than most hero
images. It loads when the demo enters view, so it does not fetch while the demo
remains below the viewport. The compute itself is sub-millisecond on any device
capable of loading the page.

## How to read the Greeks

Move the sliders and watch the readout update. A few reference points:

- **Delta** is the hedge ratio. A call with delta 0.50 gains roughly $0.50 per
  $1.00 spot move. At-the-money calls have delta near 0.5; deeply in-the-money
  calls approach 1.0. Put deltas are negative and range from 0 to −1.
- **Gamma** is highest at-the-money near expiry — that is where the hedge
  ratio changes most rapidly per spot move.
- **Theta** shows as a negative number for long options: holding the option
  costs you time decay each day. Long gamma positions pay theta; short gamma
  positions collect it.
- **Vega** (per 1% volatility move) is largest for at-the-money options with
  time remaining. It collapses as expiry approaches.
- **Rho** matters most for longer-dated options; its effect is small at the
  low interest-rate levels typical of recent history.

## Live pricer

Adjust spot price, strike, time to expiry, rate, and volatility below. The
call and put prices update instantly via the WASM module — no network request,
no server, no latency.

The source for the Rust crate is at
`apps/api/crates/blackscholes-wasm/src/lib.rs` in the portfolio repository.
Unit tests cover the ATM textbook values from Hull's *Options, Futures, and
Other Derivatives*, put-call parity across four parameter sets, deep-OTM price
approaching zero, and deep-ITM put delta approaching −1.
