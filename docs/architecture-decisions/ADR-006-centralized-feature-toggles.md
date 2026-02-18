# ADR-006: Centralized Feature Toggle Management System

## Status

Accepted

## Context

As the UIForge ecosystem grew to include multiple projects (mcp-gateway,
uiforge-mcp, uiforge-webapp), we faced challenges with feature management:

- Inconsistent feature flags across projects
- No unified way to enable/disable features ecosystem-wide
- Difficulty coordinating beta features and experimental functionality
- Need for real-time feature control without redeployment
- Requirement for both global and project-specific features

Key requirements:

- Centralized feature management across all projects
- Support for global and project-specific feature namespaces
- Real-time feature updates without application restarts
- CLI tool for developer-friendly feature management
- Integration with existing hub-and-spoke architecture

## Decision

We implemented a **centralized feature toggle system** using Unleash as the
feature management backend with a custom CLI tool for developer interaction.

### Architecture Components

1. **Unleash Server**: Central feature flag management service
2. **forge-features CLI**: Command-line tool for feature management
3. **Feature Toggle Library**: Node.js SDK for application integration
4. **Centralized Configuration**: YAML-based feature definitions

### Feature Namespacing

- **Global Features**: `global.debug-mode`, `global.beta-features`,
  `global.experimental-ui`
- **Project-Specific**: `mcp-gateway.rate-limiting`, `uiforge-mcp.ai-chat`,
  `uiforge-webapp.dark-mode`

### Integration Points

- **Pattern Libraries**: All patterns include feature toggle integration
- **Integration Scripts**: Automatic installation of CLI tool and libraries
- **Bootstrap Scripts**: Include feature toggle setup in project initialization

## Consequences

### Positive Consequences

- **Unified Control**: Single point for managing features across entire
  ecosystem
- **Real-time Updates**: Features can be enabled/disabled without redeployment
- **Developer Experience**: CLI tool provides easy feature management
- **Consistent Behavior**: Global features work consistently across all projects
- **Beta Management**: Easy to coordinate beta releases and experimental
  features
- **Safety**: Features can be quickly disabled if issues arise

### Negative Consequences

- **Dependency on Unleash**: Centralized feature system becomes critical
  dependency
- **Infrastructure Complexity**: Additional service to deploy and maintain
- **Network Latency**: Feature lookups require network calls to Unleash
- **Single Point of Failure**: Unleash outage affects feature management across
  ecosystem

### Mitigation Strategies

- **Unleash High Availability**: Deploy Unleash with redundancy and backup
- **Local Caching**: Feature toggle library includes local caching with fallback
- **Graceful Degradation**: Applications continue functioning if Unleash is
  unavailable
- **Monitoring**: Comprehensive monitoring of Unleash availability and
  performance

## Implementation Details

### CLI Tool Usage

```bash
# Enable global features
forge-features enable global.debug-mode
forge-features enable global.beta-features

# Enable project-specific features
forge-features enable mcp-gateway.rate-limiting
forge-features enable uiforge-mcp.ai-chat

# Check feature status
forge-features status --global
forge-features status --project=mcp-gateway
```

### Library Integration

```javascript
const UIForgeFeatureToggles = require('@uiforge/feature-toggles');

const features = new UIForgeFeatureToggles({
  appName: 'uiforge-mcp',
  projectNamespace: 'uiforge-mcp'
});

// Check feature status
if (features.isEnabled('ai-chat')) {
  // Enable AI chat functionality
}

// Get feature variant
const variant = features.getVariant('ui-theme');
if (variant.name === 'dark') {
  // Apply dark theme
}
```

### Configuration Structure

```yaml
global_features_list:
  - debug-mode
  - beta-features
  - experimental-ui
  - enhanced-logging
  - maintenance-mode

projects:
  mcp-gateway:
    features:
      - rate-limiting
      - request-validation
      - security-headers
    strategies:
      default:
        - name: 'default'
          parameters: {}

  uiforge-mcp:
    features:
      - ai-chat
      - template-management
      - ui-generation
      - streaming-support
```

## Future Considerations

- **Feature Analytics**: Track feature usage and performance impact
- **A/B Testing**: Integrate with experimentation frameworks
- **Environment-Specific Features**: Different feature sets per environment
- **Feature Dependencies**: Define relationships between features
- **Automated Testing**: Test feature combinations and interactions

## Related ADRs

- [ADR-001: Hub-and-Spoke Ecosystem Architecture](ADR-001-ecosystem-design.md) -
  Updated to include feature toggle system
- [ADR-002: Gateway as Central Authority](ADR-002-gateway-central-hub.md) -
  Gateway coordinates with feature system
- [ADR-005: Integration Patterns](ADR-005-integration-patterns.md) - Updated for
  centralized feature management
