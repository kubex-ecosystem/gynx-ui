import { Activity, Bot, Database, Key, LayoutDashboard, LucideIcon, Mail, MessageCircle, NotebookPen, Sparkles, Wand2, Workflow } from 'lucide-react';
import React from 'react';
import { useTranslations } from '../../i18n/useTranslations';

export type SidebarSection = {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
};

interface SidebarProps {
  sections: SidebarSection[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  onClose?: () => void;
  collapsed?: boolean;
}

const defaultIcons: Record<string, LucideIcon> = {
  'gateway-dashboard': Activity,
  'data-analyzer': BarChart3,
  'mail-hub': Mail,
  'data-sync': Database,
  'providers-settings': Key,
  welcome: LayoutDashboard,
  prompt: Sparkles,
  agents: Bot,
  chat: MessageCircle,
  summarizer: NotebookPen,
  code: Workflow,
  images: Wand2,
};
const Sidebar: React.FC<SidebarProps> = ({ sections, activeSection, onSectionChange, onClose, collapsed = false }) => {
 const { t } = useTranslations();

 return (
 <div className="flex h-full flex-col">
 <div className="flex items-center justify-between px-3 py-5 lg:hidden">
 <h2 className="text-base font-semibold tracking-wide text-primary">
 {t('sidebarTitle')}
 </h2>
 <button
 type="button"
 className="rounded-full border border-border-primary bg-surface-primary/60 p-2 text-secondary transition hover:bg-surface-tertiary"
 onClick={onClose}
 aria-label="Close navigation"
 >
 <span className="sr-only">Close navigation</span>
 ×
 </button>
 </div>

 <div className={`hidden px-6 pt-8 pb-5 ${collapsed ? 'lg:hidden' : 'lg:block'}`}>
 <p className="text-xs uppercase tracking-[0.4em] text-muted">{t('sidebarSuiteLabel')}</p>
 <h1 className="mt-3 text-2xl font-semibold text-primary">{t('sidebarHubTitle')}</h1>
 <p className="mt-2 text-sm text-secondary">
 {t('sidebarDescription')}
 </p>
 </div>

 <div className={`hidden items-center justify-center gap-3 px-3 pt-6 pb-4 ${collapsed ? 'lg:flex' : 'lg:hidden'}`}>
 <div className="flex h-12 w-12 items-center justify-center rounded-2xl border text-accent-primary shadow-sm">
 <span className="text-base font-semibold">G</span>
 </div>
 </div>

       <nav className={`flex-1 overflow-y-auto custom-scrollbar px-4 pb-6 ${collapsed ? 'lg:hidden' : 'lg:px-6'}`}>
         <ul className="space-y-2">
           {sections.map((section) => {
             const Icon = section.icon || defaultIcons[section.id] || LayoutDashboard;
             const isActive = activeSection === section.id;
             return (
               <li key={section.id}>
                 <button
                   type="button"
                   onClick={() => {
                     onSectionChange(section.id);
                     if (onClose) onClose();
                   }}
                   className={`w-full rounded-xl border px-4 py-3 text-left transition-all duration-200 ${isActive
                       ? 'border-accent-primary/70 bg-accent-muted text-primary shadow-md'
                       : 'border-transparent bg-surface-primary/75 text-secondary hover:border-border-accent hover:bg-surface-tertiary'
                     }`}
                 >
                   <div className="flex items-center gap-3">
                     <span className={`flex h-10 w-10 items-center justify-center rounded-lg border ${isActive
                         ? 'border-transparent bg-surface-primary text-accent-primary'
                         : 'border-border-primary bg-surface-primary text-secondary'
                       }`}>
                       <Icon size={20} />
                     </span>
                     <div>
                       <p className={`text-sm font-semibold ${isActive ? 'text-inherit' : 'text-primary'}`}>
                         {section.label}
                       </p>
                       {section.description && (
                         <p className="text-xs text-muted">{section.description}</p>
                       )}
                     </div>
                   </div>
                 </button>
               </li>
             );
           })}
         </ul>
       </nav>
 
       <nav className={`hidden flex-1 overflow-y-auto custom-scrollbar pb-6 ${collapsed ? 'lg:flex' : 'lg:hidden'}`}>
         <ul className="flex w-full flex-col items-center gap-3">
           {sections.map((section) => {
             const Icon = section.icon || defaultIcons[section.id] || LayoutDashboard;
             const isActive = activeSection === section.id;
             return (
               <li key={section.id} className="w-full">
                 <button
                   type="button"
                   title={section.label}
                   aria-label={section.label}
                   onClick={() => {
                     onSectionChange(section.id);
                     if (onClose) onClose();
                   }}
                   className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border text-secondary transition-all duration-200 ${isActive
                       ? 'border-accent-primary bg-accent-muted text-accent-primary shadow-md'
                       : 'border-transparent bg-surface-primary/80 hover:border-border-accent hover:bg-surface-tertiary'
                     }`}
                 >
                   <Icon size={20} />
                 </button>
               </li>
             );
           })}
         </ul>
       </nav>
  <div className={`hidden border-t border-border-primary px-6 py-5 text-xs text-secondary ${collapsed ? 'lg:hidden' : 'lg:block'}`}>
 <p>{t('sidebarFooterLineOne')}</p>
 <p className="mt-1">{t('sidebarFooterLineTwo')}</p>
 </div>
 </div>
 );
};

export default Sidebar;
