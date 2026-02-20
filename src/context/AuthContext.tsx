import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

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

// FLAG PARA SIMULAÇÃO (Pode ser lida de env futuramente)
const SIMULATE_AUTH = true; 
const ACCESS_TOKEN_KEY = 'gnyx_access_token';
const REFRESH_TOKEN_KEY = 'gnyx_refresh_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão ao carregar
    const token = Cookies.get(ACCESS_TOKEN_KEY);
    if (token) {
      if (SIMULATE_AUTH) {
        setUser({ id: '1', email: 'rafael@kubex.world', name: 'Rafael Mori' });
      } else {
        // TODO: Chamar endpoint /api/v1/auth/me para validar token real
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (SIMULATE_AUTH) {
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
        const response = await fetch('/api/v1/auth/sign-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) throw new Error('Credenciais inválidas');

        const data = await response.json();
        Cookies.set(ACCESS_TOKEN_KEY, data.access_token, { expires: 1 });
        Cookies.set(REFRESH_TOKEN_KEY, data.refresh_token, { expires: 7 });
        
        // Em um app real, buscaríamos os dados do usuário logado
        setUser({ id: 'real-uuid', email, name: email.split('@')[0] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
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
      isSimulated: SIMULATE_AUTH 
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
