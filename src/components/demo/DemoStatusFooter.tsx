import * as React from "react";
import { DemoMode } from "../../config/demoMode";

const DemoStatusFooter: React.FC = () => {
  if (DemoMode.isActive !== true) {
    return null;
  }

  return (
    <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🎪</span>
        <div>
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            GNyx - Demo Mode - Powered by Kubex Ecosystems
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                Funcionais:
              </h4>
              <ul className="text-blue-600 dark:text-blue-400 space-y-1">
                <li>• Claude API</li>
                <li>• Interface React</li>
                <li>• Geração de código</li>
                <li>• Engine Kubex</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                🎪 Em Breve:
              </h4>
              <ul className="text-blue-600 dark:text-blue-400 space-y-1">
                <li>• Ollama Local</li>
                <li>• Servidores MCP</li>
                <li>• Multi-Providers</li>
                <li>• Execução de Agents</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                🏗️ Arquitetura:
              </h4>
              <ul className="text-blue-600 dark:text-blue-400 space-y-1">
                <li>• DemoMode System</li>
                <li>• Single Source Truth</li>
                <li>• Onboarding Ready</li>
                <li>• Kubex Backend</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                🎯 Inspirado em:
              </h4>
              <ul className="text-blue-600 dark:text-blue-400 space-y-1">
                <li>• GNyx CLI v2.0</li>
                <li>• Kubex Ecosystem</li>
                <li>• Simplicidade Radical</li>
                <li>• No Lock-in Philosophy</li>
              </ul>
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              💡 <strong>Inspirado nos projetos Grompt e GemX Analyzer:</strong>{" "}
              Esta interface web é uma fruto do uso de IA's por engenheiros e arquitetos, que visam
              criar uma experiência de desenvolvimento mais simples, prática, criativa e de baixo custo.
              Com isso, o desenvolvimento de software se torna mais acessível, divertido e produtivo.
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              💡 <strong>GNyx CLI v2.0:</strong>{" "}
              GNyx CLI v2.0 é uma ferramenta de linha de comando onde é possível gerar código
              com IA, permitindo que os engenheiros e arquitetos criem software mais rápido, com menos erros,
              de forma programática. Ela possui comandos intuitivos e desenhados para serem facilmente
              usados por engenheiros, arquitetos ou qualquer pessoa que queira criar software e automações
              interativamente.
            </p>
            <div className="mt-4 flex flex-col gap-3 text-xs w-full max-w-full overflow-hidden">
              <div className="bg-[#0D1117] border border-[#30363D] rounded-md overflow-hidden flex flex-col w-full shadow-md">
                <div className="bg-[#161B22] px-3 py-1.5 border-b border-[#30363D] flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
                  </div>
                  <span className="text-[#8B949E] text-[10px] font-mono ml-2">gnyx-cli — sh</span>
                </div>
                <div className="p-3 overflow-x-auto custom-scrollbar font-mono text-[11px] leading-relaxed text-[#E6EDF3]">
                  <span className="text-[#3FB950]">❯</span> <span className="text-[#79C0FF]">gnyx</span> <span className="text-[#D2A8FF]">ask</span> <span className="text-[#A5D6FF]">"Como otimizar queries no Postgres?"</span> <span className="text-[#8B949E]">--provider</span> <span className="text-[#FF7B72]">gemini</span>
                </div>
              </div>

              <div className="bg-[#0D1117] border border-[#30363D] rounded-md overflow-hidden flex flex-col w-full shadow-md">
                <div className="bg-[#161B22] px-3 py-1.5 border-b border-[#30363D] flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
                  </div>
                  <span className="text-[#8B949E] text-[10px] font-mono ml-2">gnyx-cli — sh</span>
                </div>
                <div className="p-3 overflow-x-auto custom-scrollbar font-mono text-[11px] leading-relaxed text-[#E6EDF3]">
                  <span className="text-[#3FB950]">❯</span> <span className="text-[#79C0FF]">gnyx</span> <span className="text-[#D2A8FF]">generate</span> <span className="text-[#8B949E]">--model</span> <span className="text-[#A5D6FF]">'gemini-3.1-pro'</span> <span className="text-[#8B949E]">--ideas</span> <span className="text-[#A5D6FF]">'Criar um microserviço em Go'</span> <span className="text-[#8B949E]">\</span><br />
                  &nbsp;&nbsp;<span className="text-[#8B949E]">--ideas</span> <span className="text-[#A5D6FF]">'Deve usar Clean Architecture'</span> <span className="text-[#8B949E]">--ideas</span> <span className="text-[#A5D6FF]">'Conexão com PostgreSQL'</span>
                </div>
              </div>

              <div className="bg-[#0D1117] border border-[#30363D] rounded-md overflow-hidden flex flex-col w-full shadow-md mb-2">
                <div className="bg-[#161B22] px-3 py-1.5 border-b border-[#30363D] flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
                  </div>
                  <span className="text-[#8B949E] text-[10px] font-mono ml-2">advanced-script.sh</span>
                </div>
                <div className="p-3 overflow-x-auto custom-scrollbar font-mono text-[10px] sm:text-[11px] leading-relaxed text-[#E6EDF3] whitespace-pre">
                  <span className="text-[#FF7B72]">export</span> GEMINI_API_KEY=<span className="text-[#A5D6FF]">'sua_chave_aqui'</span><br />
                  <span className="text-[#FF7B72]">export</span> _IDEAS=<span className="text-[#A5D6FF]">'Preciso de um sistema que fragmente um modelo de dados grande em pedaços
                    menores para processamento. Requisitos:
                    1. Aceitar um modelo grande como entrada.
                    2. Dividir garantindo independência e coesão.
                    3. Fornecer interface para manipular fragmentos.'</span><br /><br />

                  <span className="text-[#FF7B72]">export</span> _PROMPT=<span className="text-[#3FB950]">$(</span><span className="text-[#79C0FF]">gnyx</span> <span className="text-[#D2A8FF]">generate</span> <span className="text-[#8B949E]">--provider</span> <span className="text-[#FF7B72]">gemini</span> <span className="text-[#8B949E]">\</span><br />
                  &nbsp;&nbsp;<span className="text-[#8B949E]">--model</span> <span className="text-[#A5D6FF]">'gemini-2.0-flash'</span> <span className="text-[#8B949E]">--ideas</span> <span className="text-[#A5D6FF]">"</span><span className="text-[#79C0FF]">${_IDEAS}</span><span className="text-[#A5D6FF]">"</span> <span className="text-[#8B949E]">\</span><br />
                  &nbsp;&nbsp;<span className="text-[#8B949E]">--max-tokens</span> <span className="text-[#79C0FF]">10000</span> <span className="text-[#8B949E]">--purpose</span> <span className="text-[#A5D6FF]">'code'</span><span className="text-[#3FB950]">)</span><br /><br />

                  <span className="text-[#79C0FF]">echo</span> <span className="text-[#A5D6FF]">"</span><span className="text-[#79C0FF]">${_PROMPT}</span><span className="text-[#A5D6FF]">"</span> <span className="text-[#FF7B72]">|</span> <span className="text-[#79C0FF]">tail</span> <span className="text-[#8B949E]">-n</span> <span className="text-[#79C0FF]">+3</span> <span className="text-[#FF7B72]">|</span> <span className="text-[#79C0FF]">tee</span> output.txt
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoStatusFooter;
