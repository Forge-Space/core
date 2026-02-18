# Spring Boot Web Service Template

A comprehensive Spring Boot web service template with best practices for building robust, scalable, and maintainable Java applications.

## 🎯 Overview

This template provides a complete structure for Spring Boot web services including:

- Modern Spring Boot 3.x with Java 17+
- RESTful API with Spring MVC
- Data access with Spring Data JPA
- Security with Spring Security
- Configuration management
- Comprehensive testing framework
- Docker deployment and orchestration
- Performance monitoring and metrics
- CI/CD integration patterns

## 📁 Project Structure

```
spring-boot-web/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/myapp/
│   │   │       ├── MyApplication.java          # Application entry point
│   │   │       ├── config/                     # Configuration classes
│   │   │       │   ├── DatabaseConfig.java
│   │   │       │   ├── SecurityConfig.java
│   │   │       │   ├── WebConfig.java
│   │   │       │   └── properties/
│   │   │       ├── controller/                 # REST controllers
│   │   │       │   ├── UserController.java
│   │   │       │   ├── HealthController.java
│   │   │       │   └── dto/                     # Data transfer objects
│   │   │       ├── service/                    # Business logic services
│   │   │       │   ├── UserService.java
│   │   │       │   └── impl/
│   │   │       ├── repository/                 # Data access layer
│   │   │       │   ├── UserRepository.java
│   │   │       │   └── custom/
│   │   │       ├── model/                      # Domain models
│   │   │       │   ├── User.java
│   │   │       │   ├── BaseEntity.java
│   │   │       │   └── enums/
│   │   │       ├── exception/                  # Custom exceptions
│   │   │       │   ├── GlobalExceptionHandler.java
│   │   │       │   └── ResourceNotFoundException.java
│   │   │       ├── util/                       # Utility classes
│   │   │       │   ├── ValidationUtils.java
│   │   │       │   └── SecurityUtils.java
│   │   │       └── constant/                   # Application constants
│   │   └── resources/
│   │       ├── application.yml                  # Application configuration
│   │       ├── application-dev.yml             # Development configuration
│   │       ├── application-prod.yml            # Production configuration
│   │       ├── db/migration/                    # Flyway migrations
│   │       ├── static/                          # Static resources
│   │       └── templates/                       # Template files
│   └── test/
│       └── java/
│           └── com/example/myapp/
│               ├── controller/                  # Controller tests
│               ├── service/                     # Service tests
│               ├── repository/                  # Repository tests
│               └── integration/                 # Integration tests
├── docker/                                       # Docker files
├── scripts/                                      # Utility scripts
├── docs/                                         # Documentation
├── pom.xml                                       # Maven configuration
├── Dockerfile                                    # Docker configuration
├── docker-compose.yml                            # Docker Compose
└── README.md                                     # This file
```

## 🚀 Quick Start

### Bootstrap Spring Boot Web Service

```bash
# Create new Spring Boot web service
./scripts/bootstrap/project.sh --template=java-spring-boot-web --name=my-java-service

# Navigate to project
cd my-java-service

# Install dependencies
mvn clean install

# Run development server
mvn spring-boot:run

# Run tests
mvn test

# Build for production
mvn clean package -Pprod
```

### Development Workflow

```bash
# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run with hot reload (requires Spring DevTools)
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.devtools.restart.enabled=true"

# Run database migrations
mvn flyway:migrate

# Generate API documentation
mvn spring-boot:run -Dspring-boot.run.arguments="--springdoc.api-docs.enabled=true"

# Run with Docker
docker-compose up --build

# Run tests with coverage
mvn clean test jacoco:report
```

## 📋 Configuration

### Application Configuration (`src/main/resources/application.yml`)

```yaml
spring:
  application:
    name: my-java-service
  profiles:
    active: dev
  
  # Database configuration
  datasource:
    url: jdbc:postgresql://localhost:5432/my_java_service
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:password}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 25
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  
  # JPA configuration
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        use_sql_comments: true
  
  # Flyway migrations
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
  
  # Redis configuration
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 0
  
  # Security configuration
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${JWT_ISSUER_URI:http://localhost:8080}
  
  # Actuator configuration
  actuator:
    endpoints:
      web:
        exposure:
          include: health,info,metrics,prometheus
    endpoint:
      health:
        show-details: when-authorized
    metrics:
      export:
        prometheus:
          enabled: true

# Server configuration
server:
  port: ${SERVER_PORT:8080}
  servlet:
    context-path: /api
  compression:
    enabled: true
  http2:
    enabled: true
  error:
    include-message: always
    include-binding-errors: always

# Logging configuration
logging:
  level:
    com.example.myapp: DEBUG
    org.springframework.web: INFO
    org.springframework.security: INFO
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

# Application-specific configuration
app:
  name: My Java Service
  version: 1.0.0
  description: A comprehensive Spring Boot web service
  
  # JWT configuration
  jwt:
    secret: ${JWT_SECRET:my-secret-key}
    expiration: 86400000  # 24 hours
    refresh-expiration: 604800000  # 7 days
  
  # CORS configuration
  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:8080}
    allowed-methods: GET,POST,PUT,DELETE,OPTIONS
    allowed-headers: "*"
    allow-credentials: true
    max-age: 3600
  
  # Rate limiting
  rate-limit:
    requests-per-minute: 60
    burst-capacity: 10
  
  # File upload
  file-upload:
    max-size: 10MB
    allowed-types: jpg,jpeg,png,pdf,doc,docx
    upload-dir: ${FILE_UPLOAD_DIR:./uploads}
```

### Development Configuration (`src/main/resources/application-dev.yml`)

```yaml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  
  devtools:
    restart:
      enabled: true
    livereload:
      enabled: true

logging:
  level:
    com.example.myapp: DEBUG
    org.springframework.web: DEBUG
    org.springframework.security: DEBUG

app:
  jwt:
    secret: dev-secret-key-change-in-production
```

### Production Configuration (`src/main/resources/application-prod.yml`)

```yaml
spring:
  jpa:
    show-sql: false
  
  devtools:
    restart:
      enabled: false
    livereload:
      enabled: false

logging:
  level:
    com.example.myapp: INFO
    org.springframework.web: WARN
    org.springframework.security: WARN
  file:
    name: logs/my-java-service.log
```

## 🔧 Implementation

### Main Application

```java
// src/main/java/com/example/myapp/MyApplication.java
package com.example.myapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableAsync
@EnableScheduling
public class MyApplication {

    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
```

### User Entity

```java
// src/main/java/com/example/myapp/model/User.java
package com.example.myapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @Column(nullable = false)
    @NotBlank(message = "Password is required")
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(nullable = false)
    private boolean emailVerified = false;

    // Constructors
    public User() {}

    public User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
}
```

### Base Entity

```java
// src/main/java/com/example/myapp/model/BaseEntity.java
package com.example.myapp.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    // Getters and setters
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
```

### User Repository

```java
// src/main/java/com/example/myapp/repository/UserRepository.java
package com.example.myapp.repository;

import com.example.myapp.model.User;
import com.example.myapp.model.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.status = :status")
    Page<User> findByStatus(@Param("status") UserStatus status, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.emailVerified = :verified")
    Page<User> findByEmailVerified(@Param("verified") boolean verified, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.createdAt >= :date")
    Page<User> findByCreatedAtAfter(@Param("date") LocalDateTime date, Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u WHERE u.status = :status")
    long countByStatus(@Param("status") UserStatus status);
}
```

### User Service

```java
// src/main/java/com/example/myapp/service/UserService.java
package com.example.myapp.service;

import com.example.myapp.dto.CreateUserRequest;
import com.example.myapp.dto.UpdateUserRequest;
import com.example.myapp.dto.UserResponse;
import com.example.myapp.exception.ResourceNotFoundException;
import com.example.myapp.exception.UserAlreadyExistsException;
import com.example.myapp.model.User;
import com.example.myapp.model.UserStatus;
import com.example.myapp.repository.UserRepository;
import com.example.myapp.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Cacheable(value = "users", key = "#id")
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        log.debug("Retrieved user: {}", user.getEmail());
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(UserResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getUsersByStatus(UserStatus status, Pageable pageable) {
        return userRepository.findByStatus(status, pageable)
                .map(UserResponse::from);
    }

    public UserResponse createUser(CreateUserRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User with email " + request.getEmail() + " already exists");
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);
        
        log.info("Created new user: {}", savedUser.getEmail());
        return UserResponse.from(savedUser);
    }

    @CacheEvict(value = "users", key = "#id")
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Update fields
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            // Check if new email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new UserAlreadyExistsException("User with email " + request.getEmail() + " already exists");
            }
            user.setEmail(request.getEmail());
            user.setEmailVerified(false); // Require re-verification
        }

        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        User updatedUser = userRepository.save(user);
        
        log.info("Updated user: {}", updatedUser.getEmail());
        return UserResponse.from(updatedUser);
    }

    @CacheEvict(value = "users", key = "#id")
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }

        userRepository.deleteById(id);
        log.info("Deleted user with id: {}", id);
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional(readOnly = true)
    public long getTotalUserCount() {
        return userRepository.count();
    }

    @Transactional(readOnly = true)
    public long getUserCountByStatus(UserStatus status) {
        return userRepository.countByStatus(status);
    }
}
```

### User Controller

```java
// src/main/java/com/example/myapp/controller/UserController.java
package com.example.myapp.controller;

import com.example.myapp.dto.CreateUserRequest;
import com.example.myapp.dto.UpdateUserRequest;
import com.example.myapp.dto.UserResponse;
import com.example.myapp.model.UserStatus;
import com.example.myapp.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Management", description = "API for managing users")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieve a paginated list of all users")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('users:read')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @Parameter(description = "Page number (0-based)") 
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") 
            @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") 
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") 
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<UserResponse> users = userService.getAllUsers(pageable);
        
        log.debug("Retrieved {} users", users.getTotalElements());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve a specific user by their ID")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('users:read')")
    public ResponseEntity<UserResponse> getUserById(
            @Parameter(description = "User ID") 
            @PathVariable UUID id) {
        
        UserResponse user = userService.getUserById(id);
        
        log.debug("Retrieved user: {}", user.getEmail());
        return ResponseEntity.ok(user);
    }

    @PostMapping
    @Operation(summary = "Create user", description = "Create a new user")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('users:create')")
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        
        UserResponse user = userService.createUser(request);
        
        log.info("Created new user: {}", user.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user", description = "Update an existing user")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('users:update')")
    @CacheEvict(value = "users", key = "#id")
    public ResponseEntity<UserResponse> updateUser(
            @Parameter(description = "User ID") 
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request) {
        
        UserResponse user = userService.updateUser(id, request);
        
        log.info("Updated user: {}", user.getEmail());
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user", description = "Delete a user by their ID")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('users:delete')")
    @CacheEvict(value = "users", key = "#id")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "User ID") 
            @PathVariable UUID id) {
        
        userService.deleteUser(id);
        
        log.info("Deleted user with ID: {}", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get users by status", description = "Retrieve users filtered by status")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('users:read')")
    public ResponseEntity<Page<UserResponse>> getUsersByStatus(
            @Parameter(description = "User status") 
            @PathVariable UserStatus status,
            @Parameter(description = "Page number (0-based)") 
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") 
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<UserResponse> users = userService.getUsersByStatus(status, pageable);
        
        log.debug("Retrieved {} users with status: {}", users.getTotalElements(), status);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/count")
    @Operation(summary = "Get user count", description = "Get the total number of users")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('users:read')")
    public ResponseEntity<Long> getUserCount() {
        long count = userService.getTotalUserCount();
        
        log.debug("Total user count: {}", count);
        return ResponseEntity.ok(count);
    }
}
```

## 🚀 Deployment

### Dockerfile

```dockerfile
# Multi-stage build
FROM maven:3.9.4-eclipse-temurin-17 AS builder

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 appuser && \
    adduser -u 1001 -G appuser -s /bin/sh -D appuser

# Set working directory
WORKDIR /app

# Copy jar from builder
COPY --from=builder /app/target/*.jar app.jar

# Change ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/actuator/health || exit 1

# JVM options
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:+UseContainerSupport"

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
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
      - SPRING_PROFILES_ACTIVE=prod
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres_password
      - REDIS_HOST=redis
      - JWT_SECRET=your_jwt_secret_key_here
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=my_java_service
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass redis_password
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

## 🧪 Testing

### Unit Test Example

```java
// src/test/java/com/example/myapp/service/UserServiceTest.java
package com.example.myapp.service;

import com.example.myapp.dto.CreateUserRequest;
import com.example.myapp.exception.UserAlreadyExistsException;
import com.example.myapp.model.User;
import com.example.myapp.model.UserStatus;
import com.example.myapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setStatus(UserStatus.ACTIVE);
    }

    @Test
    void createUser_ShouldReturnUserResponse_WhenValidRequest() {
        // Given
        CreateUserRequest request = new CreateUserRequest();
        request.setName("New User");
        request.setEmail("new@example.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        var result = userService.createUser(request);

        // Then
        assertThat(result.getName()).isEqualTo("Test User");
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        verify(userRepository).existsByEmail("new@example.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_ShouldThrowException_WhenEmailAlreadyExists() {
        // Given
        CreateUserRequest request = new CreateUserRequest();
        request.setName("New User");
        request.setEmail("existing@example.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessage("User with email existing@example.com already exists");

        verify(userRepository).existsByEmail("existing@example.com");
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getUserById_ShouldReturnUserResponse_WhenUserExists() {
        // Given
        UUID userId = testUser.getId();
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // When
        var result = userService.getUserById(userId);

        // Then
        assertThat(result.getName()).isEqualTo("Test User");
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        verify(userRepository).findById(userId);
    }
}
```

## 🔒 Security Considerations

- ✅ **Authentication**: JWT-based authentication with Spring Security
- ✅ **Authorization**: Method-level security with @PreAuthorize
- ✅ **Password Security**: BCrypt password hashing
- ✅ **Input Validation**: Comprehensive validation with Jakarta Validation
- ✅ **SQL Injection**: Parameterized queries with JPA
- ✅ **CORS**: Proper CORS configuration
- ✅ **Rate Limiting**: Request rate limiting to prevent abuse
- ✅ **HTTPS**: Enforce HTTPS in production
- ✅ **Security Headers**: Security headers configuration

## 📚 Best Practices

1. **Layered Architecture**: Clear separation of concerns
2. **Dependency Injection**: Spring's IoC container
3. **Configuration Management**: Externalized configuration
4. **Error Handling**: Global exception handling
5. **Logging**: Structured logging with appropriate levels
6. **Testing**: Comprehensive unit and integration tests
7. **Performance**: Caching, connection pooling, async processing
8. **Documentation**: OpenAPI/Swagger documentation
9. **Monitoring**: Actuator endpoints and metrics
10. **Security**: Defense in depth security approach

---

**Template Version**: 1.0.0  
**Last Updated**: 2026-02-17  
**Compatible**: Java 17+, Spring Boot 3.x, Maven 3.8+  
**License**: MIT