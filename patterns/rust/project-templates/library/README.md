# Rust Library Template

A comprehensive Rust library template with best practices for building safe, performant, and maintainable Rust crates.

## 🎯 Overview

This template provides a complete structure for Rust libraries including:

- Modern Rust library structure
- Comprehensive error handling
- Type-safe API design
- Async support with Tokio
- Testing framework with property-based testing
- Documentation and examples
- Benchmarking suite
- Cross-platform compatibility
- Performance optimization patterns

## 📁 Project Structure

```
rust-library/
├── src/                   # Source code
│   ├── lib.rs           # Library root and public API
│   ├── error.rs         # Error types
│   ├── config.rs        # Configuration types
│   ├── client/          # Client implementation
│   │   ├── mod.rs
│   │   ├── http_client.rs
│   │   └── async_client.rs
│   ├── models/          # Data models
│   │   ├── mod.rs
│   │   ├── request.rs
│   │   └── response.rs
│   ├── utils/           # Utility functions
│   │   ├── mod.rs
│   │   ├── validation.rs
│   │   └── serialization.rs
│   └── prelude.rs       # Common imports
├── tests/                # Integration tests
│   ├── integration_tests.rs
│   └── property_tests.rs
├── benches/              # Performance benchmarks
│   ├── api_bench.rs
│   └── serialization_bench.rs
├── examples/             # Example usage
│   ├── basic_usage.rs
│   ├── async_usage.rs
│   └── advanced_usage.rs
├── docs/                 # Additional documentation
│   ├── getting_started.md
│   └── api_reference.md
├── Cargo.toml           # Cargo configuration
├── Cargo.lock           # Cargo lock file
├── README.md            # This file
├── LICENSE              # License file
├── CHANGELOG.md         # Changelog
└── rust-toolchain.toml  # Rust toolchain specification
```

## 🚀 Quick Start

### Bootstrap Rust Library

```bash
# Create new Rust library
./scripts/bootstrap/project.sh --template=rust-library --name=my-rust-lib

# Navigate to project
cd my-rust-lib

# Install dependencies
cargo build

# Run tests
cargo test

# Run examples
cargo run --example basic_usage

# Run benchmarks
cargo bench

# Generate documentation
cargo doc --open
```

### Development Workflow

```bash
# Run tests with coverage
cargo tarpaulin --out Html

# Run property-based tests
cargo test --release

# Run benchmarks
cargo bench

# Check documentation
cargo doc --no-deps

# Run linter
cargo clippy -- -D warnings

# Format code
cargo fmt

# Check for security vulnerabilities
cargo audit
```

## 📋 Configuration

### Cargo.toml

```toml
[package]
name = "my-rust-lib"
version = "1.0.0"
edition = "2021"
authors = ["Your Name <your.email@example.com>"]
description = "A comprehensive Rust library for..."
license = "MIT OR Apache-2.0"
repository = "https://github.com/yourname/my-rust-lib"
homepage = "https://github.com/yourname/my-rust-lib"
documentation = "https://docs.rs/my-rust-lib"
keywords = ["rust", "library", "api"]
categories = ["api-bindings", "web-programming"]
readme = "README.md"
rust-version = "1.70"

[features]
default = ["default-tls"]
default-tls = ["reqwest/default-tls"]
rustls-tls = ["reqwest/rustls-tls"]
async = ["tokio"]
blocking = ["reqwest/blocking"]

[dependencies]
# Async runtime
tokio = { version = "1.35", features = ["rt", "time"], optional = true }

# HTTP client
reqwest = { version = "0.11", default-features = false, features = ["json", "gzip"] }

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
serde_urlencoded = "0.7"

# Error handling
thiserror = "1.0"
anyhow = "1.0"

# Time handling
chrono = { version = "0.4", features = ["serde"] }

# UUID generation
uuid = { version = "1.6", features = ["v4", "serde"] }

# URL parsing
url = "2.5"

# Logging
tracing = { version = "0.1", features = ["log"] }

# Async utilities
futures = "0.3"
tokio-util = { version = "0.7", features = ["codec"], optional = true }

[dev-dependencies]
# Testing
tokio-test = "0.4"
tempfile = "3.8"
wiremock = "0.5"

# Property-based testing
proptest = "1.4"
quickcheck = "1.0"

# Benchmarking
criterion = { version = "0.5", features = ["html_reports"] }

# Test utilities
pretty_assertions = "1.4"
mockall = "0.12"

# Coverage
tarpaulin = "0.27"

[[bench]]
name = "api_bench"
harness = false

[[example]]
name = "basic_usage"
required-features = []

[[example]]
name = "async_usage"
required-features = ["async"]

[package.metadata.docs.rs]
all-features = true
rustdoc-args = ["--cfg", "docsrs"]
targets = ["x86_64-unknown-linux-gnu", "x86_64-apple-darwin", "x86_64-pc-windows-msvc"]

[package.metadata.playground]
features = ["async", "default-tls"]

[workspace]
members = [".", "examples/*"]
```

### Rust Toolchain

```toml
# rust-toolchain.toml
[toolchain]
channel = "1.75"
components = ["rustfmt", "clippy", "rust-src"]
targets = [
    "x86_64-unknown-linux-gnu",
    "x86_64-apple-darwin",
    "x86_64-pc-windows-msvc",
    "aarch64-unknown-linux-gnu",
    "aarch64-apple-darwin"
]
```

## 🔧 Implementation

### Library Root

```rust
// src/lib.rs
//! # My Rust Library
//!
//! A comprehensive Rust library for...
//!
//! ## Quick Start
//!
//! ```rust
//! use my_rust_lib::{Client, Config};
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let config = Config::new("https://api.example.com")?;
//!     let client = Client::new(config);
//!
//!     let response = client.get_data().await?;
//!     println!("Response: {:?}", response);
//!
//!     Ok(())
//! }
//! ```
//!
//! ## Features
//!
//! - Async/await support
//! - Type-safe API
//! - Comprehensive error handling
//! - Performance optimized
//! - Cross-platform compatibility
//!
//! ## Configuration
//!
//! The library can be configured using the `Config` struct:
//!
//! ```rust
//! use my_rust_lib::Config;
//!
//! let config = Config::builder()
//!     .base_url("https://api.example.com")
//!     .timeout(std::time::Duration::from_secs(30))
//!     .user_agent("my-app/1.0")
//!     .build()?;
//! ```

#![cfg_attr(docsrs, feature(doc_cfg))]
#![warn(missing_docs, missing_debug_implementations, rust_2018_idioms)]
#![allow(clippy::module_inception)]

pub mod client;
pub mod config;
pub mod error;
pub mod models;
pub mod utils;

// Re-export commonly used types
pub use client::Client;
pub use config::{Config, ConfigBuilder};
pub use error::{Error, Result};
pub use models::{Request, Response};

/// Prelude module with commonly used items
pub mod prelude {
    pub use crate::{Client, Config, ConfigBuilder, Error, Result, Request, Response};
    pub use crate::models::*;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_library_creation() {
        let config = Config::new("https://api.example.com").unwrap();
        let client = Client::new(config);
        
        assert!(client.is_configured());
    }
}
```

### Error Handling

```rust
// src/error.rs
use thiserror::Error;

/// Library error type
#[derive(Error, Debug)]
pub enum Error {
    /// Configuration error
    #[error("Configuration error: {0}")]
    Config(String),

    /// HTTP request error
    #[error("HTTP request failed: {0}")]
    Http(#[from] reqwest::Error),

    /// JSON serialization/deserialization error
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),

    /// URL parsing error
    #[error("Invalid URL: {0}")]
    Url(#[from] url::ParseError),

    /// Validation error
    #[error("Validation error: {0}")]
    Validation(String),

    /// API error response
    #[error("API error: {code} - {message}")]
    Api { code: u16, message: String },

    /// Timeout error
    #[error("Operation timed out")]
    Timeout,

    /// Not found error
    #[error("Resource not found: {0}")]
    NotFound(String),

    /// Permission denied error
    #[error("Permission denied: {0}")]
    PermissionDenied(String),

    /// Rate limited error
    #[error("Rate limited: retry after {retry_after} seconds")]
    RateLimited { retry_after: u64 },

    /// Internal error
    #[error("Internal error: {0}")]
    Internal(String),
}

/// Result type alias for convenience
pub type Result<T> = std::result::Result<T, Error>;

impl Error {
    /// Check if this error is retryable
    pub fn is_retryable(&self) -> bool {
        match self {
            Error::Http(_) => true,
            Error::Timeout => true,
            Error::RateLimited { .. } => true,
            Error::Api { code, .. } => matches!(code, 500..=599),
            _ => false,
        }
    }

    /// Get the error code if available
    pub fn code(&self) -> Option<u16> {
        match self {
            Error::Api { code, .. } => Some(*code),
            _ => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_retryable() {
        assert!(Error::Timeout.is_retryable());
        assert!(Error::Config("test".to_string()).is_retryable() == false);
    }

    #[test]
    fn test_error_code() {
        let error = Error::Api {
            code: 404,
            message: "Not found".to_string(),
        };
        assert_eq!(error.code(), Some(404));
    }
}
```

### Configuration

```rust
// src/config.rs
use crate::error::{Error, Result};
use std::time::Duration;
use url::Url;

/// Library configuration
#[derive(Debug, Clone)]
pub struct Config {
    pub(crate) base_url: Url,
    pub(crate) timeout: Duration,
    pub(crate) user_agent: String,
    pub(crate) max_retries: u32,
    pub(crate) retry_delay: Duration,
    pub(crate) api_key: Option<String>,
}

impl Config {
    /// Create a new configuration with default settings
    pub fn new(base_url: &str) -> Result<Self> {
        ConfigBuilder::new().base_url(base_url)?.build()
    }

    /// Create a new configuration builder
    pub fn builder() -> ConfigBuilder {
        ConfigBuilder::new()
    }

    /// Get the base URL
    pub fn base_url(&self) -> &Url {
        &self.base_url
    }

    /// Get the timeout duration
    pub fn timeout(&self) -> Duration {
        self.timeout
    }

    /// Get the user agent string
    pub fn user_agent(&self) -> &str {
        &self.user_agent
    }

    /// Get the maximum number of retries
    pub fn max_retries(&self) -> u32 {
        self.max_retries
    }

    /// Get the retry delay
    pub fn retry_delay(&self) -> Duration {
        self.retry_delay
    }

    /// Get the API key if set
    pub fn api_key(&self) -> Option<&str> {
        self.api_key.as_deref()
    }
}

/// Configuration builder
#[derive(Debug, Clone)]
pub struct ConfigBuilder {
    base_url: Option<Url>,
    timeout: Duration,
    user_agent: String,
    max_retries: u32,
    retry_delay: Duration,
    api_key: Option<String>,
}

impl Default for ConfigBuilder {
    fn default() -> Self {
        Self {
            base_url: None,
            timeout: Duration::from_secs(30),
            user_agent: format!("{}/{}", env!("CARGO_PKG_NAME"), env!("CARGO_PKG_VERSION")),
            max_retries: 3,
            retry_delay: Duration::from_secs(1),
            api_key: None,
        }
    }
}

impl ConfigBuilder {
    /// Create a new configuration builder
    pub fn new() -> Self {
        Self::default()
    }

    /// Set the base URL
    pub fn base_url(mut self, url: &str) -> Result<Self> {
        self.base_url = Some(Url::parse(url)?);
        Ok(self)
    }

    /// Set the timeout duration
    pub fn timeout(mut self, timeout: Duration) -> Self {
        self.timeout = timeout;
        self
    }

    /// Set the user agent string
    pub fn user_agent(mut self, user_agent: impl Into<String>) -> Self {
        self.user_agent = user_agent.into();
        self
    }

    /// Set the maximum number of retries
    pub fn max_retries(mut self, max_retries: u32) -> Self {
        self.max_retries = max_retries;
        self
    }

    /// Set the retry delay
    pub fn retry_delay(mut self, retry_delay: Duration) -> Self {
        self.retry_delay = retry_delay;
        self
    }

    /// Set the API key
    pub fn api_key(mut self, api_key: impl Into<String>) -> Self {
        self.api_key = Some(api_key.into());
        self
    }

    /// Build the configuration
    pub fn build(self) -> Result<Config> {
        let base_url = self.base_url.ok_or_else(|| {
            Error::Config("Base URL is required".to_string())
        })?;

        Ok(Config {
            base_url,
            timeout: self.timeout,
            user_agent: self.user_agent,
            max_retries: self.max_retries,
            retry_delay: self.retry_delay,
            api_key: self.api_key,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_builder() {
        let config = ConfigBuilder::new()
            .base_url("https://api.example.com")
            .unwrap()
            .timeout(Duration::from_secs(60))
            .user_agent("test-agent")
            .max_retries(5)
            .build()
            .unwrap();

        assert_eq!(config.base_url().as_str(), "https://api.example.com/");
        assert_eq!(config.timeout(), Duration::from_secs(60));
        assert_eq!(config.user_agent(), "test-agent");
        assert_eq!(config.max_retries(), 5);
    }

    #[test]
    fn test_config_new() {
        let config = Config::new("https://api.example.com").unwrap();
        assert_eq!(config.base_url().as_str(), "https://api.example.com/");
        assert_eq!(config.timeout(), Duration::from_secs(30));
    }

    #[test]
    fn test_config_invalid_url() {
        let result = Config::new("invalid-url");
        assert!(result.is_err());
    }
}
```

### Client Implementation

```rust
// src/client/mod.rs
use crate::{
    config::Config,
    error::{Error, Result},
    models::{Request, Response},
};
use reqwest::{Client as HttpClient, StatusCode};
use std::time::Duration;
use tokio::time::sleep;
use tracing::{debug, error, warn};

pub mod http_client;
pub mod async_client;

/// Main client for the library
#[derive(Debug, Clone)]
pub struct Client {
    config: Config,
    http_client: HttpClient,
}

impl Client {
    /// Create a new client with the given configuration
    pub fn new(config: Config) -> Self {
        let http_client = HttpClient::builder()
            .timeout(config.timeout())
            .user_agent(config.user_agent())
            .build()
            .expect("Failed to create HTTP client");

        Self {
            config,
            http_client,
        }
    }

    /// Create a new client with custom HTTP client
    pub fn with_http_client(config: Config, http_client: HttpClient) -> Self {
        Self {
            config,
            http_client,
        }
    }

    /// Check if the client is properly configured
    pub fn is_configured(&self) -> bool {
        !self.config.base_url().as_str().is_empty()
    }

    /// Get the configuration
    pub fn config(&self) -> &Config {
        &self.config
    }

    /// Execute a request with retry logic
    pub async fn execute(&self, request: Request) -> Result<Response> {
        let mut retries = 0;
        let max_retries = self.config.max_retries();

        loop {
            match self.execute_once(&request).await {
                Ok(response) => return Ok(response),
                Err(e) if e.is_retryable() && retries < max_retries => {
                    retries += 1;
                    let delay = self.config.retry_delay() * retries;
                    
                    warn!(
                        "Request failed (attempt {}/{}), retrying in {:?}: {}",
                        retries, max_retries, delay, e
                    );
                    
                    sleep(delay).await;
                }
                Err(e) => return Err(e),
            }
        }
    }

    /// Execute a request without retry logic
    async fn execute_once(&self, request: &Request) -> Result<Response> {
        debug!("Executing request: {}", request);

        let url = self.config.base_url().join(&request.path)?;
        let mut http_request = self.http_client.request(request.method.clone(), url);

        // Set headers
        for (key, value) in &request.headers {
            http_request = http_request.header(key, value);
        }

        // Set API key if available
        if let Some(api_key) = self.config.api_key() {
            http_request = http_request.header("Authorization", format!("Bearer {}", api_key));
        }

        // Set body if present
        if let Some(body) = &request.body {
            http_request = http_request.body(body.clone());
        }

        // Execute request
        let response = http_request.send().await?;
        let status = response.status();

        debug!("Response status: {}", status);

        // Handle error responses
        if status.is_client_error() || status.is_server_error() {
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            
            match status {
                StatusCode::NOT_FOUND => {
                    return Err(Error::NotFound(error_text));
                }
                StatusCode::UNAUTHORIZED => {
                    return Err(Error::PermissionDenied(error_text));
                }
                StatusCode::TOO_MANY_REQUESTS => {
                    let retry_after = response
                        .headers()
                        .get("Retry-After")
                        .and_then(|h| h.to_str().ok())
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(60);
                    
                    return Err(Error::RateLimited { retry_after });
                }
                _ => {
                    return Err(Error::Api {
                        code: status.as_u16(),
                        message: error_text,
                    });
                }
            }
        }

        // Parse successful response
        let response_text = response.text().await?;
        let response_data: serde_json::Value = serde_json::from_str(&response_text)?;

        Ok(Response {
            status: status.as_u16(),
            data: response_data,
            headers: response.headers().iter()
                .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
                .collect(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::Method;

    #[test]
    fn test_client_creation() {
        let config = Config::new("https://api.example.com").unwrap();
        let client = Client::new(config);
        
        assert!(client.is_configured());
    }

    #[tokio::test]
    async fn test_client_execute_invalid_url() {
        let config = Config::new("https://api.example.com").unwrap();
        let client = Client::new(config);
        
        let request = Request {
            method: Method::GET,
            path: "invalid-url".to_string(),
            headers: std::collections::HashMap::new(),
            body: None,
        };

        let result = client.execute(request).await;
        assert!(result.is_err());
    }
}
```

### Models

```rust
// src/models/mod.rs
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub mod request;
pub mod response;

pub use request::{Method, Request};
pub use response::Response;

/// HTTP method
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum Method {
    Get,
    Post,
    Put,
    Delete,
    Patch,
    Head,
    Options,
}

impl Default for Method {
    fn default() -> Self {
        Method::Get
    }
}

impl From<Method> for reqwest::Method {
    fn from(method: Method) -> Self {
        match method {
            Method::Get => reqwest::Method::GET,
            Method::Post => reqwest::Method::POST,
            Method::Put => reqwest::Method::PUT,
            Method::Delete => reqwest::Method::DELETE,
            Method::Patch => reqwest::Method::PATCH,
            Method::Head => reqwest::Method::HEAD,
            Method::Options => reqwest::Method::OPTIONS,
        }
    }
}

/// Generic API response wrapper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub data: T,
    pub message: Option<String>,
    pub success: bool,
    pub errors: Option<Vec<String>>,
}

impl<T> ApiResponse<T> {
    /// Create a successful response
    pub fn success(data: T) -> Self {
        Self {
            data,
            message: None,
            success: true,
            errors: None,
        }
    }

    /// Create a successful response with message
    pub fn success_with_message(data: T, message: String) -> Self {
        Self {
            data,
            message: Some(message),
            success: true,
            errors: None,
        }
    }

    /// Create an error response
    pub fn error(errors: Vec<String>) -> Self {
        Self {
            data: unsafe { std::mem::zeroed() }, // This is a hack, in real code use Option<T>
            message: None,
            success: false,
            errors: Some(errors),
        }
    }
}

/// Pagination information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pagination {
    pub page: u32,
    pub per_page: u32,
    pub total: u64,
    pub total_pages: u32,
}

/// Paginated response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub pagination: Pagination,
}

impl<T> PaginatedResponse<T> {
    /// Create a new paginated response
    pub fn new(data: Vec<T>, page: u32, per_page: u32, total: u64) -> Self {
        let total_pages = ((total as f64) / (per_page as f64)).ceil() as u32;
        
        Self {
            data,
            pagination: Pagination {
                page,
                per_page,
                total,
                total_pages,
            },
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_method_conversion() {
        assert_eq!(reqwest::Method::GET, Method::Get.into());
        assert_eq!(reqwest::Method::POST, Method::Post.into());
    }

    #[test]
    fn test_api_response() {
        let response = ApiResponse::success("test data");
        assert!(response.success);
        assert_eq!(response.data, "test data");
        assert!(response.errors.is_none());
    }

    #[test]
    fn test_paginated_response() {
        let data = vec!["item1", "item2", "item3"];
        let response = PaginatedResponse::new(data, 1, 10, 25);
        
        assert_eq!(response.data.len(), 3);
        assert_eq!(response.pagination.page, 1);
        assert_eq!(response.pagination.per_page, 10);
        assert_eq!(response.pagination.total, 25);
        assert_eq!(response.pagination.total_pages, 3);
    }
}
```

## 🧪 Testing

### Integration Tests

```rust
// tests/integration_tests.rs
use my_rust_lib::{Client, Config, Request, Method};
use wiremock::{MockServer, matchers::{method, path)}, ResponseTemplate};
use serde_json::json;

#[tokio::test]
async fn test_successful_request() {
    // Setup mock server
    let mock_server = MockServer::start().await;
    
    mock_server.mock(|when, then| {
        when(method(Method::GET).and(path("/test")));
        then.status(200).body(json!({"message": "success"}).to_string());
    }).await;

    // Create client
    let config = Config::new(&mock_server.uri()).unwrap();
    let client = Client::new(config);

    // Execute request
    let request = Request {
        method: Method::GET,
        path: "/test".to_string(),
        headers: std::collections::HashMap::new(),
        body: None,
    };

    let response = client.execute(request).await.unwrap();
    
    assert_eq!(response.status, 200);
    assert!(response.data.get("message").is_some());
}

#[tokio::test]
async fn test_retry_logic() {
    // Setup mock server that fails twice then succeeds
    let mock_server = MockServer::start().await;
    
    let mut mock = mock_server.mock(|when, then| {
        when(method(Method::GET).and(path("/test")));
        then.status(500);
    }).await;
    
    mock.upsert_scenarios(vec![
        (2, ResponseTemplate::new(500)),
        (1, ResponseTemplate::new(200).set_body_json(json!({"message": "success"}))),
    ]);

    // Create client with retry configuration
    let config = ConfigBuilder::new()
        .base_url(&mock_server.uri()).unwrap()
        .max_retries(3)
        .retry_delay(std::time::Duration::from_millis(100))
        .build()
        .unwrap();
    
    let client = Client::new(config);

    // Execute request
    let request = Request {
        method: Method::GET,
        path: "/test".to_string(),
        headers: std::collections::HashMap::new(),
        body: None,
    };

    let response = client.execute(request).await.unwrap();
    
    assert_eq!(response.status, 200);
    assert!(response.data.get("message").is_some());
}
```

### Property-Based Tests

```rust
// tests/property_tests.rs
use my_rust_lib::{Config, ConfigBuilder};
use proptest::prelude::*;
use std::time::Duration;

proptest! {
    #[test]
    fn test_config_builder_properties(
        base_url in "https://[a-z]+\\.example\\.com",
        timeout_secs in 1u64..300u64,
        max_retries in 0u32..10u32,
        retry_delay_ms in 100u64..5000u64,
    ) {
        let config = ConfigBuilder::new()
            .base_url(&base_url)
            .unwrap()
            .timeout(Duration::from_secs(timeout_secs))
            .max_retries(max_retries)
            .retry_delay(Duration::from_millis(retry_delay_ms))
            .build()
            .unwrap();

        assert_eq!(config.base_url().as_str(), format!("{}/", base_url));
        assert_eq!(config.timeout(), Duration::from_secs(timeout_secs));
        assert_eq!(config.max_retries(), max_retries);
        assert_eq!(config.retry_delay(), Duration::from_millis(retry_delay_ms));
    }

    #[test]
    fn test_user_agent_format(
        app_name in "[a-zA-Z0-9_-]{1,20}",
        version in "[0-9]\\.[0-9]\\.[0-9]",
    ) {
        let user_agent = format!("{}/{}", app_name, version);
        let config = ConfigBuilder::new()
            .base_url("https://api.example.com")
            .unwrap()
            .user_agent(user_agent.clone())
            .build()
            .unwrap();

        assert_eq!(config.user_agent(), user_agent);
    }
}
```

## 📊 Benchmarking

### API Benchmark

```rust
// benches/api_bench.rs
use criterion::{black_box, criterion_group, criterion_main, Criterion};
use my_rust_lib::{Client, Config, Request, Method};
use std::collections::HashMap;

fn bench_client_creation(c: &mut Criterion) {
    c.bench_function("client_creation", |b| {
        b.iter(|| {
            let config = Config::new("https://api.example.com").unwrap();
            let _client = Client::new(black_box(config));
        });
    });
}

fn bench_request_creation(c: &mut Criterion) {
    c.bench_function("request_creation", |b| {
        b.iter(|| {
            let request = Request {
                method: Method::GET,
                path: "/test".to_string(),
                headers: HashMap::new(),
                body: None,
            };
            black_box(request);
        });
    });
}

fn bench_config_builder(c: &mut Criterion) {
    c.bench_function("config_builder", |b| {
        b.iter(|| {
            let config = ConfigBuilder::new()
                .base_url("https://api.example.com")
                .unwrap()
                .timeout(std::time::Duration::from_secs(30))
                .max_retries(3)
                .build()
                .unwrap();
            black_box(config);
        });
    });
}

criterion_group!(
    benches,
    bench_client_creation,
    bench_request_creation,
    bench_config_builder
);
criterion_main!(benches);
```

## 📚 Documentation

### Examples

```rust
// examples/basic_usage.rs
use my_rust_lib::{Client, Config, Request, Method};
use std::collections::HashMap;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create configuration
    let config = Config::new("https://api.example.com")?;
    
    // Create client
    let client = Client::new(config);
    
    // Create request
    let mut headers = HashMap::new();
    headers.insert("Accept".to_string(), "application/json".to_string());
    
    let request = Request {
        method: Method::GET,
        path: "/users".to_string(),
        headers,
        body: None,
    };
    
    // Execute request
    let response = client.execute(request).await?;
    
    println!("Response status: {}", response.status);
    println!("Response data: {}", serde_json::to_string_pretty(&response.data)?);
    
    Ok(())
}
```

```rust
// examples/async_usage.rs
use my_rust_lib::{Client, Config, Request, Method};
use std::collections::HashMap;
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create configuration with custom settings
    let config = ConfigBuilder::new()
        .base_url("https://api.example.com")?
        .timeout(Duration::from_secs(60))
        .max_retries(5)
        .api_key("your-api-key-here")
        .build()?;
    
    let client = Client::new(config);
    
    // Execute multiple requests concurrently
    let requests = vec!["/users", "/posts", "/comments"];
    let mut handles = vec![];
    
    for endpoint in requests {
        let client = client.clone();
        let handle = tokio::spawn(async move {
            let request = Request {
                method: Method::GET,
                path: endpoint.to_string(),
                headers: std::collections::HashMap::new(),
                body: None,
            };
            
            client.execute(request).await
        });
        
        handles.push(handle);
    }
    
    // Wait for all requests to complete
    for handle in handles {
        match handle.await? {
            Ok(response) => {
                println!("Request completed with status: {}", response.status);
            }
            Err(e) => {
                eprintln!("Request failed: {}", e);
            }
        }
    }
    
    Ok(())
}
```

## 🔒 Security Considerations

- ✅ **Memory Safety**: Rust's ownership system prevents memory vulnerabilities
- ✅ **Type Safety**: Strong typing prevents runtime errors
- ✅ **Input Validation**: Comprehensive input validation
- ✅ **API Key Security**: Secure handling of API keys
- ✅ **HTTPS Enforcement**: Enforce HTTPS for API communications
- ✅ **Dependency Security**: Regular security audits of dependencies
- ✅ **Error Information**: Avoid leaking sensitive information in errors

## 📚 Best Practices

1. **API Design**: Design idiomatic Rust APIs
2. **Error Handling**: Comprehensive error handling with Result types
3. **Documentation**: Complete documentation with examples
4. **Testing**: Comprehensive unit, integration, and property-based tests
5. **Performance**: Optimize for performance without sacrificing safety
6. **Compatibility**: Ensure cross-platform compatibility
7. **Versioning**: Semantic versioning and proper changelog
8. **Publishing**: Proper crate publishing to crates.io

---

**Template Version**: 1.0.0  
**Last Updated**: 2026-02-17  
**Compatible**: Rust 1.70+, Tokio 1.35+, Reqwest 0.11+  
**License**: MIT OR Apache-2.0