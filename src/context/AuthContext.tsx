import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Cookies from "js-cookie";
import { httpClient } from "@/core/http/client";
import { HTTP_CREDENTIALS } from "@/core/http/auth";
import { httpEndpoints } from "@/core/http/endpoints";
import { navigateToSection } from "@/core/navigation/hashRoutes";
import { isSimulatedAuthEnabled } from "@/core/runtime/mode";

export interface Membership {
  tenant_id: string;
  tenant_name?: string;
  tenant_slug?: string;
  role_id: string;
  role_code?: string;
  role_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface TeamMembership {
  team_id: string;
  team_name?: string;
  tenant_id: string;
  tenant_name?: string;
  role_id: string;
  role_code?: string;
  role_name?: string;
  is_active: boolean;
  is_default?: boolean;
  description?: string;
  created_at: string;
}

export interface PendingAccess {
  id: string;
  provider: string;
  status: string;
  tenant_id?: string;
  role_code?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface AccessScope {
  has_access: boolean;
  has_pending_access: boolean;
  active_tenant_id?: string;
  active_tenant_name?: string;
  active_tenant_slug?: string;
  active_role_code?: string;
  active_role_name?: string;
  team_memberships: number;
  pending_access?: PendingAccess;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  lastName?: string;
  status?: string;
  memberships: Membership[];
  teamMemberships: TeamMembership[];
  accessScope?: AccessScope;
}

export interface ActiveTenant {
  id: string;
  name?: string;
  slug?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  activeTenant: ActiveTenant | null;
  activeMembership: Membership | null;
  activeTeamMemberships: TeamMembership[];
  activeRoleCode: string | null;
  activeRoleName: string | null;
  permissions: string[];
  hasAccess: boolean;
  hasPendingAccess: boolean;
  pendingAccess: PendingAccess | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSimulated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchActiveTenant: (tenantId: string) => void;
}

type AuthUserPayload = {
  id: string;
  email: string;
  name?: string;
  last_name?: string;
  status?: string;
  memberships?: Membership[];
  team_memberships?: TeamMembership[];
  access_scope?: AccessScope;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = "gnyx_access_token";
const REFRESH_TOKEN_KEY = "gnyx_refresh_token";
const ACTIVE_TENANT_KEY = "gnyx_active_tenant_id";

const readStoredTenantId = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(ACTIVE_TENANT_KEY);
};

const mapAuthUser = (userData: AuthUserPayload): AuthUser => ({
  id: userData.id,
  email: userData.email,
  name: userData.name || userData.email.split("@")[0],
  lastName: userData.last_name,
  status: userData.status,
  memberships: userData.memberships || [],
  teamMemberships: userData.team_memberships || [],
  accessScope: userData.access_scope,
});

const buildMockUser = (email = "rafael@kubex.world"): AuthUser =>
  mapAuthUser({
    id: "1",
    email,
    name: "Rafael Mori",
    status: "active",
    memberships: [
      {
        tenant_id: "tenant-mock-456",
        tenant_name: "Bellube Global",
        tenant_slug: "bellube",
        role_id: "role-admin",
        role_code: "admin",
        role_name: "Administrator",
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ],
    team_memberships: [],
    access_scope: {
      has_access: true,
      has_pending_access: false,
      active_tenant_id: "tenant-mock-456",
      active_tenant_name: "Bellube Global",
      active_tenant_slug: "bellube",
      active_role_code: "admin",
      active_role_name: "Administrator",
      team_memberships: 0,
    },
  });

const selectActiveMembership = (
  memberships: Membership[],
  preferredTenantId?: string | null,
  accessScope?: AccessScope,
): Membership | null => {
  if (memberships.length === 0) {
    return null;
  }

  const candidateTenantIds = [
    preferredTenantId,
    accessScope?.active_tenant_id,
  ].filter((value): value is string => Boolean(value));

  for (const tenantId of candidateTenantIds) {
    const preferredMembership = memberships.find(
      (membership) => membership.tenant_id === tenantId && membership.is_active,
    );
    if (preferredMembership) {
      return preferredMembership;
    }

    const fallbackMembership = memberships.find(
      (membership) => membership.tenant_id === tenantId,
    );
    if (fallbackMembership) {
      return fallbackMembership;
    }
  }

  return (
    memberships.find((membership) => membership.is_active) ||
    memberships[0] ||
    null
  );
};

const buildPermissions = (activeRoleCode: string | null): string[] => {
  if (activeRoleCode === "admin") {
    return ["*"];
  }
  return [];
};

const deriveAccessState = (
  user: AuthUser | null,
  preferredTenantId?: string | null,
) => {
  const memberships = user?.memberships || [];
  const accessScope = user?.accessScope;
  const activeMembership = selectActiveMembership(
    memberships,
    preferredTenantId,
    accessScope,
  );
  const activeTenantId =
    activeMembership?.tenant_id || accessScope?.active_tenant_id || null;
  const activeTeamMemberships = (user?.teamMemberships || []).filter(
    (membership) => !activeTenantId || membership.tenant_id === activeTenantId,
  );
  const activeRoleCode =
    activeMembership?.role_code ||
    accessScope?.active_role_code ||
    activeTeamMemberships.find((membership) => membership.role_code)
      ?.role_code ||
    null;
  const activeRoleName =
    activeMembership?.role_name ||
    accessScope?.active_role_name ||
    activeTeamMemberships.find((membership) => membership.role_name)
      ?.role_name ||
    null;
  const activeTenant = activeTenantId
    ? {
        id: activeTenantId,
        name: activeMembership?.tenant_name || accessScope?.active_tenant_name,
        slug: activeMembership?.tenant_slug || accessScope?.active_tenant_slug,
      }
    : null;
  const hasAccess =
    accessScope?.has_access ??
    memberships.some((membership) => membership.is_active);
  const hasPendingAccess =
    accessScope?.has_pending_access ?? Boolean(accessScope?.pending_access);
  const pendingAccess = accessScope?.pending_access || null;

  return {
    activeMembership,
    activeTenant,
    activeTeamMemberships,
    activeRoleCode,
    activeRoleName,
    hasAccess,
    hasPendingAccess,
    pendingAccess,
    permissions: buildPermissions(activeRoleCode),
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preferredTenantId, setPreferredTenantId] = useState<string | null>(
    () => readStoredTenantId(),
  );
  const simulatedAuth = isSimulatedAuthEnabled();

  const accessState = useMemo(
    () => deriveAccessState(user, preferredTenantId),
    [user, preferredTenantId],
  );

  useEffect(() => {
    const nextTenantId = accessState.activeTenant?.id || null;

    if (typeof window === "undefined") {
      return;
    }

    if (!nextTenantId) {
      localStorage.removeItem(ACTIVE_TENANT_KEY);
      if (preferredTenantId !== null) {
        setPreferredTenantId(null);
      }
      return;
    }

    localStorage.setItem(ACTIVE_TENANT_KEY, nextTenantId);

    if (preferredTenantId !== nextTenantId) {
      setPreferredTenantId(nextTenantId);
    }
  }, [accessState.activeTenant?.id, preferredTenantId]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (simulatedAuth) {
          const token = Cookies.get(ACCESS_TOKEN_KEY);
          setUser(token ? buildMockUser() : null);
          return;
        }

        const userData = await httpClient.get<AuthUserPayload>(
          httpEndpoints.auth.me,
          {
            credentials: HTTP_CREDENTIALS.session,
          },
        );
        setUser(mapAuthUser(userData));
      } catch (error) {
        console.error("Falha ao validar sessão", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();
  }, [simulatedAuth]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (simulatedAuth) {
        await new Promise((resolve) => setTimeout(resolve, 800));

        Cookies.set(ACCESS_TOKEN_KEY, `mock_jwt_token_${Date.now()}`, {
          expires: 7,
          secure: true,
          sameSite: "strict",
        });
        Cookies.set(REFRESH_TOKEN_KEY, "mock_refresh_token", {
          expires: 30,
          secure: true,
          sameSite: "strict",
        });
        setUser(buildMockUser(email));
        return;
      }

      await httpClient.post<void, { email: string; password: string }>(
        httpEndpoints.auth.signIn,
        { email, password },
        {
          credentials: HTTP_CREDENTIALS.session,
          parseAs: "void",
          headers: { "Content-Type": "application/json" },
        },
      );

      try {
        const userData = await httpClient.get<AuthUserPayload>(
          httpEndpoints.auth.me,
          {
            credentials: HTTP_CREDENTIALS.session,
          },
        );
        setUser(mapAuthUser(userData));
      } catch {
        setUser(
          mapAuthUser({
            id: "real-uuid",
            email,
            name: email.split("@")[0],
            memberships: [],
            team_memberships: [],
            access_scope: {
              has_access: false,
              has_pending_access: false,
              team_memberships: 0,
            },
          }),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (simulatedAuth) {
      Cookies.remove(ACCESS_TOKEN_KEY);
      Cookies.remove(REFRESH_TOKEN_KEY);
    } else {
      try {
        await httpClient.post<void, undefined>(
          httpEndpoints.auth.signOut,
          undefined,
          {
            credentials: HTTP_CREDENTIALS.session,
            parseAs: "void",
          },
        );
      } catch (error) {
        console.error("Erro no sign-out", error);
      }
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem(ACTIVE_TENANT_KEY);
    }

    setPreferredTenantId(null);
    setUser(null);
    navigateToSection("landing");
  };

  const switchActiveTenant = (tenantId: string) => {
    if (!user) {
      return;
    }

    const hasTenantMembership = user.memberships.some(
      (membership) => membership.tenant_id === tenantId,
    );

    if (!hasTenantMembership) {
      return;
    }

    setPreferredTenantId(tenantId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeTenant: accessState.activeTenant,
        activeMembership: accessState.activeMembership,
        activeTeamMemberships: accessState.activeTeamMemberships,
        activeRoleCode: accessState.activeRoleCode,
        activeRoleName: accessState.activeRoleName,
        permissions: accessState.permissions,
        hasAccess: accessState.hasAccess,
        hasPendingAccess: accessState.hasPendingAccess,
        pendingAccess: accessState.pendingAccess,
        isAuthenticated: !!user,
        isLoading,
        isSimulated: simulatedAuth,
        login,
        logout,
        switchActiveTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
