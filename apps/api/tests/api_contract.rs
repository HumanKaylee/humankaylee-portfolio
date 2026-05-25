use axum::{
    body::{to_bytes, Body},
    http::{header, Request, StatusCode},
};
use humankaylee_api::{
    app,
    config::{AppConfig, ContactDeliveryMode, RateLimitConfig},
    contact::{ContactDelivery, ContactDeliveryError, ContactDeliveryFuture, ContactSubmission},
    projects::{
        ProjectMetadata, ProjectMetadataProvider, ProjectsLiveCache, ProjectsLiveError,
        ProjectsLiveSnapshot,
    },
    state::AppState,
};
use serde_json::json;
use serde_json::Value;
use std::{
    fs,
    path::PathBuf,
    sync::{Arc, Mutex},
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};
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

fn unique_contact_store_path(label: &str) -> PathBuf {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system time")
        .as_nanos();
    std::env::temp_dir().join(format!(
        "humankaylee-contact-{label}-{}-{timestamp}.jsonl",
        std::process::id()
    ))
}

fn projects_snapshot(cached_at: &str, title: &str) -> ProjectsLiveSnapshot {
    ProjectsLiveSnapshot::new(
        cached_at,
        vec![ProjectMetadata::new(
            "cache-test",
            title,
            "active",
            vec!["verification"],
            "Cached safe project metadata for API contract checks.",
        )],
    )
}

struct FailingProjectsProvider;

impl ProjectMetadataProvider for FailingProjectsProvider {
    fn refresh(&self) -> Result<ProjectsLiveSnapshot, ProjectsLiveError> {
        Err(ProjectsLiveError::unavailable())
    }
}

struct StaticProjectsProvider {
    snapshot: ProjectsLiveSnapshot,
}

impl ProjectMetadataProvider for StaticProjectsProvider {
    fn refresh(&self) -> Result<ProjectsLiveSnapshot, ProjectsLiveError> {
        Ok(self.snapshot.clone())
    }
}

struct SlowProjectsProvider {
    snapshot: ProjectsLiveSnapshot,
}

impl ProjectMetadataProvider for SlowProjectsProvider {
    fn refresh(&self) -> Result<ProjectsLiveSnapshot, ProjectsLiveError> {
        std::thread::sleep(Duration::from_millis(250));
        Ok(self.snapshot.clone())
    }
}

#[derive(Clone, Default)]
struct RecordingContactDelivery {
    submissions: Arc<Mutex<Vec<ContactSubmission>>>,
}

impl RecordingContactDelivery {
    fn submissions(&self) -> Vec<ContactSubmission> {
        self.submissions.lock().expect("submissions mutex").clone()
    }
}

impl ContactDelivery for RecordingContactDelivery {
    fn deliver<'a>(&'a self, submission: ContactSubmission) -> ContactDeliveryFuture<'a> {
        Box::pin(async move {
            self.submissions
                .lock()
                .expect("submissions mutex")
                .push(submission);
            Ok(())
        })
    }
}

struct FailingContactDelivery;

impl ContactDelivery for FailingContactDelivery {
    fn deliver<'a>(&'a self, _submission: ContactSubmission) -> ContactDeliveryFuture<'a> {
        Box::pin(async { Err(ContactDeliveryError::unavailable()) })
    }
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
    assert_eq!(json["source"], "refresh");
    assert!(json["projects"].as_array().expect("projects").len() >= 2);

    for project in json["projects"].as_array().expect("projects") {
        assert!(project["key"].as_str().is_some());
        assert!(project["title"].as_str().is_some());
        assert!(project["status"].as_str().is_some());
        assert!(project["categories"].as_array().is_some());
        assert!(project.get("url").is_none());
    }
}

#[tokio::test]
async fn projects_live_route_returns_stale_safe_cache_when_refresh_fails() {
    let cache = ProjectsLiveCache::with_snapshot_and_provider(
        projects_snapshot("2026-05-24T00:00:00Z", "Cached Portfolio Evidence"),
        Arc::new(FailingProjectsProvider),
    );
    let state = AppState::with_projects_live_cache(cache);

    let (status, json) = get_json(state, "/api/projects/live").await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(json["cached_at"], "2026-05-24T00:00:00Z");
    assert_eq!(json["stale"], true);
    assert_eq!(json["source"], "stale-cache");
    assert_eq!(json["projects"][0]["title"], "Cached Portfolio Evidence");
    assert!(json.get("error").is_none());
    assert!(!json.to_string().contains("unavailable"));
}

#[tokio::test]
async fn projects_live_route_refreshes_cache_when_provider_succeeds() {
    let cache = ProjectsLiveCache::with_snapshot_and_provider(
        projects_snapshot("2026-05-24T00:00:00Z", "Old Portfolio Evidence"),
        Arc::new(StaticProjectsProvider {
            snapshot: projects_snapshot("2026-05-24T01:00:00Z", "Fresh Portfolio Evidence"),
        }),
    );
    let state = AppState::with_projects_live_cache(cache);

    let (status, json) = get_json(state, "/api/projects/live").await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(json["cached_at"], "2026-05-24T01:00:00Z");
    assert_eq!(json["stale"], false);
    assert_eq!(json["source"], "refresh");
    assert_eq!(json["projects"][0]["title"], "Fresh Portfolio Evidence");
}

#[tokio::test]
async fn projects_live_route_returns_stale_cache_when_refresh_is_slow() {
    let cache = ProjectsLiveCache::with_snapshot_and_provider(
        projects_snapshot("2026-05-24T00:00:00Z", "Bounded Cached Evidence"),
        Arc::new(SlowProjectsProvider {
            snapshot: projects_snapshot("2026-05-24T01:00:00Z", "Slow Fresh Evidence"),
        }),
    );
    let state = AppState::with_projects_live_cache(cache);

    let started_at = Instant::now();
    let (status, json) = get_json(state, "/api/projects/live").await;

    assert_eq!(status, StatusCode::OK);
    assert!(
        started_at.elapsed() < Duration::from_millis(200),
        "stale cache should return before slow provider refresh completes"
    );
    assert_eq!(json["cached_at"], "2026-05-24T00:00:00Z");
    assert_eq!(json["stale"], true);
    assert_eq!(json["source"], "stale-cache");
    assert_eq!(json["projects"][0]["title"], "Bounded Cached Evidence");
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
        (
            "HK_API_CONTACT_STORE_PATH",
            "/tmp/humankaylee-contact.jsonl",
        ),
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
    assert_eq!(
        config.contact_store_path,
        Some(PathBuf::from("/tmp/humankaylee-contact.jsonl"))
    );
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

#[test]
fn config_requires_contact_store_path_when_store_mode_is_enabled() {
    for pairs in [
        vec![("HK_API_CONTACT_DELIVERY_MODE", "store")],
        vec![
            ("HK_API_CONTACT_DELIVERY_MODE", "store"),
            ("HK_API_CONTACT_STORE_PATH", "   "),
        ],
    ] {
        let error = AppConfig::from_env_pairs(pairs).expect_err(
            "store contact delivery must fail fast when HK_API_CONTACT_STORE_PATH is missing",
        );
        assert!(
            error.to_string().contains("HK_API_CONTACT_STORE_PATH"),
            "error should name missing store path: {error}"
        );
    }
}

#[test]
fn config_rejects_blank_empty_or_invalid_allowed_origins_when_env_var_is_present() {
    for pairs in [
        vec![("HK_API_ALLOWED_ORIGINS", "   ")],
        vec![(
            "HK_API_ALLOWED_ORIGINS",
            "https://example.com, ,http://localhost:4321",
        )],
        vec![("HK_API_ALLOWED_ORIGINS", "invalid")],
        vec![(
            "HK_API_ALLOWED_ORIGINS",
            "https://example.com/not-an-origin",
        )],
        vec![("HK_API_ALLOWED_ORIGINS", "https://example.com:abc")],
        vec![("HK_API_ALLOWED_ORIGINS", "https://:443")],
        vec![("HK_API_ALLOWED_ORIGINS", "https://user@example.com")],
        vec![("HK_API_ALLOWED_ORIGINS", "https://[::1]:abc")],
        vec![("HK_API_ALLOWED_ORIGINS", "https://[::1]extra")],
    ] {
        let error = AppConfig::from_env_pairs(pairs).expect_err("invalid origins should fail fast");
        assert!(
            error.to_string().contains("HK_API_ALLOWED_ORIGINS"),
            "error should name invalid allowed origins config: {error}"
        );
    }
}

#[test]
fn telemetry_defaults_to_structured_json_with_api_and_http_filters() {
    assert_eq!(humankaylee_api::telemetry::log_encoding(), "json");
    let default_filter = humankaylee_api::telemetry::default_filter_directive();

    assert!(default_filter.contains("humankaylee_api=info"));
    assert!(default_filter.contains("tower_http=info"));
}

#[tokio::test]
async fn contact_store_mode_accepts_valid_submission_without_echoing_private_message() {
    let store_path = unique_contact_store_path("valid");
    let state = AppState::with_config(AppConfig {
        contact_delivery_mode: ContactDeliveryMode::Store,
        contact_store_path: Some(store_path.clone()),
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

    let stored = fs::read_to_string(&store_path).expect("stored contact JSONL");
    let records = stored.lines().collect::<Vec<_>>();
    assert_eq!(records.len(), 1);

    let record: Value = serde_json::from_str(records[0]).expect("stored contact record");
    assert!(record["received_at_unix_seconds"].as_u64().is_some());
    assert_eq!(record["name"], "Kaylee Example");
    assert_eq!(record["email"], "kaylee@example.com");
    assert_eq!(record["subject"], "Portfolio inquiry");
    assert_eq!(
        record["message"],
        "This private message body must not be echoed in the response."
    );
    assert!(record.get("company").is_none());
    assert!(record.get("headers").is_none());

    fs::remove_file(store_path).expect("remove contact store");
}

#[tokio::test]
async fn contact_accepts_submission_through_fake_delivery_adapter_without_echoing_private_text() {
    let delivery = RecordingContactDelivery::default();
    let state = AppState::with_config_and_contact_delivery(
        AppConfig {
            contact_delivery_mode: ContactDeliveryMode::Store,
            ..AppConfig::default()
        },
        Arc::new(delivery.clone()),
    );

    let (status, json) = post_json(
        state,
        "/api/contact",
        json!({
            "name": "  Kaylee Example  ",
            "email": "  KAYLEE@EXAMPLE.COM  ",
            "subject": "  Portfolio inquiry  ",
            "message": "  This private adapter message body must not be echoed.  ",
            "company": ""
        }),
    )
    .await;

    assert_eq!(status, StatusCode::ACCEPTED);
    assert_eq!(json["status"], "accepted");
    assert_eq!(json["delivery"], "store");
    assert!(!json.to_string().contains("private adapter message body"));

    let submissions = delivery.submissions();
    assert_eq!(submissions.len(), 1);
    assert_eq!(submissions[0].name, "Kaylee Example");
    assert_eq!(submissions[0].email, "KAYLEE@EXAMPLE.COM");
    assert_eq!(submissions[0].subject, "Portfolio inquiry");
    assert_eq!(
        submissions[0].message,
        "This private adapter message body must not be echoed."
    );
}

#[tokio::test]
async fn contact_returns_safe_fallback_when_delivery_adapter_fails() {
    let state = AppState::with_config_and_contact_delivery(
        AppConfig {
            contact_delivery_mode: ContactDeliveryMode::Store,
            ..AppConfig::default()
        },
        Arc::new(FailingContactDelivery),
    );

    let (status, json) = post_json(
        state,
        "/api/contact",
        json!({
            "name": "Kaylee Example",
            "email": "kaylee@example.com",
            "subject": "Portfolio inquiry",
            "message": "This private failing adapter message must not be echoed.",
            "company": ""
        }),
    )
    .await;

    assert_eq!(status, StatusCode::SERVICE_UNAVAILABLE);
    assert_eq!(json["error"]["code"], "contact_storage_unavailable");
    assert_eq!(
        json["error"]["message"],
        "Contact storage is unavailable. Use the static email fallback."
    );
    assert!(!json.to_string().contains("private failing adapter message"));
}

#[tokio::test]
async fn contact_store_mode_requires_configured_storage_before_accepting_submission() {
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
            "company": ""
        }),
    )
    .await;

    assert_eq!(status, StatusCode::SERVICE_UNAVAILABLE);
    assert_eq!(json["error"]["code"], "contact_storage_unavailable");
    assert_eq!(
        json["error"]["message"],
        "Contact storage is unavailable. Use the static email fallback."
    );
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
    let store_path = unique_contact_store_path("rate-limit");
    let state = AppState::with_config(AppConfig {
        contact_delivery_mode: ContactDeliveryMode::Store,
        contact_store_path: Some(store_path.clone()),
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

    fs::remove_file(store_path).expect("remove contact store");
}

#[tokio::test]
async fn contact_rate_limit_does_not_trust_spoofable_forwarded_headers_by_default() {
    let store_path = unique_contact_store_path("spoofed-forwarded");
    let state = AppState::with_config(AppConfig {
        contact_delivery_mode: ContactDeliveryMode::Store,
        contact_store_path: Some(store_path.clone()),
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

    let first = request(
        state.clone(),
        Request::builder()
            .method("POST")
            .uri("/api/contact")
            .header("content-type", "application/json")
            .header("x-forwarded-for", "198.51.100.10")
            .body(Body::from(payload.to_string()))
            .expect("request"),
    )
    .await;
    assert_eq!(first.status(), StatusCode::ACCEPTED);

    let second = request(
        state,
        Request::builder()
            .method("POST")
            .uri("/api/contact")
            .header("content-type", "application/json")
            .header("x-forwarded-for", "203.0.113.20")
            .header("x-real-ip", "203.0.113.21")
            .body(Body::from(payload.to_string()))
            .expect("request"),
    )
    .await;
    let status = second.status();
    let body = to_bytes(second.into_body(), usize::MAX)
        .await
        .expect("body");
    let json: Value = serde_json::from_slice(&body).expect("json");

    assert_eq!(status, StatusCode::TOO_MANY_REQUESTS);
    assert_eq!(json["error"]["code"], "contact_rate_limited");

    fs::remove_file(store_path).expect("remove contact store");
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

#[tokio::test]
async fn events_enabled_rate_limits_repeated_allowlisted_submissions_without_echoing_payload() {
    let state = AppState::with_config(AppConfig {
        event_logging_enabled: true,
        rate_limits: RateLimitConfig {
            requests_per_minute: 1,
            contact_per_hour: 3,
        },
        ..AppConfig::default()
    });
    let payload = json!({
        "event": "contact_form_viewed",
        "path": "/contact/private-review",
        "session_id": "session-private-123"
    });

    let (status, json) = post_json(state.clone(), "/api/events", payload.clone()).await;
    assert_eq!(status, StatusCode::ACCEPTED);
    assert_eq!(json["status"], "accepted");

    let (status, json) = post_json(state, "/api/events", payload).await;
    assert_eq!(status, StatusCode::TOO_MANY_REQUESTS);
    assert_eq!(json["error"]["code"], "events_rate_limited");
    assert!(!json.to_string().contains("contact_form_viewed"));
    assert!(!json.to_string().contains("/contact/private-review"));
    assert!(!json.to_string().contains("session-private-123"));
}
