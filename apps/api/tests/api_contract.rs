use axum::{
    body::{to_bytes, Body},
    http::{Request, StatusCode},
};
use humankaylee_api::{
    app,
    config::{AppConfig, ContactDeliveryMode, RateLimitConfig},
    state::AppState,
};
use serde_json::Value;
use std::time::{Duration, Instant};
use tower::ServiceExt;

async fn get_json(state: AppState, uri: &str) -> (StatusCode, Value) {
    let response = app(state)
        .oneshot(
            Request::builder()
                .uri(uri)
                .body(Body::empty())
                .expect("request"),
        )
        .await
        .expect("response");

    let status = response.status();
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("body");
    let json = serde_json::from_slice(&body).expect("json");

    (status, json)
}

#[tokio::test]
async fn health_route_returns_public_status_version_and_uptime() {
    let config = AppConfig {
        version: "2026.05.23-test".to_owned(),
        ..AppConfig::default()
    };
    let state =
        AppState::with_config_and_started_at(config, Instant::now() - Duration::from_secs(12));

    let (status, json) = get_json(state, "/api/health").await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(json["status"], "ok");
    assert_eq!(json["version"], "2026.05.23-test");
    assert!(json["uptime_seconds"].as_u64().expect("uptime") >= 12);
    assert!(json.get("service").is_some());
    assert!(json.get("commit").is_some());
}

#[tokio::test]
async fn projects_live_route_returns_safe_cached_metadata() {
    let (status, json) = get_json(AppState::new(), "/api/projects/live").await;

    assert_eq!(status, StatusCode::OK);
    assert!(json["cached_at"].as_str().is_some());
    assert!(json["stale"].as_bool().is_some());
    assert!(json["projects"].as_array().expect("projects").len() >= 2);

    for project in json["projects"].as_array().expect("projects") {
        assert!(project["key"].as_str().is_some());
        assert!(project["title"].as_str().is_some());
        assert!(project["status"].as_str().is_some());
        assert!(project["categories"].as_array().is_some());
        assert!(project.get("url").is_none());
    }
}

#[test]
fn config_parses_typed_environment_values_without_secrets() {
    let config = AppConfig::from_env_pairs([
        ("HK_API_HOST", "0.0.0.0"),
        ("HK_API_PORT", "9000"),
        (
            "HK_API_ALLOWED_ORIGINS",
            "https://example.com,http://localhost:4321",
        ),
        ("HK_API_CONTACT_DELIVERY_MODE", "store"),
        ("HK_API_EVENT_LOGGING_ENABLED", "true"),
        ("HK_API_RATE_LIMIT_REQUESTS_PER_MINUTE", "120"),
        ("HK_API_CONTACT_RATE_LIMIT_PER_HOUR", "6"),
        ("HK_API_VERSION", "2026.05.23-test"),
    ])
    .expect("config");

    assert_eq!(config.host, "0.0.0.0");
    assert_eq!(config.port, 9000);
    assert_eq!(
        config.allowed_origins,
        vec![
            "https://example.com".to_owned(),
            "http://localhost:4321".to_owned()
        ]
    );
    assert_eq!(config.contact_delivery_mode, ContactDeliveryMode::Store);
    assert!(config.event_logging_enabled);
    assert_eq!(
        config.rate_limits,
        RateLimitConfig {
            requests_per_minute: 120,
            contact_per_hour: 6,
        }
    );
    assert_eq!(config.version, "2026.05.23-test");
}
