/**
 * MCP / JSON-RPC protocol constants shared across the Forge ecosystem.
 */

export const JSONRPC_VERSION = '2.0' as const;

export type JsonRpcVersion = typeof JSONRPC_VERSION;

export const MCP_SERVER_VERSION = '0.1.0';

export const MCP_GATEWAY_CLIENT_NAME = 'forge-mcp-gateway-client';

export const MCP_UIFORGE_SERVER_NAME = 'uiforge';

export const MCP_PROTOCOL_METHODS = {
  TOOLS_LIST: 'tools/list',
  TOOLS_CALL: 'tools/call',
  RESOURCES_LIST: 'resources/list',
  RESOURCES_READ: 'resources/read',
  PROMPTS_LIST: 'prompts/list',
  PROMPTS_GET: 'prompts/get',
} as const;

export type McpProtocolMethod = (typeof MCP_PROTOCOL_METHODS)[keyof typeof MCP_PROTOCOL_METHODS];
