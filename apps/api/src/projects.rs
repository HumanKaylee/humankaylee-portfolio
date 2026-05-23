use axum::{response::IntoResponse, Json};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ProjectsLivePayload {
    pub cached_at: &'static str,
    pub stale: bool,
    pub projects: &'static [ProjectMetadata],
}

#[derive(Debug, Serialize)]
pub struct ProjectMetadata {
    pub key: &'static str,
    pub title: &'static str,
    pub status: &'static str,
    pub categories: &'static [&'static str],
    pub summary: &'static str,
}

const PROJECTS: &[ProjectMetadata] = &[
    ProjectMetadata {
        key: "systems-atelier",
        title: "Systems Atelier Portfolio",
        status: "active",
        categories: &["creative web", "backend", "operations"],
        summary: "Static-first portfolio with a small Rust API enhancement surface.",
    },
    ProjectMetadata {
        key: "fleet-sync",
        title: "CLI Fleet Sync",
        status: "active",
        categories: &["automation", "infrastructure"],
        summary: "Repeatable workstation tooling verification and rollout workflows.",
    },
];

pub async fn projects_live_handler() -> impl IntoResponse {
    Json(projects_live_response())
}

pub fn projects_live_response() -> ProjectsLivePayload {
    ProjectsLivePayload {
        cached_at: "2026-05-23T00:00:00Z",
        stale: false,
        projects: PROJECTS,
    }
}
