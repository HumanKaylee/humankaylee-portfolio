use std::time::Instant;

#[derive(Clone)]
pub struct AppState {
    started_at: Instant,
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}

impl AppState {
    pub fn new() -> Self {
        Self {
            started_at: Instant::now(),
        }
    }

    pub fn with_started_at(started_at: Instant) -> Self {
        Self { started_at }
    }

    pub fn started_at(&self) -> Instant {
        self.started_at
    }
}
