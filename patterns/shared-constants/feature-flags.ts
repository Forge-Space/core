/**
 * Feature flag structural pattern shared across the Forge ecosystem.
 *
 * Provides the industry-standard interface, category type, and factory helper.
 * Consumer projects define their own flag names — this module provides the shape.
 *
 * @example
 * ```ts
 * import { FeatureFlag, FeatureFlagCategory, createFeatureFlags } from '@uiforge/forge-patterns/shared-constants';
 *
 * type MyFlags = 'ENABLE_DARK_MODE' | 'ENABLE_BETA';
 *
 * const flags = createFeatureFlags<MyFlags>([
 *   { name: 'ENABLE_DARK_MODE', enabled: true, description: 'Toggle dark mode', category: 'ui' },
 *   { name: 'ENABLE_BETA', enabled: false, description: 'Beta features', category: 'system' },
 * ]);
 * ```
 */

export type FeatureFlagCategory = 'auth' | 'ui' | 'generation' | 'storage' | 'analytics' | 'system';

export interface FeatureFlag<T extends string = string> {
  name: T;
  enabled: boolean;
  description: string;
  category: FeatureFlagCategory;
}

export interface FeatureFlagsConfig<T extends string = string> {
  flags: FeatureFlag<T>[];
  defaults: Record<T, boolean>;
}

/**
 * Build a Record of flag name → boolean from a list of flag definitions,
 * optionally merging runtime overrides (e.g. from environment variables).
 */
export function createFeatureFlags<T extends string>(
  definitions: FeatureFlag<T>[],
  overrides?: Partial<Record<T, boolean>>
): Record<T, boolean> {
  const result = {} as Record<T, boolean>;

  for (const flag of definitions) {
    result[flag.name] = overrides?.[flag.name] ?? flag.enabled;
  }

  return result;
}

/**
 * Read a single flag value, checking an env-var prefix first then falling back
 * to the provided default.
 *
 * @param name - Flag name (e.g. `ENABLE_DARK_MODE`)
 * @param defaultValue - Fallback when the env var is absent
 * @param envPrefix - Prefix prepended to `name` when reading from `process.env` (default: `""`)
 */
export function resolveFeatureFlag(name: string, defaultValue: boolean, envPrefix = ''): boolean {
  const envKey = `${envPrefix}${name}`;
  const envValue = process.env[envKey];

  if (envValue !== undefined) {
    return envValue === 'true';
  }

  return defaultValue;
}

/**
 * Resolve all flags in a config against the current environment.
 */
export function resolveAllFeatureFlags<T extends string>(
  definitions: FeatureFlag<T>[],
  envPrefix?: string
): Record<T, boolean> {
  const result = {} as Record<T, boolean>;

  for (const flag of definitions) {
    result[flag.name] = resolveFeatureFlag(flag.name, flag.enabled, envPrefix);
  }

  return result;
}
