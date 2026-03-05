// AI Provider Service - Supports multiple LLM backends

export type AIProviderType = 'claude' | 'openai' | 'gemini' | 'perplexity' | 'ollama' | 'custom';

export interface MCPServer {
  id: string;
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  enabled: boolean;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  type: AIProviderType;
  apiKey?: string;
  apiEndpoint?: string;
  model: string;
  enabled: boolean;
  mcpServers: MCPServer[];
  maxTokens?: number;
  temperature?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  providerId?: string;
  attachments?: { type: string; name: string; content: string }[];
}

export interface AIProviderResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  error?: string;
}

// Default provider configurations
export const DEFAULT_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    type: 'claude',
    model: 'claude-sonnet-4-20250514',
    enabled: false,
    mcpServers: [],
    maxTokens: 4096,
    temperature: 0.7,
  },
  {
    id: 'openai',
    name: 'GPT / Codex (OpenAI)',
    type: 'openai',
    model: 'gpt-4o',
    enabled: false,
    mcpServers: [],
    maxTokens: 4096,
    temperature: 0.7,
  },
  {
    id: 'gemini',
    name: 'Gemini (Google)',
    type: 'gemini',
    model: 'gemini-2.0-flash',
    enabled: false,
    mcpServers: [],
    maxTokens: 4096,
    temperature: 0.7,
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    type: 'perplexity',
    model: 'llama-3.1-sonar-large-128k-online',
    enabled: false,
    mcpServers: [],
    maxTokens: 4096,
    temperature: 0.7,
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    type: 'ollama',
    apiEndpoint: 'http://localhost:11434',
    model: 'llama3.2',
    enabled: false,
    mcpServers: [],
    maxTokens: 4096,
    temperature: 0.7,
  },
];

// Available models per provider
export const PROVIDER_MODELS: Record<AIProviderType, string[]> = {
  claude: [
    'claude-sonnet-4-20250514',
    'claude-opus-4-20250514',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
  ],
  openai: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'o1-preview',
    'o1-mini',
  ],
  gemini: [
    'gemini-2.0-flash',
    'gemini-2.0-flash-thinking',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
  ],
  perplexity: [
    'llama-3.1-sonar-large-128k-online',
    'llama-3.1-sonar-small-128k-online',
    'llama-3.1-sonar-huge-128k-online',
  ],
  ollama: [
    'llama3.2',
    'llama3.1',
    'codellama',
    'mistral',
    'mixtral',
    'phi3',
    'qwen2.5-coder',
    'deepseek-coder-v2',
  ],
  custom: [],
};

class AIProviderService {
  private providers: Map<string, AIProviderConfig> = new Map();
  private activeProviderId: string | null = null;

  constructor() {
    this.loadProviders();
  }

  private loadProviders() {
    const saved = localStorage.getItem('themag_ai_providers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AIProviderConfig[];
        parsed.forEach(p => this.providers.set(p.id, p));
      } catch {
        DEFAULT_PROVIDERS.forEach(p => this.providers.set(p.id, p));
      }
    } else {
      DEFAULT_PROVIDERS.forEach(p => this.providers.set(p.id, p));
    }

    const activeId = localStorage.getItem('themag_active_provider');
    if (activeId && this.providers.has(activeId)) {
      this.activeProviderId = activeId;
    }
  }

  private saveProviders() {
    const providers = Array.from(this.providers.values());
    localStorage.setItem('themag_ai_providers', JSON.stringify(providers));
    if (this.activeProviderId) {
      localStorage.setItem('themag_active_provider', this.activeProviderId);
    }
  }

  getProviders(): AIProviderConfig[] {
    return Array.from(this.providers.values());
  }

  getProvider(id: string): AIProviderConfig | undefined {
    return this.providers.get(id);
  }

  getActiveProvider(): AIProviderConfig | null {
    if (!this.activeProviderId) return null;
    return this.providers.get(this.activeProviderId) || null;
  }

  setActiveProvider(id: string) {
    if (this.providers.has(id)) {
      this.activeProviderId = id;
      this.saveProviders();
    }
  }

  updateProvider(id: string, config: Partial<AIProviderConfig>) {
    const existing = this.providers.get(id);
    if (existing) {
      this.providers.set(id, { ...existing, ...config });
      this.saveProviders();
    }
  }

  addProvider(config: AIProviderConfig) {
    this.providers.set(config.id, config);
    this.saveProviders();
  }

  removeProvider(id: string) {
    this.providers.delete(id);
    if (this.activeProviderId === id) {
      this.activeProviderId = null;
    }
    this.saveProviders();
  }

  addMCPServer(providerId: string, server: MCPServer) {
    const provider = this.providers.get(providerId);
    if (provider) {
      provider.mcpServers.push(server);
      this.saveProviders();
    }
  }

  removeMCPServer(providerId: string, serverId: string) {
    const provider = this.providers.get(providerId);
    if (provider) {
      provider.mcpServers = provider.mcpServers.filter(s => s.id !== serverId);
      this.saveProviders();
    }
  }

  async sendMessage(messages: ChatMessage[], context?: string): Promise<AIProviderResponse> {
    const provider = this.getActiveProvider();
    if (!provider) {
      return { content: '', error: 'No AI provider configured. Please set up an API key in Settings.' };
    }

    if (!provider.apiKey && provider.type !== 'ollama') {
      return { content: '', error: `Please add your ${provider.name} API key in Settings.` };
    }

    try {
      switch (provider.type) {
        case 'claude':
          return await this.sendClaudeMessage(provider, messages, context);
        case 'openai':
          return await this.sendOpenAIMessage(provider, messages, context);
        case 'gemini':
          return await this.sendGeminiMessage(provider, messages, context);
        case 'perplexity':
          return await this.sendPerplexityMessage(provider, messages, context);
        case 'ollama':
          return await this.sendOllamaMessage(provider, messages, context);
        default:
          return { content: '', error: 'Unknown provider type' };
      }
    } catch (error: any) {
      return { content: '', error: error.message || 'Failed to get response from AI' };
    }
  }

  private processMessages(messages: ChatMessage[]): { role: string; content: string }[] {
    const result: { role: string; content: string }[] = [];
    for (const m of messages) {
      if (m.role !== 'system') {
        result.push({ role: m.role, content: m.content });
      }
    }
    return result;
  }

  private processGeminiMessages(messages: ChatMessage[]): { role: string; parts: { text: string }[] }[] {
    const result: { role: string; parts: { text: string }[] }[] = [];
    for (const m of messages) {
      if (m.role !== 'system') {
        result.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        });
      }
    }
    return result;
  }

  private async sendClaudeMessage(
    provider: AIProviderConfig,
    messages: ChatMessage[],
    context?: string
  ): Promise<AIProviderResponse> {
    const systemPrompt = context
      ? `You are TheMAG.dev AI assistant, an expert coding assistant. Current context:\n${context}`
      : 'You are TheMAG.dev AI assistant, an expert coding assistant helping developers write, debug, and improve their code.';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey!,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: provider.maxTokens || 4096,
        system: systemPrompt,
        messages: this.processMessages(messages),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Claude API error');
    }

    const data = await response.json();
    return {
      content: data.content[0]?.text || '',
      usage: {
        inputTokens: data.usage?.input_tokens || 0,
        outputTokens: data.usage?.output_tokens || 0,
      },
    };
  }

  private async sendOpenAIMessage(
    provider: AIProviderConfig,
    messages: ChatMessage[],
    context?: string
  ): Promise<AIProviderResponse> {
    const systemMessage = context
      ? `You are TheMAG.dev AI assistant, an expert coding assistant. Current context:\n${context}`
      : 'You are TheMAG.dev AI assistant, an expert coding assistant helping developers write, debug, and improve their code.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: provider.maxTokens || 4096,
        temperature: provider.temperature || 0.7,
        messages: [
          { role: 'system', content: systemMessage },
          ...this.processMessages(messages),
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
      },
    };
  }

  private async sendGeminiMessage(
    provider: AIProviderConfig,
    messages: ChatMessage[],
    context?: string
  ): Promise<AIProviderResponse> {
    const systemInstruction = context
      ? `You are TheMAG.dev AI assistant, an expert coding assistant. Current context:\n${context}`
      : 'You are TheMAG.dev AI assistant, an expert coding assistant helping developers write, debug, and improve their code.';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${provider.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: this.processGeminiMessages(messages),
          generationConfig: {
            maxOutputTokens: provider.maxTokens || 4096,
            temperature: provider.temperature || 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount || 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
      },
    };
  }

  private async sendPerplexityMessage(
    provider: AIProviderConfig,
    messages: ChatMessage[],
    context?: string
  ): Promise<AIProviderResponse> {
    const systemMessage = context
      ? `You are TheMAG.dev AI assistant, an expert coding assistant. Current context:\n${context}`
      : 'You are TheMAG.dev AI assistant, an expert coding assistant helping developers write, debug, and improve their code.';

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: provider.maxTokens || 4096,
        temperature: provider.temperature || 0.7,
        messages: [
          { role: 'system', content: systemMessage },
          ...this.processMessages(messages),
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Perplexity API error');
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
      },
    };
  }

  private async sendOllamaMessage(
    provider: AIProviderConfig,
    messages: ChatMessage[],
    context?: string
  ): Promise<AIProviderResponse> {
    const systemMessage = context
      ? `You are TheMAG.dev AI assistant, an expert coding assistant. Current context:\n${context}`
      : 'You are TheMAG.dev AI assistant, an expert coding assistant helping developers write, debug, and improve their code.';

    const endpoint = provider.apiEndpoint || 'http://localhost:11434';

    const response = await fetch(`${endpoint}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.model,
        stream: false,
        messages: [
          { role: 'system', content: systemMessage },
          ...this.processMessages(messages),
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Ollama API error - make sure Ollama is running');
    }

    const data = await response.json();
    return {
      content: data.message?.content || '',
      usage: {
        inputTokens: data.prompt_eval_count || 0,
        outputTokens: data.eval_count || 0,
      },
    };
  }
}

export const aiProvider = new AIProviderService();
export default aiProvider;
