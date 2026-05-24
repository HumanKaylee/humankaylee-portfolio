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
    let subscriber = tracing_subscriber::registry().with(filter).with(
        fmt::layer()
            .json()
            .flatten_event(true)
            .with_ansi(false)
            .with_target(true),
    );

    let _ = subscriber.try_init();
}
