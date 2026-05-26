use std::env;
use tracing_subscriber::{filter::EnvFilter, fmt, layer::SubscriberExt, util::SubscriberInitExt};

const DEFAULT_FILTER_DIRECTIVE: &str = "info,humankaylee_api=info,tower_http=info";

pub fn default_filter_directive() -> &'static str {
    DEFAULT_FILTER_DIRECTIVE
}

pub fn log_encoding() -> &'static str {
    "json"
}

pub fn init() {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new(DEFAULT_FILTER_DIRECTIVE));

    // When Sentry is configured, route tracing::error! events to Sentry as well.
    // The layer is a no-op when Sentry is not initialised (no DSN configured).
    let sentry_layer = sentry_tracing::layer();

    let subscriber = tracing_subscriber::registry()
        .with(filter)
        .with(
            fmt::layer()
                .json()
                .flatten_event(true)
                .with_ansi(false)
                .with_target(true),
        )
        .with(sentry_layer);

    let _ = subscriber.try_init();
}

/// Initialise the Sentry SDK.
///
/// Reads `SENTRY_DSN` from the environment. If absent, logs an info message
/// and returns `None` — the application continues without Sentry. If present,
/// initialises the SDK and returns a `ClientInitGuard` that must be kept alive
/// for the duration of the process.
///
/// # Environment variables
/// - `SENTRY_DSN` – Sentry Data Source Name (required to enable Sentry).
/// - `SENTRY_ENV` – Environment tag (default: `"production"`).
///
/// # Example
/// ```ignore
/// // In main():
/// let _sentry = telemetry::init_sentry();
/// ```
pub fn init_sentry() -> Option<sentry::ClientInitGuard> {
    let dsn = match env::var("SENTRY_DSN") {
        Ok(d) if !d.trim().is_empty() => d,
        _ => {
            tracing::info!(reason = "no SENTRY_DSN env var", "sentry_disabled");
            return None;
        }
    };

    let sentry_env = env::var("SENTRY_ENV").unwrap_or_else(|_| "production".to_string());

    let guard = sentry::init(sentry::ClientOptions {
        dsn: dsn.parse().ok(),
        release: Some(env!("CARGO_PKG_VERSION").into()),
        environment: Some(sentry_env.clone().into()),
        traces_sample_rate: 0.1,
        attach_stacktrace: true,
        ..sentry::ClientOptions::default()
    });

    tracing::info!(environment = %sentry_env, "sentry_enabled");
    Some(guard)
}
