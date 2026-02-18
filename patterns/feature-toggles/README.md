# Feature Toggle Patterns for UIForge Projects
# Open-source feature management with Unleash for zero-cost deployment

## 🎯 Overview

This directory contains feature toggle patterns designed for local development and production deployment. All patterns use self-hosted Unleash with zero licensing costs while providing comprehensive feature management capabilities.

## 📋 Available Patterns

### Feature Toggle Libraries
- **Node.js SDK**: Server-side and client-side feature toggles
- **Python SDK**: Python application feature management
- **TypeScript SDK**: Type-safe feature toggle implementation
- **React SDK**: Frontend feature toggle integration

### Toggle Strategies
- **Boolean Toggles**: Simple on/off feature switches
- **Multivariate Toggles**: Multiple value options
- **Gradual Rollout**: Progressive feature deployment
- **A/B Testing**: Controlled experiments
- **Kill Switches**: Emergency feature disabling

### Configuration Patterns
- **Environment-based**: Different toggle sets per environment
- **User-based**: Personalized feature experiences
- **Percentage-based**: Gradual rollout strategies
- **Time-based**: Scheduled feature activation

## 🚀 Quick Start

### Enable Feature Toggle Patterns
```yaml
# patterns/config/patterns-config.yml
infrastructure:
  feature_toggles: true

feature_toggles:
  provider: unleash
  local_instance: true
  database: sqlite
  port: 4242
```

### Start Unleash Instance
```bash
# Clone and start Unleash
git clone https://github.com/unleash/unleash.git
cd unleash
docker compose up -d

# Access Unleash UI
open http://localhost:4242
```

### Initialize Feature Toggles
```bash
# Create default admin user
curl -X POST http://localhost:4242/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uiforge.local","name":"Admin User"}'

# Create API token
curl -X POST http://localhost:4242/api/admin/api-tokens \
  -H "Content-Type: application/json" \
  -d '{"name":"uiforge-token","type":"CLIENT"}'
```

## 📁 Pattern Structure

```
patterns/feature-toggles/
├── libraries/          # SDK implementations
├── configurations/     # Toggle configuration files
├── strategies/        # Toggle strategy patterns
├── examples/          # Learning examples
├── unleash/           # Unleash setup and configuration
└── monitoring/        # Feature usage analytics
```

## 🔧 Configuration Examples

### Node.js Integration
```javascript
// libraries/nodejs/feature-toggles.js
const { UnleashClient } = require('unleash-client-node');

class UIForgeFeatureToggles {
  constructor(config = {}) {
    this.client = new UnleashClient({
      appName: 'uiforge-app',
      url: config.unleashUrl || 'http://localhost:4242/api',
      clientKey: config.clientKey || 'uiforge-token',
      refreshInterval: 60000, // 1 minute
      metricsInterval: 60000,  // 1 minute
    });
    
    this.context = {
      userId: null,
      sessionId: null,
      properties: {},
    };
  }

  async initialize() {
    await this.client.start();
    console.log('✅ Feature toggles initialized');
  }

  setContext(context) {
    this.context = { ...this.context, ...context };
  }

  isEnabled(featureName, defaultValue = false) {
    return this.client.isEnabled(featureName, this.context, defaultValue);
  }

  getVariant(featureName, defaultValue = { enabled: false, payload: {} }) {
    return this.client.getVariant(featureName, this.context, defaultValue);
  }

  // Specific feature methods
  isNewUIEnabled() {
    return this.isEnabled('new-ui-design', false);
  }

  getAPIStrategy() {
    return this.getVariant('api-strategy', { 
      enabled: true, 
      payload: { version: 'v1' } 
    });
  }

  isBetaFeatureEnabled(userId) {
    this.setContext({ userId });
    return this.isEnabled('beta-features', false);
  }

  async destroy() {
    await this.client.stop();
  }
}

module.exports = UIForgeFeatureToggles;
```

### Python Integration
```python
# libraries/python/feature_toggles.py
from unleash_client import UnleashClient
from typing import Dict, Any, Optional

class UIForgeFeatureToggles:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.client = UnleashClient(
            url=self.config.get('unleash_url', 'http://localhost:4242/api'),
            app_name='uiforge-app',
            client_key=self.config.get('client_key', 'uiforge-token'),
            refresh_interval=60,  # 1 minute
            metrics_interval=60,  # 1 minute
        )
        
        self.context = {
            'user_id': None,
            'session_id': None,
            'properties': {},
        }

    def initialize(self):
        """Initialize the Unleash client"""
        self.client.initialize_client()
        print("✅ Feature toggles initialized")

    def set_context(self, context: Dict[str, Any]):
        """Set the evaluation context"""
        self.context.update(context)

    def is_enabled(self, feature_name: str, default_value: bool = False) -> bool:
        """Check if a feature is enabled"""
        return self.client.is_enabled(feature_name, self.context, default_value)

    def get_variant(self, feature_name: str, default_value: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get feature variant with payload"""
        if default_value is None:
            default_value = {'enabled': False, 'payload': {}}
        return self.client.get_variant(feature_name, self.context, default_value)

    # Specific feature methods
    def is_new_ui_enabled(self) -> bool:
        """Check if new UI design is enabled"""
        return self.is_enabled('new-ui-design', False)

    def get_api_strategy(self) -> Dict[str, Any]:
        """Get API strategy variant"""
        return self.get_variant('api-strategy', {
            'enabled': True,
            'payload': {'version': 'v1'}
        })

    def is_beta_feature_enabled(self, user_id: str) -> bool:
        """Check if beta features are enabled for user"""
        self.set_context({'user_id': user_id})
        return self.is_enabled('beta-features', False)

    def destroy(self):
        """Clean up the client"""
        self.client.destroy()
```

### React Integration
```typescript
// libraries/react/FeatureToggleProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { UnleashClient } from 'unleash-client-node';

interface FeatureToggleContextType {
  isEnabled: (featureName: string, defaultValue?: boolean) => boolean;
  getVariant: (featureName: string, defaultValue?: any) => any;
  isLoading: boolean;
}

const FeatureToggleContext = createContext<FeatureToggleContextType | null>(null);

export const useFeatureToggles = () => {
  const context = useContext(FeatureToggleContext);
  if (!context) {
    throw new Error('useFeatureToggles must be used within FeatureToggleProvider');
  }
  return context;
};

interface FeatureToggleProviderProps {
  children: React.ReactNode;
  unleashUrl?: string;
  clientKey?: string;
  userId?: string;
}

export const FeatureToggleProvider: React.FC<FeatureToggleProviderProps> = ({
  children,
  unleashUrl = 'http://localhost:4242/api',
  clientKey = 'uiforge-token',
  userId
}) => {
  const [client, setClient] = useState<UnleashClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unleashClient = new UnleashClient({
      appName: 'uiforge-webapp',
      url: unleashUrl,
      clientKey,
      refreshInterval: 60000,
      metricsInterval: 60000,
    });

    unleashClient.start().then(() => {
      setClient(unleashClient);
      setIsLoading(false);
    });

    return () => {
      unleashClient.stop();
    };
  }, [unleashUrl, clientKey]);

  const isEnabled = (featureName: string, defaultValue = false) => {
    if (!client) return defaultValue;
    
    const context = {
      userId,
      properties: {},
    };
    
    return client.isEnabled(featureName, context, defaultValue);
  };

  const getVariant = (featureName: string, defaultValue = { enabled: false, payload: {} }) => {
    if (!client) return defaultValue;
    
    const context = {
      userId,
      properties: {},
    };
    
    return client.getVariant(featureName, context, defaultValue);
  };

  const value: FeatureToggleContextType = {
    isEnabled,
    getVariant,
    isLoading,
  };

  return (
    <FeatureToggleContext.Provider value={value}>
      {children}
    </FeatureToggleContext.Provider>
  );
};

// Custom hooks for specific features
export const useNewUI = () => {
  const { isEnabled } = useFeatureToggles();
  return isEnabled('new-ui-design', false);
};

export const useAPIStrategy = () => {
  const { getVariant } = useFeatureToggles();
  return getVariant('api-strategy', { enabled: true, payload: { version: 'v1' } });
};

export const useBetaFeatures = () => {
  const { isEnabled } = useFeatureToggles();
  return isEnabled('beta-features', false);
};
```

## 🎓 Learning Scenarios

### Scenario 1: Gradual Feature Rollout
```javascript
// examples/gradual-rollout.js
const rolloutPercentage = (userId, featureName) => {
  // Use user ID hash for consistent rollout
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const percentage = (hash % 100) + 1;
  
  return percentage <= getRolloutPercentage(featureName);
};

const getRolloutPercentage = (featureName) => {
  // Get rollout percentage from Unleash variant
  const variant = featureToggles.getVariant(featureName);
  return variant.payload.percentage || 0;
};
```

### Scenario 2: A/B Testing
```javascript
// examples/ab-testing.js
const getABTestVariant = (userId, testName) => {
  const variant = featureToggles.getVariant(testName);
  
  if (!variant.enabled) {
    return 'control'; // Default to control group
  }
  
  // Consistent assignment based on user ID
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variants = ['control', 'variant_a', 'variant_b'];
  const variantIndex = hash % variants.length;
  
  return variants[variantIndex];
};
```

### Scenario 3: Emergency Kill Switch
```javascript
// examples/kill-switch.js
const isFeatureSafe = (featureName) => {
  // Check if feature is enabled and not killed
  const isEnabled = featureToggles.isEnabled(featureName);
  const isKilled = featureToggles.isEnabled(`${featureName}-killed`);
  
  return isEnabled && !isKilled;
};

const emergencyDisable = async (featureName) => {
  // Emergency disable feature
  await unleashClient.updateFeature(featureName, {
    enabled: false,
    strategies: [
      {
        name: 'default',
        parameters: {},
        constraints: [],
      }
    ]
  });
  
  // Create kill switch
  await unleashClient.createFeature(`${featureName}-killed`, {
    enabled: true,
    description: `Emergency kill switch for ${featureName}`,
    strategies: [
      {
        name: 'default',
        parameters: {},
        constraints: [],
      }
    ]
  });
};
```

## 🔧 Unleash Configuration

### Docker Compose Setup
```yaml
# unleash/docker-compose.yml
version: '3.8'

services:
  unleash:
    image: unleashorg/unleash-server:latest
    ports:
      - "4242:4242"
    environment:
      - DATABASE_URL=postgres://postgres:unleash@postgres:5432/unleash
      - UNLEASH_SECRET=REPLACE_WITH_UNLEASH_SECRET
      - UNLEASH_FRONTEND_SECRET=REPLACE_WITH_FRONTEND_SECRET
    depends_on:
      - postgres
    volumes:
      - ./unleash-config.yml:/opt/unleash/unleash-config.yml

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=unleash
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=unleash
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Feature Configuration
```yaml
# unleash/unleash-config.yml
unleash:
  authentication:
    type: 'unsecure'  # For local development
    createAdminUser: true
    adminEmail: 'admin@uiforge.local'
  
  database:
    type: 'postgres'
    ssl: false
    url: 'postgres://postgres:unleash@postgres:5432/unleash'
  
  featureToggles:
    # UI Features
    - name: 'new-ui-design'
      description: 'Enable new UI design'
      enabled: true
      strategies:
        - name: 'default'
          parameters: {}
    
    - name: 'beta-features'
      description: 'Enable beta features for testing'
      enabled: false
      strategies:
        - name: 'gradual-rollout'
          parameters:
            rolloutPercentage: 10
            stickiness: 'default'
    
    - name: 'api-strategy'
      description: 'API version strategy'
      enabled: true
      strategies:
        - name: 'flexible-rollout'
          parameters:
            rolloutPercentage: 100
            stickiness: 'userId'
            groupId: 'api-version'
          variants:
            - name: 'v1'
              payload: '{"version": "v1", "endpoints": ["/api/v1/*"]}'
              weight: 70
            - name: 'v2'
              payload: '{"version": "v2", "endpoints": ["/api/v2/*"]}'
              weight: 30
```

## 📊 Monitoring Patterns

### Feature Usage Analytics
```javascript
// monitoring/feature-analytics.js
class FeatureAnalytics {
  constructor(featureToggles) {
    this.featureToggles = featureToggles;
    this.usageData = new Map();
  }

  trackFeatureUsage(featureName, userId, context = {}) {
    const timestamp = new Date().toISOString();
    const usage = {
      featureName,
      userId,
      timestamp,
      context,
      enabled: this.featureToggles.isEnabled(featureName),
    };

    if (!this.usageData.has(featureName)) {
      this.usageData.set(featureName, []);
    }
    
    this.usageData.get(featureName).push(usage);
    
    // Send to analytics (optional)
    this.sendToAnalytics(usage);
  }

  getFeatureStats(featureName) {
    const usage = this.usageData.get(featureName) || [];
    const total = usage.length;
    const enabled = usage.filter(u => u.enabled).length;
    
    return {
      featureName,
      totalUsage: total,
      enabledUsage: enabled,
      disabledUsage: total - enabled,
      enableRate: total > 0 ? (enabled / total) * 100 : 0,
      lastUpdated: usage.length > 0 ? usage[usage.length - 1].timestamp : null,
    };
  }

  sendToAnalytics(usage) {
    // Send to your analytics system
    console.log('Feature usage:', usage);
  }
}
```

## 🔄 Operations Patterns

### Feature Lifecycle Management
```bash
# scripts/feature-lifecycle.sh
#!/bin/bash

FEATURE_NAME=$1
ACTION=$2

case "$ACTION" in
  "create")
    echo "🔧 Creating feature: $FEATURE_NAME"
    curl -X POST http://localhost:4242/api/admin/features \
      -H "Content-Type: application/json" \
      -d "{\"name\":\"$FEATURE_NAME\",\"description\":\"$FEATURE_NAME\",\"enabled\":false}"
    ;;
    
  "enable")
    echo "✅ Enabling feature: $FEATURE_NAME"
    curl -X PATCH "http://localhost:4242/api/admin/features/$FEATURE_NAME" \
      -H "Content-Type: application/json" \
      -d '{"enabled":true}'
    ;;
    
  "disable")
    echo "❌ Disabling feature: $FEATURE_NAME"
    curl -X PATCH "http://localhost:4242/api/admin/features/$FEATURE_NAME" \
      -H "Content-Type: application/json" \
      -d '{"enabled":false}'
    ;;
    
  "delete")
    echo "🗑️ Deleting feature: $FEATURE_NAME"
    curl -X DELETE "http://localhost:4242/api/admin/features/$FEATURE_NAME"
    ;;
    
  "list")
    echo "📋 Listing all features:"
    curl -s http://localhost:4242/api/admin/features | jq '.features[] | {name, enabled, description}'
    ;;
    
  *)
    echo "Usage: $0 <feature-name> {create|enable|disable|delete|list}"
    exit 1
    ;;
esac
```

## 📚 Learning Resources

- [Unleash Documentation](https://docs.unleash.run/)
- [Feature Toggle Best Practices](https://docs.unleash.run/best-practices/)
- [Gradual Rollout Guide](https://docs.unleash.run/gradual-rollout/)
- [A/B Testing with Unleash](https://docs.unleash.run/ab-testing/)

## 🎯 Next Steps

1. Start Unleash instance locally
2. Create sample features for learning
3. Integrate SDK into your applications
4. Practice different toggle strategies
5. Implement monitoring and analytics
6. Experiment with advanced patterns

All feature toggle patterns are designed for **zero-cost deployment** while providing **comprehensive feature management** for production applications and certification studies.