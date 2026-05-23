use humankaylee_api::{app, config::AppConfig, state::AppState};

#[tokio::main]
async fn main() {
    let config = AppConfig::from_env().expect("valid API configuration");
    let listener = tokio::net::TcpListener::bind((config.host.as_str(), config.port))
        .await
        .expect("bind listener");
    let state = AppState::with_config(config);

    axum::serve(listener, app(state))
        .await
        .expect("server exited cleanly");
}
