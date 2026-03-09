import type { Agent, AgentsGenerationResult, StoredAgent } from '@/types';
import { httpClient } from '@/core/http/client';
import { httpEndpoints } from '@/core/http/endpoints';

const BASE_PATH = httpEndpoints.agents.root;

export const agentsService = {
  async list(): Promise<StoredAgent[]> {
    return httpClient.get<StoredAgent[]>(BASE_PATH, {
      headers: { 'Accept': 'application/json' },
    });
  },

  async create(agent: Agent): Promise<StoredAgent> {
    return httpClient.post<StoredAgent, Agent>(BASE_PATH, agent, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  },

  async update(id: number, agent: Agent): Promise<StoredAgent> {
    return httpClient.put<StoredAgent, Agent>(httpEndpoints.agents.byId(id), agent, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete<void>(httpEndpoints.agents.byId(id), {
      parseAs: 'void',
    });
  },

  async generate(requirements: string): Promise<AgentsGenerationResult> {
    return httpClient.post<AgentsGenerationResult, { requirements: string }>(
      httpEndpoints.agents.generate,
      { requirements },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
  },

  async exportMarkdown(): Promise<string> {
    return httpClient.get<string>(httpEndpoints.agents.markdown, {
      parseAs: 'text',
      headers: {
        'Accept': 'text/markdown',
      },
    });
  },
};

export type AgentsService = typeof agentsService;
