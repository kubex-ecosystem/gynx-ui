import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { httpClient } from '@/core/http/client';
import { HTTP_CREDENTIALS } from '@/core/http/auth';
import { httpEndpoints } from '@/core/http/endpoints';

interface User {
  id: string;
  email: string;
  name: string;
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

const getDemoEnv = () => (
  process.env.DEMO_MODE === 'true' ||
  process.env.VITE_DEMO_MODE === 'true' ||
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  false
)


// FLAG PARA SIMULAÇÃO (Pode ser lida de env futuramente)
const DEMO_MODE = getDemoEnv()
const ACCESS_TOKEN_KEY = 'gnyx_access_token';
const REFRESH_TOKEN_KEY = 'gnyx_refresh_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (DEMO_MODE) {
          // Em Demo Mode, checa o token mockado
          const token = Cookies.get(ACCESS_TOKEN_KEY);

          if (token) {
            setUser({ id: '1', email: 'rafael@kubex.world', name: 'Rafael Mori' });
          } else {
            setUser(null);
          }

          setIsLoading(false);
          return;
        } else {
          // Real backend session validation using HttpOnly cookies
          const userData = await httpClient.get<{ id: string; email: string; name?: string }>(
            httpEndpoints.auth.me,
            { credentials: HTTP_CREDENTIALS.session }
          );
          setUser({ id: userData.id, email: userData.email, name: userData.name || userData.email.split('@')[0] });
        }
      } catch (error) {
        console.error("Falha ao validar sessão", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockResponse = {
          access_token: "mock_jwt_token_" + Date.now(),
          refresh_token: "mock_refresh_token",
          user: { id: '1', email, name: 'Rafael Mori' }
        };

        Cookies.set(ACCESS_TOKEN_KEY, mockResponse.access_token, { expires: 7, secure: true, sameSite: 'strict' });
        Cookies.set(REFRESH_TOKEN_KEY, mockResponse.refresh_token, { expires: 30, secure: true, sameSite: 'strict' });
        setUser(mockResponse.user);
      } else {
        await httpClient.post<void, { email: string; password: string }>(
          httpEndpoints.auth.signIn,
          { email, password },
          {
          credentials: HTTP_CREDENTIALS.session,
          parseAs: 'void',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        // With HttpOnly cookies, the browser handles the cookies automatically!
        // We just fetch the user profile right after successful login
        try {
          const userData = await httpClient.get<{ id: string; email: string; name?: string }>(
            httpEndpoints.auth.me,
            { credentials: HTTP_CREDENTIALS.session }
          );
          setUser({ id: userData.id, email: userData.email, name: userData.name || email.split('@')[0] });
        } catch {
          // Fallback if /me endpoint is not available yet in BE but login was successful
          setUser({ id: 'real-uuid', email, name: email.split('@')[0] });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (DEMO_MODE) {
      Cookies.remove(ACCESS_TOKEN_KEY);
      Cookies.remove(REFRESH_TOKEN_KEY);
    } else {
      try {
        await httpClient.post<void, undefined>(httpEndpoints.auth.signOut, undefined, {
          credentials: HTTP_CREDENTIALS.session,
          parseAs: 'void',
        });
      } catch (e) {
        console.error("Erro no sign-out", e);
      }
    }
    setUser(null);
    window.location.hash = '#landing';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      isSimulated: DEMO_MODE
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
