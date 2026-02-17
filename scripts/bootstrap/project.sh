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
mkdir -p src docs tests scripts

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
    "type-check": "tsc --noEmit"
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
\`\`\`

## 📋 Requirements

EOF

if [ "$PROJECT_TYPE" = "node" ] || [ "$PROJECT_TYPE" = "nextjs" ]; then
  echo "- Node.js 22+" >> README.md
  echo "- npm 9+" >> README.md
elif [ "$PROJECT_TYPE" = "python" ]; then
  echo "- Python 3.12+" >> README.md
  echo "- pip" >> README.md
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
echo "4. Start development"
echo ""
echo "Happy coding! 🚀"