use crate::config::AppConfig;
use axum::http::{header, HeaderValue, Method};
use std::time::Duration;
use tower_http::cors::{AllowOrigin, CorsLayer};

pub const PUBLIC_REQUEST_BODY_LIMIT_BYTES: usize = 16 * 1024;
pub const PUBLIC_REQUEST_TIMEOUT: Duration = Duration::from_secs(10);

pub fn cors_layer(config: &AppConfig) -> Option<CorsLayer> {
    let allowed_origins: Vec<HeaderValue> = config
        .allowed_origins
        .iter()
        .map(|origin| {
            HeaderValue::from_str(origin.trim())
                .expect("AppConfig allowed_origins must be validated before CORS setup")
        })
        .collect();

    if allowed_origins.is_empty() {
        return None;
    }

    Some(
        CorsLayer::new()
            .allow_origin(AllowOrigin::list(allowed_origins))
            .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
            .allow_headers([header::ACCEPT, header::CONTENT_TYPE]),
    )
}
