import { Loader2, NotebookPen, Wand2 } from 'lucide-react';
import React, { useState } from 'react';
import Card from '../ui/Card';
import { Theme } from '@/types';

interface ContentSummarizerProps {
 onSummarize?: (input: string, tone: string, maxWords: number, apiKey?: string) => Promise<string>;
 theme: Theme;
 isApiKeyMissing: boolean;
}

const tonePresets = [
 { id: 'executive', label: 'Executivo' },
 { id: 'technical', label: 'Técnico' },
 { id: 'casual', label: 'Casual' },
];

const ContentSummarizer: React.FC<ContentSummarizerProps> = ({ onSummarize, theme, isApiKeyMissing }) => {
 const [input, setInput] = useState('');
 const [tone, setTone] = useState('executive');
 const [maxWords, setMaxWords] = useState(220);
 const [isLoading, setIsLoading] = useState(false);
 const [summary, setSummary] = useState<string | null>(null);
 const [error, setError] = useState<string | null>(null);
 // BYOK Support
 const [externalApiKey, setExternalApiKey] = useState<string>('');
 const [showApiKeyInput, setShowApiKeyInput] = useState(false);

 const handleSummarize = async () => {
 if (!input.trim() || !onSummarize) return;
 setIsLoading(true);
 setError(null);
 setSummary(null);
 try {
 // BYOK Support: Pass external API key if provided
 const apiKey = externalApiKey.trim() || undefined;
 const result = await onSummarize(input.trim(), tone, maxWords, apiKey);
 setSummary(result);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Não foi possível gerar o resumo.');
 } finally {
 setIsLoading(false);
 }
 };

 const disabled = !input.trim() || isLoading;

 return (
 <div className="space-y-6">
 <Card title="Summarizer" description="Transforme briefings longos em entregáveis prontos para stakeholders.">
 <div className="grid gap-6 lg:grid-cols-2">
 <div className="space-y-4">
 <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-muted dark:text-secondary">
 Conteúdo base
 </label>
 <textarea
 value={input}
 onChange={(event) => setInput(event.target.value)}
 placeholder="Cole aqui atas, relatórios ou mensagens extensas."
 rows={12}
 className="w-full resize-none rounded-2xl border px-4 py-3 text-sm text-secondary shadow-sm transition focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 border-border-primary bg-surface-primary text-primary focus:border-accent-secondary focus:ring-accent-secondary/20"
 />

 <div className="flex flex-wrap gap-3">
 {tonePresets.map((preset) => (
 <button
 key={preset.id}
 type="button"
 onClick={() => setTone(preset.id)}
 className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${tone === preset.id
 ? 'border-accent-primary bg-accent-primary text-white shadow-md dark:border-accent-primary dark:bg-accent-primary text-main'
 : ' text-secondary hover:border-border-accent border-border-primary bg-surface-primary dark:text-muted'
 }`}
 >
 {preset.label}
 </button>
 ))}
 </div>

 <div className="flex items-center gap-3">
 <label htmlFor="max-words" className="text-xs uppercase tracking-[0.3em] text-muted dark:text-secondary">
 Limite de palavras
 </label>
 <input
 id="max-words"
 type="number"
 min={100}
 max={600}
 value={maxWords}
 onChange={(event) => setMaxWords(Number(event.target.value))}
 className="w-24 rounded-lg border px-3 py-2 text-sm text-secondary shadow-sm focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 border-border-primary bg-surface-primary text-primary"
 />
 </div>

 {/* BYOK Support: Optional API Key Input */}
 <div>
 <button
 type="button"
 onClick={() => setShowApiKeyInput(!showApiKeyInput)}
 className="text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
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
 className="w-full p-2 rounded-lg border text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400"
 />
 <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
 💡 Sua key é usada apenas nesta requisição e nunca armazenada
 </p>
 </div>
 )}
 </div>

 <button
 type="button"
 disabled={disabled}
 onClick={handleSummarize}
 className="inline-flex items-center gap-2 rounded-full border border-accent-primary bg-accent-primary px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-accent-secondary disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 dark:border-accent-primary dark:bg-accent-primary text-main"
 >
 {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <NotebookPen className="h-4 w-4" />}
 {isLoading ? 'Gerando resumo...' : 'Gerar resumo'}
 </button>
 <p className="text-[11px] uppercase tracking-[0.3em] text-muted dark:text-secondary">
 O resumo respeita as diretrizes Kubex e mantém a origem do conteúdo.
 </p>
 </div>

 <div className="flex h-full flex-col rounded-2xl border border-border-primary/80 bg-surface-secondary/85 p-5 shadow-md border-border-secondary/70 bg-surface-primary/70">
 <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-muted dark:text-secondary">
 <Wand2 className="h-4 w-4" /> Entregável
 </div>
 <div className="mt-4 flex-1 overflow-auto rounded-xl border border-dashed border-border-primary/80 bg-surface-secondary/90 p-4 text-sm text-secondary border-border-secondary/80 bg-surface-primary/75 text-primary">
 {summary && <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed">{summary}</pre>}
 {!summary && !error && !isLoading && (
 <p>O resultado aparecerá aqui em Markdown pronto para compartilhar.</p>
 )}
 {error && (
 <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
 )}
 {isLoading && (
 <div className="flex items-center gap-2 text-sm text-muted dark:text-secondary">
 <Loader2 className="h-4 w-4 animate-spin" />
 Preparando síntese...
 </div>
 )}
 </div>
 </div>
 </div>
 </Card>
 </div>
 );
};

export default ContentSummarizer;
