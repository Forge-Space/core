/**
 * Client-side storage (IndexedDB) structural pattern shared across the Forge ecosystem.
 *
 * Provides a typed config interface and factory — consumer projects supply
 * their own DB name and store names.
 *
 * @example
 * ```ts
 * import { createStorageConfig } from '@uiforge/forge-patterns/shared-constants';
 *
 * const storageConfig = createStorageConfig('myapp_storage', ['api_keys', 'user_preferences']);
 * ```
 */

export const DEFAULT_DB_VERSION = 1;

export interface IndexedDBStoreConfig {
  dbName: string;
  version: number;
  stores: string[];
}

/**
 * Create a typed IndexedDB configuration object.
 *
 * @param dbName - The database name (e.g. `"uiforge_storage"`)
 * @param stores - List of object store names
 * @param version - DB schema version (default: `DEFAULT_DB_VERSION`)
 */
export function createStorageConfig(
  dbName: string,
  stores: string[],
  version: number = DEFAULT_DB_VERSION,
): IndexedDBStoreConfig {
  return { dbName, version, stores };
}

/**
 * Common store name conventions used across Forge projects.
 * Consumer projects may use these or define their own.
 */
export const COMMON_STORE_NAMES = {
  API_KEYS: 'api_keys',
  USER_PREFERENCES: 'user_preferences',
  SESSIONS: 'sessions',
  CACHE: 'cache',
} as const;

export type CommonStoreName = (typeof COMMON_STORE_NAMES)[keyof typeof COMMON_STORE_NAMES];
