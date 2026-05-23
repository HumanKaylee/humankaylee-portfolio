FROM docker.io/library/rust:1-bookworm AS builder

WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release --locked --bin humankaylee-api

FROM docker.io/library/debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV HK_API_HOST=0.0.0.0
ENV HK_API_PORT=8787
EXPOSE 8787

COPY --from=builder /app/target/release/humankaylee-api /usr/local/bin/humankaylee-api

CMD ["humankaylee-api"]
