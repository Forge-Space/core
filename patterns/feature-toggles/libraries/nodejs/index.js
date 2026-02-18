const { UnleashClient } = require('unleash-client-node');

/**
 * UIForge Feature Toggles Library
 * Provides feature management capabilities for UIForge applications
 */
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

  /**
   * Initialize the feature toggle client
   */
  async initialize() {
    await this.client.start();
    console.log('✅ Feature toggles initialized');
  }

  /**
   * Set the evaluation context
   * @param {Object} context - Evaluation context
   */
  setContext(context) {
    this.context = { ...this.context, ...context };
  }

  /**
   * Check if a feature is enabled
   * @param {string} featureName - Name of the feature
   * @param {boolean} defaultValue - Default value if feature not found
   * @returns {boolean} - Whether the feature is enabled
   */
  isEnabled(featureName, defaultValue = false) {
    return this.client.isEnabled(featureName, this.context, defaultValue);
  }

  /**
   * Get feature variant with payload
   * @param {string} featureName - Name of the feature
   * @param {Object} defaultValue - Default variant if feature not found
   * @returns {Object} - Feature variant with payload
   */
  getVariant(featureName, defaultValue = { enabled: false, payload: {} }) {
    return this.client.getVariant(featureName, this.context, defaultValue);
  }

  /**
   * Check if new UI design is enabled
   * @returns {boolean} - Whether new UI is enabled
   */
  isNewUIEnabled() {
    return this.isEnabled('new-ui-design', false);
  }

  /**
   * Get API strategy variant
   * @returns {Object} - API strategy variant
   */
  getAPIStrategy() {
    return this.getVariant('api-strategy', { 
      enabled: true, 
      payload: { version: 'v1' } 
    });
  }

  /**
   * Check if beta features are enabled for a user
   * @param {string} userId - User ID
   * @returns {boolean} - Whether beta features are enabled
   */
  isBetaFeatureEnabled(userId) {
    this.setContext({ userId });
    return this.isEnabled('beta-features', false);
  }

  /**
   * Get feature usage analytics
   * @returns {Object} - Feature usage statistics
   */
  getFeatureStats() {
    return {
      context: this.context,
      clientReady: this.client.isReady(),
      lastUpdate: this.client.lastUpdate,
    };
  }

  /**
   * Destroy the client and clean up resources
   */
  async destroy() {
    await this.client.stop();
  }
}

module.exports = UIForgeFeatureToggles;