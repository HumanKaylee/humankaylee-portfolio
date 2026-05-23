use std::{collections::HashMap, env, error::Error, fmt};

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AppConfig {
    pub host: String,
    pub port: u16,
    pub allowed_origins: Vec<String>,
    pub contact_delivery_mode: ContactDeliveryMode,
    pub event_logging_enabled: bool,
    pub rate_limits: RateLimitConfig,
    pub version: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ContactDeliveryMode {
    Disabled,
    Store,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RateLimitConfig {
    pub requests_per_minute: u32,
    pub contact_per_hour: u32,
}

#[derive(Debug, Eq, PartialEq)]
pub struct ConfigError {
    key: &'static str,
    value: String,
    reason: &'static str,
}

impl fmt::Display for ConfigError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "invalid config {}={:?}: {}",
            self.key, self.value, self.reason
        )
    }
}

impl Error for ConfigError {}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            host: "127.0.0.1".to_owned(),
            port: 8787,
            allowed_origins: vec!["http://localhost:4321".to_owned()],
            contact_delivery_mode: ContactDeliveryMode::Disabled,
            event_logging_enabled: false,
            rate_limits: RateLimitConfig {
                requests_per_minute: 60,
                contact_per_hour: 3,
            },
            version: env!("CARGO_PKG_VERSION").to_owned(),
        }
    }
}

impl AppConfig {
    pub fn from_env() -> Result<Self, ConfigError> {
        Self::from_env_pairs(env::vars())
    }

    pub fn from_env_pairs<I, K, V>(pairs: I) -> Result<Self, ConfigError>
    where
        I: IntoIterator<Item = (K, V)>,
        K: Into<String>,
        V: Into<String>,
    {
        let values: HashMap<String, String> = pairs
            .into_iter()
            .map(|(key, value)| (key.into(), value.into()))
            .collect();
        let mut config = Self::default();

        if let Some(value) = values.get("HK_API_HOST") {
            config.host = value.trim().to_owned();
        }
        if let Some(value) = values.get("HK_API_PORT") {
            config.port = parse_u16("HK_API_PORT", value)?;
        }
        if let Some(value) = values.get("HK_API_ALLOWED_ORIGINS") {
            config.allowed_origins = value
                .split(',')
                .map(str::trim)
                .filter(|origin| !origin.is_empty())
                .map(ToOwned::to_owned)
                .collect();
        }
        if let Some(value) = values.get("HK_API_CONTACT_DELIVERY_MODE") {
            config.contact_delivery_mode = parse_contact_delivery_mode(value)?;
        }
        if let Some(value) = values.get("HK_API_EVENT_LOGGING_ENABLED") {
            config.event_logging_enabled = parse_bool("HK_API_EVENT_LOGGING_ENABLED", value)?;
        }
        if let Some(value) = values.get("HK_API_RATE_LIMIT_REQUESTS_PER_MINUTE") {
            config.rate_limits.requests_per_minute =
                parse_u32("HK_API_RATE_LIMIT_REQUESTS_PER_MINUTE", value)?;
        }
        if let Some(value) = values.get("HK_API_CONTACT_RATE_LIMIT_PER_HOUR") {
            config.rate_limits.contact_per_hour =
                parse_u32("HK_API_CONTACT_RATE_LIMIT_PER_HOUR", value)?;
        }
        if let Some(value) = values.get("HK_API_VERSION") {
            config.version = value.trim().to_owned();
        }

        Ok(config)
    }
}

fn parse_contact_delivery_mode(value: &str) -> Result<ContactDeliveryMode, ConfigError> {
    match value.trim().to_ascii_lowercase().as_str() {
        "disabled" => Ok(ContactDeliveryMode::Disabled),
        "store" => Ok(ContactDeliveryMode::Store),
        _ => Err(ConfigError {
            key: "HK_API_CONTACT_DELIVERY_MODE",
            value: value.to_owned(),
            reason: "expected disabled or store",
        }),
    }
}

fn parse_bool(key: &'static str, value: &str) -> Result<bool, ConfigError> {
    match value.trim().to_ascii_lowercase().as_str() {
        "true" | "1" | "yes" => Ok(true),
        "false" | "0" | "no" => Ok(false),
        _ => Err(ConfigError {
            key,
            value: value.to_owned(),
            reason: "expected boolean",
        }),
    }
}

fn parse_u16(key: &'static str, value: &str) -> Result<u16, ConfigError> {
    value.trim().parse().map_err(|_| ConfigError {
        key,
        value: value.to_owned(),
        reason: "expected integer from 0 to 65535",
    })
}

fn parse_u32(key: &'static str, value: &str) -> Result<u32, ConfigError> {
    value.trim().parse().map_err(|_| ConfigError {
        key,
        value: value.to_owned(),
        reason: "expected positive integer",
    })
}
