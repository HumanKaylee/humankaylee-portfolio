use crate::state::AppState;
use axum::{extract::State, response::IntoResponse, Json};
use serde::Serialize;
use std::{
    sync::{Arc, Mutex},
    time::Duration,
};

const PROJECTS_REFRESH_TIMEOUT: Duration = Duration::from_millis(100);

#[derive(Clone, Debug, Serialize)]
pub struct ProjectsLivePayload {
    pub cached_at: String,
    pub stale: bool,
    pub source: &'static str,
    pub projects: Vec<ProjectMetadata>,
}

#[derive(Clone, Debug, Serialize)]
pub struct ProjectMetadata {
    pub key: String,
    pub title: String,
    pub status: String,
    pub categories: Vec<String>,
    pub summary: String,
}

impl ProjectMetadata {
    pub fn new(
        key: impl Into<String>,
        title: impl Into<String>,
        status: impl Into<String>,
        categories: impl IntoIterator<Item = impl Into<String>>,
        summary: impl Into<String>,
    ) -> Self {
        Self {
            key: key.into(),
            title: title.into(),
            status: status.into(),
            categories: categories.into_iter().map(Into::into).collect(),
            summary: summary.into(),
        }
    }
}

#[derive(Clone, Debug)]
pub struct ProjectsLiveSnapshot {
    cached_at: String,
    projects: Vec<ProjectMetadata>,
}

impl ProjectsLiveSnapshot {
    pub fn new(cached_at: impl Into<String>, projects: Vec<ProjectMetadata>) -> Self {
        Self {
            cached_at: cached_at.into(),
            projects,
        }
    }

    fn into_payload(self, stale: bool, source: &'static str) -> ProjectsLivePayload {
        ProjectsLivePayload {
            cached_at: self.cached_at,
            stale,
            source,
            projects: self.projects,
        }
    }
}

#[derive(Debug)]
pub struct ProjectsLiveError;

impl ProjectsLiveError {
    pub fn unavailable() -> Self {
        Self
    }
}

pub trait ProjectMetadataProvider: Send + Sync + 'static {
    fn refresh(&self) -> Result<ProjectsLiveSnapshot, ProjectsLiveError>;
}

#[derive(Clone)]
pub struct ProjectsLiveCache {
    cached: Arc<Mutex<ProjectsLiveSnapshot>>,
    provider: Arc<dyn ProjectMetadataProvider>,
}

impl Default for ProjectsLiveCache {
    fn default() -> Self {
        Self::with_snapshot_and_provider(
            static_projects_snapshot(),
            Arc::new(StaticProjectsProvider),
        )
    }
}

impl ProjectsLiveCache {
    pub fn with_snapshot_and_provider(
        snapshot: ProjectsLiveSnapshot,
        provider: Arc<dyn ProjectMetadataProvider>,
    ) -> Self {
        Self {
            cached: Arc::new(Mutex::new(snapshot)),
            provider,
        }
    }

    pub async fn response(&self) -> ProjectsLivePayload {
        let provider = Arc::clone(&self.provider);
        let refresh = tokio::task::spawn_blocking(move || provider.refresh());

        match tokio::time::timeout(PROJECTS_REFRESH_TIMEOUT, refresh).await {
            Ok(Ok(Ok(snapshot))) => self.update(snapshot),
            Ok(Ok(Err(_))) | Ok(Err(_)) | Err(_) => self.stale(),
        }
    }

    fn update(&self, snapshot: ProjectsLiveSnapshot) -> ProjectsLivePayload {
        *self
            .cached
            .lock()
            .expect("projects live cache mutex poisoned") = snapshot.clone();
        snapshot.into_payload(false, "refresh")
    }

    fn stale(&self) -> ProjectsLivePayload {
        self.cached
            .lock()
            .expect("projects live cache mutex poisoned")
            .clone()
            .into_payload(true, "stale-cache")
    }
}

struct StaticProjectsProvider;

impl ProjectMetadataProvider for StaticProjectsProvider {
    fn refresh(&self) -> Result<ProjectsLiveSnapshot, ProjectsLiveError> {
        Ok(static_projects_snapshot())
    }
}

pub async fn projects_live_handler(State(state): State<AppState>) -> impl IntoResponse {
    Json(state.projects_live_cache().response().await)
}

pub async fn projects_live_response() -> ProjectsLivePayload {
    ProjectsLiveCache::default().response().await
}

fn static_projects_snapshot() -> ProjectsLiveSnapshot {
    ProjectsLiveSnapshot::new(
        "2026-05-23T00:00:00Z",
        vec![
            ProjectMetadata::new(
                "systems-atelier",
                "Systems Atelier Portfolio",
                "active",
                ["creative web", "backend", "operations"],
                "Static-first portfolio with a small Rust API enhancement surface.",
            ),
            ProjectMetadata::new(
                "fleet-sync",
                "CLI Fleet Sync",
                "active",
                ["automation", "infrastructure"],
                "Repeatable workstation tooling verification and rollout workflows.",
            ),
        ],
    )
}
