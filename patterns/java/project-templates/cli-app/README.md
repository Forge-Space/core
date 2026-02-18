# Java CLI Application Template

A comprehensive Java command-line application template with best practices for building robust, maintainable, and user-friendly CLI tools using modern Java ecosystem.

## 🎯 Overview

This template provides a complete structure for Java CLI applications including:

- Modern CLI framework with Picocli
- Type-safe configuration management
- Comprehensive error handling
- Multiple output formats (JSON, YAML, Table)
- Shell completion support
- Testing framework with JUnit 5
- Cross-platform builds and releases
- Performance optimization patterns
- Logging and monitoring

## 📁 Project Structure

```
java-cli-app/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/myapp/
│   │   │       ├── MyApplication.java          # Application entry point
│   │   │       ├── cli/                        # CLI command definitions
│   │   │       │   ├── commands/                # Command implementations
│   │   │       │   │   ├── ListCommand.java
│   │   │       │   │   ├── CreateCommand.java
│   │   │       │   │   ├── DeleteCommand.java
│   │   │       │   │   └── ConfigCommand.java
│   │   │       │   ├── config/                  # CLI configuration
│   │   │       │   │   ├── CliConfig.java
│   │   │       │   │   └── OutputFormat.java
│   │   │       │   └── CliApplication.java     # CLI application setup
│   │   │       ├── config/                     # Application configuration
│   │   │       │   ├── AppConfig.java
│   │   │       │   └── properties/
│   │   │       ├── service/                    # Business logic services
│   │   │       │   ├── ItemService.java
│   │   │       │   └── OutputService.java
│   │   │       ├── model/                      # Data models
│   │   │       │   ├── Item.java
│   │   │       │   ├── CreateItemRequest.java
│   │   │       │   └── ItemResponse.java
│   │   │       ├── output/                     # Output formatting
│   │   │       │   ├── OutputFormatter.java
│   │   │       │   ├── TableFormatter.java
│   │   │       │   ├── JsonFormatter.java
│   │   │       │   └── YamlFormatter.java
│   │   │       ├── exception/                  # Custom exceptions
│   │   │       │   ├── CliException.java
│   │   │       │   └── ValidationException.java
│   │   │       ├── util/                       # Utility classes
│   │   │       │   ├── ValidationUtils.java
│   │   │       │   └── FileUtils.java
│   │   │       └── constant/                   # Application constants
│   │   └── resources/
│   │       ├── application.yml                  # Application configuration
│   │       ├── messages.properties              # Internationalization
│   │       └── logback-spring.xml              # Logging configuration
│   └── test/
│       └── java/
│           └── com/example/myapp/
│               ├── cli/                        # CLI tests
│               ├── service/                     # Service tests
│               └── integration/                 # Integration tests
├── scripts/                                      # Utility scripts
├── completions/                                 # Shell completions
├── docs/                                         # Documentation
├── pom.xml                                       # Maven configuration
├── Dockerfile                                    # Docker configuration
└── README.md                                     # This file
```

## 🚀 Quick Start

### Bootstrap Java CLI Application

```bash
# Create new CLI application
./scripts/bootstrap/project.sh --template=java-cli-app --name=my-java-cli

# Navigate to project
cd my-java-cli

# Install dependencies
mvn clean install

# Run development build
mvn exec:java -Dexec.mainClass="com.example.myapp.MyApplication"

# Run tests
mvn test

# Build for production
mvn clean package -Pprod
```

### Development Workflow

```bash
# Run with specific configuration
mvn exec:java -Dexec.mainClass="com.example.myapp.MyApplication" -Dexec.args="--config configs/development.yml"

# Generate shell completions
mvn exec:java -Dexec.mainClass="com.example.myapp.MyApplication" -Dexec.args="generate-completion bash > completions/my-java-cli.bash"

# Run with custom output format
mvn exec:java -Dexec.mainClass="com.example.myapp.MyApplication" -Dexec.args="list --output json"

# Build for all platforms
mvn clean package -Pprod
```

## 📋 Configuration

### Application Configuration (`src/main/resources/application.yml`)

```yaml
spring:
  application:
    name: my-java-cli
  profiles:
    active: dev
  
  # Configuration properties
  config:
    import: optional:file:./config/application.yml

# CLI-specific configuration
cli:
  name: my-java-cli
  version: 1.0.0
  description: A comprehensive Java CLI application
  
  # Default command settings
  default-command: help
  help-template: default
  
  # Output formatting
  output:
    format: table  # table, json, yaml, csv
    color: auto    # auto, always, never
    pager: true
    wide: false
    timestamp: true
  
  # Shell completion
  completion:
    enabled: true
    script-dir: completions
  
  # Configuration file search paths
  config-search-paths:
    - $HOME/.config/my-java-cli
    - /etc/my-java-cli
    - ./config
  
  config-file-names:
    - config.yml
    - config.yaml
    - .my-java-cli.yml

# Logging configuration
logging:
  level:
    com.example.myapp: INFO
    org.springframework.boot: WARN
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

# Application-specific configuration
app:
  name: My Java CLI
  version: 1.0.0
  description: A comprehensive Java CLI application
  
  # API configuration (if needed)
  api:
    base-url: https://api.example.com
    timeout: 30
    retries: 3
    rate-limit: 100
  
  # Cache configuration
  cache:
    type: memory  # memory, file, redis
    ttl: 3600
    max-size: 1000
    file-dir: ${user.home}/.cache/my-java-cli
  
  # File operations
  file:
    temp-dir: ${java.io.tmpdir}/my-java-cli
    max-file-size: 10MB
    allowed-extensions: txt,json,yaml,csv
```

### Development Configuration (`src/main/resources/application-dev.yml`)

```yaml
logging:
  level:
    com.example.myapp: DEBUG
    org.springframework.boot: DEBUG

cli:
  output:
    color: always

app:
  api:
    base-url: http://localhost:8080
```

### Production Configuration (`src/main/resources/application-prod.yml`)

```yaml
logging:
  level:
    com.example.myapp: WARN
    org.springframework.boot: ERROR
  file:
    name: logs/my-java-cli.log

cli:
  output:
    color: never

app:
  cache:
    type: file
```

## 🔧 Implementation

### Main Application

```java
// src/main/java/com/example/myapp/MyApplication.java
package com.example.myapp;

import com.example.myapp.cli.CliApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
public class MyApplication {

    public static void main(String[] args) {
        // Configure Spring Boot for CLI application
        System.setProperty("spring.main.web-application-type", "NONE");
        
        SpringApplication.run(MyApplication.class, args);
    }
}
```

### CLI Application Setup

```java
// src/main/java/com/example/myapp/cli/CliApplication.java
package com.example.myapp.cli;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import picocli.CommandLine;
import picocli.spring.boot.autoconfigure.PicocliSpringBootAutoConfiguration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class CliApplication {

    private final CliConfig cliConfig;

    @Bean
    public CommandLineRunner commandLineRunner() {
        return args -> {
            try {
                // Create command line
                CommandLine commandLine = createCommandLine();
                
                // Execute command
                int exitCode = commandLine.execute(args);
                
                // Exit with appropriate code
                System.exit(exitCode);
                
            } catch (Exception e) {
                log.error("CLI execution failed", e);
                System.exit(1);
            }
        };
    }

    private CommandLine createCommandLine() {
        // Create main command
        MainCommand mainCommand = new MainCommand();
        
        // Configure command line
        CommandLine commandLine = new CommandLine(mainCommand);
        
        // Add subcommands
        commandLine.addSubcommand(new ListCommand());
        commandLine.addSubcommand(new CreateCommand());
        commandLine.addSubcommand(new DeleteCommand());
        commandLine.addSubcommand(new ConfigCommand());
        
        // Configure completion
        if (cliConfig.getCompletion().isEnabled()) {
            commandLine.setExecutionStrategy(new CommandLine.RunLast());
        }
        
        return commandLine;
    }
}
```

### Main Command

```java
// src/main/java/com/example/myapp/cli/MainCommand.java
package com.example.myapp.cli;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;
import picocli.CommandLine.Parameters;

import java.util.concurrent.Callable;

@Component
@RequiredArgsConstructor
@Slf4j
@Command(
    name = "my-java-cli",
    version = "1.0.0",
    description = "A comprehensive Java CLI application",
    mixinStandardHelpOptions = true,
    subcommands = {
        ListCommand.class,
        CreateCommand.class,
        DeleteCommand.class,
        ConfigCommand.class
    }
)
public class MainCommand implements Callable<Integer> {

    private final CliConfig cliConfig;

    @Option(
        names = {"-c", "--config"},
        description = "Configuration file path"
    )
    private String configFile;

    @Option(
        names = {"-o", "--output"},
        description = "Output format (table, json, yaml, csv)"
    )
    private String outputFormat;

    @Option(
        names = {"-v", "--verbose"},
        description = "Enable verbose output"
    )
    private boolean verbose;

    @Option(
        names = {"--no-color"},
        description = "Disable colored output"
    )
    private boolean noColor;

    @Option(
        names = {"--no-pager"},
        description = "Disable pager"
    )
    private boolean noPager;

    @Option(
        names = {"-w", "--wide"},
        description = "Enable wide output"
    )
    private boolean wide;

    @Override
    public Integer call() throws Exception {
        // Show help if no subcommand provided
        CommandLine.usage(this, System.out);
        return 0;
    }
}
```

### List Command

```java
// src/main/java/com/example/myapp/cli/commands/ListCommand.java
package com.example.myapp.cli.commands;

import com.example.myapp.cli.OutputFormat;
import com.example.myapp.model.ItemResponse;
import com.example.myapp.service.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;
import picocli.CommandLine.Parameters;

import java.util.List;
import java.util.concurrent.Callable;

@Component
@RequiredArgsConstructor
@Slf4j
@Command(
    name = "list",
    description = "List items",
    mixinStandardHelpOptions = true
)
public class ListCommand implements Callable<Integer> {

    private final ItemService itemService;

    @Option(
        names = {"-a", "--all"},
        description = "List all items"
    )
    private boolean all;

    @Option(
        names = {"-s", "--status"},
        description = "Filter by status"
    )
    private String status;

    @Option(
        names = {"-n", "--limit"},
        description = "Limit number of results"
    )
    private Integer limit = 10;

    @Option(
        names = {"-o", "--output"},
        description = "Output format (table, json, yaml, csv)"
    )
    private OutputFormat outputFormat = OutputFormat.TABLE;

    @Override
    public Integer call() throws Exception {
        try {
            // Get items
            List<ItemResponse> items = itemService.listItems(status, all, limit);
            
            // Format output
            itemService.formatOutput(items, outputFormat);
            
            return 0;
            
        } catch (Exception e) {
            log.error("Failed to list items", e);
            System.err.println("Error: " + e.getMessage());
            return 1;
        }
    }
}
```

### Create Command

```java
// src/main/java/com/example/myapp/cli/commands/CreateCommand.java
package com.example.myapp.cli.commands;

import com.example.myapp.cli.OutputFormat;
import com.example.myapp.model.CreateItemRequest;
import com.example.myapp.model.ItemResponse;
import com.example.myapp.service.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;
import picocli.CommandLine.Parameters;

import java.util.concurrent.Callable;

@Component
@RequiredArgsConstructor
@Slf4j
@Command(
    name = "create",
    description = "Create a new item",
    mixinStandardHelpOptions = true
)
public class CreateCommand implements Callable<Integer> {

    private final ItemService itemService;

    @Parameters(
        index = "0",
        description = "Item name"
    )
    private String name;

    @Option(
        names = {"-d", "--description"},
        description = "Item description"
    )
    private String description;

    @Option(
        names = {"-s", "--status"},
        description = "Item status (default: pending)"
    )
    private String status = "pending";

    @Option(
        names = {"-o", "--output"},
        description = "Output format (table, json, yaml, csv)"
    )
    private OutputFormat outputFormat = OutputFormat.TABLE;

    @Override
    public Integer call() throws Exception {
        try {
            // Validate input
            if (name == null || name.trim().isEmpty()) {
                System.err.println("Error: Item name is required");
                return 1;
            }

            // Create request
            CreateItemRequest request = new CreateItemRequest();
            request.setName(name.trim());
            request.setDescription(description);
            request.setStatus(status);

            // Create item
            ItemResponse item = itemService.createItem(request);
            
            // Format output
            itemService.formatOutput(List.of(item), outputFormat);
            
            return 0;
            
        } catch (Exception e) {
            log.error("Failed to create item", e);
            System.err.println("Error: " + e.getMessage());
            return 1;
        }
    }
}
```

### CLI Configuration

```java
// src/main/java/com/example/myapp/cli/config/CliConfig.java
package com.example.myapp.cli.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "cli")
public class CliConfig {

    private String name = "my-java-cli";
    private String version = "1.0.0";
    private String description = "A comprehensive Java CLI application";
    private String defaultCommand = "help";
    private String helpTemplate = "default";
    private OutputConfig output = new OutputConfig();
    private CompletionConfig completion = new CompletionConfig();
    private List<String> configSearchPaths = List.of(
        "$HOME/.config/my-java-cli",
        "/etc/my-java-cli",
        "./config"
    );
    private List<String> configFileNames = List.of(
        "config.yml",
        "config.yaml",
        ".my-java-cli.yml"
    );

    @Data
    public static class OutputConfig {
        private String format = "table";
        private String color = "auto";
        private boolean pager = true;
        private boolean wide = false;
        private boolean timestamp = true;
    }

    @Data
    public static class CompletionConfig {
        private boolean enabled = true;
        private String scriptDir = "completions";
    }
}
```

### Output Format Enum

```java
// src/main/java/com/example/myapp/cli/config/OutputFormat.java
package com.example.myapp.cli.config;

import com.example.myapp.cli.output.OutputFormatter;
import com.example.myapp.cli.output.TableFormatter;
import com.example.myapp.cli.output.JsonFormatter;
import com.example.myapp.cli.output.YamlFormatter;
import com.example.myapp.cli.output.CsvFormatter;

public enum OutputFormat {
    TABLE(new TableFormatter()),
    JSON(new JsonFormatter()),
    YAML(new YamlFormatter()),
    CSV(new CsvFormatter());

    private final OutputFormatter formatter;

    OutputFormat(OutputFormatter formatter) {
        this.formatter = formatter;
    }

    public OutputFormatter getFormatter() {
        return formatter;
    }

    @Override
    public String toString() {
        return name().toLowerCase();
    }
}
```

### Item Service

```java
// src/main/java/com/example/myapp/service/ItemService.java
package com.example.myapp.service;

import com.example.myapp.cli.OutputFormat;
import com.example.myapp.cli.config.CliConfig;
import com.example.myapp.cli.output.OutputFormatter;
import com.example.myapp.exception.ValidationException;
import com.example.myapp.model.CreateItemRequest;
import com.example.myapp.model.Item;
import com.example.myapp.model.ItemResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemService {

    private final CliConfig cliConfig;
    
    // In-memory storage for demo purposes
    private final List<Item> items = new ArrayList<>();

    @Cacheable(value = "items", key = "#status + '-' + #all + '-' + #limit")
    public List<ItemResponse> listItems(String status, boolean all, Integer limit) {
        log.debug("Listing items with status: {}, all: {}, limit: {}", status, all, limit);

        List<ItemResponse> result = items.stream()
                .filter(item -> status == null || status.equals(item.getStatus()))
                .map(ItemResponse::from)
                .limit(all ? Integer.MAX_VALUE : limit)
                .toList();

        log.debug("Retrieved {} items", result.size());
        return result;
    }

    public ItemResponse createItem(CreateItemRequest request) {
        log.debug("Creating item: {}", request.getName());

        // Validate request
        validateCreateRequest(request);

        // Create item
        Item item = new Item();
        item.setId(UUID.randomUUID());
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setStatus(request.getStatus());
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());

        // Store item
        items.add(item);

        log.info("Created item: {}", item.getId());
        return ItemResponse.from(item);
    }

    public void deleteItem(UUID id) {
        log.debug("Deleting item: {}", id);

        boolean removed = items.removeIf(item -> item.getId().equals(id));
        
        if (!removed) {
            throw new ValidationException("Item not found: " + id);
        }

        log.info("Deleted item: {}", id);
    }

    public void formatOutput(List<ItemResponse> items, OutputFormat format) {
        OutputFormatter formatter = format.getFormatter();
        formatter.format(items);
    }

    private void validateCreateRequest(CreateItemRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ValidationException("Item name is required");
        }

        if (request.getName().length() > 100) {
            throw new ValidationException("Item name must be 100 characters or less");
        }

        if (request.getDescription() != null && request.getDescription().length() > 500) {
            throw new ValidationException("Item description must be 500 characters or less");
        }
    }
}
```

### Output Formatter Interface

```java
// src/main/java/com/example/myapp/cli/output/OutputFormatter.java
package com.example.myapp.cli.output;

import com.example.myapp.model.ItemResponse;

import java.util.List;

public interface OutputFormatter {
    void format(List<ItemResponse> items);
}
```

### Table Formatter

```java
// src/main/java/com/example/myapp/cli/output/TableFormatter.java
package com.example.myapp.cli.output;

import com.example.myapp.model.ItemResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
public class TableFormatter implements OutputFormatter {

    @Override
    public void format(List<ItemResponse> items) {
        if (items.isEmpty()) {
            System.out.println("No items found.");
            return;
        }

        // Calculate column widths
        int idWidth = 36; // UUID length
        int nameWidth = Math.max("Name".length(), items.stream()
                .mapToInt(item -> item.getName().length())
                .max()
                .orElse(0));
        int statusWidth = Math.max("Status".length(), items.stream()
                .mapToInt(item -> item.getStatus().length())
                .max()
                .orElse(0));
        int createdWidth = 19; // ISO date length

        // Print header
        String headerFormat = "| %-36s | %-" + nameWidth + "s | %-" + statusWidth + "s | %-19s |";
        String separator = "+-" + "-".repeat(36) + "-+-" + "-".repeat(nameWidth) + "-+-" + "-".repeat(statusWidth) + "-+-" + "-".repeat(19) + "-+";

        System.out.println(separator);
        System.out.printf(headerFormat + "%n", "ID", "Name", "Status", "Created At");
        System.out.println(separator);

        // Print rows
        for (ItemResponse item : items) {
            System.out.printf(headerFormat + "%n",
                    item.getId(),
                    item.getName(),
                    item.getStatus(),
                    item.getCreatedAt());
        }

        System.out.println(separator);
        System.out.printf("%d item(s)%n", items.size());
    }
}
```

## 🚀 Build and Release

### Maven Configuration (`pom.xml`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>my-java-cli</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>My Java CLI</name>
    <description>A comprehensive Java CLI application</description>

    <properties>
        <java.version>17</java.version>
        <picocli.version>4.7.5</picocli.version>
        <jackson.version>2.15.2</jackson.version>
    </properties>

    <dependencies>
        <!-- Spring Boot -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>

        <!-- Configuration Processor -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Picocli for CLI -->
        <dependency>
            <groupId>info.picocli</groupId>
            <artifactId>picocli-spring-boot-starter</artifactId>
            <version>${picocli.version}</version>
        </dependency>

        <!-- Jackson for JSON/YAML -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.dataformat</groupId>
            <artifactId>jackson-dataformat-yaml</artifactId>
        </dependency>

        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Caching -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-cache</artifactId>
        </dependency>

        <!-- Logging -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </dependency>

        <!-- Test dependencies -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.mockito</groupId>
            <artifactId>mockito-core</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Spring Boot Plugin -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <mainClass>com.example.myapp.MyApplication</mainClass>
                </configuration>
            </plugin>

            <!-- Compiler Plugin -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <source>${java.version}</source>
                    <target>${java.version}</target>
                </configuration>
            </plugin>

            <!-- Surefire Plugin for Tests -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <configuration>
                    <includes>
                        <include>**/*Test.java</include>
                        <include>**/*Tests.java</include>
                    </includes>
                </configuration>
            </plugin>

            <!-- Exec Plugin for running -->
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>exec-maven-plugin</artifactId>
                <version>3.1.0</version>
                <configuration>
                    <mainClass>com.example.myapp.MyApplication</mainClass>
                </configuration>
            </plugin>

            <!-- Shade Plugin for fat JAR -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <version>3.5.0</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                        <configuration>
                            <transformers>
                                <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                                    <mainClass>com.example.myapp.MyApplication</mainClass>
                                </transformer>
                            </transformers>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>

    <profiles>
        <!-- Development Profile -->
        <profile>
            <id>dev</id>
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
            <properties>
                <spring.profiles.active>dev</spring.profiles.active>
            </properties>
        </profile>

        <!-- Production Profile -->
        <profile>
            <id>prod</id>
            <properties>
                <spring.profiles.active>prod</spring.profiles.active>
            </properties>
            <build>
                <plugins>
                    <plugin>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-maven-plugin</artifactId>
                        <configuration>
                            <excludeDevtools>true</excludeDevtools>
                        </configuration>
                    </plugin>
                </plugins>
            </build>
        </profile>
    </profiles>
</project>
```

## 🧪 Testing

### Unit Test Example

```java
// src/test/java/com/example/myapp/service/ItemServiceTest.java
package com.example.myapp.service;

import com.example.myapp.cli.OutputFormat;
import com.example.myapp.cli.config.CliConfig;
import com.example.myapp.exception.ValidationException;
import com.example.myapp.model.CreateItemRequest;
import com.example.myapp.model.ItemResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
class ItemServiceTest {

    @Mock
    private CliConfig cliConfig;

    private ItemService itemService;

    @BeforeEach
    void setUp() {
        itemService = new ItemService(cliConfig);
    }

    @Test
    void listItems_ShouldReturnEmptyList_WhenNoItemsExist() {
        // When
        List<ItemResponse> result = itemService.listItems(null, false, 10);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void createItem_ShouldReturnItemResponse_WhenValidRequest() {
        // Given
        CreateItemRequest request = new CreateItemRequest();
        request.setName("Test Item");
        request.setDescription("Test Description");
        request.setStatus("pending");

        // When
        ItemResponse result = itemService.createItem(request);

        // Then
        assertThat(result.getName()).isEqualTo("Test Item");
        assertThat(result.getDescription()).isEqualTo("Test Description");
        assertThat(result.getStatus()).isEqualTo("pending");
        assertThat(result.getId()).isNotNull();
        assertThat(result.getCreatedAt()).isNotNull();
    }

    @Test
    void createItem_ShouldThrowException_WhenNameIsEmpty() {
        // Given
        CreateItemRequest request = new CreateItemRequest();
        request.setName("");
        request.setDescription("Test Description");
        request.setStatus("pending");

        // When & Then
        assertThatThrownBy(() -> itemService.createItem(request))
                .isInstanceOf(ValidationException.class)
                .hasMessage("Item name is required");
    }

    @Test
    void createItem_ShouldThrowException_WhenNameTooLong() {
        // Given
        CreateItemRequest request = new CreateItemRequest();
        request.setName("a".repeat(101));
        request.setDescription("Test Description");
        request.setStatus("pending");

        // When & Then
        assertThatThrownBy(() -> itemService.createItem(request))
                .isInstanceOf(ValidationException.class)
                .hasMessage("Item name must be 100 characters or less");
    }
}
```

## 🔒 Security Considerations

- ✅ **Input Validation**: Comprehensive input validation and sanitization
- ✅ **Configuration Security**: Secure handling of configuration files
- ✅ **File Permissions**: Proper file permissions for config and data
- ✅ **Network Security**: TLS for API communications (if applicable)
- ✅ **Dependency Security**: Regular security audits of dependencies
- ✅ **Error Information**: Avoid leaking sensitive information in errors

## 📚 Best Practices

1. **CLI Design**: Follow CLI design principles and conventions
2. **Error Handling**: Comprehensive error handling with user-friendly messages
3. **Configuration**: Externalized configuration with multiple formats
4. **Testing**: Comprehensive unit and integration tests
5. **Documentation**: Complete documentation with examples
6. **Performance**: Efficient memory usage and processing
7. **User Experience**: Intuitive commands and helpful error messages
8. **Extensibility**: Plugin architecture for easy extension

---

**Template Version**: 1.0.0  
**Last Updated**: 2026-02-17  
**Compatible**: Java 17+, Spring Boot 3.x, Maven 3.8+  
**License**: MIT