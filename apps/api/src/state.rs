use crate::{
    config::AppConfig,
    contact::{contact_delivery_from_config, ContactDelivery},
    projects::ProjectsLiveCache,
};
use std::{
    collections::{hash_map::RandomState, HashMap, VecDeque},
    hash::{BuildHasher, Hash},
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};

#[derive(Clone)]
pub struct AppState {
    config: AppConfig,
    started_at: Instant,
    contact_abuse_tracker: Arc<SlidingWindowAbuseTracker>,
    event_abuse_tracker: Arc<SlidingWindowAbuseTracker>,
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
        let contact_abuse_tracker = Arc::new(SlidingWindowAbuseTracker::new());
        let event_abuse_tracker = Arc::new(SlidingWindowAbuseTracker::new());
        Self {
            config,
            started_at: Instant::now(),
            contact_abuse_tracker,
            event_abuse_tracker,
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
            contact_abuse_tracker: Arc::new(SlidingWindowAbuseTracker::new()),
            event_abuse_tracker: Arc::new(SlidingWindowAbuseTracker::new()),
            projects_live_cache: ProjectsLiveCache::default(),
        }
    }

    pub fn started_at(&self) -> Instant {
        self.started_at
    }

    pub fn config(&self) -> &AppConfig {
        &self.config
    }

    pub fn contact_abuse_tracker(&self) -> &SlidingWindowAbuseTracker {
        self.contact_abuse_tracker.as_ref()
    }

    pub fn event_abuse_tracker(&self) -> &SlidingWindowAbuseTracker {
        self.event_abuse_tracker.as_ref()
    }

    pub fn contact_delivery(&self) -> &dyn ContactDelivery {
        self.contact_delivery.as_ref()
    }

    pub fn projects_live_cache(&self) -> &ProjectsLiveCache {
        &self.projects_live_cache
    }
}

#[derive(Default)]
pub struct SlidingWindowAbuseTracker {
    attempts: Mutex<HashMap<u64, VecDeque<Instant>, RandomState>>,
    hash_builder: RandomState,
}

impl SlidingWindowAbuseTracker {
    pub fn new() -> Self {
        let hash_builder = RandomState::new();
        Self {
            attempts: Mutex::new(HashMap::with_hasher(hash_builder.clone())),
            hash_builder,
        }
    }

    pub fn allow_submission<K: Hash + ?Sized>(
        &self,
        key: &K,
        limit: u32,
        window: Duration,
    ) -> bool {
        if limit == 0 {
            return false;
        }

        let mut attempts = self.attempts.lock().expect("abuse tracker mutex poisoned");
        let hashed_key = self.hash_key(key);
        let now = Instant::now();
        let entries = attempts.entry(hashed_key).or_default();

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

    fn hash_key<K: Hash + ?Sized>(&self, key: &K) -> u64 {
        self.hash_builder.hash_one(key)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    #[test]
    fn sliding_window_tracker_does_not_retain_raw_private_key_material() {
        let tracker = SlidingWindowAbuseTracker::new();
        let raw_key = "contact_form_viewed|/contact/private-review|session-private-123";

        assert!(tracker.allow_submission(raw_key, 1, Duration::from_secs(60)));

        let stored_keys = tracker
            .attempts
            .lock()
            .expect("tracker mutex")
            .keys()
            .cloned()
            .collect::<Vec<_>>();
        let stored_keys_debug = format!("{stored_keys:?}");

        assert!(!stored_keys_debug.contains("contact_form_viewed"));
        assert!(!stored_keys_debug.contains("/contact/private-review"));
        assert!(!stored_keys_debug.contains("session-private-123"));
    }
}
