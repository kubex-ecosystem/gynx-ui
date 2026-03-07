/**
 * Enhanced Grompt API Service with Offline PWA Support
 * Full integration with Go backend APIs and offline fallback mechanisms
 */

import { openDB, type IDBPDatabase } from 'idb';
import { httpClient, type HttpMethod, type QueryValue } from '../core/http/client';
import type { Provider } from './api';
import { multiProviderService } from './multiProviderService';

// Re-export existing types
export type {
  GenerateRequest,
  GenerateResponse, HealthResponse, Provider,
  StreamEvent
} from './api';

export {
  APIError,
  isAPIError
} from './api';

// Extended interfaces for full backend integration
export interface ScorecardRequest {
  repo: string;
  period?: number;
  user?: string;
}

export interface ScorecardResponse {
  owner: string;
  repo: string;
  period_days: number;
  ai: {
    hir: number;
    aac: number;
    tph: number;
    humanHours: number;
    aiHours: number;
  };
  confidence: {
    ai: number;
  };
}

export interface ScorecardAdviceRequest {
  scorecard: ScorecardResponse;
  hotspots?: string[];
  mode: 'exec' | 'code' | 'ops' | 'community';
}

export interface AIMetricsResponse {
  schema_version: string;
  owner: string;
  repo: string;
  period_days: number;
  contributors: Array<{
    user: string;
    hir: number;
    aac: number;
    tph: number;
    hours: {
      human: number;
      ai: number;
    };
    commits: number;
  }>;
  aggregates: {
    hir_p50: number;
    hir_p90: number;
    aac: number;
    tph_p50: number;
  };
  provenance: {
    sources: string[];
  };
  confidence: {
    hir: number;
    aac: number;
    tph: number;
  };
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export interface OfflineQueueItem {
  id?: number;
  endpoint: string;
  method: string;
  body?: any;
  timestamp: number;
  retryCount: number;
}

// Database interface for enhanced offline storage
interface EnhancedGromptDB extends IDBPDatabase {
  providers: {
    key: string;
    value: Provider & { timestamp: number; };
  };
  prompts: {
    key: string;
    value: any & { timestamp: number; };
    indexes: {
      timestamp: number;
      provider: string;
      purpose: string;
    };
  };
  healthz: {
    key: number;
    value: any;
  };
  scorecards: {
    key: string;
    value: ScorecardResponse & { timestamp: number; };
    indexes: { timestamp: number; };
  };
  ai_metrics: {
    key: string;
    value: AIMetricsResponse & { timestamp: number; };
    indexes: { timestamp: number; };
  };
  settings: {
    key: string;
    value: { key: string; value: any; timestamp: number; };
  };
  offline_queue: {
    key: number;
    value: OfflineQueueItem;
    indexes: { timestamp: number; };
  };
}

/**
 * Enhanced API Service with comprehensive offline support
 */
export class EnhancedGromptAPI {
  private baseURL: string;
  private db: Promise<EnhancedGromptDB> | null = null;
  private isOnline: boolean = navigator.onLine;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private offlineProviders: Provider[] = [];

  // Configuration
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly OFFLINE_FALLBACK_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_RETRY_ATTEMPTS = 3;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
    this.initDB();
    this.setupOnlineListeners();
    this.initOfflineProviders();
  }

  private initOfflineProviders(): void {
    this.offlineProviders = [
      {
        name: 'offline-template',
        available: true,
        type: 'template',
        defaultModel: 'template-based'
      },
      {
        name: 'offline-basic',
        available: true,
        type: 'basic',
        defaultModel: 'basic-template'
      }
    ];
  }

  private setupOnlineListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🟢 Network restored - Syncing offline data...');
      this.syncOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('🔴 Network lost - Switching to offline mode');
    });
  }

  private async initDB(): Promise<void> {
    this.db = openDB<EnhancedGromptDB>('EnhancedGromptDB', 3, {
      upgrade(db, oldVersion) {
        // Providers store
        if (!db.objectStoreNames.contains('providers')) {
          db.createObjectStore('providers', { keyPath: 'name' });
        }

        // Prompts store with enhanced indexing
        if (!db.objectStoreNames.contains('prompts')) {
          const promptStore = db.createObjectStore('prompts', { keyPath: 'id' });
          promptStore.createIndex('timestamp', 'timestamp');
          promptStore.createIndex('provider', 'provider');
          promptStore.createIndex('purpose', 'purpose');
        }

        // Health status store
        if (!db.objectStoreNames.contains('healthz')) {
          db.createObjectStore('healthz', { keyPath: 'timestamp' });
        }

        // Scorecards store
        if (!db.objectStoreNames.contains('scorecards')) {
          const scorecardStore = db.createObjectStore('scorecards', { keyPath: 'repo' });
          scorecardStore.createIndex('timestamp', 'timestamp');
        }

        // AI metrics store
        if (!db.objectStoreNames.contains('ai_metrics')) {
          const metricsStore = db.createObjectStore('ai_metrics', { keyPath: 'repo' });
          metricsStore.createIndex('timestamp', 'timestamp');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Offline queue for sync when back online
        if (oldVersion < 3 && !db.objectStoreNames.contains('offline_queue')) {
          const queueStore = db.createObjectStore('offline_queue', {
            keyPath: 'id',
            autoIncrement: true
          });
          queueStore.createIndex('timestamp', 'timestamp');
        }

        // Future object stores can be added here
        console.log('EnhancedGromptDB initialized (version ' + db.version + ')');

        // On upgrade, clear outdated data using the current upgrade transaction
        if (oldVersion < 2) {
          const storesToClear = ['providers', 'prompts', 'healthz', 'scorecards', 'ai_metrics', 'settings', 'offline_queue'];
          storesToClear.forEach(storeName => {
            if (db.objectStoreNames.contains(storeName)) {
              // Note: During upgrade, we use db.deleteObjectStore or transaction.objectStore
              // However, clear() can be called on the transaction's stores.
              // A safer way during upgrade is often just to let it be or use the provided transaction.
            }
          });
        }
      }
    }) as Promise<EnhancedGromptDB>;
  }


  // Cache management
  private async getCachedData<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T, duration: number = this.CACHE_DURATION): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration
    });
  };

  private resolveEndpoint(endpoint: string): string {
    if (!this.baseURL) return endpoint;

    const normalizedBase = this.baseURL.replace(/\/+$/, '');
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${normalizedBase}${normalizedEndpoint}`;
  }

  private async httpRequest<TResponse = unknown, TBody = unknown>(
    method: HttpMethod,
    endpoint: string,
    options: {
      body?: TBody;
      headers?: HeadersInit;
      query?: Record<string, QueryValue>;
      parseAs?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'void' | 'response';
    } = {}
  ): Promise<TResponse> {
    return httpClient.request<TResponse, TBody>(method, this.resolveEndpoint(endpoint), {
      ...options,
      useBaseURL: false
    });
  }

  // Enhanced API methods with offline fallbacks

  async generatePrompt(request: any): Promise<any> {
    if (!this.isOnline) {
      return this.generateOfflinePrompt(request);
    }

    try {
      // Try multi-provider service first (includes local providers + backend fallback)
      const result = await multiProviderService.generateContent(request);
      await this.storePrompt(result);
      return result;
    } catch (error) {
      console.error('Generate prompt error:', error);
      if (this.isOnline) {
        await this.queueOfflineRequest('POST', '/v1/generate', request);
        return this.generateOfflinePrompt(request);
      }
      throw error;
    }
  }

  async generatePromptStream(
    request: any,
    onChunk: (content: string) => void,
    onComplete?: (usage?: any) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (!this.isOnline) {
      return this.simulateOfflineStream(request, onChunk, onComplete, onError);
    }

    try {
      // Try multi-provider service first (includes local providers + backend fallback)
      await multiProviderService.generateContentStream(
        request,
        onChunk,
        onComplete || (() => { }),
        onError || (() => { })
      );
    } catch (error) {
      console.error('Stream error:', error);
      if (this.isOnline) {
        return this.simulateOfflineStream(request, onChunk, onComplete, onError);
      }
      onError?.(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async getProviders(): Promise<Provider[]> {
    const cacheKey = 'providers';
    const cached = await this.getCachedData<Provider[]>(cacheKey);

    // Always try to get the latest from multi-provider service
    try {
      const multiProviders = multiProviderService.getAvailableProviders();
      if (multiProviders.length > 0) {
        this.setCachedData(cacheKey, multiProviders);
        await this.storeProviders(multiProviders);
        return multiProviders;
      }
    } catch (error) {
      console.warn('Multi-provider service error:', error);
    }

    if (cached) return cached;

    if (!this.isOnline) {
      return await this.getOfflineProviders();
    }

    try {
      const result = await this.httpRequest<{ data?: Provider[] }>('GET', '/v1/providers');
      const providers = result.data || [];

      this.setCachedData(cacheKey, providers);
      await this.storeProviders(providers);

      return providers;
    } catch (error) {
      console.error('Get providers error:', error);
      return await this.getOfflineProviders();
    }
  }

  async getHealth(): Promise<any> {
    const cacheKey = 'healthz';
    const cached = await this.getCachedData<any>(cacheKey);
    if (cached) return cached;

    if (!this.isOnline) {
      return this.getOfflineHealth();
    }

    try {
      const healthz = await this.httpRequest<any>('GET', '/healthz');
      this.setCachedData(cacheKey, healthz);
      await this.storeHealth(healthz);

      return healthz;
    } catch (error) {
      console.error('Health check error:', error);
      return this.getOfflineHealth();
    }
  }

  // Extended API methods for full backend integration

  async getScorecard(request: ScorecardRequest): Promise<ScorecardResponse> {
    const cacheKey = `scorecard_${request.repo}_${request.period}`;
    const cached = await this.getCachedData<ScorecardResponse>(cacheKey);
    if (cached) return cached;

    if (!this.isOnline) {
      return await this.getOfflineScorecard(request);
    }

    const scorecardQuery = {
      repo: request.repo,
      ...(request.period && { period: request.period.toString() }),
      ...(request.user && { user: request.user }),
    };

    try {
      const scorecard = await this.httpRequest<ScorecardResponse>('GET', '/api/v1/scorecard', {
        query: scorecardQuery
      });
      this.setCachedData(cacheKey, scorecard);
      await this.storeScorecard(request.repo, scorecard);

      return scorecard;
    } catch (error) {
      console.error('Get scorecard error:', error);
      if (this.isOnline) {
        const query = new URLSearchParams(scorecardQuery).toString();
        await this.queueOfflineRequest('GET', `/api/v1/scorecard?${query}`);
      }
      return await this.getOfflineScorecard(request);
    }
  }

  async getScorecardAdvice(request: ScorecardAdviceRequest): Promise<any> {
    if (!this.isOnline) {
      return this.generateOfflineAdvice(request);
    }

    try {
      return await this.httpRequest<any, ScorecardAdviceRequest>('POST', '/api/v1/scorecard/advice', {
        body: request,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Get scorecard advice error:', error);
      if (this.isOnline) {
        await this.queueOfflineRequest('POST', '/api/v1/scorecard/advice', request);
      }
      return this.generateOfflineAdvice(request);
    }
  }

  async getAIMetrics(request: ScorecardRequest, _params: any): Promise<AIMetricsResponse> {
    const cacheKey = `ai_metrics_${request.repo}_${request.period}`;
    const cached = await this.getCachedData<AIMetricsResponse>(cacheKey);
    if (cached) return cached;

    if (!this.isOnline) {
      return await this.getOfflineAIMetrics(request);
    }

    const metricsQuery = {
      repo: request.repo,
      ...(request.period && { period: request.period.toString() }),
      ...(request.user && { user: request.user }),
    };

    try {
      const metrics = await this.httpRequest<AIMetricsResponse>('GET', '/api/v1/metrics/ai', {
        query: metricsQuery
      });
      this.setCachedData(cacheKey, metrics);
      await this.storeAIMetrics(request.repo, metrics);

      return metrics;
    } catch (error) {
      console.error('Get AI metrics error:', error);
      if (this.isOnline) {
        const query = new URLSearchParams(metricsQuery).toString();
        await this.queueOfflineRequest('GET', `/api/v1/metrics/ai?${query}`);
      }
      return await this.getOfflineAIMetrics(request);
    }
  }

  // Offline functionality

  private async generateOfflinePrompt(request: any): Promise<any> {
    const prompt = this.createOfflinePrompt(request.ideas, request.purpose);

    const result = {
      id: `offline_${Date.now()}`,
      object: 'prompt.generation',
      createdAt: Math.floor(Date.now() / 1000),
      provider: request.provider || 'offline-template',
      model: request.model || 'template-based',
      prompt,
      ideas: request.ideas,
      purpose: request.purpose || 'general',
      metadata: {
        offline: true,
        temperature: request.temperature || 0.7,
        generated_at: new Date().toISOString()
      }
    };

    await this.storePrompt(result);
    return result;
  }

  private createOfflinePrompt(ideas: string[], purpose?: string): string {
    const templates = {
      code: `Você é um desenvolvedor experiente. Com base nas seguintes ideias, crie uma tarefa de programação abrangente:

Ideias:
${ideas.map((idea, i) => `${i + 1}. ${idea}`).join('\n')}

Forneça:
- Requisitos claros e especificações
- Detalhes de implementação técnica
- Sugestões de estrutura e arquitetura de código
- Considerações de teste
- Necessidades de documentação

Formate sua resposta como um prompt de desenvolvimento detalhado.`,

      creative: `Você é um especialista em escrita criativa. Transforme essas ideias em um projeto criativo envolvente:

Ideias:
${ideas.map((idea, i) => `${i + 1}. ${idea}`).join('\n')}

Forneça:
- Conceito criativo e tema
- Desenvolvimento de personagens ou elementos
- Estrutura de enredo ou framework criativo
- Orientação de estilo e tom
- Considerações sobre público-alvo

Formate sua resposta como um briefing criativo abrangente.`,

      analysis: `Você é um analista de dados e pesquisador. Com base nesses conceitos, crie um framework analítico:

Ideias:
${ideas.map((idea, i) => `${i + 1}. ${idea}`).join('\n')}

Forneça:
- Perguntas de pesquisa e hipóteses
- Metodologia e abordagem
- Requisitos de dados e fontes
- Framework de análise
- Resultados esperados e entregas

Formate sua resposta como um plano de análise detalhado.`,

      general: `Com base nas seguintes ideias, crie um plano abrangente e acionável:

Ideias:
${ideas.map((idea, i) => `${i + 1}. ${idea}`).join('\n')}

Forneça:
- Objetivos e metas claros
- Abordagem passo a passo
- Considerações e requisitos principais
- Critérios de sucesso
- Orientação de implementação

Formate sua resposta como um plano de ação detalhado.`
    };

    return templates[purpose as keyof typeof templates] || templates.general;
  }

  private async simulateOfflineStream(
    request: any,
    onChunk: (content: string) => void,
    onComplete?: (usage?: any) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      const prompt = this.createOfflinePrompt(request.ideas, request.purpose);
      const words = prompt.split(' ');

      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
      }

      onComplete?.({
        tokens: words.length,
        costUSD: 0,
        offline: true
      });
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Offline simulation failed');
    }
  }

  private async getOfflineProviders(): Promise<Provider[]> {
    if (!this.db) return this.offlineProviders;

    try {
      const db = await this.db;
      const providers = await db.getAll('providers');

      if (providers.length === 0) {
        return this.offlineProviders;
      }

      return [
        ...providers.map(p => ({ ...p, available: false, error: 'Modo offline' })),
        ...this.offlineProviders
      ];
    } catch (error) {
      console.warn('Failed to get offline providers:', error);
      return this.offlineProviders;
    }
  }

  private getOfflineHealth(): any {
    return {
      status: 'offline',
      service: 'grompt-v1',
      timestamp: Date.now() / 1000,
      version: '1.0.0',
      dependencies: {
        note: 'Executando em modo offline com dados em cache e templates locais'
      }
    };
  }

  private async getOfflineScorecard(request: ScorecardRequest): Promise<ScorecardResponse> {
    if (this.db) {
      try {
        const db = await this.db;
        const cached = await db.get('scorecards', request.repo);
        if (cached) return cached;
      } catch (error) {
        console.warn('Failed to get cached scorecard:', error);
      }
    }

    return {
      owner: request.repo.split('/')[0] || 'unknown',
      repo: request.repo.split('/')[1] || 'unknown',
      period_days: request.period || 60,
      ai: {
        hir: 0.0,
        aac: 0.0,
        tph: 0.0,
        humanHours: 0,
        aiHours: 0
      },
      confidence: {
        ai: 0.0
      }
    };
  }

  private generateOfflineAdvice(request: ScorecardAdviceRequest): any {
    const templates = {
      exec: "Análise Executiva: Os dados estão limitados no modo offline. Para análises completas, conecte-se à internet.",
      code: "Análise de Código: Métricas detalhadas não disponíveis offline. Use templates locais para análise básica.",
      ops: "Análise DORA: Indicadores operacionais requerem conectividade para dados atualizados.",
      community: "Análise de Comunidade: Dados de colaboração não disponíveis no modo offline."
    };

    return {
      mode: request.mode,
      analysis: templates[request.mode] || templates.exec,
      offline: true,
      timestamp: Date.now()
    };
  }

  private async getOfflineAIMetrics(request: ScorecardRequest): Promise<AIMetricsResponse> {
    if (this.db) {
      try {
        const db = await this.db;
        const cached = await db.get('ai_metrics', request.repo);
        if (cached) return cached;
      } catch (error) {
        console.warn('Failed to get cached AI metrics:', error);
      }
    }

    return {
      schema_version: "ai_metrics@1.0.0",
      owner: request.repo.split('/')[0] || 'unknown',
      repo: request.repo.split('/')[1] || 'unknown',
      period_days: request.period || 60,
      contributors: [],
      aggregates: {
        hir_p50: 0.0,
        hir_p90: 0.0,
        aac: 0.0,
        tph_p50: 0.0
      },
      provenance: {
        sources: ['offline_mode']
      },
      confidence: {
        hir: 0.0,
        aac: 0.0,
        tph: 0.0
      }
    };
  }

  // Storage methods

  private async storePrompt(prompt: any): Promise<void> {
    if (!this.db) return;

    try {
      const db = await this.db;
      await db.put('prompts', { ...prompt, timestamp: Date.now() });
    } catch (error) {
      console.warn('Failed to store prompt offline:', error);
    }
  }

  private async storeProviders(providers: Provider[]): Promise<void> {
    if (!this.db) return;

    try {
      const db = await this.db;
      const tx = db.transaction('providers', 'readwrite');

      await tx.store.clear();
      for (const provider of providers) {
        await tx.store.put({ ...provider, timestamp: Date.now() });
      }

      await tx.done;
    } catch (error) {
      console.warn('Failed to store providers offline:', error);
    }
  }

  private async storeHealth(healthz: any): Promise<void> {
    if (!this.db) return;

    try {
      const db = await this.db;
      await db.put('healthz', healthz);
    } catch (error) {
      console.warn('Failed to store health offline:', error);
    }
  }

  private async storeScorecard(repo: string, scorecard: ScorecardResponse): Promise<void> {
    if (!this.db) return;

    try {
      const db = await this.db;
      await db.put('scorecards', { ...scorecard, repo, timestamp: Date.now() });
    } catch (error) {
      console.warn('Failed to store scorecard offline:', error);
    }
  }

  private async storeAIMetrics(repo: string, metrics: AIMetricsResponse): Promise<void> {
    if (!this.db) return;

    try {
      const db = await this.db;
      await db.put('ai_metrics', { ...metrics, repo, timestamp: Date.now() });
    } catch (error) {
      console.warn('Failed to store AI metrics offline:', error);
    }
  };

  // Offline queue management

  private async queueOfflineRequest(method: string, endpoint: string, body?: any): Promise<void> {
    if (!this.db) return;

    try {
      const db = await this.db;
      await db.add('offline_queue', {
        endpoint,
        method,
        body,
        timestamp: Date.now(),
        retryCount: 0
      });
    } catch (error) {
      console.warn('Failed to queue offline request:', error);
    }
  }

  private async syncOfflineQueue(): Promise<void> {
    if (!this.db || !this.isOnline) return;

    try {
      const db = await this.db;
      const queue = await db.getAll('offline_queue');

      for (const item of queue) {
        if (item.retryCount >= this.MAX_RETRY_ATTEMPTS) {
          await db.delete('offline_queue', item.id!);
          continue;
        }

        try {
          await this.httpRequest<void, unknown>((item.method.toUpperCase() || 'GET') as HttpMethod, item.endpoint, {
            headers: { 'Content-Type': 'application/json' },
            ...(item.body !== undefined && { body: item.body }),
            parseAs: 'void'
          });

          await db.delete('offline_queue', item.id!);
          console.log(`Synced offline request: ${item.method} ${item.endpoint}`);
        } catch (error) {
          console.warn(`Failed to sync offline request: ${item.method} ${item.endpoint}`, error);
          await db.put('offline_queue', {
            ...item,
            retryCount: item.retryCount + 1
          });
        }
      }
    } catch (error) {
      console.warn('Failed to sync offline queue:', error);
    }
  };

  // Public utility methods

  async getOfflinePrompts(limit: number = 50): Promise<any[]> {
    if (!this.db) return [];

    try {
      const db = await this.db;
      const tx = db.transaction('prompts', 'readonly');
      const index = tx.store.index('timestamp');
      const prompts = await index.getAll();

      return prompts
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch (error) {
      console.warn('Failed to get offline prompts:', error);
      return [];
    }
  }

  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) return;

    try {
      const db = await this.db;
      await db.put('settings', { key, value, timestamp: Date.now() });
    } catch (error) {
      console.warn('Failed to save setting:', error);
    }
  }

  async getSetting(key: string, defaultValue?: any): Promise<any> {
    if (!this.db) return defaultValue;

    try {
      const db = await this.db;
      const setting = await db.get('settings', key);
      return setting ? setting.value : defaultValue;
    } catch (error) {
      console.warn('Failed to get setting:', error);
      return defaultValue;
    }
  };

  isConnected(): boolean {
    return this.isOnline;
  }

  async clearCache(): Promise<void> {
    this.cache.clear();

    if (!this.db) return;

    try {
      const db = await this.db;
      const stores = ['prompts', 'scorecards', 'ai_metrics', 'healthz', 'providers'];

      for (const storeName of stores) {
        const tx = db.transaction(storeName as any, 'readwrite');
        await tx.store.clear();
        await tx.done;
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  async getQueuedRequestsCount(): Promise<number> {
    if (!this.db) return 0;

    try {
      const db = await this.db;
      const queue = await db.getAll('offline_queue');
      return queue.length;
    } catch (error) {
      console.warn('Failed to get queued requests count:', error);
      return 0;
    }
  }
}

// Singleton instance
export const enhancedAPI = new EnhancedGromptAPI();
