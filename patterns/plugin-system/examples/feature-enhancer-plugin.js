/**
 * Feature Enhancer Plugin Example
 * Enhances feature toggles with additional capabilities
 */

module.exports = {
  name: 'feature-enhancer-plugin',
  version: '1.0.0',
  description: 'Enhances feature toggles with A/B testing and analytics',
  author: 'Forge Patterns Team',
  dependencies: ['analytics-plugin'],

  // Plugin hooks
  hooks: {
    async 'system:ready'(api) {
      api.log('info', 'Feature Enhancer plugin starting up');
      await this.initializeEnhancer(api);
    },

    async 'feature:toggle'(featureName, enabled, api) {
      const enhancement = await this.enhanceFeatureToggle(featureName, enabled, api);

      if (enhancement.abTest) {
        await this.handleABTest(featureName, enabled, enhancement, api);
      }

      if (enhancement.analytics) {
        await this.trackFeatureUsage(featureName, enabled, enhancement, api);
      }

      if (enhancement.notifications) {
        await this.sendNotifications(featureName, enabled, enhancement, api);
      }

      api.log('info', `Enhanced feature toggle: ${featureName}`, enhancement);
    },

    async 'feature:ab:test'(testConfig, api) {
      await this.createABTest(testConfig, api);
    },

    async 'feature:analytics'(featureData, api) {
      await this.analyzeFeatureUsage(featureData, api);
    }
  },

  // Plugin state
  enhancements: new Map(),
  abTests: new Map(),
  analytics: new Map(),

  /**
   * Initialize the enhancer
   */
  async initializeEnhancer(api) {
    try {
      // Load enhancement configurations
      await this.loadEnhancements(api);

      // Initialize A/B testing framework
      await this.initializeABTesting(api);

      // Set up analytics collection
      await this.initializeAnalytics(api);

      api.log('info', 'Feature Enhancer initialized successfully');
    } catch (error) {
      api.log('error', 'Failed to initialize Feature Enhancer:', error);
    }
  },

  /**
   * Load feature enhancements
   */
  async loadEnhancements(api) {
    const config = await api.getConfig('enhancements') || {};

    // Default enhancements
    const defaultEnhancements = {
      'dark-mode': {
        abTest: true,
        analytics: true,
        notifications: false,
        variants: ['control', 'dark', 'auto'],
        weights: [40, 30, 30]
      },
      'beta-features': {
        abTest: false,
        analytics: true,
        notifications: true,
        rolloutStrategy: 'gradual'
      },
      'advanced-analytics': {
        abTest: true,
        analytics: true,
        notifications: true,
        variants: ['basic', 'advanced', 'enterprise'],
        weights: [50, 30, 20]
      }
    };

    this.enhancements = new Map([
      ...Object.entries(defaultEnhancements),
      ...Object.entries(config)
    ]);

    api.log('info', `Loaded ${this.enhancements.size} feature enhancements`);
  },

  /**
   * Initialize A/B testing framework
   */
  async initializeABTesting(api) {
    // Set up A/B test configuration
    this.abTestConfig = {
      sampleSize: 1000,
      confidenceLevel: 0.95,
      testDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
      minSampleSize: 100
    };

    api.log('info', 'A/B testing framework initialized');
  },

  /**
   * Initialize analytics collection
   */
  async initializeAnalytics(api) {
    api.log('info', 'Analytics collection initialized');
  },

  /**
   * Enhance a feature toggle
   */
  async enhanceFeatureToggle(featureName, enabled, _api) {
    const enhancement = this.enhancements.get(featureName) || {
      abTest: false,
      analytics: false,
      notifications: false
    };

    // Apply enhancement logic
    if (enhancement.abTest && enabled) {
      enhancement.variant = this.assignVariant(featureName, enhancement);
    }

    if (enhancement.rolloutStrategy && enabled) {
      enhancement.rolloutPercentage = this.calculateRolloutPercentage(featureName);
    }

    return enhancement;
  },

  /**
   * Assign user to A/B test variant
   */
  assignVariant(featureName, enhancement) {
    const hash = this.hashUser(featureName);
    const variants =
      Array.isArray(enhancement.variants) && enhancement.variants.length > 0
        ? enhancement.variants
        : ['control', 'variant'];
    const weights = enhancement.weights || variants.map(() => 100 / variants.length);

    let cumulativeWeight = 0;
    for (let i = 0; i < variants.length; i++) {
      cumulativeWeight += weights[i];
      if (hash < cumulativeWeight) {
        return variants[i];
      }
    }

    return variants[0]; // fallback
  },

  /**
   * Hash user for consistent variant assignment
   */
  hashUser(featureName) {
    // Simple hash function - in production, use proper user ID
    const userId = process.env.USER_ID || 'anonymous';
    const combined = `${featureName}:${userId}`;
    let hash = 0;

    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  },

  /**
   * Calculate rollout percentage
   */
  calculateRolloutPercentage(featureName) {
    const rolloutData = this.analytics.get(featureName) || { enabledCount: 0, totalCount: 0 };

    if (rolloutData.totalCount === 0) {
      return 0; // Start with 0% rollout
    }

    // Gradual rollout strategy
    const percentage = Math.min(100, (rolloutData.enabledCount / rolloutData.totalCount) * 100 * 2);

    return Math.round(percentage);
  },

  /**
   * Handle A/B test logic
   */
  async handleABTest(featureName, enabled, enhancement, api) {
    if (!enhancement.variant) {
      return;
    }

    // Track A/B test assignment
    await api.emitHook('analytics:track', {
      event: 'ab_test_assignment',
      feature: featureName,
      variant: enhancement.variant,
      enabled,
      timestamp: new Date().toISOString()
    });

    // Store test data
    if (!this.abTests.has(featureName)) {
      this.abTests.set(featureName, {
        started: new Date(),
        variants: enhancement.variants,
        weights: enhancement.weights,
        assignments: new Map()
      });
    }

    const testData = this.abTests.get(featureName);
    const currentCount = testData.assignments.get(enhancement.variant) || 0;
    testData.assignments.set(enhancement.variant, currentCount + 1);

    api.log('info', `A/B test assignment: ${featureName} -> ${enhancement.variant}`);
  },

  /**
   * Track feature usage
   */
  async trackFeatureUsage(featureName, enabled, enhancement, api) {
    // Update analytics data
    if (!this.analytics.has(featureName)) {
      this.analytics.set(featureName, {
        enabledCount: 0,
        totalCount: 0,
        firstSeen: new Date(),
        lastSeen: new Date()
      });
    }

    const analyticsData = this.analytics.get(featureName);
    analyticsData.totalCount++;
    if (enabled) {
      analyticsData.enabledCount++;
    }
    analyticsData.lastSeen = new Date();

    // Emit analytics event
    await api.emitHook('analytics:track', {
      event: 'feature_usage',
      feature: featureName,
      enabled,
      variant: enhancement.variant,
      rolloutPercentage: enhancement.rolloutPercentage,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Send notifications
   */
  async sendNotifications(featureName, enabled, enhancement, api) {
    const notification = {
      type: enabled ? 'feature_enabled' : 'feature_disabled',
      feature: featureName,
      message: this.generateNotificationMessage(featureName, enabled, enhancement),
      timestamp: new Date().toISOString()
    };

    await api.emitHook('notification:send', notification);

    api.log('info', `Notification sent for feature: ${featureName}`);
  },

  /**
   * Generate notification message
   */
  generateNotificationMessage(featureName, enabled, enhancement) {
    if (enabled) {
      if (enhancement.variant) {
        return `Feature "${featureName}" is now enabled with variant: ${enhancement.variant}`;
      } else if (enhancement.rolloutPercentage !== undefined) {
        return `Feature "${featureName}" is now enabled (${enhancement.rolloutPercentage}% rollout)`;
      }
        return `Feature "${featureName}" is now enabled`;

    }
      return `Feature "${featureName}" has been disabled`;

  },

  /**
   * Create A/B test
   */
  async createABTest(testConfig, api) {
    const { featureName, variants, weights, duration } = testConfig;

    // Store test configuration
    this.abTests.set(featureName, {
      started: new Date(),
      variants,
      weights,
      duration,
      assignments: new Map()
    });

    // Update enhancement configuration
    const enhancement = this.enhancements.get(featureName) || {};
    enhancement.abTest = true;
    enhancement.variants = variants;
    enhancement.weights = weights;
    this.enhancements.set(featureName, enhancement);

    api.log('info', `A/B test created for feature: ${featureName}`);
  },

  /**
   * Analyze feature usage
   */
  async analyzeFeatureUsage(featureData, api) {
    const { featureName, timeRange } = featureData;

    const analyticsData = this.analytics.get(featureName);
    const testData = this.abTests.get(featureName);

    const analysis = {
      feature: featureName,
      timeRange,
      usage: analyticsData,
      abTest: testData,
      insights: this.generateInsights(analyticsData, testData)
    };

    await api.emitHook('analytics:report', analysis);

    api.log('info', `Analysis completed for feature: ${featureName}`);
  },

  /**
   * Generate insights from data
   */
  generateInsights(analyticsData, testData) {
    const insights = [];

    if (analyticsData) {
      const usageRate = (analyticsData.enabledCount / analyticsData.totalCount) * 100;
      insights.push(`Usage rate: ${usageRate.toFixed(2)}%`);

      if (usageRate > 80) {
        insights.push('High usage - consider making permanent');
      } else if (usageRate < 20) {
        insights.push('Low usage - consider improvements or removal');
      }
    }

    if (testData && testData.assignments.size > 0) {
      const totalAssignments = Array.from(testData.assignments.values()).reduce((a, b) => a + b, 0);
      insights.push(`A/B test participants: ${totalAssignments}`);

      // Find winning variant (simplified)
      let maxAssignments = 0;
      let winningVariant = null;

      for (const [variant, count] of testData.assignments) {
        if (count > maxAssignments) {
          maxAssignments = count;
          winningVariant = variant;
        }
      }

      if (winningVariant) {
        insights.push(`Leading variant: ${winningVariant} (${maxAssignments} assignments)`);
      }
    }

    return insights;
  },

  /**
   * Plugin initialization
   */
  async initialize(api) {
    api.log('info', 'Feature Enhancer plugin initializing...');

    // Initialize all components
    await this.initializeEnhancer(api);

    // Track plugin initialization
    await api.emitHook('analytics:track', {
      event: 'plugin_initialized',
      plugin: 'feature-enhancer-plugin',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Plugin cleanup
   */
  async cleanup() {
    // Save any pending analytics data
    console.log('Feature Enhancer plugin cleaning up...');

    // Clear in-memory data
    this.enhancements.clear();
    this.abTests.clear();
    this.analytics.clear();

    console.log('Feature Enhancer plugin cleaned up');
  }
};
