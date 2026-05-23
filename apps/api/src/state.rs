use crate::config::AppConfig;
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
        let contact_abuse_tracker = Arc::new(ContactAbuseTracker::new());
        Self {
            config,
            started_at: Instant::now(),
            contact_abuse_tracker,
        }
    }

    pub fn with_started_at(started_at: Instant) -> Self {
        Self::with_config_and_started_at(AppConfig::default(), started_at)
    }

    pub fn with_config_and_started_at(config: AppConfig, started_at: Instant) -> Self {
        Self {
            config,
            started_at,
            contact_abuse_tracker: Arc::new(ContactAbuseTracker::new()),
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
