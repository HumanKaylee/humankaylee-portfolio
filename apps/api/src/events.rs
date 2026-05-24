use crate::state::AppState;
use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Debug, Deserialize)]
pub struct EventRequest {
    event: String,
    path: String,
    #[serde(default)]
    session_id: Option<String>,
}

#[derive(Debug, Serialize)]
struct EventAcceptedResponse {
    status: &'static str,
}

#[derive(Debug, Serialize)]
struct ApiErrorResponse {
    error: ApiError,
}

#[derive(Debug, Serialize)]
struct ApiError {
    code: &'static str,
    message: &'static str,
}

pub async fn events_handler(
    State(state): State<AppState>,
    Json(payload): Json<EventRequest>,
) -> impl IntoResponse {
    if !state.config().event_logging_enabled {
        return (
            StatusCode::SERVICE_UNAVAILABLE,
            Json(ApiErrorResponse {
                error: ApiError {
                    code: "events_disabled",
                    message: "Event logging is disabled.",
                },
            }),
        )
            .into_response();
    }

    if !is_allowlisted_event(payload.event.trim())
        || !payload.path.starts_with('/')
        || payload.path.len() > 200
        || payload.session_id.as_ref().is_some_and(|id| id.len() > 80)
    {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiErrorResponse {
                error: ApiError {
                    code: "validation_failed",
                    message: "Event payload failed validation.",
                },
            }),
        )
            .into_response();
    }

    let event_rate_limit_key = EventRateLimitKey {
        event: payload.event.trim(),
        path: payload.path.trim(),
        session_id: payload.session_id.as_deref().map(str::trim),
    };
    if !state.event_abuse_tracker().allow_submission(
        &event_rate_limit_key,
        state.config().rate_limits.requests_per_minute,
        Duration::from_secs(60),
    ) {
        return (
            StatusCode::TOO_MANY_REQUESTS,
            Json(ApiErrorResponse {
                error: ApiError {
                    code: "events_rate_limited",
                    message: "Event submission rate limit exceeded.",
                },
            }),
        )
            .into_response();
    }

    (
        StatusCode::ACCEPTED,
        Json(EventAcceptedResponse { status: "accepted" }),
    )
        .into_response()
}

fn is_allowlisted_event(event: &str) -> bool {
    matches!(
        event,
        "contact_form_viewed" | "contact_form_submitted" | "project_card_viewed"
    )
}

#[derive(Hash)]
struct EventRateLimitKey<'a> {
    event: &'a str,
    path: &'a str,
    session_id: Option<&'a str>,
}
