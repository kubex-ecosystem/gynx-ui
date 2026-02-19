import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import React from 'react';
import Card from '../ui/Card';
import { useTranslations } from '../../i18n/useTranslations';

interface WelcomeProps {
 onGetStarted: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onGetStarted }) => {
 const { t } = useTranslations();
 const featureHighlights = [
 {
 phase: t('welcomePhaseCreation'),
 title: t('welcomePromptTitle'),
 description: t('welcomePromptDescription'),
 },
 {
 phase: t('welcomePhaseAnalysis'),
 title: t('welcomeChatTitle'),
 description: t('welcomeChatDescription'),
 },
 {
 phase: t('welcomePhaseConsolidation'),
 title: t('welcomeSummaryTitle'),
 description: t('welcomeSummaryDescription'),
 },
 ];

 return (
 <div className="space-y-8">
 <Card className="bg-gradient-to-br from-surface-primary via-surface-secondary to-surface-tertiary">
 <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
 <div className="flex-1 space-y-4">
 <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.4em] text-accent-primary">
 <Compass size={16} /> {t('welcomeKicker')}
 </p>
 <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">
 {t('welcomeHeadline')}
 </h1>
 <p className="text-base text-secondary">
 {t('welcomeSubheadline')}
 </p>
 <div className="flex flex-col items-start gap-3 sm:flex-row">
 <button
 type="button"
 onClick={onGetStarted}
 className="inline-flex items-center gap-2 rounded-full border border-accent-primary bg-accent-primary px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-[1.01] hover:bg-accent-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary/40"
 >
 {t('welcomeCta')}
 <ArrowRight size={16} />
 </button>
 </div>
 </div>
 <div className="flex-1 rounded-2xl border border-border-primary bg-surface-primary/95 p-6 shadow-md">
 <p className="text-xs uppercase tracking-[0.45em] text-muted">{t('welcomeStackTitle')}</p>
 <ul className="mt-4 space-y-3 text-sm text-secondary">
 <li className="flex items-start gap-3">
 <Sparkles className="mt-1 h-4 w-4 text-accent-primary" />
 {t('welcomeStackItemOne')}
 </li>
 <li className="flex items-start gap-3">
 <Sparkles className="mt-1 h-4 w-4 text-accent-secondary" />
 {t('welcomeStackItemTwo')}
 </li>
 <li className="flex items-start gap-3">
 <Sparkles className="mt-1 h-4 w-4 text-status-info" />
 {t('welcomeStackItemThree')}
 </li>
 </ul>
 </div>
 </div>
 </Card>

 <div className="grid gap-6 md:grid-cols-3">
 {featureHighlights.map((feature) => (
 <Card key={feature.title} title={feature.title} description={feature.description}>
 <div className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-primary">
 {feature.phase}
 </div>
 </Card>
 ))}
 </div>
 </div>
 );
};

export default Welcome;
