use crate::config::AppConfig;
use std::time::Instant;

#[derive(Clone)]
pub struct AppState {
    config: AppConfig,
    started_at: Instant,
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
        Self {
            config,
            started_at: Instant::now(),
        }
    }

    pub fn with_started_at(started_at: Instant) -> Self {
        Self::with_config_and_started_at(AppConfig::default(), started_at)
    }

    pub fn with_config_and_started_at(config: AppConfig, started_at: Instant) -> Self {
        Self { config, started_at }
    }

    pub fn started_at(&self) -> Instant {
        self.started_at
    }

    pub fn config(&self) -> &AppConfig {
        &self.config
    }
}
