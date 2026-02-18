# Plugin System

## Overview

The Forge Patterns Plugin System provides an extensible architecture that allows developers to create, load, and manage plugins dynamically. This system supports hot reloading, dependency management, and comprehensive hook-based extensibility.

## Features

- **Dynamic Plugin Loading**: Load and unload plugins at runtime
- **Hot Reload**: Automatic plugin reloading when files change
- **Dependency Management**: Handle plugin dependencies automatically
- **Hook System**: Event-driven architecture for plugin communication
- **Validation**: Comprehensive plugin structure validation
- **Configuration**: Per-plugin configuration management
- **Logging**: Structured logging for plugin activities

## Quick Start

### 1. Create a Plugin

```javascript
// plugins/my-plugin.js
module.exports = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My awesome plugin',
  author: 'Your Name',
  dependencies: [], // Optional: list of required plugins
  
  // Plugin hooks
  hooks: {
    'system:ready': async function(api) {
      api.log('info', 'Plugin initialized!');
    },
    'feature:toggle': async function(featureName, enabled, api) {
      api.log('info', `Feature ${featureName} ${enabled ? 'enabled' : 'disabled'}`);
    }
  },
  
  // Plugin initialization
  async initialize(api) {
    // Plugin setup code here
    api.log('info', 'My plugin is starting up');
  },
  
  // Plugin cleanup
  async cleanup() {
    // Cleanup code here
    console.log('My plugin is shutting down');
  }
};
```

### 2. Use the Plugin Manager

```javascript
const PluginManager = require('./plugin-manager');

// Create plugin manager
const pluginManager = new PluginManager({
  pluginDirectory: './plugins',
  enableHotReload: true,
  enableValidation: true
});

// Listen for events
pluginManager.on('system:ready', () => {
  console.log('Plugin system is ready!');
});

pluginManager.on('plugin:error', (error) => {
  console.error('Plugin error:', error);
});

// Initialize the system
await pluginManager.initialize();

// Get plugin information
const plugins = pluginManager.getAllPlugins();
console.log('Loaded plugins:', plugins.map(p => p.name));

// Emit custom hooks
const results = await pluginManager.emitHook('feature:toggle', 'dark-mode', true);
console.log('Hook results:', results);
```

## Plugin Structure

### Required Fields

- `name`: Unique plugin identifier
- `version`: Plugin version (semver recommended)

### Optional Fields

- `description`: Plugin description
- `author`: Plugin author
- `dependencies`: Array of required plugin names
- `permissions`: Array of required permissions
- `hooks`: Object containing hook handlers

### Plugin Methods

- `initialize(api)`: Called when plugin is loaded
- `cleanup()`: Called when plugin is unloaded

## Hook System

### Available Hooks

- `before:plugin:load`: Before a plugin is loaded
- `after:plugin:load`: After a plugin is loaded
- `before:plugin:unload`: Before a plugin is unloaded
- `after:plugin:unload`: After a plugin is unloaded
- `plugin:error`: When a plugin error occurs
- `system:ready`: When the plugin system is ready
- `system:shutdown`: When the plugin system is shutting down

### Custom Hooks

Plugins can define and emit custom hooks:

```javascript
// Define a custom hook
hooks: {
  'user:login': async function(user, api) {
    api.log('info', `User ${user.id} logged in`);
    return { success: true };
  }
}

// Emit the custom hook
await api.emitHook('user:login', { id: 123, name: 'John' });
```

## Plugin API

Plugins receive an API object with the following methods:

### Hook Management
- `registerHook(hookName, handler)`: Register a hook handler
- `unregisterHook(hookName, handler)`: Unregister a hook handler
- `emitHook(hookName, ...args)`: Emit a hook to all handlers

### Plugin Management
- `getPlugin(name)`: Get information about a plugin
- `getAllPlugins()`: Get all loaded plugins

### Configuration
- `getConfig(key)`: Get plugin configuration value
- `setConfig(key, value)`: Set plugin configuration value

### Logging
- `log(level, message, ...args)`: Log a message (error, warn, info, debug)

### Events
- `on(event, handler)`: Listen to system events
- `emit(event, ...args)`: Emit system events

## Configuration

### Plugin Manager Options

```javascript
const pluginManager = new PluginManager({
  pluginDirectory: './plugins',        // Plugin directory path
  enableHotReload: true,              // Enable hot reloading
  enableValidation: true,             // Enable plugin validation
  maxPlugins: 50                      // Maximum number of plugins
});
```

### Plugin Configuration

Plugins can have configuration files in `plugins/config/{plugin-name}.json`:

```json
{
  "enabled": true,
  "settings": {
    "timeout": 5000,
    "retries": 3
  }
}
```

## Best Practices

### 1. Plugin Design

- Keep plugins focused on a single responsibility
- Use descriptive names and versions
- Document your hooks and API
- Handle errors gracefully

### 2. Error Handling

```javascript
hooks: {
  'some:hook': async function(data, api) {
    try {
      // Your plugin logic here
      return processData(data);
    } catch (error) {
      api.log('error', 'Failed to process data', error);
      throw error;
    }
  }
}
```

### 3. Dependencies

```javascript
module.exports = {
  name: 'advanced-plugin',
  version: '1.0.0',
  dependencies: ['basic-plugin'], // Requires basic-plugin
  // ...
};
```

### 4. Configuration

```javascript
async initialize(api) {
  const config = await api.getConfig();
  const timeout = config.timeout || 5000;
  
  api.log('info', `Plugin initialized with timeout: ${timeout}`);
}
```

## Examples

### Feature Toggle Plugin

```javascript
module.exports = {
  name: 'feature-toggle-plugin',
  version: '1.0.0',
  description: 'Enhanced feature toggle management',
  
  hooks: {
    'feature:toggle': async function(featureName, enabled, api) {
      const config = await api.getConfig('features');
      const feature = config[featureName];
      
      if (feature && feature.analytics) {
        await api.emitHook('analytics:track', {
          event: 'feature_toggle',
          feature: featureName,
          enabled: enabled,
          timestamp: new Date().toISOString()
        });
      }
      
      api.log('info', `Feature ${featureName} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }
};
```

### Analytics Plugin

```javascript
module.exports = {
  name: 'analytics-plugin',
  version: '1.0.0',
  description: 'Analytics and tracking',
  
  hooks: {
    'analytics:track': async function(event, api) {
      // Track analytics event
      console.log('Tracking event:', event);
      
      // Store in database or send to service
      await storeEvent(event);
    }
  },
  
  async initialize(api) {
    // Initialize analytics service
    await connectAnalyticsService();
    api.log('info', 'Analytics plugin initialized');
  }
};
```

## Troubleshooting

### Common Issues

1. **Plugin fails to load**: Check plugin structure and dependencies
2. **Hot reload not working**: Ensure file system supports watching
3. **Hook not called**: Verify hook name and registration
4. **Configuration not loading**: Check config file format and permissions

### Debug Mode

Enable debug logging:

```javascript
const pluginManager = new PluginManager({
  pluginDirectory: './plugins',
  enableHotReload: true,
  debug: true
});
```

### Plugin Validation

The plugin system validates plugins automatically. To disable validation:

```javascript
const pluginManager = new PluginManager({
  enableValidation: false
});
```

## Security Considerations

1. **Plugin Permissions**: Define required permissions in plugin metadata
2. **Sandboxing**: Consider running plugins in a sandboxed environment
3. **Validation**: Always validate plugin inputs and outputs
4. **Dependencies**: Vet plugin dependencies for security issues

## Performance

- Plugin loading is asynchronous and non-blocking
- Hot reload uses file system watching for efficiency
- Hook execution is parallelized when possible
- Plugin metadata is cached for fast access

## Contributing

To contribute to the plugin system:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

This plugin system is part of the Forge Patterns project and follows the same license terms.
