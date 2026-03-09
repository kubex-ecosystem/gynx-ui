import {
  Activity, BarChart3, Bot, Database, Key, LayoutDashboard,
  LucideIcon, Mail, MessageCircle, NotebookPen, Sparkles,
  Wand2, Workflow, ChevronDown, LogOut, ShieldCheck, Play, Settings
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/i18n/useTranslations';
import { useAuth } from '@/context/AuthContext';

export type SidebarSection = {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  children?: SidebarSection[];
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
  'workspace-settings': ShieldCheck,
  welcome: LayoutDashboard,
  prompt: Sparkles,
  agents: Bot,
  chat: MessageCircle,
  summarizer: NotebookPen,
  code: Workflow,
  images: Wand2,
  playground: Play,
  'group-settings': Settings,
};

const NavItem: React.FC<{
  section: SidebarSection;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onClose?: () => void;
  isChild?: boolean;
}> = ({ section, activeSection, onSectionChange, onClose, isChild }) => {
  const Icon = section.icon || defaultIcons[section.id] || LayoutDashboard;
  const isDirectActive = activeSection === section.id;
  const isChildActive = section.children?.some(child => child.id === activeSection);
  const isActive = isDirectActive || isChildActive;

  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = section.children && section.children.length > 0;

  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  const handleAction = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onSectionChange(section.id);
      if (onClose) onClose();
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleAction}
        className={`w-full rounded-xl border px-4 py-3 text-left transition-all duration-200 flex items-center justify-between ${isDirectActive
            ? 'border-accent-primary/70 bg-accent-muted text-primary shadow-md'
            : isChild
              ? 'border-transparent bg-transparent text-secondary hover:text-primary hover:bg-surface-tertiary/30'
              : 'border-transparent bg-surface-primary/75 text-secondary hover:border-border-accent hover:bg-surface-tertiary'
          }`}
      >
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg border ${isDirectActive
              ? 'border-transparent bg-surface-primary text-accent-primary'
              : 'border-border-primary bg-surface-primary text-secondary'
            }`}>
            <Icon size={20} />
          </span>
          <div className="flex-1 overflow-hidden">
            <p className={`text-sm font-semibold truncate ${isDirectActive ? 'text-inherit' : 'text-primary'}`}>
              {section.label}
            </p>
            {!isChild && section.description && (
              <p className="text-xs text-muted line-clamp-1">{section.description}</p>
            )}
          </div>
        </div>
        {hasChildren && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="text-muted" />
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {hasChildren && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-6 mt-1 space-y-1"
          >
            {section.children?.map(child => (
              <NavItem
                key={child.id}
                section={child}
                activeSection={activeSection}
                onSectionChange={onSectionChange}
                onClose={onClose}
                isChild={true}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ sections, activeSection, onSectionChange, onClose, collapsed = false }) => {
  const { t } = useTranslations();
  const { logout } = useAuth();

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
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-primary bg-surface-secondary text-accent-primary shadow-sm">
          <span className="text-base font-semibold">G</span>
        </div>
      </div>

      <nav className={`flex-1 overflow-y-auto custom-scrollbar px-4 pb-6 ${collapsed ? 'lg:hidden' : 'lg:px-6'}`}>
        <div className="space-y-2">
          {sections.map((section) => (
            <NavItem
              key={section.id}
              section={section}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              onClose={onClose}
            />
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-8 pt-4 border-t border-border-secondary">
          <button
            onClick={logout}
            className="w-full rounded-xl border border-transparent px-4 py-3 text-left transition-all duration-200 flex items-center gap-3 text-status-error hover:bg-status-error/10"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-status-error/20 bg-status-error/5">
              <LogOut size={20} />
            </span>
            <p className="text-sm font-semibold">Sair da Sessão</p>
          </button>
        </div>
      </nav>

      {/* Mini Sidebar Nav */}
      <nav className={`hidden flex-1 overflow-y-auto custom-scrollbar pb-6 ${collapsed ? 'lg:flex' : 'lg:hidden'}`}>
        <ul className="flex w-full flex-col items-center gap-3">
          {sections.map((section) => {
            const Icon = section.icon || defaultIcons[section.id] || LayoutDashboard;
            const targetSection = section.children?.[0]?.id ?? section.id;
            const isActive = activeSection === section.id || section.children?.some(c => c.id === activeSection);
            return (
              <li key={section.id} className="w-full">
                <button
                  type="button"
                  title={section.label}
                  aria-label={section.label}
                  onClick={() => onSectionChange(targetSection)}
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

          <li className="w-full mt-4 pt-4 border-t border-border-secondary">
            <button
              onClick={logout}
              title="Sair"
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent text-status-error hover:bg-status-error/10 transition-all"
            >
              <LogOut size={20} />
            </button>
          </li>
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
