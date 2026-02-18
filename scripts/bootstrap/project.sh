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
mkdir -p src docs tests scripts kubernetes localstack cost feature-toggles

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

# Copy Kubernetes patterns
echo "☸️ Adding Kubernetes patterns..."
mkdir -p kubernetes
mkdir -p kubernetes/clusters
mkdir -p kubernetes/manifests
cp ../patterns/kubernetes/clusters/setup-k3s.sh kubernetes/clusters/
cp ../patterns/kubernetes/manifests/deployment.template.yaml kubernetes/manifests/
cp ../patterns/kubernetes/manifests/service.template.yaml kubernetes/manifests/
cp ../patterns/kubernetes/manifests/ingress.template.yaml kubernetes/manifests/
chmod +x kubernetes/clusters/setup-k3s.sh

# Copy LocalStack patterns
echo "🔧 Adding LocalStack patterns..."
mkdir -p localstack
cp ../patterns/localstack/docker-compose.yml localstack/
cp ../patterns/localstack/README.md localstack/
mkdir -p localstack/terraform
mkdir -p localstack/scripts
cp ../patterns/localstack/terraform/provider.tf localstack/terraform/ 2>/dev/null || echo "# LocalStack Terraform provider" > localstack/terraform/provider.tf

# Copy cost monitoring patterns
echo "💰 Adding cost monitoring patterns..."
mkdir -p cost
mkdir -p cost/scripts
cp ../patterns/cost/README.md cost/
cp ../patterns/cost/scripts/free-tier-tracker.sh cost/scripts/
chmod +x cost/scripts/free-tier-tracker.sh

# Copy feature toggles patterns
echo "🎛️ Adding feature toggle patterns..."
mkdir -p feature-toggles
mkdir -p feature-toggles/libraries
mkdir -p feature-toggles/config
cp ../patterns/feature-toggles/README.md feature-toggles/
cp ../patterns/feature-toggles/libraries/nodejs/package.json feature-toggles/libraries/ 2>/dev/null || echo "# Feature toggles for Node.js" > feature-toggles/libraries/nodejs/README.md

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
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop environment
docker-compose down
```

### Production Deployment
```bash
# Build production image
docker build -t $PROJECT_NAME .

# Run production container
docker run -p 3000:3000 $PROJECT_NAME

# Or use production compose
docker-compose -f docker-compose.prod.yml up -d
```

## ☸️ Kubernetes Development

This project includes Kubernetes patterns for container orchestration:

### Local Kubernetes Setup
```bash
# Set up local k3s cluster
./kubernetes/clusters/setup-k3s.sh

# Apply manifests
kubectl apply -f kubernetes/manifests/

# View pods
kubectl get pods
```

### Kubernetes Deployment
```bash
# Deploy to Kubernetes
kubectl apply -f kubernetes/manifests/deployment.yaml
kubectl apply -f kubernetes/manifests/service.yaml

# Check deployment status
kubectl rollout status deployment/$PROJECT_NAME
```

## 🔧 LocalStack Development

This project includes LocalStack patterns for AWS service emulation:

### Start LocalStack
```bash
# Start LocalStack services
docker-compose -f localstack/docker-compose.yml up -d

# Check service health
curl http://localhost:4566/health

# Access LocalStack UI
open http://localhost:8080
```

### AWS CLI Configuration
```bash
# Configure AWS CLI for LocalStack
aws configure set aws-access-key-id test
aws configure set aws-secret-access-key test
aws configure set default.region us-west-2
aws configure set default.endpoint-url http://localhost:4566
```

## 💰 Cost Monitoring

This project includes cost monitoring patterns for zero-cost development:

### Track Free Tier Usage
```bash
# Check AWS free tier usage
./cost/scripts/free-tier-tracker.sh

# Generate cost report
./cost/scripts/cost-report.sh

# Monitor optimization opportunities
./cost/scripts/optimization-suggestions.sh
```

## 🎛️ Feature Toggles

This project includes feature toggle patterns for dynamic feature management:

### Feature Toggle Setup
```bash
# Install feature toggle library
npm install @uiforge/feature-toggles

# Configure feature toggles
cp feature-toggles/config/unleash.template.yml unleash.yml

# Start development with feature toggles
npm run dev:features
```
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
