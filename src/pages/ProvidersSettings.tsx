import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  Database,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Network,
  RefreshCw,
  Save,
  Settings2,
  Shield,
  Star,
  Terminal,
  Trash2,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import { useTranslations } from "../i18n/useTranslations";
import { unifiedAIService } from "../services/unifiedAIService";
import { ProviderStatus, useProvidersStore } from "../store/useProvidersStore";

interface ProviderMeta {
  id: string;
  name: string;
  icon: any;
  type: "CLOUD" | "LOCAL";
  description: string;
  color: string;
}

const PROVIDERS_META: ProviderMeta[] = [
  {
    id: "openai",
    name: "OpenAI",
    icon: Bot,
    type: "CLOUD",
    description: "Modelos GPT-4o e GPT-4o-mini.",
    color: "text-green-400",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    icon: SparklesIcon,
    type: "CLOUD",
    description: "Claude 3.5 Sonnet e Opus.",
    color: "text-orange-400",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    icon: Zap,
    type: "CLOUD",
    description: "Gemini 1.5 Pro e Flash.",
    color: "text-blue-400",
  },
  {
    id: "groq",
    name: "Groq",
    icon: Terminal,
    type: "CLOUD",
    description: "Llama 3 e Mixtral em alta velocidade.",
    color: "text-purple-400",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: Globe,
    type: "CLOUD",
    description: "Modelos DeepSeek V3 e Coder.",
    color: "text-cyan-400",
  },
  {
    id: "ollama",
    name: "Ollama",
    icon: Cpu,
    type: "LOCAL",
    description: "Execução local de modelos open-source.",
    color: "text-white",
  },
];

function SparklesIcon(props: any) {
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
      <path d="m12 3 1.912 5.886 6.182.048-4.978 3.653 1.878 5.903L12 14.875l-5.004 3.615 1.878-5.903-4.978-3.653 6.182-.048Z" />
    </svg>
  );
}

const TOOLS = [
  {
    id: "dataAnalyzer",
    name: "Data Analysis",
    icon: Database,
    description: "Motor de análise de CSV e SQL.",
  },
  {
    id: "code",
    name: "Code Generation",
    icon: Code2,
    description: "Geração e refatoração de código.",
  },
  {
    id: "agents",
    name: "Autonomous Agents",
    icon: Bot,
    description: "Orquestração de squads multi-agentes.",
  },
  {
    id: "chat",
    name: "General Chat",
    icon: Network,
    description: "Interface de conversação padrão.",
  },
];

const ProvidersSettings: React.FC = () => {
  const { t } = useTranslations();

  const {
    keys,
    status,
    globalDefault,
    expertMode,
    toolPreferences,
    setKey,
    removeKey,
    setStatus,
    setGlobalDefault,
    setExpertMode,
    setToolPreference,
    getDecryptedKey,
  } = useProvidersStore();

  const [localKeys, setLocalKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize local keys from store (decrypted)
    const initialLocalKeys: Record<string, string> = {};
    PROVIDERS_META.forEach((p) => {
      initialLocalKeys[p.id] = getDecryptedKey(p.id);
    });
    setLocalKeys(initialLocalKeys);
  }, []);

  const handleTestConnection = async (providerId: string) => {
    const key = localKeys[providerId];
    if (!key && providerId !== "ollama") return;

    setStatus(providerId, "TESTING");
    try {
      const result = await unifiedAIService.testProvider(providerId, key);
      setStatus(providerId, result.available ? "READY" : "ERROR");
    } catch (err) {
      setStatus(providerId, "ERROR");
    }
  };

  const handleSave = (providerId: string) => {
    setKey(providerId, localKeys[providerId]);
    handleTestConnection(providerId);
  };

  const toggleShowKey = (providerId: string) => {
    setShowKeys((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const getStatusBadge = (s: ProviderStatus = "IDLE") => {
    switch (s) {
      case "READY":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-status-success bg-status-success/10 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={10} /> READY
          </span>
        );
      case "ERROR":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-status-error bg-status-error/10 px-2 py-0.5 rounded-full">
            <AlertCircle size={10} /> ERROR
          </span>
        );
      case "TESTING":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-accent-secondary bg-accent-muted px-2 py-0.5 rounded-full">
            <Loader2 size={10} className="animate-spin" /> TESTING
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-muted bg-surface-tertiary px-2 py-0.5 rounded-full">
            IDLE
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings2 className="text-accent-primary" size={32} />
            AI Providers Settings
          </h1>
          <p className="text-secondary text-sm">
            Gerencie suas chaves de API e configure o roteamento semântico do
            Workspace.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              PROVIDERS_META.forEach((p) => handleTestConnection(p.id))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-primary bg-surface-primary hover:bg-surface-tertiary transition-all text-sm font-bold"
          >
            <RefreshCw size={16} /> Test All
          </button>

          <div className="h-10 w-[1px] bg-border-secondary mx-2 hidden md:block" />

          <div className="flex items-center gap-3">
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
              <Shield
                size={14}
                className={expertMode ? "text-accent-primary" : ""}
              />{" "}
              Expert Mode
            </label>
            <button
              title={t("expertMode")}
              onClick={() => setExpertMode(!expertMode)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                expertMode
                  ? "bg-accent-primary shadow-[0_0_15px_rgba(106,13,173,0.5)]"
                  : "bg-surface-tertiary"
              }`}
            >
              <motion.div
                animate={{ x: expertMode ? 26 : 2 }}
                className="absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow-sm"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROVIDERS_META.map((provider) => (
          <Card
            key={provider.id}
            className={`p-6 bg-surface-primary/50 backdrop-blur-sm border-border-primary transition-all hover:border-accent-primary/30 group ${
              globalDefault === provider.id
                ? "ring-1 ring-accent-primary/50"
                : ""
            }`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl bg-main flex items-center justify-center border border-border-primary shadow-inner ${provider.color}`}
                >
                  <provider.icon size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-primary">{provider.name}</h3>
                    <span
                      className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
                        provider.type === "CLOUD"
                          ? "text-cyan-400 border-cyan-400/30 bg-cyan-400/5"
                          : "text-purple-400 border-purple-400/30 bg-purple-400/5"
                      }`}
                    >
                      {provider.type}
                    </span>
                  </div>
                  {getStatusBadge(status[provider.id])}
                </div>
              </div>

              <button
                onClick={() => setGlobalDefault(provider.id)}
                className={`p-2 rounded-lg transition-all ${
                  globalDefault === provider.id
                    ? "text-accent-primary bg-accent-muted shadow-sm"
                    : "text-muted hover:text-primary hover:bg-surface-tertiary"
                }`}
                title="Definir como padrão global"
              >
                <Star
                  size={18}
                  fill={globalDefault === provider.id ? "currentColor" : "none"}
                />
              </button>
            </div>

            <p className="text-[11px] text-secondary mb-6 leading-relaxed h-8 line-clamp-2">
              {provider.description}
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                  <Lock size={12} /> API Key
                </label>
                <div className="relative">
                  <input
                    type={showKeys[provider.id] ? "text" : "password"}
                    value={localKeys[provider.id] || ""}
                    onChange={(e) =>
                      setLocalKeys({
                        ...localKeys,
                        [provider.id]: e.target.value,
                      })}
                    className="w-full bg-main border border-border-primary rounded-xl pl-4 pr-10 py-2.5 text-xs text-primary focus:outline-none focus:border-accent-primary transition-all font-mono"
                    placeholder="sk-..."
                    autoComplete="off"
                    data-1p-ignore
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey(provider.id)}
                    className="absolute right-3 top-2.5 text-muted hover:text-primary transition-colors"
                  >
                    {showKeys[provider.id]
                      ? <EyeOff size={16} />
                      : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleSave(provider.id)}
                  className="flex-grow flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-secondary text-xs font-bold hover:bg-accent-primary hover:text-white transition-all shadow-sm"
                >
                  <Save size={14} /> Salvar
                </button>
                <button
                  onClick={() => handleTestConnection(provider.id)}
                  className="p-2.5 rounded-xl bg-surface-tertiary border border-border-primary text-secondary hover:text-primary transition-all"
                  title="Testar Conexão"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={() => {
                    removeKey(provider.id);
                    setLocalKeys({ ...localKeys, [provider.id]: "" });
                  }}
                  className="p-2.5 rounded-xl bg-status-error/5 border border-status-error/10 text-status-error/60 hover:text-status-error hover:bg-status-error/10 transition-all"
                  title="Remover Chave"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Expert Mode: Semantic Routing */}
      <AnimatePresence>
        {expertMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-border-primary" />
              <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-accent-secondary flex items-center gap-3 whitespace-nowrap">
                <Settings2 size={20} /> Advanced Routing Rules
              </h2>
              <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-border-primary" />
            </div>

            <Card className="bg-surface-primary/30 backdrop-blur-md border-border-primary p-0 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-tertiary/50 border-b border-border-primary">
                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">
                      Tool / Capability
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">
                      Associated Provider
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary/50">
                  {TOOLS.map((tool) => (
                    <tr
                      key={tool.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-tertiary flex items-center justify-center text-accent-secondary">
                            <tool.icon size={16} />
                          </div>
                          <span className="font-bold text-sm text-primary">
                            {tool.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative max-w-[200px]">
                          <select
                            title={t("globalDefault")}
                            value={toolPreferences[tool.id] || globalDefault}
                            onChange={(e) =>
                              setToolPreference(tool.id, e.target.value)}
                            className="w-full bg-main border border-border-primary rounded-lg px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent-primary appearance-none cursor-pointer pr-8"
                          >
                            {PROVIDERS_META.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} {status[p.id] === "READY" ? "✓" : ""}
                              </option>
                            ))}
                          </select>
                          <ChevronRight
                            className="absolute right-2 top-2.5 text-muted rotate-90"
                            size={14}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[11px] text-muted italic">
                          {tool.description}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <div className="p-4 rounded-2xl bg-accent-muted/10 border border-accent-primary/20 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-secondary shrink-0">
                <Shield size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                  Semantic Routing Protocol
                </h4>
                <p className="text-[11px] text-secondary leading-relaxed">
                  O roteamento semântico permite que você atribua provedores
                  específicos para tarefas onde eles performam melhor. Por
                  exemplo, use <strong>Anthropic</strong> para código complexo e
                  {" "}
                  <strong>Groq</strong> para análises de dados ultrarrápidas.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProvidersSettings;
