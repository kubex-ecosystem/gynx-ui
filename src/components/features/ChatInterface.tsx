import { Theme } from '@/types';
import { Loader2, Send, Sparkles, User } from 'lucide-react';
import React, { FormEvent, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import type { ChatMessagePayload, ChatResponsePayload } from '@/modules/chat/types';

interface ChatInterfaceProps {
    onSend?: (messages: ChatMessagePayload[], input: string, apiKey?: string) => Promise<ChatResponsePayload | null>;
    theme: Theme;
    isApiKeyMissing: boolean;
}

const ChatBubble: React.FC<{ message: ChatMessagePayload; }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <div
            className={`max-w-2xl rounded-2xl border px-4 py-3 text-sm shadow-sm transition ${isUser
                ? 'ml-auto border-accent-primary bg-accent-primary text-white shadow-md'
                : 'mr-auto border-border-primary/80 bg-surface-secondary text-secondary'
                }`}
        >
            <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
                    {isUser ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {isUser ? 'Você' : 'Assistant'}
                </span>
                {message.usedProvider && (
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted">
                        {message.usedProvider}
                    </span>
                )}
            </div>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed">{message.content}</p>
            <span className="mt-3 block text-[10px] uppercase tracking-[0.3em] text-muted">
                {new Date(message.createdAt).toLocaleTimeString()}
            </span>
        </div>
    );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSend, theme, isApiKeyMissing }) => {
    const [messages, setMessages] = useState<ChatMessagePayload[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    // BYOK Support
    const [externalApiKey, setExternalApiKey] = useState<string>('');
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);
    const disabled = input.trim().length === 0 || isSending;

    const placeholder = useMemo(
        () =>
            'Descreva o contexto do atendimento, insira scripts de vendas ou cole uma conversa existente para gerar respostas contextualizadas.',
        []
    );

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        const nextMessage: ChatMessagePayload = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: trimmed,
            createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, nextMessage]);
        setInput('');

        if (!onSend) return;

        setIsSending(true);
        try {
            // BYOK Support: Pass external API key if provided
            const apiKey = externalApiKey.trim() || undefined;
            const response = await onSend([...messages, nextMessage], trimmed, apiKey);
            if (response) {
                const assistantMessage: ChatMessagePayload = {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: response.content,
                    createdAt: Date.now(),
                    usedProvider: response.provider,
                };
                setMessages((prev) => [...prev, assistantMessage]);
            }
        } catch (error) {
            const assistantMessage: ChatMessagePayload = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content:
                    error instanceof Error
                        ? `Não foi possível obter uma resposta: ${error.message}`
                        : 'Não foi possível obter uma resposta da IA.',
                createdAt: Date.now(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card title="Chat assistido" description="Converse com seu provedor principal usando contexto governado">
                <div className="flex flex-col gap-4">
                    <div className="space-y-3">
                        {messages.length === 0 ? (
                            <p className="rounded-2xl border border-dashed border-border-primary/80 bg-surface-primary/60 p-6 text-sm text-secondary">
                                Nenhuma mensagem ainda. Use o campo abaixo para iniciar uma conversa.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <ChatBubble key={message.id} message={message} />
                                ))}
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="rounded-2xl border border-border-primary/80 bg-surface-primary/70 p-4 shadow-sm">
                        <label htmlFor="chat-input" className="mb-2 block text-xs font-semibold uppercase tracking-[0.4em] text-muted">
                            Sua mensagem
                        </label>
                        <textarea
                            id="chat-input"
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder={placeholder}
                            rows={4}
                            className="w-full resize-none rounded-xl border border-border-primary bg-surface-primary px-4 py-3 text-sm text-primary shadow-sm transition focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                        />

                        {/* BYOK Support: Optional API Key Input */}
                        <div className="mt-3">
                            <button
                                type="button"
                                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                                className="text-xs text-muted hover:text-primary flex items-center gap-1 transition-colors"
                            >
                                {showApiKeyInput ? '🔒 Ocultar API Key' : '🔑 Usar Sua Própria API Key (BYOK)'}
                            </button>

                            {showApiKeyInput && (
                                <div className="mt-2">
                                    <input
                                        type="password"
                                        placeholder="sk-... ou AIza... (opcional)"
                                        value={externalApiKey}
                                        onChange={(e) => setExternalApiKey(e.target.value)}
                                        className="w-full p-2 rounded-lg border border-border-primary bg-surface-primary text-sm text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                                    />
                                    <p className="text-xs mt-1 text-muted">
                                        💡 Sua key é usada apenas nesta requisição e nunca armazenada
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">
                                Histórico salvo localmente
                            </p>
                            <button
                                type="submit"
                                disabled={disabled}
                                className="inline-flex items-center gap-2 rounded-full border border-accent-primary bg-accent-primary px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-accent-secondary disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                            >
                                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                {isSending ? 'Gerando...' : 'Enviar mensagem'}
                            </button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export type { ChatMessagePayload as ChatMessage };
export default ChatInterface;
