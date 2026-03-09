export interface ChatMessagePayload {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  usedProvider?: string;
}

export interface ChatResponsePayload {
  content: string;
  provider?: string;
}
