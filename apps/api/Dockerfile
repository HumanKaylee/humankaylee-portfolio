# Multi-stage Dockerfile for humankaylee-portfolio API (Axum 0.8)
# Stage 1: dependency cache layer — rebuilt only when Cargo.toml/Cargo.lock change
FROM docker.io/library/rust:1.93-bookworm AS deps

WORKDIR /app
COPY Cargo.toml Cargo.lock ./
# Create a dummy main so cargo fetch + a minimal build caches dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo fetch --locked

# Stage 2: full build
FROM deps AS builder

COPY src ./src
RUN cargo build --release --locked --bin humankaylee-api

# Stage 3: minimal runtime image
FROM docker.io/library/debian:bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system humankaylee \
    && useradd --system --gid humankaylee --shell /usr/sbin/nologin humankaylee

WORKDIR /app
RUN mkdir -p /app/data && chown -R humankaylee:humankaylee /app

COPY --from=builder --chown=humankaylee:humankaylee \
    /app/target/release/humankaylee-api /usr/local/bin/humankaylee-api

ENV RUST_LOG=info
ENV HK_API_HOST=0.0.0.0
ENV HK_API_PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8080/api/health || exit 1

USER humankaylee

CMD ["humankaylee-api"]
