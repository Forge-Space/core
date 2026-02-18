export interface FeatureContext {
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
}

export interface FeatureVariant {
  enabled: boolean;
  payload?: Record<string, any>;
}

export interface FeatureConfig {
  unleashUrl?: string;
  clientKey?: string;
  refreshInterval?: number;
  metricsInterval?: number;
}

/**
 * UIForge Feature Toggles Library
 * Provides feature management capabilities for UIForge applications
 */
declare class UIForgeFeatureToggles {
  constructor(config?: FeatureConfig);
  
  /**
   * Initialize the feature toggle client
   */
  initialize(): Promise<void>;
  
  /**
   * Set the evaluation context
   */
  setContext(context: FeatureContext): void;
  
  /**
   * Check if a feature is enabled
   */
  isEnabled(featureName: string, defaultValue?: boolean): boolean;
  
  /**
   * Get feature variant with payload
   */
  getVariant(featureName: string, defaultValue?: FeatureVariant): FeatureVariant;
  
  /**
   * Check if new UI design is enabled
   */
  isNewUIEnabled(): boolean;
  
  /**
   * Get API strategy variant
   */
  getAPIStrategy(): FeatureVariant;
  
  /**
   * Check if beta features are enabled for a user
   */
  isBetaFeatureEnabled(userId: string): boolean;
  
  /**
   * Get feature usage analytics
   */
  getFeatureStats(): {
    context: FeatureContext;
    clientReady: boolean;
    lastUpdate?: Date;
  };
  
  /**
   * Destroy the client and clean up resources
   */
  destroy(): Promise<void>;
}

export default UIForgeFeatureToggles;