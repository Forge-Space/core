# Forge Ecosystem Automated Release Pipeline

This document provides an overview of the automated release pipeline implementation across the entire Forge ecosystem, including all repositories, their specific implementations, and how they work together.

## Overview

The Forge ecosystem now has a comprehensive automated release pipeline that standardizes the release process across all repositories. Each repository type has been optimized for its specific needs while maintaining a consistent user experience and quality standards.

## Repository Overview

### 📦 Package Publishing Repositories

| Repository | Language | Platform | Status | PR | Implementation |
|------------|----------|----------|--------|---------------|
| **@forgespace/core** | TypeScript | npm | ✅ Complete | #36 | Release detection + npm publishing |
| **@forgespace/ui-mcp** | TypeScript | npm | ✅ Complete | #32 | Release detection + npm + Docker |
| **mcp-gateway** | Python | PyPI | 🔄 Ready | TBD | Release detection + PyPI + Docker |

### 🌐 Application Deployment Repositories

| Repository | Type | Environments | Status | PR | Implementation |
|------------|------|------------|--------|---------------|
| **UI** | Monorepo | Staging/Production | ✅ Complete | #7 | Release detection + deployment |

## Standardized Release Process

### 1. Release Branch Creation
```bash
# Create release branch following semantic versioning
git checkout -b release/X.Y.Z
```

### 2. Development & Testing
- Make changes on release branch
- Ensure all tests pass
- Update documentation
- Update CHANGELOG.md

### 3. Pull Request
```bash
# Create PR from release/X.Y.Z to main
git push origin release/X.Y.Z
```

### 4. Automated Release
- PR merge triggers automated detection
- Quality gates run automatically
- Platform-specific publishing occurs
- GitHub release is created
- Teams are notified

## Repository-Specific Implementations

### @forgespace/core (TypeScript/npm)

#### Features
- **Release Detection**: Automated detection of release branch merges
- **Quality Gates**: TypeScript compilation, linting, security scanning
- **npm Publishing**: Automated publishing with provenance
- **GitHub Releases**: Automatic release creation with changelog
- **Documentation**: Comprehensive process documentation

#### Workflow Files
- `.github/workflows/release.yml` - Main release pipeline
- `.github/workflows/branch-protection.yml` - Branch validation
- `docs/operations/RELEASE_PIPELINE.md` - Process documentation

#### Release Process
```
release/X.Y.Z → PR → Merge to main
↓
release.yml detects merge
↓
Quality checks → npm publish → GitHub release
```

### @forgespace/ui-mcp (TypeScript/npm/Docker)

#### Features
- **Release Detection**: Automated detection of release branch merges
- **Enhanced Deploy**: Repository dispatch integration with existing deploy.yml
- **Docker Integration**: Multi-platform Docker image building
- **npm Publishing**: Automated npm publishing with provenance
- **Quality Gates**: Comprehensive validation and testing

#### Workflow Files
- `.github/workflows/release-automation.yml` - Release detection
- `.github/workflows/deploy.yml` - Enhanced deployment workflow
- `.github/workflows/branch-protection.yml` - Branch validation
- `docs/operations/RELEASE_PIPELINE.md` - Process documentation

#### Release Process
```
release/X.Y.Z → PR → Merge to main
↓
release-automation.yml detects merge
↓
Repository dispatch → deploy.yml
↓
Quality checks → npm + Docker → GitHub release
```

### mcp-gateway (Python/PyPI/Docker)

#### Features
- **Release Detection**: Automated detection of release branch merges
- **Python Publishing**: PyPI publishing with wheel building
- **Docker Integration**: Multi-platform Docker image building
- **Quality Gates**: pytest, ruff, mypy, security scanning
- **CI Integration**: Enhanced with repository dispatch

#### Workflow Files
- `.github/workflows/release-automation.yml` - Release detection
- `.github/workflows/ci.yml` - Enhanced CI with publishing
- `.github/workflows/branch-protection.yml` - Branch validation
- `docs/operations/RELEASE_PIPELINE.md` - Process documentation

#### Release Process
```
release/X.Y.Z → PR → Merge to main
↓
release-automation.yml detects merge
↓
Repository dispatch → ci.yml
↓
Quality checks → PyPI + Docker → GitHub release
```

### UI (Monorepo/Deployment)

#### Features
- **Release Detection**: Automated detection of release branch merges
- **Deployment Automation**: Staging and production deployment
- **Health Monitoring**: Comprehensive health checks and monitoring
- **Quality Gates**: Full test suite, performance validation
- **Monorepo Integration**: Turborepo optimization

#### Workflow Files
- `.github/workflows/release-automation.yml` - Release detection
- `.github/workflows/release-branch.yml` - Enhanced deployment
- `docs/operations/RELEASE_PIPELINE.md` - Process documentation

#### Release Process
```
release/X.Y.Z → PR → Merge to main
↓
release-automation.yml detects merge
↓
Repository dispatch → release-branch.yml
↓
Quality checks → Staging → Production → GitHub release
```

## Common Patterns

### Branch Naming Convention
All repositories follow the same branch naming pattern:
- `release/X.Y.Z` where X.Y.Z follows semantic versioning
- Examples: `release/1.2.0`, `release/0.1.5`, `release/2.0.0`

### Quality Gates
All repositories implement similar quality gates:
- **Code Quality**: Linting and type checking
- **Testing**: Comprehensive test suites
- **Security**: Automated vulnerability scanning
- **Build**: Build validation and artifact creation
- **Documentation**: CHANGELOG updates and process documentation

### Release Detection
All repositories use the same release detection logic:
- Parse commit messages for release branch merges
- Extract version from branch name
- Determine version type (major/minor/patch)
- Trigger repository dispatch events

### Repository Dispatch
All repositories use repository dispatch for workflow communication:
- `release-automation.yml` detects merges
- Triggers existing deployment workflows
- Passes version and configuration data
- Enables separation of concerns

## Platform-Specific Publishing

### npm Publishing (JavaScript/TypeScript)
- **Authentication**: NPM_TOKEN with provenance
- **Process**: `npm publish --access public --provenance`
- **Validation**: Package verification after publishing
- **Registry**: https://registry.npmjs.org/

### PyPI Publishing (Python)
- **Authentication**: PYPI_API_TOKEN
- **Process**: `python -m build` → `twine upload`
- **Validation**: Package verification after publishing
- **Registry**: https://pypi.org/

### Docker Publishing
- **Authentication**: DOCKER_USERNAME/DOCKER_PASSWORD
- **Platforms**: linux/amd64, linux/arm64
- **Tagging**: Semantic version tags + latest
- **Registry**: Docker Hub

### Application Deployment
- **Environments**: Staging → Production
- **Health Checks**: Automated health monitoring
- **Rollback**: Fast rollback procedures
- **Monitoring**: Real-time performance monitoring

## Documentation Structure

Each repository has comprehensive documentation in `docs/operations/RELEASE_PIPELINE.md`:

### Common Sections
- Overview and process description
- Step-by-step release instructions
- Troubleshooting guides
- Best practices
- Security considerations

### Repository-Specific Sections
- Platform-specific publishing instructions
- Environment-specific deployment details
- Technology stack information
- Integration details

## Integration Benefits

### Developer Experience
- **Consistent Process**: Same workflow across all repositories
- **Zero Manual Steps**: Fully automated after PR merge
- **Error Prevention**: Branch validation prevents common mistakes
- **Clear Documentation**: Comprehensive guides for each repository

### Quality Assurance
- **Standardized Gates**: Consistent quality validation
- **Automated Testing**: Comprehensive test execution
- **Security Scanning**: Automated vulnerability detection
- **Performance Monitoring**: Real-time performance validation

### Ecosystem Coordination
- **Coordinated Releases**: Synchronized releases across repositories
- **Version Management**: Consistent semantic versioning
- **Cross-Repository Testing**: Integration testing across ecosystem
- **Documentation**: Ecosystem-wide process documentation

## Monitoring and Observability

### GitHub Actions
- **Real-time Status**: Live workflow execution status
- **Workflow Summaries**: Comprehensive execution summaries
- **Error Reporting**: Detailed error information
- **Success Notifications**: Automated success notifications

### Platform Monitoring
- **npm**: Package publishing status and metrics
- **PyPI**: Package publishing status and downloads
- **Docker**: Image building and publishing status
- **Applications**: Health checks and performance metrics

### Release Tracking
- **GitHub Releases**: Automatic release creation with changelog
- **Version Tags**: Semantic version tagging
- **CHANGELOG Updates**: Automatic changelog generation
- **Team Notifications**: Success/failure notifications

## Security Considerations

### Token Management
- **Secure Storage**: All tokens stored as GitHub secrets
- **Least Privilege**: Tokens have minimal required permissions
- **Rotation**: Regular token rotation procedures
- **Audit**: Token usage monitoring and auditing

### Branch Protection
- **Validation Rules**: Branch name and format validation
- **PR Requirements**: Description and testing requirements
- **Merge Protection**: Protected main branches
- **Access Control**: Role-based access control

### Security Scanning
- **Vulnerability Scanning**: Automated security vulnerability detection
- **Dependency Auditing**: Regular dependency security audits
- **Code Analysis**: Static code security analysis
- **Container Scanning**: Docker image security scanning

## Rollback Procedures

### Package Publishing Rollback
- **npm**: Contact npm support for package removal
- **PyPI**: Contact PyPI support for package removal
- **Docker**: Delete problematic Docker tags
- **GitHub**: Delete problematic releases

### Application Deployment Rollback
- **Immediate Rollback**: Use deployment platform rollback features
- **Health Monitoring**: Monitor application health during rollback
- **User Communication**: Notify users of rollback if needed
- **Issue Investigation**: Investigate root cause of issues

### Hotfix Process
- **Hotfix Branch**: Create `release/X.Y.Z+1` for fixes
- **Fast Testing**: Accelerated testing for hotfixes
- **Quick Deployment**: Expedited deployment process
- **Documentation**: Update changelog with rollback information

## Best Practices

### Before Creating Release Branch
1. **Ensure Main Stability**: Main branch should be in good state
2. **Update Dependencies**: All dependencies should be up to date
3. **Complete Features**: All intended features should be implemented
4. **Write Tests**: Ensure adequate test coverage
5. **Update Documentation**: Update relevant documentation

### During Release Development
1. **Semantic Versioning**: Follow semantic versioning guidelines
2. **CHANGELOG Updates**: Update CHANGELOG.md with user-facing changes
3. **Testing**: Test thoroughly in development environment
4. **Breaking Changes**: Document breaking changes clearly
5. **Security**: Address any security concerns

### After Release
1. **Monitor Issues**: Watch for any post-release issues
2. **Check Health**: Monitor application health and performance
3. **User Feedback**: Collect and address user feedback
4. **Next Planning**: Plan for the next release cycle
5. **Documentation**: Update any additional documentation

## Troubleshooting

### Common Issues
- **Release Not Detected**: Check commit message format and branch naming
- **Version Conflicts**: Verify version doesn't already exist
- **Publishing Failures**: Check authentication and platform configuration
- **Build Failures**: Review build logs and fix build issues
- **Test Failures**: Fix failing tests before proceeding

### Debugging Steps
1. **Check Workflow Logs**: Review GitHub Actions logs
2. **Local Testing**: Run the same checks locally
3. **Validate Configuration**: Verify workflow configuration
4. **Check Permissions**: Ensure proper permissions and tokens
5. **Review Documentation**: Consult repository-specific documentation

## Future Enhancements

### Planned Improvements
- **Cross-Repository Testing**: Automated testing across repositories
- **Monitoring Dashboard**: Ecosystem-wide monitoring dashboard
- **Release Analytics**: Release process analytics and metrics
- **Automation Optimization**: Further automation of manual processes
- **Integration Testing**: Enhanced integration testing

### Continuous Improvement
- **Process Refinement**: Ongoing process improvement
- **Tool Updates**: Regular tool and dependency updates
- **Documentation Updates**: Keep documentation current
- **Training**: Regular team training on new processes
- **Feedback Collection**: Collect and implement user feedback

## Conclusion

The Forge ecosystem now has a comprehensive, standardized automated release pipeline that:

- **Standardizes** the release process across all repositories
- **Automates** manual steps while maintaining quality
- **Integrates** seamlessly with existing workflows
- **Documents** processes comprehensively for all team members
- **Monitors** releases and deployment health
- **Secures** the release process with proper controls

This implementation provides a solid foundation for reliable, consistent, and high-quality releases across the entire Forge ecosystem.