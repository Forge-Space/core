# ADR-002: Gateway as Central Authentication and Routing Authority

## Status
Accepted

## Context
In the hub-and-spoke architecture (ADR-001), we needed to determine how to handle authentication, authorization, and request routing across the ecosystem. The key challenges were:

- Maintaining consistent security policies across all components
- Avoiding duplicated authentication logic in each MCP server
- Providing a unified interface for the web application
- Supporting role-based access control and permissions
- Ensuring secure communication between components

## Decision
We established the **forge-mcp-gateway as the central authority** for all authentication, authorization, and routing concerns. This means:

- **Single Authentication Source**: Gateway handles all user authentication and token management
- **Centralized Authorization**: Gateway enforces permissions and access control policies
- **Request Routing**: Gateway routes all requests to appropriate MCP servers
- **Token Propagation**: Gateway manages JWT token creation, validation, and refresh
- **API Gateway Pattern**: Gateway acts as the single entry point for all external requests

## Consequences

### Positive Consequences
- **Security Consistency**: Single source of truth for authentication and authorization
- **Simplified MCP Servers**: MCP servers don't need to implement authentication logic
- **Unified API**: Single entry point for all ecosystem operations
- **Centralized Policy Management**: Security policies managed in one place
- **Audit Trail**: All requests logged centrally for security monitoring

### Negative Consequences
- **Gateway Dependency**: All components depend on gateway availability
- **Performance Overhead**: Additional network hop for all requests
- **Complexity**: Gateway becomes a complex component with multiple responsibilities
- **Single Point of Failure**: Gateway failure affects entire ecosystem

## Alternatives Considered

### Alternative 1: Distributed Authentication
- Each MCP server implements its own authentication
- Shared token validation between services
- **Rejected**: Duplicated code, inconsistent security policies, higher complexity

### Alternative 2: Third-Party Authentication Service
- Use external service like Auth0 or Keycloak
- Gateway proxies authentication requests
- **Rejected**: Added external dependency, increased complexity for current needs

### Alternative 3: Token-Based Delegation
- Gateway issues tokens that MCP servers validate independently
- No central authorization checking
- **Rejected**: Reduced security control, difficult to revoke permissions

## Rationale
The gateway as central authority was chosen because it provides:

- **Security Benefits**: Centralized control over authentication and authorization
- **Simplicity**: MCP servers can focus on their core functionality
- **Consistency**: Uniform security policies across the ecosystem
- **Maintainability**: Single place to update security logic
- **Auditability**: Central logging of all authentication and authorization events

This approach aligns with industry best practices for API gateway patterns and provides a solid foundation for security.

## Implementation

### Authentication Service
```python
class AuthService:
    def __init__(self, jwt_secret: str, db: Database):
        self.jwt_secret = jwt_secret
        self.db = db
        self.token_blacklist = TokenBlacklist()
    
    async def authenticate(self, credentials: Credentials) -> AuthResult:
        # Validate user credentials
        user = await self.db.get_user_by_email(credentials.email)
        if not user or not verify_password(credentials.password, user.password_hash):
            raise AuthenticationError("Invalid credentials")
        
        # Generate JWT tokens
        access_token = self.generate_access_token(user)
        refresh_token = self.generate_refresh_token(user)
        
        return AuthResult(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user.to_dict()
        )
    
    async def validate_token(self, token: str) -> User:
        # Check if token is blacklisted
        if await self.token_blacklist.is_blacklisted(token):
            raise AuthenticationError("Token revoked")
        
        # Validate JWT token
        payload = jwt.decode(token, self.jwt_secret, algorithms=["HS256"])
        user = await self.db.get_user(payload["user_id"])
        
        if not user or not user.is_active:
            raise AuthenticationError("User not found or inactive")
        
        return user
```

### Authorization Service
```python
class AuthorizationService:
    def __init__(self, db: Database):
        self.db = db
    
    async def check_permission(self, user: User, resource: str, action: str) -> bool:
        # Get user roles and permissions
        roles = await self.db.get_user_roles(user.id)
        permissions = await self.db.get_role_permissions([r.id for r in roles])
        
        # Check if user has required permission
        required_permission = f"{resource}:{action}"
        return any(p.name == required_permission for p in permissions)
    
    async def require_permission(self, user: User, resource: str, action: str):
        if not await self.check_permission(user, resource, action):
            raise AuthorizationError(f"Insufficient permissions for {resource}:{action}")
```

### Routing Service
```python
class RoutingService:
    def __init__(self, virtual_server_manager: VirtualServerManager):
        self.server_manager = virtual_server_manager
        self.load_balancer = LoadBalancer()
    
    async def route_request(self, request: Request, user: User) -> MCPServer:
        # Determine target server based on request
        if request.path.startswith("/api/generate"):
            server_name = "uiforge-mcp"
        elif request.path.startswith("/api/templates"):
            server_name = "uiforge-mcp"
        else:
            raise RoutingError(f"Unknown route: {request.path}")
        
        # Get available server instances
        servers = await self.server_manager.get_active_servers(server_name)
        if not servers:
            raise ServiceUnavailableError(f"No available servers for {server_name}")
        
        # Select server using load balancing
        return self.load_balancer.select_server(servers)
```

### Gateway API Middleware
```python
async def auth_middleware(request: Request, call_next):
    # Extract token from request
    token = extract_token_from_request(request)
    
    if not token and is_protected_route(request.url.path):
        raise AuthenticationError("Token required")
    
    if token:
        # Validate token and get user
        user = await auth_service.validate_token(token)
        request.state.user = user
        
        # Check permissions
        resource, action = get_resource_action_from_request(request)
        await authz_service.require_permission(user, resource, action)
    
    # Continue with request
    response = await call_next(request)
    return response
```

### MCP Server Gateway Integration
```python
class GatewayAwareMCPServer:
    def __init__(self, gateway_url: str, server_name: str):
        self.gateway_url = gateway_url
        self.server_name = server_name
        self.auth_client = GatewayAuthClient(gateway_url)
    
    async def handle_request(self, request: MCPRequest) -> MCPResponse:
        # Validate request came from gateway
        if not await self.auth_client.validate_gateway_request(request):
            raise UnauthorizedError("Request not from authorized gateway")
        
        # Extract user context from request
        user_context = request.metadata.get("user_context")
        if not user_context:
            raise UnauthorizedError("No user context provided")
        
        # Process request with user context
        return await self.process_request_with_context(request, user_context)
```

## Related Decisions
- [ADR-001: Hub-and-Spoke Ecosystem Architecture](./ADR-001-ecosystem-design.md)
- [ADR-005: Integration Patterns and API Contracts](./ADR-005-integration-patterns.md)

## Notes
- Implement token blacklisting for immediate revocation
- Use rate limiting to prevent abuse
- Monitor authentication failures for security threats
- Consider implementing caching for frequently accessed permissions
- Plan for horizontal scaling of the gateway service

---

*Decision made on 2025-02-17 by the UIForge architecture team.*