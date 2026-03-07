// Unified AI Service for Grompt frontend
// Communicates with backend's unified API endpoints

import { Ideas } from '@/types';
import { HttpError, httpClient } from '@/core/http/client';
import { configService, type ProviderInfo, type ServerConfig } from '@/services/configService';

export interface UnifiedRequest {
  lang?: string;
  purpose?: string;
  purpose_type?: string;
  ideas?: string[];
  prompt?: string;
  max_tokens?: number;
  model?: string;
  provider?: string;
  api_key?: string; // BYOK Support: Optional external API key
}

export interface UnifiedResponse {
  response: string;
  provider: string;
  model: string;
  mode?: 'byok' | 'server' | 'demo'; // API key source mode
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    estimated_cost?: number;
  };
}

export interface GenerationResult {
  prompt: string;
  provider: string;
  model: string;
  mode?: 'byok' | 'server' | 'demo'; // API key source mode
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

class UnifiedAIService {
  private readonly unifiedEndpoint = '/unified';
  private readonly providerTestEndpoint = '/test';

  private buildHeaders(apiKey?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    return headers;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpError) {
      return error.message || `HTTP ${error.status}: ${error.statusText}`;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  /**
   * Generate a structured prompt using backend's unified API
   * @param apiKey - Optional external API key for BYOK (Bring Your Own Key)
   */
  async generateStructuredPrompt(
    ideas: Ideas,
    purpose: string,
    provider?: string,
    model?: string,
    apiKey?: string
  ): Promise<GenerationResult> {
    try {
      // Get config to determine the best provider to use
      const config = await configService.getConfig();

      const targetProvider = this.resolveProvider(config, provider);
      const providerInfo = config.providers[targetProvider];
      if (!providerInfo) {
        throw new Error(`Provider ${targetProvider} is not defined in the server configuration.`);
      }

      // Convert ideas to strings
      const ideaTexts = ideas.map(idea => idea.text);
      const modelToUse = this.resolveModel(model, providerInfo);
      const providerReady = providerInfo.available || (!!apiKey && providerInfo.supports_byok);
      if (!providerReady) {
        throw new Error(`Provider ${targetProvider} requires an API key. Configure it on the server or provide a BYOK key.`);
      }

      // Prepare request
      const request: UnifiedRequest = {
        ideas: ideaTexts,
        purpose: purpose,
        provider: targetProvider,
        model: modelToUse,
        lang: 'português',
        max_tokens: 5000,
      };

      // Call unified API through centralized HTTP client
      const data = await httpClient.post<UnifiedResponse, UnifiedRequest>(
        this.unifiedEndpoint,
        request,
        { headers: this.buildHeaders(apiKey) }
      );

      // Transform response to match expected format
      return {
        prompt: data.response,
        provider: data.provider,
        model: data.model,
        mode: data.mode, // Include mode from backend
        usageMetadata: {
          promptTokenCount: data.usage?.prompt_tokens,
          candidatesTokenCount: data.usage?.completion_tokens,
          totalTokenCount: data.usage?.total_tokens,
        },
      };
    } catch (error) {
      console.error('Failed to generate structured prompt:', error);

      // Fallback to demo mode
      return this.generateDemoPrompt(ideas, purpose);
    }
  }

  /**
   * Generate a direct prompt (skip prompt engineering)
   * @param apiKey - Optional external API key for BYOK (Bring Your Own Key)
   */
  async generateDirectPrompt(
    prompt: string,
    provider?: string,
    model?: string,
    maxTokens = 1000,
    apiKey?: string
  ): Promise<UnifiedResponse> {
    try {
      const config = await configService.getConfig();
      const targetProvider = this.resolveProvider(config, provider);
      const providerInfo = config.providers[targetProvider];
      if (!providerInfo) {
        throw new Error(`Provider ${targetProvider} is not defined in the server configuration.`);
      }

      const providerReady = providerInfo.available || (!!apiKey && providerInfo.supports_byok);
      if (!providerReady) {
        throw new Error(`Provider ${targetProvider} requires an API key. Configure it on the server or provide a BYOK key.`);
      }

      const request: UnifiedRequest = {
        prompt: prompt,
        provider: targetProvider,
        model: this.resolveModel(model, providerInfo),
        max_tokens: maxTokens,
      };

      return await httpClient.post<UnifiedResponse, UnifiedRequest>(
        this.unifiedEndpoint,
        request,
        { headers: this.buildHeaders(apiKey) }
      );
    } catch (error) {
      console.error('Failed to generate direct prompt:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Get available providers and their status
   */
  async getAvailableProviders(): Promise<ProviderInfo[]> {
    return configService.getAvailableProviders();
  }

  /**
   * Check if running in demo mode
   */
  async isDemoMode(): Promise<boolean> {
    return configService.isDemoMode();
  }

  /**
   * Test a specific provider
   */
  async testProvider(provider: string): Promise<{ available: boolean; message: string }> {
    try {
      const data = await httpClient.get<{ available?: boolean; message?: string }>(
        this.providerTestEndpoint,
        { query: { provider } }
      );
      return {
        available: data.available || false,
        message: data.message || 'Unknown status',
      };
    } catch (error) {
      return {
        available: false,
        message: `Connection error: ${this.getErrorMessage(error)}`,
      };
    }
  }

  /**
   * Fallback demo prompt generation
   */
  private generateDemoPrompt(ideas: Ideas, purpose: string): GenerationResult {
    const ideasText = ideas.map((idea, index) => `- ${idea.text}`).join('\n');

    const demoPrompt = `# ${purpose} Expert Assistant

## Primary Objective
Transform the provided ideas into actionable ${purpose.toLowerCase()} solutions following Kubex principles of modularity.

## User Requirements
${ideasText}

## Task Instructions
You are an expert ${purpose.toLowerCase()} specialist. Based on the requirements above, provide a comprehensive solution that:

### Key Requirements:
- Follow KUBEX principles: Modularity, Practicality, Interoperability
- Use clear, anti-jargon language
- Provide modular, reusable components
- Ensure outputs are platform-agnostic

### Expected Output Format:
- Use Markdown for clear structure
- Include code examples when applicable
- Provide step-by-step instructions
- Add relevant comments and documentation

### Constraints:
- Avoid vendor lock-in solutions
- Keep complexity minimal
- Focus on practical, implementable solutions
- Use open standards and formats

## Context
This prompt was generated using Grompt, part of the Kubex Ecosystem, following principles of modularity and clarity.

---
*Generated in demo mode - Connect your AI provider API key for enhanced AI-powered prompts*`;

    // Simulate token usage for demo
    const estimatedTokens = Math.floor(demoPrompt.length / 4); // Rough estimation

    return {
      prompt: demoPrompt,
      provider: 'demo',
      model: 'demo-model',
      usageMetadata: {
        promptTokenCount: Math.floor(estimatedTokens * 0.3),
        candidatesTokenCount: Math.floor(estimatedTokens * 0.7),
        totalTokenCount: estimatedTokens,
      },
    };
  }

  private resolveProvider(config: ServerConfig, requested?: string): string {
    if (requested && config.providers[requested]) {
      return requested;
    }

    if (config.default_provider && config.providers[config.default_provider]) {
      return config.default_provider;
    }

    const available = config.available_providers.find(name => config.providers[name]);
    if (available) {
      return available;
    }

    const fallback = Object.keys(config.providers)[0];
    if (fallback) {
      return fallback;
    }

    throw new Error('No AI providers are configured. Please configure an API key or use BYOK.');
  }

  private resolveModel(preferred: string | undefined, providerInfo: ProviderInfo): string {
    if (preferred) return preferred;
    if (providerInfo.default_model) return providerInfo.default_model;
    if (providerInfo.models.length > 0) return providerInfo.models[0];
    throw new Error(`Provider ${providerInfo.display_name ?? providerInfo.name} does not expose any models.`);
  }
}

// Export singleton instance
export const unifiedAIService = new UnifiedAIService();

// Backwards compatibility - export the main function with same signature as geminiService
export const generateStructuredPrompt = unifiedAIService.generateStructuredPrompt.bind(unifiedAIService);
