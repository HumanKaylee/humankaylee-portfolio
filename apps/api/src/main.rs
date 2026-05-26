use humankaylee_api::{app, config::AppConfig, state::AppState, telemetry};

#[tokio::main]
async fn main() {
    telemetry::init();
    // Keep the guard alive for the entire process lifetime. When SENTRY_DSN is
    // absent init_sentry() returns None and this is a no-op.
    let _sentry = telemetry::init_sentry();
    let config = AppConfig::from_env().expect("valid API configuration");
    tracing::info!(
        host = %config.host,
        port = config.port,
        version = %config.version,
        "api_starting"
    );
    let listener = tokio::net::TcpListener::bind((config.host.as_str(), config.port))
        .await
        .expect("bind listener");
    let state = AppState::with_config(config);

    axum::serve(listener, app(state))
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("server exited cleanly");
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("install Ctrl+C signal handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("install SIGTERM signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        () = ctrl_c => {}
        () = terminate => {}
    }
}
