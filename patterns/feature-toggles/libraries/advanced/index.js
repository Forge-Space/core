/**
 * Advanced Feature Toggle System
 * Provides A/B testing, analytics, and advanced rollout strategies
 */

const { initialize } = require('unleash-client-node');

// Constants
const DEFAULT_REFRESH_INTERVAL = 15000;
const DEFAULT_METRICS_INTERVAL = 60000;
const DEFAULT_TIME_SERIES_LIMIT = 1000;
const DEFAULT_PERFORMANCE_LIMIT = 100;
const PERFORMANCE_THRESHOLD = 100;
const STATISTICAL_SIGNIFICANCE_THRESHOLD = 0.05;
const MAX_CONFIDENCE = 0.95;

class AdvancedFeatureToggles {
  constructor(options = {}) {
    this.options = {
      appName: options.appName || 'default-app',
      projectNamespace: options.projectNamespace || 'default',
      unleashUrl: options.unleashUrl || process.env.UNLEASH_URL || 'http://localhost:4242',
      clientKey: options.clientKey || process.env.UNLEASH_CLIENT_KEY || 'default:development',
      refreshInterval: options.refreshInterval || DEFAULT_REFRESH_INTERVAL,
      metricsInterval: options.metricsInterval || DEFAULT_METRICS_INTERVAL,
      enableAnalytics: options.enableAnalytics !== false,
      enableABTesting: options.enableABTesting !== false,
      ...options
    };

    this.unleash = null;
    this.metrics = {
      featureUsage: new Map(),
      abTestResults: new Map(),
      performanceMetrics: new Map(),
      userSessions: new Map()
    };

    this.abTests = new Map();
    this.rolloutStrategies = new Map();
    this.analyticsCallbacks = [];

    this.initialize();
  }

  async initialize() {
    try {
      this.unleash = initialize({
        appName: this.options.appName,
        url: this.options.unleashUrl,
        clientKey: this.options.clientKey,
        refreshInterval: {
          interval: this.options.refreshInterval
        }
      });

      // Start metrics collection
      if (this.options.enableAnalytics) {
        this.startMetricsCollection();
      }

      // Load A/B test configurations
      if (this.options.enableABTesting) {
        await this.loadABTestConfigurations();
      }

       
      console.log(`Advanced Feature Toggles initialized for ${this.options.appName}`);
    } catch (error) {
       
      console.error('Failed to initialize Advanced Feature Toggles:', error);
      throw error;
    }
  }

  /**
   * Check if a feature is enabled with A/B testing support
   */
  isEnabled(featureName, context = {}) {
    const result = this.unleash.isEnabled(featureName, context);

    // Record metrics
    this.recordFeatureUsage(featureName, result, context);

    // Check if this feature is part of an A/B test
    const abTest = this.abTests.get(featureName);
    if (abTest && abTest.isActive) {
      return this.handleABTest(featureName, context, abTest);
    }

    return result;
  }

  /**
   * Get feature variant with A/B testing support
   */
  getVariant(featureName, context = {}) {
    const variant = this.unleash.getVariant(featureName, context);

    // Record metrics
    this.recordFeatureUsage(featureName, variant, context);

    // Check if this feature is part of an A/B test
    const abTest = this.abTests.get(featureName);
    if (abTest && abTest.isActive) {
      return this.handleABTestVariant(featureName, context, variant, abTest);
    }

    return variant;
  }

  /**
   * Set user context for personalized features
   */
  setContext(context) {
    this.unleash.setContext(context);
  }

  /**
   * Create an A/B test
   */
  createABTest(config) {
    const abTest = {
      id: config.id || this.generateTestId(),
      featureName: config.featureName,
      name: config.name,
      description: config.description,
      variants: config.variants || [
        { name: 'control', weight: 50 },
        { name: 'variant-a', weight: 50 }
      ],
      targetAudience: config.targetAudience || {},
      successMetrics: config.successMetrics || [],
      startDate: config.startDate || new Date(),
      endDate: config.endDate || null,
      isActive: false,
      results: {
        participants: 0,
        conversions: {},
        metrics: {}
      }
    };

    this.abTests.set(abTest.featureName, abTest);
    return abTest;
  }

  /**
   * Start an A/B test
   */
  startABTest(featureName) {
    const abTest = this.abTests.get(featureName);
    if (!abTest) {
      throw new Error(`No A/B test found for feature: ${featureName}`);
    }

    abTest.isActive = true;
    abTest.startDate = new Date();

     
    console.log(`A/B test started for feature: ${featureName}`);
    return abTest;
  }

  /**
   * Stop an A/B test and generate results
   */
  stopABTest(featureName) {
    const abTest = this.abTests.get(featureName);
    if (!abTest) {
      throw new Error(`No A/B test found for feature: ${featureName}`);
    }

    abTest.isActive = false;
    abTest.endDate = new Date();

    const results = this.generateABTestResults(abTest);
    abTest.results = results;

     
    console.log(`A/B test stopped for feature: ${featureName}`);
     
    console.log('Results:', results);

    return results;
  }

  /**
   * Record conversion for A/B testing
   */
  recordConversion(featureName, conversionType, value = 1, context = {}) {
    const abTest = this.abTests.get(featureName);
    if (!abTest || !abTest.isActive) {
      return false;
    }

    const variant = this.getVariant(featureName, context);
    const variantName = variant.name;

    if (!abTest.results.conversions[variantName]) {
      abTest.results.conversions[variantName] = {
        total: 0,
        [conversionType]: 0
      };
    }

    abTest.results.conversions[variantName].total++;
    abTest.results.conversions[variantName][conversionType] += value;

    return true;
  }

  /**
   * Create rollout strategy
   */
  createRolloutStrategy(config) {
    const strategy = {
      id: config.id || this.generateStrategyId(),
      featureName: config.featureName,
      name: config.name,
      type: config.type || 'gradual', // gradual, instant, scheduled
      phases: config.phases || [],
      targetMetrics: config.targetMetrics || [],
      rollbackConditions: config.rollbackConditions || [],
      isActive: false,
      currentPhase: 0,
      results: {
        rolloutProgress: 0,
        userImpact: {},
        metrics: {}
      }
    };

    this.rolloutStrategies.set(strategy.featureName, strategy);
    return strategy;
  }

  /**
   * Execute rollout strategy
   */
  executeRolloutStrategy(featureName) {
    const strategy = this.rolloutStrategies.get(featureName);
    if (!strategy) {
      throw new Error(`No rollout strategy found for feature: ${featureName}`);
    }

    strategy.isActive = true;
    strategy.currentPhase = 0;

     
    console.log(`Rollout strategy started for feature: ${featureName}`);
    return this.executeRolloutPhase(strategy);
  }

  /**
   * Get analytics data
   */
  getAnalytics(timeRange = '24h') {
    const analytics = {
      timeRange,
      featureUsage: {},
      abTests: {},
      rolloutStrategies: {},
      performance: {},
      userSessions: {}
    };

    // Aggregate feature usage
    for (const [feature, data] of this.metrics.featureUsage) {
      analytics.featureUsage[feature] = this.aggregateTimeSeriesData(data, timeRange);
    }

    // Aggregate A/B test results
    for (const [feature, test] of this.abTests) {
      analytics.abTests[feature] = {
        ...test,
        analytics: this.aggregateABTestAnalytics(test)
      };
    }

    // Aggregate rollout strategy results
    for (const [feature, strategy] of this.rolloutStrategies) {
      analytics.rolloutStrategies[feature] = {
        ...strategy,
        analytics: this.aggregateRolloutAnalytics(strategy)
      };
    }

    return analytics;
  }

  /**
   * Add analytics callback
   */
  addAnalyticsCallback(callback) {
    this.analyticsCallbacks.push(callback);
  }

  /**
   * Get feature recommendations based on usage patterns
   */
  getFeatureRecommendations() {
    const recommendations = [];

    // Analyze feature usage patterns
    for (const [feature, data] of this.metrics.featureUsage) {
      const usage = this.aggregateTimeSeriesData(data, '7d');

      // Low usage features
      if (usage.enabledCount < usage.totalCount * 0.1) {
        recommendations.push({
          type: 'low_usage',
          feature,
          message: `Feature ${feature} has low usage (${usage.enabledCount}/${usage.totalCount})`,
          suggestion: 'Consider improving documentation or removing the feature'
        });
      }

      // High error rate features
      if (usage.errorCount > usage.totalCount * 0.05) {
        recommendations.push({
          type: 'high_error_rate',
          feature,
          message: `Feature ${feature} has high error rate (${usage.errorCount}/${usage.totalCount})`,
          suggestion: 'Review implementation and add error handling'
        });
      }

      // Performance issues
      const avgResponseTime = usage.totalResponseTime / usage.enabledCount;
      if (avgResponseTime > PERFORMANCE_THRESHOLD) {
        recommendations.push({
          type: 'performance_issue',
          feature,
          message: `Feature ${feature} has slow response time (${avgResponseTime.toFixed(2)}ms)`,
          suggestion: 'Optimize implementation or consider caching'
        });
      }
    }

    return recommendations;
  }

  /**
   * Private methods
   */

  handleABTest(featureName, context, abTest) {
    const userId = context.userId || 'anonymous';
    const userGroup = this.assignUserToGroup(userId, abTest.variants);

    // Record A/B test participation
    abTest.results.participants++;

    // Store user group assignment
    if (!this.metrics.userSessions.has(userId)) {
      this.metrics.userSessions.set(userId, {});
    }
    this.metrics.userSessions.get(userId)[featureName] = userGroup;

    // Return result based on user group
    return userGroup === 'control'
      ? this.unleash.isEnabled(featureName, context)
      : this.unleash.isEnabled(`${featureName}-${userGroup}`, context);
  }

  handleABTestVariant(featureName, context, variant, abTest) {
    const userId = context.userId || 'anonymous';
    const userGroup = this.assignUserToGroup(userId, abTest.variants);

    // Record A/B test participation
    abTest.results.participants++;

    // Store user group assignment
    if (!this.metrics.userSessions.has(userId)) {
      this.metrics.userSessions.set(userId, {});
    }
    this.metrics.userSessions.get(userId)[featureName] = userGroup;

    // Return variant based on user group
    if (userGroup === variant.name) {
      return variant;
    }

    // Find variant for user's group
    return abTest.variants.find(v => v.name === userGroup) || variant;
  }

  assignUserToGroup(userId, variants) {
    // Simple hash-based assignment for consistent grouping
    const hash = this.hashCode(userId);
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    const normalizedHash = Math.abs(hash) % totalWeight;

    let currentWeight = 0;
    for (const variant of variants) {
      currentWeight += variant.weight;
      if (normalizedHash < currentWeight) {
        return variant.name;
      }
    }

    return variants[0].name;
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  recordFeatureUsage(featureName, result, context) {
    if (!this.metrics.featureUsage.has(featureName)) {
      this.metrics.featureUsage.set(featureName, {
        totalCount: 0,
        enabledCount: 0,
        disabledCount: 0,
        errorCount: 0,
        totalResponseTime: 0,
        lastAccess: new Date(),
        timeSeries: []
      });
    }

    const metrics = this.metrics.featureUsage.get(featureName);
    const timestamp = Date.now();

    metrics.totalCount++;
    metrics.lastAccess = new Date();

    if (result === true || (result && result.enabled)) {
      metrics.enabledCount++;
    } else if (result === false || (result && !result.enabled)) {
      metrics.disabledCount++;
    } else {
      metrics.errorCount++;
    }

    // Record time series data
    metrics.timeSeries.push({
      timestamp,
      result: typeof result === 'object' ? result.enabled : result,
      context: context.userId || 'anonymous'
    });

    // Keep only last 1000 data points
    if (metrics.timeSeries.length > DEFAULT_TIME_SERIES_LIMIT) {
      metrics.timeSeries = metrics.timeSeries.slice(-DEFAULT_TIME_SERIES_LIMIT);
    }

    // Trigger analytics callbacks
    this.analyticsCallbacks.forEach(callback => {
      try {
        callback({
          type: 'feature_usage',
          featureName,
          result,
          context,
          timestamp
        });
      } catch (error) {
         
        console.error('Analytics callback error:', error);
      }
    });
  }

  generateABTestResults(abTest) {
    const duration = abTest.endDate - abTest.startDate;
    const results = {
      duration,
      participants: abTest.results.participants,
      conversions: abTest.results.conversions,
      conversionRates: {},
      statisticalSignificance: {},
      winner: null,
      confidence: 0
    };

    // Calculate conversion rates
    for (const [variant, data] of Object.entries(abTest.results.conversions)) {
      const totalConversions = Object.values(data).reduce((sum, val) => sum + val, 0);
      results.conversionRates[variant] = totalConversions / data.total;
    }

    // Determine winner (simple approach based on conversion rate)
    let maxRate = 0;
    for (const [variant, rate] of Object.entries(results.conversionRates)) {
      if (rate > maxRate) {
        maxRate = rate;
        results.winner = variant;
      }
    }

    return results;
  }

  executeRolloutPhase(strategy) {
    const phase = strategy.phases[strategy.currentPhase];
    if (!phase) {
      return { completed: true };
    }

    // Execute phase logic based on type
    switch (strategy.type) {
      case 'gradual':
        return this.executeGradualRollout(strategy, phase);
      case 'instant':
        return this.executeInstantRollout(strategy, phase);
      case 'scheduled':
        return this.executeScheduledRollout(strategy, phase);
      default:
        return { completed: true };
    }
  }

  executeGradualRollout(strategy, phase) {
    const progress = phase.percentage || 0;
    strategy.results.rolloutProgress = progress;

    // Update user impact based on progress
    strategy.results.userImpact = {
      affectedUsers: Math.floor(progress * 1000), // Estimate
      rolloutPercentage: progress
    };

    // Check if phase is complete
    if (progress >= 100) {
      strategy.currentPhase++;
      if (strategy.currentPhase >= strategy.phases.length) {
        strategy.isActive = false;
        return { completed: true };
      }
    }

    return { completed: false, nextPhase: strategy.currentPhase };
  }

  executeInstantRollout(strategy, phase) {
    strategy.results.rolloutProgress = 100;
    strategy.results.userImpact = {
      affectedUsers: 'all',
      rolloutPercentage: 100
    };

    strategy.currentPhase++;
    if (strategy.currentPhase >= strategy.phases.length) {
      strategy.isActive = false;
      return { completed: true };
    }

    return { completed: false, nextPhase: strategy.currentPhase };
  }

  executeScheduledRollout(strategy, phase) {
    const now = new Date();
    const scheduledTime = new Date(phase.scheduledTime);

    if (now >= scheduledTime) {
      return this.executeGradualRollout(strategy, phase);
    }

    return { completed: false, scheduledTime };
  }

  startMetricsCollection() {
    setInterval(() => {
      this.collectMetrics();
    }, this.options.metricsInterval);
  }

  collectMetrics() {
    // Collect performance metrics
    const metrics = {
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
      activeFeatures: this.metrics.featureUsage.size,
      activeABTests: Array.from(this.abTests.values()).filter(test => test.isActive).length,
      activeRollouts: Array.from(this.rolloutStrategies.values()).filter(strategy => strategy.isActive).length
    };

    this.metrics.performanceMetrics.set(Date.now(), metrics);

    // Keep only last 100 data points
    if (this.metrics.performanceMetrics.size > DEFAULT_PERFORMANCE_LIMIT) {
      const keys = Array.from(this.metrics.performanceMetrics.keys()).sort((a, b) => b - a);
      keys.slice(DEFAULT_PERFORMANCE_LIMIT).forEach(key => this.metrics.performanceMetrics.delete(key));
    }
  }

  aggregateTimeSeriesData(data, timeRange) {
    const now = Date.now();
    const timeRangeMs = this.parseTimeRange(timeRange);
    const cutoff = now - timeRangeMs;

    const filtered = data.timeSeries.filter(point => point.timestamp >= cutoff);

    return {
      totalCount: filtered.length,
      enabledCount: filtered.filter(p => p.result === true).length,
      disabledCount: filtered.filter(p => p.result === false).length,
      errorCount: filtered.filter(p => typeof p.result !== 'boolean').length,
      timeRange,
      data: filtered
    };
  }

  parseTimeRange(timeRange) {
    const units = {
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000,
      'w': 7 * 24 * 60 * 60 * 1000,
      'm': 60 * 1000
    };

    const match = timeRange.match(/^(\d+)([hdwm])$/);
    if (match) {
      const [, number, unit] = match;
      return parseInt(number) * units[unit];
    }

    return 24 * 60 * 60 * 1000; // Default to 24 hours
  }

  aggregateABTestAnalytics(abTest) {
    return {
      duration: abTest.endDate ? abTest.endDate - abTest.startDate : Date.now() - abTest.startDate,
      participantRate: abTest.results.participants / 1000, // Estimate total users
      conversionRates: abTest.results.conversions,
      statisticalSignificance: this.calculateStatisticalSignificance(abTest)
    };
  }

  aggregateRolloutAnalytics(strategy) {
    return {
      duration: strategy.isActive ? Date.now() - strategy.startDate : strategy.endDate - strategy.startDate,
      progress: strategy.results.rolloutProgress,
      userImpact: strategy.results.userImpact,
      currentPhase: strategy.currentPhase,
      totalPhases: strategy.phases.length
    };
  }

  calculateStatisticalSignificance(abTest) {
    // Simplified statistical significance calculation
    // In a real implementation, you'd use proper statistical tests
    const {conversions} = abTest.results;
    const variants = Object.keys(conversions);

    if (variants.length < 2) {
      return { significant: false, confidence: 0 };
    }

    const rates = variants.map(v => conversions[v].total / conversions[v].total);
    const maxRate = Math.max(...rates);
    const minRate = Math.min(...rates);
    const difference = maxRate - minRate;

    return {
      significant: difference > STATISTICAL_SIGNIFICANCE_THRESHOLD, // 5% difference threshold
      confidence: Math.min(difference * 20, MAX_CONFIDENCE) // Simple confidence calculation
    };
  }

  generateTestId() {
    return `ab-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateStrategyId() {
    return `strategy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async loadABTestConfigurations() {
    // Load A/B test configurations from file or database
    // This is a placeholder for actual implementation
    try {
      // Example: Load from configuration file
      const fs = require('fs').promises;
      const path = require('path');

      const configPath = path.join(__dirname, '../config/ab-tests.json');
      if (await fs.access(configPath).then(() => true).catch(() => false)) {
        const config = await fs.readFile(configPath, 'utf8');
        const tests = JSON.parse(config);

        for (const test of tests) {
          this.abTests.set(test.featureName, test);
        }
      }
    } catch (error) {
       
      console.log('No A/B test configurations found, using defaults');
    }
  }
}

module.exports = AdvancedFeatureToggles;
