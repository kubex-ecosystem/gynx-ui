// Configuration service for Grompt frontend
// Handles communication with backend /api/v1/config endpoint

import { httpClient } from "@/core/http/client";
import { httpEndpoints } from "@/core/http/endpoints";
import { getFrontendRuntimeFlags, isDemoModeEnabled } from "@/core/runtime/mode";

export type ProviderStatus = 'ready' | 'needs_api_key' | 'offline';
export type ProviderMode = 'server' | 'byok' | 'demo' | 'offline';

export interface ProviderInfo {
  name: string;
  display_name: string;
  available: boolean;
  configured: boolean;
  models: string[];
  endpoint?: string;
  default_model?: string;
  status: ProviderStatus;
  mode?: ProviderMode;
  supports_byok?: boolean;
}

export interface ServerConfig {
  server: {
    name: string;
    version: string;
    port: string;
    status: string;
  };
  providers: Record<string, ProviderInfo>;
  available_providers: string[];
  default_provider: string;
  environment: {
    demo_mode: boolean;
  };
  // Backwards compatibility flags expected by legacy UI bits
  openai_available: boolean;
  deepseek_available: boolean;
  ollama_available: boolean;
  claude_available: boolean;
  gemini_available: boolean;
  chatgpt_available: boolean;
}

const DEMO_PROVIDERS: ProviderInfo[] = [
  {
    name: 'openai',
    display_name: 'OpenAI',
    available: true,
    configured: false,
    models: ['gpt-4o-mini'],
    default_model: 'gpt-4o-mini',
    status: 'needs_api_key',
    mode: 'byok',
    supports_byok: true,
  },
  {
    name: 'claude',
    display_name: 'Anthropic Claude',
    available: true,
    configured: false,
    models: ['claude-3-5-sonnet-20241022'],
    default_model: 'claude-3-5-sonnet-20241022',
    status: 'needs_api_key',
    mode: 'byok',
    supports_byok: true,
  },
  {
    name: 'anthropic',
    display_name: 'Anthropic Claude',
    available: true,
    configured: false,
    models: ['claude-3-5-sonnet-20241022'],
    default_model: 'claude-3-5-sonnet-20241022',
    status: 'needs_api_key',
    mode: 'byok',
    supports_byok: true,
  },
  {
    name: 'gemini',
    display_name: 'Google Gemini',
    available: true,
    configured: false,
    models: ['gemini-2.0-flash', 'gemini-2.5-pro'],
    default_model: 'gemini-2.0-flash',
    status: 'needs_api_key',
    mode: 'byok',
    supports_byok: true,
  },
  {
    name: 'deepseek',
    display_name: 'DeepSeek',
    available: true,
    configured: false,
    models: ['deepseek-v1', 'deepseek-v2'],
    default_model: 'deepseek-v2',
    status: 'needs_api_key',
    mode: 'byok',
    supports_byok: true,
  },
  {
    name: 'chatgpt',
    display_name: 'ChatGPT',
    available: true,
    configured: false,
    models: ['gpt-4o-mini'],
    default_model: 'gpt-4o-mini',
    status: 'needs_api_key',
    mode: 'byok',
    supports_byok: true,
  },
  {
    name: 'ollama',
    display_name: 'Ollama (Local)',
    available: true,
    configured: false,
    models: ['llama3.2'],
    default_model: 'llama3.2',
    status: 'offline',
    mode: 'offline',
    supports_byok: false,
  },
];

class ConfigService {
  private config: ServerConfig | null = null;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Get server configuration from backend
   */
  async getConfig(forceRefresh = false): Promise<ServerConfig> {
    const cacheKey = 'server_config';
    const cached = this.cache.get(cacheKey);

    if (!forceRefresh && cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const config = await httpClient.get<ServerConfig>(httpEndpoints.config.root);

      // Cache the result
      this.cache.set(cacheKey, {
        data: config,
        timestamp: Date.now(),
      });

      this.config = config;
      return config;
    } catch (error) {
      console.error('Failed to fetch config from backend:', error);

      const fallbackConfig = this.getFallbackConfig();
      this.config = fallbackConfig;
      return fallbackConfig;
    }
  }

  /**
   * Get available providers
   */
  async getAvailableProviders(): Promise<ProviderInfo[]> {
    const config = await this.getConfig();
    return config.available_providers
      .map(name => config.providers[name])
      .filter((provider): provider is ProviderInfo => Boolean(provider));
  }

  /**
   * Get specific provider info
   */
  async getProvider(name: string): Promise<ProviderInfo | null> {
    const config = await this.getConfig();
    return config.providers[name] || null;
  }

  /**
   * Get default provider name
   */
  async getDefaultProvider(): Promise<string> {
    const config = await this.getConfig();
    return config.default_provider;
  }

  /**
   * Check if running in demo mode
   */
  async isDemoMode(): Promise<boolean> {
    const config = await this.getConfig();
    return isDemoModeEnabled(config.environment.demo_mode);
  }

  /**
   * Update provider configuration (for future use)
   */
  async updateProviderConfig(provider: string, apiKey: string): Promise<boolean> {
    try {
      await httpClient.post(httpEndpoints.config.root, {
          [`${provider}_api_key`]: apiKey,
      });

      // Clear cache to force refresh
      this.cache.clear();
      return true;
    } catch (error) {
      console.error('Failed to update provider config:', error);
      return false;
    }
  }

  /**
   * Get server status
   */
  async getServerStatus(): Promise<{
    name: string;
    version: string;
    status: string;
    port: string;
  }> {
    const config = await this.getConfig();
    return config.server;
  }

  /**
   * Clear service cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Fallback demo configuration
   */
  private getFallbackConfig(): ServerConfig {
    const runtimeFlags = getFrontendRuntimeFlags();
    const demoMode = isDemoModeEnabled();
    const providers: Record<string, ProviderInfo> = {};

    if (demoMode) {
      for (const provider of DEMO_PROVIDERS) {
        providers[provider.name] = provider;
      }
    }

    return {
      server: {
        name: demoMode ? 'Grompt Server (Demo)' : 'Grompt Server (Unavailable)',
        version: '1.0.0',
        port: '8080',
        status: demoMode ? 'demo' : 'unavailable',
      },
      providers,
      available_providers: Object.keys(providers),
      default_provider: 'openai',
      environment: {
        demo_mode: demoMode,
      },
      openai_available: demoMode && runtimeFlags.simulatedAuth,
      deepseek_available: false,
      ollama_available: demoMode,
      claude_available: demoMode && runtimeFlags.simulatedAuth,
      gemini_available: demoMode && runtimeFlags.simulatedAuth,
      chatgpt_available: demoMode && runtimeFlags.simulatedAuth,
    };
  }
}

// Export singleton instance
export const configService = new ConfigService();
