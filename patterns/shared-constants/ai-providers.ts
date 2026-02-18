/**
 * AI provider registry shared across the Forge ecosystem.
 *
 * Centralises base URLs, supported models, rate limits, and token caps
 * for OpenAI, Anthropic, and Google AI — used by uiforge-mcp and UIForge.
 */

export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface AIProviderConfig {
  name: string;
  baseUrl: string;
  models: string[];
  maxTokens: number;
  rateLimitPerMinute: number;
  requiresOrganization?: boolean;
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    maxTokens: 128_000,
    rateLimitPerMinute: 3_500,
    requiresOrganization: true,
  },
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
    maxTokens: 200_000,
    rateLimitPerMinute: 1_000,
  },
  google: {
    name: 'Google AI',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest'],
    maxTokens: 2_097_152,
    rateLimitPerMinute: 60,
  },
};

export const AI_PROVIDERS_LIST: AIProvider[] = Object.keys(AI_PROVIDERS) as AIProvider[];

export const DEFAULT_AI_PROVIDER: AIProvider = 'openai';

export const DEFAULT_MAX_TOKENS = 2_000;

export const DEFAULT_TEMPERATURE = 0.7;

export const API_KEY_EXPIRY_DAYS = 90;

export function isValidAIProvider(value: string): value is AIProvider {
  return (AI_PROVIDERS_LIST as string[]).includes(value);
}

export function getAIProviderConfig(provider: AIProvider): AIProviderConfig {
  return AI_PROVIDERS[provider];
}
