use humankaylee_api::{app, state::AppState};
use std::{net::SocketAddr, str::FromStr};

#[tokio::main]
async fn main() {
    let addr = SocketAddr::from_str("127.0.0.1:8787").expect("valid listen address");
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("bind listener");
    let state = AppState::new();

    axum::serve(listener, app(state))
        .await
        .expect("server exited cleanly");
}
