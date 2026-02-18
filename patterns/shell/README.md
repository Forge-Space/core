# Shell Patterns

Bash scripting conventions and reusable guards used across all Forge shell scripts — `scripts/security/`, `scripts/bootstrap/`, CI pipelines, and Docker entrypoints.

## Directory Structure

```text
patterns/shell/
├── conventions/
│   ├── header.sh   # Standard script header (set -euo pipefail, color helpers)
│   └── guard.sh    # Command availability guards and safe file operations
└── README.md
```

## Conventions

Every Forge shell script must start with the standard header:

```bash
#!/bin/bash
# scripts/<category>/<name>.sh
set -euo pipefail
```

- `set -e` — exit immediately on error
- `set -u` — treat unset variables as errors
- `set -o pipefail` — propagate pipe failures

## Color Output

Use the helpers from `conventions/header.sh` for consistent terminal output:

```bash
source patterns/shell/conventions/header.sh

print_success "Build complete"
print_error   "Missing dependency: docker"
print_warning "Gitleaks not installed — skipping"
print_info    "Running security scan..."
```

## Command Guards

Always guard optional tools with `command -v` before invoking:

```bash
if command -v gitleaks &>/dev/null; then
  gitleaks detect --verbose --config=.gitleaks.yml
else
  print_warning "gitleaks not installed — skipping"
fi
```

## Security Considerations

- Never `eval` untrusted input
- Quote all variable expansions: `"$VAR"` not `$VAR`
- Use `mktemp` for temporary files; clean up with `trap`
- No secrets in scripts — use environment variables (BR-001)

## Testing Shell Scripts

Use [shellcheck](https://www.shellcheck.net/) for static analysis:

```bash
shellcheck scripts/**/*.sh
```

All Forge shell scripts must pass `shellcheck` with no warnings.

## Related Patterns

- [`scripts/security/`](../../scripts/security/) — Secret scanning scripts (canonical examples)
- [`scripts/bootstrap/project.sh`](../../scripts/bootstrap/project.sh) — Project bootstrapper
- [`patterns/python/`](../python/) — Python tooling invoked by shell scripts
- [`patterns/docker/`](../docker/) — Docker entrypoint scripts
