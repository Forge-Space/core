# Python Patterns

Python patterns used across the Forge ecosystem — primarily for AI/ML tooling, automation scripts, and data processing tasks that complement the TypeScript/Node.js core.

## Directory Structure

```text
patterns/python/
├── project-template/      # Standard Python project scaffold
│   ├── pyproject.toml     # ruff + mypy + pytest config (mirrors bootstrap/project.sh)
│   ├── src/main.py        # Entry point template
│   └── tests/test_main.py # pytest test template
└── README.md
```

## When to Use Python in Forge

- **AI/ML scripts** — model inference helpers, data preprocessing, prompt engineering utilities
- **Automation tooling** — one-off data migration, report generation, batch processing
- **MCP server extensions** — Python-based MCP servers that expose AI capabilities
- **Security tooling** — custom scanners, compliance checks (e.g. Trufflehog wrappers)

## Quick Start

Bootstrap a Python project using the Forge bootstrap script:

```bash
./scripts/bootstrap/project.sh my-python-tool python
```

Or apply the template manually:

```bash
cp -r patterns/python/project-template/ my-python-tool/
cd my-python-tool
python -m venv .venv && source .venv/bin/activate
pip install -e .[dev]
```

## Toolchain

| Tool | Purpose |
| --- | --- |
| **ruff** | Linting + formatting (replaces flake8/isort/black) |
| **mypy** | Static type checking |
| **pytest** | Test runner |
| **pytest-cov** | Coverage (80% minimum — BR-003) |

## Code Style

- Python 3.12+
- Type annotations required on all public functions (`mypy --strict`)
- Line length: 100 characters
- Imports sorted by ruff (`I` rule set)
- No secrets in source — use environment variables (BR-001)

## Security Considerations

- Never hardcode credentials — use `os.environ` or `python-dotenv` with `.env.example`
- Run `./scripts/security/scan-for-secrets.sh` before every commit
- Use `{{PLACEHOLDER}}` syntax in template files (BR-001)

## Performance Targets

- Script startup: <2 seconds
- Test suite: <30 seconds for unit tests
- Coverage: ≥80% (BR-003)

## Related Patterns

- [`patterns/shell/`](../shell/) — Shell scripts that invoke Python tooling
- [`patterns/docker/`](../docker/) — Dockerfile templates for Python services
- [`scripts/bootstrap/project.sh`](../../scripts/bootstrap/project.sh) — Project bootstrapper (supports `python` type)
