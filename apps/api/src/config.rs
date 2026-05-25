use axum::http::HeaderValue;
use std::{collections::HashMap, env, error::Error, fmt, path::PathBuf};

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AppConfig {
    pub host: String,
    pub port: u16,
    pub allowed_origins: Vec<String>,
    pub contact_delivery_mode: ContactDeliveryMode,
    pub contact_store_path: Option<PathBuf>,
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
            allowed_origins: Vec::new(),
            contact_delivery_mode: ContactDeliveryMode::Disabled,
            contact_store_path: None,
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
            config.allowed_origins = parse_allowed_origins(value)?;
        }
        if let Some(value) = values.get("HK_API_CONTACT_DELIVERY_MODE") {
            config.contact_delivery_mode = parse_contact_delivery_mode(value)?;
        }
        if let Some(value) = values.get("HK_API_CONTACT_STORE_PATH") {
            let trimmed = value.trim();
            if !trimmed.is_empty() {
                config.contact_store_path = Some(PathBuf::from(trimmed));
            }
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

        if config.contact_delivery_mode == ContactDeliveryMode::Store
            && config.contact_store_path.is_none()
        {
            return Err(ConfigError {
                key: "HK_API_CONTACT_STORE_PATH",
                value: values
                    .get("HK_API_CONTACT_STORE_PATH")
                    .cloned()
                    .unwrap_or_default(),
                reason: "required when HK_API_CONTACT_DELIVERY_MODE=store",
            });
        }

        Ok(config)
    }
}

fn parse_allowed_origins(value: &str) -> Result<Vec<String>, ConfigError> {
    if value.trim().is_empty() {
        return Err(ConfigError {
            key: "HK_API_ALLOWED_ORIGINS",
            value: value.to_owned(),
            reason: "expected one or more comma-separated origins",
        });
    }

    let mut origins = Vec::new();
    for origin in value.split(',').map(str::trim) {
        if origin.is_empty() {
            return Err(ConfigError {
                key: "HK_API_ALLOWED_ORIGINS",
                value: value.to_owned(),
                reason: "origins cannot be blank",
            });
        }
        validate_allowed_origin(origin, value)?;
        origins.push(origin.to_owned());
    }

    Ok(origins)
}

fn validate_allowed_origin(origin: &str, raw_value: &str) -> Result<(), ConfigError> {
    if HeaderValue::from_str(origin).is_err() {
        return Err(invalid_allowed_origin(raw_value));
    }

    let Some((scheme, authority)) = origin.split_once("://") else {
        return Err(invalid_allowed_origin(raw_value));
    };
    if !matches!(scheme.to_ascii_lowercase().as_str(), "http" | "https")
        || authority.is_empty()
        || authority
            .chars()
            .any(|character| character.is_ascii_whitespace() || "/?#".contains(character))
    {
        return Err(invalid_allowed_origin(raw_value));
    }
    validate_origin_authority(authority, raw_value)?;

    Ok(())
}

fn validate_origin_authority(authority: &str, raw_value: &str) -> Result<(), ConfigError> {
    if authority.contains('@') {
        return Err(invalid_allowed_origin(raw_value));
    }

    if let Some(remainder) = authority.strip_prefix('[') {
        let Some(end) = remainder.find(']') else {
            return Err(invalid_allowed_origin(raw_value));
        };

        let host = &remainder[..end];
        let suffix = &remainder[end + 1..];
        if host.is_empty()
            || (!suffix.is_empty()
                && !suffix
                    .strip_prefix(':')
                    .is_some_and(|port| is_valid_port(Some(port))))
        {
            return Err(invalid_allowed_origin(raw_value));
        }
        return Ok(());
    }

    if authority.matches(':').count() > 1 {
        return Err(invalid_allowed_origin(raw_value));
    }

    let (host, port) = authority
        .rsplit_once(':')
        .map_or((authority, None), |(host, port)| (host, Some(port)));
    if host.is_empty() || !is_valid_port(port) {
        return Err(invalid_allowed_origin(raw_value));
    }

    Ok(())
}

fn is_valid_port(port: Option<&str>) -> bool {
    match port {
        Some(port) => !port.is_empty() && port.parse::<u16>().is_ok(),
        None => true,
    }
}

fn invalid_allowed_origin(value: &str) -> ConfigError {
    ConfigError {
        key: "HK_API_ALLOWED_ORIGINS",
        value: value.to_owned(),
        reason: "expected http or https origins without paths, queries, or fragments",
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
