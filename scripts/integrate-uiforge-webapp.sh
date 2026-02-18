#!/bin/bash

# Integration script for uiforge-webapp project
set -e

echo "🚀 Integrating Forge Patterns into UIForge WebApp..."

PROJECT_ROOT=${1:-$(pwd)}
FORGE_PATTERNS_DIR=${2:-"$(pwd)"}

if [ ! -d "$FORGE_PATTERNS_DIR" ]; then
    echo "❌ Forge Patterns directory not found: $FORGE_PATTERNS_DIR"
    exit 1
fi

echo "📁 Project root: $PROJECT_ROOT"
echo "📦 Forge Patterns: $FORGE_PATTERNS_DIR"

# Backup existing files if they exist
backup_file() {
    local file="$1"
    if [ -f "$file" ]; then
        cp "$file" "$file.backup.$(date +%Y%m%d_%H%M%S)"
        echo "📋 Backed up: $file"
    fi
}

echo "📋 Backing up existing files..."
backup_file "$PROJECT_ROOT/.eslintrc.js"
backup_file "$PROJECT_ROOT/.prettierrc.json"
backup_file "$PROJECT_ROOT/package.json"

# Copy UI/UX patterns
echo "📋 Copying UI/UX patterns..."
mkdir -p "$PROJECT_ROOT/patterns/code-quality"
mkdir -p "$PROJECT_ROOT/patterns/feature-toggles"

cp -r "$FORGE_PATTERNS_DIR/patterns/code-quality/"* "$PROJECT_ROOT/patterns/code-quality/"
cp -r "$FORGE_PATTERNS_DIR/patterns/feature-toggles/"* "$PROJECT_ROOT/patterns/feature-toggles/"

# Copy configuration files
echo "⚙️ Copying configuration files..."
cp "$FORGE_PATTERNS_DIR/.eslintrc.js" "$PROJECT_ROOT/"
cp "$FORGE_PATTERNS_DIR/.prettierrc.json" "$PROJECT_ROOT/"

# Update package.json with Forge Patterns dependencies
echo "📦 Updating package.json..."
if [ -f "$PROJECT_ROOT/package.json" ]; then
    node -e "
        const fs = require('fs');
        const projectPkg = JSON.parse(fs.readFileSync('$PROJECT_ROOT/package.json', 'utf8'));
        const forgePkg = JSON.parse(fs.readFileSync('$FORGE_PATTERNS_DIR/package.json', 'utf8'));

        // Merge devDependencies
        projectPkg.devDependencies = {
            ...projectPkg.devDependencies,
            ...forgePkg.devDependencies
        };

        // Merge scripts
        projectPkg.scripts = {
            ...projectPkg.scripts,
            ...forgePkg.scripts
        };

        fs.writeFileSync('$PROJECT_ROOT/package.json', JSON.stringify(projectPkg, null, 2));
        console.log('✅ Updated package.json');
    "
else
    echo "❌ package.json not found in project root"
    exit 1
fi

# Create integration example
echo "📄 Creating integration example..."
cat > "$PROJECT_ROOT/examples/uiforge-webapp-integration.js" << 'EOF'
// UIForge WebApp Integration Example
import { FeatureToggleManager } from '../patterns/feature-toggles/libraries/nodejs';
import { ESLintConfig } from '../patterns/code-quality/eslint/base.config';

// Initialize Forge Patterns in Next.js app
const featureToggleManager = new FeatureToggleManager({
  features: {
    'new-dashboard': {
      enabled: true,
      description: 'Enable new dashboard UI',
      rolloutPercentage: 100,
    },
    'advanced-analytics': {
      enabled: false,
      description: 'Enable advanced analytics dashboard',
      rolloutPercentage: 0,
    },
    'ai-powered-search': {
      enabled: true,
      description: 'Enable AI-powered search functionality',
      rolloutPercentage: 50,
    },
    'dark-mode': {
      enabled: true,
      description: 'Enable dark mode theme',
      rolloutPercentage: 100,
    },
  },
});

// Feature toggle hook for React components
export const useFeatureToggle = (featureName) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkFeature = async () => {
      setIsLoading(true);
      const enabled = await featureToggleManager.isEnabled(featureName);
      setIsEnabled(enabled);
      setIsLoading(false);
    };

    checkFeature();

    // Listen for feature changes
    const handleFeatureChange = (changedFeature, enabled) => {
      if (changedFeature === featureName) {
        setIsEnabled(enabled);
      }
    };

    featureToggleManager.on('featureChanged', handleFeatureChange);

    return () => {
      featureToggleManager.off('featureChanged', handleFeatureChange);
    };
  }, [featureName]);

  return { isEnabled, isLoading };
};

// Example component with feature toggle
const NewDashboard = () => {
  const { isEnabled: isNewDashboardEnabled, isLoading } = useFeatureToggle('new-dashboard');

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  if (!isNewDashboardEnabled) {
    return <LegacyDashboard />;
  }

  return (
    <div className="new-dashboard">
      <h1>Enhanced Dashboard</h1>
      <AdvancedAnalytics />
      <AIPoweredSearch />
      <DarkModeToggle />
    </div>
  );
};

// Advanced Analytics component (feature-gated)
const AdvancedAnalytics = () => {
  const { isEnabled: isAnalyticsEnabled } = useFeatureToggle('advanced-analytics');

  if (!isAnalyticsEnabled) {
    return null;
  }

  return (
    <div className="advanced-analytics">
      <h2>Advanced Analytics</h2>
      <RealTimeMetrics />
      <PredictiveInsights />
      <CustomReports />
    </div>
  );
};

// AI-Powered Search component (feature-gated)
const AIPoweredSearch = () => {
  const { isEnabled: isSearchEnabled } = useFeatureToggle('ai-powered-search');

  if (!isSearchEnabled) {
    return <BasicSearch />;
  }

  return (
    <div className="ai-search">
      <h2>AI-Powered Search</h2>
      <SmartSearchBar />
      <NaturalLanguageQueries />
      <SemanticResults />
    </div>
  );
};

// Dark Mode Toggle component (feature-gated)
const DarkModeToggle = () => {
  const { isEnabled: isDarkModeEnabled } = useFeatureToggle('dark-mode');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(isDarkModeEnabled);
  }, [isDarkModeEnabled]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    // Apply dark mode to document
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`dark-mode-toggle ${isDark ? 'dark' : 'light'}`}
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
};

// Legacy Dashboard (fallback)
const LegacyDashboard = () => {
  return (
    <div className="legacy-dashboard">
      <h1>Classic Dashboard</h1>
      <BasicMetrics />
      <SimpleReports />
    </div>
  );
};

// Basic Search (fallback)
const BasicSearch = () => {
  return (
    <div className="basic-search">
      <input type="text" placeholder="Search..." />
      <button>Search</button>
    </div>
  );
};

// Export for use in Next.js pages
export {
  NewDashboard,
  AdvancedAnalytics,
  AIPoweredSearch,
  DarkModeToggle,
  LegacyDashboard,
  BasicSearch,
  useFeatureToggle,
  featureToggleManager,
};
EOF

# Create Next.js configuration with Forge Patterns
echo "⚙️ Creating Next.js configuration..."
cat > "$PROJECT_ROOT/next.config.js" << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use Forge Patterns ESLint configuration
  eslint: {
    dirs: ['pages', 'components', 'lib', 'patterns'],
    extends: ['./patterns/code-quality/eslint/base.config.js'],
  },

  // Use Forge Patterns Prettier configuration
  prettier: {
    './patterns/**/*.{js,jsx,ts,tsx}': './patterns/code-quality/prettier/base.config.js',
  },

  // Enable experimental features
  experimental: {
    appDir: true,
    serverActions: true,
    serverComponentsExternalPackages: ['@mui/material-ui', '@emotion/react'],
  },

  // Webpack configuration for patterns
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Production optimizations
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroup: {
          default: {
            chunks: 'all',
            minSize: 20000,
            maxSize: 244000,
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
              },
              patterns: {
                patterns: {
                  test: /patterns/,
                  name: 'forge-patterns',
                  chunks: 'all',
                  priority: 10,
                },
              },
            },
          },
        },
      });
    }

    return config;
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_FEATURE_TOGGLE_API_URL: process.env.NEXT_PUBLIC_FEATURE_TOGGLE_API_URL,
    NEXT_PUBLIC_ANALYTICS_API_URL: process.env.NEXT_PUBLIC_ANALYTICS_API_URL,
    NEXT_PUBLIC_AI_SEARCH_API_URL: process.env.NEXT_PUBLIC_AI_SEARCH_API_URL,
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
EOF

# Create API routes for feature toggles
echo "📄 Creating API routes..."
mkdir -p "$PROJECT_ROOT/pages/api/feature-toggles"

cat > "$PROJECT_ROOT/pages/api/feature-toggles/index.js" << 'EOF'
import { NextApiRequest, NextApiResponse } from 'next';
import { FeatureToggleManager } from '../../../patterns/feature-toggles/libraries/nodejs';

const featureToggleManager = new FeatureToggleManager({
  features: {
    'new-dashboard': {
      enabled: true,
      description: 'Enable new dashboard UI',
      rolloutPercentage: 100,
    },
    'advanced-analytics': {
      enabled: false,
      description: 'Enable advanced analytics dashboard',
      rolloutPercentage: 0,
    },
    'ai-powered-search': {
      enabled: true,
      description: 'Enable AI-powered search functionality',
      rolloutPercentage: 50,
    },
    'dark-mode': {
      enabled: true,
      description: 'Enable dark mode theme',
      rolloutPercentage: 100,
    },
  },
});

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    // Get all features
    const features = featureToggleManager.getAllFeatures();

    return NextApiResponse.json({
      success: true,
      data: features,
    });
  }

  if (method === 'POST') {
    // Update feature toggle
    const { featureName, enabled } = req.body;

    if (!featureName || typeof enabled !== 'boolean') {
      return NextApiResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const updated = await featureToggleManager.updateFeature(featureName, enabled);

    if (!updated) {
      return NextApiResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      );
    }

    return NextApiResponse.json({
      success: true,
      data: {
        feature: featureName,
        enabled,
        message: `Feature ${featureName} ${enabled ? 'enabled' : 'disabled'}`,
      },
    });
  }

  return NextApiResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
EOF

# Create README for integration
echo "📖 Creating integration README..."
cat > "$PROJECT_ROOT/docs/forge-patterns-integration.md" << 'EOF'
# Forge Patterns Integration

This document describes how Forge Patterns v1.0.0 is integrated into the UIForge WebApp project.

## 📋 Integrated Patterns

### UI/UX Development Patterns
- **Code Quality**: ESLint and Prettier configurations
- **Feature Toggles**: Dynamic feature flag management
- **TypeScript**: Strict type checking and IntelliSense

## 🔧 Usage Examples

See `examples/uiforge-webapp-integration.js` for complete integration example.

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run validation:
   ```bash
   npm run validate
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 🎯 Feature Toggle Usage

### Using Feature Toggles in Components
```jsx
import { useFeatureToggle } from '../patterns/feature-toggles/libraries/nodejs';

const MyComponent = () => {
  const { isEnabled } = useFeatureToggle('new-feature');

  if (!isEnabled) {
    return <LegacyComponent />;
  }

  return <NewComponent />;
};
```

### Managing Features via API
```bash
# Get all features
curl http://localhost:3000/api/feature-toggles

# Enable a feature
curl -X POST http://localhost:3000/api/feature-toggles \\
  -H "Content-Type: application/json" \\
  -d '{"featureName": "new-dashboard", "enabled": true}'
```

## 📚 Documentation

- [Forge Patterns Documentation](https://github.com/LucasSantana-Dev/forge-patterns)
- [Code Quality Patterns](../patterns/code-quality/)
- [Feature Toggle Patterns](../patterns/feature-toggles/)
- [Next.js Integration Guide](https://nextjs.org/docs)
EOF

echo "✅ UIForge WebApp integration completed!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'npm install' to install dependencies"
echo "2. Run 'npm run validate' to validate integration"
echo "3. Review examples/uiforge-webapp-integration.js for usage"
echo "4. Update your React components to use feature toggles"
echo "5. Start development with 'npm run dev'"
echo ""
echo "🚀 Ready for feature-flagged development with Forge Patterns!"
