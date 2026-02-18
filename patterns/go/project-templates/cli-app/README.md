# Go CLI Application Template

A comprehensive Go command-line application template with best practices for building robust, maintainable, and user-friendly CLI tools.

## 🎯 Overview

This template provides a complete structure for Go CLI applications including:

- Command-line interface with Cobra framework
- Configuration management and environment variables
- Logging and error handling
- Command validation and help system
- Testing framework with test coverage
- Cross-platform builds and releases
- Documentation and man pages
- Shell completion support

## 📁 Project Structure

```
go-cli-app/
├── cmd/                   # CLI commands
│   └── root.go          # Root command
├── internal/             # Private application code
│   ├── app/             # Application logic
│   │   ├── commands/    # Command implementations
│   │   ├── config/      # Configuration management
│   │   ├── logger/      # Logging setup
│   │   └── validator/   # Input validation
│   ├── database/        # Database layer (if needed)
│   ├── api/            # External API clients
│   └── utils/          # Utility functions
├── pkg/                  # Public library code
│   ├── cli/            # CLI utilities
│   ├── config/         # Configuration utilities
│   ├── errors/         # Error handling
│   └── version/        # Version information
├── configs/              # Configuration files
├── scripts/              # Build and release scripts
├── docs/                 # Documentation
├── completions/          # Shell completions
├── manpages/             # Man pages
├── tests/                # Test suite
├── go.mod               # Go module file
├── go.sum               # Go checksums
├── Makefile             # Build automation
├── .goreleaser.yml      # Release configuration
└── README.md            # This file
```

## 🚀 Quick Start

### Bootstrap CLI Application

```bash
# Create new CLI application
./scripts/bootstrap/project.sh --template=go-cli-app --name=my-cli-tool

# Navigate to project
cd my-cli-tool

# Install dependencies
go mod download

# Run development build
make run

# Run tests
make test

# Build for production
make build
```

### Development Workflow

```bash
# Run with development configuration
make run-dev

# Generate shell completions
make completions

# Generate man pages
make manpages

# Run with specific configuration
./bin/my-cli-tool --config configs/development.yaml

# Build for all platforms
make build-all

# Create release
make release
```

## 📋 Configuration

### Application Configuration (`configs/app.yaml`)

```yaml
app:
  name: "My CLI Tool"
  version: "1.0.0"
  description: "A comprehensive CLI application"
  author: "Your Name"
  email: "your.email@example.com"
  website: "https://github.com/yourname/my-cli-tool"

cli:
  name: "my-cli-tool"
  description: "A comprehensive CLI application"
  version: "1.0.0"
  
  # Default command settings
  default_command: "help"
  silence_usage: false
  silence_errors: false
  
  # Output formatting
  output:
    format: "table"  # table, json, yaml, csv
    color: true
    pager: true
    wide: false

logging:
  level: "info"
  format: "text"  # text, json
  output: "stderr"
  file: "logs/cli.log"

config:
  search_paths:
    - "$HOME/.config/my-cli-tool"
    - "/etc/my-cli-tool"
    - "./configs"
  
  file_names:
    - "config.yaml"
    - "config.yml"
    - ".my-cli-tool.yaml"

api:
  base_url: "https://api.example.com"
  timeout: "30s"
  retries: 3
  rate_limit: 100

database:
  driver: "sqlite"
  connection_string: "$HOME/.config/my-cli-tool/data.db"
  max_connections: 5
  connection_timeout: "10s"

cache:
  type: "memory"
  ttl: "1h"
  max_size: 1000
```

### Environment Variables (`.env`)

```bash
# Application
CLI_APP_NAME=my-cli-tool
CLI_APP_VERSION=1.0.0
CLI_APP_DEBUG=false

# API
API_BASE_URL=https://api.example.com
API_TIMEOUT=30s
API_RETRIES=3

# Database
DB_CONNECTION_STRING=$HOME/.config/my-cli-tool/data.db

# Logging
LOG_LEVEL=info
LOG_FORMAT=text
LOG_OUTPUT=stderr
```

## 🔧 Implementation

### Main Application

```go
// cmd/root.go
package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"my-cli-tool/internal/app/config"
	"my-cli-tool/internal/app/logger"
	"my-cli-tool/pkg/version"
)

var (
	cfgFile string
	output   string
	verbose  bool
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "my-cli-tool",
	Short: "A comprehensive CLI application",
	Long: `My CLI Tool is a comprehensive command-line application that provides
various features for managing and processing data efficiently.

Features:
- Configuration management
- Multiple output formats
- Shell completion
- Comprehensive logging
- Cross-platform support`,
	Version: version.Version,
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
		return initConfig(cmd)
	},
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() error {
	return rootCmd.Execute()
}

func init() {
	cobra.OnInitialize(initConfig)

	// Global flags
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.my-cli-tool.yaml)")
	rootCmd.PersistentFlags().StringVarP(&output, "output", "o", "table", "output format (table|json|yaml|csv)")
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "verbose output")

	// Bind flags to viper
	viper.BindPFlag("output", rootCmd.PersistentFlags().Lookup("output"))
	viper.BindPFlag("verbose", rootCmd.PersistentFlags().Lookup("verbose"))
}

// initConfig reads in config file and ENV variables if set.
func initConfig(cmd *cobra.Command) error {
	// Enable environment variable support
	viper.SetEnvPrefix("CLI_APP")
	viper.AutomaticEnv()

	// Set config file path
	if cfgFile != "" {
		// Use config file from the flag
		viper.SetConfigFile(cfgFile)
	} else {
		// Find home directory
		home, err := os.UserHomeDir()
		cobra.CheckErr(err)

		// Search config in home directory with name ".my-cli-tool" (without extension)
		viper.AddConfigPath(home)
		viper.AddConfigPath(".")
		viper.AddConfigPath("/etc/my-cli-tool")
		viper.SetConfigName(".my-cli-tool")
		viper.SetConfigType("yaml")
	}

	// Read config file
	if err := viper.ReadInConfig(); err == nil {
		if verbose {
			fmt.Fprintln(os.Stderr, "Using config file:", viper.ConfigFileUsed())
		}
	} else if !os.IsNotExist(err) {
		return fmt.Errorf("error reading config file: %w", err)
	}

	// Initialize logger
	if err := logger.Init(viper.GetString("logging")); err != nil {
		return fmt.Errorf("failed to initialize logger: %w", err)
	}

	return nil
}

func init() {
	rootCmd.AddCommand(versionCmd)
	rootCmd.AddCommand(configCmd)
	rootCmd.AddCommand(completionCmd)
}
```

### Configuration Management

```go
// internal/app/config/config.go
package config

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	App        AppConfig        `mapstructure:"app"`
	CLI        CLIConfig        `mapstructure:"cli"`
	Logging    LoggingConfig    `mapstructure:"logging"`
	Config     ConfigConfig     `mapstructure:"config"`
	API        APIConfig        `mapstructure:"api"`
	Database   DatabaseConfig   `mapstructure:"database"`
	Cache      CacheConfig      `mapstructure:"cache"`
}

type AppConfig struct {
	Name        string `mapstructure:"name"`
	Version     string `mapstructure:"version"`
	Description string `mapstructure:"description"`
	Author      string `mapstructure:"author"`
	Email       string `mapstructure:"email"`
	Website     string `mapstructure:"website"`
}

type CLIConfig struct {
	Name            string `mapstructure:"name"`
	Description     string `mapstructure:"description"`
	Version         string `mapstructure:"version"`
	DefaultCommand  string `mapstructure:"default_command"`
	SilenceUsage    bool   `mapstructure:"silence_usage"`
	SilenceErrors   bool   `mapstructure:"silence_errors"`
	Output          OutputConfig `mapstructure:"output"`
}

type OutputConfig struct {
	Format string `mapstructure:"format"`
	Color  bool   `mapstructure:"color"`
	Pager  bool   `mapstructure:"pager"`
	Wide   bool   `mapstructure:"wide"`
}

type LoggingConfig struct {
	Level  string `mapstructure:"level"`
	Format string `mapstructure:"format"`
	Output string `mapstructure:"output"`
	File   string `mapstructure:"file"`
}

type ConfigConfig struct {
	SearchPaths []string `mapstructure:"search_paths"`
	FileNames   []string `mapstructure:"file_names"`
}

type APIConfig struct {
	BaseURL    string        `mapstructure:"base_url"`
	Timeout    time.Duration `mapstructure:"timeout"`
	Retries    int           `mapstructure:"retries"`
	RateLimit  int           `mapstructure:"rate_limit"`
}

type DatabaseConfig struct {
	Driver            string        `mapstructure:"driver"`
	ConnectionString string        `mapstructure:"connection_string"`
	MaxConnections    int           `mapstructure:"max_connections"`
	ConnectionTimeout time.Duration `mapstructure:"connection_timeout"`
}

type CacheConfig struct {
	Type    string        `mapstructure:"type"`
	TTL     time.Duration `mapstructure:"ttl"`
	MaxSize int           `mapstructure:"max_size"`
}

// Load loads configuration from viper
func Load() (*Config, error) {
	var config Config

	if err := viper.Unmarshal(&config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	// Set defaults
	setDefaults(&config)

	// Validate configuration
	if err := validate(&config); err != nil {
		return nil, fmt.Errorf("invalid configuration: %w", err)
	}

	return &config, nil
}

func setDefaults(config *Config) {
	// App defaults
	if config.App.Name == "" {
		config.App.Name = "my-cli-tool"
	}
	if config.App.Version == "" {
		config.App.Version = "1.0.0"
	}

	// CLI defaults
	if config.CLI.Name == "" {
		config.CLI.Name = config.App.Name
	}
	if config.CLI.Version == "" {
		config.CLI.Version = config.App.Version
	}
	if config.CLI.Output.Format == "" {
		config.CLI.Output.Format = "table"
	}

	// Logging defaults
	if config.Logging.Level == "" {
		config.Logging.Level = "info"
	}
	if config.Logging.Format == "" {
		config.Logging.Format = "text"
	}
	if config.Logging.Output == "" {
		config.Logging.Output = "stderr"
	}

	// API defaults
	if config.API.Timeout == 0 {
		config.API.Timeout = 30 * time.Second
	}
	if config.API.Retries == 0 {
		config.API.Retries = 3
	}

	// Database defaults
	if config.Database.MaxConnections == 0 {
		config.Database.MaxConnections = 5
	}
	if config.Database.ConnectionTimeout == 0 {
		config.Database.ConnectionTimeout = 10 * time.Second
	}

	// Cache defaults
	if config.Cache.TTL == 0 {
		config.Cache.TTL = time.Hour
	}
	if config.Cache.MaxSize == 0 {
		config.Cache.MaxSize = 1000
	}
}

func validate(config *Config) error {
	// Validate output format
	validFormats := []string{"table", "json", "yaml", "csv"}
	valid := false
	for _, format := range validFormats {
		if config.CLI.Output.Format == format {
			valid = true
			break
		}
	}
	if !valid {
		return fmt.Errorf("invalid output format: %s", config.CLI.Output.Format)
	}

	// Validate logging level
	validLevels := []string{"debug", "info", "warn", "error"}
	valid = false
	for _, level := range validLevels {
		if config.Logging.Level == level {
			valid = true
			break
		}
	}
	if !valid {
		return fmt.Errorf("invalid logging level: %s", config.Logging.Level)
	}

	// Validate database connection string
	if config.Database.Driver != "" && config.Database.ConnectionString == "" {
		return fmt.Errorf("database driver specified but no connection string provided")
	}

	return nil
}

// GetConfigPath returns the path to the config file
func GetConfigPath() string {
	home, err := os.UserHomeDir()
	if err != nil {
		return ""
	}

	return filepath.Join(home, ".config", "my-cli-tool", "config.yaml")
}

// EnsureConfigDir ensures the config directory exists
func EnsureConfigDir() error {
	configPath := GetConfigPath()
	configDir := filepath.Dir(configPath)

	return os.MkdirAll(configDir, 0755)
}
```

### Command Implementation Example

```go
// internal/app/commands/list.go
package commands

import (
	"fmt"
	"os"
	"text/tabwriter"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"my-cli-tool/internal/app/config"
	"my-cli-tool/pkg/cli/formatter"
)

type ListOptions struct {
	Format string
	Wide   bool
	All    bool
}

func NewListCommand() *cobra.Command {
	opts := &ListOptions{}

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List items",
		Long: `List items in various formats.

The list command supports multiple output formats:
- table: Human-readable table format
- json: JSON format
- yaml: YAML format
- csv: CSV format

Examples:
  my-cli-tool list                    # List in table format
  my-cli-tool list --output json      # List in JSON format
  my-cli-tool list --wide              # Wide table format
  my-cli-tool list --all               # List all items`,
		RunE: func(cmd *cobra.Command, args []string) error {
			cfg, err := config.Load()
			if err != nil {
				return fmt.Errorf("failed to load config: %w", err)
			}

			opts.Format = viper.GetString("output")
			opts.Wide = viper.GetBool("wide")

			return runList(cfg, opts)
		},
	}

	cmd.Flags().BoolVarP(&opts.All, "all", "a", false, "list all items")
	cmd.Flags().BoolVarP(&opts.Wide, "wide", "w", false, "wide output format")

	return cmd
}

func runList(cfg *config.Config, opts *ListOptions) error {
	// Get items (this would be your actual data retrieval logic)
	items, err := getItems(opts.All)
	if err != nil {
		return fmt.Errorf("failed to get items: %w", err)
	}

	// Format output based on configuration
	switch opts.Format {
	case "json":
		return formatter.PrintJSON(items)
	case "yaml":
		return formatter.PrintYAML(items)
	case "csv":
		return formatter.PrintCSV(items, opts.Wide)
	default: // table
		return printTable(items, opts.Wide)
	}
}

type Item struct {
	ID          string
	Name        string
	Description string
	Status      string
	CreatedAt   string
	UpdatedAt   string
}

func getItems(all bool) ([]Item, error) {
	// This is where you would implement your actual data retrieval logic
	// For now, we'll return some sample data

	items := []Item{
		{
			ID:          "1",
			Name:        "Sample Item 1",
			Description: "This is a sample item",
			Status:      "active",
			CreatedAt:   "2023-01-01T00:00:00Z",
			UpdatedAt:   "2023-01-02T00:00:00Z",
		},
		{
			ID:          "2",
			Name:        "Sample Item 2",
			Description: "This is another sample item",
			Status:      "inactive",
			CreatedAt:   "2023-01-03T00:00:00Z",
			UpdatedAt:   "2023-01-04T00:00:00Z",
		},
	}

	if !all {
		// Filter only active items
		var activeItems []Item
		for _, item := range items {
			if item.Status == "active" {
				activeItems = append(activeItems, item)
			}
		}
		return activeItems, nil
	}

	return items, nil
}

func printTable(items []Item, wide bool) error {
	w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
	defer w.Flush()

	if wide {
		fmt.Fprintln(w, "ID\tNAME\tDESCRIPTION\tSTATUS\tCREATED\tUPDATED")
		for _, item := range items {
			fmt.Fprintf(w, "%s\t%s\t%s\t%s\t%s\t%s\n",
				item.ID, item.Name, item.Description, item.Status,
				item.CreatedAt, item.UpdatedAt)
		}
	} else {
		fmt.Fprintln(w, "ID\tNAME\tSTATUS")
		for _, item := range items {
			fmt.Fprintf(w, "%s\t%s\t%s\n",
				item.ID, item.Name, item.Status)
		}
	}

	return nil
}
```

### Output Formatter

```go
// pkg/cli/formatter/formatter.go
package formatter

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"gopkg.in/yaml.v2"
)

// PrintJSON prints data in JSON format
func PrintJSON(data interface{}) error {
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	return encoder.Encode(data)
}

// PrintYAML prints data in YAML format
func PrintYAML(data interface{}) error {
	yamlData, err := yaml.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal YAML: %w", err)
	}
	fmt.Print(string(yamlData))
	return nil
}

// PrintCSV prints data in CSV format
func PrintCSV(data interface{}, wide bool) error {
	// Convert data to slice of maps for CSV processing
	records, err := convertToCSVRecords(data, wide)
	if err != nil {
		return fmt.Errorf("failed to convert to CSV records: %w", err)
	}

	if len(records) == 0 {
		return nil
	}

	writer := csv.NewWriter(os.Stdout)
	defer writer.Flush()

	// Write header
	header := records[0]
	if err := writer.Write(header); err != nil {
		return fmt.Errorf("failed to write CSV header: %w", err)
	}

	// Write data rows
	for _, record := range records[1:] {
		if err := writer.Write(record); err != nil {
			return fmt.Errorf("failed to write CSV record: %w", err)
		}
	}

	return nil
}

func convertToCSVRecords(data interface{}, wide bool) ([][]string, error) {
	// This is a simplified implementation
	// In a real application, you would handle various data types
	
	switch v := data.(type) {
	case []interface{}:
		if len(v) == 0 {
			return [][]string{}, nil
		}

		// Assume first item determines the structure
		firstItem := v[0]
		if itemMap, ok := firstItem.(map[string]interface{}); ok {
			return convertMapSliceToCSV(v.([]interface{}), itemMap, wide)
		}
	}

	return nil, fmt.Errorf("unsupported data type for CSV conversion")
}

func convertMapSliceToCSV(items []interface{}, sampleItem map[string]interface{}, wide bool) ([][]string, error) {
	if len(items) == 0 {
		return [][]string{}, nil
	}

	// Determine columns
	var columns []string
	if wide {
		for key := range sampleItem {
			columns = append(columns, strings.ToUpper(key))
		}
	} else {
		// Only include essential columns
		columns = []string{"ID", "NAME", "STATUS"}
	}

	// Create header
	records := [][]string{columns}

	// Convert each item
	for _, item := range items {
		if itemMap, ok := item.(map[string]interface{}); ok {
			var record []string
			for _, column := range columns {
				value := ""
				if val, exists := itemMap[strings.ToLower(column)]; exists {
					value = fmt.Sprintf("%v", val)
				}
				record = append(record, value)
			}
			records = append(records, record)
		}
	}

	return records, nil
}
```

## 🚀 Build and Release

### Makefile

```makefile
# Makefile for Go CLI Application

.PHONY: help build run test clean install release

# Variables
BINARY_NAME=my-cli-tool
VERSION=$(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
BUILD_DIR=bin
LDFLAGS=-ldflags "-X main.version=$(VERSION)"

# Default target
help:
	@echo "Available targets:"
	@echo "  build      - Build the binary"
	@echo "  run        - Run the binary"
	@echo "  test       - Run tests"
	@echo "  clean      - Clean build artifacts"
	@echo "  install    - Install binary to system"
	@echo "  release    - Create release"
	@echo "  completions - Generate shell completions"
	@echo "  manpages   - Generate man pages"

# Build
build:
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd

# Run
run: build
	@echo "Running $(BINARY_NAME)..."
	./$(BUILD_DIR)/$(BINARY_NAME)

# Test
test:
	@echo "Running tests..."
	go test -v -race -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

# Clean
clean:
	@echo "Cleaning build artifacts..."
	rm -rf $(BUILD_DIR)
	rm -f coverage.out coverage.html

# Install
install: build
	@echo "Installing $(BINARY_NAME)..."
	cp $(BUILD_DIR)/$(BINARY_NAME) /usr/local/bin/

# Release
release:
	@echo "Creating release..."
	goreleaser release --rm-dist

# Generate completions
completions:
	@echo "Generating shell completions..."
	@mkdir -p completions
	./$(BUILD_DIR)/$(BINARY_NAME) completion bash > completions/$(BINARY_NAME).bash
	./$(BUILD_DIR)/$(BINARY_NAME) completion zsh > completions/$(BINARY_NAME).zsh
	./$(BUILD_DIR)/$(BINARY_NAME) completion fish > completions/$(BINARY_NAME).fish

# Generate man pages
manpages:
	@echo "Generating man pages..."
	@mkdir -p manpages
	go run ./cmd/docgen.go manpages manpages

# Build for all platforms
build-all:
	@echo "Building for all platforms..."
	@mkdir -p $(BUILD_DIR)
	
	# Linux AMD64
	GOOS=linux GOARCH=amd64 go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-linux-amd64 ./cmd
	
	# Linux ARM64
	GOOS=linux GOARCH=arm64 go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-linux-arm64 ./cmd
	
	# macOS AMD64
	GOOS=darwin GOARCH=amd64 go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-amd64 ./cmd
	
	# macOS ARM64
	GOOS=darwin GOARCH=arm64 go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-arm64 ./cmd
	
	# Windows AMD64
	GOOS=windows GOARCH=amd64 go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-windows-amd64.exe ./cmd

# Lint
lint:
	@echo "Running linter..."
	golangci-lint run

# Format
fmt:
	@echo "Formatting code..."
	go fmt ./...

# Vet
vet:
	@echo "Vetting code..."
	go vet ./...

# Dependencies
deps:
	@echo "Updating dependencies..."
	go mod tidy
	go mod download

# Security scan
security:
	@echo "Running security scan..."
	gosec ./...
```

### GoReleaser Configuration

```yaml
# .goreleaser.yml
builds:
  - env:
      - CGO_ENABLED=0
    goos:
      - linux
      - darwin
      - windows
    goarch:
      - amd64
      - arm64
    binary: my-cli-tool
    ldflags:
      - -s -w
      - -X main.version={{.Version}}
      - -X main.commit={{.Commit}}
      - -X main.date={{.Date}}

archives:
  - format: tar.gz
    name_template: "{{ .ProjectName }}_{{ .Version }}_{{ .Os }}_{{ .Arch }}"
    files:
      - README.md
      - LICENSE
      - completions/*
      - manpages/*
    format_overrides:
      - goos: windows
        format: zip

checksum:
  name_template: "{{ .ProjectName }}_{{ .Version }}_checksums.txt"

snapshot:
  name_template: "{{ .ProjectName }}-{{ .Version }}-next"

changelog:
  sort: asc
  use: github
  filters:
    exclude:
      - "^docs:"
      - "^test:"
      - "^chore:"
  groups:
    - title: Features
      regexp: "^.*feat[(\\w)]*:+.*$"
      order: 0
    - title: 'Bug fixes'
      regexp: "^.*fix[(\\w)]*:+.*$"
      order: 1
    - title: Others
      order: 999

release:
  github:
    owner: yourname
    name: my-cli-tool

brews:
  - name: my-cli-tool
    homepage: https://github.com/yourname/my-cli-tool
    description: A comprehensive CLI application
    license: MIT
    test: |
      system "#{bin}/my-cli-tool version"

scoop:
  name: my-cli-tool
  homepage: https://github.com/yourname/my-cli-tool
  description: A comprehensive CLI application
  license: MIT

nfpms:
  - name: my-cli-tool
    homepage: https://github.com/yourname/my-cli-tool
    description: A comprehensive CLI application
    license: MIT
    bindir: /usr/local/bin
    files:
      - completions/my-cli-tool.bash:/etc/bash_completion.d/my-cli-tool
      - manpages/*.1:/usr/share/man/man1/
```

## 🧪 Testing

### Unit Tests

```go
// tests/unit/commands/list_test.go
package unit

import (
	"bytes"
	"testing"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"my-cli-tool/internal/app/commands"
)

func TestListCommand(t *testing.T) {
	tests := []struct {
		name     string
		args     []string
		output   string
		expected string
		wantErr  bool
	}{
		{
			name:     "list with table output",
			args:     []string{"--output", "table"},
			expected: "ID\tNAME\tSTATUS",
			wantErr:  false,
		},
		{
			name:     "list with json output",
			args:     []string{"--output", "json"},
			expected: "[",
			wantErr:  false,
		},
		{
			name:     "list with invalid output",
			args:     []string{"--output", "invalid"},
			wantErr:  true,
		},
	}

	for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				// Setup viper
				viper.Reset()
				viper.Set("output", "table")

				// Create command
				cmd := commands.NewListCommand()
				cmd.SetArgs(tt.args)

				// Capture output
				var buf bytes.Buffer
				cmd.SetOut(&buf)

				// Execute command
				err := cmd.Execute()

				if tt.wantErr {
					assert.Error(t, err)
				} else {
					require.NoError(t, err)
					output := buf.String()
					assert.Contains(t, output, tt.expected)
				}
			})
		}
	}
```

## 🔒 Security Considerations

- ✅ **Input Validation**: Comprehensive input validation and sanitization
- ✅ **Configuration Security**: Secure handling of configuration files
- ✅ **Environment Variables**: No hardcoded secrets
- ✅ **File Permissions**: Proper file permissions for config and data
- ✅ **Network Security**: TLS for API communications
- ✅ **Dependency Security**: Regular security scans of dependencies

## 📚 Best Practices

1. **Command Design**: Follow CLI design principles and conventions
2. **Error Handling**: Comprehensive error handling with user-friendly messages
3. **Configuration**: Flexible configuration with multiple sources
4. **Output Formats**: Support multiple output formats for different use cases
5. **Testing**: Comprehensive test coverage with unit and integration tests
6. **Documentation**: Complete documentation with examples
7. **Release Management**: Automated builds and releases
8. **Shell Integration**: Shell completions and man pages

---

**Template Version**: 1.0.0  
**Last Updated**: 2026-02-17  
**Compatible**: Go 1.21+, Cobra 1.8+, Viper 1.17+  
**License**: MIT