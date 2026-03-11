import { Building2, Menu, Moon, Sun } from "lucide-react";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Theme } from "@/types";
import LanguageSelector from "./LanguageSelector";
import { useTranslations } from "@/i18n/useTranslations";

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

const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onToggleSidebar,
  collapsed = false,
  isSidebarOpen = false,
}) => {
  const { t } = useTranslations();
  const {
    user,
    activeTenant,
    activeRoleName,
    hasPendingAccess,
    hasAccess,
    switchActiveTenant,
  } = useAuth();
  const tenantOptions =
    user?.memberships.filter(
      (membership, index, memberships) =>
        index ===
        memberships.findIndex(
          (candidate) => candidate.tenant_id === membership.tenant_id,
        ),
    ) || [];

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
              {t("headerTitle")}
            </h2>
            <p className="text-xs text-secondary">{t("headerTagline")}</p>
          </div>
        )}
        {!collapsed && (activeTenant || hasPendingAccess) && (
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-border-primary bg-surface-primary/70 px-3 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted">
              {hasAccess ? "Scope" : "Access"}
            </span>
            <span className="text-xs font-semibold text-primary">
              {hasAccess
                ? activeTenant?.name || activeTenant?.slug || activeTenant?.id
                : "Pending review"}
            </span>
            {hasAccess && activeRoleName && (
              <span className="rounded-full bg-accent-muted px-2 py-0.5 text-[11px] font-semibold text-accent-primary">
                {activeRoleName}
              </span>
            )}
          </div>
        )}
        {!collapsed && hasAccess && tenantOptions.length > 1 && (
          <div className="hidden xl:flex items-center gap-2 rounded-full border border-border-primary bg-surface-primary/70 px-3 py-1.5">
            <Building2 size={14} className="text-muted" />
            <select
              value={activeTenant?.id || ""}
              onChange={(event) => switchActiveTenant(event.target.value)}
              className="bg-transparent text-xs font-semibold text-primary focus:outline-none"
              aria-label="Switch active tenant"
            >
              {tenantOptions.map((membership) => (
                <option
                  key={membership.tenant_id}
                  value={membership.tenant_id}
                  className="bg-surface-primary text-primary"
                >
                  {membership.tenant_name ||
                    membership.tenant_slug ||
                    membership.tenant_id}
                </option>
              ))}
            </select>
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
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Header;
