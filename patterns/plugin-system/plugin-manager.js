/**
 * Plugin System Manager
 * Provides extensible architecture for Forge Patterns with hot reload capabilities
 */

const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

/** @extends {EventEmitter} */
class PluginManager extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = {
      pluginDirectory: options.pluginDirectory || './plugins',
      enableHotReload: options.enableHotReload !== false,
      enableValidation: options.enableValidation !== false,
      maxPlugins: options.maxPlugins || 50,
      ...options
    };

    this.plugins = new Map();
    this.pluginHooks = new Map();
    this.pluginMetadata = new Map();
    this.loadedPlugins = new Set();
    this.failedPlugins = new Set();

    this.hooks = {
      'before:plugin:load': [],
      'after:plugin:load': [],
      'before:plugin:unload': [],
      'after:plugin:unload': [],
      'plugin:error': [],
      'system:ready': [],
      'system:shutdown': []
    };

    this.initialize();
  }

  /**
   * Initialize the plugin system
   */
  async initialize() {
    try {
      await this.createPluginDirectory();
      await this.loadPlugins();

      if (this.options.enableHotReload) {
        this.setupHotReload();
      }

      this.emit('system:ready');
      console.log(`Plugin Manager initialized with ${this.plugins.size} plugins`);
    } catch (error) {
      console.error('Failed to initialize Plugin Manager:', error);
      this.emit('plugin:error', error);
    }
  }

  /**
   * Create plugin directory if it doesn't exist
   */
  async createPluginDirectory() {
    try {
      await fs.access(this.options.pluginDirectory);
    } catch (error) {
      await fs.mkdir(this.options.pluginDirectory, { recursive: true });
      console.log(`Created plugin directory: ${this.options.pluginDirectory}`);
    }
  }

  /**
   * Load all plugins from the plugin directory
   */
  async loadPlugins() {
    try {
      const pluginFiles = await this.discoverPlugins();

      for (const pluginFile of pluginFiles) {
        await this.loadPlugin(pluginFile);
      }

      console.log(`Loaded ${this.plugins.size} plugins successfully`);
    } catch (error) {
      console.error('Failed to load plugins:', error);
      this.emit('plugin:error', error);
    }
  }

  /**
   * Discover plugin files in the plugin directory
   */
  async discoverPlugins() {
    const pluginFiles = [];

    try {
      const entries = await fs.readdir(this.options.pluginDirectory, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.js')) {
          pluginFiles.push(path.join(this.options.pluginDirectory, entry.name));
        } else if (entry.isDirectory()) {
          // Check for index.js in subdirectories
          const indexPath = path.join(this.options.pluginDirectory, entry.name, 'index.js');
          try {
            await fs.access(indexPath);
            pluginFiles.push(indexPath);
          } catch (error) {
            // No index.js found, skip this directory
          }
        }
      }
    } catch (error) {
      console.error('Failed to discover plugins:', error);
    }

    return pluginFiles;
  }

  /**
   * Load a single plugin
   */
  async loadPlugin(pluginPath) {
    try {
      this.emit('before:plugin:load', pluginPath);

      // Clear require cache for hot reload
      delete require.cache[require.resolve(pluginPath)];

      const pluginModule = require(pluginPath);

      // Validate plugin structure
      if (this.options.enableValidation) {
        this.validatePlugin(pluginModule, pluginPath);
      }

      const plugin = {
        name: pluginModule.name || path.basename(pluginPath, '.js'),
        version: pluginModule.version || '1.0.0',
        description: pluginModule.description || '',
        author: pluginModule.author || 'Unknown',
        path: pluginPath,
        module: pluginModule,
        loaded: new Date(),
        hooks: pluginModule.hooks || {},
        dependencies: pluginModule.dependencies || [],
        permissions: pluginModule.permissions || []
      };

      // Check dependencies
      await this.checkDependencies(plugin);

      // Register plugin hooks
      this.registerPluginHooks(plugin);

      // Store plugin
      this.plugins.set(plugin.name, plugin);
      this.pluginMetadata.set(plugin.name, {
        ...plugin,
        status: 'loaded'
      });

      this.loadedPlugins.add(plugin.name);

      // Call plugin initialize method if exists
      if (typeof pluginModule.initialize === 'function') {
        await pluginModule.initialize(this.createPluginAPI(plugin.name));
      }

      this.emit('after:plugin:load', plugin);
      console.log(`Loaded plugin: ${plugin.name} v${plugin.version}`);

    } catch (error) {
      console.error(`Failed to load plugin ${pluginPath}:`, error);
      this.failedPlugins.add(pluginPath);
      this.emit('plugin:error', { plugin: pluginPath, error });
    }
  }

  /**
   * Validate plugin structure
   */
  validatePlugin(plugin, pluginPath) {
    const requiredFields = ['name'];

    for (const field of requiredFields) {
      if (!plugin[field]) {
        throw new Error(`Plugin missing required field: ${field}`);
      }
    }

    // Validate hooks if present
    if (plugin.hooks) {
      for (const [hookName, hookFunction] of Object.entries(plugin.hooks)) {
        if (typeof hookFunction !== 'function') {
          throw new Error(`Hook ${hookName} must be a function`);
        }
      }
    }
  }

  /**
   * Check plugin dependencies
   */
  async checkDependencies(plugin) {
    for (const dependency of plugin.dependencies) {
      if (!this.plugins.has(dependency)) {
        throw new Error(`Plugin ${plugin.name} requires dependency: ${dependency}`);
      }
    }
  }

  /**
   * Register plugin hooks
   */
  registerPluginHooks(plugin) {
    for (const [hookName, hookFunction] of Object.entries(plugin.hooks)) {
      if (!this.hooks[hookName]) {
        this.hooks[hookName] = [];
      }
      this.hooks[hookName].push({
        plugin: plugin.name,
        handler: hookFunction
      });
    }
  }

  /**
   * Create plugin API
   */
  createPluginAPI(pluginName) {
    return {
      // Hook system
      registerHook: (hookName, handler) => this.registerHook(pluginName, hookName, handler),
      unregisterHook: (hookName, handler) => this.unregisterHook(pluginName, hookName, handler),
      emitHook: async (hookName, ...args) => this.emitHook(hookName, ...args),

      // Plugin management
      getPlugin: (name) => this.getPlugin(name),
      getAllPlugins: () => this.getAllPlugins(),

      // Configuration
      getConfig: async (key) => this.getPluginConfig(pluginName, key),
      setConfig: async (key, value) => this.setPluginConfig(pluginName, key, value),

      // Logging
      log: (level, message, ...args) => this.pluginLog(pluginName, level, message, ...args),

      // Events
      on: (event, handler) => this.on(event, handler),
      emit: (event, ...args) => this.emit(event, ...args)
    };
  }

  /**
   * Register a hook for a plugin
   */
  registerHook(pluginName, hookName, handler) {
    if (!this.hooks[hookName]) {
      this.hooks[hookName] = [];
    }

    this.hooks[hookName].push({
      plugin: pluginName,
      handler
    });
  }

  /**
   * Unregister a hook for a plugin
   */
  unregisterHook(pluginName, hookName, handler) {
    if (this.hooks[hookName]) {
      this.hooks[hookName] = this.hooks[hookName].filter(
        hook => !(hook.plugin === pluginName && hook.handler === handler)
      );
    }
  }

  /**
   * Emit a hook to all registered handlers
   */
  async emitHook(hookName, ...args) {
    if (!this.hooks[hookName]) {
      return [];
    }

    const results = [];

    for (const hook of this.hooks[hookName]) {
      try {
        const result = await hook.handler(...args);
        results.push({ plugin: hook.plugin, result });
      } catch (error) {
        console.error(`Hook ${hookName} failed for plugin ${hook.plugin}:`, error);
        results.push({ plugin: hook.plugin, error });
      }
    }

    return results;
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(pluginName) {
    try {
      this.emit('before:plugin:unload', pluginName);

      const plugin = this.plugins.get(pluginName);
      if (!plugin) {
        throw new Error(`Plugin not found: ${pluginName}`);
      }

      // Call plugin cleanup method if exists
      if (typeof plugin.module.cleanup === 'function') {
        await plugin.module.cleanup();
      }

      // Unregister hooks
      this.unregisterPluginHooks(pluginName);

      // Remove from collections
      this.plugins.delete(pluginName);
      this.pluginMetadata.delete(pluginName);
      this.loadedPlugins.delete(pluginName);

      // Clear require cache
      delete require.cache[require.resolve(plugin.path)];

      this.emit('after:plugin:unload', plugin);
      console.log(`Unloaded plugin: ${pluginName}`);

    } catch (error) {
      console.error(`Failed to unload plugin ${pluginName}:`, error);
      this.emit('plugin:error', { plugin: pluginName, error });
    }
  }

  /**
   * Unregister all hooks for a plugin
   */
  unregisterPluginHooks(pluginName) {
    for (const hookName of Object.keys(this.hooks)) {
      this.hooks[hookName] = this.hooks[hookName].filter(
        hook => hook.plugin !== pluginName
      );
    }
  }

  /**
   * Reload a plugin
   */
  async reloadPlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginName}`);
    }

    const pluginPath = plugin.path;
    await this.unloadPlugin(pluginName);
    await this.loadPlugin(pluginPath);
  }

  /**
   * Get plugin information
   */
  getPlugin(name) {
    return this.plugins.get(name);
  }

  /**
   * Get all plugins
   */
  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin metadata
   */
  getPluginMetadata(name) {
    return this.pluginMetadata.get(name);
  }

  /**
   * Get all plugin metadata
   */
  getAllPluginMetadata() {
    return Array.from(this.pluginMetadata.values());
  }

  /**
   * Get plugin configuration
   */
  async getPluginConfig(pluginName, key) {
    const configPath = path.join(this.options.pluginDirectory, 'config', `${pluginName}.json`);

    try {
      const config = await fs.readFile(configPath, 'utf8');
      const parsedConfig = JSON.parse(config);
      return key ? parsedConfig[key] : parsedConfig;
    } catch (error) {
      return key ? undefined : {};
    }
  }

  /**
   * Set plugin configuration
   */
  async setPluginConfig(pluginName, key, value) {
    const configDir = path.join(this.options.pluginDirectory, 'config');
    const configPath = path.join(configDir, `${pluginName}.json`);

    try {
      await fs.mkdir(configDir, { recursive: true });

      let config = {};
      try {
        const existingConfig = await fs.readFile(configPath, 'utf8');
        config = JSON.parse(existingConfig);
      } catch (error) {
        // Config file doesn't exist, start with empty object
      }

      if (typeof key === 'object') {
        // Merge object
        config = { ...config, ...key };
      } else {
        // Set single key
        config[key] = value;
      }

      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error(`Failed to set config for plugin ${pluginName}:`, error);
    }
  }

  /**
   * Plugin logging
   */
  pluginLog(pluginName, level, message, ...args) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${pluginName}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case 'error':
        console.error(logMessage, ...args);
        break;
      case 'warn':
        console.warn(logMessage, ...args);
        break;
      case 'info':
        console.info(logMessage, ...args);
        break;
      default:
        console.log(logMessage, ...args);
    }
  }

  /**
   * Setup hot reload for plugins
   */
  setupHotReload() {
    if (typeof require('fs').watch !== 'function') {
      console.warn('Hot reload not available in this environment');
      return;
    }

    const watcher = require('fs').watch(this.options.pluginDirectory, { recursive: true }, async (eventType, filename) => {
      if (filename && filename.endsWith('.js')) {
        const pluginPath = path.join(this.options.pluginDirectory, filename);
        const pluginName = path.basename(filename, '.js');

        if (this.plugins.has(pluginName)) {
          console.log(`Hot reloading plugin: ${pluginName}`);
          await this.reloadPlugin(pluginName);
        } else {
          console.log(`New plugin detected: ${pluginName}`);
          await this.loadPlugin(pluginPath);
        }
      }
    });

    watcher.on('error', (error) => {
      console.error('Plugin watcher error:', error);
    });

    console.log('Hot reload enabled for plugins');
  }

  /**
   * Shutdown the plugin system
   */
  async shutdown() {
    console.log('Shutting down Plugin Manager...');

    // Unload all plugins
    for (const pluginName of this.loadedPlugins) {
      await this.unloadPlugin(pluginName);
    }

    this.emit('system:shutdown');
    console.log('Plugin Manager shutdown complete');
  }

  /**
   * Get system statistics
   */
  getStats() {
    return {
      totalPlugins: this.plugins.size,
      loadedPlugins: this.loadedPlugins.size,
      failedPlugins: this.failedPlugins.size,
      hooks: Object.keys(this.hooks).length,
      uptime: process.uptime()
    };
  }
}

module.exports = PluginManager;
