import * as React from "react";
import { DemoMode } from "@/config/demoMode";
import { useTranslations } from "@/i18n/useTranslations";

const DemoStatusFooter: React.FC = () => {

  const { t } = useTranslations();

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
                {t("funcionais")}
              </h4>
              <ul className="text-blue-600 dark:text-blue-400 space-y-1">
                <li>• {t("claudeApi")}</li>
                <li>• {t("interfaceReact")}</li>
                <li>• {t("geracaoDeCodigo")}</li>
                <li>• {t("engineKubex")}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                {t("emBreve")}
              </h4>
              <ul className="text-blue-600 dark:text-blue-400 space-y-1">
                <li>• {t("ollamaLocal")}</li>
                <li>• {t("mcpServers")}</li>
                <li>• {t("multiProviders")}</li>
                <li>• {t("agentsExecution")}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                {t("arquitetura")}
              </h4>
              <ul className="text-blue-600 dark:text-blue-400 space-y-1">
                <li>• DemoMode System</li>
                <li>• {t("singleSourceTruth")}</li>
                <li>• {t("onboardingReady")}</li>
                <li>• {t("kubexBackend")}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                {t("inspirado")}
              </h4>
              <ul className="text-blue-600 dark:text-blue-400 space-y-1">
                <li>• {t("gnyxCli")}</li>
                <li>• {t("kubexEcosystem")}</li>
                <li>• {t("designedToStayFree")}</li>
                <li>• {t("freedomEngineered")}</li>
              </ul>
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              💡 <strong>{t("inspirado")}</strong>{" "}
              {t("inspiradoDescription")}
            </p>
            {/*             <p className="text-blue-700 dark:text-blue-300 text-sm">
              💡 <strong>Inspirado nos projetos Grompt e GemX Analyzer:</strong>{" "}
              Esta interface web é uma fruto do uso de IA's por engenheiros e arquitetos, que visam
              criar uma experiência de desenvolvimento mais simples, prática, criativa e de baixo custo.
              Com isso, o desenvolvimento de software se torna mais acessível, divertido e produtivo.
            </p> */}
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              💡 <strong>GNyx CLI v2.0:</strong>{" "}
              {t("gnyxCliDescription")}
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
                  <span className="text-[#3FB950]">❯</span> <span className="text-[#79C0FF]">gnyx</span> <span className="text-[#D2A8FF]">ask</span> <span className="text-[#A5D6FF]">"{t("gnyxCliExample")}"</span> <span className="text-[#8B949E]">--provider</span> <span className="text-[#FF7B72]">gemini</span>
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
                  <span className="text-[#3FB950]">❯</span> <span className="text-[#79C0FF]">gnyx</span> <span className="text-[#D2A8FF]">generate</span> <span className="text-[#8B949E]">--model</span> <span className="text-[#A5D6FF]">'gemini-3.1-pro'</span> <span className="text-[#8B949E]">--ideas</span> <span className="text-[#A5D6FF]">'{t("gnyxCliExample")}'</span> <span className="text-[#8B949E]">\</span><br />
                  &nbsp;&nbsp;<span className="text-[#8B949E]">--ideas</span> <span className="text-[#A5D6FF]">'{t("gnyxCliExample2")}'</span> <span className="text-[#8B949E]">--ideas</span> <span className="text-[#A5D6FF]">'Conexão com PostgreSQL'</span>
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
                  <span className="text-[#FF7B72]">export</span> IDEAS=<span className="text-[#A5D6FF]">'{t("gnyxCliExample3")}'</span><br /><br />

                  <span className="text-[#FF7B72]">export</span> PROMPT=<span className="text-[#3FB950]">$(</span><span className="text-[#79C0FF]">gnyx</span> <span className="text-[#D2A8FF]">generate</span> <span className="text-[#8B949E]">--provider</span> <span className="text-[#FF7B72]">gemini</span> <span className="text-[#8B949E]">\</span><br />
                  &nbsp;&nbsp;<span className="text-[#8B949E]">--model</span> <span className="text-[#A5D6FF]">'gemini-3.1-flash'</span> <span className="text-[#8B949E]">--ideas</span> <span className="text-[#A5D6FF]">"</span><span className="text-[#79C0FF]">$IDEAS</span><span className="text-[#A5D6FF]">"</span> <span className="text-[#8B949E]">\</span><br />
                  &nbsp;&nbsp;<span className="text-[#8B949E]">--max-tokens</span> <span className="text-[#79C0FF]">10000</span> <span className="text-[#8B949E]">--purpose</span> <span className="text-[#A5D6FF]">'code'</span><span className="text-[#3FB950]">)</span><br /><br />

                  <span className="text-[#79C0FF]">echo</span> <span className="text-[#A5D6FF]">"</span><span className="text-[#79C0FF]">$PROMPT</span><span className="text-[#A5D6FF]">"</span> <span className="text-[#FF7B72]">|</span> <span className="text-[#79C0FF]">tail</span> <span className="text-[#8B949E]">-n</span> <span className="text-[#79C0FF]">+3</span> <span className="text-[#FF7B72]">|</span> <span className="text-[#79C0FF]">tee</span> output.txt
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
