import React, { useState } from 'react';
import { Key, Shield, CheckCircle2, AlertCircle, RefreshCcw, Save, Trash2, Globe, Cpu, Bot, Zap, Plus, Settings } from 'lucide-react';
import Card from '../components/ui/Card';

// Types
type AIProvider = {
  id: string;
  name: string;
  status: 'Ready' | 'Configuring' | 'Error';
  type: 'Cloud' | 'Local';
  icon: any;
  apiKey?: string;
};

// Mocks
const mockProviders: AIProvider[] = [
  { id: '1', name: 'OpenAI (GPT-4o)', status: 'Ready', type: 'Cloud', icon: Bot, apiKey: 'sk-proj-••••••••••••••••••••••••' },
  { id: '2', name: 'Anthropic (Claude 3.5 Sonnet)', status: 'Ready', type: 'Cloud', icon: SparkleIcon, apiKey: 'sk-ant-••••••••••••••••••••••••' },
  { id: '3', name: 'Ollama Local (DeepSeek-R1)', status: 'Ready', type: 'Local', icon: Cpu, apiKey: 'No key required' },
  { id: '4', name: 'Google Gemini Pro', status: 'Error', type: 'Cloud', icon: Globe, apiKey: 'AIza-••••••••••••••••••••••••' },
];

function SparkleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z" />
      <path d="M12 10V3" />
      <path d="M12 21v-7" />
      <path d="M16.5 4.5 12 9" />
      <path d="m12 15 4.5 4.5" />
      <path d="M21 12h-7" />
      <path d="M10 12H3" />
      <path d="m4.5 4.5 4.5 4.5" />
      <path d="m15 15 4.5 4.5" />
    </svg>
  );
}

const ProvidersSettings: React.FC = () => {
  const [providers, setProviders] = useState<AIProvider[]>(mockProviders);

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent-primary uppercase tracking-[0.4em] text-xs font-bold">
            <Key size={16} /> Governance & Secrets
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">AI Providers Settings</h2>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-border-primary bg-surface-primary text-secondary text-sm font-semibold hover:bg-surface-tertiary transition-all flex items-center justify-center gap-2">
            <RefreshCcw size={16} /> Test All
          </button>
          <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-accent-primary text-white text-sm font-bold hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/20">
            <Plus size={18} /> Add Provider
          </button>
        </div>
      </header>

      <div className="grid gap-6">
        {providers.map((provider) => (
          <Card key={provider.id} className="p-0 border-border-secondary bg-surface-primary/30 backdrop-blur-xl overflow-hidden hover:border-border-accent transition-all duration-300">
            <div className="flex flex-col md:flex-row">
              {/* Provider Info Side */}
              <div className="md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-border-secondary space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${
                    provider.status === 'Ready' ? 'bg-status-success/10 text-status-success' :
                    provider.status === 'Error' ? 'bg-status-error/10 text-status-error' :
                    'bg-status-warning/10 text-status-warning'
                  } border border-transparent shadow-inner`}>
                    <provider.icon size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-primary leading-tight">{provider.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-tertiary text-secondary font-bold uppercase tracking-wider border border-border-primary">
                        {provider.type}
                      </span>
                      <span className={`text-[10px] flex items-center gap-1 font-bold uppercase tracking-wider ${
                        provider.status === 'Ready' ? 'text-status-success' : 
                        provider.status === 'Error' ? 'text-status-error' : 'text-status-warning'
                      }`}>
                        {provider.status === 'Ready' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {provider.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 text-xs text-muted leading-relaxed">
                  <p className="flex items-center gap-2"><Zap size={14} className="text-accent-secondary" /> Suporte para Streaming e JSON Mode</p>
                  <p className="flex items-center gap-2"><Shield size={14} className="text-accent-secondary" /> Encriptação AES-256 at rest</p>
                </div>
              </div>

              {/* Secrets Control Side */}
              <div className="flex-1 p-8 bg-surface-primary/10 flex flex-col justify-center space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-muted uppercase tracking-[0.3em]">API Key / Secret Key</label>
                    <span className="text-[10px] text-accent-secondary font-bold">BYOK ENABLED</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Lock className="absolute left-3 top-2.5 text-muted/50" size={16} />
                      <input 
                        type="password" 
                        value={provider.apiKey}
                        readOnly
                        className="w-full bg-main border border-border-primary rounded-xl pl-10 pr-4 py-2.5 text-sm text-secondary font-mono tracking-widest"
                      />
                    </div>
                    <button className="px-4 py-2 rounded-xl border border-border-primary bg-surface-primary text-secondary text-xs font-bold hover:bg-surface-tertiary transition-all">
                      Editar
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-tertiary text-primary text-xs font-bold hover:bg-surface-tertiary/80 transition-all">
                      <RefreshCcw size={14} /> Testar Conexão
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-status-error/30 text-status-error text-xs font-bold hover:bg-status-error/10 transition-all">
                      <Trash2 size={14} /> Remover
                    </button>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-accent-primary text-white text-xs font-bold hover:scale-105 transition-all shadow-lg shadow-accent-primary/20">
                    <Save size={14} /> Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-accent-muted/20 border-accent-primary/30 p-6 flex items-start gap-4">
        <div className="p-3 rounded-xl bg-accent-primary/20 text-accent-secondary border border-accent-primary/30">
          <Settings size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-primary">Segurança e Governança GNyx</h4>
          <p className="text-xs text-secondary leading-relaxed max-w-3xl">
            Todas as chaves configuradas neste painel são armazenadas localmente no cofre do sistema (Vault) e nunca são enviadas para a nuvem da Kubex. 
            O GNyx utiliza estas credenciais apenas para realizar as chamadas de API solicitadas pelo seu Workspace de forma transparente.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ProvidersSettings;
