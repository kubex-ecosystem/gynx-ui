import { unifiedAIService } from '@/services/unifiedAIService';
import { useProvidersStore } from '@/store/useProvidersStore';
import type { ChatMessagePayload, ChatResponsePayload } from '../types';

const SYSTEM_INSTRUCTION = [
  'Voce e o assistente operacional da GNyx.',
  'Responda em portugues do Brasil.',
  'Seja objetivo, tecnico e acionavel.',
  'Quando apropriado, devolva passos concretos ou listas curtas.',
  'Se o contexto estiver incompleto, responda com a melhor orientacao possivel sem inventar fatos externos.',
].join(' ');

const formatConversation = (messages: ChatMessagePayload[]): string =>
  messages
    .map((message) => {
      const speaker = message.role === 'assistant'
        ? 'Assistant'
        : message.role === 'system'
          ? 'System'
          : 'User';
      return `${speaker}: ${message.content}`;
    })
    .join('\n');

export const chatService = {
  async sendMessage(
    messages: ChatMessagePayload[],
    input: string,
    providerOverride?: string,
    apiKey?: string,
  ): Promise<ChatResponsePayload> {
    const provider = providerOverride || useProvidersStore.getState().globalDefault;
    const transcript = formatConversation(messages);
    const prompt = [
      SYSTEM_INSTRUCTION,
      '',
      'Historico da conversa:',
      transcript || 'Sem historico anterior.',
      '',
      `Mensagem atual do usuario: ${input}`,
      '',
      'Responda apenas com a mensagem do assistant.',
    ].join('\n');

    const result = await unifiedAIService.generateDirectPrompt(
      prompt,
      provider,
      undefined,
      1400,
      apiKey,
    );

    return {
      content: result.response.trim(),
      provider: result.provider,
    };
  },
};
