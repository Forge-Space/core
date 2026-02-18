# Rust Web Service Template

A comprehensive Rust web service template with best practices for building safe, performant, and maintainable HTTP APIs using modern Rust ecosystem.

## 🎯 Overview

This template provides a complete structure for Rust web services including:

- Modern async web framework (Axum/Actix-web)
- Type-safe configuration management
- Comprehensive error handling
- Database integration with connection pooling
- Authentication and authorization
- Logging and monitoring
- Testing framework with property-based testing
- Docker deployment and orchestration
- Performance optimization patterns

## 📁 Project Structure

```
rust-web-service/
├── src/                   # Source code
│   ├── main.rs          # Application entry point
│   ├── lib.rs           # Library root
│   ├── config/          # Configuration management
│   │   ├── mod.rs
│   │   └── app_config.rs
│   ├── handlers/        # HTTP handlers
│   │   ├── mod.rs
│   │   ├── health.rs
│   │   └── users.rs
│   ├── models/          # Data models
│   │   ├── mod.rs
│   │   ├── user.rs
│   │   └── response.rs
│   ├── services/        # Business logic
│   │   ├── mod.rs
│   │   ├── user_service.rs
│   │   └── auth_service.rs
│   ├── repositories/    # Data access layer
│   │   ├── mod.rs
│   │   ├── user_repo.rs
│   │   └── traits.rs
│   ├── middleware/      # HTTP middleware
│   │   ├── mod.rs
│   │   ├── auth.rs
│   │   ├── logging.rs
│   │   └── rate_limit.rs
│   ├── utils/           # Utility functions
│   │   ├── mod.rs
│   │   ├── crypto.rs
│   │   └── validation.rs
│   └── errors/          # Error types
│       ├── mod.rs
│       └── app_error.rs
├── tests/                # Integration tests
│   ├── api_tests.rs
│   └── property_tests.rs
├── benches/              # Performance benchmarks
│   └── api_bench.rs
├── migrations/           # Database migrations
├── configs/              # Configuration files
├── scripts/              # Utility scripts
├── docker/               # Docker files
├── Cargo.toml           # Cargo configuration
├── Cargo.lock           # Cargo lock file
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose
└── README.md            # This file
```

## 🚀 Quick Start

### Bootstrap Rust Web Service

```bash
# Create new Rust web service
./scripts/bootstrap/project.sh --template=rust-web-service --name=my-rust-service

# Navigate to project
cd my-rust-service

# Install dependencies
cargo build

# Run development server
cargo run

# Run tests
cargo test

# Run benchmarks
cargo bench

# Build for production
cargo build --release
```

### Development Workflow

```bash
# Start with hot reload (requires cargo-watch)
cargo watch -x run

# Run with specific configuration
RUST_LOG=debug cargo run -- --config configs/development.toml

# Run database migrations
sqlx migrate run

# Generate API documentation
cargo doc --open

# Run with Docker
docker-compose up --build

# Run security audit
cargo audit
```

## 📋 Configuration

### Application Configuration (`configs/app.toml`)

```toml
[app]
name = "Rust Web Service"
version = "1.0.0"
environment = "development"
debug = true

[server]
host = "0.0.0.0"
port = 8080
workers = 4
keep_alive = 30
timeout = 30

[database]
url = "postgresql://user:password@localhost/web_service_db"
max_connections = 25
min_connections = 5
connection_timeout = 30
idle_timeout = 600

[redis]
url = "redis://localhost:6379"
max_connections = 10
connection_timeout = 5

[logging]
level = "info"
format = "json"
output = "stdout"

[auth]
jwt_secret = "${JWT_SECRET}"
jwt_expiration = 3600
refresh_expiration = 86400

[rate_limit]
requests_per_minute = 60
burst_size = 10

[monitoring]
prometheus_enabled = true
prometheus_port = 9090
tracing_enabled = false
```

### Environment Variables (`.env`)

```bash
# Application
RUST_LOG=info
APP_ENV=development
APP_DEBUG=true

# Database
DATABASE_URL=postgresql://user:password@localhost/web_service_db

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# Monitoring
PROMETHEUS_ENABLED=true
TRACING_ENABLED=false
```

## 🔧 Implementation

### Main Application

```rust
// src/main.rs
use axum::{
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use tower::ServiceBuilder;
use tower_http::{
    cors::CorsLayer,
    request_id::RequestIdLayer,
    trace::TraceLayer,
};

mod config;
mod handlers;
mod middleware;
mod models;
mod repositories;
mod services;
mod utils;
mod errors;

use config::AppConfig;
use handlers::{health, users};
use middleware::{auth, logging, rate_limit};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    tracing_subscriber::fmt::init();

    // Load configuration
    let config = AppConfig::from_env().expect("Failed to load configuration");

    // Initialize database
    let db_pool = sqlx::PgPool::connect(&config.database.url).await?;
    
    // Run migrations
    sqlx::migrate!("./migrations").run(&db_pool).await?;

    // Initialize Redis
    let redis_client = redis::Client::open(config.redis.url.as_str())?;
    let redis_pool = redis_client.get_multiplexed_async_connection().await?;

    // Initialize services
    let user_service = services::UserService::new(db_pool.clone(), redis_pool.clone());
    let auth_service = services::AuthService::new(config.auth.clone());

    // Build application
    let app = Router::new()
        // Health check
        .route("/health", get(health::health_check))
        // API routes
        .route("/api/v1/users", get(users::list_users).post(users::create_user))
        .route("/api/v1/users/:id", get(users::get_user).put(users::update_user))
        .route("/api/v1/auth/login", post(users::login))
        .route("/api/v1/auth/refresh", post(users::refresh_token))
        // Middleware
        .layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(RequestIdLayer::x_request_id())
                .layer(CorsLayer::permissive())
                .layer(logging::request_logging())
                .layer(rate_limit::rate_limit(config.rate_limit.clone()))
        )
        // Protected routes
        .route("/api/v1/protected", get(handlers::protected::protected_handler))
        .layer(axum::middleware::from_fn(auth::jwt_auth_middleware))
        .with_state((user_service, auth_service));

    // Start server
    let addr = SocketAddr::from(([0, 0, 0, 0], config.server.port));
    tracing::info!("Starting server on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
```

### Configuration Management

```rust
// src/config/app_config.rs
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub app: AppConfigInner,
    pub server: ServerConfig,
    pub database: DatabaseConfig,
    pub redis: RedisConfig,
    pub logging: LoggingConfig,
    pub auth: AuthConfig,
    pub rate_limit: RateLimitConfig,
    pub monitoring: MonitoringConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfigInner {
    pub name: String,
    pub version: String,
    pub environment: String,
    pub debug: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub workers: usize,
    pub keep_alive: u64,
    pub timeout: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub url: String,
    pub max_connections: u32,
    pub min_connections: u32,
    pub connection_timeout: u64,
    pub idle_timeout: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RedisConfig {
    pub url: String,
    pub max_connections: usize,
    pub connection_timeout: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    pub level: String,
    pub format: String,
    pub output: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthConfig {
    pub jwt_secret: String,
    pub jwt_expiration: i64,
    pub refresh_expiration: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitConfig {
    pub requests_per_minute: u32,
    pub burst_size: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitoringConfig {
    pub prometheus_enabled: bool,
    pub prometheus_port: u16,
    pub tracing_enabled: bool,
}

impl AppConfig {
    pub fn from_env() -> Result<Self, Box<dyn std::error::Error>> {
        let config = AppConfig {
            app: AppConfigInner {
                name: env::var("APP_NAME").unwrap_or_else(|_| "Rust Web Service".to_string()),
                version: env::var("APP_VERSION").unwrap_or_else(|_| "1.0.0".to_string()),
                environment: env::var("APP_ENV").unwrap_or_else(|_| "development".to_string()),
                debug: env::var("APP_DEBUG").unwrap_or_else(|_| "false".to_string()) == "true",
            },
            server: ServerConfig {
                host: env::var("SERVER_HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
                port: env::var("SERVER_PORT")
                    .unwrap_or_else(|_| "8080".to_string())
                    .parse()?,
                workers: env::var("SERVER_WORKERS")
                    .unwrap_or_else(|_| "4".to_string())
                    .parse()?,
                keep_alive: env::var("SERVER_KEEP_ALIVE")
                    .unwrap_or_else(|_| "30".to_string())
                    .parse()?,
                timeout: env::var("SERVER_TIMEOUT")
                    .unwrap_or_else(|_| "30".to_string())
                    .parse()?,
            },
            database: DatabaseConfig {
                url: env::var("DATABASE_URL")
                    .unwrap_or_else(|_| "postgresql://user:password@localhost/web_service_db".to_string()),
                max_connections: env::var("DB_MAX_CONNECTIONS")
                    .unwrap_or_else(|_| "25".to_string())
                    .parse()?,
                min_connections: env::var("DB_MIN_CONNECTIONS")
                    .unwrap_or_else(|_| "5".to_string())
                    .parse()?,
                connection_timeout: env::var("DB_CONNECTION_TIMEOUT")
                    .unwrap_or_else(|_| "30".to_string())
                    .parse()?,
                idle_timeout: env::var("DB_IDLE_TIMEOUT")
                    .unwrap_or_else(|_| "600".to_string())
                    .parse()?,
            },
            redis: RedisConfig {
                url: env::var("REDIS_URL")
                    .unwrap_or_else(|_| "redis://localhost:6379".to_string()),
                max_connections: env::var("REDIS_MAX_CONNECTIONS")
                    .unwrap_or_else(|_| "10".to_string())
                    .parse()?,
                connection_timeout: env::var("REDIS_CONNECTION_TIMEOUT")
                    .unwrap_or_else(|_| "5".to_string())
                    .parse()?,
            },
            logging: LoggingConfig {
                level: env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string()),
                format: env::var("LOG_FORMAT").unwrap_or_else(|_| "json".to_string()),
                output: env::var("LOG_OUTPUT").unwrap_or_else(|_| "stdout".to_string()),
            },
            auth: AuthConfig {
                jwt_secret: env::var("JWT_SECRET")
                    .unwrap_or_else(|_| "your_jwt_secret_key_here".to_string()),
                jwt_expiration: env::var("JWT_EXPIRATION")
                    .unwrap_or_else(|_| "3600".to_string())
                    .parse()?,
                refresh_expiration: env::var("REFRESH_EXPIRATION")
                    .unwrap_or_else(|_| "86400".to_string())
                    .parse()?,
            },
            rate_limit: RateLimitConfig {
                requests_per_minute: env::var("RATE_LIMIT_RPM")
                    .unwrap_or_else(|_| "60".to_string())
                    .parse()?,
                burst_size: env::var("RATE_LIMIT_BURST")
                    .unwrap_or_else(|_| "10".to_string())
                    .parse()?,
            },
            monitoring: MonitoringConfig {
                prometheus_enabled: env::var("PROMETHEUS_ENABLED")
                    .unwrap_or_else(|_| "true".to_string())
                    == "true",
                prometheus_port: env::var("PROMETHEUS_PORT")
                    .unwrap_or_else(|_| "9090".to_string())
                    .parse()?,
                tracing_enabled: env::var("TRACING_ENABLED")
                    .unwrap_or_else(|_| "false".to_string())
                    == "true",
            },
        };

        Ok(config)
    }
}
```

### Error Handling

```rust
// src/errors/app_error.rs
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Redis error: {0}")]
    Redis(#[from] redis::RedisError),

    #[error("Authentication error: {0}")]
    Auth(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Internal server error: {0}")]
    Internal(String),

    #[error("Rate limit exceeded")]
    RateLimit,

    #[error("Unauthorized")]
    Unauthorized,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::Database(ref e) => {
                tracing::error!("Database error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error")
            }
            AppError::Redis(ref e) => {
                tracing::error!("Redis error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error")
            }
            AppError::Auth(ref message) => {
                tracing::warn!("Authentication error: {}", message);
                (StatusCode::UNAUTHORIZED, message.as_str())
            }
            AppError::Validation(ref message) => {
                tracing::warn!("Validation error: {}", message);
                (StatusCode::BAD_REQUEST, message.as_str())
            }
            AppError::NotFound(ref message) => {
                tracing::warn!("Not found: {}", message);
                (StatusCode::NOT_FOUND, message.as_str())
            }
            AppError::Internal(ref message) => {
                tracing::error!("Internal error: {}", message);
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error")
            }
            AppError::RateLimit => {
                tracing::warn!("Rate limit exceeded");
                (StatusCode::TOO_MANY_REQUESTS, "Rate limit exceeded")
            }
            AppError::Unauthorized => {
                tracing::warn!("Unauthorized access");
                (StatusCode::UNAUTHORIZED, "Unauthorized")
            }
        };

        let body = Json(json!({
            "error": error_message,
            "status": status.as_u16()
        }));

        (status, body).into_response()
    }
}

// Result type alias for convenience
pub type Result<T> = std::result::Result<T, AppError>;
```

### User Handler

```rust
// src/handlers/users.rs
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
};
use serde_json::json;
use uuid::Uuid;

use crate::{
    errors::{AppError, Result},
    models::{CreateUserRequest, LoginRequest, User, UserResponse},
    services::{AuthService, UserService},
};

pub async fn list_users(
    State((user_service, _)): State<(UserService, AuthService)>,
) -> Result<Json<Vec<UserResponse>>> {
    let users = user_service.list_users().await?;
    let user_responses: Vec<UserResponse> = users.into_iter().map(UserResponse::from).collect();
    Ok(Json(user_responses))
}

pub async fn create_user(
    State((user_service, auth_service)): State<(UserService, AuthService)>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<UserResponse>)> {
    // Validate input
    payload.validate()?;

    // Create user
    let user = user_service.create_user(payload).await?;
    
    // Generate tokens
    let (access_token, refresh_token) = auth_service.generate_tokens(&user.id, &user.email).await?;

    let response = UserResponse::from(user)
        .with_tokens(access_token, refresh_token);

    Ok((StatusCode::CREATED, Json(response)))
}

pub async fn get_user(
    Path(id): Path<Uuid>,
    State((user_service, _)): State<(UserService, AuthService)>,
) -> Result<Json<UserResponse>> {
    let user = user_service.get_user_by_id(id).await?;
    Ok(Json(UserResponse::from(user)))
}

pub async fn update_user(
    Path(id): Path<Uuid>,
    State((user_service, _)): State<(UserService, AuthService)>,
    Json(payload): Json<UpdateUserRequest>,
) -> Result<Json<UserResponse>> {
    // Validate input
    payload.validate()?;

    let user = user_service.update_user(id, payload).await?;
    Ok(Json(UserResponse::from(user)))
}

pub async fn login(
    State((user_service, auth_service)): State<(UserService, AuthService)>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>> {
    // Validate input
    payload.validate()?;

    // Authenticate user
    let user = user_service.authenticate_user(&payload.email, &payload.password).await?;
    
    // Generate tokens
    let (access_token, refresh_token) = auth_service.generate_tokens(&user.id, &user.email).await?;

    let response = LoginResponse {
        user: UserResponse::from(user),
        access_token,
        refresh_token,
    };

    Ok(Json(response))
}

pub async fn refresh_token(
    State((_, auth_service)): State<(UserService, AuthService)>,
    Json(payload): Json<RefreshTokenRequest>,
) -> Result<Json<TokenResponse>> {
    // Validate input
    payload.validate()?;

    // Refresh token
    let (access_token, refresh_token) = auth_service.refresh_token(&payload.refresh_token).await?;

    let response = TokenResponse {
        access_token,
        refresh_token,
    };

    Ok(Json(response))
}
```

### User Service

```rust
// src/services/user_service.rs
use sqlx::PgPool;
use redis::aio::MultiplexedConnection;

use crate::{
    errors::{AppError, Result},
    models::{CreateUserRequest, User},
    repositories::UserRepository,
};

pub struct UserService {
    repository: UserRepository,
    redis: MultiplexedConnection,
}

impl UserService {
    pub fn new(db_pool: PgPool, redis: MultiplexedConnection) -> Self {
        Self {
            repository: UserRepository::new(db_pool),
            redis,
        }
    }

    pub async fn create_user(&self, payload: CreateUserRequest) -> Result<User> {
        // Check if user already exists
        if let Some(_) = self.repository.find_by_email(&payload.email).await? {
            return Err(AppError::Auth("User already exists".to_string()));
        }

        // Hash password
        let password_hash = utils::hash_password(&payload.password)?;

        // Create user
        let user = self.repository.create(
            payload.name,
            payload.email,
            password_hash,
        ).await?;

        Ok(user)
    }

    pub async fn list_users(&self) -> Result<Vec<User>> {
        self.repository.list().await
    }

    pub async fn get_user_by_id(&self, id: uuid::Uuid) -> Result<User> {
        self.repository.find_by_id(id).await?
            .ok_or_else(|| AppError::NotFound("User not found".to_string()))
    }

    pub async fn update_user(&self, id: uuid::Uuid, payload: UpdateUserRequest) -> Result<User> {
        // Check if user exists
        let mut user = self.repository.find_by_id(id).await?
            .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

        // Update fields
        if let Some(name) = payload.name {
            user.name = name;
        }
        if let Some(email) = payload.email {
            // Check if email is already taken by another user
            if let Some(existing_user) = self.repository.find_by_email(&email).await? {
                if existing_user.id != id {
                    return Err(AppError::Auth("Email already taken".to_string()));
                }
            }
            user.email = email;
        }

        // Save changes
        self.repository.update(&user).await?;

        Ok(user)
    }

    pub async fn authenticate_user(&self, email: &str, password: &str) -> Result<User> {
        // Find user by email
        let user = self.repository.find_by_email(email).await?
            .ok_or_else(|| AppError::Auth("Invalid credentials".to_string()))?;

        // Verify password
        if !utils::verify_password(password, &user.password_hash)? {
            return Err(AppError::Auth("Invalid credentials".to_string()));
        }

        Ok(user)
    }
}
```

## 🚀 Deployment

### Dockerfile

```dockerfile
# Multi-stage build
FROM rust:1.75-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Cargo files
COPY Cargo.toml Cargo.lock ./

# Create dummy main.rs to cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies
RUN cargo build --release && rm -rf src

# Copy source code
COPY src ./src

# Build application
RUN touch src/main.rs && cargo build --release

# Final stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -r -s /bin/false appuser

# Set working directory
WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/target/release/rust-web-service .

# Change ownership
RUN chown appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run application
CMD ["./rust-web-service"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - RUST_LOG=info
      - APP_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/web_service_db
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your_jwt_secret_key
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=web_service_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  postgres_data:
  redis_data:
```

## 📊 Monitoring

### Prometheus Metrics

```rust
// src/monitoring/metrics.rs
use prometheus::{Counter, Histogram, IntGauge, Registry};
use std::sync::LazyLock;

pub static HTTP_REQUESTS_TOTAL: LazyLock<Counter> = LazyLock::new(|| {
    Counter::new("http_requests_total", "Total number of HTTP requests")
        .expect("Failed to create HTTP requests counter")
});

pub static HTTP_REQUEST_DURATION: LazyLock<Histogram> = LazyLock::new(|| {
    Histogram::with_opts(
        prometheus::HistogramOpts::new(
            "http_request_duration_seconds",
            "HTTP request duration in seconds"
        )
        .buckets(vec![0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0])
    ).expect("Failed to create HTTP request duration histogram")
});

pub static ACTIVE_CONNECTIONS: LazyLock<IntGauge> = LazyLock::new(|| {
    IntGauge::new("active_connections", "Number of active connections")
        .expect("Failed to create active connections gauge")
});

pub static DATABASE_CONNECTIONS: LazyLock<IntGauge> = LazyLock::new(|| {
    IntGauge::new("database_connections", "Number of database connections")
        .expect("Failed to create database connections gauge")
});

pub fn register_metrics() -> Registry {
    let registry = Registry::new();
    
    registry.register(Box::new(HTTP_REQUESTS_TOTAL.clone())).unwrap();
    registry.register(Box::new(HTTP_REQUEST_DURATION.clone())).unwrap();
    registry.register(Box::new(ACTIVE_CONNECTIONS.clone())).unwrap();
    registry.register(Box::new(DATABASE_CONNECTIONS.clone())).unwrap();
    
    registry
}
```

## 🧪 Testing

### Unit Tests

```rust
// tests/unit/user_service_test.rs
use uuid::Uuid;

use rust_web_service::{
    services::UserService,
    models::CreateUserRequest,
    errors::AppError,
};

#[tokio::test]
async fn test_create_user_success() {
    // Setup test database
    let pool = create_test_db_pool().await;
    let redis = create_test_redis_connection().await;
    
    let user_service = UserService::new(pool, redis);
    
    let payload = CreateUserRequest {
        name: "Test User".to_string(),
        email: "test@example.com".to_string(),
        password: "password123".to_string(),
    };
    
    let result = user_service.create_user(payload).await;
    
    assert!(result.is_ok());
    let user = result.unwrap();
    assert_eq!(user.name, "Test User");
    assert_eq!(user.email, "test@example.com");
    assert!(user.password_hash.len() > 0);
}

#[tokio::test]
async fn test_create_user_duplicate_email() {
    // Setup test database
    let pool = create_test_db_pool().await;
    let redis = create_test_redis_connection().await;
    
    let user_service = UserService::new(pool, redis);
    
    // Create first user
    let payload1 = CreateUserRequest {
        name: "User 1".to_string(),
        email: "duplicate@example.com".to_string(),
        password: "password123".to_string(),
    };
    user_service.create_user(payload1).await.unwrap();
    
    // Try to create second user with same email
    let payload2 = CreateUserRequest {
        name: "User 2".to_string(),
        email: "duplicate@example.com".to_string(),
        password: "password456".to_string(),
    };
    
    let result = user_service.create_user(payload2).await;
    
    assert!(result.is_err());
    match result.unwrap_err() {
        AppError::Auth(msg) => assert_eq!(msg, "User already exists"),
        _ => panic!("Expected Auth error"),
    }
}

#[tokio::test]
async fn test_authenticate_user_success() {
    // Setup test database
    let pool = create_test_db_pool().await;
    let redis = create_test_redis_connection().await;
    
    let user_service = UserService::new(pool, redis);
    
    // Create user
    let payload = CreateUserRequest {
        name: "Test User".to_string(),
        email: "auth@example.com".to_string(),
        password: "password123".to_string(),
    };
    user_service.create_user(payload).await.unwrap();
    
    // Authenticate
    let result = user_service.authenticate_user("auth@example.com", "password123").await;
    
    assert!(result.is_ok());
    let user = result.unwrap();
    assert_eq!(user.email, "auth@example.com");
}

#[tokio::test]
async fn test_authenticate_user_invalid_password() {
    // Setup test database
    let pool = create_test_db_pool().await;
    let redis = create_test_redis_connection().await;
    
    let user_service = UserService::new(pool, redis);
    
    // Create user
    let payload = CreateUserRequest {
        name: "Test User".to_string(),
        email: "invalid@example.com".to_string(),
        password: "password123".to_string(),
    };
    user_service.create_user(payload).await.unwrap();
    
    // Try to authenticate with wrong password
    let result = user_service.authenticate_user("invalid@example.com", "wrongpassword").await;
    
    assert!(result.is_err());
    match result.unwrap_err() {
        AppError::Auth(msg) => assert_eq!(msg, "Invalid credentials"),
        _ => panic!("Expected Auth error"),
    }
}

// Helper functions for test setup
async fn create_test_db_pool() -> sqlx::PgPool {
    sqlx::PgPool::connect("postgresql://postgres:password@localhost/test_db")
        .await
        .expect("Failed to create test database pool")
}

async fn create_test_redis_connection() -> redis::aio::MultiplexedConnection {
    let client = redis::Client::open("redis://localhost:6379")
        .expect("Failed to create Redis client");
    client.get_multiplexed_async_connection()
        .await
        .expect("Failed to create Redis connection")
}
```

## 🔒 Security Considerations

- ✅ **Memory Safety**: Rust's ownership system prevents memory vulnerabilities
- ✅ **Thread Safety**: Compile-time guarantees for concurrent access
- ✅ **Input Validation**: Comprehensive input validation and sanitization
- ✅ **Authentication**: JWT-based authentication with proper token validation
- ✅ **Password Security**: Proper password hashing with bcrypt
- ✅ **SQL Injection**: Parameterized queries with SQLx
- ✅ **CORS**: Proper CORS configuration
- ✅ **Rate Limiting**: Request rate limiting to prevent abuse
- ✅ **HTTPS**: Enforce HTTPS in production

## 📚 Best Practices

1. **Error Handling**: Comprehensive error handling with Result types
2. **Async/Await**: Proper async patterns with Tokio
3. **Memory Management**: Efficient memory usage without manual management
4. **Testing**: Comprehensive unit and integration tests
5. **Performance**: Zero-cost abstractions and optimization
6. **Security**: Leverage Rust's safety guarantees
7. **Documentation**: Comprehensive code documentation
8. **Monitoring**: Built-in metrics and observability

---

**Template Version**: 1.0.0  
**Last Updated**: 2026-02-17  
**Compatible**: Rust 1.75+, Axum 0.7+, Tokio 1.35+  
**License**: MIT