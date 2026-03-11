import { ArrowRight, Compass, Sparkles } from "lucide-react";
import React, { useState } from "react";
import Card from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { useRBAC } from "@/hooks/useRBAC";
import { useTranslations } from "@/i18n/useTranslations";
import lottieAnimation from "@assets/lotties/banner_sm-01.json";
import LottieControl from "@/components/ui/Lottie";
import {
  navigateToSection,
  type AppSectionId,
} from "@/core/navigation/hashRoutes";

const loopLimit = 20;

interface WelcomeProps {
  onGetStarted: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onGetStarted }) => {
  const { t } = useTranslations();
  const {
    activeTenant,
    activeRoleName,
    hasAccess,
    hasPendingAccess,
    pendingAccess,
  } = useAuth();
  const { hasAppCapability } = useRBAC();

  const [animationData, setAnimationData] = useState(lottieAnimation);

  const [loopTimes, setLoopTimes] = useState(0);
  const [loopSpeed, setLoopSpeed] = useState(0.35);

  const [isStopped, setIsStopped] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const featureHighlights = [
    {
      phase: t("welcomePhaseCreation"),
      title: t("welcomePromptTitle"),
      description: t("welcomePromptDescription"),
      section: "prompt" as AppSectionId,
    },
    {
      phase: t("welcomePhaseAnalysis"),
      title: t("welcomeChatTitle"),
      description: t("welcomeChatDescription"),
      section: "chat" as AppSectionId,
    },
    {
      phase: t("welcomePhaseConsolidation"),
      title: t("welcomeSummaryTitle"),
      description: t("welcomeSummaryDescription"),
      section: "summarizer" as AppSectionId,
    },
  ];
  const canOpenWorkspaceSettings =
    hasAccess && hasAppCapability("workspace.read");
  const canOpenProviders = hasAccess && hasAppCapability("providers.read");

  const lottieControl = new LottieControl({
    ariaRole: "button",
    ariaLabel: "animation",
    isClickToPauseDisabled: true,
    title: "animation",
    isStopped: isStopped,
    isPaused: isPaused,
    width: 550,
    speed: loopSpeed,
    direction: 1,
    options: {
      autoplay: false,
      loop: loopTimes < loopLimit,
      animationData: animationData || {},
      rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
    },
    eventListeners: [
      {
        eventName: "loopComplete",
        callback: () => {
          if (loopTimes < loopLimit) {
            setLoopTimes(loopTimes + 1);
          } else if (loopTimes === loopLimit) {
            setLoopTimes(loopTimes + 1);
            setTimeout(() => {
              setLoopTimes(0);
            }, 30000);
          } else {
            setLoopTimes(0);
          }
        },
      }, // onComplete
      {
        eventName: "DOMLoaded",
        callback: () => {
          if (isStopped) setIsStopped(false);
          if (isPaused) setIsPaused(false);
        },
      }, // onDOMLoaded
    ],
    style: { width: "550px" },
    segments: [],
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="bg-gradient-to-br from-surface-primary via-surface-secondary to-surface-tertiary p-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="grid md:grid-cols-2 gap-8 items-center p-4 lg:p-8">
          <div className="space-y-4 relative z-10">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.4em] text-accent-primary">
              <Compass size={16} /> {t("welcomeKicker")}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">
              {t("welcomeHeadline")}
            </h1>
            <p className="text-base text-secondary leading-relaxed">
              {t("welcomeSubheadline")}
            </p>
            <div className="rounded-2xl border border-border-primary/70 bg-surface-primary/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">
                Access scope
              </p>
              {hasAccess ? (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-semibold text-primary">
                    {activeTenant?.name ||
                      activeTenant?.slug ||
                      "Workspace ready"}
                  </p>
                  <p className="text-xs text-secondary">
                    Active role: {activeRoleName || "Member"}
                  </p>
                </div>
              ) : hasPendingAccess ? (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-semibold text-primary">
                    Access request pending
                  </p>
                  <p className="text-xs text-secondary">
                    Provider: {pendingAccess?.provider || "unknown"}
                    {pendingAccess?.role_code
                      ? ` · requested role ${pendingAccess.role_code}`
                      : ""}
                  </p>
                </div>
              ) : (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-semibold text-primary">
                    Authenticated without tenant scope
                  </p>
                  <p className="text-xs text-secondary">
                    Complete invitation or membership assignment before entering
                    the workspace.
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col items-start gap-3 sm:flex-row pt-2">
              <button
                type="button"
                onClick={onGetStarted}
                disabled={!hasAccess}
                className="inline-flex items-center gap-2 rounded-full border border-accent-primary bg-accent-primary px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-accent-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:bg-accent-primary"
              >
                {hasAccess ? "Explorar o workspace" : "Aguardando acesso"}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="relative h-64 min-h-[300px] flex items-center justify-center pointer-events-none p-6">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-surface-primary/10 to-surface-primary z-10 hidden md:block" />
            {lottieControl.render()}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {featureHighlights.map((feature) => (
          <div
            key={feature.title}
            onClick={() => {
              if (hasAccess) {
                navigateToSection(feature.section);
              }
            }}
            className={`group h-full ${hasAccess ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
          >
            <Card
              title={feature.title}
              description={feature.description}
              className="h-full transition-all duration-300 group-hover:border-accent-primary/50 group-hover:shadow-md group-hover:-translate-y-1"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-primary transition-colors duration-300 group-hover:text-accent-secondary">
                {feature.phase}
              </div>
            </Card>
          </div>
        ))}

        {/* Placeholders for new CTAs */}
        <div
          onClick={() => {
            if (canOpenWorkspaceSettings) {
              navigateToSection("workspace-settings");
            }
          }}
          className={`rounded-2xl border-2 border-dashed border-border-primary/50 bg-surface-primary/10 flex flex-col items-center justify-center p-6 text-center shadow-none transition-all duration-300 group min-h-[160px] ${canOpenWorkspaceSettings ? "cursor-pointer hover:border-accent-primary/50 hover:bg-surface-primary/30 hover:-translate-y-1" : "cursor-not-allowed opacity-70"}`}
        >
          <Sparkles className="h-6 w-6 text-muted group-hover:text-accent-primary transition-colors mb-3 group-hover:scale-110 duration-300" />
          <p className="text-sm font-semibold text-secondary group-hover:text-primary transition-colors">
            Upgrade de Assinatura
          </p>
          <p className="text-xs text-muted mt-1 flex items-center gap-1 opacity-60">
            Gerenciar Plano
          </p>
        </div>

        <div
          onClick={() => {
            if (canOpenProviders) {
              navigateToSection("providers-settings");
            }
          }}
          className={`rounded-2xl border-2 border-dashed border-border-primary/50 bg-surface-primary/10 flex flex-col items-center justify-center p-6 text-center shadow-none transition-all duration-300 group min-h-[160px] ${canOpenProviders ? "cursor-pointer hover:border-accent-primary/50 hover:bg-surface-primary/30 hover:-translate-y-1" : "cursor-not-allowed opacity-70"}`}
        >
          <Compass className="h-6 w-6 text-muted group-hover:text-accent-primary transition-colors mb-3 group-hover:scale-110 duration-300" />
          <p className="text-sm font-semibold text-secondary group-hover:text-primary transition-colors">
            Configurar Modelos
          </p>
          <p className="text-xs text-muted mt-1 flex items-center gap-1 opacity-60">
            Explorar Provedores
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
