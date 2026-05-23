use crate::{config::ContactDeliveryMode, state::AppState};
use axum::{body::Bytes, extract::State, http::StatusCode, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct ContactRequest {
    name: String,
    email: String,
    subject: String,
    message: String,
    #[serde(default)]
    company: String,
}

pub const CONTACT_REQUEST_BODY_LIMIT_BYTES: usize = 6 * 1024;

#[derive(Debug, Serialize)]
struct ContactAcceptedResponse {
    status: &'static str,
    delivery: &'static str,
    message: &'static str,
}

#[derive(Debug, Serialize)]
struct ContactDisabledResponse {
    error: ApiError,
    fallback: &'static str,
}

#[derive(Debug, Serialize)]
struct ApiErrorResponse {
    error: ApiError,
}

#[derive(Debug, Serialize)]
struct ApiError {
    code: &'static str,
    message: &'static str,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    fields: Vec<&'static str>,
}

pub async fn contact_handler(State(state): State<AppState>, body: Bytes) -> impl IntoResponse {
    // TODO(phase5-security): Add stateful rate-limit plumbing once the API has
    // tower-http middleware; keep this handler free of provider logging.
    if body.len() > CONTACT_REQUEST_BODY_LIMIT_BYTES {
        return error_response(
            StatusCode::PAYLOAD_TOO_LARGE,
            "payload_too_large",
            "Contact submission is too large.",
            Vec::new(),
        );
    }

    let payload = match serde_json::from_slice::<ContactRequest>(&body) {
        Ok(payload) => payload,
        Err(_) => {
            return error_response(
                StatusCode::BAD_REQUEST,
                "invalid_json",
                "Request body must be valid JSON.",
                Vec::new(),
            );
        }
    };

    if state.config().contact_delivery_mode == ContactDeliveryMode::Disabled {
        return (
            StatusCode::SERVICE_UNAVAILABLE,
            Json(ContactDisabledResponse {
                error: ApiError {
                    code: "contact_disabled",
                    message: "Contact API is disabled. Use the static email fallback.",
                    fields: Vec::new(),
                },
                fallback: "mailto",
            }),
        )
            .into_response();
    }

    if !payload.company.trim().is_empty() {
        return error_response(
            StatusCode::BAD_REQUEST,
            "spam_detected",
            "Submission rejected.",
            Vec::new(),
        );
    }

    let invalid_fields = validate_contact(&payload);
    if !invalid_fields.is_empty() {
        return error_response(
            StatusCode::BAD_REQUEST,
            "validation_failed",
            "Contact submission failed validation.",
            invalid_fields,
        );
    }

    (
        StatusCode::ACCEPTED,
        Json(ContactAcceptedResponse {
            status: "accepted",
            delivery: "store",
            message: "Message queued for follow-up.",
        }),
    )
        .into_response()
}

fn error_response(
    status: StatusCode,
    code: &'static str,
    message: &'static str,
    fields: Vec<&'static str>,
) -> axum::response::Response {
    (
        status,
        Json(ApiErrorResponse {
            error: ApiError {
                code,
                message,
                fields,
            },
        }),
    )
        .into_response()
}

fn validate_contact(payload: &ContactRequest) -> Vec<&'static str> {
    let mut fields = Vec::new();

    let name = payload.name.trim();
    if !(2..=120).contains(&name.len()) {
        fields.push("name");
    }

    let email = payload.email.trim();
    if !(3..=254).contains(&email.len())
        || !email.contains('@')
        || email.starts_with('@')
        || email.ends_with('@')
    {
        fields.push("email");
    }

    let subject = payload.subject.trim();
    if !(3..=160).contains(&subject.len()) {
        fields.push("subject");
    }

    let message = payload.message.trim();
    if !(20..=4_000).contains(&message.len()) {
        fields.push("message");
    }

    fields
}
