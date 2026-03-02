import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Loader2, StopCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import { streamChat } from '@/services/streamingService';
import { useProvidersStore } from '@/store/useProvidersStore';

const Playground: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { globalDefault, setGlobalDefault, status } = useProvidersStore();

  const responseEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    responseEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [response]);

  const handleSend = () => {
    if (!prompt.trim() || isStreaming) return;

    setResponse('');
    setError(null);
    setIsStreaming(true);

    streamChat(prompt, {
      onChunk: (chunk: string) => {
        setResponse((prev) => prev + chunk);
      },
      onComplete: () => {
        setIsStreaming(false);
      },
      onError: (err: Error) => {
        setError(err.message);
        setIsStreaming(false);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 h-full flex flex-col animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Terminal className="text-accent-primary" size={32} />
            LLM Playground
          </h1>
          <p className="text-secondary text-sm">
            Teste requisições em tempo real via Server-Sent Events (POST stream).
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-primary border border-border-primary rounded-xl px-4 py-2">
          <label className="text-xs font-bold text-muted uppercase tracking-widest">
            Provider:
          </label>
          <select
            value={globalDefault}
            onChange={(e) => setGlobalDefault(e.target.value)}
            className="bg-transparent border-none text-primary text-sm font-semibold focus:outline-none focus:ring-0"
          >
            <option value="openai">OpenAI {status['openai'] === 'READY' ? '✓' : ''}</option>
            <option value="anthropic">Anthropic {status['anthropic'] === 'READY' ? '✓' : ''}</option>
            <option value="groq">Groq {status['groq'] === 'READY' ? '✓' : ''}</option>
            <option value="gemini">Gemini {status['gemini'] === 'READY' ? '✓' : ''}</option>
            <option value="deepseek">DeepSeek {status['deepseek'] === 'READY' ? '✓' : ''}</option>
            <option value="ollama">Ollama {status['ollama'] === 'READY' ? '✓' : ''}</option>
          </select>
        </div>
      </header>

      {/* Response Area */}
      <Card className="flex-grow flex flex-col min-h-[400px] bg-main/50 backdrop-blur-sm border-border-primary overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-surface-tertiary/20 border-b border-border-primary shrink-0">
          <span className="text-[10px] font-mono text-muted uppercase">Terminal Output</span>
          {isStreaming && (
            <span className="flex items-center gap-2 text-[10px] font-bold text-accent-secondary animate-pulse">
              <Loader2 size={12} className="animate-spin" /> STREAMING
            </span>
          )}
        </div>

        <div className="flex-grow p-4 md:p-6 overflow-y-auto font-mono text-sm leading-relaxed text-secondary custom-scrollbar">
          {error ? (
            <div className="text-status-error break-words whitespace-pre-wrap">Error: {error}</div>
          ) : response ? (
            <div className="whitespace-pre-wrap break-words">{response}</div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted gap-3 opacity-50">
              <Terminal size={48} />
              <p className="font-sans text-sm">Aguardando requisição...</p>
            </div>
          )}
          <div ref={responseEndRef} />
        </div>
      </Card>

      {/* Input Area */}
      <Card className="shrink-0 bg-surface-primary border-border-primary p-2">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite seu prompt aqui... (Shift + Enter quebra a linha)"
            className="w-full bg-transparent text-primary placeholder-muted rounded-lg border-none resize-none focus:ring-0 focus:outline-none p-4 pr-16 custom-scrollbar"
            rows={3}
            disabled={isStreaming}
          />
          <button
            onClick={handleSend}
            disabled={!prompt.trim() || isStreaming}
            className={`absolute bottom-3 right-3 p-3 rounded-xl transition-all shadow-sm ${!prompt.trim() || isStreaming
              ? 'bg-surface-tertiary text-muted cursor-not-allowed'
              : 'bg-accent-primary text-white hover:bg-accent-secondary hover:scale-105'
              }`}
          >
            {isStreaming ? <StopCircle size={18} /> : <Send size={18} />}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Playground;
