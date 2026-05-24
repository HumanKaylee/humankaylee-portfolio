use crate::{
    config::{AppConfig, ContactDeliveryMode},
    state::AppState,
};
use axum::{
    body::Bytes,
    extract::State,
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use std::{
    future::Future,
    io,
    path::{Path, PathBuf},
    pin::Pin,
    sync::Arc,
    time::{Duration, SystemTime, UNIX_EPOCH},
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

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContactSubmission {
    pub name: String,
    pub email: String,
    pub subject: String,
    pub message: String,
}

impl ContactSubmission {
    fn from_request(payload: &ContactRequest) -> Self {
        Self {
            name: payload.name.trim().to_owned(),
            email: payload.email.trim().to_owned(),
            subject: payload.subject.trim().to_owned(),
            message: payload.message.trim().to_owned(),
        }
    }
}

#[derive(Debug)]
pub struct ContactDeliveryError;

impl ContactDeliveryError {
    pub fn unavailable() -> Self {
        Self
    }
}

impl From<io::Error> for ContactDeliveryError {
    fn from(_: io::Error) -> Self {
        Self::unavailable()
    }
}

pub type ContactDeliveryFuture<'a> =
    Pin<Box<dyn Future<Output = Result<(), ContactDeliveryError>> + Send + 'a>>;

pub trait ContactDelivery: Send + Sync + 'static {
    fn deliver<'a>(&'a self, submission: ContactSubmission) -> ContactDeliveryFuture<'a>;
}

#[derive(Clone)]
pub struct JsonlContactDelivery {
    path: PathBuf,
}

impl JsonlContactDelivery {
    pub fn new(path: PathBuf) -> Self {
        Self { path }
    }
}

impl ContactDelivery for JsonlContactDelivery {
    fn deliver<'a>(&'a self, submission: ContactSubmission) -> ContactDeliveryFuture<'a> {
        Box::pin(async move {
            store_contact_submission(&self.path, &submission)
                .await
                .map_err(Into::into)
        })
    }
}

pub struct UnavailableContactDelivery;

impl ContactDelivery for UnavailableContactDelivery {
    fn deliver<'a>(&'a self, _submission: ContactSubmission) -> ContactDeliveryFuture<'a> {
        Box::pin(async { Err(ContactDeliveryError::unavailable()) })
    }
}

pub fn contact_delivery_from_config(config: &AppConfig) -> Arc<dyn ContactDelivery> {
    match (
        &config.contact_delivery_mode,
        config.contact_store_path.clone(),
    ) {
        (ContactDeliveryMode::Store, Some(path)) => Arc::new(JsonlContactDelivery::new(path)),
        _ => Arc::new(UnavailableContactDelivery),
    }
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
    _headers: HeaderMap,
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

    let client_identity = contact_client_identity(&payload);
    if !state.contact_abuse_tracker().allow_submission(
        &client_identity,
        state.config().rate_limits.contact_per_hour,
        Duration::from_secs(60 * 60),
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

    if state
        .contact_delivery()
        .deliver(ContactSubmission::from_request(&payload))
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

async fn store_contact_submission(path: &Path, submission: &ContactSubmission) -> io::Result<()> {
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
        name: &submission.name,
        email: &submission.email,
        subject: &submission.subject,
        message: &submission.message,
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

fn contact_client_identity(payload: &ContactRequest) -> String {
    normalize_email(&payload.email).unwrap_or_else(|| "anonymous".to_owned())
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
