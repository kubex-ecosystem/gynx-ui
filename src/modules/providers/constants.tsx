import React from "react";
import {
  Bot,
  Code2,
  Cpu,
  Database,
  Globe,
  Network,
  Terminal,
  Zap,
} from "lucide-react";
import type { ProviderMeta, ProviderToolRoute } from "./types";

export const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
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

export const PROVIDERS_META: ProviderMeta[] = [
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

export const PROVIDER_TOOLS: ProviderToolRoute[] = [
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
