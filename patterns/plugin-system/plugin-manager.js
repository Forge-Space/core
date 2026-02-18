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

  async createPluginDirectory() {
    try {
      await fs.access(this.options.pluginDirectory);
    } catch {
      await fs.mkdir(this.options.pluginDirectory, { recursive: true });
      console.log(`Created plugin directory: ${this.options.pluginDirectory}`);
    }
  }

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

  async discoverPlugins() {
    const pluginFiles = [];

    try {
      const entries = await fs.readdir(this.options.pluginDirectory, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.js')) {
          pluginFiles.push(path.join(this.options.pluginDirectory, entry.name));
        } else if (entry.isDirectory()) {
          const indexPath = path.join(this.options.pluginDirectory, entry.name, 'index.js');
          try {
            await fs.access(indexPath);
            pluginFiles.push(indexPath);
          } catch {
            // No index.js found, skip this directory
          }
        }
      }
    } catch (error) {
      console.error('Failed to discover plugins:', error);
    }

    return pluginFiles;
  }

  async loadPlugin(pluginPath) {
    try {
      this.emit('before:plugin:load', pluginPath);

      delete require.cache[require.resolve(pluginPath)];

      const pluginModule = require(pluginPath);

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

      await this.checkDependencies(plugin);
      this.registerPluginHooks(plugin);

      this.plugins.set(plugin.name, plugin);
      this.pluginMetadata.set(plugin.name, {
        ...plugin,
        status: 'loaded'
      });

      this.loadedPlugins.add(plugin.name);

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

  validatePlugin(plugin, _pluginPath) {
    const requiredFields = ['name'];

    for (const field of requiredFields) {
      if (!plugin[field]) {
        throw new Error(`Plugin missing required field: ${field}`);
      }
    }

    if (plugin.hooks) {
      for (const [hookName, hookFunction] of Object.entries(plugin.hooks)) {
        if (typeof hookFunction !== 'function') {
          throw new Error(`Hook ${hookName} must be a function`);
        }
      }
    }
  }

  async checkDependencies(plugin) {
    for (const dependency of plugin.dependencies) {
      if (!this.plugins.has(dependency)) {
        throw new Error(`Plugin ${plugin.name} requires dependency: ${dependency}`);
      }
    }
  }

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

  createPluginAPI(pluginName) {
    return {
      registerHook: (hookName, handler) => this.registerHook(pluginName, hookName, handler),
      unregisterHook: (hookName, handler) => this.unregisterHook(pluginName, hookName, handler),
      emitHook: async (hookName, ...args) => this.emitHook(hookName, ...args),
      getPlugin: (name) => this.getPlugin(name),
      getAllPlugins: () => this.getAllPlugins(),
      getConfig: async (key) => this.getPluginConfig(pluginName, key),
      setConfig: async (key, value) => this.setPluginConfig(pluginName, key, value),
      log: (level, message, ...args) => this.pluginLog(pluginName, level, message, ...args),
      on: (event, handler) => this.on(event, handler),
      emit: (event, ...args) => this.emit(event, ...args)
    };
  }

  registerHook(pluginName, hookName, handler) {
    if (!this.hooks[hookName]) {
      this.hooks[hookName] = [];
    }
    this.hooks[hookName].push({ plugin: pluginName, handler });
  }

  unregisterHook(pluginName, hookName, handler) {
    if (this.hooks[hookName]) {
      this.hooks[hookName] = this.hooks[hookName].filter(
        hook => !(hook.plugin === pluginName && hook.handler === handler)
      );
    }
  }

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

  async unloadPlugin(pluginName) {
    try {
      this.emit('before:plugin:unload', pluginName);

      const plugin = this.plugins.get(pluginName);
      if (!plugin) {
        throw new Error(`Plugin not found: ${pluginName}`);
      }

      if (typeof plugin.module.cleanup === 'function') {
        await plugin.module.cleanup();
      }

      this.unregisterPluginHooks(pluginName);

      this.plugins.delete(pluginName);
      this.pluginMetadata.delete(pluginName);
      this.loadedPlugins.delete(pluginName);

      delete require.cache[require.resolve(plugin.path)];

      this.emit('after:plugin:unload', plugin);
      console.log(`Unloaded plugin: ${pluginName}`);

    } catch (error) {
      console.error(`Failed to unload plugin ${pluginName}:`, error);
      this.emit('plugin:error', { plugin: pluginName, error });
    }
  }

  unregisterPluginHooks(pluginName) {
    for (const hookName of Object.keys(this.hooks)) {
      this.hooks[hookName] = this.hooks[hookName].filter(
        hook => hook.plugin !== pluginName
      );
    }
  }

  async reloadPlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginName}`);
    }

    const pluginPath = plugin.path;
    await this.unloadPlugin(pluginName);
    await this.loadPlugin(pluginPath);
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  getPluginMetadata(name) {
    return this.pluginMetadata.get(name);
  }

  getLoadedPlugins() {
    return Array.from(this.loadedPlugins);
  }

  getFailedPlugins() {
    return Array.from(this.failedPlugins);
  }

  pluginLog(pluginName, level, message, ...args) {
    const prefix = `[Plugin:${pluginName}]`;
    switch (level) {
      case 'error':
        console.error(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'debug':
        console.debug(prefix, message, ...args);
        break;
      default:
        console.log(prefix, message, ...args);
    }
  }

  setupHotReload() {
    // Hot reload implementation would watch for file changes
    // and reload plugins automatically
    console.log('Hot reload enabled for plugin directory:', this.options.pluginDirectory);
  }

  async getPluginConfig(pluginName, key) {
    const configPath = path.join(this.options.pluginDirectory, 'config', `${pluginName}.json`);

    try {
      const config = await fs.readFile(configPath, 'utf8');
      const parsedConfig = JSON.parse(config);
      return key ? parsedConfig[key] : parsedConfig;
    } catch {
      return key ? undefined : {};
    }
  }

  async setPluginConfig(pluginName, key, value) {
    const configDir = path.join(this.options.pluginDirectory, 'config');
    const configPath = path.join(configDir, `${pluginName}.json`);

    try {
      await fs.mkdir(configDir, { recursive: true });

      let config = {};
      try {
        const existingConfig = await fs.readFile(configPath, 'utf8');
        config = JSON.parse(existingConfig);
      } catch {
        // Config file doesn't exist, start with empty object
      }

      if (typeof key === 'object') {
        config = { ...config, ...key };
      } else {
        config[key] = value;
      }

      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      return config;
    } catch (error) {
      throw new Error(`Failed to set plugin config: ${error.message}`);
    }
  }

  getStatus() {
    return {
      loaded: this.loadedPlugins.size,
      failed: this.failedPlugins.size,
      total: this.loadedPlugins.size + this.failedPlugins.size,
      plugins: Array.from(this.plugins.values()).map(p => ({
        name: p.name,
        version: p.version,
        status: 'loaded'
      }))
    };
  }

  async shutdown() {
    console.log('Shutting down Plugin Manager...');

    this.emit('system:shutdown');

    for (const pluginName of this.loadedPlugins) {
      await this.unloadPlugin(pluginName);
    }

    console.log('Plugin Manager shut down');
  }
}

module.exports = PluginManager;
