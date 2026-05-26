//! Runtime Open Graph image endpoint.
//!
//! Renders a 1200×630 PNG from an SVG template using resvg + tiny-skia.
//! The rendered PNG is returned with aggressive cache headers so CDN and
//! browser caches serve repeated calls without re-rendering.
//!
//! # Route
//! `GET /api/og?title=<str>&subtitle=<str>`
//!
//! # Query parameters
//! - `title` (optional, ≤100 chars) – page or post title.
//! - `subtitle` (optional, ≤100 chars) – secondary line, e.g. a date or tag.
//!
//! Both values are XML-escaped before template substitution, so `<`, `>`, `&`,
//! `"`, and `'` are safe.

use axum::{
    extract::Query,
    http::{header, StatusCode},
    response::{IntoResponse, Response},
};
use once_cell::sync::Lazy;
use serde::Deserialize;
use std::sync::Arc;

// ---------------------------------------------------------------------------
// Template – loaded once at process start
// ---------------------------------------------------------------------------

/// Raw SVG template bytes, embedded at compile time.
const TEMPLATE_SVG: &str = include_str!("../templates/og-template.svg");

/// Pre-parsed usvg tree for the base template (title/subtitle not yet
/// substituted). We rebuild a fresh tree per request after string substitution,
/// but keeping the raw bytes in a static avoids a disk read on every call.
static TEMPLATE_BYTES: Lazy<Arc<String>> = Lazy::new(|| Arc::new(TEMPLATE_SVG.to_owned()));

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct OgParams {
    pub title: Option<String>,
    pub subtitle: Option<String>,
}

/// Maximum character length for title / subtitle.
const MAX_PARAM_LEN: usize = 100;

/// Handler for `GET /api/og`.
pub async fn og_handler(Query(params): Query<OgParams>) -> Response {
    let title = sanitize_param(params.title.as_deref(), "HumanKaylee", MAX_PARAM_LEN);
    let subtitle = sanitize_param(params.subtitle.as_deref(), "Systems Atelier", MAX_PARAM_LEN);

    match render_og_png(&title, &subtitle) {
        Ok(png_bytes) => (
            StatusCode::OK,
            [
                (header::CONTENT_TYPE, "image/png"),
                (
                    header::CACHE_CONTROL,
                    "public, max-age=86400, s-maxage=86400",
                ),
            ],
            png_bytes,
        )
            .into_response(),
        Err(err) => {
            tracing::error!(error = %err, title = %title, subtitle = %subtitle, "og_render_failed");
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                [(header::CONTENT_TYPE, "application/json")],
                serde_json::json!({
                    "error": {
                        "code": "og_render_failed",
                        "message": "Failed to render Open Graph image."
                    }
                })
                .to_string(),
            )
                .into_response()
        }
    }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/// Render the SVG template with the given title and subtitle into a PNG.
fn render_og_png(title: &str, subtitle: &str) -> Result<Vec<u8>, OgRenderError> {
    let svg_source = TEMPLATE_BYTES
        .replace("{{TITLE}}", &xml_escape(title))
        .replace("{{SUBTITLE}}", &xml_escape(subtitle));

    // Parse with usvg
    let opts = usvg::Options::default();
    let tree = usvg::Tree::from_str(&svg_source, &opts)
        .map_err(|e| OgRenderError::Parse(e.to_string()))?;

    // Rasterise with resvg + tiny-skia
    let mut pixmap = tiny_skia::Pixmap::new(1200, 630)
        .ok_or_else(|| OgRenderError::Render("failed to allocate pixmap".to_owned()))?;

    resvg::render(&tree, tiny_skia::Transform::default(), &mut pixmap.as_mut());

    pixmap
        .encode_png()
        .map_err(|e| OgRenderError::Encode(e.to_string()))
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Sanitize a query parameter: trim, clamp to max_len, fall back to default.
fn sanitize_param(raw: Option<&str>, default: &str, max_len: usize) -> String {
    let s = raw.unwrap_or(default).trim();
    if s.is_empty() {
        return default.to_owned();
    }
    // Clamp to max_len bytes (simple char boundary clamp)
    if s.len() > max_len {
        let mut end = max_len;
        while !s.is_char_boundary(end) {
            end -= 1;
        }
        s[..end].to_owned()
    } else {
        s.to_owned()
    }
}

/// Minimal XML escape for SVG text nodes.
///
/// Escapes: `&`, `<`, `>`, `"`, `'`.
fn xml_escape(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for ch in s.chars() {
        match ch {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            '\'' => out.push_str("&apos;"),
            c => out.push(c),
        }
    }
    out
}

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

#[derive(Debug)]
enum OgRenderError {
    Parse(String),
    Render(String),
    Encode(String),
}

impl std::fmt::Display for OgRenderError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            OgRenderError::Parse(msg) => write!(f, "svg parse error: {msg}"),
            OgRenderError::Render(msg) => write!(f, "svg render error: {msg}"),
            OgRenderError::Encode(msg) => write!(f, "png encode error: {msg}"),
        }
    }
}

impl std::error::Error for OgRenderError {}

// ---------------------------------------------------------------------------
// Unit tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn xml_escape_replaces_special_characters() {
        assert_eq!(xml_escape("a & b"), "a &amp; b");
        assert_eq!(xml_escape("<title>"), "&lt;title&gt;");
        assert_eq!(xml_escape("\"quoted\""), "&quot;quoted&quot;");
        assert_eq!(xml_escape("it's"), "it&apos;s");
        assert_eq!(xml_escape("plain text"), "plain text");
    }

    #[test]
    fn sanitize_param_returns_default_for_empty_input() {
        assert_eq!(sanitize_param(None, "default", 100), "default");
        assert_eq!(sanitize_param(Some(""), "default", 100), "default");
        assert_eq!(sanitize_param(Some("   "), "default", 100), "default");
    }

    #[test]
    fn sanitize_param_trims_and_clamps() {
        let long = "a".repeat(200);
        let result = sanitize_param(Some(&long), "default", 100);
        assert_eq!(result.len(), 100);
        assert_eq!(sanitize_param(Some("  hello  "), "default", 100), "hello");
    }

    #[test]
    fn render_og_png_returns_valid_png_magic_header() {
        let png = render_og_png("Test Title", "Test Subtitle").expect("render");
        assert_eq!(&png[..8], b"\x89PNG\r\n\x1a\n", "must start with PNG magic header");
        assert!(png.len() > 1000, "PNG should be more than 1 KB");
    }

    #[test]
    fn render_og_png_with_special_characters_does_not_panic() {
        let png = render_og_png("Hello <World> & \"Friends\"", "It's a test").expect("render");
        assert_eq!(&png[..8], b"\x89PNG\r\n\x1a\n");
    }
}
