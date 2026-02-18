# UIForge Ecosystem Integration Guide

## 🎯 **Overview**

This guide provides step-by-step instructions for setting up and integrating the complete UIForge ecosystem. It covers everything from initial setup to advanced configuration and troubleshooting.

## 📋 **Prerequisites**

### **System Requirements**
- **Node.js**: Version 18 or higher
- **Python**: Version 3.9 or higher  
- **Docker**: Version 20.10 or higher
- **Git**: Version 2.30 or higher
- **Memory**: Minimum 8GB RAM (16GB recommended)
- **Storage**: Minimum 10GB free disk space

### **Development Tools**
- **IDE**: VS Code, Cursor, or Windsurf with MCP support
- **Database**: PostgreSQL (for production) or SQLite (for development)
- **Container Runtime**: Docker Desktop or Docker Engine
- **API Client**: Postman, Insomnia, or curl for API testing

## 🚀 **Quick Start (5-Minute Setup)**

### **1. Clone and Start Gateway**
```bash
# Clone the gateway repository
git clone https://github.com/LucasSantana-Dev/forge-mcp-gateway.git
cd forge-mcp-gateway

# Start the gateway services
make start

# Register the gateway with your IDE
make register
```

### **2. Start UI Generation Server**
```bash
# Clone the MCP server repository
git clone https://github.com/LucasSantana-Dev/uiforge-mcp.git
cd uiforge-mcp

# Install dependencies
npm install

# Start the server
npm run dev
```

### **3. Launch Management Interface**
```bash
# Clone the webapp repository
git clone https://github.com/LucasSantana-Dev/uiforge-webapp.git
cd uiforge-webapp

# Install dependencies
npm install

# Start the development server
npm run dev
```

### **4. Verify Integration**
```bash
# Test gateway health
curl http://localhost:8080/health

# Test MCP server connection
curl http://localhost:8080/api/servers/status

# Access web interface
open http://localhost:3000
```

## 📁 **Complete Setup Guide**

### **Phase 1: Environment Preparation**

#### **1.1 Directory Structure Setup**
```bash
# Create workspace directory
mkdir uiforge-ecosystem
cd uiforge-ecosystem

# Clone all repositories
git clone https://github.com/LucasSantana-Dev/forge-mcp-gateway.git
git clone https://github.com/LucasSantana-Dev/uiforge-mcp.git
git clone https://github.com/LucasSantana-Dev/uiforge-webapp.git

# Verify structure
tree -L 2
```

#### **1.2 Environment Configuration**
```bash
# Create shared environment file
cat > .env.shared << EOF
# UIForge Ecosystem Configuration
NODE_ENV=development
LOG_LEVEL=debug

# Gateway Configuration
GATEWAY_URL=http://localhost:8080
GATEWAY_PORT=8080

# MCP Server Configuration
MCP_SERVER_URL=http://localhost:3001
MCP_SERVER_PORT=3001

# WebApp Configuration
WEBAPP_URL=http://localhost:3000
WEBAPP_PORT=3000

# Database Configuration
DATABASE_URL=postgresql://localhost:5432/uiforge
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key
EOF

# Source environment variables
source .env.shared
```

### **Phase 2: Gateway Setup**

#### **2.1 Gateway Installation**
```bash
cd forge-mcp-gateway

# Install Python dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-dev.txt

# Set up pre-commit hooks
pre-commit install

# Initialize database
make db-init

# Start gateway services
make start
```

#### **2.2 Gateway Configuration**
```bash
# Create gateway environment file
cat > .env << EOF
# Gateway Configuration
PORT=8080
HOST=localhost

# Database
DATABASE_URL=sqlite:///data/gateway.db

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# MCP Server Settings
MCP_SERVER_TIMEOUT=30
MCP_SERVER_RETRIES=3

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
EOF

# Test gateway
curl http://localhost:8080/health
```

#### **2.3 IDE Integration**
```bash
# Register gateway with IDE
make register

# Verify MCP connection
curl http://localhost:8080/api/mcp/status

# Test IDE tools
npx @modelcontextprotocol/cli list-tools
```

### **Phase 3: MCP Server Setup**

#### **3.1 UI Generation Server Installation**
```bash
cd ../uiforge-mcp

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
# MCP Server Configuration
PORT=3001
HOST=localhost

# Gateway Integration
GATEWAY_URL=http://localhost:8080
GATEWAY_API_KEY=your-api-key

# AI Model Configuration
AI_MODEL_PROVIDER=ollama
AI_MODEL_NAME=llama3.2:3b
AI_MODEL_BASE_URL=http://localhost:11434

# Template Storage
TEMPLATE_STORAGE_PATH=./templates
COMPONENT_CACHE_PATH=./cache

# Logging
LOG_LEVEL=debug
EOF

# Start development server
npm run dev
```

#### **3.2 Template Setup**
```bash
# Create template directories
mkdir -p templates/{react,vue,angular}
mkdir -p cache/components

# Initialize default templates
npm run setup:templates

# Verify template loading
curl http://localhost:3001/api/templates
```

### **Phase 4: Web Application Setup**

#### **4.1 WebApp Installation**
```bash
cd ../uiforge-webapp

# Install dependencies
npm install

# Create environment file
cat > .env.local << EOF
# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8080

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Development
NODE_ENV=development
EOF

# Run database migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

#### **4.2 WebApp Configuration**
```bash
# Start development server
npm run dev

# Verify webapp is running
curl http://localhost:3000/api/health

# Test gateway connection
curl http://localhost:3000/api/gateway/status
```

## ⚙️ **Configuration Matrix**

| Component | Config File | Key Settings | Dependencies |
|-----------|------------|--------------|-------------|
| **Gateway** | `.env` | `PORT`, `JWT_SECRET`, `DATABASE_URL` | None |
| **MCP Server** | `.env` | `GATEWAY_URL`, `AI_MODEL_PROVIDER` | Gateway |
| **WebApp** | `.env.local` | `NEXT_PUBLIC_GATEWAY_URL`, `SUPABASE_URL` | Gateway, Supabase |

### **Environment Variables Reference**

#### **Gateway Environment Variables**
```bash
# Server Configuration
PORT=8080                    # Gateway port
HOST=localhost              # Gateway host
DEBUG=false                  # Debug mode

# Database
DATABASE_URL=sqlite:///data/gateway.db  # Database connection
DB_POOL_SIZE=10              # Database pool size

# Authentication
JWT_SECRET=your-secret-key   # JWT signing secret
JWT_EXPIRES_IN=24h           # Token expiration
REFRESH_TOKEN_EXPIRES_IN=7d  # Refresh token expiration

# MCP Server Management
MCP_SERVER_TIMEOUT=30        # Server timeout (seconds)
MCP_SERVER_RETRIES=3         # Connection retries
MCP_SERVER_HEARTBEAT=10      # Heartbeat interval (seconds)

# Logging
LOG_LEVEL=info               # Log level (debug, info, warn, error)
LOG_FORMAT=json              # Log format (json, text)
LOG_FILE=logs/gateway.log    # Log file path
```

#### **MCP Server Environment Variables**
```bash
# Server Configuration
PORT=3001                    # MCP server port
HOST=localhost              # Server host
WORKERS=4                    # Number of worker processes

# Gateway Integration
GATEWAY_URL=http://localhost:8080  # Gateway URL
GATEWAY_API_KEY=your-key     # API key for gateway
SERVER_NAME=uiforge-mcp      # Server name
SERVER_DESCRIPTION=UI Generation MCP Server  # Server description

# AI Model Configuration
AI_MODEL_PROVIDER=ollama     # AI model provider
AI_MODEL_NAME=llama3.2:3b    # Model name
AI_MODEL_BASE_URL=http://localhost:11434  # Model base URL
AI_MODEL_TIMEOUT=60          # Model timeout (seconds)

# Storage
TEMPLATE_STORAGE_PATH=./templates  # Template storage path
COMPONENT_CACHE_PATH=./cache        # Component cache path
MAX_CACHE_SIZE=1GB           # Maximum cache size

# Performance
MAX_CONCURRENT_REQUESTS=10   # Maximum concurrent requests
REQUEST_TIMEOUT=120          # Request timeout (seconds)
```

#### **WebApp Environment Variables**
```bash
# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Application URL
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8080  # Gateway URL
NODE_ENV=development         # Environment mode

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321  # Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key      # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=your-service-key       # Service role key

# Authentication
NEXTAUTH_URL=http://localhost:3000               # NextAuth URL
NEXTAUTH_SECRET=your-nextauth-secret              # NextAuth secret

# Development
PORT=3000                   # WebApp port
DEV_MODE=true               # Development mode
```

## 🔗 **Integration Testing**

### **Health Check Script**
```bash
#!/bin/bash
# health-check.sh

echo "🔍 Checking UIForge Ecosystem Health..."

# Check Gateway
echo "📡 Checking Gateway..."
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Gateway is healthy"
else
    echo "❌ Gateway is not responding"
    exit 1
fi

# Check MCP Server
echo "🤖 Checking MCP Server..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ MCP Server is healthy"
else
    echo "❌ MCP Server is not responding"
    exit 1
fi

# Check WebApp
echo "🌐 Checking WebApp..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ WebApp is healthy"
else
    echo "❌ WebApp is not responding"
    exit 1
fi

# Test Integration
echo "🔗 Testing Integration..."
if curl -f http://localhost:8080/api/servers/status > /dev/null 2>&1; then
    echo "✅ Gateway ↔ MCP Server integration working"
else
    echo "❌ Gateway ↔ MCP Server integration failed"
    exit 1
fi

if curl -f http://localhost:3000/api/gateway/status > /dev/null 2>&1; then
    echo "✅ WebApp ↔ Gateway integration working"
else
    echo "❌ WebApp ↔ Gateway integration failed"
    exit 1
fi

echo "🎉 All systems are operational!"
```

### **End-to-End Test**
```bash
#!/bin/bash
# e2e-test.sh

echo "🧪 Running End-to-End Integration Test..."

# Test 1: User Registration and Login
echo "👤 Testing User Authentication..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}')

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo "✅ User registration successful"
    TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
else
    echo "❌ User registration failed"
    exit 1
fi

# Test 2: UI Component Generation
echo "🎨 Testing UI Generation..."
GENERATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/generate/component \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Create a modern login form with email and password fields","framework":"react"}')

if echo "$GENERATE_RESPONSE" | grep -q "component"; then
    echo "✅ UI component generation successful"
else
    echo "❌ UI component generation failed"
    exit 1
fi

# Test 3: Template Management
echo "📋 Testing Template Management..."
TEMPLATE_RESPONSE=$(curl -s -X GET http://localhost:3000/api/templates \
  -H "Authorization: Bearer $TOKEN")

if echo "$TEMPLATE_RESPONSE" | grep -q "templates"; then
    echo "✅ Template management working"
else
    echo "❌ Template management failed"
    exit 1
fi

echo "🎉 All end-to-end tests passed!"
```

## 🛠️ **Advanced Configuration**

### **Production Deployment Setup**
```bash
# Production environment variables
cat > .env.production << EOF
# Production Configuration
NODE_ENV=production
LOG_LEVEL=warn

# Security
JWT_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:pass@localhost:5432/uiforge_prod
SUPABASE_URL=https://your-project.supabase.co

# Performance
WORKERS=8
MAX_CONCURRENT_REQUESTS=50
CACHE_TTL=3600

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
EOF
```

### **Docker Compose Setup**
```yaml
# docker-compose.yml
version: '3.8'

services:
  gateway:
    build: ./forge-mcp-gateway
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/uiforge
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    volumes:
      - ./data:/app/data

  mcp-server:
    build: ./uiforge-mcp
    ports:
      - "3001:3001"
    environment:
      - GATEWAY_URL=http://gateway:8080
      - AI_MODEL_PROVIDER=ollama
    depends_on:
      - gateway
      - ollama

  webapp:
    build: ./uiforge-webapp
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_GATEWAY_URL=http://gateway:8080
      - SUPABASE_URL=http://supabase:54321
    depends_on:
      - gateway
      - supabase

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=uiforge
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  supabase:
    image: supabase/local:latest
    ports:
      - "54321:54321"
    environment:
      - POSTGRES_PASSWORD=password

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama

volumes:
  postgres_data:
  ollama_data:
```

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Gateway Not Starting**
```bash
# Check port availability
lsof -i :8080

# Check logs
tail -f forge-mcp-gateway/logs/gateway.log

# Reset database
make db-reset

# Clear cache
rm -rf data/cache/*
```

#### **MCP Server Connection Issues**
```bash
# Test gateway connectivity
curl http://localhost:8080/api/servers/status

# Check MCP server logs
tail -f uiforge-mcp/logs/server.log

# Restart MCP server
npm run restart

# Verify configuration
cat uiforge-mcp/.env
```

#### **WebApp Integration Problems**
```bash
# Check environment variables
cat uiforge-webapp/.env.local

# Test gateway connection
curl http://localhost:3000/api/gateway/status

# Clear Next.js cache
rm -rf uiforge-webapp/.next

# Restart development server
npm run dev
```

### **Debug Mode**
```bash
# Enable debug logging
export LOG_LEVEL=debug

# Run with verbose output
npm run dev --verbose

# Monitor network traffic
tcpdump -i lo port 8080

# Check process status
ps aux | grep -E "(gateway|mcp|webapp)"
```

## 📚 **Additional Resources**

- [Architecture Documentation](./ARCHITECTURE.md)
- [Development Standards](../standards/DEVELOPMENT.md)
- [Security Guidelines](../standards/SECURITY.md)
- [Deployment Playbook](./DEPLOYMENT_PLAYBOOK.md)

---

*This integration guide should help you get the complete UIForge ecosystem running. For additional support, please refer to the troubleshooting section or create an issue in the respective repositories.*