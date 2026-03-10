import React, { useEffect, useRef, useState } from "react";
import { Database, Bot, Wand2, Loader2, Settings } from "lucide-react";
import AgentsGenerator from "./components/features/AgentsGenerator";
import ChatInterface from "./components/features/ChatInterface";
import CodeGenerator from "./components/features/CodeGenerator";
import ContentSummarizer from "./components/features/ContentSummarizer";
import DataAnalyzer from "./components/features/DataAnalyzer";
import ImageGenerator from "./components/features/ImageGenerator";
import Playground from "./components/features/Playground";
import PromptCrafter from "./components/features/PromptCrafter";
import Welcome from "./components/features/Welcome";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import Layout from "./components/layout/Layout";
import Sidebar, { SidebarSection } from "./components/layout/Sidebar";
import { LanguageContext } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  APP_SECTION_IDS,
  buildSectionHash,
  getSectionFromHash,
  isStandaloneSection,
  navigateToSection,
  resolveGuardedSection,
  type AppSectionId,
} from "./core/navigation/hashRoutes";
import { translations } from "./i18n/translations";
import type {
  ChatResponsePayload,
  ChatMessagePayload,
} from "./modules/chat/types";
import { chatService } from "./modules/chat/services/chatService";
import {
  creativeService,
  type CodeGenerationSpec,
  type ImagePromptSpec,
} from "./modules/creative/services/creativeService";
import { configService } from "./services/configService";
import { useProvidersStore } from "./store/useProvidersStore";
import { Language, Theme } from "./types";

// New Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AcceptInvite from "./pages/AcceptInvite";
import GatewayDashboard from "./pages/GatewayDashboard";
import MailHub from "./pages/MailHub";
import DataSync from "./pages/DataSync";
import ProvidersSettings from "./pages/ProvidersSettings";
import WorkspaceSettings from "./pages/WorkspaceSettings";

const SIDEBAR_COLLAPSED_KEY = "grompt.sidebar.collapsed";
const SIDEBAR_AUTO_EXPAND_SEEN_KEY = "grompt.sidebar.autoExpandSeen";
const ACTIVE_SECTION_KEY = "grompt.activeSection";

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, hasAccess } = useAuth();

  // State management
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguage] = useState<Language>("pt");
  const [activeSection, setActiveSection] = useState<AppSectionId>(() => {
    if (typeof window === "undefined") return "landing";
    const fromHash = getSectionFromHash(window.location.hash);
    if (fromHash) return fromHash;
    const saved = localStorage.getItem(ACTIVE_SECTION_KEY);
    if (saved && APP_SECTION_IDS.includes(saved as AppSectionId)) {
      return saved as AppSectionId;
    }
    return "landing";
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return saved !== "false";
  });
  const [autoExpandSeen, setAutoExpandSeen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_AUTO_EXPAND_SEEN_KEY) === "true";
  });
  const userInteractedRef = useRef(false);
  const activeSectionRef = useRef(activeSection);
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const { globalDefault, setGlobalDefault } = useProvidersStore();

  // Translation function
  const t = (key: string, params?: Record<string, string>): string => {
    const localeStrings = translations[language] || translations.en;
    let translation = localeStrings[key] || translations.en[key] || key;
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        translation = translation.replace(`{${paramKey}}`, params[paramKey]);
      });
    }
    return translation;
  };

  // Route Protection & Logic
  useEffect(() => {
    if (authLoading) return;

    const resolvedSection = resolveGuardedSection(
      activeSection,
      isAuthenticated,
      hasAccess,
    );
    if (resolvedSection !== activeSection) {
      setActiveSection(resolvedSection);
      navigateToSection(resolvedSection);
    }
  }, [isAuthenticated, hasAccess, authLoading, activeSection]);

  // Effects
  useEffect(() => {
    let mounted = true;

    const loadRuntimeFlags = async () => {
      try {
        const config = await configService.getConfig(true);
        const isDemo = await configService.isDemoMode();
        if (mounted) {
          setDemoMode(isDemo);

          const selectedProvider = config.providers[globalDefault];
          if (!selectedProvider?.available) {
            if (
              config.default_provider &&
              config.providers[config.default_provider]
            ) {
              setGlobalDefault(config.default_provider);
            } else if (config.available_providers.length > 0) {
              setGlobalDefault(config.available_providers[0]);
            }
          }
        }
      } catch (error) {
        console.error("Falha ao carregar runtime flags", error);
        if (mounted) {
          setDemoMode(true);
        }
      }
    };

    loadRuntimeFlags();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    activeSectionRef.current = activeSection;
    localStorage.setItem(ACTIVE_SECTION_KEY, activeSection);
  }, [activeSection]);

  useEffect(() => {
    const handleHashChange = () => {
      const nextSection = getSectionFromHash(window.location.hash);
      if (!nextSection) {
        return;
      }

      const resolvedSection = authLoading
        ? nextSection
        : resolveGuardedSection(nextSection, isAuthenticated, hasAccess);

      if (resolvedSection !== activeSectionRef.current) {
        setActiveSection(resolvedSection);
      }

      if (!authLoading && resolvedSection !== nextSection) {
        navigateToSection(resolvedSection);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [authLoading, isAuthenticated, hasAccess]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash.startsWith("#prompt=")) return;
    if (
      activeSection === "accept-invite" &&
      getSectionFromHash(window.location.hash) === "accept-invite"
    ) {
      return;
    }

    const nextHash = buildSectionHash(activeSection);
    if (window.location.hash !== nextHash) {
      window.history.replaceState(
        null,
        document.title,
        `${window.location.pathname}${window.location.search}${nextHash}`,
      );
    }
  }, [activeSection]);

  const handleToggleTheme = () => {
    const newTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const handleSidebarToggle = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      const next = !sidebarCollapsed;
      setSidebarCollapsed(next);
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return;
    }
    setSidebarOpen((prev) => !prev);
  };

  const sections: SidebarSection[] = [
    {
      id: "welcome",
      label: t("sectionWelcomeLabel"),
      description: t("sectionWelcomeDescription"),
    },
    {
      id: "group-ops",
      label: t("sectionGroupOps"),
      icon: Database,
      children: [
        {
          id: "gateway-dashboard",
          label: t("sectionDashboardLabel"),
          description: t("sectionDashboardDescription"),
        },
        {
          id: "mail-hub",
          label: t("sectionMailLabel"),
          description: t("sectionMailDescription"),
        },
        {
          id: "data-sync",
          label: t("sectionDataLabel"),
          description: t("sectionDataDescription"),
        },
      ],
    },
    {
      id: "group-intell",
      label: t("sectionGroupIntell"),
      icon: Bot,
      children: [
        {
          id: "playground",
          label: "Playground SSE",
          description: "Stream LLM Data",
        },
        {
          id: "data-analyzer",
          label: t("sectionAnalyzerLabel"),
          description: t("sectionAnalyzerDescription"),
        },
        {
          id: "prompt",
          label: t("sectionPromptLabel"),
          description: t("sectionPromptDescription"),
        },
        {
          id: "agents",
          label: t("sectionAgentsLabel"),
          description: t("sectionAgentsDescription"),
        },
        {
          id: "chat",
          label: t("sectionChatLabel"),
          description: t("sectionChatDescription"),
        },
      ],
    },
    {
      id: "group-creative",
      label: t("sectionGroupCreative"),
      icon: Wand2,
      children: [
        {
          id: "summarizer",
          label: t("sectionSummarizerLabel"),
          description: t("sectionSummarizerDescription"),
        },
        {
          id: "code",
          label: t("sectionCodeLabel"),
          description: t("sectionCodeDescription"),
        },
        {
          id: "images",
          label: t("sectionImagesLabel"),
          description: t("sectionImagesDescription"),
        },
      ],
    },
    {
      id: "group-settings",
      label: "Administração",
      icon: Settings,
      children: [
        {
          id: "workspace-settings",
          label: "Workspace",
          description: "Geral & Tenants",
        },
        {
          id: "providers-settings",
          label: t("sectionSettingsLabel"),
          description: t("sectionSettingsDescription"),
        },
      ],
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "landing":
        return <Landing />;
      case "auth":
        return <Auth />;
      case "accept-invite":
        return <AcceptInvite />;
      case "gateway-dashboard":
        return <GatewayDashboard />;
      case "data-analyzer":
        return <DataAnalyzer theme={theme} />;
      case "mail-hub":
        return <MailHub />;
      case "data-sync":
        return <DataSync />;
      case "workspace-settings":
        return <WorkspaceSettings />;
      case "providers-settings":
        return <ProvidersSettings />;
      case "playground":
        return <Playground />;
      case "welcome":
        return (
          <Welcome
            onGetStarted={() => navigateToSection("gateway-dashboard")}
          />
        );
      case "prompt":
        return <PromptCrafter theme={theme} isApiKeyMissing={demoMode} />;
      case "agents":
        return <AgentsGenerator theme={theme} isApiKeyMissing={demoMode} />;
      case "chat":
        return (
          <ChatInterface
            theme={theme}
            isApiKeyMissing={demoMode}
            onSend={handleChatSend}
          />
        );
      case "summarizer":
        return (
          <ContentSummarizer
            theme={theme}
            isApiKeyMissing={demoMode}
            onSummarize={handleSummarize}
          />
        );
      case "code":
        return (
          <CodeGenerator
            theme={theme}
            isApiKeyMissing={demoMode}
            onGenerate={handleCodeGenerate}
          />
        );
      case "images":
        return (
          <ImageGenerator
            theme={theme}
            isApiKeyMissing={demoMode}
            onCraftPrompt={handleImagePrompt}
          />
        );
      default:
        return <Landing />;
    }
  };

  const handleSectionChange = (section: string) => {
    if (APP_SECTION_IDS.includes(section as AppSectionId)) {
      const nextSection = resolveGuardedSection(
        section as AppSectionId,
        isAuthenticated,
        hasAccess,
      );
      setActiveSection(nextSection);
      navigateToSection(nextSection);
    }
  };

  const handleChatSend = async (
    messages: ChatMessagePayload[],
    input: string,
    provider?: string,
    apiKey?: string,
  ): Promise<ChatResponsePayload | null> => {
    return chatService.sendMessage(messages, input, provider, apiKey);
  };

  const handleSummarize = async (
    input: string,
    tone: string,
    maxWords: number,
    provider?: string,
    apiKey?: string,
  ): Promise<string> => {
    return creativeService.summarize(input, tone, maxWords, provider, apiKey);
  };

  const handleCodeGenerate = async (
    spec: CodeGenerationSpec,
    provider?: string,
    apiKey?: string,
  ): Promise<string> => {
    return creativeService.generateCode(spec, provider, apiKey);
  };

  const handleImagePrompt = async (
    payload: ImagePromptSpec,
    provider?: string,
    apiKey?: string,
  ): Promise<string> => {
    return creativeService.craftImagePrompt(payload, provider, apiKey);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <Loader2 className="animate-spin text-accent-primary" size={48} />
      </div>
    );
  }

  const isStandalone = isStandaloneSection(activeSection);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {isStandalone ? (
        renderContent()
      ) : (
        <Layout
          sidebar={
            <Sidebar
              sections={sections}
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              onClose={() => setSidebarOpen(false)}
              collapsed={sidebarCollapsed}
            />
          }
          header={
            <Header
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onToggleSidebar={handleSidebarToggle}
              collapsed={sidebarCollapsed}
            />
          }
          footer={<Footer />}
          sidebarOpen={sidebarOpen}
          onSidebarClose={() => setSidebarOpen(false)}
          sidebarCollapsed={sidebarCollapsed}
        >
          {renderContent()}
        </Layout>
      )}
    </LanguageContext.Provider>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <MainApp />
  </AuthProvider>
);

export default App;
