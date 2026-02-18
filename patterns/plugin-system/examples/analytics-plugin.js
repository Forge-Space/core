/**
 * Analytics Plugin Example
 * Tracks feature usage and system events
 */

module.exports = {
  name: 'analytics-plugin',
  version: '1.0.0',
  description: 'Analytics and event tracking plugin',
  author: 'Forge Patterns Team',
  dependencies: [],

  // Plugin configuration
  config: {
    endpoint: 'https://analytics.example.com/events',
    batchSize: 100,
    flushInterval: 30000 // 30 seconds
  },

  // Plugin hooks
  hooks: {
    async 'system:ready'(api) {
      api.log('info', 'Analytics plugin starting up');
      await this.initializeAnalytics(api);
    },

    async 'feature:toggle'(featureName, enabled, api) {
      await this.trackEvent('feature_toggle', {
        feature: featureName,
        enabled,
        timestamp: new Date().toISOString(),
        userAgent: this.getUserAgent()
      }, api);
    },

    async 'plugin:loaded'(plugin, api) {
      await this.trackEvent('plugin_loaded', {
        plugin: plugin.name,
        version: plugin.version,
        timestamp: new Date().toISOString()
      }, api);
    },

    async 'system:error'(error, api) {
      await this.trackEvent('system_error', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }, api);
    }
  },

  // Plugin state
  events: [],

  /**
   * Initialize analytics service
   */
  async initializeAnalytics(api) {
    try {
      // Load configuration
      this.config = await api.getConfig() || this.config;

      // Start flush interval
      this.flushInterval = setInterval(() => {
        this.flushEvents(api);
      }, this.config.flushInterval);

      api.log('info', 'Analytics initialized with config:', this.config);
    } catch (error) {
      api.log('error', 'Failed to initialize analytics:', error);
    }
  },

  /**
   * Track an event
   */
  async trackEvent(eventName, data, api) {
    const event = {
      name: eventName,
      data,
      timestamp: new Date().toISOString(),
      id: this.generateEventId()
    };

    this.events.push(event);

    // Flush immediately if batch size reached
    if (this.events.length >= this.config.batchSize) {
      await this.flushEvents(api);
    }

    api.log('debug', `Event tracked: ${eventName}`, event);
  },

  /**
   * Flush events to analytics service
   */
  async flushEvents(api) {
    if (this.events.length === 0) {
      return;
    }

    let eventsToSend = [];
    try {
      eventsToSend = this.events.splice(0, this.config.batchSize);

      // In a real implementation, this would send to an analytics service
      // For demo purposes, we'll just log the events
      api.log('info', `Flushing ${eventsToSend.length} events to analytics`);

      // Simulate API call
      await this.sendToAnalytics(eventsToSend);

      api.log('info', `Successfully flushed ${eventsToSend.length} events`);
    } catch (error) {
      api.log('error', 'Failed to flush events:', error);
      // Re-add events to queue for retry
      this.events.unshift(...eventsToSend);
    }
  },

  /**
   * Send events to analytics service (mock implementation)
   */
  async sendToAnalytics(events) {
    // Mock implementation - in reality this would make HTTP request
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[ANALYTICS] Sent ${events.length} events`);
        resolve();
      }, 100);
    });
  },

  /**
   * Generate unique event ID
   */
  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Get user agent information
   */
  getUserAgent() {
    return process.env.USER_AGENT || 'Forge Patterns Plugin System';
  },

  /**
   * Plugin initialization
   */
  async initialize(api) {
    api.log('info', 'Analytics plugin initializing...');

    // Set up configuration
    await this.initializeAnalytics(api);

    // Track plugin initialization
    await this.trackEvent('plugin_initialized', {
      plugin: 'analytics-plugin',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }, api);
  },

  /**
   * Plugin cleanup
   */
  async cleanup() {
    // Clear flush interval
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    // Flush remaining events
    if (this.events.length > 0) {
      console.log(`[ANALYTICS] Flushing remaining ${this.events.length} events`);
      await this.flushEvents({ log: console.log });
    }

    console.log('Analytics plugin cleaned up');
  }
};
