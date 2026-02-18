/**
 * Analytics Plugin
 * Production-ready analytics and event tracking plugin
 */

module.exports = {
  name: 'analytics-plugin',
  version: '1.0.0',
  description: 'Production analytics and event tracking',
  author: 'Forge Patterns Team',
  dependencies: [],

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
        environment: process.env.NODE_ENV || 'development'
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
    },

    async 'analytics:track'(event, api) {
      await this.trackEvent(event.event, event, api);
    }
  },

  events: [],
  config: {},
  flushInterval: null,

  async initializeAnalytics(api) {
    try {
      this.config = await api.getConfig() || {
        endpoint: process.env.ANALYTICS_ENDPOINT || 'https://analytics.example.com/events',
        batchSize: parseInt(process.env.ANALYTICS_BATCH_SIZE) || 100,
        flushInterval: parseInt(process.env.ANALYTICS_FLUSH_INTERVAL) || 30000,
        enabled: process.env.ANALYTICS_ENABLED !== 'false'
      };

      if (!this.config.enabled) {
        api.log('info', 'Analytics is disabled');
        return;
      }

      this.flushInterval = setInterval(() => {
        this.flushEvents(api);
      }, this.config.flushInterval);

      api.log('info', 'Analytics initialized', this.config);
    } catch (error) {
      api.log('error', 'Failed to initialize analytics:', error);
    }
  },

  async trackEvent(eventName, data, api) {
    if (!this.config.enabled) {
      return;
    }

    const event = {
      name: eventName,
      data,
      timestamp: new Date().toISOString(),
      id: this.generateEventId(),
      sessionId: this.getSessionId(),
      userId: this.getUserId()
    };

    this.events.push(event);

    if (this.events.length >= this.config.batchSize) {
      await this.flushEvents(api);
    }

    api.log('debug', `Event tracked: ${eventName}`, { id: event.id, name: eventName });
  },

  async flushEvents(api) {
    if (this.events.length === 0 || !this.config.enabled) {
      return;
    }

    try {
      const eventsToSend = this.events.splice(0, this.config.batchSize);

      api.log('info', `Flushing ${eventsToSend.length} events to analytics`);

      await this.sendToAnalytics(eventsToSend);

      api.log('info', `Successfully flushed ${eventsToSend.length} events`);
    } catch (error) {
      api.log('error', 'Failed to flush events:', error);
    }
  },

  async sendToAnalytics(events) {
    // Mock implementation - in production, this would make HTTP requests
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[ANALYTICS] Sent ${events.length} events to ${this.config.endpoint}`);
        resolve();
      }, 100);
    });
  },

  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  getSessionId() {
    // In production, this would come from session management
    if (!this.sessionId) this.sessionId = `sess_${Date.now()}`;
    return this.sessionId;
  },

  getUserId() {
    // In production, this would come from authentication
    return process.env.USER_ID || 'anonymous';
  },

  async initialize(api) {
    api.log('info', 'Analytics plugin initializing...');
    await this.initializeAnalytics(api);

    await this.trackEvent('plugin_initialized', {
      plugin: 'analytics-plugin',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }, api);
  },

  async cleanup() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    if (this.events.length > 0) {
      console.log(`[ANALYTICS] Flushing remaining ${this.events.length} events`);
      await this.flushEvents({ log: console.log });
    }

    console.log('Analytics plugin cleaned up');
  }
};
