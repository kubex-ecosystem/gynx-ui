import React, { useEffect, useRef, useState } from 'react';
import { Database, Bot, Wand2, Loader2 } from 'lucide-react';
import AgentsGenerator from './components/features/AgentsGenerator';
import ChatInterface from './components/features/ChatInterface';
import CodeGenerator from './components/features/CodeGenerator';
import ContentSummarizer from './components/features/ContentSummarizer';
import DataAnalyzer from './components/features/DataAnalyzer';
import ImageGenerator from './components/features/ImageGenerator';
import PromptCrafter from './components/features/PromptCrafter';
import Welcome from './components/features/Welcome';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import Layout from './components/layout/Layout';
import Sidebar, { SidebarSection } from './components/layout/Sidebar';
import { LanguageContext } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { translations } from './i18n/translations';
import { configService } from './services/configService';
import { Language, Theme } from './types';

// New Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import AcceptInvite from './pages/AcceptInvite';
import GatewayDashboard from './pages/GatewayDashboard';
import MailHub from './pages/MailHub';
import DataSync from './pages/DataSync';
import ProvidersSettings from './pages/ProvidersSettings';

const SIDEBAR_COLLAPSED_KEY = 'grompt.sidebar.collapsed';
const SIDEBAR_AUTO_EXPAND_SEEN_KEY = 'grompt.sidebar.autoExpandSeen';

const SECTION_IDS = [
  'landing', 
  'auth', 
  'accept-invite',
  'welcome', 
  'gateway-dashboard', 
  'data-analyzer',
  'mail-hub', 
  'data-sync', 
  'providers-settings',
  'prompt', 
  'agents', 
  'chat', 
  'summarizer', 
  'code', 
  'images'
] as const;
type SectionId = (typeof SECTION_IDS)[number];
const ACTIVE_SECTION_KEY = 'grompt.activeSection';

const getSectionFromHash = (hash: string): SectionId | null => {
  if (hash.startsWith('#prompt=')) return 'prompt';
  if (hash.startsWith('#section=')) {
    const raw = hash.replace('#section=', '');
    const candidate = decodeURIComponent(raw) as SectionId;
    if (SECTION_IDS.includes(candidate)) return candidate;
  }
  const direct = hash.replace('#', '') as SectionId;
  if (SECTION_IDS.includes(direct)) return direct;
  return null;
};

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  // State management
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('pt');
  const [activeSection, setActiveSection] = useState<SectionId>(() => {
    if (typeof window === 'undefined') return 'landing';
    const fromHash = getSectionFromHash(window.location.hash);
    if (fromHash) return fromHash;
    return 'landing';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return saved !== 'false';
  });
  const [autoExpandSeen, setAutoExpandSeen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SIDEBAR_AUTO_EXPAND_SEEN_KEY) === 'true';
  });
  const userInteractedRef = useRef(false);
  const activeSectionRef = useRef(activeSection);
  const [demoMode, setDemoMode] = useState<boolean>(true);

  // Translation function
  const t = (key: string, params?: Record<string, string>): string => {
    const localeStrings = translations[language] || translations.en;
    let translation = localeStrings[key] || translations.en[key] || key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{${paramKey}}`, params[paramKey]);
      });
    }
    return translation;
  };

  // Route Protection & Logic
  useEffect(() => {
    if (authLoading) return;

    const publicSections: SectionId[] = ['landing', 'auth'];
    
    // Se não estiver logado e tentar acessar algo privado -> Landing
    if (!isAuthenticated && !publicSections.includes(activeSection)) {
      setActiveSection('landing');
      window.location.hash = '#landing';
    }
    
    // Se logado e tentar acessar landing/auth -> Welcome
    if (isAuthenticated && publicSections.includes(activeSection)) {
      setActiveSection('welcome');
      window.location.hash = '#welcome';
    }
  }, [isAuthenticated, authLoading, activeSection]);

  // Effects
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    activeSectionRef.current = activeSection;
    localStorage.setItem(ACTIVE_SECTION_KEY, activeSection);
  }, [activeSection]);

  useEffect(() => {
    const handleHashChange = () => {
      const nextSection = getSectionFromHash(window.location.hash);
      if (nextSection && nextSection !== activeSectionRef.current) {
        setActiveSection(nextSection);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash.startsWith('#prompt=')) return;
    const nextHash = `#section=${encodeURIComponent(activeSection)}`;
    if (window.location.hash !== nextHash && activeSection !== 'landing' && activeSection !== 'auth') {
      window.history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}${nextHash}`);
    } else if (activeSection === 'landing' || activeSection === 'auth') {
      window.history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}#${activeSection}`);
    }
  }, [activeSection]);

  const handleToggleTheme = () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleSidebarToggle = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      const next = !sidebarCollapsed;
      setSidebarCollapsed(next);
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return;
    }
    setSidebarOpen(prev => !prev);
  };

  const sections: SidebarSection[] = [
    {
      id: 'welcome',
      label: t('sectionWelcomeLabel'),
      description: t('sectionWelcomeDescription'),
    },
    {
      id: 'group-ops',
      label: t('sectionGroupOps'),
      icon: Database,
      children: [
        { id: 'gateway-dashboard', label: t('sectionDashboardLabel'), description: t('sectionDashboardDescription') },
        { id: 'mail-hub', label: t('sectionMailLabel'), description: t('sectionMailDescription') },
        { id: 'data-sync', label: t('sectionDataLabel'), description: t('sectionDataDescription') },
      ]
    },
    {
      id: 'group-intell',
      label: t('sectionGroupIntell'),
      icon: Bot,
      children: [
        { id: 'data-analyzer', label: t('sectionAnalyzerLabel'), description: t('sectionAnalyzerDescription') },
        { id: 'prompt', label: t('sectionPromptLabel'), description: t('sectionPromptDescription') },
        { id: 'agents', label: t('sectionAgentsLabel'), description: t('sectionAgentsDescription') },
        { id: 'chat', label: t('sectionChatLabel'), description: t('sectionChatDescription') },
      ]
    },
    {
      id: 'group-creative',
      label: t('sectionGroupCreative'),
      icon: Wand2,
      children: [
        { id: 'summarizer', label: t('sectionSummarizerLabel'), description: t('sectionSummarizerDescription') },
        { id: 'code', label: t('sectionCodeLabel'), description: t('sectionCodeDescription') },
        { id: 'images', label: t('sectionImagesLabel'), description: t('sectionImagesDescription') },
      ]
    },
    {
      id: 'providers-settings',
      label: t('sectionSettingsLabel'),
      description: t('sectionSettingsDescription'),
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'landing': return <Landing />;
      case 'auth': return <Auth />;
      case 'accept-invite': return <AcceptInvite />;
      case 'gateway-dashboard': return <GatewayDashboard />;
      case 'data-analyzer': return <DataAnalyzer theme={theme} />;
      case 'mail-hub': return <MailHub />;
      case 'data-sync': return <DataSync />;
      case 'providers-settings': return <ProvidersSettings />;
      case 'welcome': return <Welcome onGetStarted={() => setActiveSection('welcome')} />;
      case 'prompt': return <PromptCrafter theme={theme} isApiKeyMissing={demoMode} />;
      case 'agents': return <AgentsGenerator theme={theme} isApiKeyMissing={demoMode} />;
      case 'chat': return <ChatInterface theme={theme} isApiKeyMissing={demoMode} />;
      case 'summarizer': return <ContentSummarizer theme={theme} isApiKeyMissing={demoMode} />;
      case 'code': return <CodeGenerator theme={theme} isApiKeyMissing={demoMode} />;
      case 'images': return <ImageGenerator theme={theme} isApiKeyMissing={demoMode} />;
      default: return <Landing />;
    }
  };

  const handleSectionChange = (section: string) => {
    if (SECTION_IDS.includes(section as SectionId)) {
      setActiveSection(section as SectionId);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <Loader2 className="animate-spin text-accent-primary" size={48} />
      </div>
    );
  }

  const isStandalone = activeSection === 'landing' || activeSection === 'auth' || activeSection === 'accept-invite';

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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
