import { useProvidersStore } from '@/store/useProvidersStore';
import { httpClient } from '@/core/http/client';

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export const streamChat = async (
  prompt: string,
  callbacks: StreamCallbacks
) => {
  const store = useProvidersStore.getState();
  const provider = store.globalDefault;
  const apiKey = store.getDecryptedKey(provider);

  try {
    const response = await httpClient.post<Response, { prompt: string; provider: string }>(
      '/unified/stream',
      {
        prompt,
        provider,
      },
      {
        parseAs: 'response',
        timeoutMs: 300000,
        credentials: 'omit', // Ou 'include' se usar cookies de sessão
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-api-key': apiKey } : {}),
        },
      }
    );

    if (!response.body) {
      throw new Error('ReadableStream not supported in this browser.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          if (dataStr === '[DONE]') {
            callbacks.onComplete();
            return;
          }
          try {
            const data = JSON.parse(dataStr);
            if (data.chunk) {
              callbacks.onChunk(data.chunk);
            }
          } catch (e) {
            console.warn('Silent JSON parse error in stream chunk', e);
          }
        }
      }
    }

    // Processa o buffer restante
    if (buffer.startsWith('data: ')) {
      const dataStr = buffer.slice(6);
      if (dataStr !== '[DONE]') {
        try {
          const data = JSON.parse(dataStr);
          if (data.chunk) {
            callbacks.onChunk(data.chunk);
          }
        } catch (e) {
          console.warn('Silent JSON parse error in stream buffer', e);
        }
      }
    }

    callbacks.onComplete();
  } catch (error: any) {
    callbacks.onError(error);
  }
};
