/**
 * Grompt API Service Layer
 * Provides integration with the Grompt V1 backend API
 * Following backend endpoint structure from internal/gateway/transport/grompt_v1.go
 */

import { httpClient } from '../core/http/client';
import { buildApiV1Path, buildApiV1Url, httpEndpoints } from '../core/http/endpoints';
import { toHttpError } from '../core/http/errors';
import type { HttpMethod } from '../core/http/types';

export interface GenerateRequest {
  provider: string;
  model?: string;
  ideas: string[];
  purpose?: 'code' | 'creative' | 'analysis' | 'general';
  context?: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  meta?: Record<string, any>;
}

export interface GenerateResponse {
  id: string;
  object: string;
  createdAt: number;
  provider: string;
  model: string;
  prompt: string;
  ideas: string[];
  purpose: string;
  usage?: {
    tokens: number;
    costUSD: number;
  };
  metadata?: Record<string, any>;
}

export interface Provider {
  name: string;
  available: boolean;
  type?: string;
  defaultModel?: string;
  error?: string;
}

export interface ProvidersListResponse {
  object: string;
  data: Provider[];
  hasMore: boolean;
  timestamp: number;
}

export interface StreamEvent {
  event: 'generation.started' | 'generation.chunk' | 'generation.complete' | 'generation.error';
  content?: string;
  provider?: string;
  model?: string;
  ideas?: string[];
  usage?: {
    tokens: number;
    costUSD: number;
  };
  error?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  service: string;
  timestamp: number;
  version: string;
  dependencies: {
    providers: Record<string, {
      status: 'healthy' | 'unhealthy' | 'unavailable';
      error?: string;
    }>;
    gobe_proxy: {
      status: 'healthy' | 'unhealthy' | 'not_configured';
      message?: string;
      error?: string;
    };
  };
}

/**
 * Rate limiting for API requests
 * Implements client-side rate limiting to prevent API abuse
 */
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 30, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();

    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    // Check if we're within limits
    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    // Record this request
    this.requests.push(now);
    return true;
  }

  getTimeUntilReset(): number {
    if (this.requests.length < this.maxRequests) {
      return 0;
    }

    const oldestRequest = Math.min(...this.requests);
    return this.windowMs - (Date.now() - oldestRequest);
  }
}

/**
 * API Error class for structured error handling
 */
export class APIError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Main API service class
 */
export class GromptAPI {
  private readonly baseURL: string;
  private readonly rateLimiter: RateLimiter;
  private readonly defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '', options: {
    rateLimitRequests?: number;
    rateLimitWindowMs?: number;
    defaultHeaders?: Record<string, string>;
  } = {}) {
    // Use relative URLs in production, or provided baseURL for development
    this.baseURL = baseURL || '';
    this.rateLimiter = new RateLimiter(
      options.rateLimitRequests,
      options.rateLimitWindowMs
    );
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.defaultHeaders
    };
  }

  private resolveRequestTarget(endpoint: string): { target: string; useBaseURL: boolean } {
    if (this.baseURL) {
      return { target: buildApiV1Url(this.baseURL, endpoint), useBaseURL: false };
    }

    return { target: endpoint, useBaseURL: true };
  }

  /**
   * Check rate limiting before making requests
   */
  private checkRateLimit(): void {
    if (!this.rateLimiter.canMakeRequest()) {
      const resetTime = this.rateLimiter.getTimeUntilReset();
      throw new APIError(
        `Rate limit exceeded. Try again in ${Math.ceil(resetTime / 1000)} seconds.`,
        429,
        'RATE_LIMIT_EXCEEDED',
        { resetTimeMs: resetTime }
      );
    }
  }

  /**
   * Generic request method with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    this.checkRateLimit();

    const { target, useBaseURL } = this.resolveRequestTarget(endpoint);
    const method = (options.method?.toUpperCase() || 'GET') as HttpMethod;
    const mergedHeaders = new Headers(this.defaultHeaders);
    if (options.headers) {
      new Headers(options.headers).forEach((value, key) => mergedHeaders.set(key, value));
    }

    const {
      method: _ignoredMethod,
      headers: _ignoredHeaders,
      signal: requestSignal,
      ...requestOptions
    } = options;

    try {
      return await httpClient.request<T>(method, target, {
        ...requestOptions,
        headers: mergedHeaders,
        signal: requestSignal ?? undefined,
        useBaseURL
      });
    } catch (error) {
      const normalizedError = toHttpError(error, {
        url: target,
        method,
        status: 0,
        statusText: 'NETWORK_ERROR',
      });

      const dataAsRecord = normalizedError.data && typeof normalizedError.data === 'object'
          ? (normalizedError.data as Record<string, any>)
          : undefined;
      const errorMessage = typeof dataAsRecord?.message === 'string'
        ? dataAsRecord.message
        : normalizedError.message;
      const errorCode = typeof dataAsRecord?.error === 'string'
        ? dataAsRecord.error
        : normalizedError.code || (normalizedError.status === 0 ? 'NETWORK_ERROR' : 'HTTP_ERROR');
      const errorDetails = dataAsRecord?.details ?? normalizedError.data;

      throw new APIError(errorMessage, normalizedError.status, errorCode, errorDetails);
    }
  }

  /**
   * Generate prompt synchronously
 * POST /api/v1/generate
   */
  async generatePrompt(request: GenerateRequest): Promise<GenerateResponse> {
    return this.request<GenerateResponse>(httpEndpoints.grompt.generate, {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Generate prompt with streaming
 * GET /api/v1/generate/stream
   *
   * Returns an EventSource for Server-Sent Events
   */
  generatePromptStream(request: GenerateRequest): EventSource {
    this.checkRateLimit();

    // Build query parameters for GET request
    const params = new URLSearchParams();
    params.set('provider', request.provider);
    if (request.model) params.set('model', request.model);
    if (request.purpose) params.set('purpose', request.purpose);
    if (request.temperature !== undefined) {
      params.set('temperature', request.temperature.toString());
    }

    // Add multiple ideas as separate parameters
    request.ideas.forEach(idea => {
      params.append('ideas', idea);
    });

    const baseStreamURL = this.baseURL
      ? buildApiV1Url(this.baseURL, httpEndpoints.grompt.generateStream)
      : buildApiV1Path(httpEndpoints.grompt.generateStream);
    const url = `${baseStreamURL}?${params.toString()}`;
    return new EventSource(url);
  }

  /**
   * List available providers
 * GET /api/v1/providers
   */
  async listProviders(): Promise<ProvidersListResponse> {
    return this.request<ProvidersListResponse>(httpEndpoints.grompt.providers);
  }

  /**
   * Health check
 * GET /api/v1/health
   */
  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>(httpEndpoints.grompt.healthz);
  }

  /**
   * Proxy request to GNyx
 * POST /api/v1/proxy/*
   */
  async proxyToGNyx<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(httpEndpoints.grompt.proxy(path), options);
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus(): {
    canMakeRequest: boolean;
    timeUntilReset: number;
  } {
    return {
      canMakeRequest: this.rateLimiter.canMakeRequest(),
      timeUntilReset: this.rateLimiter.getTimeUntilReset()
    };
  }
}

/**
 * Default API instance
 * Can be imported and used directly
 */
export const api = new GromptAPI();

/**
 * Utility function to handle streaming responses
 * Provides a Promise-based interface for EventSource
 */
export function handleStreamingGeneration(
  request: GenerateRequest,
  callbacks: {
    onStart?: (data: { provider: string; model: string; ideas: string[]; }) => void;
    onChunk?: (content: string) => void;
    onComplete?: (usage?: { tokens: number; costUSD: number; }) => void;
    onError?: (error: string) => void;
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const eventSource = api.generatePromptStream(request);

      eventSource.onmessage = (event) => {
        try {
          const data: StreamEvent = JSON.parse(event.data);

          switch (data.event) {
            case 'generation.started':
              callbacks.onStart?.({
                provider: data.provider!,
                model: data.model!,
                ideas: data.ideas!
              });
              break;

            case 'generation.chunk':
              if (data.content) {
                callbacks.onChunk?.(data.content);
              }
              break;

            case 'generation.complete':
              callbacks.onComplete?.(data.usage);
              eventSource.close();
              resolve();
              break;

            case 'generation.error':
              callbacks.onError?.(data.error!);
              eventSource.close();
              reject(new APIError(data.error!, 0, 'GENERATION_ERROR'));
              break;
          }
        } catch (parseError) {
          console.error('Failed to parse SSE event:', parseError);
          callbacks.onError?.('Failed to parse server response');
          eventSource.close();
          reject(new APIError('Failed to parse server response', 0, 'PARSE_ERROR'));
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        callbacks.onError?.('Connection to server lost');
        eventSource.close();
        reject(new APIError('Connection to server lost', 0, 'CONNECTION_ERROR'));
      };

      // Cleanup on timeout
      setTimeout(() => {
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
          reject(new APIError('Request timeout', 408, 'TIMEOUT'));
        }
      }, 300000); // 5 minutes timeout to match backend

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Type guard for API errors
 */
export function isAPIError(error: any): error is APIError {
  return error instanceof APIError;
}
