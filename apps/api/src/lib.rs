pub mod config;
pub mod contact;
pub mod events;
pub mod health;
pub mod projects;
pub mod security;
pub mod state;
pub mod telemetry;

use axum::{
    http::StatusCode,
    routing::{get, post},
    Router,
};
use security::{cors_layer, PUBLIC_REQUEST_BODY_LIMIT_BYTES, PUBLIC_REQUEST_TIMEOUT};
use state::AppState;
use tower_http::{
    compression::CompressionLayer, limit::RequestBodyLimitLayer, timeout::TimeoutLayer,
    trace::TraceLayer,
};

pub fn app(state: AppState) -> Router {
    let config = state.config().clone();
    let mut app = Router::new()
        .route("/api/health", get(health::health_handler))
        .route("/api/projects/live", get(projects::projects_live_handler))
        .route("/api/contact", post(contact::contact_handler))
        .route("/api/events", post(events::events_handler))
        .with_state(state)
        .layer(CompressionLayer::new())
        .layer(RequestBodyLimitLayer::new(PUBLIC_REQUEST_BODY_LIMIT_BYTES))
        .layer(TimeoutLayer::with_status_code(
            StatusCode::REQUEST_TIMEOUT,
            PUBLIC_REQUEST_TIMEOUT,
        ))
        .layer(TraceLayer::new_for_http());

    if let Some(cors) = cors_layer(&config) {
        app = app.layer(cors);
    }

    app
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::to_bytes;
    use axum::http::{Request, StatusCode};
    use serde_json::Value;
    use tower::ServiceExt;

    #[tokio::test]
    async fn health_route_returns_scaffold_payload() {
        let state = AppState::new();
        let response = app(state)
            .oneshot(
                Request::builder()
                    .uri("/api/health")
                    .body(axum::body::Body::empty())
                    .expect("request"),
            )
            .await
            .expect("response");

        assert_eq!(response.status(), StatusCode::OK);

        let body = to_bytes(response.into_body(), usize::MAX)
            .await
            .expect("body");
        let json: Value = serde_json::from_slice(&body).expect("json");

        assert_eq!(json["status"], "ok");
        assert_eq!(json["service"], "humankaylee-portfolio-api");
        assert_eq!(json["version"], env!("CARGO_PKG_VERSION"));
        assert_eq!(json["commit"], "local-dev");
        assert!(json["uptime_seconds"].as_u64().is_some());
    }
}
