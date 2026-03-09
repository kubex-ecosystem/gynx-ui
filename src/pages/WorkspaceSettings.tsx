import React from 'react';
import { AlertCircle, LoaderCircle, Settings, Save, RotateCcw, Building, Users, CreditCard, Shield, Zap, Globe, HardDrive } from 'lucide-react';
import Card from '@/components/ui/Card';
import lottieAnimation from '@assets/lotties/banner_sm-01.json';
import { useAuth } from '@/context/AuthContext';
import { navigateToSection } from '@/core/navigation/hashRoutes';
import LottieControl from '@/components/ui/Lottie';
import { useWorkspaceSettings } from '@/modules/workspace/hooks/useWorkspaceSettings';

export default function WorkspaceSettings() {
    const { isSimulated } = useAuth();
    const { formData, isLoading, isSaving, isDirty, error, status, updateField, save, restoreDefaults, retry } = useWorkspaceSettings();

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await save();
    };

    const lottieControl = new LottieControl(
        {
            ariaRole: 'button',
            ariaLabel: 'animation',
            isClickToPauseDisabled: true,
            title: 'animation',
            isStopped: true,
            isPaused: true,
            height: 400,
            width: 400,
            speed: 1,
            direction: 1,
            options: {
                autoplay: true,
                loop: true,
                animationData: (lottieAnimation || {}),
                rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
            },
            // eventListeners: [
            //     {
            //         eventName: 'complete',
            //         callback: () => console.log('animation completed')
            //     }
            // ],
            style: {
                width: '100%',
                height: '100%',
            },
            segments: []
        }
    )

    return (
        <div className="space-y-8 animate-fade-in relative">
            <header className="flex flex-col gap-2 relative z-10">
                <div className="flex items-center gap-2 text-accent-primary uppercase tracking-[0.4em] text-xs font-bold">
                    <Settings size={16} /> Configurações Globais
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-primary">
                    Workspace e Identidade
                </h2>
                <p className="text-secondary text-sm">
                    Ajustes administrativos, operação do Tenant e simulação do ambiente visual.
                </p>
            </header>

            {status && (
                <Card className={`p-4 border ${
                    status.tone === 'success'
                        ? 'border-status-success/30 bg-status-success/5'
                        : status.tone === 'error'
                            ? 'border-status-error/30 bg-status-error/5'
                            : 'border-status-info/30 bg-status-info/5'
                }`}>
                    <div className="flex items-start gap-3">
                        {status.tone === 'error' ? (
                            <AlertCircle className="text-status-error mt-0.5" size={18} />
                        ) : (
                            <Zap className="text-status-info mt-0.5" size={18} />
                        )}
                        <div>
                            <p className="text-sm font-semibold text-primary">Estado do Workspace</p>
                            <p className="text-xs text-secondary mt-1">{status.message}</p>
                        </div>
                    </div>
                </Card>
            )}

            {error && !isLoading && (
                <Card className="p-4 border-status-error/30 bg-status-error/5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-status-error mt-0.5" size={18} />
                            <div>
                                <p className="text-sm font-semibold text-primary">Falha ao preparar a tela de workspace</p>
                                <p className="text-xs text-secondary mt-1">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => void retry()}
                            className="px-4 py-2 rounded-xl border border-status-error/20 bg-status-error/10 text-status-error text-sm font-semibold hover:bg-status-error/15 transition-colors"
                        >
                            Recarregar
                        </button>
                    </div>
                </Card>
            )}

            {/* Hero Banner Feature */}
            <Card className="p-0 overflow-hidden relative border-border-primary/40 shadow-2xl group bg-gradient-to-r from-surface-primary to-surface-secondary">
                <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="p-8 lg:p-12 space-y-6 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-muted/40 border border-accent-primary/20 text-accent-secondary text-xs font-bold uppercase tracking-wider">
                            <Zap size={14} className="animate-pulse" /> Ambiente Isolado
                        </div>

                        <h3 className="text-2xl font-bold text-primary">
                            Operação Multi-Tenant
                        </h3>

                        <p className="text-sm text-secondary leading-relaxed">
                            Este painel controla as diretivas da organização atual que foi processada pelo Gateway.
                            Use os controladores abaixo para moldar a interface para a sua demonstração comercial sem ferir o Back-End Go.
                        </p>

                        {isSimulated && (
                            <div className="p-3 border-l-2 border-status-warning bg-status-warning/10 text-status-warning text-xs font-mono">
                                [DEV MODE]: As alterações aqui refletirão visualmente na UI da sessão, mas não serão perpetuadas no Postgres do Domus, economizando recursos.
                            </div>
                        )}
                    </div>

                    <div className="relative h-64 md:h-full min-h-[300px] flex items-center justify-center pointer-events-none p-6">
                        {/* {lottieControl} */}
                    </div>
                </div>
            </Card>

            {/* Main Forms */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Formulário Principal */}
                <Card className="lg:col-span-2 space-y-6 p-6 border-border-secondary bg-surface-primary/60 backdrop-blur-md">
                    <div className="flex items-center gap-3 border-b border-border-primary pb-4">
                        <Building className="text-accent-secondary" />
                        <h3 className="font-bold text-primary">Identidade do Workspace</h3>
                    </div>

                    {isLoading || !formData ? (
                        <div className="rounded-2xl border border-border-primary bg-surface-secondary/40 p-6 flex items-center gap-3 text-secondary">
                            <LoaderCircle size={18} className="animate-spin" />
                            <div>
                                <p className="text-sm font-semibold text-primary">Carregando configuracoes</p>
                                <p className="text-xs text-muted">Montando estado inicial do workspace.</p>
                            </div>
                        </div>
                    ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted uppercase tracking-[0.2em]">Nome da Organização</label>
                                <input
                                    type="text"
                                    value={formData.tenantName}
                                    onChange={e => updateField('tenantName', e.target.value)}
                                    className="w-full bg-surface-secondary border border-border-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-primary transition-all text-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted uppercase tracking-[0.2em]">Tenant ID (Apenas Leitura)</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-3 text-secondary" size={18} />
                                    <input
                                        type="text"
                                        value={formData.tenantId}
                                        readOnly
                                        className="w-full bg-main border border-border-primary rounded-xl pl-10 pr-4 py-3 text-sm text-secondary opacity-70 cursor-not-allowed font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted uppercase tracking-[0.2em]">Região do Cluster</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 text-secondary" size={18} />
                                    <select
                                        value={formData.region}
                                        onChange={e => updateField('region', e.target.value)}
                                        className="w-full bg-surface-secondary border border-border-primary rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent-primary transition-all text-primary appearance-none cursor-pointer"
                                    >
                                        <option>South America (sa-east-1)</option>
                                        <option>US East (us-east-1)</option>
                                        <option>Europe (eu-west-1)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted uppercase tracking-[0.2em]">Retenção de Logs (Logsz)</label>
                                <div className="relative">
                                    <HardDrive className="absolute left-3 top-3 text-secondary" size={18} />
                                    <select
                                        value={formData.dataRetention}
                                        onChange={e => updateField('dataRetention', e.target.value)}
                                        className="w-full bg-surface-secondary border border-border-primary rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent-primary transition-all text-primary appearance-none cursor-pointer"
                                    >
                                        <option>30 dias</option>
                                        <option>90 dias</option>
                                        <option>1 Ano</option>
                                        <option>Infinito (Custo Adicional)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-border-primary">
                            <button
                                type="button"
                                onClick={() => void restoreDefaults()}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-secondary hover:text-primary transition-colors hover:bg-surface-tertiary"
                            >
                                <RotateCcw size={16} /> Restaurar Defaults
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || !isDirty}
                                className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold bg-accent-primary text-white shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                            >
                                {isSaving ? 'Aplicando...' : 'Salvar Alterações'} <Save size={16} />
                            </button>
                        </div>
                    </form>
                    )}
                </Card>

                {/* Info Lateral */}
                <div className="space-y-6">
                    <Card className="p-6 border-border-secondary bg-surface-primary/40">
                        <div className="flex items-center gap-3 border-b border-border-primary pb-4 mb-4">
                            <CreditCard className="text-status-info" />
                            <h3 className="font-bold text-primary">Plano Atual</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Nível da Organização</p>
                                <p className="text-xl font-bold text-primary mt-1">{formData?.billingPlan ?? 'Indisponivel'}</p>
                                <p className="text-xs text-secondary mt-1">Recursos ilimitados habilitados no ambiente local.</p>
                            </div>

                            <div className="pt-4 border-t border-border-primary/50">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-secondary">Limites de APIs LLM</span>
                                    <span className="text-status-success font-mono font-bold">Unmetered</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mt-2">
                                    <span className="text-secondary">Agentes Ativos</span>
                                    <span className="text-status-success font-mono font-bold">∞</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border-border-secondary bg-surface-primary/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={64} />
                        </div>

                        <div className="relative z-10">
                            <h3 className="font-bold text-primary text-lg">Membros da Equipe</h3>
                            <p className="text-sm text-secondary mt-2 mb-4 leading-relaxed">
                                Gerencie os R.B.A.C, convites e permissões de acesso ao workspace para o time de engeharia.
                            </p>

                            <button
                                onClick={() => navigateToSection('accept-invite', { token: 'demo-workspace-invite' })}
                                className="w-full py-2 rounded-xl bg-surface-tertiary text-primary text-sm font-semibold border border-border-primary hover:border-accent-primary transition-colors"
                            >
                                Simular Fluxo de Convite
                            </button>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
