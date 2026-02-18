# ADR-004: WebApp Architecture for Management Interface

## Status
Accepted

## Context
We needed to design the uiforge-webapp as the management interface for the UIForge ecosystem. The key requirements were:

- Modern, responsive user interface for ecosystem management
- Real-time monitoring and status updates
- Component generation and template management
- User authentication and project organization
- Integration with the gateway for all operations
- Support for collaborative features and team management

## Decision
We designed the uiforge-webapp using a **modern React-based architecture** with the following key decisions:

- **Next.js Framework**: React-based framework with SSR/SSG capabilities
- **Supabase Backend**: PostgreSQL database with real-time capabilities
- **Redux Toolkit**: State management for complex application state
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **TypeScript**: Type-safe development with comprehensive type definitions
- **Component-First Architecture**: Modular, reusable component library

## Consequences

### Positive Consequences
- **Developer Experience**: Modern tooling with excellent DX features
- **Performance**: Optimized rendering and caching strategies
- **Type Safety**: Comprehensive TypeScript coverage reduces bugs
- **Real-time Features**: Supabase enables real-time updates and collaboration
- **SEO Benefits**: Next.js provides excellent SEO capabilities
- **Maintainability**: Clear separation of concerns and modular architecture

### Negative Consequences
- **Learning Curve**: Complex stack requires developer expertise
- **Bundle Size**: Rich feature set may impact initial load times
- **Vendor Lock-in**: Heavy reliance on Supabase and Next.js ecosystems
- **Complexity**: Multiple layers of abstraction increase system complexity

## Alternatives Considered

### Alternative 1: Vue.js + Nuxt.js
- Vue.js framework with Nuxt.js for SSR
- **Rejected**: Smaller ecosystem and fewer enterprise features

### Alternative 2: Angular + Universal
- Angular framework with Angular Universal
- **Rejected**: Heavier footprint and slower development cycle

### Alternative 3: Pure React + Custom Backend
- React with custom Node.js/Express backend
- **Rejected**: Increased development effort for backend features

## Rationale
The Next.js + Supabase architecture was chosen because it provides:

- **Productivity**: Rapid development with built-in features
- **Scalability**: Proven architecture for growing applications
- **Real-time Capabilities**: Essential for collaborative features
- **Type Safety**: TypeScript ensures code quality and maintainability
- **Ecosystem**: Rich ecosystem of plugins and integrations
- **Performance**: Optimized rendering and deployment strategies

This architecture balances development speed with production readiness while providing a solid foundation for future growth.

## Implementation

### Application Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Dashboard pages
│   ├── projects/          # Project management
│   ├── components/        # Component generation
│   ├── templates/         # Template management
│   └── settings/          # Settings and configuration
├── components/             # Reusable UI components
│   ├── ui/                # Basic UI components
│   ├── forms/             # Form components
│   ├── charts/            # Data visualization
│   └── layout/            # Layout components
├── lib/                   # Utility libraries
│   ├── api/               # API client utilities
│   ├── auth/              # Authentication utilities
│   ├── db/                # Database utilities
│   └── utils/             # General utilities
├── store/                 # Redux store configuration
│   ├── slices/            # Redux slices
│   └── middleware/        # Custom middleware
├── types/                 # TypeScript type definitions
└── styles/                # Global styles and themes
```

### API Client Architecture
```typescript
// lib/api/gateway-client.ts
class GatewayClient {
  private baseURL: string;
  private authToken?: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }

    return response.json();
  }

  // Component Generation API
  async generateComponent(request: GenerateComponentRequest): Promise<GeneratedComponent> {
    return this.request<GeneratedComponent>('/api/generate/component', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Template Management API
  async getTemplates(filters?: TemplateFilters): Promise<Template[]> {
    const params = new URLSearchParams(filters as any).toString();
    return this.request<Template[]>(`/api/templates?${params}`);
  }

  // Server Status API
  async getServerStatus(): Promise<ServerStatus> {
    return this.request<ServerStatus>('/api/servers/status');
  }
}
```

### State Management with Redux Toolkit
```typescript
// store/slices/generation-slice.ts
interface GenerationState {
  currentGeneration: Generation | null;
  generationHistory: Generation[];
  isGenerating: boolean;
  error: string | null;
}

const generationSlice = createSlice({
  name: 'generation',
  initialState,
  reducers: {
    startGeneration: (state, action: PayloadAction<GenerateComponentRequest>) => {
      state.isGenerating = true;
      state.error = null;
      state.currentGeneration = {
        id: generateId(),
        request: action.payload,
        status: 'pending',
        createdAt: new Date(),
      };
    },
    generationProgress: (state, action: PayloadAction<GenerationProgress>) => {
      if (state.currentGeneration) {
        state.currentGeneration.progress = action.payload;
      }
    },
    generationComplete: (state, action: PayloadAction<GeneratedComponent>) => {
      state.isGenerating = false;
      if (state.currentGeneration) {
        state.currentGeneration.status = 'completed';
        state.currentGeneration.result = action.payload;
        state.currentGeneration.completedAt = new Date();
        state.generationHistory.unshift(state.currentGeneration);
      }
    },
    generationError: (state, action: PayloadAction<string>) => {
      state.isGenerating = false;
      state.error = action.payload;
      if (state.currentGeneration) {
        state.currentGeneration.status = 'failed';
        state.currentGeneration.error = action.payload;
        state.currentGeneration.completedAt = new Date();
      }
    },
  },
});
```

### Component Architecture
```typescript
// components/forms/ComponentGeneratorForm.tsx
interface ComponentGeneratorFormProps {
  onGenerate: (request: GenerateComponentRequest) => void;
  isGenerating: boolean;
}

export const ComponentGeneratorForm: React.FC<ComponentGeneratorFormProps> = ({
  onGenerate,
  isGenerating,
}) => {
  const [description, setDescription] = useState('');
  const [framework, setFramework] = useState<Framework>('react');
  const [style, setStyle] = useState<Style>('modern');
  const [options, setOptions] = useState<GenerationOptions>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      description,
      framework,
      style,
      options,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Component Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          rows={4}
          placeholder="Describe the UI component you want to generate..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="framework" className="block text-sm font-medium text-gray-700">
            Framework
          </label>
          <select
            id="framework"
            value={framework}
            onChange={(e) => setFramework(e.target.value as Framework)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="react">React</option>
            <option value="vue">Vue</option>
            <option value="angular">Angular</option>
            <option value="svelte">Svelte</option>
          </select>
        </div>

        <div>
          <label htmlFor="style" className="block text-sm font-medium text-gray-700">
            Style
          </label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value as Style)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="minimal">Minimal</option>
            <option value="material">Material Design</option>
          </select>
        </div>
      </div>

      <GenerationOptions options={options} onChange={setOptions} />

      <button
        type="submit"
        disabled={isGenerating || !description.trim()}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <LoadingSpinner className="mr-2" />
            Generating...
          </>
        ) : (
          'Generate Component'
        )}
      </button>
    </form>
  );
};
```

### Real-time Updates with Supabase
```typescript
// lib/realtime/subscription-manager.ts
class SubscriptionManager {
  private subscriptions: Map<string, RealtimeChannel> = new Map();

  constructor(private supabase: SupabaseClient) {}

  subscribeToGenerationUpdates(
    generationId: string,
    onUpdate: (generation: Generation) => void
  ) {
    const channel = this.supabase
      .channel(`generation-${generationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generations',
          filter: `id=eq.${generationId}`,
        },
        (payload) => {
          onUpdate(payload.new as Generation);
        }
      )
      .subscribe();

    this.subscriptions.set(generationId, channel);
    return channel;
  }

  subscribeToServerStatus(
    onUpdate: (status: ServerStatus) => void
  ) {
    const channel = this.supabase
      .channel('server-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'server_status',
        },
        (payload) => {
          onUpdate(payload.new as ServerStatus);
        }
      )
      .subscribe();

    this.subscriptions.set('server-status', channel);
    return channel;
  }

  unsubscribe(channelId: string) {
    const channel = this.subscriptions.get(channelId);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.subscriptions.delete(channelId);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((channel, id) => {
      this.supabase.removeChannel(channel);
    });
    this.subscriptions.clear();
  }
}
```

### Authentication Integration
```typescript
// lib/auth/auth-config.ts
export const authConfig: NextAuthConfig = {
  providers: [
    SupabaseProvider({
      clientId: process.env.SUPABASE_CLIENT_ID!,
      clientSecret: process.env.SUPABASE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
};

// app/api/auth/[...nextauth]/route.ts
export { authConfig as GET, authConfig as POST } from 'next-auth';

// lib/auth/gateway-auth.ts
class GatewayAuth {
  private client: GatewayClient;

  constructor() {
    this.client = new GatewayClient(process.env.NEXT_PUBLIC_GATEWAY_URL!);
  }

  async authenticate(credentials: Credentials): Promise<AuthResult> {
    try {
      const result = await this.client.request<AuthResult>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Store token in client
      this.client.setAuthToken(result.access_token);

      return result;
    } catch (error) {
      throw new AuthenticationError('Invalid credentials');
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    return this.client.request<AuthResult>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }
}
```

## Related Decisions
- [ADR-001: Hub-and-Spoke Ecosystem Architecture](./ADR-001-ecosystem-design.md)
- [ADR-002: Gateway as Central Authentication Authority](./ADR-002-gateway-central-hub.md)
- [ADR-005: Integration Patterns and API Contracts](./ADR-005-integration-patterns.md)

## Notes
- Implement proper error boundaries for better user experience
- Use React Query for server state management and caching
- Consider implementing offline capabilities for better UX
- Plan for internationalization and accessibility
- Monitor performance metrics and optimize accordingly

---

*Decision made on 2025-02-17 by the UIForge architecture team.*