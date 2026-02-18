# ADR-001: Hub-and-Spoke Ecosystem Architecture

## Status
Accepted

## Context
The UIForge ecosystem consists of three main components: a management interface, a central coordination service, and specialized AI generation servers. We needed to decide on the overall architectural pattern that would balance modularity, performance, and maintainability while supporting future growth.

Key considerations:
- Need for centralized authentication and routing
- Requirement for specialized AI generation capabilities
- Desire for modular, independently deployable components
- Need for scalable architecture supporting multiple users
- Requirement for clear separation of concerns

## Decision
We chose a **hub-and-spoke architecture** with the forge-mcp-gateway as the central hub and specialized MCP servers as spokes. This means:

- **Central Hub (Gateway)**: Handles authentication, routing, virtual server management, and coordination
- **Specialized Spokes (MCP Servers)**: Focus on specific capabilities like UI generation, with minimal cross-cutting concerns
- **Management Interface**: Connects to the hub for all operations

## Consequences

### Positive Consequences
- **Centralized Authentication**: Single point of authentication and authorization across the ecosystem
- **Independent Scaling**: MCP servers can be scaled independently based on demand
- **Clear Boundaries**: Well-defined responsibilities and interfaces between components
- **Extensibility**: Easy to add new MCP servers without modifying existing components
- **Simplified Deployment**: Each component can be deployed and updated independently

### Negative Consequences
- **Gateway Bottleneck Risk**: The gateway becomes a critical component that could become a bottleneck
- **Network Latency**: All requests must pass through the gateway, adding network hops
- **Complexity**: Additional infrastructure for managing the gateway and its state
- **Single Point of Failure**: Gateway failure affects the entire ecosystem

## Alternatives Considered

### Alternative 1: Fully Distributed Architecture
- Each component handles its own authentication and routing
- Direct communication between components as needed
- **Rejected**: Increased complexity in authentication management and security

### Alternative 2: Monolithic Architecture
- All functionality in a single application
- Shared database and codebase
- **Rejected**: Lacked modularity and independent deployment capabilities

### Alternative 3: Microservices with Service Mesh
- Multiple microservices with service mesh for communication
- Distributed authentication and configuration
- **Rejected**: Added unnecessary complexity for current scale and requirements

## Rationale
The hub-and-spoke pattern was chosen because it provides the best balance of:
- **Simplicity**: Clear architecture with well-defined responsibilities
- **Scalability**: Components can scale independently
- **Security**: Centralized authentication and authorization
- **Maintainability**: Modular design with clear interfaces
- **Future Growth**: Easy to extend with new specialized servers

The pattern aligns with our goal of creating a platform that can grow from a simple tool to a comprehensive ecosystem while maintaining architectural clarity.

## Implementation

### Gateway Implementation
```python
# Core gateway responsibilities
class GatewayService:
    def __init__(self):
        self.auth_service = AuthService()
        self.routing_service = RoutingService()
        self.virtual_server_manager = VirtualServerManager()
    
    async def handle_request(self, request):
        # Authenticate request
        user = await self.auth_service.authenticate(request)
        
        # Route to appropriate MCP server
        server = await self.routing_service.route(request, user)
        
        # Forward request and return response
        return await self.forward_to_server(server, request)
```

### MCP Server Interface
```python
# Standard MCP server interface
class MCPServer:
    def __init__(self, gateway_url: str):
        self.gateway_url = gateway_url
        self.server_info = self.get_server_info()
    
    async def register_with_gateway(self):
        # Register with central gateway
        await self.gateway.register_server(self.server_info)
    
    async def handle_tool_call(self, tool_name: str, arguments: dict):
        # Handle tool calls from gateway
        return await self.execute_tool(tool_name, arguments)
```

### WebApp Integration
```typescript
// WebApp connects only to gateway
class UIForgeClient {
  constructor(private gatewayUrl: string) {}
  
  async generateComponent(description: string): Promise<Component> {
    const response = await fetch(`${this.gatewayUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.getToken()}` },
      body: JSON.stringify({ description })
    });
    return response.json();
  }
}
```

## Related Decisions
- [ADR-002: Gateway as Central Authentication Authority](./ADR-002-gateway-central-hub.md)
- [ADR-003: MCP Server Design for UI Generation](./ADR-003-mcp-server-design.md)
- [ADR-004: WebApp Architecture for Management Interface](./ADR-004-webapp-architecture.md)

## Notes
- This architecture assumes reliable network connectivity between components
- The gateway must be highly available and scalable
- Consider implementing circuit breakers and retry logic for resilience
- Monitor gateway performance to prevent bottlenecks

---

*Decision made on 2025-02-17 by the UIForge architecture team.*