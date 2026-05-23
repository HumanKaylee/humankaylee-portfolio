pub mod config;
pub mod health;
pub mod projects;
pub mod state;

use axum::{routing::get, Router};
use state::AppState;

pub fn app(state: AppState) -> Router {
    Router::new()
        .route("/api/health", get(health::health_handler))
        .route("/api/projects/live", get(projects::projects_live_handler))
        .with_state(state)
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
