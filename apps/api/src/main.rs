use humankaylee_api::{app, config::AppConfig, state::AppState};

#[tokio::main]
async fn main() {
    let config = AppConfig::from_env().expect("valid API configuration");
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
