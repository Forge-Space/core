# Go Web Service Template

A comprehensive Go web service template with best practices for building scalable, maintainable, and production-ready HTTP APIs.

## 🎯 Overview

This template provides a complete structure for Go web services including:

- Clean architecture with dependency injection
- HTTP/REST API with proper middleware
- Database integration with connection pooling
- Configuration management and environment variables
- Comprehensive logging and monitoring
- Testing framework with mocks
- Docker deployment and orchestration
- Performance optimization and caching

## 📁 Project Structure

```
go-web-service/
├── cmd/                   # Application entry points
│   └── server/           # Main server application
│       └── main.go      # Server entry point
├── internal/             # Private application code
│   ├── api/             # API handlers and routes
│   │   ├── handlers/    # HTTP handlers
│   │   ├── middleware/  # HTTP middleware
│   │   ├── routes/      # Route definitions
│   │   └── validators/  # Request validation
│   ├── config/          # Configuration management
│   ├── database/        # Database layer
│   │   ├── migrations/  # Database migrations
│   │   ├── models/      # Database models
│   │   ├── queries/     # SQL queries
│   │   └── repositories/ # Repository pattern
│   ├── services/        # Business logic services
│   ├── cache/           # Caching layer
│   ├── monitoring/      # Monitoring and metrics
│   └── utils/           # Utility functions
├── pkg/                  # Public library code
│   ├── logger/          # Logging package
│   ├── errors/          # Error handling
│   ├── response/        # HTTP response utilities
│   └── validator/       # Validation utilities
├── configs/              # Configuration files
├── deployments/          # Deployment configurations
├── scripts/              # Utility scripts
├── tests/                # Test suite
├── docs/                 # Documentation
├── go.mod               # Go module file
├── go.sum               # Go checksums
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose
└── Makefile             # Build automation
```

## 🚀 Quick Start

### Bootstrap Go Web Service

```bash
# Create new Go web service
./scripts/bootstrap/project.sh --template=go-web-service --name=my-go-service

# Navigate to project
cd my-go-service

# Install dependencies
go mod download

# Run development server
make run-dev

# Run tests
make test

# Build for production
make build-prod
```

### Development Workflow

```bash
# Start with hot reload
make run-dev

# Run database migrations
make migrate-up

# Generate API documentation
make docs

# Run with specific configuration
CONFIG_PATH=configs/development.yaml go run cmd/server/main.go

# Build Docker image
make docker-build

# Run with Docker Compose
make docker-up
```

## 📋 Configuration

### Application Configuration (`configs/app.yaml`)

```yaml
app:
  name: "Go Web Service"
  version: "1.0.0"
  environment: "development"
  debug: true

server:
  host: "0.0.0.0"
  port: 8080
  read_timeout: "30s"
  write_timeout: "30s"
  idle_timeout: "60s"
  max_header_bytes: 1048576

database:
  driver: "postgres"
  host: "localhost"
  port: 5432
  name: "web_service_db"
  user: "postgres"
  password: "${DB_PASSWORD}"
  ssl_mode: "disable"
  max_open_conns: 25
  max_idle_conns: 5
  conn_max_lifetime: "5m"

cache:
  type: "redis"
  host: "localhost"
  port: 6379
  password: "${REDIS_PASSWORD}"
  db: 0
  ttl: "1h"

logging:
  level: "info"
  format: "json"
  output: "stdout"
  file: "logs/app.log"

monitoring:
  prometheus:
    enabled: true
    port: 9090
    path: "/metrics"
  
  jaeger:
    enabled: false
    endpoint: "http://localhost:14268/api/traces"
    service_name: "go-web-service"

security:
  jwt:
    secret_key: "${JWT_SECRET_KEY}"
    expiration: "24h"
    refresh_expiration: "168h"
  
  cors:
    allowed_origins: ["http://localhost:3000"]
    allowed_methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allowed_headers: ["*"]
    max_age: "12h"

rate_limiting:
  enabled: true
  requests_per_minute: 60
  burst: 10
```

### Environment Variables (`.env`)

```bash
# Application
APP_ENV=development
APP_DEBUG=true

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=web_service_db
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SSL_MODE=disable

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Security
JWT_SECRET_KEY=your_jwt_secret_key_here

# Monitoring
PROMETHEUS_ENABLED=true
JAEGER_ENABLED=false
```

## 🔧 Implementation

### Main Application

```go
// cmd/server/main.go
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"my-go-service/internal/api"
	"my-go-service/internal/config"
	"my-go-service/internal/database"
	"my-go-service/internal/cache"
	"my-go-service/internal/monitoring"
	"my-go-service/pkg/logger"
)

func main() {
	// Load configuration
	cfg, err := config.Load("configs/app.yaml")
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize logger
	log := logger.New(cfg.Logging)
	defer log.Sync()

	log.Info("Starting Go Web Service",
		zap.String("version", cfg.App.Version),
		zap.String("environment", cfg.App.Environment),
	)

	// Initialize database
	db, err := database.New(cfg.Database)
	if err != nil {
		log.Fatal("Failed to initialize database", zap.Error(err))
	}
	defer db.Close()

	// Run migrations
	if err := db.Migrate(); err != nil {
		log.Fatal("Failed to run migrations", zap.Error(err))
	}

	// Initialize cache
	cache, err := cache.New(cfg.Cache)
	if err != nil {
		log.Fatal("Failed to initialize cache", zap.Error(err))
	}
	defer cache.Close()

	// Initialize monitoring
	monitoring, err := monitoring.New(cfg.Monitoring)
	if err != nil {
		log.Fatal("Failed to initialize monitoring", zap.Error(err))
	}
	defer monitoring.Close()

	// Setup Gin
	if cfg.App.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Setup API routes
	api.SetupRouter(router, db, cache, monitoring, cfg, log)

	// Create HTTP server
	server := &http.Server{
		Addr:         fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port),
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  cfg.Server.IdleTimeout,
	}

	// Start server in goroutine
	go func() {
		log.Info("Starting HTTP server",
			zap.String("address", server.Addr),
		)

		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("Shutting down server...")

	// Create context with timeout for shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Shutdown server
	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown", zap.Error(err))
	}

	log.Info("Server exited")
}
```

### Configuration Management

```go
// internal/config/config.go
package config

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v2"
)

type Config struct {
	App        AppConfig        `yaml:"app"`
	Server     ServerConfig     `yaml:"server"`
	Database   DatabaseConfig   `yaml:"database"`
	Cache      CacheConfig      `yaml:"cache"`
	Logging    LoggingConfig    `yaml:"logging"`
	Monitoring MonitoringConfig `yaml:"monitoring"`
	Security   SecurityConfig   `yaml:"security"`
	RateLimit  RateLimitConfig  `yaml:"rate_limiting"`
}

type AppConfig struct {
	Name        string `yaml:"name"`
	Version     string `yaml:"version"`
	Environment string `yaml:"environment"`
	Debug       bool   `yaml:"debug"`
}

type ServerConfig struct {
	Host           string        `yaml:"host"`
	Port           int           `yaml:"port"`
	ReadTimeout    time.Duration `yaml:"read_timeout"`
	WriteTimeout   time.Duration `yaml:"write_timeout"`
	IdleTimeout    time.Duration `yaml:"idle_timeout"`
	MaxHeaderBytes int           `yaml:"max_header_bytes"`
}

type DatabaseConfig struct {
	Driver          string        `yaml:"driver"`
	Host            string        `yaml:"host"`
	Port            int           `yaml:"port"`
	Name            string        `yaml:"name"`
	User            string        `yaml:"user"`
	Password        string        `yaml:"password"`
	SSLMode         string        `yaml:"ssl_mode"`
	MaxOpenConns     int           `yaml:"max_open_conns"`
	MaxIdleConns     int           `yaml:"max_idle_conns"`
	ConnMaxLifetime  time.Duration `yaml:"conn_max_lifetime"`
}

type CacheConfig struct {
	Type     string `yaml:"type"`
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Password string `yaml:"password"`
	DB       int    `yaml:"db"`
	TTL      time.Duration `yaml:"ttl"`
}

type LoggingConfig struct {
	Level  string `yaml:"level"`
	Format string `yaml:"format"`
	Output string `yaml:"output"`
	File   string `yaml:"file"`
}

type MonitoringConfig struct {
	Prometheus PrometheusConfig `yaml:"prometheus"`
	Jaeger    JaegerConfig    `yaml:"jaeger"`
}

type PrometheusConfig struct {
	Enabled bool   `yaml:"enabled"`
	Port    int    `yaml:"port"`
	Path    string `yaml:"path"`
}

type JaegerConfig struct {
	Enabled     bool   `yaml:"enabled"`
	Endpoint    string `yaml:"endpoint"`
	ServiceName string `yaml:"service_name"`
}

type SecurityConfig struct {
	JWT  JWTConfig  `yaml:"jwt"`
	CORS CORSConfig `yaml:"cors"`
}

type JWTConfig struct {
	SecretKey         string        `yaml:"secret_key"`
	Expiration        time.Duration `yaml:"expiration"`
	RefreshExpiration time.Duration `yaml:"refresh_expiration"`
}

type CORSConfig struct {
	AllowedOrigins []string `yaml:"allowed_origins"`
	AllowedMethods []string `yaml:"allowed_methods"`
	AllowedHeaders []string `yaml:"allowed_headers"`
	MaxAge         string   `yaml:"max_age"`
}

type RateLimitConfig struct {
	Enabled            bool `yaml:"enabled"`
	RequestsPerMinute   int  `yaml:"requests_per_minute"`
	Burst              int  `yaml:"burst"`
}

func Load(configPath string) (*Config, error) {
	// Read YAML file
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	// Parse YAML
	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	// Replace environment variables
	if err := replaceEnvVars(&config); err != nil {
		return nil, fmt.Errorf("failed to replace environment variables: %w", err)
	}

	return &config, nil
}

func replaceEnvVars(config *Config) error {
	// Replace database password
	if config.Database.Password != "" && config.Database.Password[0] == '$' {
		envVar := config.Database.Password[1:] // Remove '$' prefix
		if value := os.Getenv(envVar); value != "" {
			config.Database.Password = value
		}
	}

	// Replace cache password
	if config.Cache.Password != "" && config.Cache.Password[0] == '$' {
		envVar := config.Cache.Password[1:]
		if value := os.Getenv(envVar); value != "" {
			config.Cache.Password = value
		}
	}

	// Replace JWT secret key
	if config.Security.JWT.SecretKey != "" && config.Security.JWT.SecretKey[0] == '$' {
		envVar := config.Security.JWT.SecretKey[1:]
		if value := os.Getenv(envVar); value != "" {
			config.Security.JWT.SecretKey = value
		}
	}

	return nil
}
```

### Database Layer

```go
// internal/database/database.go
package database

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
	"go.uber.org/zap"

	"my-go-service/internal/config"
	"my-go-service/internal/database/migrations"
)

type Database struct {
	db     *sql.DB
	config config.DatabaseConfig
	logger *zap.Logger
}

func New(cfg config.DatabaseConfig) (*Database, error) {
	// Build connection string
	connStr := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name, cfg.SSLMode,
	)

	// Open database connection
	db, err := sql.Open(cfg.Driver, connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(cfg.MaxOpenConns)
	db.SetMaxIdleConns(cfg.MaxIdleConns)
	db.SetConnMaxLifetime(cfg.ConnMaxLifetime)

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &Database{
		db:     db,
		config: cfg,
	}, nil
}

func (d *Database) Close() error {
	return d.db.Close()
}

func (d *Database) Migrate() error {
	migrator := migrations.New(d.db)
	return migrator.Up()
}

func (d *Database) GetDB() *sql.DB {
	return d.db
}

// Repository pattern example
type UserRepository struct {
	db *Database
}

func NewUserRepository(db *Database) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *User) error {
	query := `
		INSERT INTO users (name, email, password_hash, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	err := r.db.db.QueryRow(
		query,
		user.Name,
		user.Email,
		user.PasswordHash,
		time.Now(),
		time.Now(),
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (r *UserRepository) GetByID(id int64) (*User, error) {
	query := `
		SELECT id, name, email, password_hash, created_at, updated_at
		FROM users
		WHERE id = $1 AND deleted_at IS NULL
	`

	user := &User{}
	err := r.db.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

func (r *UserRepository) Update(user *User) error {
	query := `
		UPDATE users
		SET name = $2, email = $3, updated_at = $4
		WHERE id = $1 AND deleted_at IS NULL
	`

	user.UpdatedAt = time.Now()

	result, err := r.db.db.Exec(
		query,
		user.ID,
		user.Name,
		user.Email,
		user.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}

func (r *UserRepository) Delete(id int64) error {
	query := `
		UPDATE users
		SET deleted_at = $1
		WHERE id = $2 AND deleted_at IS NULL
	`

	result, err := r.db.db.Exec(query, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}
```

### API Handlers

```go
// internal/api/handlers/user_handler.go
package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"my-go-service/internal/api/validators"
	"my-go-service/internal/database"
	"my-go-service/internal/services"
	"my-go-service/pkg/response"
	"my-go-service/pkg/errors"
)

type UserHandler struct {
	userService *services.UserService
	logger      *zap.Logger
}

func NewUserHandler(userService *services.UserService, logger *zap.Logger) *UserHandler {
	return &UserHandler{
		userService: userService,
		logger:      logger,
	}
}

// CreateUser handles user creation
// @Summary Create a new user
// @Description Create a new user with the provided data
// @Tags users
// @Accept json
// @Produce json
// @Param user body validators.CreateUserRequest true "User data"
// @Success 201 {object} response.UserResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /api/v1/users [post]
func (h *UserHandler) CreateUser(c *gin.Context) {
	var req validators.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid request body", zap.Error(err))
		response.Error(c, http.StatusBadRequest, errors.ErrInvalidRequestBody)
		return
	}

	if err := req.Validate(); err != nil {
		h.logger.Error("Validation failed", zap.Error(err))
		response.Error(c, http.StatusBadRequest, err)
		return
	}

	user, err := h.userService.CreateUser(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to create user", zap.Error(err))
		response.Error(c, http.StatusInternalServerError, err)
		return
	}

	h.logger.Info("User created successfully", zap.Int64("user_id", user.ID))
	response.Success(c, http.StatusCreated, response.NewUserResponse(user))
}

// GetUser handles getting a user by ID
// @Summary Get user by ID
// @Description Get a user by their ID
// @Tags users
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} response.UserResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /api/v1/users/{id} [get]
func (h *UserHandler) GetUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.Error("Invalid user ID", zap.String("id", idStr), zap.Error(err))
		response.Error(c, http.StatusBadRequest, errors.ErrInvalidUserID)
		return
	}

	user, err := h.userService.GetUserByID(c.Request.Context(), id)
	if err != nil {
		if err == services.ErrUserNotFound {
			h.logger.Warn("User not found", zap.Int64("user_id", id))
			response.Error(c, http.StatusNotFound, err)
			return
		}

		h.logger.Error("Failed to get user", zap.Int64("user_id", id), zap.Error(err))
		response.Error(c, http.StatusInternalServerError, err)
		return
	}

	response.Success(c, http.StatusOK, response.NewUserResponse(user))
}

// UpdateUser handles updating a user
// @Summary Update user
// @Description Update a user with the provided data
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param user body validators.UpdateUserRequest true "User data"
// @Success 200 {object} response.UserResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /api/v1/users/{id} [put]
func (h *UserHandler) UpdateUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.Error("Invalid user ID", zap.String("id", idStr), zap.Error(err))
		response.Error(c, http.StatusBadRequest, errors.ErrInvalidUserID)
		return
	}

	var req validators.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid request body", zap.Error(err))
		response.Error(c, http.StatusBadRequest, errors.ErrInvalidRequestBody)
		return
	}

	if err := req.Validate(); err != nil {
		h.logger.Error("Validation failed", zap.Error(err))
		response.Error(c, http.StatusBadRequest, err)
		return
	}

	user, err := h.userService.UpdateUser(c.Request.Context(), id, &req)
	if err != nil {
		if err == services.ErrUserNotFound {
			h.logger.Warn("User not found", zap.Int64("user_id", id))
			response.Error(c, http.StatusNotFound, err)
			return
		}

		h.logger.Error("Failed to update user", zap.Int64("user_id", id), zap.Error(err))
		response.Error(c, http.StatusInternalServerError, err)
		return
	}

	h.logger.Info("User updated successfully", zap.Int64("user_id", user.ID))
	response.Success(c, http.StatusOK, response.NewUserResponse(user))
}

// DeleteUser handles deleting a user
// @Summary Delete user
// @Description Delete a user by their ID (soft delete)
// @Tags users
// @Param id path int true "User ID"
// @Success 204
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /api/v1/users/{id} [delete]
func (h *UserHandler) DeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.Error("Invalid user ID", zap.String("id", idStr), zap.Error(err))
		response.Error(c, http.StatusBadRequest, errors.ErrInvalidUserID)
		return
	}

	err = h.userService.DeleteUser(c.Request.Context(), id)
	if err != nil {
		if err == services.ErrUserNotFound {
			h.logger.Warn("User not found", zap.Int64("user_id", id))
			response.Error(c, http.StatusNotFound, err)
			return
		}

		h.logger.Error("Failed to delete user", zap.Int64("user_id", id), zap.Error(err))
		response.Error(c, http.StatusInternalServerError, err)
		return
	}

	h.logger.Info("User deleted successfully", zap.Int64("user_id", id))
	response.Success(c, http.StatusNoContent, nil)
}
```

## 🚀 Deployment

### Dockerfile

```dockerfile
# Multi-stage build
FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main cmd/server/main.go

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates tzdata

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

# Set working directory
WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/main .

# Copy configuration files
COPY --from=builder /app/configs ./configs

# Change ownership
RUN chown -R appuser:appuser /root

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run application
CMD ["./main"]
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
      - APP_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=web_service_db
      - DB_USER=postgres
      - DB_PASSWORD=postgres_password
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET_KEY=your_jwt_secret_key
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
      - POSTGRES_PASSWORD=postgres_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
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

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## 📊 Monitoring

### Prometheus Metrics

```go
// internal/monitoring/prometheus.go
package monitoring

import (
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type PrometheusMetrics struct {
	requestsTotal    *prometheus.CounterVec
	requestDuration  *prometheus.HistogramVec
	activeConnections prometheus.Gauge
	dbConnections    prometheus.Gauge
	cacheHits        *prometheus.CounterVec
	cacheMisses      *prometheus.CounterVec
}

func NewPrometheusMetrics() *PrometheusMetrics {
	return &PrometheusMetrics{
		requestsTotal: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "http_requests_total",
				Help: "Total number of HTTP requests",
			},
			[]string{"method", "endpoint", "status"},
		),
		requestDuration: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "http_request_duration_seconds",
				Help:    "HTTP request duration in seconds",
				Buckets: prometheus.DefBuckets,
			},
			[]string{"method", "endpoint"},
		),
		activeConnections: prometheus.NewGauge(
			prometheus.GaugeOpts{
				Name: "active_connections",
				Help: "Number of active connections",
			},
		),
		dbConnections: prometheus.NewGauge(
			prometheus.GaugeOpts{
				Name: "database_connections",
				Help: "Number of database connections",
			},
		),
		cacheHits: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "cache_hits_total",
				Help: "Total number of cache hits",
			},
			[]string{"cache_type"},
		),
		cacheMisses: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "cache_misses_total",
				Help: "Total number of cache misses",
			},
			[]string{"cache_type"},
		),
	}
}

func (m *PrometheusMetrics) Register() {
	prometheus.MustRegister(
		m.requestsTotal,
		m.requestDuration,
		m.activeConnections,
		m.dbConnections,
		m.cacheHits,
		m.cacheMisses,
	)
}

func (m *PrometheusMetrics) Handler() http.Handler {
	return promhttp.Handler()
}

func (m *PrometheusMetrics) RecordRequest(method, endpoint, status string, duration time.Duration) {
	m.requestsTotal.WithLabelValues(method, endpoint, status).Inc()
	m.requestDuration.WithLabelValues(method, endpoint).Observe(duration.Seconds())
}

func (m *PrometheusMetrics) SetActiveConnections(count int) {
	m.activeConnections.Set(float64(count))
}

func (m *PrometheusMetrics) SetDBConnections(count int) {
	m.dbConnections.Set(float64(count))
}

func (m *PrometheusMetrics) RecordCacheHit(cacheType string) {
	m.cacheHits.WithLabelValues(cacheType).Inc()
}

func (m *PrometheusMetrics) RecordCacheMiss(cacheType string) {
	m.cacheMisses.WithLabelValues(cacheType).Inc()
}
```

## 🧪 Testing

### Unit Tests

```go
// tests/unit/user_service_test.go
package unit

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.uber.org/zap/zaptest"

	"my-go-service/internal/api/validators"
	"my-go-service/internal/services"
	"my-go-service/pkg/errors"
)

// Mock repository
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) Create(user *database.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserRepository) GetByID(id int64) (*database.User, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*database.User), args.Error(1)
}

func TestUserService_CreateUser(t *testing.T) {
	logger := zaptest.NewLogger(t)
	mockRepo := new(MockUserRepository)
	service := services.NewUserService(mockRepo, logger)

	tests := []struct {
		name    string
		request *validators.CreateUserRequest
		mock    func()
		want    *database.User
		wantErr error
	}{
		{
			name: "success",
			request: &validators.CreateUserRequest{
				Name:     "John Doe",
				Email:    "john@example.com",
				Password: "password123",
			},
			mock: func() {
				mockRepo.On("Create", mock.AnythingOfType("*database.User")).Return(nil)
			},
			want: &database.User{
				Name:  "John Doe",
				Email: "john@example.com",
			},
			wantErr: nil,
		},
		{
			name: "duplicate email",
			request: &validators.CreateUserRequest{
				Name:     "John Doe",
				Email:    "john@example.com",
				Password: "password123",
			},
			mock: func() {
				mockRepo.On("Create", mock.AnythingOfType("*database.User")).Return(errors.ErrDuplicateEmail)
			},
			want:    nil,
			wantErr: errors.ErrDuplicateEmail,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mock()

			got, err := service.CreateUser(context.Background(), tt.request)

			if tt.wantErr != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.wantErr, err)
				assert.Nil(t, got)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, got)
				assert.Equal(t, tt.want.Name, got.Name)
				assert.Equal(t, tt.want.Email, got.Email)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}
```

## 🔒 Security Considerations

- ✅ **Input Validation**: Comprehensive request validation and sanitization
- ✅ **Authentication**: JWT-based authentication with proper token validation
- ✅ **Authorization**: Role-based access control
- ✅ **Password Security**: Proper password hashing with bcrypt
- ✅ **SQL Injection**: Parameterized queries and prepared statements
- ✅ **CORS**: Proper CORS configuration
- ✅ **Rate Limiting**: Request rate limiting to prevent abuse
- ✅ **HTTPS**: Enforce HTTPS in production

## 📚 Best Practices

1. **Clean Architecture**: Separate concerns with clear layer boundaries
2. **Dependency Injection**: Use constructor injection for testability
3. **Error Handling**: Comprehensive error handling with proper HTTP status codes
4. **Logging**: Structured logging with correlation IDs
5. **Testing**: Comprehensive unit and integration tests
6. **Performance**: Connection pooling, caching, and efficient queries
7. **Security**: Follow security best practices and regular updates
8. **Monitoring**: Comprehensive metrics and health checks

---

**Template Version**: 1.0.0  
**Last Updated**: 2026-02-17  
**Compatible**: Go 1.21+, Gin 1.9+, PostgreSQL 15+  
**License**: MIT