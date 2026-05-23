use crate::{config::ContactDeliveryMode, state::AppState};
use axum::{
    body::Bytes,
    extract::State,
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use std::{
    io,
    path::Path,
    time::{SystemTime, UNIX_EPOCH},
};
use tokio::{fs, io::AsyncWriteExt};

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
struct ContactStoreRecord<'a> {
    received_at_unix_seconds: u64,
    name: &'a str,
    email: &'a str,
    subject: &'a str,
    message: &'a str,
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

pub async fn contact_handler(
    State(state): State<AppState>,
    headers: HeaderMap,
    body: Bytes,
) -> impl IntoResponse {
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

    let client_identity = contact_client_identity(&headers, &payload);
    if !state.contact_abuse_tracker().allow_submission(
        &client_identity,
        state.config().rate_limits.contact_per_hour,
    ) {
        return error_response(
            StatusCode::TOO_MANY_REQUESTS,
            "contact_rate_limited",
            "Contact submission rate limit exceeded.",
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

    let Some(contact_store_path) = state.config().contact_store_path.as_deref() else {
        return contact_storage_unavailable_response();
    };

    if store_contact_submission(contact_store_path, &payload)
        .await
        .is_err()
    {
        return contact_storage_unavailable_response();
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

async fn store_contact_submission(path: &Path, payload: &ContactRequest) -> io::Result<()> {
    if let Some(parent) = path
        .parent()
        .filter(|parent| !parent.as_os_str().is_empty())
    {
        fs::create_dir_all(parent).await?;
    }

    let record = ContactStoreRecord {
        received_at_unix_seconds: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs(),
        name: payload.name.trim(),
        email: payload.email.trim(),
        subject: payload.subject.trim(),
        message: payload.message.trim(),
    };

    let mut line = serde_json::to_vec(&record).map_err(io::Error::other)?;
    line.push(b'\n');

    let mut file = fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .await?;
    file.write_all(&line).await?;
    file.flush().await
}

fn contact_storage_unavailable_response() -> axum::response::Response {
    error_response(
        StatusCode::SERVICE_UNAVAILABLE,
        "contact_storage_unavailable",
        "Contact storage is unavailable. Use the static email fallback.",
        Vec::new(),
    )
}

fn contact_client_identity(headers: &HeaderMap, payload: &ContactRequest) -> String {
    if let Some(identity) = forwarded_client_identity(headers) {
        return identity;
    }

    normalize_email(&payload.email).unwrap_or_else(|| "anonymous".to_owned())
}

fn forwarded_client_identity(headers: &HeaderMap) -> Option<String> {
    let forwarded_for = headers
        .get("x-forwarded-for")
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.split(',').next())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToOwned::to_owned);

    forwarded_for.or_else(|| {
        headers
            .get("x-real-ip")
            .and_then(|value| value.to_str().ok())
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(ToOwned::to_owned)
    })
}

fn normalize_email(value: &str) -> Option<String> {
    let normalized = value.trim().to_ascii_lowercase();
    if normalized.is_empty() {
        None
    } else {
        Some(normalized)
    }
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
