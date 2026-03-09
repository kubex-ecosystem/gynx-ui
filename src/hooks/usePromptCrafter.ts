import { GenerateRequest } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';
import { DemoMode, FeatureKey } from '@/config/demoMode';
import onboardingSteps from '@/constants/onboardingSteps';
import { Idea, Ideas } from '@/types';
import { useGromptAPI } from '@/hooks/useGromptAPI';


const uuidv4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const {
  generatePrompt,
  // Add any other functions you need from the API here
} = useGromptAPI({

})


export type OutputType = 'prompt' | 'agent';
export type AgentFramework = 'crewai' | 'autogen' | 'langchain' | 'semantic-kernel' | 'custom';
export type Purpose = 'Código' | 'Imagem' | 'Análise' | 'Escrita' | 'Automação' | 'Suporte' | 'Pesquisa' | 'Outros';

export interface UsePromptCrafterProps {
  apiGenerate?: typeof generatePrompt;
}

export interface UsePromptCrafterReturn {
  // State
  darkMode: boolean;
  currentInput: Ideas;
  ideas: Ideas;
  editingId: string | null;
  editingText: string;
  purpose: Purpose;
  customPurpose: string;
  maxLength: number;
  generatedPrompt: string;
  isGenerating: boolean;
  copied: boolean;
  outputType: OutputType;
  agentFramework: AgentFramework;
  agentRole: string;
  agentTools: string[];
  agentProvider: string;
  mcpServers: string[];
  customMcpServer: string;
  showOnboarding: boolean;
  currentStep: number;
  showEducational: boolean;
  isEducationOpen: boolean;
  educationalTopic: string | null;
  isSidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;

  // Setters
  setDarkMode: (value: boolean) => void;
  setCurrentInput: (value: Ideas) => void;
  setEditingText: (value: string) => void;
  setPurpose: (value: Purpose) => void;
  setCustomPurpose: (value: string) => void;
  setMaxLength: (value: number) => void;
  setOutputType: (value: OutputType) => void;
  setAgentFramework: (value: AgentFramework) => void;
  setAgentRole: (value: string) => void;
  setAgentTools: (value: string[] | ((prev: string[]) => string[])) => void;
  setAgentProvider: (value: string) => void;
  setMcpServers: (value: string[] | ((prev: string[]) => string[])) => void;
  setCustomMcpServer: (value: string) => void;
  setShowEducational: (value: boolean) => void;
  setIsEducationOpen: (value: boolean) => void;

  // Actions
  addIdea: () => void;
  removeIdea: (id: string) => void;
  startEditing: (id: string, text: string) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
  generatePrompt: () => Promise<void>;
  copyToClipboard: () => Promise<void>;
  handleFeatureClick: (feature: string) => boolean;
  startOnboarding: () => void;
  nextOnboardingStep: () => void;
  showEducation: (topic: string) => boolean;
}

const usePromptCrafter = ({ apiGenerate }: UsePromptCrafterProps): UsePromptCrafterReturn => {
  // UI State
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Ideas State
  const [currentInput, setCurrentInput] = useState<Ideas>([]);
  const [ideas, setIdeas] = useState<Ideas>(currentInput || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  // Configuration State
  const [purpose, setPurpose] = useState<Purpose>('Outros');
  const [customPurpose, setCustomPurpose] = useState<string>('');
  const [maxLength, setMaxLength] = useState<number>(5000);
  const [outputType, setOutputType] = useState<OutputType>('prompt');

  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Agent Configuration
  const [agentFramework, setAgentFramework] = useState<AgentFramework>('crewai');
  const [agentRole, setAgentRole] = useState<string>('');
  const [agentTools, setAgentTools] = useState<string[]>([]);
  const [agentProvider, setAgentProvider] = useState<string>('openai');
  const [mcpServers, setMcpServers] = useState<string[]>([]);
  const [customMcpServer, setCustomMcpServer] = useState<string>('');

  // Output State
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showEducational, setShowEducational] = useState<boolean>(false);
  const [isEducationOpen, setIsEducationOpen] = useState<boolean>(false);

  const [educationalTopic, setEducationalTopic] = useState<string | null>(null);

  // Dark mode effect
  useEffect(() => {
    document.documentElement.className = darkMode ? 'dark' : '';
  }, [darkMode]);

  // Ideas Management
  const addIdea = useCallback((): void => {
    if (currentInput.length === 0) return;
    const lastIdx = currentInput.length - 1;
    if (currentInput[lastIdx].id.trim()) {
      const newIdea: Idea = {
        id: uuidv4().toString(),
        text: currentInput[lastIdx].text.trim(),
        timestamp: currentInput[lastIdx].timestamp
      };
      setIdeas(prevIdeas => [...prevIdeas, newIdea]);
      setCurrentInput([]);
    }
  }, [currentInput]);

  const removeIdea = useCallback((id: string): void => {
    setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== id));
  }, []);

  const startEditing = useCallback((id: string, text: string): void => {
    setEditingId(id);
    setEditingText(text);
  }, []);

  const saveEdit = useCallback((): void => {
    setIdeas(prevIdeas => prevIdeas.map(idea =>
      idea.id === editingId
        ? { ...idea, text: editingText }
        : idea
    ));
    setEditingId(null);
    setEditingText('');
  }, [editingId, editingText]);

  const cancelEdit = useCallback((): void => {
    setEditingId(null);
    setEditingText('');
  }, []);

  // Generation Logic using new API
  const generatePrompt = useCallback(async (): Promise<void> => {
    if (ideas.length === 0) return;

    setIsGenerating(true);

    try {
      // Clear previous results
      setGeneratedPrompt('');

      const purposeText = purpose === 'Outros' && customPurpose
        ? customPurpose
        : purpose;

      // Prepare request for the API
      const generateRequest = {
        provider: agentProvider,
        ideas: ideas.map(idea => idea.text),
        purpose: purposeText.toLowerCase(),
        temperature: 0.7,
        maxTokens: maxLength,
        context: {
          outputType,
          agentFramework: outputType === 'agent' ? agentFramework : undefined,
          agentRole: outputType === 'agent' ? agentRole : undefined,
          agentTools: outputType === 'agent' ? agentTools : undefined,
          mcpServers: outputType === 'agent' ? mcpServers : undefined,
          maxLength: outputType === 'prompt' ? maxLength : undefined
        }
      } as GenerateRequest; // '"code" | "creative" | "analysis" | "general" | undefined'

      // Use streaming by default for better UX
      if (apiGenerate?.generateStream) {
        await apiGenerate.generateStream(generateRequest);
      } else if (apiGenerate?.generateSync) {
        const result = await apiGenerate.generateSync(generateRequest);
        setGeneratedPrompt(result.prompt);
      } else {
        // Fallback to legacy generation for demo mode
        await generatePromptLegacy(purposeText);
      }

    } catch (error) {
      console.error('Erro ao gerar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGeneratedPrompt('Erro ao gerar o ' + (outputType === 'prompt' ? 'prompt' : 'agent') + '. ' + errorMessage);
    }

    setIsGenerating(false);
  }, [ideas, purpose, customPurpose, outputType, agentProvider, agentFramework, agentRole, agentTools, mcpServers, maxLength, apiGenerate]);

  // Legacy generation for fallback and demo mode
  const generatePromptLegacy = async (purposeText: string): Promise<void> => {
    if (!['openai', 'anthropic', 'gemini'].includes(agentProvider) && DemoMode.isActive) {
      const demoResult = DemoMode.handleDemoCall(agentProvider as FeatureKey);
      setGeneratedPrompt('# 🎪 Demo Mode\n\n' + demoResult.message + '\n\n**ETA:** ' + demoResult.eta + '\n\n---\n\n*Configurações salvas:*\n- Framework: ' + agentFramework + '\n- Provider: ' + agentProvider + '\n- Ferramentas: ' + (agentTools.join(', ') || 'Nenhuma') + '\n- Servidores MCP: ' + (mcpServers.join(', ') || 'Nenhum') + '\n\nEssas configurações serão aplicadas quando o provider estiver disponível!');
      return;
    }

    // If no API available, show fallback message
    setGeneratedPrompt('API integration not available. Please check the backend connection.');
  };

  // Clipboard functionality
  const copyToClipboard = useCallback(async (): Promise<void> => {
    try {
      // Get content from API state or fallback to legacy state
      const contentToCopy = apiGenerate?.data?.prompt ||
        apiGenerate?.progress?.content ||
        generatedPrompt;

      if (!contentToCopy) {
        console.warn('No content to copy');
        return;
      }

      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  }, [apiGenerate, generatedPrompt]);

  // Feature handling
  const handleFeatureClick = useCallback((feature: string): boolean => {
    if (DemoMode.isActive && (!DemoMode.features[feature as FeatureKey] || !DemoMode.features[feature as FeatureKey].ready)) {
      const demoResult = DemoMode.handleDemoCall(feature as FeatureKey);
      alert(demoResult.message + '\n\nETA: ' + demoResult.eta);
      return false;
    }
    return true;
  }, []);

  // Onboarding management
  const startOnboarding = useCallback((): void => {
    setShowOnboarding(true);
    setCurrentStep(0);
  }, []);

  const nextOnboardingStep = useCallback((): void => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowOnboarding(false);
    }
  }, [currentStep]);

  // Educational modal management
  const showEducation = useCallback((topic: string): boolean => {
    setEducationalTopic(topic);
    setShowEducational(true);
    return isEducationOpen ? true : false
  }, []);

  return {
    // State
    darkMode,
    currentInput,
    ideas,
    editingId,
    editingText,
    purpose,
    customPurpose,
    maxLength,
    generatedPrompt,
    isGenerating,
    copied,
    outputType,
    agentFramework,
    agentRole,
    agentTools,
    agentProvider,
    mcpServers,
    customMcpServer,
    showOnboarding,
    currentStep,
    showEducational,
    educationalTopic,
    isEducationOpen,
    isSidebarOpen,

    // Setters
    setDarkMode,
    setCurrentInput,
    setEditingText,
    setPurpose,
    setCustomPurpose,
    setMaxLength,
    setOutputType,
    setAgentFramework,
    setAgentRole,
    setAgentTools,
    setAgentProvider,
    setMcpServers,
    setCustomMcpServer,
    setShowEducational,
    setIsEducationOpen,
    setSidebarOpen,

    // Actions
    addIdea,
    removeIdea,
    startEditing,
    saveEdit,
    cancelEdit,
    generatePrompt,
    copyToClipboard,
    handleFeatureClick,
    startOnboarding,
    nextOnboardingStep,
    showEducation
  };
};

export default usePromptCrafter;
