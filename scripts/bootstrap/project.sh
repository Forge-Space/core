#!/bin/bash
# scripts/bootstrap/project.sh
set -euo pipefail

echo "🚀 Bootstrapping new UIForge project..."

PROJECT_NAME=$1
PROJECT_TYPE=${2:-"node"}

if [ -z "$PROJECT_NAME" ]; then
  echo "❌ Project name is required"
  echo "Usage: $0 <project-name> [project-type]"
  echo "Project types: node, python, nextjs"
  exit 1
fi

echo "Creating project: $PROJECT_NAME (type: $PROJECT_TYPE)"

# Create project directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Initialize Git repository
git init

# Create basic structure
mkdir -p src docs tests scripts feature-toggles

# Copy patterns from uiforge-patterns
echo "📋 Copying patterns from uiforge-patterns..."

# Copy ESLint config
if [ "$PROJECT_TYPE" = "node" ] || [ "$PROJECT_TYPE" = "nextjs" ]; then
  cp ../patterns/code-quality/eslint/base.config.js .eslintrc.js
  cp ../patterns/code-quality/prettier/base.config.json .prettierrc.json
fi

# Copy Jest config for TypeScript projects
if [ "$PROJECT_TYPE" = "node" ] || [ "$PROJECT_TYPE" = "nextjs" ]; then
  cp ../patterns/coverage/jest.config.template.js jest.config.js
fi

# Copy Codecov config
cp ../patterns/coverage/codecov.template.yml .codecov.yml

# Copy Git hooks
mkdir -p .git/hooks
cp ../patterns/git/pre-commit/base.sh .git/hooks/pre-commit
cp ../patterns/git/commit-msg/conventional.sh .git/hooks/commit-msg
chmod +x .git/hooks/pre-commit .git/hooks/commit-msg

# Copy Docker patterns
echo "🐳 Adding Docker patterns..."
cp ../patterns/docker/Dockerfile.node.template Dockerfile
cp ../patterns/docker/docker-compose.dev.yml docker-compose.yml
cp ../patterns/docker/docker-compose.prod.yml docker-compose.prod.yml
cp ../patterns/docker/.dockerignore .dockerignore

# Copy centralized feature toggle patterns
echo "🎛️ Adding centralized feature toggle patterns..."
mkdir -p feature-toggles
mkdir -p feature-toggles/libraries
mkdir -p feature-toggles/libraries/nodejs
cp ../patterns/feature-toggles/README.md feature-toggles/
cp ../patterns/feature-toggles/libraries/nodejs/index.js feature-toggles/libraries/nodejs/ 2>/dev/null || echo "# Feature toggle library will be added here" > feature-toggles/libraries/nodejs/index.js

# Copy forge-features CLI tool
cp ../scripts/forge-features scripts/ 2>/dev/null || echo "# Forge Features CLI will be added here" > scripts/forge-features
chmod +x scripts/forge-features

# Create package.json for Node.js projects
if [ "$PROJECT_TYPE" = "node" ] || [ "$PROJECT_TYPE" = "nextjs" ]; then
  cat > package.json << EOF
{
  "name": "$PROJECT_NAME",
  "version": "1.0.0",
  "description": "UIForge project: $PROJECT_NAME",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts,.js",
    "lint:fix": "eslint src --ext .ts,.js --fix",
    "format": "prettier --write src/**/*.{ts,js,json}",
    "type-check": "tsc --noEmit",
    "docker:build": "docker build -t $PROJECT_NAME .",
    "docker:run": "docker run -p 3000:3000 $PROJECT_NAME",
    "docker:dev": "docker-compose up -d",
    "docker:prod": "docker-compose -f docker-compose.prod.yml up -d"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  },
  "lint-staged": {
    "*.{ts,js}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,yml,yaml}": [
      "prettier --write"
    ]
  }
}
EOF
fi

# Create TypeScript config for Node.js projects
if [ "$PROJECT_TYPE" = "node" ] || [ "$PROJECT_TYPE" = "nextjs" ]; then
  cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
EOF
fi

# Create Python config for Python projects
if [ "$PROJECT_TYPE" = "python" ]; then
  cat > pyproject.toml << EOF
[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "$PROJECT_NAME"
version = "1.0.0"
description = "UIForge project: $PROJECT_NAME"
authors = [{name = "UIForge Team"}]
license = {text = "MIT"}
dependencies = []

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-cov>=4.0.0",
    "ruff>=0.1.0",
    "black>=23.0.0",
    "mypy>=1.0.0"
]

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["."]
addopts = "--cov=src --cov-report=xml --cov-report=html --cov-report=term-missing --cov-fail-under=80"

[tool.coverage.report]
fail_under = 80
show_missing = true
precision = 2

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "W", "I", "N", "UP", "B", "A", "C4", "DTZ", "T10", "EM", "FA", "ISC", "ICN", "G", "PIE", "T20", "PT", "Q", "RSE", "RET", "SIM", "TID", "TCH", "ARG", "PTH", "ERA", "PGH", "PL", "TRY", "FLY", "NPY", "RUF"]
ignore = ["E501"]

[tool.mypy]
python_version = "3.12"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
EOF
fi

# Create .gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
.venv/
venv/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python

# Build outputs
dist/
build/
out/
.next/
*.tsbuildinfo

# Environment files
.env
.env.local
.env.*.local
!.env.example
!.env.template

# Logs
*.log
logs/

# Coverage
coverage/
htmlcov/
.coverage
.nyc_output

# IDE
.vscode/
.idea/
*.swp
*.swo
.windsurf/

# OS
.DS_Store
Thumbs.db

# Testing
.jest/
test-results/
playwright-report/

# Security cleanup
cleanup-*.sh
replacements.txt
bfg.jar
SECURITY_INCIDENT.md
POST_CLEANUP_CHECKLIST.md

# Docker
.dockerignore
EOF

# Create README
cat > README.md << EOF
# $PROJECT_NAME

UIForge project: $PROJECT_NAME

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
$([ "$PROJECT_TYPE" = "node" ] || [ "$PROJECT_TYPE" = "nextjs" ] && echo "npm install" || echo "pip install -e .[dev]")

# Run tests
$([ "$PROJECT_TYPE" = "node" ] || [ "$PROJECT_TYPE" = "nextjs" ] && echo "npm test" || echo "pytest")

# Start development
$([ "$PROJECT_TYPE" = "node" ] || [ "$PROJECT_TYPE" = "nextjs" ] && echo "npm run dev" || echo "python src/main.py")

# Docker development
docker-compose up -d
\`\`\`

## 🐳 Docker Development

This project includes Docker patterns for consistent development and deployment:

### Development Environment
\`\`\`bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop environment
docker-compose down
\`\`\`

### Production Deployment
\`\`\`bash
# Build production image
docker build -t $PROJECT_NAME .

# Run production container
docker run -p 3000:3000 $PROJECT_NAME

# Or use production compose
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

## 🎛️ Centralized Feature Toggles

This project includes centralized feature toggle management for the UIForge ecosystem:

### Start Unleash Instance
\`\`\`bash
# Start Unleash feature toggle service
docker run -p 4242:4242 unleashorg/unleash-server

# Check Unleash health
curl http://localhost:4242/api/health

# Access Unleash UI
open http://localhost:4242
\`\`\`

### Manage Features with CLI
\`\`\`bash
# Enable global features
./scripts/forge-features enable global.debug-mode
./scripts/forge-features enable global.beta-features

# Enable project-specific features
./scripts/forge-features enable mcp-gateway.rate-limiting
./scripts/forge-features enable uiforge-mcp.ai-chat

# Check feature status
./scripts/forge-features status --global
./scripts/forge-features status --project=mcp-gateway

# List all available features
./scripts/forge-features list
\`\`\`

## 🎛️ Feature Toggles

This project includes feature toggle patterns for dynamic feature management:

### Feature Toggle Setup
\`\`\`bash
# Install feature toggle library
npm install @uiforge/feature-toggles

# Configure feature toggles
cp feature-toggles/config/unleash.template.yml unleash.yml

# Start development with feature toggles
npm run dev:features
\`\`\`

## 📋 Requirements

EOF

if [ "$PROJECT_TYPE" = "node" ] || [ "$PROJECT_TYPE" = "nextjs" ]; then
  echo "- Node.js 22+" >> README.md
  echo "- npm 9+" >> README.md
  echo "- Docker & Docker Compose" >> README.md
elif [ "$PROJECT_TYPE" = "python" ]; then
  echo "- Python 3.12+" >> README.md
  echo "- pip" >> README.md
  echo "- Docker & Docker Compose" >> README.md
fi

cat >> README.md << EOF

## 🧪 Testing

This project uses UIForge patterns for consistent testing:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test module interactions
- **Coverage**: 80% minimum coverage requirement

Run tests with coverage:
\`\`\`bash
$([ "$PROJECT_TYPE" = "node" ] || [ "$PROJECT_TYPE" = "nextjs" ] && echo "npm run test:coverage" || echo "pytest --cov")
\`\`\`

## 🔒 Security

This project follows UIForge security patterns:

- No secrets in repository
- Automated security scanning
- Dependency vulnerability checks
- Code quality enforcement

## 📚 Documentation

- [UIForge Patterns](https://github.com/LucasSantana-Dev/uiforge-patterns)
- [Security Guidelines](docs/SECURITY.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Docker Patterns](docs/DOCKER.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and security checks
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
EOF

# Create initial source files
if [ "$PROJECT_TYPE" = "node" ] || [ "$PROJECT_TYPE" = "nextjs" ]; then
  cat > src/index.ts << EOF
/**
 * Main entry point for $PROJECT_NAME
 */

export function hello(name: string): string {
  return \`Hello, \${name}!\`;
}

if (require.main === module) {
  const name = process.argv[2] || 'World';
  console.log(hello(name));
}
EOF
elif [ "$PROJECT_TYPE" = "python" ]; then
  cat > src/main.py << EOF
"""
Main entry point for $PROJECT_NAME
"""

def hello(name: str = "World") -> str:
    """Return a greeting message."""
    return f"Hello, {name}!"


if __name__ == "__main__":
    import sys
    name = sys.argv[1] if len(sys.argv) > 1 else "World"
    print(hello(name))
EOF
fi

# Create basic test
if [ "$PROJECT_TYPE" = "node" ] || [ "$PROJECT_TYPE" = "nextjs" ]; then
  mkdir -p src/__tests__
  cat > src/__tests__/index.test.ts << EOF
import { hello } from '../index';

describe('hello function', () => {
  it('should return greeting with default name', () => {
    expect(hello('World')).toBe('Hello, World!');
  });

  it('should return greeting with custom name', () => {
    expect(hello('UIForge')).toBe('Hello, UIForge!');
  });
});
EOF
elif [ "$PROJECT_TYPE" = "python" ]; then
  mkdir -p tests
  cat > tests/test_main.py << EOF
import pytest
from src.main import hello


def test_hello_default():
    assert hello() == "Hello, World!"


def test_hello_custom():
    assert hello("UIForge") == "Hello, UIForge!"
EOF
fi

echo "✅ Project $PROJECT_NAME created successfully!"
echo ""
echo "Next steps:"
echo "1. cd $PROJECT_NAME"
echo "2. Install dependencies"
echo "3. Run tests to verify setup"
echo "4. Start development with: docker-compose up -d"
echo "5. Happy coding! 🚀"
