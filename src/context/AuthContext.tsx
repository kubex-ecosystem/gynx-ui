import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { httpClient } from "@/core/http/client";
import { HTTP_CREDENTIALS } from "@/core/http/auth";
import { httpEndpoints } from "@/core/http/endpoints";
import { navigateToSection } from "@/core/navigation/hashRoutes";
import { isSimulatedAuthEnabled } from "@/core/runtime/mode";

interface User {
  id: string;
  email: string;
  name: string;
  lastName?: string;
  status?: string;
  memberships?: Membership[];
  teamMemberships?: TeamMembership[];
  accessScope?: AccessScope;
}

interface Membership {
  tenant_id: string;
  tenant_name?: string;
  tenant_slug?: string;
  role_id: string;
  role_code?: string;
  role_name?: string;
  is_active: boolean;
  created_at: string;
}

interface TeamMembership {
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

interface PendingAccess {
  id: string;
  provider: string;
  status: string;
  tenant_id?: string;
  role_code?: string;
  created_at: string;
  reviewed_at?: string;
}

interface AccessScope {
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isSimulated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = "gnyx_access_token";
const REFRESH_TOKEN_KEY = "gnyx_refresh_token";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const simulatedAuth = isSimulatedAuthEnabled();

  const mapAuthUser = (userData: {
    id: string;
    email: string;
    name?: string;
    last_name?: string;
    status?: string;
    memberships?: Membership[];
    team_memberships?: TeamMembership[];
    access_scope?: AccessScope;
  }): User => ({
    id: userData.id,
    email: userData.email,
    name: userData.name || userData.email.split("@")[0],
    lastName: userData.last_name,
    status: userData.status,
    memberships: userData.memberships || [],
    teamMemberships: userData.team_memberships || [],
    accessScope: userData.access_scope,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (simulatedAuth) {
          // Em Demo Mode, checa o token mockado
          const token = Cookies.get(ACCESS_TOKEN_KEY);

          if (token) {
            setUser({
              id: "1",
              email: "rafael@kubex.world",
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
              teamMemberships: [],
              accessScope: {
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
          } else {
            setUser(null);
          }

          setIsLoading(false);
          return;
        } else {
          // Real backend session validation using HttpOnly cookies
          const userData = await httpClient.get<{
            id: string;
            email: string;
            name?: string;
            last_name?: string;
            status?: string;
            memberships?: Membership[];
            team_memberships?: TeamMembership[];
            access_scope?: AccessScope;
          }>(httpEndpoints.auth.me, { credentials: HTTP_CREDENTIALS.session });
          setUser(mapAuthUser(userData));
        }
      } catch (error) {
        console.error("Falha ao validar sessão", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [simulatedAuth]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (simulatedAuth) {
        // Simular delay de rede
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockResponse = {
          access_token: "mock_jwt_token_" + Date.now(),
          refresh_token: "mock_refresh_token",
          user: { id: "1", email, name: "Rafael Mori" },
        };

        Cookies.set(ACCESS_TOKEN_KEY, mockResponse.access_token, {
          expires: 7,
          secure: true,
          sameSite: "strict",
        });
        Cookies.set(REFRESH_TOKEN_KEY, mockResponse.refresh_token, {
          expires: 30,
          secure: true,
          sameSite: "strict",
        });
        setUser(mockResponse.user);
      } else {
        await httpClient.post<void, { email: string; password: string }>(
          httpEndpoints.auth.signIn,
          { email, password },
          {
            credentials: HTTP_CREDENTIALS.session,
            parseAs: "void",
            headers: { "Content-Type": "application/json" },
          },
        );

        // With HttpOnly cookies, the browser handles the cookies automatically!
        // We just fetch the user profile right after successful login
        try {
          const userData = await httpClient.get<{
            id: string;
            email: string;
            name?: string;
            last_name?: string;
            status?: string;
            memberships?: Membership[];
            team_memberships?: TeamMembership[];
            access_scope?: AccessScope;
          }>(httpEndpoints.auth.me, { credentials: HTTP_CREDENTIALS.session });
          setUser(mapAuthUser(userData));
        } catch {
          // Fallback if /me endpoint is not available yet in BE but login was successful
          setUser({ id: "real-uuid", email, name: email.split("@")[0] });
        }
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
      } catch (e) {
        console.error("Erro no sign-out", e);
      }
    }
    setUser(null);
    navigateToSection("landing");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        isSimulated: simulatedAuth,
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
