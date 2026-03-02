import { Menu, Moon, Sun } from 'lucide-react';
import React from 'react';
import { Theme } from '@/types';
import LanguageSelector from './LanguageSelector';
import { useTranslations } from '@/i18n/useTranslations';

interface HeaderProps {
    theme: Theme;
    onToggleTheme: () => void;
    onToggleSidebar: () => void;
    collapsed?: boolean;
    isSidebarOpen?: boolean;
    startOnboarding?: () => void;
    showEducation?: (value: string) => boolean;
    providers?: any;
    currentStep?: number;
    showEducational?: boolean;
    educationalTopic?: string;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, onToggleSidebar, collapsed = false, isSidebarOpen = false }) => {
    const { t } = useTranslations();

    return (
        <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    className="flex items-center justify-center rounded-full border border-border-primary bg-surface-primary/80 p-2 text-secondary transition hover:bg-surface-tertiary"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={20} />
                </button>
                {!collapsed && (
                    <div className="hidden sm:flex flex-col">
                        <h2 className="text-sm font-semibold text-primary">
                            {t('headerTitle')}
                        </h2>
                        <p className="text-xs text-secondary">
                            {t('headerTagline')}
                        </p>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-3">
                <LanguageSelector />
                <button
                    type="button"
                    onClick={onToggleTheme}
                    className="flex items-center justify-center rounded-full border border-border-primary bg-surface-primary/80 p-2 text-secondary transition hover:bg-surface-tertiary"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </div>
    );
};

export default Header;
