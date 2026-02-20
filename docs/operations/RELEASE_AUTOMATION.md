# Core Package Release Automation

This document describes the automated release workflow for the
`@forgespace/core` package, including dependency management across the Forge
ecosystem.

## Overview

The release automation consists of:

- **Shell scripts** for local release management
- **GitHub Actions workflows** for CI/CD automation
- **Dependency updates** across all Forge projects
- **Quality gates** and validation procedures
- **Rollback capabilities** for safe releases

## Scripts

### 1. `release-core.sh`

Main release automation script that handles:

- Quality checks (linting, formatting, tests)
- Version bumping and CHANGELOG updates
- npm publishing
- Dependency updates across projects
- Integration testing
- GitHub release creation

**Usage:**

```bash
# Interactive release (prompts for version type)
./scripts/release-core.sh

# Specific version bump
./scripts/release-core.sh patch
./scripts/release-core.sh minor
./scripts/release-core.sh major
```

**NPM Scripts:**

```bash
npm run release          # Interactive release
npm run release:patch    # Patch version
npm run release:minor    # Minor version
npm run release:major    # Major version
```

### 2. `update-dependencies.sh`

Updates `@forgespace/core` dependency in all dependent projects:

- `uiforge-mcp`
- `uiforge-webapp`

**Usage:**

```bash
./scripts/update-dependencies.sh
npm run release:update-deps
```

### 3. `rollback-release.sh`

Rolls back to a previous version:

- Unpublishes current npm version
- Republishes previous version
- Updates dependent projects
- Validates rollback

**Usage:**

```bash
./scripts/rollback-release.sh 1.1.4
npm run release:rollback
```

### 4. `validate-release.sh`

Validates release quality and integration:

- Package structure validation
- Version consistency checks
- Build and test validation
- npm availability verification

**Usage:**

```bash
./scripts/validate-release.sh
npm run release:validate
```

## Release Process

### Automated Release (Recommended)

1. **Create release branch:**

   ```bash
   git checkout -b release/1.2.0
   ```

2. **Make changes and commit:**

   ```bash
   # Make your changes
   git add .
   git commit -m "feat: prepare for 1.2.0 release"
   ```

3. **Merge to main:**

   ```bash
   git checkout main
   git merge release/1.2.0
   git push origin main
   ```

4. **GitHub Actions will:**
   - Detect release merge
   - Run quality checks
   - Update version and CHANGELOG
   - Publish to npm
   - Update dependent projects
   - Create GitHub release
   - Validate integration

### Manual Release (Local)

1. **Run release script:**

   ```bash
   ./scripts/release-core.sh minor
   ```

2. **Script will:**
   - Run quality checks
   - Prompt for version confirmation
   - Update package.json and CHANGELOG
   - Publish to npm
   - Update dependencies
   - Create GitHub release

## Quality Gates

The release process includes these quality checks:

### Pre-Release

- **Linting**: ESLint with auto-fix
- **Formatting**: Prettier formatting check
- **Type Checking**: TypeScript compilation
- **Tests**: Unit and integration tests
- **Security**: npm audit and Snyk scan
- **Build**: Project build validation

### Post-Release

- **npm Availability**: Package availability check
- **Dependency Updates**: Successful updates in all projects
- **Integration Tests**: Validation of dependent projects
- **Version Consistency**: Version alignment across ecosystem

## Dependency Management

### Supported Projects

- **uiforge-mcp**: UIForge MCP server
- **uiforge-webapp**: UIForge web application

### Update Process

1. Install latest `@forgespace/core` version
2. Update package-lock.json
3. Run project build
4. Execute project tests
5. Commit changes with standardized message

### Rollback Process

1. Unpublish current version from npm
2. Republish previous version
3. Update all dependent projects
4. Validate rollback success

## Error Handling

### Common Issues

**npm Publish Failures:**

- Check npm authentication (`npm whoami`)
- Verify package name availability
- Check version conflicts

**Dependency Update Failures:**

- Verify project accessibility
- Check build compatibility
- Review test failures

**Quality Check Failures:**

- Fix linting errors (`npm run lint`)
- Resolve formatting issues (`npm run format`)
- Address test failures

### Recovery Procedures

**Partial Release Failure:**

1. Check logs for specific failure point
2. Fix underlying issue
3. Run rollback if needed
4. Retry release process

**Complete Release Failure:**

1. Use rollback script to revert
2. Investigate root cause
3. Fix issues before retry

## Configuration

### Environment Variables

- `NPM_TOKEN`: npm authentication token
- `GITHUB_TOKEN`: GitHub API token
- `SNYK_TOKEN`: Snyk security scanning token

### Project Configuration

- **package.json**: Version and scripts
- **CHANGELOG.md**: Release notes
- **.npmrc**: npm registry configuration

## Monitoring

### Release Metrics

- Release success rate
- Time to complete release
- Dependency update success
- Integration test results

### Notifications

- Slack notifications for release status
- GitHub release notifications
- Email alerts for failures

## Best Practices

### Before Release

1. Ensure all tests pass locally
2. Update CHANGELOG with meaningful notes
3. Verify dependency compatibility
4. Check security scan results

### During Release

1. Monitor automated process
2. Review quality gate results
3. Validate dependency updates
4. Check integration test results

### After Release

1. Verify npm package availability
2. Check dependent project builds
3. Monitor for issues
4. Update documentation if needed

## Troubleshooting

### Debug Mode

Enable verbose logging:

```bash
DEBUG=1 ./scripts/release-core.sh
```

### Dry Run Mode

Test release without publishing:

```bash
DRY_RUN=1 ./scripts/release-core.sh
```

### Force Operations

Force dependency updates:

```bash
FORCE=1 ./scripts/update-dependencies.sh
```

## Security Considerations

- **Token Security**: Use environment variables for sensitive tokens
- **Access Control**: Limit release permissions to authorized users
- **Audit Trail**: Maintain logs of all release operations
- **Rollback Security**: Secure rollback procedures

## Integration with CI/CD

### GitHub Actions

The automated workflow integrates with:

- Quality gate checks
- Security scanning
- Dependency management
- Release notifications

### Local Development

Use scripts for local testing:

```bash
# Test release process
./scripts/validate-release.sh

# Test dependency updates
./scripts/update-dependencies.sh
```

## Future Enhancements

Planned improvements:

- **Automatic Dependency Detection**: Auto-discover new dependent projects
- **Release Notes Generation**: AI-powered release note creation
- **Performance Metrics**: Release performance tracking
- **Multi-Registry Support**: Support for multiple npm registries
