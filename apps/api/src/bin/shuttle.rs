use humankaylee_api::{app, config::AppConfig, state::AppState, telemetry};
use shuttle_runtime::SecretStore;

const HK_API_CONFIG_KEYS: &[&str] = &[
    "HK_API_HOST",
    "HK_API_PORT",
    "HK_API_ALLOWED_ORIGINS",
    "HK_API_CONTACT_DELIVERY_MODE",
    "HK_API_CONTACT_STORE_PATH",
    "HK_API_EVENT_LOGGING_ENABLED",
    "HK_API_RATE_LIMIT_REQUESTS_PER_MINUTE",
    "HK_API_CONTACT_RATE_LIMIT_PER_HOUR",
    "HK_API_VERSION",
];

#[shuttle_runtime::main]
async fn main(#[shuttle_runtime::Secrets] secrets: SecretStore) -> shuttle_axum::ShuttleAxum {
    telemetry::init();
    let config = AppConfig::from_env_pairs(config_pairs(secrets))
        .map_err(shuttle_runtime::CustomError::new)?;
    tracing::info!(version = %config.version, "api_starting_shuttle");
    Ok(app(AppState::with_config(config)).into())
}

fn config_pairs(secrets: SecretStore) -> Vec<(String, String)> {
    let mut pairs = std::env::vars()
        .filter(|(key, _)| key.starts_with("HK_API_"))
        .collect::<Vec<_>>();

    for key in HK_API_CONFIG_KEYS {
        if let Some(value) = secrets.get(key) {
            pairs.push(((*key).to_owned(), value));
        }
    }

    pairs
}
