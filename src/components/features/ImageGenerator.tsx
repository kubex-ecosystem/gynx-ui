import { Theme } from '@/types';
import { Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslations } from '@/i18n/useTranslations';
import Card from '@/components/ui/Card';

interface ImageGeneratorProps {
    onCraftPrompt?: (payload: { subject: string; mood: string; style: string; details: string; }, apiKey?: string) => Promise<string>;
    theme: Theme;
    isApiKeyMissing: boolean;
}

const moods = ['Vibrante', 'Minimalista', 'Futurista', 'Orgânico'];
const styles = ['Ilustração digital', 'Fotorrealista', 'Flat design', 'Isométrico'];

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onCraftPrompt, theme, isApiKeyMissing }) => {
    const { t } = useTranslations();
    const [subject, setSubject] = useState('');
    const [mood, setMood] = useState(moods[0]);
    const [style, setStyle] = useState(styles[0]);
    const [details, setDetails] = useState('');
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    // BYOK Support
    const [externalApiKey, setExternalApiKey] = useState<string>('');
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);

    const disabled = !subject.trim() || isLoading;

    const handleGenerate = async () => {
        if (!onCraftPrompt || !subject.trim()) return;
        setIsLoading(true);
        setPrompt('');
        try {
            // BYOK Support: Pass external API key if provided
            const apiKey = externalApiKey.trim() || undefined;
            const crafted = await onCraftPrompt({
                subject: subject.trim(),
                mood,
                style,
                details: details.trim(),
            }, apiKey);
            setPrompt(crafted);
        } catch (error) {
            setPrompt(error instanceof Error ? error.message : 'Não foi possível criar o prompt.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card title="Prompt para imagens" description="Defina briefing visual e gere instruções padronizadas para modelos de imagem.">
                <div className="grid gap-6 lg:grid-cols-[1.25fr,1fr]">
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-muted dark:text-secondary">
                                Tema principal
                            </label>
                            <input
                                value={subject}
                                onChange={(event) => setSubject(event.target.value)}
                                placeholder="Ex.: Aplicativo de finanças para universitários"
                                className="w-full rounded-xl border px-4 py-3 text-sm text-secondary shadow-sm focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 border-border-primary bg-surface-primary text-primary"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-muted dark:text-secondary">
                                    Clima
                                </label>
                                <select
                                    title={t("Selecione o clima ou tom desejado para a imagem")}
                                    value={mood}
                                    onChange={(event) => setMood(event.target.value)}
                                    className="w-full rounded-xl border px-3 py-2 text-sm text-secondary shadow-sm focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 border-border-primary bg-surface-primary text-primary"
                                >
                                    {moods.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-muted dark:text-secondary">
                                    Estilo
                                </label>
                                <select
                                    title={t("Selecione o estilo visual desejado para a imagem")}
                                    value={style}
                                    onChange={(event) => setStyle(event.target.value)}
                                    className="w-full rounded-xl border px-3 py-2 text-sm text-secondary shadow-sm focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 border-border-primary bg-surface-primary text-primary"
                                >
                                    {styles.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-muted dark:text-secondary">
                                Detalhes extras
                            </label>
                            <textarea
                                value={details}
                                onChange={(event) => setDetails(event.target.value)}
                                rows={5}
                                placeholder="Paleta desejada, elementos obrigatórios, texto de UI, referências visuais..."
                                className="w-full resize-none rounded-2xl border px-4 py-3 text-sm text-secondary shadow-sm transition focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 border-border-primary bg-surface-primary text-primary"
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
                            onClick={handleGenerate}
                            disabled={disabled}
                            className="inline-flex items-center gap-2 rounded-full border border-accent-primary bg-accent-primary px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-accent-secondary disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 dark:border-accent-primary dark:bg-accent-primary text-main"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            {isLoading ? 'Gerando briefing...' : 'Gerar prompt'}
                        </button>
                    </div>

                    <div className="flex h-full flex-col rounded-2xl border border-border-primary/80 bg-surface-secondary/95 p-6 shadow-md border-border-secondary/70 bg-surface-primary/70">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted dark:text-secondary">
                            <ImageIcon className="h-4 w-4" /> Prompt sugerido
                        </div>
                        <div className="mt-4 flex-1 overflow-auto rounded-xl border border-dashed border-border-primary/80 bg-surface-secondary/90 p-4 text-sm text-secondary border-border-secondary/80 bg-surface-primary/75 text-primary">
                            {isLoading && (
                                <div className="flex items-center gap-2 text-sm text-muted dark:text-secondary">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Montando instruções visuais...
                                </div>
                            )}
                            {!isLoading && prompt && <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed">{prompt}</pre>}
                            {!isLoading && !prompt && (
                                <p>O texto pronto para IA de imagens aparecerá aqui.</p>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ImageGenerator;
