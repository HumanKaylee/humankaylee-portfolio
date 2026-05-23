use crate::state::AppState;
use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};

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
    // TODO(phase5-security): Add explicit event allowlist/rate limits before
    // enabling events beyond test/local privacy-safe plumbing.
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
