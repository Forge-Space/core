/**
 * Plugin System Demo
 * Demonstrates the plugin system functionality
 */

const PluginManager = require('../plugin-manager');
const path = require('path');

async function runDemo() {
  console.log('🚀 Starting Plugin System Demo...\n');
  
  // Create plugin manager
  const pluginManager = new PluginManager({
    pluginDirectory: path.join(__dirname, '../plugins'),
    enableHotReload: true,
    enableValidation: true,
    maxPlugins: 10
  });
  
  // Set up event listeners
  pluginManager.on('system:ready', () => {
    console.log('✅ Plugin system is ready!');
  });
  
  pluginManager.on('plugin:error', (error) => {
    console.error('❌ Plugin error:', error);
  });
  
  pluginManager.on('after:plugin:load', (plugin) => {
    console.log(`📦 Plugin loaded: ${plugin.name} v${plugin.version}`);
  });
  
  pluginManager.on('after:plugin:unload', (plugin) => {
    console.log(`📤 Plugin unloaded: ${plugin.name}`);
  });
  
  try {
    // Initialize the plugin system
    await pluginManager.initialize();
    
    // Show system stats
    console.log('\n📊 System Statistics:');
    const stats = pluginManager.getStats();
    console.log(`- Total plugins: ${stats.totalPlugins}`);
    console.log(`- Loaded plugins: ${stats.loadedPlugins}`);
    console.log(`- Failed plugins: ${stats.failedPlugins}`);
    console.log(`- Registered hooks: ${stats.hooks}`);
    console.log(`- Uptime: ${Math.round(stats.uptime)}s`);
    
    // List all loaded plugins
    console.log('\n📦 Loaded Plugins:');
    const plugins = pluginManager.getAllPlugins();
    plugins.forEach(plugin => {
      console.log(`- ${plugin.name} v${plugin.version} - ${plugin.description}`);
    });
    
    // Demonstrate hook system
    console.log('\n🎯 Demonstrating Hook System:');
    
    // Emit a feature toggle event
    console.log('Emitting feature:toggle event...');
    const hookResults = await pluginManager.emitHook('feature:toggle', 'dark-mode', true);
    console.log('Hook results:', hookResults);
    
    // Emit an analytics event
    console.log('\nEmitting analytics:track event...');
    const analyticsResults = await pluginManager.emitHook('analytics:track', {
      event: 'user_action',
      action: 'login',
      timestamp: new Date().toISOString()
    });
    console.log('Analytics results:', analyticsResults);
    
    // Demonstrate plugin configuration
    console.log('\n⚙️ Plugin Configuration:');
    
    // Get analytics plugin config
    const analyticsConfig = await pluginManager.getPlugin('analytics-plugin');
    if (analyticsConfig) {
      console.log('Analytics plugin found:', analyticsConfig.name);
      
      // Set some configuration
      await pluginManager.setPluginConfig('analytics-plugin', {
        endpoint: 'https://api.example.com/analytics',
        batchSize: 50
      });
      
      // Get configuration back
      const config = await pluginManager.getPluginConfig('analytics-plugin');
      console.log('Analytics plugin config:', config);
    }
    
    // Demonstrate plugin reloading (simulated)
    console.log('\n🔄 Demonstrating Plugin Reloading:');
    
    const featurePlugin = pluginManager.getPlugin('feature-enhancer-plugin');
    if (featurePlugin) {
      console.log(`Reloading plugin: ${featurePlugin.name}`);
      await pluginManager.reloadPlugin('feature-enhancer-plugin');
      console.log('Plugin reloaded successfully');
    }
    
    // Show final statistics
    console.log('\n📊 Final System Statistics:');
    const finalStats = pluginManager.getStats();
    console.log(`- Total plugins: ${finalStats.totalPlugins}`);
    console.log(`- Loaded plugins: ${finalStats.loadedPlugins}`);
    console.log(`- Failed plugins: ${finalStats.failedPlugins}`);
    console.log(`- Registered hooks: ${finalStats.hooks}`);
    
    // Shutdown
    console.log('\n🛑 Shutting down plugin system...');
    await pluginManager.shutdown();
    console.log('✅ Plugin system shutdown complete');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo };
