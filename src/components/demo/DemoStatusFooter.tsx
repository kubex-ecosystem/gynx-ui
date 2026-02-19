import * as React from 'react';
import { DemoMode } from '../../config/demoMode';

const DemoStatusFooter: React.FC = () => {
 if (DemoMode.isActive !== true)
 return null;

 return (
 <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
 <div className="flex items-start gap-3">
 <span className="text-2xl">🎪</span>
 <div>
 <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
 Versão Demo - Powered by Grompt Engine
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
 <div>
 <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">✅ Funcionais:</h4>
 <ul className="text-blue-600 dark:text-blue-400 space-y-1">
 <li>• Claude API</li>
 <li>• Interface React</li>
 <li>• Geração de código</li>
 <li>• Engine Grompt</li>
 </ul>
 </div>
 <div>
 <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">🎪 Em Breve:</h4>
 <ul className="text-blue-600 dark:text-blue-400 space-y-1">
 <li>• Ollama Local</li>
 <li>• Servidores MCP</li>
 <li>• Multi-Providers</li>
 <li>• Execução de Agents</li>
 </ul>
 </div>
 <div>
 <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">🏗️ Arquitetura:</h4>
 <ul className="text-blue-600 dark:text-blue-400 space-y-1">
 <li>• DemoMode System</li>
 <li>• Single Source Truth</li>
 <li>• Onboarding Ready</li>
 <li>• Grompt Backend</li>
 </ul>
 </div>
 <div>
 <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">🎯 Inspirado em:</h4>
 <ul className="text-blue-600 dark:text-blue-400 space-y-1">
 <li>• Grompt CLI v2.0</li>
 <li>• Kubex Ecosystem</li>
 <li>• Simplicidade Radical</li>
 <li>• No Lock-in Philosophy</li>
 </ul>
 </div>
 </div>
 <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
 <p className="text-blue-700 dark:text-blue-300 text-sm">
 💡 <strong>Inspirado no Grompt:</strong> Esta interface web é uma evolução do Grompt CLI, mantendo a filosofia Kubex de simplicidade radical e anti-lock-in.
 </p>
 <div className="mt-2 flex flex-wrap gap-2 text-xs">
 <span className="bg-blue-200 dark:bg-blue-700 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
 CLI: grompt generate --ideas "..." --provider claude
 </span>
 <span className="bg-purple-200 dark:bg-purple-700 px-2 py-1 rounded text-purple-800 dark:text-purple-200">
 Web: Mesmo poder, interface visual
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default DemoStatusFooter;
