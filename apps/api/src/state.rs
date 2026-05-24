use crate::{
    config::AppConfig,
    contact::{contact_delivery_from_config, ContactDelivery},
    projects::ProjectsLiveCache,
};
use std::{
    collections::{HashMap, VecDeque},
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};

#[derive(Clone)]
pub struct AppState {
    config: AppConfig,
    started_at: Instant,
    contact_abuse_tracker: Arc<ContactAbuseTracker>,
    contact_delivery: Arc<dyn ContactDelivery>,
    projects_live_cache: ProjectsLiveCache,
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}

impl AppState {
    pub fn new() -> Self {
        Self::with_config(AppConfig::default())
    }

    pub fn with_config(config: AppConfig) -> Self {
        Self::with_config_and_projects_live_cache(config, ProjectsLiveCache::default())
    }

    pub fn with_projects_live_cache(projects_live_cache: ProjectsLiveCache) -> Self {
        Self::with_config_and_projects_live_cache(AppConfig::default(), projects_live_cache)
    }

    pub fn with_config_and_projects_live_cache(
        config: AppConfig,
        projects_live_cache: ProjectsLiveCache,
    ) -> Self {
        let contact_delivery = contact_delivery_from_config(&config);
        Self::with_config_projects_live_cache_and_contact_delivery(
            config,
            projects_live_cache,
            contact_delivery,
        )
    }

    pub fn with_config_and_contact_delivery(
        config: AppConfig,
        contact_delivery: Arc<dyn ContactDelivery>,
    ) -> Self {
        Self::with_config_projects_live_cache_and_contact_delivery(
            config,
            ProjectsLiveCache::default(),
            contact_delivery,
        )
    }

    fn with_config_projects_live_cache_and_contact_delivery(
        config: AppConfig,
        projects_live_cache: ProjectsLiveCache,
        contact_delivery: Arc<dyn ContactDelivery>,
    ) -> Self {
        let contact_abuse_tracker = Arc::new(ContactAbuseTracker::new());
        Self {
            config,
            started_at: Instant::now(),
            contact_abuse_tracker,
            contact_delivery,
            projects_live_cache,
        }
    }

    pub fn with_started_at(started_at: Instant) -> Self {
        Self::with_config_and_started_at(AppConfig::default(), started_at)
    }

    pub fn with_config_and_started_at(config: AppConfig, started_at: Instant) -> Self {
        Self {
            contact_delivery: contact_delivery_from_config(&config),
            config,
            started_at,
            contact_abuse_tracker: Arc::new(ContactAbuseTracker::new()),
            projects_live_cache: ProjectsLiveCache::default(),
        }
    }

    pub fn started_at(&self) -> Instant {
        self.started_at
    }

    pub fn config(&self) -> &AppConfig {
        &self.config
    }

    pub fn contact_abuse_tracker(&self) -> &ContactAbuseTracker {
        self.contact_abuse_tracker.as_ref()
    }

    pub fn contact_delivery(&self) -> &dyn ContactDelivery {
        self.contact_delivery.as_ref()
    }

    pub fn projects_live_cache(&self) -> &ProjectsLiveCache {
        &self.projects_live_cache
    }
}

#[derive(Default)]
pub struct ContactAbuseTracker {
    attempts: Mutex<HashMap<String, VecDeque<Instant>>>,
}

impl ContactAbuseTracker {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn allow_submission(&self, key: &str, limit: u32) -> bool {
        if limit == 0 {
            return false;
        }

        let mut attempts = self
            .attempts
            .lock()
            .expect("contact abuse tracker mutex poisoned");
        let now = Instant::now();
        let window = Duration::from_secs(60 * 60);
        let entries = attempts.entry(key.to_owned()).or_default();

        while let Some(front) = entries.front() {
            if now.duration_since(*front) > window {
                entries.pop_front();
            } else {
                break;
            }
        }

        if entries.len() >= limit as usize {
            return false;
        }

        entries.push_back(now);
        true
    }
}
