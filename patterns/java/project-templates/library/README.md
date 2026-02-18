# Java Library Template

A comprehensive Java library template with best practices for building robust, maintainable, and reusable Java components using modern Java ecosystem.

## 🎯 Overview

This template provides a complete structure for Java libraries including:

- Modern Java 17+ with latest language features
- Comprehensive build configuration with Maven
- Extensive testing framework with JUnit 5
- API documentation with JavaDoc
- Performance benchmarking with JMH
- Cross-platform compatibility
- Dependency management and versioning
- Continuous integration patterns
- Security best practices
- Publishing and distribution

## 📁 Project Structure

```
java-library/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/mylib/
│   │   │       ├── MyLibrary.java              # Library entry point
│   │   │       ├── config/                     # Configuration classes
│   │   │       │   ├── LibraryConfig.java
│   │   │       │   └── properties/
│   │   │       ├── service/                    # Business logic services
│   │   │       │   ├── CoreService.java
│   │   │       │   ├── ProcessingService.java
│   │   │       │   └── impl/
│   │   │       ├── model/                      # Data models
│   │   │       │   ├── Item.java
│   │   │       │   ├── Result.java
│   │   │       │   ├── Request.java
│   │   │       │   └── Response.java
│   │   │       ├── exception/                  # Custom exceptions
│   │   │       │   ├── LibraryException.java
│   │   │       │   ├── ValidationException.java
│   │   │       │   └── ProcessingException.java
│   │   │       ├── util/                       # Utility classes
│   │   │       │   ├── ValidationUtils.java
│   │   │       │   ├── SerializationUtils.java
│   │   │       │   └── CollectionUtils.java
│   │   │       ├── constant/                   # Application constants
│   │   │       │   └── LibraryConstants.java
│   │   │       └── annotation/                 # Custom annotations
│   │   │           ├── Beta.java
│   │   │           └── Experimental.java
│   │   └── resources/
│   │       ├── META-INF/
│   │       │   └── services/                   # Service provider configurations
│   │       └── library-defaults.yml            # Default configuration
│   └── test/
│       └── java/
│           └── com/example/mylib/
│               ├── service/                     # Service tests
│               ├── model/                       # Model tests
│               ├── util/                        # Utility tests
│               ├── integration/                 # Integration tests
│               └── performance/                 # Performance tests
├── benchmarks/                                  # JMH benchmarks
│   └── com/example/mylib/
│       ├── CoreServiceBenchmark.java
│       └── SerializationBenchmark.java
├── examples/                                    # Usage examples
│   ├── basic-usage/
│   ├── advanced-usage/
│   └── spring-integration/
├── docs/                                        # Additional documentation
│   ├── getting-started.md
│   ├── api-reference.md
│   ├── migration-guide.md
│   └── performance-guide.md
├── scripts/                                     # Utility scripts
│   ├── build.sh
│   ├── test.sh
│   ├── benchmark.sh
│   └── publish.sh
├── pom.xml                                      # Maven configuration
├── README.md                                    # This file
├── LICENSE                                      # License file
├── CHANGELOG.md                                 # Changelog
├── CONTRIBUTING.md                             # Contribution guidelines
└── .github/                                     # GitHub workflows
    ├── workflows/
    │   ├── ci.yml
    │   ├── release.yml
    │   └── security.yml
    └── ISSUE_TEMPLATE/
        ├── bug_report.md
        └── feature_request.md
```

## 🚀 Quick Start

### Prerequisites

- Java 17 or higher
- Maven 3.8.0 or higher
- Git

### Create New Library

```bash
# Clone the template
git clone https://github.com/LucasSantana-Dev/forge-patterns.git
cp -r forge-patterns/patterns/java/project-templates/library my-java-library
cd my-java-library

# Update project information
sed -i 's/com.example.mylib/com.yourorg.yourlib/g' pom.xml
find . -name '*.java' -type f -exec sed -i 's/com.example.mylib/com.yourorg.yourlib/g' {} +
```

### Build and Test

```bash
# Clean and compile
mvn clean compile

# Run tests
mvn test

# Run tests with coverage
mvn jacoco:report

# Run benchmarks
mvn exec:java -Dexec.mainClass="org.openjdk.jmh.Main" -Dexec.args=".*"

# Build JAR
mvn package

# Install to local repository
mvn install
```

### Use in Your Project

```xml
<dependency>
    <groupId>com.yourorg</groupId>
    <artifactId>yourlib</artifactId>
    <version>1.0.0</version>
</dependency>
```

## ⚙️ Configuration

### Maven Configuration (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example.mylib</groupId>
    <artifactId>my-library</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>My Library</name>
    <description>A comprehensive Java library template</description>
    <url>https://github.com/example/my-library</url>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        
        <!-- Dependency versions -->
        <junit.version>5.10.0</junit.version>
        <mockito.version>5.5.0</mockito.version>
        <jackson.version>2.15.2</jackson.version>
        <slf4j.version>2.0.7</slf4j.version>
        <jmh.version>1.37</jmh.version>
        <jacoco.version>0.8.10</jacoco.version>
        <spotbugs.version>4.7.3.6</spotbugs.version>
        <checkstyle.version>10.12.0</checkstyle.version>
    </properties>

    <dependencies>
        <!-- Core dependencies -->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>${slf4j.version}</version>
        </dependency>
        
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-core</artifactId>
            <version>${jackson.version}</version>
        </dependency>
        
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>${jackson.version}</version>
        </dependency>

        <!-- Test dependencies -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>${junit.version}</version>
            <scope>test</scope>
        </dependency>
        
        <dependency>
            <groupId>org.mockito</groupId>
            <artifactId>mockito-core</artifactId>
            <version>${mockito.version}</version>
            <scope>test</scope>
        </dependency>
        
        <dependency>
            <groupId>org.mockito</groupId>
            <artifactId>mockito-junit-jupiter</artifactId>
            <version>${mockito.version}</version>
            <scope>test</scope>
        </dependency>

        <!-- Benchmark dependencies -->
        <dependency>
            <groupId>org.openjdk.jmh</groupId>
            <artifactId>jmh-core</artifactId>
            <version>${jmh.version}</version>
            <scope>test</scope>
        </dependency>
        
        <dependency>
            <groupId>org.openjdk.jmh</groupId>
            <artifactId>jmh-generator-annprocess</artifactId>
            <version>${jmh.version}</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Maven Compiler Plugin -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>17</source>
                    <target>17</target>
                    <encoding>UTF-8</encoding>
                </configuration>
            </plugin>

            <!-- Maven Surefire Plugin for tests -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.1.2</version>
                <configuration>
                    <includes>
                        <include>**/*Test.java</include>
                        <include>**/*Tests.java</include>
                    </includes>
                </configuration>
            </plugin>

            <!-- JaCoCo for code coverage -->
            <plugin>
                <groupId>org.jacoco</groupId>
                <artifactId>jacoco-maven-plugin</artifactId>
                <version>${jacoco.version}</version>
                <executions>
                    <execution>
                        <goals>
                            <goal>prepare-agent</goal>
                        </goals>
                    </execution>
                    <execution>
                        <id>report</id>
                        <phase>test</phase>
                        <goals>
                            <goal>report</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>

            <!-- SpotBugs for static analysis -->
            <plugin>
                <groupId>com.github.spotbugs</groupId>
                <artifactId>spotbugs-maven-plugin</artifactId>
                <version>${spotbugs.version}</version>
                <configuration>
                    <effort>Max</effort>
                    <threshold>Low</threshold>
                </configuration>
            </plugin>

            <!-- Checkstyle for code style -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-checkstyle-plugin</artifactId>
                <version>${checkstyle.version}</version>
                <configuration>
                    <configLocation>checkstyle.xml</configLocation>
                    <encoding>UTF-8</encoding>
                    <consoleOutput>true</consoleOutput>
                    <failsOnError>true</failsOnError>
                </configuration>
            </plugin>

            <!-- JMH Benchmark Plugin -->
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>exec-maven-plugin</artifactId>
                <version>3.1.0</version>
                <executions>
                    <execution>
                        <id>run-benchmarks</id>
                        <phase>integration-test</phase>
                        <goals>
                            <goal>exec</goal>
                        </goals>
                        <configuration>
                            <classpathScope>test</classpathScope>
                            <executable>java</executable>
                            <arguments>
                                <argument>-classpath</argument>
                                <classpath/>
                                <argument>org.openjdk.jmh.Main</argument>
                                <argument>.*</argument>
                            </arguments>
                        </configuration>
                    </execution>
                </executions>
            </plugin>

            <!-- Maven Source Plugin -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-source-plugin</artifactId>
                <version>3.3.0</version>
                <executions>
                    <execution>
                        <id>attach-sources</id>
                        <goals>
                            <goal>jar</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>

            <!-- Maven Javadoc Plugin -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-javadoc-plugin</artifactId>
                <version>3.5.0</version>
                <executions>
                    <execution>
                        <id>attach-javadocs</id>
                        <goals>
                            <goal>jar</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>

            <!-- Maven JAR Plugin -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.3.0</version>
                <configuration>
                    <archive>
                        <manifestEntries>
                            <Automatic-Module-Name>com.example.mylib</Automatic-Module-Name>
                        </manifestEntries>
                    </archive>
                </configuration>
            </plugin>
        </plugins>
    </build>

    <profiles>
        <!-- Development profile -->
        <profile>
            <id>dev</id>
            <properties>
                <maven.test.skip>false</maven.test.skip>
            </properties>
        </profile>

        <!-- Release profile -->
        <profile>
            <id>release</id>
            <build>
                <plugins>
                    <plugin>
                        <groupId>org.apache.maven.plugins</groupId>
                        <artifactId>maven-gpg-plugin</artifactId>
                        <version>3.1.0</version>
                        <executions>
                            <execution>
                                <id>sign-artifacts</id>
                                <phase>verify</phase>
                                <goals>
                                    <goal>sign</goal>
                                </goals>
                            </execution>
                        </executions>
                    </plugin>
                </plugins>
            </build>
        </profile>
    </profiles>

    <developers>
        <developer>
            <name>Your Name</name>
            <email>your.email@example.com</email>
            <organization>Your Organization</organization>
        </developer>
    </developers>

    <licenses>
        <license>
            <name>MIT License</name>
            <url>https://opensource.org/licenses/MIT</url>
        </license>
    </licenses>

    <scm>
        <connection>scm:git:git://github.com/example/my-library.git</connection>
        <developerConnection>scm:git:ssh://github.com:example/my-library.git</developerConnection>
        <url>https://github.com/example/my-library/tree/main</url>
    </scm>
</project>
```

### Library Configuration

```java
// src/main/java/com/example/mylib/config/LibraryConfig.java
package com.example.mylib.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;

/**
 * Configuration for the library behavior and settings.
 */
@JsonDeserialize(builder = LibraryConfig.Builder.class)
public class LibraryConfig {
    
    @JsonProperty("timeout")
    private final long timeoutMs;
    
    @JsonProperty("maxRetries")
    private final int maxRetries;
    
    @JsonProperty("enableCache")
    private final boolean enableCache;
    
    @JsonProperty("cacheSize")
    private final int cacheSize;
    
    @JsonProperty("logLevel")
    private final String logLevel;

    private LibraryConfig(Builder builder) {
        this.timeoutMs = builder.timeoutMs;
        this.maxRetries = builder.maxRetries;
        this.enableCache = builder.enableCache;
        this.cacheSize = builder.cacheSize;
        this.logLevel = builder.logLevel;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static LibraryConfig defaultConfig() {
        return builder().build();
    }

    // Getters
    public long getTimeoutMs() { return timeoutMs; }
    public int getMaxRetries() { return maxRetries; }
    public boolean isEnableCache() { return enableCache; }
    public int getCacheSize() { return cacheSize; }
    public String getLogLevel() { return logLevel; }

    @JsonPOJOBuilder(withPrefix = "")
    public static class Builder {
        private long timeoutMs = 30000;
        private int maxRetries = 3;
        private boolean enableCache = true;
        private int cacheSize = 1000;
        private String logLevel = "INFO";

        public Builder timeoutMs(long timeoutMs) {
            this.timeoutMs = timeoutMs;
            return this;
        }

        public Builder maxRetries(int maxRetries) {
            this.maxRetries = maxRetries;
            return this;
        }

        public Builder enableCache(boolean enableCache) {
            this.enableCache = enableCache;
            return this;
        }

        public Builder cacheSize(int cacheSize) {
            this.cacheSize = cacheSize;
            return this;
        }

        public Builder logLevel(String logLevel) {
            this.logLevel = logLevel;
            return this;
        }

        public LibraryConfig build() {
            return new LibraryConfig(this);
        }
    }
}
```

## 🔧 Implementation

### Library Entry Point

```java
// src/main/java/com/example/mylib/MyLibrary.java
package com.example.mylib;

import com.example.mylib.config.LibraryConfig;
import com.example.mylib.service.CoreService;
import com.example.mylib.service.ProcessingService;
import com.example.mylib.exception.LibraryException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Main entry point for the library.
 * 
 * <p>This class provides the primary API for interacting with the library.
 * It manages configuration and coordinates between different services.</p>
 * 
 * <p>Example usage:</p>
 * <pre>{@code
 * MyLibrary library = MyLibrary.builder()
 *     .config(LibraryConfig.defaultConfig())
 *     .build();
 * 
 * Result result = library.process(request);
 * }</pre>
 */
public class MyLibrary {
    
    private static final Logger logger = LoggerFactory.getLogger(MyLibrary.class);
    
    private final LibraryConfig config;
    private final CoreService coreService;
    private final ProcessingService processingService;
    
    private MyLibrary(Builder builder) {
        this.config = builder.config;
        this.coreService = new CoreService(config);
        this.processingService = new ProcessingService(config);
        
        logger.info("MyLibrary initialized with config: {}", config);
    }

    /**
     * Creates a new builder for constructing MyLibrary instances.
     * 
     * @return a new Builder instance
     */
    public static Builder builder() {
        return new Builder();
    }

    /**
     * Processes the given request and returns a result.
     * 
     * @param request the request to process
     * @return the processing result
     * @throws LibraryException if processing fails
     * @throws IllegalArgumentException if request is null
     */
    public Result process(Request request) {
        if (request == null) {
            throw new IllegalArgumentException("Request cannot be null");
        }
        
        logger.debug("Processing request: {}", request.getId());
        
        try {
            // Validate request
            coreService.validateRequest(request);
            
            // Process the request
            Result result = processingService.process(request);
            
            logger.debug("Request processed successfully: {}", result.getId());
            return result;
            
        } catch (Exception e) {
            logger.error("Failed to process request: {}", request.getId(), e);
            throw new LibraryException("Processing failed", e);
        }
    }

    /**
     * Gets the current configuration.
     * 
     * @return the library configuration
     */
    public LibraryConfig getConfig() {
        return config;
    }

    /**
     * Builder for MyLibrary instances.
     */
    public static class Builder {
        private LibraryConfig config = LibraryConfig.defaultConfig();

        /**
         * Sets the library configuration.
         * 
         * @param config the configuration to use
         * @return this builder instance
         */
        public Builder config(LibraryConfig config) {
            this.config = config != null ? config : LibraryConfig.defaultConfig();
            return this;
        }

        /**
         * Builds a new MyLibrary instance.
         * 
         * @return a new MyLibrary instance
         */
        public MyLibrary build() {
            return new MyLibrary(this);
        }
    }
}
```

### Core Service Implementation

```java
// src/main/java/com/example/mylib/service/CoreService.java
package com.example.mylib.service;

import com.example.mylib.config.LibraryConfig;
import com.example.mylib.model.Request;
import com.example.mylib.exception.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Core service for handling validation and basic operations.
 */
@Service
public class CoreService {
    
    private static final Logger logger = LoggerFactory.getLogger(CoreService.class);
    
    private final LibraryConfig config;

    public CoreService(LibraryConfig config) {
        this.config = config;
    }

    /**
     * Validates the given request.
     * 
     * @param request the request to validate
     * @throws ValidationException if validation fails
     */
    public void validateRequest(Request request) {
        logger.debug("Validating request: {}", request.getId());
        
        if (request.getId() == null || request.getId().trim().isEmpty()) {
            throw new ValidationException("Request ID cannot be null or empty");
        }
        
        if (request.getData() == null) {
            throw new ValidationException("Request data cannot be null");
        }
        
        // Add more validation logic as needed
        logger.debug("Request validation passed: {}", request.getId());
    }

    /**
     * Checks if the library is healthy.
     * 
     * @return true if healthy, false otherwise
     */
    public boolean isHealthy() {
        // Implement health check logic
        return true;
    }
}
```

### Model Classes

```java
// src/main/java/com/example/mylib/model/Request.java
package com.example.mylib.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Objects;

/**
 * Represents a request to be processed by the library.
 */
public class Request {
    
    @JsonProperty("id")
    private final String id;
    
    @JsonProperty("data")
    private final String data;
    
    @JsonProperty("timestamp")
    private final long timestamp;

    public Request(String id, String data) {
        this.id = id;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }

    public Request(String id, String data, long timestamp) {
        this.id = id;
        this.data = data;
        this.timestamp = timestamp;
    }

    // Getters
    public String getId() { return id; }
    public String getData() { return data; }
    public long getTimestamp() { return timestamp; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Request request = (Request) o;
        return timestamp == request.timestamp &&
               Objects.equals(id, request.id) &&
               Objects.equals(data, request.data);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, data, timestamp);
    }

    @Override
    public String toString() {
        return "Request{" +
               "id='" + id + '\'' +
               ", data='" + data + '\'' +
               ", timestamp=" + timestamp +
               '}';
    }
}

// src/main/java/com/example/mylib/model/Result.java
package com.example.mylib.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Objects;

/**
 * Represents the result of processing a request.
 */
public class Result {
    
    @JsonProperty("id")
    private final String id;
    
    @JsonProperty("success")
    private final boolean success;
    
    @JsonProperty("message")
    private final String message;
    
    @JsonProperty("processedData")
    private final String processedData;
    
    @JsonProperty("processingTime")
    private final long processingTime;

    public Result(String id, boolean success, String message, String processedData, long processingTime) {
        this.id = id;
        this.success = success;
        this.message = message;
        this.processedData = processedData;
        this.processingTime = processingTime;
    }

    // Getters
    public String getId() { return id; }
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public String getProcessedData() { return processedData; }
    public long getProcessingTime() { return processingTime; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Result result = (Result) o;
        return success == result.success &&
               processingTime == result.processingTime &&
               Objects.equals(id, result.id) &&
               Objects.equals(message, result.message) &&
               Objects.equals(processedData, result.processedData);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, success, message, processedData, processingTime);
    }

    @Override
    public String toString() {
        return "Result{" +
               "id='" + id + '\'' +
               ", success=" + success +
               ", message='" + message + '\'' +
               ", processedData='" + processedData + '\'' +
               ", processingTime=" + processingTime +
               '}';
    }
}
```

### Exception Handling

```java
// src/main/java/com/example/mylib/exception/LibraryException.java
package com.example.mylib.exception;

/**
 * Base exception for all library-specific exceptions.
 */
public class LibraryException extends RuntimeException {
    
    public LibraryException(String message) {
        super(message);
    }
    
    public LibraryException(String message, Throwable cause) {
        super(message, cause);
    }
}

// src/main/java/com/example/mylib/exception/ValidationException.java
package com.example.mylib.exception;

/**
 * Exception thrown when validation fails.
 */
public class ValidationException extends LibraryException {
    
    public ValidationException(String message) {
        super(message);
    }
    
    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

## 🧪 Testing

### Unit Test Example

```java
// src/test/java/com/example/mylib/MyLibraryTest.java
package com.example.mylib;

import com.example.mylib.config.LibraryConfig;
import com.example.mylib.model.Request;
import com.example.mylib.model.Result;
import com.example.mylib.exception.LibraryException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

class MyLibraryTest {
    
    private MyLibrary library;
    private LibraryConfig config;

    @BeforeEach
    void setUp() {
        config = LibraryConfig.defaultConfig();
        library = MyLibrary.builder()
            .config(config)
            .build();
    }

    @Test
    @DisplayName("Should process valid request successfully")
    void shouldProcessValidRequestSuccessfully() {
        // Given
        Request request = new Request("test-123", "test data");

        // When
        Result result = library.process(request);

        // Then
        assertNotNull(result);
        assertEquals("test-123", result.getId());
        assertTrue(result.isSuccess());
        assertNotNull(result.getProcessedData());
    }

    @Test
    @DisplayName("Should throw exception for null request")
    void shouldThrowExceptionForNullRequest() {
        // When/Then
        assertThrows(IllegalArgumentException.class, () -> {
            library.process(null);
        });
    }

    @Test
    @DisplayName("Should throw exception for invalid request")
    void shouldThrowExceptionForInvalidRequest() {
        // Given
        Request request = new Request("", "test data");

        // When/Then
        assertThrows(LibraryException.class, () -> {
            library.process(request);
        });
    }
}
```

### Integration Test Example

```java
// src/test/java/com/example/mylib/integration/LibraryIntegrationTest.java
package com.example.mylib.integration;

import com.example.mylib.MyLibrary;
import com.example.mylib.config.LibraryConfig;
import com.example.mylib.model.Request;
import com.example.mylib.model.Result;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for the library.
 */
class LibraryIntegrationTest {
    
    private MyLibrary library;

    @BeforeEach
    void setUp() {
        LibraryConfig config = LibraryConfig.builder()
            .timeoutMs(5000)
            .maxRetries(2)
            .enableCache(true)
            .build();
        
        library = MyLibrary.builder()
            .config(config)
            .build();
    }

    @Test
    @DisplayName("Should handle multiple requests concurrently")
    void shouldHandleMultipleRequestsConcurrently() throws InterruptedException {
        // Given
        int numRequests = 10;
        Thread[] threads = new Thread[numRequests];
        boolean[] results = new boolean[numRequests];

        // When
        for (int i = 0; i < numRequests; i++) {
            final int index = i;
            threads[i] = new Thread(() -> {
                try {
                    Request request = new Request("test-" + index, "data-" + index);
                    Result result = library.process(request);
                    results[index] = result.isSuccess();
                } catch (Exception e) {
                    results[index] = false;
                }
            });
            threads[i].start();
        }

        // Wait for all threads to complete
        for (Thread thread : threads) {
            thread.join();
        }

        // Then
        for (boolean result : results) {
            assertTrue(result, "All requests should succeed");
        }
    }
}
```

### Performance Benchmark

```java
// benchmarks/com/example/mylib/CoreServiceBenchmark.java
package com.example.mylib;

import com.example.mylib.config.LibraryConfig;
import com.example.mylib.model.Request;
import com.example.mylib.service.CoreService;
import org.openjdk.jmh.annotations.*;

import java.util.concurrent.TimeUnit;

@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.MICROSECONDS)
@State(Scope.Benchmark)
public class CoreServiceBenchmark {
    
    private CoreService coreService;
    private Request request;

    @Setup
    public void setUp() {
        LibraryConfig config = LibraryConfig.defaultConfig();
        coreService = new CoreService(config);
        request = new Request("benchmark-test", "benchmark data");
    }

    @Benchmark
    public void validateRequest() {
        coreService.validateRequest(request);
    }

    @Benchmark
    public boolean isHealthy() {
        return coreService.isHealthy();
    }
}
```

## 🔒 Security

### Security Best Practices

1. **Input Validation**: Always validate input parameters
2. **Dependency Management**: Keep dependencies updated
3. **Secure Defaults**: Use secure default configurations
4. **Error Handling**: Don't expose sensitive information in errors
5. **Logging**: Avoid logging sensitive data

### Security Configuration

```xml
<!-- Add to pom.xml for security scanning -->
<plugin>
    <groupId>org.owasp</groupId>
    <artifactId>dependency-check-maven</artifactId>
    <version>8.4.0</version>
    <configuration>
        <failBuildOnCVSS>7.0</failBuildOnCVSS>
    </configuration>
    <executions>
        <execution>
            <goals>
                <goal>check</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

## 📦 Publishing

### Local Installation

```bash
# Install to local Maven repository
mvn clean install

# Skip tests during installation
mvn clean install -DskipTests
```

### Publishing to Maven Central

1. **Configure POM** - Add proper metadata
2. **Generate GPG Keys** - For signing artifacts
3. **Configure Settings** - Add server credentials
4. **Release Process**:

```bash
# Clean and test
mvn clean test

# Build release artifacts
mvn clean package -P release

# Deploy to staging
mvn deploy -P release

# Promote from staging (manual step in Nexus)
```

### GitHub Actions for CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        java-version: [17, 21]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK ${{ matrix.java-version }}
      uses: actions/setup-java@v3
      with:
        java-version: ${{ matrix.java-version }}
        distribution: 'temurin'
    
    - name: Cache Maven dependencies
      uses: actions/cache@v3
      with:
        path: ~/.m2
        key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
    
    - name: Run tests
      run: mvn clean test
    
    - name: Generate test report
      run: mvn jacoco:report
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./target/site/jacoco/jacoco.xml
```

## 📚 Documentation

### JavaDoc Standards

- Document all public APIs
- Use proper tags (@param, @return, @throws)
- Include usage examples
- Document thread-safety

### README Structure

1. Overview and purpose
2. Quick start guide
3. Configuration options
4. API documentation
5. Examples and tutorials
6. Contributing guidelines
7. License information

## 🎯 Best Practices

### Code Quality

1. **Follow Java Conventions**: Use standard Java naming and formatting
2. **Write Tests**: Aim for high test coverage
3. **Use Static Analysis**: Configure SpotBugs, Checkstyle, PMD
4. **Document Code**: Comprehensive JavaDoc documentation
5. **Version Control**: Semantic versioning for releases

### Performance

1. **Benchmark Critical Paths**: Use JMH for performance testing
2. **Memory Management**: Avoid memory leaks
3. **Concurrency**: Use proper synchronization
4. **Caching**: Implement appropriate caching strategies
5. **Profiling**: Profile regularly for performance issues

### Maintainability

1. **Modular Design**: Clear separation of concerns
2. **Dependency Injection**: Use frameworks like Spring
3. **Configuration**: Externalize configuration
4. **Error Handling**: Consistent error handling patterns
5. **Logging**: Structured logging with appropriate levels

## 🔄 Versioning

This library follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Patterns

- [Spring Boot Web Service Template](../spring-boot-web/README.md)
- [Java CLI Application Template](../cli-app/README.md)
- [Maven Build Patterns](../../maven/README.md)
- [Testing Patterns](../../testing/README.md)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/LucasSantana-Dev/forge-patterns/issues)
- **Discussions**: [GitHub Discussions](https://github.com/LucasSantana-Dev/forge-patterns/discussions)
- **Documentation**: [Project Documentation](https://forge-patterns.readthedocs.io/)