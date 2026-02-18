/**
 * Network & retry constants shared across the Forge ecosystem.
 *
 * Canonical values (also used by Python consumers — see README.md):
 *   DEFAULT_TIMEOUT_MS  → GATEWAY_TIMEOUT_MS env var default
 *   MAX_RETRIES         → GATEWAY_MAX_RETRIES env var default
 *   RETRY_DELAY_MS      → GATEWAY_RETRY_DELAY_MS env var default
 *   GATEWAY_DEFAULT_URL → GATEWAY_URL env var default
 */

export const DEFAULT_TIMEOUT_MS = 120_000;

export const MIN_TIMEOUT_MS = 1_000;

export const MAX_TIMEOUT_MS = 600_000;

export const MAX_RETRIES = 3;

export const RETRY_DELAY_MS = 2_000;

export const GATEWAY_DEFAULT_URL = 'http://gateway:4444';

export const AI_ROUTER_DEFAULT_TIMEOUT_MS = 2_000;

export const AI_ROUTER_DEFAULT_WEIGHT = 0.7;

export const MAX_TOOLS_SEARCH = 10;

export const DEFAULT_TOP_N = 1;
