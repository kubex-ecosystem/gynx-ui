import { HistoryItem, Idea, Theme } from "@/types";
import {
  AlertTriangle,
  BrainCircuit,
  Clipboard,
  ClipboardCheck,
  Code,
  Eye,
  History,
  Lightbulb,
  Loader,
  Plus,
  Share2,
  Trash2,
  Wand2,
  X,
  XCircle,
} from "lucide-react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LanguageContext } from "../../context/LanguageContext";
import { configService, type ProviderInfo } from "../../services/configService";
import { generateStructuredPrompt } from "../../services/unifiedAIService";

// --- IndexedDB Helpers for Autosave ---
const DB_NAME = "PromptCrafterDB";
const STORE_NAME = "drafts";
const DB_VERSION = 1;

interface Draft {
  ideas: Idea[];
  purpose: string;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () =>
      reject(
        new Error(
          "Error opening IndexedDB. Your browser might be in private mode.",
        ),
      );
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

const getDraft = async <T,>(key: IDBValidKey): Promise<T | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onerror = () =>
      reject(new Error("Error getting draft from IndexedDB"));
    request.onsuccess = () => resolve(request.result as T | undefined);
  });
};

const setDraft = async <T,>(key: IDBValidKey, value: T): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);
    request.onerror = () =>
      reject(new Error("Error setting draft in IndexedDB"));
    request.onsuccess = () => resolve();
  });
};

interface Example {
  purpose: string;
  ideas: string[];
}

const examples: Example[] = [
  {
    purpose: "Code Generation",
    ideas: [
      "Create a React hook for fetching data from an API.",
      "It should handle loading, error, and data states.",
      "Use the native `fetch` API.",
      "The hook should be written in TypeScript and be well-documented.",
    ],
  },
  {
    purpose: "Creative Writing",
    ideas: [
      "Write a short story opening.",
      "The setting is a neon-lit cyberpunk city in 2077.",
      "The main character is a grizzled detective who is part-cyborg.",
      "It's perpetually raining and the streets are reflective.",
    ],
  },
  {
    purpose: "Data Analysis",
    ideas: [
      "Analyze a dataset of customer sales from the last quarter.",
      "The dataset includes columns: 'Date', 'CustomerID', 'ProductCategory', 'Revenue', 'UnitsSold'.",
      "Identify the top 3 product categories by total revenue.",
      "Calculate the average revenue per customer.",
      "Look for any weekly sales trends or seasonality.",
    ],
  },
  {
    purpose: "Marketing Copy",
    ideas: [
      "Draft an email campaign for a new productivity app.",
      "The target audience is busy professionals and university students.",
      "Highlight features like AI-powered task scheduling, calendar sync, and focus mode.",
      "The tone should be encouraging, professional, and slightly urgent.",
    ],
  },
  {
    purpose: "Technical Documentation",
    ideas: [
      "Write the 'Getting Started' section for a new JavaScript library.",
      "The library is called 'ChronoWarp' and it simplifies date manipulation.",
      "Include a simple installation guide using npm.",
      "Provide a clear, concise code example for its primary use case.",
    ],
  },
];

const purposeKeys: Record<string, string> = {
  "Code Generation": "purposeCodeGeneration",
  "Creative Writing": "purposeCreativeWriting",
  "Data Analysis": "purposeDataAnalysis",
  "Technical Documentation": "purposeTechnicalDocumentation",
  "Marketing Copy": "purposeMarketingCopy",
  "General Summarization": "purposeGeneralSummarization",
};

const i18n: Record<string, Record<string, string>> = {
  en: {
    "inputIdeasTitle": "1. INPUT IDEAS",
    "loadExample": "Load Example",
    "ideaPlaceholder": "Enter a raw idea, concept, or requirement...",
    "addIdea": "Add Idea",
    "removeIdea": "Remove idea: {idea}",
    "purposeLabel": "Purpose",
    "purposeCodeGeneration": "Code Generation",
    "purposeCreativeWriting": "Creative Writing",
    "purposeDataAnalysis": "Data Analysis",
    "purposeTechnicalDocumentation": "Technical Documentation",
    "purposeMarketingCopy": "Marketing Copy",
    "purposeGeneralSummarization": "General Summarization",
    "customPurposePlaceholder": "Or type a custom purpose...",
    "generatedPromptTitle": "2. GENERATED PROMPT",
    "generatingMessage": "Generating with Gemini...",
    "generationFailedTitle": "Generation Failed",
    "close": "Close",
    "toggleView": "Toggle view mode",
    "copyLink": "Copy shareable link",
    "copyPrompt": "Copy prompt text",
    "promptPlaceholder": "Your professional prompt will appear here.",
    "generateButton": "GENERATE PROMPT",
    "generatingButton": "GENERATING...",
    "historyTitle": "3. PROMPT HISTORY",
    "clearAll": "Clear All",
    "historyPlaceholder": "Your generated prompts will be saved here.",
    "loadPrompt": "Load this prompt",
    "deletePrompt": "Delete this prompt",
    "errorAddIdea": "Please add at least one idea before generating.",
    "errorSpecifyPurpose":
      "Please specify a purpose for the prompt before generating.",
    "tokens": "tokens",
    "input": "Input",
    "output": "Output",
    "total": "Total",
  },
  es: {
    "inputIdeasTitle": "1. INGRESAR IDEAS",
    "loadExample": "Cargar Ejemplo",
    "ideaPlaceholder": "Introduce una idea, concepto o requisito...",
    "addIdea": "Añadir Idea",
    "removeIdea": "Quitar idea: {idea}",
    "purposeLabel": "Propósito",
    "purposeCodeGeneration": "Generación de Código",
    "purposeCreativeWriting": "Escritura Creativa",
    "purposeDataAnalysis": "Análisis de Datos",
    "purposeTechnicalDocumentation": "Documentación Técnica",
    "purposeMarketingCopy": "Copy de Marketing",
    "purposeGeneralSummarization": "Resumen General",
    "customPurposePlaceholder": "O escribe un propósito personalizado...",
    "generatedPromptTitle": "2. PROMPT GENERADO",
    "generatingMessage": "Generando con Gemini...",
    "generationFailedTitle": "Falló la Generación",
    "close": "Cerrar",
    "toggleView": "Cambiar vista",
    "copyLink": "Copiar enlace para compartir",
    "copyPrompt": "Copiar texto del prompt",
    "promptPlaceholder": "Tu prompt profesional aparecerá aquí.",
    "generateButton": "GENERAR PROMPT",
    "generatingButton": "GENERANDO...",
    "historyTitle": "3. HISTORIAL DE PROMPTS",
    "clearAll": "Limpiar Todo",
    "historyPlaceholder": "Tus prompts generados se guardarán aquí.",
    "loadPrompt": "Cargar este prompt",
    "deletePrompt": "Eliminar este prompt",
    "errorAddIdea": "Por favor, añade al menos una idea antes de generar.",
    "errorSpecifyPurpose":
      "Por favor, especifica un propósito para el prompt antes de generar.",
    "tokens": "tokens",
    "input": "Entrada",
    "output": "Salida",
    "total": "Total",
  },
  zh: {
    "inputIdeasTitle": "1. 输入想法",
    "loadExample": "加载示例",
    "ideaPlaceholder": "输入一个原始想法、概念或要求...",
    "addIdea": "添加想法",
    "removeIdea": "删除想法: {idea}",
    "purposeLabel": "目的",
    "purposeCodeGeneration": "代码生成",
    "purposeCreativeWriting": "创意写作",
    "purposeDataAnalysis": "数据分析",
    "purposeTechnicalDocumentation": "技术文档",
    "purposeMarketingCopy": "营销文案",
    "purposeGeneralSummarization": "通用总结",
    "customPurposePlaceholder": "或输入自定义目的...",
    "generatedPromptTitle": "2. 生成的提示",
    "generatingMessage": "正在通过 Gemini 生成...",
    "generationFailedTitle": "生成失败",
    "close": "关闭",
    "toggleView": "切换视图",
    "copyLink": "复制分享链接",
    "copyPrompt": "复制提示文本",
    "promptPlaceholder": "您的专业提示将出现在这里。",
    "generateButton": "生成提示",
    "generatingButton": "正在生成...",
    "historyTitle": "3. 提示历史",
    "clearAll": "全部清除",
    "historyPlaceholder": "您生成的提示将保存在这里。",
    "loadPrompt": "加载此提示",
    "deletePrompt": "删除此提示",
    "errorAddIdea": "生成前请至少添加一个想法。",
    "errorSpecifyPurpose": "生成前请为提示指定一个目的。",
    "tokens": "个 token",
    "input": "输入",
    "output": "输出",
    "total": "总计",
  },
};

const useTranslations = () => {
  const { language } = useContext(LanguageContext);
  const t = (key: string, params?: Record<string, string>): string => {
    const localeStrings = i18n[language] || i18n["en"];
    let translation = localeStrings[key] || i18n["en"][key] || key;
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        translation = translation.replace(`{${paramKey}}`, params[paramKey]);
      });
    }
    return translation;
  };
  return { t, language };
};

const formatRelativeTime = (timestamp: number, locale: string): string => {
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return rtf.format(Math.floor(-seconds), "second");
    if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), "minute");
    if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), "hour");
    if (seconds < 2592000) {
      return rtf.format(-Math.floor(seconds / 86400), "day");
    }
    if (seconds < 31536000) {
      return rtf.format(-Math.floor(seconds / 2592000), "month");
    }
    return rtf.format(-Math.floor(seconds / 31536000), "year");
  } catch (e) {
    console.error("Error formatting relative time", e);
    return new Date(timestamp).toLocaleDateString();
  }
};

// --- Sub-components (Memoized) ---

interface IdeaInputProps {
  currentIdea: string;
  setCurrentIdea: (value: string) => void;
  onAddIdea: () => void;
}
const IdeaInput: React.FC<IdeaInputProps> = React.memo(
  ({ currentIdea, setCurrentIdea, onAddIdea }) => {
    const { t } = useTranslations();
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onAddIdea();
      }
    };

    return (
      <div className="flex gap-2">
        <input
          type="text"
          value={currentIdea}
          onChange={(e) => setCurrentIdea(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("ideaPlaceholder")}
          className="flex-grow bg-surface-primary border-2 border-border-primary rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-all duration-300 placeholder:text-muted text-primary"
        />
        <button
          onClick={onAddIdea}
          disabled={!currentIdea.trim()}
          className="bg-accent-primary text-white p-3 rounded-md flex items-center justify-center hover:bg-accent-secondary disabled:bg-disabled disabled:cursor-not-allowed transition-all duration-300 shadow-md"
          aria-label={t("addIdea")}
        >
          <Plus size={24} />
        </button>
      </div>
    );
  },
);

interface IdeasListProps {
  ideas: Idea[];
  onRemoveIdea: (id: string) => void;
}
const IdeasList: React.FC<IdeasListProps> = React.memo(
  ({ ideas, onRemoveIdea }) => {
    const { t } = useTranslations();
    return (
      <div className="space-y-3 mt-4 pr-2 max-h-60 overflow-y-auto">
        {ideas.map((idea, index) => (
          <div
            key={idea.id}
            className="bg-surface-tertiary/20 p-3 rounded-md flex justify-between items-center border border-transparent hover:border-border-accent transition-colors duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-secondary">{idea.text}</span>
            <button
              onClick={() => onRemoveIdea(idea.id)}
              className="text-status-error hover:text-status-error/80 p-1 rounded-full hover:bg-status-error/10 transition-all duration-200"
              aria-label={t("removeIdea", { idea: idea.text })}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    );
  },
);

interface PurposeSelectorProps {
  purpose: string;
  setPurpose: (value: string) => void;
  isLight: boolean;
}
const PurposeSelector: React.FC<PurposeSelectorProps> = React.memo(
  ({ purpose, setPurpose, isLight }) => {
    const { t } = useTranslations();
    const purposes = Object.keys(purposeKeys);

    return (
      <div className="mt-6">
        <label
          htmlFor="purpose-input"
          className="mb-3 block text-lg font-medium text-accent-primary"
        >
          {t("purposeLabel")}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {purposes.map((p) => (
            <button
              key={p}
              onClick={() => setPurpose(p)}
              className={`p-2 rounded-md text-sm font-medium transition-all duration-200 border ${
                purpose === p
                  ? "bg-accent-muted border-accent-primary text-white scale-105 shadow-md"
                  : "bg-surface-primary/50 border-transparent text-secondary hover:border-border-accent"
              }`}
            >
              {t(purposeKeys[p])}
            </button>
          ))}
        </div>
        <input
          id="purpose-input"
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          list="purposes-list"
          placeholder={t("customPurposePlaceholder")}
          className="w-full rounded-md p-3 transition-all duration-300 focus:outline-none focus:ring-2 bg-surface-primary border-2 border-border-primary focus:border-accent-primary focus:ring-accent-primary placeholder:text-muted text-primary font-semibold"
        />
        <datalist id="purposes-list">
          {purposes.map((p) => <option key={p} value={p} />)}
        </datalist>
      </div>
    );
  },
);

interface PromptHistoryProps {
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  isLight: boolean;
}
const PromptHistoryDisplay: React.FC<PromptHistoryProps> = React.memo(
  ({ history, onLoad, onDelete, onClear, isLight }) => {
    const { t, language } = useTranslations();
    return (
      <div className="lg:col-span-2 rounded-xl border border-border-primary backdrop-blur-sm p-6 transition-colors duration-300 bg-surface-primary/30 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold tracking-wide text-accent-secondary">
            {t("historyTitle")}
          </h3>
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-2 px-3 py-1 text-sm rounded-full transition-colors duration-200 bg-status-error/20 text-status-error hover:bg-status-error/30"
              aria-label={t("clearAll")}
            >
              <XCircle size={16} />
              <span>{t("clearAll")}</span>
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
          {history.length === 0
            ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted">
                <History size={48} className="mb-4" />
                <p className="font-semibold text-center">
                  {t("historyPlaceholder")}
                </p>
              </div>
            )
            : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-border-primary bg-surface-primary/50 hover:border-border-accent transition-colors duration-300"
                >
                  <div className="flex-grow overflow-hidden">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full flex-shrink-0 bg-accent-primary text-white">
                        {item.purpose}
                      </span>
                      <span className="text-xs text-muted truncate">
                        {formatRelativeTime(item.timestamp, language)}
                      </span>
                    </div>
                    <p className="text-sm text-secondary line-clamp-2">
                      {item.prompt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <button
                      onClick={() => onLoad(item)}
                      className="p-2 rounded-md transition-colors duration-200 bg-accent-muted text-accent-secondary hover:bg-accent-muted/80"
                      aria-label={t("loadPrompt")}
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 rounded-md transition-colors duration-200 bg-status-error/20 text-status-error hover:bg-status-error/30"
                      aria-label={t("deletePrompt")}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
        </div>
      </div>
    );
  },
);

// --- Main Component ---

interface PromptCrafterProps {
  theme: Theme;
  isApiKeyMissing: boolean;
}
const PromptCrafter: React.FC<PromptCrafterProps> = (
  { theme, isApiKeyMissing },
) => {
  const { t } = useTranslations();
  const isLight = theme === "light";
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [currentIdea, setCurrentIdea] = useState("");
  const [purpose, setPurpose] = useState("Code Generation");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [promptHistory, setPromptHistory] = useState<HistoryItem[]>([]);
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");
  const [tokenUsage, setTokenUsage] = useState<
    { input: number; output: number } | null
  >(null);

  // Dynamic configuration from backend
  const [availableProviders, setAvailableProviders] = useState<ProviderInfo[]>(
    [],
  );
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  // Mode tracking (byok, server, or demo)
  const [currentMode, setCurrentMode] = useState<"byok" | "server" | "demo">(
    "server",
  );

  // BYOK Support: External API key
  const [externalApiKey, setExternalApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const isInitialLoad = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load configuration from backend
  useEffect(() => {
    const loadConfig = async () => {
      setIsConfigLoading(true);
      try {
        const [providers, demoMode, defaultProvider] = await Promise.all([
          configService.getAvailableProviders(),
          configService.isDemoMode(),
          configService.getDefaultProvider(),
        ]);

        setAvailableProviders(providers);
        setIsDemoMode(demoMode);
        setSelectedProvider(defaultProvider);

        console.log("💡 Configuration loaded:", {
          providers: providers.length,
          demoMode,
          defaultProvider,
        });
      } catch (error) {
        console.error("Failed to load configuration:", error);
        setIsDemoMode(true);
        setAvailableProviders([]);
      } finally {
        setIsConfigLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Load history from localStorage
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("promptHistory");
      if (storedHistory) {
        setPromptHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      setPromptHistory([]);
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (
      promptHistory.length === 0 &&
      localStorage.getItem("promptHistory") === null
    ) {
      return;
    }
    try {
      localStorage.setItem("promptHistory", JSON.stringify(promptHistory));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [promptHistory]);

  // Load shared prompt from URL hash on initial load
  useEffect(() => {
    const loadSharedPrompt = () => {
      try {
        const hash = window.location.hash;
        if (hash.startsWith("#prompt=")) {
          const encodedData = hash.substring("#prompt=".length);
          const decodedJson = atob(encodedData);
          const data = JSON.parse(decodedJson) as {
            ideas: Idea[];
            purpose: string;
            prompt: string;
          };

          if (data.ideas && data.purpose && data.prompt) {
            setIdeas(data.ideas);
            setPurpose(data.purpose);
            setGeneratedPrompt(data.prompt);
            setTokenUsage(null); // Tokens are not shared in link
            setError(null);
            window.history.replaceState(
              null,
              document.title,
              window.location.pathname + window.location.search,
            );
          }
        }
      } catch (e) {
        console.error("Failed to parse shared prompt from URL", e);
        setError("The shared link appears to be invalid or corrupted.");
        window.history.replaceState(
          null,
          document.title,
          window.location.pathname + window.location.search,
        );
      }
    };
    loadSharedPrompt();
  }, []);

  // Autosave: Load draft from IndexedDB on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const savedDraft = await getDraft<Draft>("currentDraft");
        if (savedDraft) {
          setIdeas(savedDraft.ideas);
          setPurpose(savedDraft.purpose);
        }
      } catch (e) {
        console.error("Failed to load draft from IndexedDB", e);
      } finally {
        isInitialLoad.current = false;
      }
    };
    loadDraft();
  }, []);

  // Autosave: Save draft to IndexedDB on changes
  useEffect(() => {
    if (isInitialLoad.current) {
      return;
    }
    const handler = setTimeout(() => {
      try {
        setDraft("currentDraft", { ideas, purpose });
      } catch (e) {
        console.error("Failed to save draft to IndexedDB", e);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [ideas, purpose]);

  // Auto-resize textarea
  useEffect(() => {
    if (viewMode === "raw" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [generatedPrompt, viewMode]);

  const handleAddIdea = useCallback(() => {
    if (currentIdea.trim() !== "") {
      setIdeas(
        (prev) => [...prev, {
          id: Date.now().toString(),
          text: currentIdea.trim(),
        }]
      );
      setCurrentIdea("");
    }
  }, [currentIdea]);

  const handleRemoveIdea = useCallback((id: string) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
  }, []);

  const handleGenerate = async () => {
    if (ideas.length === 0) {
      setError(t("errorAddIdea"));
      return;
    }
    if (!purpose.trim()) {
      setError(t("errorSpecifyPurpose"));
      return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedPrompt("");
    setTokenUsage(null);
    try {
      // Use selected provider or fallback to first available
      const provider = selectedProvider ||
        (availableProviders.length > 0
          ? availableProviders[0].name
          : undefined);

      // BYOK Support: Pass external API key if provided
      const apiKey = externalApiKey.trim() || undefined;
      const result = await generateStructuredPrompt(
        ideas,
        purpose,
        provider,
        undefined,
        apiKey,
      );
      setGeneratedPrompt(result.prompt);
      const inputTokens = result.usageMetadata?.promptTokenCount ?? 0;
      const outputTokens = result.usageMetadata?.candidatesTokenCount ?? 0;
      setTokenUsage({ input: inputTokens, output: outputTokens });

      // Update current mode based on response
      if (result.mode) {
        setCurrentMode(result.mode);
      }

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        prompt: result.prompt,
        purpose,
        ideas: [...ideas],
        timestamp: Date.now(),
        inputTokens,
        outputTokens,
      };
      setPromptHistory((prev) => [newItem, ...prev].slice(0, 20));
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (!generatedPrompt) return;
    try {
      const dataToShare = {
        ideas,
        purpose,
        prompt: generatedPrompt,
      };
      const jsonString = JSON.stringify(dataToShare);
      const encodedData = btoa(jsonString);
      const shareUrl =
        `${window.location.origin}${window.location.pathname}#prompt=${encodedData}`;

      navigator.clipboard.writeText(shareUrl);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2500);
    } catch (e) {
      console.error("Failed to create share link", e);
      setError(
        "An unexpected error occurred while creating the shareable link.",
      );
    }
  };

  const handleLoadExample = useCallback(() => {
    setError(null);
    setGeneratedPrompt("");
    setTokenUsage(null);
    const randomIndex = Math.floor(Math.random() * examples.length);
    const example = examples[randomIndex];
    setPurpose(example.purpose);
    const exampleIdeas: Idea[] = example.ideas.map((text, index) => ({
      id: `example-${Date.now()}-${index}`,
      text,
    }));
    setIdeas(exampleIdeas);
  }, []);

  const handleLoadFromHistory = useCallback((item: HistoryItem) => {
    setIdeas(item.ideas);
    setPurpose(item.purpose);
    setGeneratedPrompt(item.prompt);
    setTokenUsage(
      item.inputTokens && item.outputTokens
        ? { input: item.inputTokens, output: item.outputTokens }
        : null,
    );
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDeleteFromHistory = useCallback((id: string) => {
    setPromptHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleClearHistory = useCallback(() => {
    setPromptHistory([]);
    localStorage.removeItem("promptHistory");
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="rounded-xl border border-border-primary backdrop-blur-sm p-6 transition-colors duration-300 bg-surface-primary/30 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold tracking-wide text-accent-primary">
            {t("inputIdeasTitle")}
          </h3>
          <button
            onClick={handleLoadExample}
            className="flex items-center gap-2 px-3 py-1 text-sm rounded-full border border-border-primary bg-surface-primary/50 text-secondary hover:bg-surface-tertiary hover:text-primary transition-colors duration-200"
            aria-label={t("loadExample")}
          >
            <Lightbulb size={16} />
            <span>{t("loadExample")}</span>
          </button>
        </div>
        <IdeaInput
          currentIdea={currentIdea}
          setCurrentIdea={setCurrentIdea}
          onAddIdea={handleAddIdea}
        />
        <IdeasList ideas={ideas} onRemoveIdea={handleRemoveIdea} />
        <PurposeSelector
          purpose={purpose}
          setPurpose={setPurpose}
          isLight={isLight}
        />
      </div>

      {/* Output Section */}
      <div className="flex flex-col">
        <div className="rounded-xl border border-border-primary backdrop-blur-sm p-6 transition-colors duration-300 flex-grow flex flex-col bg-surface-primary/30 shadow-md">
          <h3 className="text-2xl font-bold tracking-wide mb-4 text-status-success">
            {t("generatedPromptTitle")}
          </h3>
          <div className="flex-grow rounded-md min-h-[300px] flex flex-col border border-border-secondary bg-main">
            <div className="relative flex-grow p-4 overflow-y-auto">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-primary/80 backdrop-blur-sm z-20">
                  <Loader
                    className="animate-spin text-accent-primary"
                    size={48}
                  />
                  <p className="mt-4 font-semibold text-accent-primary">
                    {t("generatingMessage")}
                  </p>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-primary/80 backdrop-blur-sm p-4 z-20">
                  <div className="bg-status-error/10 border border-status-error/30 text-status-error p-4 rounded-lg flex flex-col items-center gap-2 text-center shadow-lg">
                    <AlertTriangle size={32} />
                    <h4 className="font-bold">{t("generationFailedTitle")}</h4>
                    <p className="text-sm">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="mt-2 bg-status-error/20 hover:bg-status-error/30 text-status-error px-3 py-1 text-sm rounded-md flex items-center gap-1"
                    >
                      <X size={14} /> {t("close")}
                    </button>
                  </div>
                </div>
              )}
              {generatedPrompt && !isLoading && !error && (
                <>
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <button
                      onClick={() =>
                        setViewMode(viewMode === "raw" ? "preview" : "raw")}
                      className="rounded-md bg-surface-primary p-2 text-accent-primary transition-all duration-200 hover:bg-surface-tertiary"
                      aria-label={t("toggleView")}
                    >
                      {viewMode === "raw"
                        ? <Eye size={20} />
                        : <Code size={20} />}
                    </button>
                    <button
                      onClick={handleShare}
                      className="rounded-md bg-surface-primary p-2 text-accent-primary transition-all duration-200 hover:bg-surface-tertiary"
                      aria-label={t("copyLink")}
                    >
                      {isLinkCopied
                        ? <ClipboardCheck size={20} />
                        : <Share2 size={20} />}
                    </button>
                    <button
                      onClick={handleCopy}
                      className="rounded-md bg-surface-primary p-2 text-accent-primary transition-all duration-200 hover:bg-surface-tertiary"
                      aria-label={t("copyPrompt")}
                    >
                      {isCopied
                        ? <ClipboardCheck size={20} />
                        : <Clipboard size={20} />}
                    </button>
                  </div>
                  {viewMode === "preview"
                    ? (
                      <div className="prose prose-sm max-w-none text-secondary prose-invert prose-headings:text-primary prose-code:font-mono prose-code:bg-surface-tertiary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-surface-tertiary">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {generatedPrompt}
                        </ReactMarkdown>
                      </div>
                    )
                    : (
                      <textarea
                        title={`(t('${generatedPrompt}'))`}
                        ref={textareaRef}
                        readOnly
                        value={generatedPrompt}
                        className="w-full h-auto bg-transparent resize-none border-none focus:ring-0 p-0 m-0 font-mono text-sm leading-relaxed text-primary overflow-hidden"
                        rows={1}
                      />
                    )}
                </>
              )}
              {!generatedPrompt && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center h-full text-muted">
                  <Wand2 size={48} className="mb-4" />
                  <p className="font-semibold text-center">
                    {t("promptPlaceholder")}
                  </p>
                </div>
              )}
            </div>
            {tokenUsage && (
              <div className="flex-shrink-0 p-2 border-t border-border-primary bg-surface-primary/50">
                <div className="flex items-center justify-center gap-4 text-xs text-muted font-semibold">
                  <BrainCircuit size={16} className="text-accent-primary" />
                  <span>
                    {t("input")}:{" "}
                    <span className="font-bold text-accent-secondary">
                      {tokenUsage.input}
                    </span>{" "}
                    {t("tokens")}
                  </span>
                  <span className="text-border-primary">|</span>
                  <span>
                    {t("output")}:{" "}
                    <span className="font-bold text-status-success">
                      {tokenUsage.output}
                    </span>{" "}
                    {t("tokens")}
                  </span>
                  <span className="text-border-primary">|</span>
                  <span>
                    {t("total")}:{" "}
                    <span className="font-bold text-status-info">
                      {tokenUsage.input + tokenUsage.output}
                    </span>{" "}
                    {t("tokens")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mode Indicator Section */}
          {!isConfigLoading && (
            <div
              className={`mt-4 p-3 rounded-lg border ${
                currentMode === "demo"
                  ? "bg-status-warning/10 border-status-warning/50"
                  : currentMode === "byok"
                  ? "bg-status-info/10 border-status-info/50"
                  : "bg-status-success/10 border-status-success/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      currentMode === "demo"
                        ? "bg-status-warning"
                        : currentMode === "byok"
                        ? "bg-status-info"
                        : "bg-status-success"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      currentMode === "demo"
                        ? "text-status-warning"
                        : currentMode === "byok"
                        ? "text-status-info"
                        : "text-status-success"
                    }`}
                  >
                    {currentMode === "demo" && "🎭 Demo Mode"}
                    {currentMode === "byok" && "🔑 Using Your API Key (BYOK)"}
                    {currentMode === "server" &&
                      `🔧 Using Server Config${
                        selectedProvider ? ` (${selectedProvider})` : ""
                      }`}
                  </span>
                </div>
                {availableProviders.length > 0 && (
                  <div className="text-xs text-muted">
                    {availableProviders.length}{" "}
                    provider{availableProviders.length !== 1 ? "s" : ""}{" "}
                    available
                  </div>
                )}
              </div>
              {currentMode === "demo" && (
                <p className="text-xs text-status-warning mt-1">
                  Configure an API key (server or BYOK) for full AI-powered
                  features
                </p>
              )}
            </div>
          )}

          {/* BYOK Support: Optional API Key Input */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="text-sm flex items-center gap-2 text-muted hover:text-primary transition-colors"
            >
              {showApiKeyInput
                ? "🔒 Hide API Key"
                : "🔑 Use Your Own API Key (BYOK)"}
            </button>

            {showApiKeyInput && (
              <div className="mt-2">
                <input
                  type="password"
                  placeholder="sk-... or AIza... (optional)"
                  value={externalApiKey}
                  onChange={(e) => setExternalApiKey(e.target.value)}
                  className="w-full p-3 rounded-lg border border-border-primary bg-surface-primary text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                />
                <p className="text-xs mt-1 text-muted">
                  💡 Your key is only used for this request and never stored on
                  our servers
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || ideas.length === 0 || !purpose.trim()}
            className="w-full mt-6 bg-gradient-to-r from-status-success to-accent-primary font-bold text-lg p-4 rounded-lg flex items-center justify-center gap-3 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-white shadow-lg hover:scale-105 hover:shadow-xl"
          >
            {isLoading
              ? <Loader className="animate-spin" size={28} />
              : <Wand2 size={28} />}
            {isLoading ? t("generatingButton") : t("generateButton")}
          </button>
        </div>
      </div>

      {/* Prompt History Section */}
      <PromptHistoryDisplay
        history={promptHistory}
        onLoad={handleLoadFromHistory}
        onDelete={handleDeleteFromHistory}
        onClear={handleClearHistory}
        isLight={isLight}
      />
    </div>
  );
};

export default PromptCrafter;
