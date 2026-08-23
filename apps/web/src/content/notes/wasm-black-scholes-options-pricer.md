---
title: "A Black-Scholes options pricer in Rust, compiled to WASM"
slug: "wasm-black-scholes-options-pricer"
summary: "How a ~150-line Rust crate becomes a live, in-browser options pricer with sub-millisecond Greeks, without a server round-trip."
tags:
  - "rust"
  - "wasm"
  - "options"
publishedAt: "2026-05-26"
publicationStatus: "publish"
seo:
  title: "Black-Scholes options pricer in Rust → WASM"
  description: "How a Rust crate compiled to WebAssembly powers a live, in-browser European options pricer with real-time Greeks."
  canonicalPath: "/notes/wasm-black-scholes-options-pricer/"
  ogImage: "/social/default.png"
---

## What Black-Scholes computes

The Black-Scholes model prices European options on a non-dividend-paying
underlying. Given five market inputs: spot price (S), strike (K), time to
expiry (T), risk-free rate (r), and implied volatility (σ), the formula
produces a fair-value price plus five sensitivity measures called the Greeks:
Delta (Δ, price sensitivity to spot), Gamma (Γ, rate of change of delta),
Theta (Θ, daily time decay), Vega (sensitivity to volatility), and Rho (ρ,
sensitivity to the risk-free rate). The formula is closed-form: no simulation
or iteration, so it is fast and deterministic for a given set of inputs.

The formulas here follow the standard derivation from Fischer Black and Myron
Scholes (1973), with the cumulative normal distribution approximated via the
Abramowitz and Stegun 26.2.17 rational polynomial (maximum absolute error
7.5×10⁻⁸). All arithmetic is IEEE 754 double-precision.

## Why Rust compiled to WASM, not JavaScript

A JavaScript implementation would be concise and fully sufficient for this
level of precision. The reason to use Rust compiled to WebAssembly here is
signal rather than necessity: the Network tab shows a `.wasm` binary loading,
the JavaScript glue is generated automatically by `wasm-pack`, and the Rust
source is the specification, not a translation layer that can diverge from
intent.

The other consideration is correctness in the tail. Rust's type system makes
the degenerate cases explicit. When T ≤ 0 or σ ≤ 0 the function returns the
intrinsic value rather than NaN or a panic. The `#[wasm_bindgen]` entry point
deserialises its input with `serde-wasm-bindgen`; if the input is malformed it
returns zeroed output rather than throwing. That boundary hardening is easier
to express and verify in Rust than in hand-written JavaScript.

The compiled binary is 62 KB raw and 27 KB gzipped, smaller than most hero
images. It loads when the demo enters view, so it does not fetch while the demo
remains below the viewport. The compute itself is sub-millisecond on any device
capable of loading the page.

## How to read the Greeks

Move the sliders and watch the readout update. A few reference points:

- **Delta** is the hedge ratio. A call with delta 0.50 gains roughly $0.50 per
  $1.00 spot move. At-the-money calls have delta near 0.5; deeply in-the-money
  calls approach 1.0. Put deltas are negative and range from 0 to −1.
- **Gamma** is highest at-the-money near expiry; that is where the hedge
  ratio changes most rapidly per spot move.
- **Theta** shows as a negative number for long options: holding the option
  costs you time decay each day. Long gamma positions pay theta; short gamma
  positions collect it.
- **Vega** (per 1% volatility move) is largest for at-the-money options with
  time remaining. It collapses as expiry approaches.
- **Rho** matters most for longer-dated options; its effect is small at the
  low interest-rate levels typical of recent history.

## Live pricer

The canonical Work story includes the interactive browser tool, its verified
scope, and known limits. [Open the live Black-Scholes tool](/work/black-scholes-wasm/)
to adjust the five market inputs and inspect prices and Greeks without a server
round trip.

The source for the Rust crate is at
`apps/api/crates/blackscholes-wasm/src/lib.rs` in the portfolio repository.
Unit tests cover the ATM textbook values from Hull's *Options, Futures, and
Other Derivatives*, put-call parity across four parameter sets, deep-OTM price
approaching zero, and deep-ITM put delta approaching −1.
