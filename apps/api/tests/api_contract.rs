use axum::{
    body::{to_bytes, Body},
    http::{header, Request, StatusCode},
};
use humankaylee_api::{
    app,
    config::{AppConfig, ContactDeliveryMode, RateLimitConfig},
    state::AppState,
};
use serde_json::json;
use serde_json::Value;
use std::time::{Duration, Instant};
use tower::ServiceExt;

async fn get_json(state: AppState, uri: &str) -> (StatusCode, Value) {
    let response = request(
        state,
        Request::builder()
            .uri(uri)
            .body(Body::empty())
            .expect("request"),
    )
    .await;

    let status = response.status();
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("body");
    let json = if body.is_empty() {
        Value::Null
    } else {
        serde_json::from_slice(&body).expect("json")
    };

    (status, json)
}

async fn get_json_with_origin(
    state: AppState,
    uri: &str,
    origin: &str,
) -> (StatusCode, Value, axum::http::HeaderMap) {
    let response = request(
        state,
        Request::builder()
            .uri(uri)
            .header(header::ORIGIN, origin)
            .body(Body::empty())
            .expect("request"),
    )
    .await;

    let status = response.status();
    let headers = response.headers().clone();
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("body");
    let json = if body.is_empty() {
        Value::Null
    } else {
        serde_json::from_slice(&body).expect("json")
    };

    (status, json, headers)
}

async fn request(state: AppState, request: Request<Body>) -> axum::response::Response {
    let response = app(state).oneshot(request).await.expect("response");
    response
}

async fn post_json(state: AppState, uri: &str, payload: Value) -> (StatusCode, Value) {
    let response = request(
        state,
        Request::builder()
            .method("POST")
            .uri(uri)
            .header("content-type", "application/json")
            .body(Body::from(payload.to_string()))
            .expect("request"),
    )
    .await;

    let status = response.status();
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("body");
    let json = if body.is_empty() {
        Value::Null
    } else {
        serde_json::from_slice(&body).expect("json")
    };

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
async fn default_config_has_no_cors_origins_until_env_is_provided() {
    let config = AppConfig::default();

    assert!(config.allowed_origins.is_empty());
}

#[tokio::test]
async fn health_route_allows_only_configured_origin_and_denies_unconfigured_origins() {
    let state = AppState::with_config(AppConfig {
        allowed_origins: vec!["https://example.com".to_owned()],
        ..AppConfig::default()
    });

    let (status, _, headers) =
        get_json_with_origin(state.clone(), "/api/health", "https://example.com").await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(
        headers
            .get(header::ACCESS_CONTROL_ALLOW_ORIGIN)
            .and_then(|value| value.to_str().ok()),
        Some("https://example.com")
    );

    let (status, _, headers) =
        get_json_with_origin(state, "/api/health", "https://untrusted.example").await;

    assert_eq!(status, StatusCode::OK);
    assert!(headers.get(header::ACCESS_CONTROL_ALLOW_ORIGIN).is_none());
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

#[tokio::test]
async fn contact_store_mode_accepts_valid_submission_without_echoing_private_message() {
    let state = AppState::with_config(AppConfig {
        contact_delivery_mode: ContactDeliveryMode::Store,
        ..AppConfig::default()
    });

    let (status, json) = post_json(
        state,
        "/api/contact",
        json!({
            "name": "Kaylee Example",
            "email": "kaylee@example.com",
            "subject": "Portfolio inquiry",
            "message": "This private message body must not be echoed in the response.",
            "company": ""
        }),
    )
    .await;

    assert_eq!(status, StatusCode::ACCEPTED);
    assert_eq!(json["status"], "accepted");
    assert_eq!(json["delivery"], "store");
    assert_eq!(json["message"], "Message queued for follow-up.");
    assert!(!json.to_string().contains("private message body"));
}

#[tokio::test]
async fn contact_rejects_invalid_submission_with_structured_validation_error() {
    let state = AppState::with_config(AppConfig {
        contact_delivery_mode: ContactDeliveryMode::Store,
        ..AppConfig::default()
    });

    let (status, json) = post_json(
        state,
        "/api/contact",
        json!({
            "name": "",
            "email": "not-an-email",
            "subject": "",
            "message": "short",
            "company": ""
        }),
    )
    .await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(json["error"]["code"], "validation_failed");
    let fields = json["error"]["fields"].as_array().expect("fields");
    assert!(fields.iter().any(|field| field == "name"));
    assert!(fields.iter().any(|field| field == "email"));
    assert!(fields.iter().any(|field| field == "subject"));
    assert!(fields.iter().any(|field| field == "message"));
}

#[tokio::test]
async fn contact_rejects_honeypot_submission_before_acceptance() {
    let state = AppState::with_config(AppConfig {
        contact_delivery_mode: ContactDeliveryMode::Store,
        ..AppConfig::default()
    });

    let (status, json) = post_json(
        state,
        "/api/contact",
        json!({
            "name": "Kaylee Example",
            "email": "kaylee@example.com",
            "subject": "Portfolio inquiry",
            "message": "This is a valid length contact message for the portfolio.",
            "company": "spam-filled-honeypot"
        }),
    )
    .await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(json["error"]["code"], "spam_detected");
}

#[tokio::test]
async fn contact_rejects_oversized_payload_before_validation() {
    let state = AppState::with_config(AppConfig {
        contact_delivery_mode: ContactDeliveryMode::Store,
        ..AppConfig::default()
    });

    let (status, json) = post_json(
        state,
        "/api/contact",
        json!({
            "name": "Kaylee Example",
            "email": "kaylee@example.com",
            "subject": "Portfolio inquiry",
            "message": "x".repeat(7_000),
            "company": ""
        }),
    )
    .await;

    assert_eq!(status, StatusCode::PAYLOAD_TOO_LARGE);
    assert_eq!(json["error"]["code"], "payload_too_large");
}

#[tokio::test]
async fn contact_rate_limits_repeat_submissions_from_the_same_sender() {
    let state = AppState::with_config(AppConfig {
        contact_delivery_mode: ContactDeliveryMode::Store,
        rate_limits: RateLimitConfig {
            requests_per_minute: 60,
            contact_per_hour: 1,
        },
        ..AppConfig::default()
    });

    let payload = json!({
        "name": "Kaylee Example",
        "email": "kaylee@example.com",
        "subject": "Portfolio inquiry",
        "message": "This is a valid length contact message for the portfolio.",
        "company": ""
    });

    let (status, json) = post_json(state.clone(), "/api/contact", payload.clone()).await;
    assert_eq!(status, StatusCode::ACCEPTED);
    assert_eq!(json["status"], "accepted");

    let (status, json) = post_json(state, "/api/contact", payload).await;
    assert_eq!(status, StatusCode::TOO_MANY_REQUESTS);
    assert_eq!(json["error"]["code"], "contact_rate_limited");
}

#[tokio::test]
async fn contact_disabled_mode_returns_safe_service_unavailable_response() {
    let (status, json) = post_json(
        AppState::new(),
        "/api/contact",
        json!({
            "name": "Kaylee Example",
            "email": "kaylee@example.com",
            "subject": "Portfolio inquiry",
            "message": "This is a valid length contact message for the portfolio.",
            "company": ""
        }),
    )
    .await;

    assert_eq!(status, StatusCode::SERVICE_UNAVAILABLE);
    assert_eq!(json["error"]["code"], "contact_disabled");
    assert_eq!(json["fallback"], "mailto");
}

#[tokio::test]
async fn events_disabled_by_default_return_structured_disabled_response() {
    let (status, json) = post_json(
        AppState::new(),
        "/api/events",
        json!({
            "event": "contact_form_viewed",
            "path": "/contact/",
            "session_id": null
        }),
    )
    .await;

    assert_eq!(status, StatusCode::SERVICE_UNAVAILABLE);
    assert_eq!(json["error"]["code"], "events_disabled");
}

#[tokio::test]
async fn events_enabled_rejects_unallowlisted_event_names() {
    let state = AppState::with_config(AppConfig {
        event_logging_enabled: true,
        ..AppConfig::default()
    });

    let (status, json) = post_json(
        state,
        "/api/events",
        json!({
            "event": "freeform_tracking_payload",
            "path": "/contact/",
            "session_id": null
        }),
    )
    .await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(json["error"]["code"], "validation_failed");
}
