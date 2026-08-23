use crate::state::AppState;
use axum::{extract::State, response::IntoResponse, Json};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct HealthPayload {
    pub status: &'static str,
    pub service: &'static str,
    pub version: String,
    pub commit: &'static str,
    pub uptime_seconds: u64,
}

pub async fn health_handler(State(state): State<AppState>) -> impl IntoResponse {
    Json(health_response(&state))
}

pub fn health_response(state: &AppState) -> HealthPayload {
    let uptime_seconds = state.started_at().elapsed().as_secs();

    HealthPayload {
        status: "ok",
        service: "humankaylee-portfolio-api",
        version: state.config().version.clone(),
        commit: option_env!("GIT_SHA").unwrap_or("local-dev"),
        uptime_seconds,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    #[test]
    fn health_response_includes_expected_scaffold_fields() {
        let state = AppState::new();
        let payload = health_response(&state);

        assert_eq!(payload.status, "ok");
        assert_eq!(payload.service, "humankaylee-portfolio-api");
        assert_eq!(payload.version, env!("CARGO_PKG_VERSION"));
        assert_eq!(payload.commit, "local-dev");
        assert!(payload.uptime_seconds <= 1);
    }

    #[test]
    fn health_response_reports_elapsed_uptime() {
        let state = AppState::with_started_at(std::time::Instant::now() - Duration::from_secs(7));

        let payload = health_response(&state);

        assert!(payload.uptime_seconds >= 7);
    }
}
