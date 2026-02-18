/**
 * Forge Patterns - Main entry point
 *
 * This is the main entry point for the @uiforge/forge-patterns package.
 * It provides easy access to all patterns and utilities.
 */

// Version information
export const VERSION = '1.0.0';

// Shared constants — centralised values from mcp-gateway, uiforge-mcp, UIForge
export * from '../patterns/shared-constants/index.js';

// Type definitions
export interface ProjectConfig {
  name: string;
  patterns: string[];
  features: Record<string, boolean>;
  options: Record<string, unknown>;
}

// Main Forge Patterns class
export function createProjectConfig(
  projectName: string,
  options?: Record<string, unknown>
): ProjectConfig {
  return {
    name: projectName,
    patterns: ['code-quality', 'security', 'docker'],
    features: {
      'feature-toggles': true,
      monitoring: true
    },
    options: options ?? {}
  };
}

export class ForgePatterns {
  private static instance: ForgePatterns | undefined;

  static getInstance(): ForgePatterns {
    ForgePatterns.instance ??= new ForgePatterns();
    return ForgePatterns.instance;
  }

  /**
   * Get all available patterns
   */
  getPatterns() {
    return {
      mcpGateway: {
        routing: 'patterns/mcp-gateway/routing',
        security: 'patterns/mcp-gateway/security',
        performance: 'patterns/mcp-gateway/performance',
        authentication: 'patterns/mcp-gateway/authentication'
      },
      mcpServers: {
        aiProviders: 'patterns/mcp-servers/ai-providers',
        templates: 'patterns/mcp-servers/templates',
        uiGeneration: 'patterns/mcp-servers/ui-generation'
      },
      sharedInfrastructure: {
        sleepArchitecture: 'patterns/shared-infrastructure/sleep-architecture'
      },
      codeQuality: {
        eslint: 'patterns/code-quality/eslint',
        prettier: 'patterns/code-quality/prettier',
        typescript: 'patterns/code-quality/typescript'
      }
    };
  }

  /**
   * Get pattern path by name
   */
  getPatternPath(category: string, name: string): string {
    const patterns = this.getPatterns();
    const categoryPatterns = patterns[category as keyof typeof patterns] as Record<string, string> | undefined;

    if (categoryPatterns === undefined) {
      throw new Error(`Category not found: ${category}`);
    }

    const patternPath = categoryPatterns[name];
    if (patternPath === undefined) {
      throw new Error(`Pattern not found: ${category}.${name}`);
    }

    return patternPath;
  }

  /**
   * Validate pattern installation
   */
  validateInstallation(): boolean {
    try {
      const patterns = this.getPatterns();
      return Object.keys(patterns).length > 0;
    } catch {
      return false;
    }
  }
}

// Export default instance
export default ForgePatterns.getInstance();
