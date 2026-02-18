# Rust CLI Application Template

A comprehensive Rust command-line application template with best practices for building safe, performant, and user-friendly CLI tools using modern Rust ecosystem.

## 🎯 Overview

This template provides a complete structure for Rust CLI applications including:

- Modern CLI framework with Clap
- Type-safe configuration management
- Comprehensive error handling
- Async command execution
- Multiple output formats (JSON, YAML, Table)
- Shell completion support
- Testing framework with property-based testing
- Cross-platform builds and releases
- Performance optimization patterns

## 📁 Project Structure

```
rust-cli-app/
├── src/                   # Source code
│   ├── main.rs          # Application entry point
│   ├── lib.rs           # Library root
│   ├── cli/             # CLI command definitions
│   │   ├── mod.rs
│   │   ├── commands/    # Command implementations
│   │   │   ├── mod.rs
│   │   │   ├── list.rs
│   │   │   ├── create.rs
│   │   │   └── delete.rs
│   │   └── args.rs      # Command line arguments
│   ├── config/          # Configuration management
│   │   ├── mod.rs
│   │   └── app_config.rs
│   ├── services/        # Business logic services
│   │   ├── mod.rs
│   │   ├── item_service.rs
│   │   └── output_service.rs
│   ├── models/          # Data models
│   │   ├── mod.rs
│   │   ├── item.rs
│   │   └── response.rs
│   ├── output/          # Output formatting
│   │   ├── mod.rs
│   │   ├── formatter.rs
│   │   ├── table.rs
│   │   ├── json.rs
│   │   └── yaml.rs
│   ├── utils/           # Utility functions
│   │   ├── mod.rs
│   │   ├── validation.rs
│   │   └── crypto.rs
│   └── errors/          # Error types
│       ├── mod.rs
│       └── app_error.rs
├── tests/                # Integration tests
│   ├── cli_tests.rs
│   └── property_tests.rs
├── benches/              # Performance benchmarks
│   └── command_bench.rs
├── completions/          # Shell completions
├── manpages/             # Man pages
├── configs/              # Configuration files
├── scripts/              # Utility scripts
├── Cargo.toml           # Cargo configuration
├── Cargo.lock           # Cargo lock file
├── Makefile             # Build automation
└── README.md            # This file
```

## 🚀 Quick Start

### Bootstrap Rust CLI Application

```bash
# Create new CLI application
./scripts/bootstrap/project.sh --template=rust-cli-app --name=my-rust-cli

# Navigate to project
cd my-rust-cli

# Install dependencies
cargo build

# Run development build
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
# Run with specific configuration
RUST_LOG=debug cargo run -- --config configs/development.toml

# Generate shell completions
cargo run -- generate-completion bash > completions/my-rust-cli.bash

# Generate man pages
cargo run -- generate-manpage > manpages/my-rust-cli.1

# Run with custom output format
cargo run -- list --output json

# Build for all platforms
cargo build --release --target x86_64-unknown-linux-gnu
cargo build --release --target x86_64-apple-darwin
cargo build --release --target x86_64-pc-windows-msvc
```

## 📋 Configuration

### Application Configuration (`configs/app.toml`)

```toml
[app]
name = "My Rust CLI"
version = "1.0.0"
description = "A comprehensive CLI application"
author = "Your Name"
email = "your.email@example.com"

[cli]
name = "my-rust-cli"
description = "A comprehensive CLI application"
version = "1.0.0"

# Default command settings
default_command = "help"
help_template = "default"

# Output formatting
output = "table"  # table, json, yaml, csv
color = "auto"    # auto, always, never
pager = true
wide = false

[logging]
level = "info"
format = "human"  # human, json, compact
output = "stderr"

[config]
search_paths = [
    "$HOME/.config/my-rust-cli",
    "/etc/my-rust-cli",
    "./configs"
]
file_names = [
    "config.toml",
    "config.yml",
    ".my-rust-cli.toml"
]

[api]
base_url = "https://api.example.com"
timeout = 30
retries = 3
rate_limit = 100

[cache]
type = "memory"
ttl = 3600
max_size = 1000
```

### Environment Variables (`.env`)

```bash
# Application
RUST_LOG=info
CLI_APP_NAME=my-rust-cli
CLI_APP_VERSION=1.0.0
CLI_APP_DEBUG=false

# API
API_BASE_URL=https://api.example.com
API_TIMEOUT=30
API_RETRIES=3

# Cache
CACHE_TTL=3600
CACHE_MAX_SIZE=1000

# Output
OUTPUT_FORMAT=table
OUTPUT_COLOR=auto
OUTPUT_PAGER=true
```

## 🔧 Implementation

### Main Application

```rust
// src/main.rs
use clap::Parser;
use std::process;

mod cli;
mod config;
mod services;
mod models;
mod output;
mod utils;
mod errors;

use cli::Args;
use config::AppConfig;
use errors::AppError;

#[tokio::main]
async fn main() {
    // Parse command line arguments
    let args = Args::parse();

    // Initialize logging
    init_logging(&args);

    // Load configuration
    let config = match AppConfig::load(&args).await {
        Ok(config) => config,
        Err(e) => {
            eprintln!("Failed to load configuration: {}", e);
            process::exit(1);
        }
    };

    // Execute command
    if let Err(e) = cli::execute_command(args, config).await {
        eprintln!("Error: {}", e);
        process::exit(1);
    }
}

fn init_logging(args: &Args) {
    use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

    let level = match args.verbose {
        0 => tracing::Level::INFO,
        1 => tracing::Level::DEBUG,
        _ => tracing::Level::TRACE,
    };

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::fmt::layer()
                .with_target(false)
                .with_timer(tracing_subscriber::fmt::time::ChronoUtc::rfc3339())
                .with_level(true)
        )
        .with(tracing_subscriber::filter::EnvFilter::from_default_env()
            .add_directive(level.into()))
        .init();
}
```

### CLI Arguments

```rust
// src/cli/args.rs
use clap::{Parser, Subcommand, ValueEnum};
use std::path::PathBuf;

#[derive(Parser)]
#[command(
    name = "my-rust-cli",
    version,
    about = "A comprehensive CLI application",
    long_about = "My Rust CLI is a comprehensive command-line application that provides
various features for managing and processing data efficiently.

Features:
- Configuration management
- Multiple output formats
- Shell completion
- Comprehensive logging
- Cross-platform support"
)]
pub struct Args {
    /// Configuration file path
    #[arg(short, long, value_name = "FILE")]
    pub config: Option<PathBuf>,

    /// Output format
    #[arg(short = 'o', long, value_enum, default_value = "table")]
    pub output: OutputFormat,

    /// Enable verbose output
    #[arg(short, long, action = clap::ArgAction::Count)]
    pub verbose: u8,

    /// Disable colored output
    #[arg(long)]
    pub no_color: bool,

    /// Disable pager
    #[arg(long)]
    pub no_pager: bool,

    /// Enable wide output
    #[arg(short = 'w', long)]
    pub wide: bool,

    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// List items
    List {
        /// List all items
        #[arg(short, long)]
        all: bool,

        /// Filter by status
        #[arg(short, long)]
        status: Option<String>,

        /// Limit number of results
        #[arg(short = 'n', long, default_value = "10")]
        limit: usize,
    },

    /// Create a new item
    Create {
        /// Item name
        #[arg(short, long)]
        name: String,

        /// Item description
        #[arg(short, long)]
        description: Option<String>,

        /// Item status
        #[arg(short, long, default_value = "pending")]
        status: String,
    },

    /// Delete an item
    Delete {
        /// Item ID
        #[arg(short, long)]
        id: String,

        /// Confirm deletion without prompt
        #[arg(short, long)]
        force: bool,
    },

    /// Generate shell completions
    GenerateCompletion {
        #[arg(value_enum)]
        shell: Shell,
    },

    /// Generate man page
    GenerateManpage,

    /// Show configuration
    Config {
        /// Show configuration file location
        #[arg(short, long)]
        location: bool,
    },
}

#[derive(ValueEnum, Clone, Debug)]
pub enum OutputFormat {
    Table,
    Json,
    Yaml,
    Csv,
}

#[derive(ValueEnum, Clone, Debug)]
pub enum Shell {
    Bash,
    Zsh,
    Fish,
    PowerShell,
    Elvish,
}

impl std::fmt::Display for OutputFormat {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            OutputFormat::Table => write!(f, "table"),
            OutputFormat::Json => write!(f, "json"),
            OutputFormat::Yaml => write!(f, "yaml"),
            OutputFormat::Csv => write!(f, "csv"),
        }
    }
}
```

### Command Execution

```rust
// src/cli/mod.rs
use clap::Shell;

pub mod args;
pub mod commands;

use args::{Args, Commands, Shell};
use config::AppConfig;
use errors::{AppError, Result};

pub async fn execute_command(args: Args, config: AppConfig) -> Result<()> {
    match args.command {
        Commands::List { all, status, limit } => {
            commands::list::execute(all, status, limit, &args.output, config).await
        }
        Commands::Create { name, description, status } => {
            commands::create::execute(name, description, status, &args.output, config).await
        }
        Commands::Delete { id, force } => {
            commands::delete::execute(id, force, config).await
        }
        Commands::GenerateCompletion { shell } => {
            generate_completion(shell);
            Ok(())
        }
        Commands::GenerateManpage => {
            generate_manpage();
            Ok(())
        }
        Commands::Config { location } => {
            commands::config::execute(location, config).await
        }
    }
}

fn generate_completion(shell: Shell) {
    use clap::CommandFactory;
    use crate::cli::args::Args;

    let mut cmd = Args::command();
    
    match shell {
        Shell::Bash => {
            cmd.generate_completions_to("my-rust-cli", Shell::Bash, &mut std::io::stdout());
        }
        Shell::Zsh => {
            cmd.generate_completions_to("my-rust-cli", Shell::Zsh, &mut std::io::stdout());
        }
        Shell::Fish => {
            cmd.generate_completions_to("my-rust-cli", Shell::Fish, &mut std::io::stdout());
        }
        Shell::PowerShell => {
            cmd.generate_completions_to("my-rust-cli", Shell::PowerShell, &mut std::io::stdout());
        }
        Shell::Elvish => {
            cmd.generate_completions_to("my-rust-cli", Shell::Elvish, &mut std::io::stdout());
        }
    }
}

fn generate_manpage() {
    use clap::CommandFactory;
    use crate::cli::args::Args;

    let cmd = Args::command();
    let man = clap::Man::new(cmd);
    man.render(&mut std::io::stdout()).expect("Failed to generate man page");
}
```

### List Command

```rust
// src/cli/commands/list.rs
use crate::{
    args::OutputFormat,
    config::AppConfig,
    errors::{AppError, Result},
    models::{Item, ItemFilter},
    output::Formatter,
    services::ItemService,
};

pub async fn execute(
    all: bool,
    status: Option<String>,
    limit: usize,
    output_format: &OutputFormat,
    config: AppConfig,
) -> Result<()> {
    // Create item service
    let item_service = ItemService::new(config).await?;

    // Build filter
    let filter = ItemFilter {
        status,
        limit: if all { None } else { Some(limit) },
    };

    // Get items
    let items = item_service.list_items(filter).await?;

    // Format and output
    let formatter = Formatter::new(output_format.clone());
    formatter.format_items(&items)?;

    Ok(())
}
```

### Item Service

```rust
// src/services/item_service.rs
use crate::{
    config::AppConfig,
    errors::{AppError, Result},
    models::{Item, ItemFilter},
};

pub struct ItemService {
    config: AppConfig,
}

impl ItemService {
    pub async fn new(config: AppConfig) -> Result<Self> {
        Ok(Self { config })
    }

    pub async fn list_items(&self, filter: ItemFilter) -> Result<Vec<Item>> {
        // This is where you would implement your actual data retrieval logic
        // For now, we'll return some sample data

        let mut items = vec![
            Item {
                id: "1".to_string(),
                name: "Sample Item 1".to_string(),
                description: "This is a sample item".to_string(),
                status: "active".to_string(),
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            },
            Item {
                id: "2".to_string(),
                name: "Sample Item 2".to_string(),
                description: "This is another sample item".to_string(),
                status: "inactive".to_string(),
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            },
        ];

        // Apply filters
        if let Some(status_filter) = filter.status {
            items.retain(|item| item.status == status_filter);
        }

        if let Some(limit) = filter.limit {
            items.truncate(limit);
        }

        Ok(items)
    }

    pub async fn create_item(&self, name: String, description: Option<String>, status: String) -> Result<Item> {
        // Generate ID (in a real app, you'd use a proper ID generation strategy)
        let id = uuid::Uuid::new_v4().to_string();

        let now = chrono::Utc::now();
        let item = Item {
            id,
            name,
            description: description.unwrap_or_else(|| "No description".to_string()),
            status,
            created_at: now,
            updated_at: now,
        };

        // In a real app, you'd save this to a database or file
        tracing::info!("Created item: {}", item.id);

        Ok(item)
    }

    pub async fn delete_item(&self, id: String) -> Result<()> {
        // In a real app, you'd delete from database or file
        tracing::info!("Deleted item: {}", id);
        Ok(())
    }
}
```

### Output Formatter

```rust
// src/output/mod.rs
use crate::{
    args::OutputFormat,
    errors::{AppError, Result},
    models::Item,
};

pub mod formatter;
pub mod table;
pub mod json;
pub mod yaml;
pub mod csv;

use formatter::Formatter;

pub trait OutputFormatter {
    fn format_items(&self, items: &[Item]) -> Result<()>;
}

pub struct FormatterFactory;

impl FormatterFactory {
    pub fn create(format: OutputFormat) -> Box<dyn OutputFormatter> {
        match format {
            OutputFormat::Table => Box::new(table::TableFormatter),
            OutputFormat::Json => Box::new(json::JsonFormatter),
            OutputFormat::Yaml => Box::new(yaml::YamlFormatter),
            OutputFormat::Csv => Box::new(csv::CsvFormatter),
        }
    }
}

// Convenience wrapper
pub struct Formatter {
    inner: Box<dyn OutputFormatter>,
}

impl Formatter {
    pub fn new(format: OutputFormat) -> Self {
        Self {
            inner: FormatterFactory::create(format),
        }
    }

    pub fn format_items(&self, items: &[Item]) -> Result<()> {
        self.inner.format_items(items)
    }
}
```

### Table Formatter

```rust
// src/output/table.rs
use crate::{
    errors::{AppError, Result},
    models::Item,
    output::OutputFormatter,
};
use comfy_table::{presets::UTF8_FULL, Table, Cell};

pub struct TableFormatter;

impl OutputFormatter for TableFormatter {
    fn format_items(&self, items: &[Item]) -> Result<()> {
        let mut table = Table::new();
        table
            .load_preset(UTF8_FULL)
            .set_header(vec!["ID", "Name", "Description", "Status", "Created"]);

        for item in items {
            table.add_row(vec![
                Cell::new(&item.id),
                Cell::new(&item.name),
                Cell::new(&item.description),
                Cell::new(&item.status),
                Cell::new(item.created_at.format("%Y-%m-%d %H:%M:%S").to_string()),
            ]);
        }

        println!("{}", table);
        Ok(())
    }
}
```

### Error Handling

```rust
// src/errors/app_error.rs
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Configuration error: {0}")]
    Config(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("YAML error: {0}")]
    Yaml(#[from] serde_yaml::Error),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Item not found: {0}")]
    ItemNotFound(String),

    #[error("API error: {0}")]
    Api(String),

    #[error("Cache error: {0}")]
    Cache(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

// Result type alias for convenience
pub type Result<T> = std::result::Result<T, AppError>;
```

## 🚀 Build and Release

### Cargo.toml

```toml
[package]
name = "my-rust-cli"
version = "1.0.0"
edition = "2021"
authors = ["Your Name <your.email@example.com>"]
description = "A comprehensive CLI application"
license = "MIT"
repository = "https://github.com/yourname/my-rust-cli"
homepage = "https://github.com/yourname/my-rust-cli"
keywords = ["cli", "command-line", "tool"]
categories = ["command-line-utilities"]

[dependencies]
# CLI framework
clap = { version = "4.4", features = ["derive", "color", "suggestions"] }

# Async runtime
tokio = { version = "1.35", features = ["full"] }

# Error handling
thiserror = "1.0"
anyhow = "1.0"

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
serde_yaml = "0.9"

# Configuration
config = "0.14"

# Logging
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter", "json"] }

# Time handling
chrono = { version = "0.4", features = ["serde"] }

# UUID generation
uuid = { version = "1.6", features = ["v4", "serde"] }

# Table formatting
comfy-table = "7.1"

# HTTP client (if needed)
reqwest = { version = "0.11", features = ["json"] }

# Caching (if needed)
lru = "0.12"

[dev-dependencies]
# Testing
tokio-test = "0.4"
tempfile = "3.8"

# Property-based testing
proptest = "1.4"

# Benchmarking
criterion = { version = "0.5", features = ["html_reports"] }

[[bin]]
name = "my-rust-cli"
path = "src/main.rs"

[profile.release]
lto = true
codegen-units = 1
panic = "abort"
strip = true

[[bench]]
name = "command_bench"
harness = false
```

### Makefile

```makefile
# Makefile for Rust CLI Application

.PHONY: help build run test clean install release

# Variables
BINARY_NAME=my-rust-cli
CARGO_TARGET_DIR=target
RELEASE_DIR=$(CARGO_TARGET_DIR)/release

# Default target
help:
	@echo "Available targets:"
	@echo "  build      - Build the binary"
	@echo "  run        - Run the binary"
	@echo "  test       - Run tests"
	@echo "  bench      - Run benchmarks"
	@echo "  clean      - Clean build artifacts"
	@echo "  install    - Install binary to system"
	@echo "  release    - Create release"
	@echo "  completions - Generate shell completions"
	@echo "  manpages   - Generate man pages"

# Build
build:
	@echo "Building $(BINARY_NAME)..."
	cargo build

# Run
run: build
	@echo "Running $(BINARY_NAME)..."
	cargo run

# Test
test:
	@echo "Running tests..."
	cargo test --all

# Benchmarks
bench:
	@echo "Running benchmarks..."
	cargo bench

# Clean
clean:
	@echo "Cleaning build artifacts..."
	cargo clean

# Install
install: build
	@echo "Installing $(BINARY_NAME)..."
	cargo install --path .

# Release build
release:
	@echo "Building release..."
	cargo build --release

# Install release
install-release: release
	@echo "Installing release binary..."
	cp $(RELEASE_DIR)/$(BINARY_NAME) /usr/local/bin/

# Generate completions
completions: release
	@echo "Generating shell completions..."
	@mkdir -p completions
	./$(RELEASE_DIR)/$(BINARY_NAME) generate-completion bash > completions/$(BINARY_NAME).bash
	./$(RELEASE_DIR)/$(BINARY_NAME) generate-completion zsh > completions/$(BINARY_NAME).zsh
	./$(RELEASE_DIR)/$(BINARY_NAME) generate-completion fish > completions/$(BINARY_NAME).fish

# Generate man pages
manpages: release
	@echo "Generating man pages..."
	@mkdir -p manpages
	./$(RELEASE_DIR)/$(BINARY_NAME) generate-manpage > manpages/$(BINARY_NAME).1

# Build for all platforms
build-all:
	@echo "Building for all platforms..."
	cargo build --release --target x86_64-unknown-linux-gnu
	cargo build --release --target x86_64-apple-darwin
	cargo build --release --target x86_64-pc-windows-msvc

# Lint
lint:
	@echo "Running linter..."
	cargo clippy -- -D warnings

# Format
fmt:
	@echo "Formatting code..."
	cargo fmt

# Check
check:
	@echo "Checking code..."
	cargo check
	cargo clippy -- -D warnings
	cargo fmt -- --check

# Security audit
audit:
	@echo "Running security audit..."
	cargo audit

# Dependencies
deps:
	@echo "Updating dependencies..."
	cargo update
	cargo upgrade
```

## 🧪 Testing

### Unit Tests

```rust
// tests/unit/item_service_test.rs
use proptest::prelude::*;
use my_rust_cli::{
    services::ItemService,
    models::{ItemFilter, Item},
    config::AppConfig,
};

#[tokio::test]
async fn test_list_items_empty_filter() {
    let config = AppConfig::default();
    let service = ItemService::new(config).await.unwrap();
    
    let filter = ItemFilter {
        status: None,
        limit: None,
    };
    
    let items = service.list_items(filter).await.unwrap();
    
    assert!(!items.is_empty());
    assert_eq!(items.len(), 2); // Based on our sample data
}

#[tokio::test]
async fn test_list_items_with_status_filter() {
    let config = AppConfig::default();
    let service = ItemService::new(config).await.unwrap();
    
    let filter = ItemFilter {
        status: Some("active".to_string()),
        limit: None,
    };
    
    let items = service.list_items(filter).await.unwrap();
    
    assert!(!items.is_empty());
    for item in &items {
        assert_eq!(item.status, "active");
    }
}

#[tokio::test]
async fn test_list_items_with_limit() {
    let config = AppConfig::default();
    let service = ItemService::new(config).await.unwrap();
    
    let filter = ItemFilter {
        status: None,
        limit: Some(1),
    };
    
    let items = service.list_items(filter).await.unwrap();
    
    assert_eq!(items.len(), 1);
}

#[tokio::test]
async fn test_create_item() {
    let config = AppConfig::default();
    let service = ItemService::new(config).await.unwrap();
    
    let item = service.create_item(
        "Test Item".to_string(),
        Some("Test Description".to_string()),
        "active".to_string(),
    ).await.unwrap();
    
    assert_eq!(item.name, "Test Item");
    assert_eq!(item.description, "Test Description");
    assert_eq!(item.status, "active");
    assert!(!item.id.is_empty());
}

// Property-based tests
proptest! {
    #[test]
    fn test_create_item_properties(
        name in "[a-zA-Z0-9 ]{1,50}",
        description in "[a-zA-Z0-9 ]{0,200}",
        status in "[a-z]{3,20}"
    ) {
        let config = AppConfig::default();
        let service = ItemService::new(config).await.unwrap();
        
        let item = service.create_item(
            name.clone(),
            if description.is_empty() { None } else { Some(description.clone()) },
            status.clone(),
        ).await.unwrap();
        
        assert_eq!(item.name, name);
        assert_eq!(item.status, status);
        assert!(!item.id.is_empty());
    }
}
```

## 🔒 Security Considerations

- ✅ **Memory Safety**: Rust's ownership system prevents memory vulnerabilities
- ✅ **Input Validation**: Comprehensive input validation and sanitization
- ✅ **Configuration Security**: Secure handling of configuration files
- ✅ **Environment Variables**: No hardcoded secrets
- ✅ **File Permissions**: Proper file permissions for config and data
- ✅ **Network Security**: TLS for API communications (if applicable)
- ✅ **Dependency Security**: Regular security audits of dependencies

## 📚 Best Practices

1. **Error Handling**: Comprehensive error handling with Result types
2. **Async Patterns**: Proper async patterns with Tokio
3. **Memory Management**: Efficient memory usage without manual management
4. **CLI Design**: Follow CLI design principles and conventions
5. **Testing**: Comprehensive unit and property-based tests
6. **Documentation**: Complete documentation with examples
7. **Release Management**: Automated builds and releases
8. **Shell Integration**: Shell completions and man pages

---

**Template Version**: 1.0.0  
**Last Updated**: 2026-02-17  
**Compatible**: Rust 1.75+, Clap 4.4+, Tokio 1.35+  
**License**: MIT