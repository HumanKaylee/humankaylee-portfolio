//! Black-Scholes options pricer compiled to WASM for the humankaylee portfolio demo island.
//!
//! Implements European option pricing on a non-dividend-paying underlying:
//! price, delta, gamma, theta (per year and per day), vega, and rho.
//!
//! The cumulative normal distribution uses the Abramowitz & Stegun 26.2.17
//! rational approximation (max absolute error 7.5×10⁻⁸).

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Input parameters for the Black-Scholes pricer.
#[derive(Deserialize)]
struct QuoteInput {
    /// Spot price (current underlying price)
    #[serde(rename = "S")]
    spot: f64,
    /// Strike price
    #[serde(rename = "K")]
    strike: f64,
    /// Time to expiry in years (must be > 0)
    #[serde(rename = "T")]
    time_to_expiry: f64,
    /// Risk-free interest rate (annualised, e.g. 0.05 for 5%)
    #[serde(rename = "r")]
    rate: f64,
    /// Implied volatility (annualised, e.g. 0.20 for 20%)
    #[serde(rename = "sigma")]
    sigma: f64,
    /// true = call, false = put
    is_call: bool,
}

/// Output: price plus the five primary Greeks.
#[derive(Serialize)]
struct QuoteOutput {
    price: f64,
    delta: f64,
    gamma: f64,
    /// Theta expressed as daily decay (divide the annual figure by 365).
    theta_per_day: f64,
    vega: f64,
    rho: f64,
}

/// Cumulative standard-normal distribution using Abramowitz & Stegun 26.2.17.
///
/// Maximum absolute error: 7.5 × 10⁻⁸.
fn cnd(x: f64) -> f64 {
    const P: f64 = 0.231_641_9;
    const A1: f64 = 0.319_381_530;
    const A2: f64 = -0.356_563_782;
    const A3: f64 = 1.781_477_937;
    const A4: f64 = -1.821_255_978;
    const A5: f64 = 1.330_274_429;

    let t = 1.0 / (1.0 + P * x.abs());
    let poly = t * (A1 + t * (A2 + t * (A3 + t * (A4 + t * A5))));
    let pdf = (-0.5 * x * x).exp() / (2.0_f64 * std::f64::consts::PI).sqrt();
    let approx = 1.0 - pdf * poly;

    if x >= 0.0 {
        approx
    } else {
        1.0 - approx
    }
}

/// Standard normal probability density function.
#[inline]
fn npdf(x: f64) -> f64 {
    (-0.5 * x * x).exp() / (2.0_f64 * std::f64::consts::PI).sqrt()
}

/// Compute d₁ and d₂ for Black-Scholes.
///
/// Returns `None` if inputs are degenerate (T ≤ 0, sigma ≤ 0, S ≤ 0, K ≤ 0).
fn d1_d2(spot: f64, strike: f64, t: f64, r: f64, sigma: f64) -> Option<(f64, f64)> {
    if spot <= 0.0 || strike <= 0.0 || t <= 0.0 || sigma <= 0.0 {
        return None;
    }
    let sqrt_t = t.sqrt();
    let d1 = ((spot / strike).ln() + (r + 0.5 * sigma * sigma) * t) / (sigma * sqrt_t);
    let d2 = d1 - sigma * sqrt_t;
    Some((d1, d2))
}

/// Black-Scholes call/put price.
pub fn price(spot: f64, strike: f64, t: f64, r: f64, sigma: f64, is_call: bool) -> f64 {
    match d1_d2(spot, strike, t, r, sigma) {
        None => {
            // Degenerate: return intrinsic value only.
            if is_call {
                (spot - strike).max(0.0)
            } else {
                (strike - spot).max(0.0)
            }
        }
        Some((d1, d2)) => {
            let disc = (-r * t).exp();
            if is_call {
                spot * cnd(d1) - strike * disc * cnd(d2)
            } else {
                strike * disc * cnd(-d2) - spot * cnd(-d1)
            }
        }
    }
}

/// Delta: sensitivity of option price to spot.
pub fn delta(spot: f64, strike: f64, t: f64, r: f64, sigma: f64, is_call: bool) -> f64 {
    match d1_d2(spot, strike, t, r, sigma) {
        None => {
            if is_call {
                if spot > strike {
                    1.0
                } else {
                    0.0
                }
            } else if spot < strike {
                -1.0
            } else {
                0.0
            }
        }
        Some((d1, _d2)) => {
            if is_call {
                cnd(d1)
            } else {
                cnd(d1) - 1.0
            }
        }
    }
}

/// Gamma: sensitivity of delta to spot (same for calls and puts).
pub fn gamma(spot: f64, strike: f64, t: f64, r: f64, sigma: f64) -> f64 {
    match d1_d2(spot, strike, t, r, sigma) {
        None => 0.0,
        Some((d1, _d2)) => npdf(d1) / (spot * sigma * t.sqrt()),
    }
}

/// Theta: time decay (annualised; divide by 365 for daily).
pub fn theta(spot: f64, strike: f64, t: f64, r: f64, sigma: f64, is_call: bool) -> f64 {
    match d1_d2(spot, strike, t, r, sigma) {
        None => 0.0,
        Some((d1, d2)) => {
            let disc = (-r * t).exp();
            let term1 = -(spot * npdf(d1) * sigma) / (2.0 * t.sqrt());
            if is_call {
                term1 - r * strike * disc * cnd(d2)
            } else {
                term1 + r * strike * disc * cnd(-d2)
            }
        }
    }
}

/// Vega: sensitivity to implied volatility (per 1-unit change, i.e. per 100%).
///
/// Divide by 100 to get sensitivity per 1% change in vol.
pub fn vega(spot: f64, strike: f64, t: f64, r: f64, sigma: f64) -> f64 {
    match d1_d2(spot, strike, t, r, sigma) {
        None => 0.0,
        Some((d1, _d2)) => spot * npdf(d1) * t.sqrt(),
    }
}

/// Rho: sensitivity to the risk-free rate (per 1-unit change, i.e. per 100%).
///
/// Divide by 100 to get sensitivity per 1% change in rate.
pub fn rho(spot: f64, strike: f64, t: f64, r: f64, sigma: f64, is_call: bool) -> f64 {
    match d1_d2(spot, strike, t, r, sigma) {
        None => 0.0,
        Some((_d1, d2)) => {
            let disc = (-r * t).exp();
            if is_call {
                strike * t * disc * cnd(d2)
            } else {
                -strike * t * disc * cnd(-d2)
            }
        }
    }
}

/// Primary WASM entry point.
///
/// Accepts `{S, K, T, r, sigma, is_call}` and returns
/// `{price, delta, gamma, theta_per_day, vega, rho}`.
///
/// All inputs are validated; degenerate cases return sensible limit values
/// rather than panicking.
#[wasm_bindgen]
pub fn quote(input: JsValue) -> JsValue {
    let params: QuoteInput = match serde_wasm_bindgen::from_value(input) {
        Ok(p) => p,
        Err(_) => {
            // Return zeroed output rather than throwing.
            let out = QuoteOutput {
                price: 0.0,
                delta: 0.0,
                gamma: 0.0,
                theta_per_day: 0.0,
                vega: 0.0,
                rho: 0.0,
            };
            return serde_wasm_bindgen::to_value(&out).unwrap_or(JsValue::NULL);
        }
    };

    let s = params.spot;
    let k = params.strike;
    let t = params.time_to_expiry;
    let r = params.rate;
    let sig = params.sigma;
    let call = params.is_call;

    let out = QuoteOutput {
        price: price(s, k, t, r, sig, call),
        delta: delta(s, k, t, r, sig, call),
        gamma: gamma(s, k, t, r, sig),
        theta_per_day: theta(s, k, t, r, sig, call) / 365.0,
        vega: vega(s, k, t, r, sig),
        rho: rho(s, k, t, r, sig, call),
    };

    serde_wasm_bindgen::to_value(&out).unwrap_or(JsValue::NULL)
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Tolerance for float comparisons.
    const EPS: f64 = 1e-4;

    fn approx_eq(a: f64, b: f64, tol: f64) -> bool {
        (a - b).abs() <= tol
    }

    /// ATM European call: textbook values with S=K=100, T=1, r=0.05, sigma=0.20.
    ///
    /// Verified against Hull "Options, Futures, and Other Derivatives" 11th ed., ch. 15.
    /// Expected call price ≈ 10.4506 (d1≈0.35, d2≈0.15, N(d1)≈0.6368, N(d2)≈0.5596).
    #[test]
    fn atm_call_textbook_values() {
        let s = 100.0_f64;
        let k = 100.0_f64;
        let t = 1.0_f64;
        let r = 0.05_f64;
        let sig = 0.20_f64;

        let call_price = price(s, k, t, r, sig, true);
        // Textbook value: 10.4506
        assert!(
            approx_eq(call_price, 10.4506, 0.01),
            "ATM call price: expected ~10.45, got {call_price:.4}"
        );

        let d_call = delta(s, k, t, r, sig, true);
        // N(d1) = N(0.35) ≈ 0.6368
        assert!(
            approx_eq(d_call, 0.6368, 0.005),
            "ATM call delta: expected ~0.637, got {d_call:.4}"
        );
    }

    /// Put-call parity: C - P = S - K·exp(-rT).
    #[test]
    fn put_call_parity() {
        let cases = [
            (100.0, 100.0, 1.0, 0.05, 0.20),
            (150.0, 100.0, 0.5, 0.02, 0.30),
            (80.0, 100.0, 2.0, 0.04, 0.15),
            (100.0, 50.0, 0.25, 0.06, 0.40),
        ];
        for (s, k, t, r, sig) in cases {
            let c = price(s, k, t, r, sig, true);
            let p = price(s, k, t, r, sig, false);
            let parity = s - k * (-r * t).exp();
            assert!(
                approx_eq(c - p, parity, EPS),
                "Put-call parity failed for S={s} K={k}: C-P={:.6}, S-Ke^{{-rT}}={:.6}",
                c - p,
                parity
            );
        }
    }

    /// Deep OTM call: price should be very close to zero.
    #[test]
    fn deep_otm_call_near_zero() {
        // S=50, K=200, T=0.1, r=0.05, sigma=0.20 — extremely far OTM
        let p = price(50.0, 200.0, 0.1, 0.05, 0.20, true);
        assert!(p < 1e-10, "Deep OTM call price should be ~0, got {p:.2e}");
    }

    /// Deep ITM put: delta should be close to -1.
    #[test]
    fn deep_itm_put_delta_near_neg_one() {
        // S=50, K=200, T=0.1, r=0.05, sigma=0.20 — put is deeply in the money
        let d = delta(50.0, 200.0, 0.1, 0.05, 0.20, false);
        assert!(
            approx_eq(d, -1.0, 0.001),
            "Deep ITM put delta should be ~-1, got {d:.4}"
        );
    }

    /// CND sanity: N(0)=0.5, N(1.96)≈0.975, N(-1.96)≈0.025.
    #[test]
    fn cnd_sanity() {
        assert!(approx_eq(cnd(0.0), 0.5, 1e-6));
        assert!(approx_eq(cnd(1.96), 0.975, 2e-3));
        assert!(approx_eq(cnd(-1.96), 0.025, 2e-3));
    }

    /// Gamma is always non-negative.
    #[test]
    fn gamma_non_negative() {
        let cases = [
            (100.0, 100.0, 1.0, 0.05, 0.20),
            (80.0, 100.0, 0.5, 0.03, 0.30),
            (120.0, 100.0, 2.0, 0.01, 0.40),
        ];
        for (s, k, t, r, sig) in cases {
            let g = gamma(s, k, t, r, sig);
            assert!(g >= 0.0, "Gamma must be non-negative; got {g} for S={s}");
        }
    }
}
