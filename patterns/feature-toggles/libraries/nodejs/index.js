const { initialize } = require('unleash-client-node');

/**
 * Centralized Feature Toggle System for UIForge Ecosystem
 * Supports cross-project feature management with global and project-specific features
 */
class UIForgeFeatureToggles {
  constructor(options = {}) {
    this.config = {
      appName: options.appName || process.env.UNLEASH_APP_NAME || 'uiforge-app',
      unleashUrl: options.unleashUrl || process.env.UNLEASH_URL || 'http://localhost:4242',
      clientKey: options.clientKey || process.env.UNLEASH_CLIENT_KEY || 'default:development',
      refreshInterval: options.refreshInterval || 30000, // 30 seconds
      metricsInterval: options.metricsInterval || 60000, // 1 minute
      projectNamespace: options.projectNamespace || 'default',
      crossProject: options.crossProject !== false,
      ...options
    };

    this.context = {};
    this.client = null;
    this.globalFeatures = new Set();
    this.projectFeatures = new Set();

    this.initialize();
  }

  /**
   * Initialize the Unleash client
   */
  async initialize() {
    try {
      this.client = initialize({
        appName: this.config.appName,
        url: this.config.unleashUrl,
        clientKey: this.config.clientKey,
        refreshInterval: this.config.refreshInterval,
        metricsInterval: this.config.metricsInterval,
        ...this.config
      });

      // Wait for client to be ready
      await new Promise((resolve, reject) => {
        if (this.client.isReady()) {
          resolve();
        } else {
          this.client.on('ready', resolve);
          this.client.on('error', reject);

          // Timeout after 10 seconds
          setTimeout(() => reject(new Error('Unleash client initialization timeout')), 10000);
        }
      });

      console.log(`🎛️ Feature toggles initialized for ${this.config.appName}`);
    } catch (error) {
      console.error('❌ Failed to initialize feature toggles:', error.message);
      // Continue without feature toggles - fail gracefully
      this.client = { isReady: () => false, isEnabled: () => false };
    }
  }

  /**
   * Set user context for feature evaluation
   * @param {Object} context - User context object
   */
  setContext(context) {
    this.context = {
      ...this.context,
      ...context,
      appName: this.config.appName,
      environment: process.env.NODE_ENV || 'development'
    };
  }

  /**
   * Check if a feature is enabled
   * @param {string} featureName - Name of the feature
   * @param {boolean} defaultValue - Default value if feature not found
   * @returns {boolean} - Whether the feature is enabled
   */
  isEnabled(featureName, defaultValue = false) {
    if (!this.client || !this.client.isReady()) {
      return defaultValue;
    }

    try {
      const namespacedFeature = this.getNamespacedFeature(featureName);
      return this.client.isEnabled(namespacedFeature, this.context, defaultValue);
    } catch (error) {
      console.error(`❌ Error checking feature ${featureName}:`, error.message);
      return defaultValue;
    }
  }

  /**
   * Get feature variant
   * @param {string} featureName - Name of the feature
   * @param {Object} defaultVariant - Default variant if feature not found
   * @returns {Object} - Feature variant
   */
  getVariant(featureName, defaultVariant = { enabled: false, name: 'disabled' }) {
    if (!this.client || !this.client.isReady()) {
      return defaultVariant;
    }

    try {
      const namespacedFeature = this.getNamespacedFeature(featureName);
      return this.client.getVariant(namespacedFeature, this.context, defaultVariant);
    } catch (error) {
      console.error(`❌ Error getting variant for ${featureName}:`, error.message);
      return defaultVariant;
    }
  }

  /**
   * Update user context
   * @param {Object} context - New user context
   */
  updateUserContext(context) {
    this.setContext(context);
  }

  /**
   * Get namespaced feature name for cross-project support
   * @param {string} featureName - Original feature name
   * @returns {string} - Namespaced feature name
   */
  getNamespacedFeature(featureName) {
    if (!this.config.crossProject) {
      return featureName;
    }

    // Handle global features
    if (this.isGlobalFeature(featureName)) {
      return `global.${featureName}`;
    }

    // Handle project-specific features
    if (featureName.includes('.')) {
      return featureName; // Already namespaced
    }

    // Add project namespace
    return `${this.config.projectNamespace}.${featureName}`;
  }

  /**
   * Check if a feature is a global feature
   * @param {string} featureName - Feature name to check
   * @returns {boolean} - Whether the feature is global
   */
  isGlobalFeature(featureName) {
    const globalFeatures = [
      'debug-mode',
      'beta-features',
      'experimental-ui',
      'enhanced-logging',
      'maintenance-mode'
    ];

    return globalFeatures.includes(featureName) || featureName.startsWith('global.');
  }

  /**
   * Get all enabled features
   * @returns {Array} - Array of enabled feature names
   */
  getEnabledFeatures() {
    if (!this.client || !this.client.isReady()) {
      return [];
    }

    try {
      // This would require the Unleash client to support listing all features
      // For now, return known features that are enabled
      const knownFeatures = [
        'debug-mode',
        'beta-features',
        'experimental-ui',
        'enhanced-logging',
        'rate-limiting',
        'request-validation',
        'security-headers',
        'ai-chat',
        'template-management',
        'ui-generation',
        'dark-mode',
        'advanced-analytics'
      ];

      return knownFeatures.filter(feature => this.isEnabled(feature));
    } catch (error) {
      console.error('❌ Error getting enabled features:', error.message);
      return [];
    }
  }

  /**
   * Get feature statistics
   * @returns {Object} - Feature statistics
   */
  getFeatureStats() {
    return {
      context: this.context,
      clientReady: this.client ? this.client.isReady() : false,
      enabledFeatures: this.getEnabledFeatures(),
      projectNamespace: this.config.projectNamespace,
      crossProject: this.config.crossProject,
      unleashUrl: this.config.unleashUrl,
      appName: this.config.appName
    };
  }

  /**
   * Enable a global feature (admin operation)
   * @param {string} featureName - Feature name to enable
   * @returns {Promise<boolean>} - Success status
   */
  async enableGlobalFeature(featureName) {
    if (!this.isGlobalFeature(featureName)) {
      throw new Error(`Feature ${featureName} is not a global feature`);
    }

    try {
      const response = await fetch(`${this.config.unleashUrl}/api/admin/features`, {
        method: 'POST',
        headers: {
          Authorization: this.config.clientKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `global.${featureName}`,
          description: `Global feature: ${featureName}`,
          type: 'release',
          enabled: true,
          strategies: [
            {
              name: 'default',
              parameters: {}
            }
          ]
        })
      });

      return response.ok;
    } catch (error) {
      console.error(`❌ Error enabling global feature ${featureName}:`, error.message);
      return false;
    }
  }

  /**
   * Disable a global feature (admin operation)
   * @param {string} featureName - Feature name to disable
   * @returns {Promise<boolean>} - Success status
   */
  async disableGlobalFeature(featureName) {
    if (!this.isGlobalFeature(featureName)) {
      throw new Error(`Feature ${featureName} is not a global feature`);
    }

    try {
      const response = await fetch(
        `${this.config.unleashUrl}/api/admin/features/global.${featureName}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: this.config.clientKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            enabled: false
          })
        }
      );

      return response.ok;
    } catch (error) {
      console.error(`❌ Error disabling global feature ${featureName}:`, error.message);
      return false;
    }
  }

  /**
   * Add a project-specific feature
   * @param {string} featureName - Feature name
   * @param {string} description - Feature description
   * @returns {Promise<boolean>} - Success status
   */
  async addProjectFeature(featureName, description = '') {
    try {
      const namespacedFeature = `${this.config.projectNamespace}.${featureName}`;

      const response = await fetch(`${this.config.unleashUrl}/api/admin/features`, {
        method: 'POST',
        headers: {
          Authorization: this.config.clientKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: namespacedFeature,
          description: description || `Project feature: ${featureName}`,
          type: 'release',
          enabled: false,
          strategies: [
            {
              name: 'default',
              parameters: {}
            }
          ]
        })
      });

      if (response.ok) {
        this.projectFeatures.add(featureName);
      }

      return response.ok;
    } catch (error) {
      console.error(`❌ Error adding project feature ${featureName}:`, error.message);
      return false;
    }
  }

  /**
   * Remove a project-specific feature
   * @param {string} featureName - Feature name to remove
   * @returns {Promise<boolean>} - Success status
   */
  async removeProjectFeature(featureName) {
    try {
      const namespacedFeature = `${this.config.projectNamespace}.${featureName}`;

      const response = await fetch(
        `${this.config.unleashUrl}/api/admin/features/${namespacedFeature}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: this.config.clientKey
          }
        }
      );

      if (response.ok) {
        this.projectFeatures.delete(featureName);
      }

      return response.ok;
    } catch (error) {
      console.error(`❌ Error removing project feature ${featureName}:`, error.message);
      return false;
    }
  }

  /**
   * Get feature configuration
   * @returns {Object} - Current configuration
   */
  getFeatureConfig() {
    return {
      globalFeatures: Array.from(this.globalFeatures),
      projectFeatures: Array.from(this.projectFeatures),
      config: this.config
    };
  }

  /**
   * Destroy the client and clean up resources
   */
  destroy() {
    if (this.client && typeof this.client.destroy === 'function') {
      this.client.destroy();
    }

    this.globalFeatures.clear();
    this.projectFeatures.clear();
    this.context = {};
  }
}

// Export the class
module.exports = UIForgeFeatureToggles;
