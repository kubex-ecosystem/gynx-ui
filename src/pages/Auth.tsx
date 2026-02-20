import { Box, Key, Loader2, Lock, Mail, Server } from "lucide-react";
import React, { useState } from "react";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";

const Auth: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [byok, setByok] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      // Redirecionamento é feito automaticamente pelo useEffect no App.tsx
    } catch (err: any) {
      setError(err.message || "Falha na autenticação");
    }
  };

  return (
    <div className="min-h-screen bg-main text-primary flex items-center justify-center px-4 relative">
      {/* ... backgrounds ... */}
      <div className="fixed inset-0 bg-vignette -z-10" />
      <div className="fixed inset-0 bg-grid -z-20 opacity-20" />

      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* ... header ... */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent-primary flex items-center justify-center shadow-xl shadow-accent-primary/20 rotate-3">
              <Box className="text-white" size={36} />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Entrar na GNyx</h1>
          <p className="text-secondary text-sm">
            Acesse o Workspace GNyx para gerenciar sua infraestrutura IA.
          </p>
        </div>

        <Card className="bg-surface-primary/80 backdrop-blur-xl border-border-primary/50 shadow-2xl p-8">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-xs font-bold text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-[0.3em]">
                Email Corporativo
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-secondary"
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-secondary border border-border-primary rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-accent-primary transition-all text-primary"
                  placeholder="name@company.com"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-[0.3em]">
                Senha
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-secondary"
                  size={18}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-secondary border border-border-primary rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-accent-primary transition-all text-primary"
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* ... BYOK ... */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted uppercase tracking-[0.3em]">
                  IA Provider (BYOK)
                </label>
                <span className="text-[10px] text-accent-secondary bg-accent-muted px-2 py-0.5 rounded-full font-bold">
                  OPCIONAL
                </span>
              </div>
              <div className="relative">
                <Key
                  className="absolute left-3 top-3 text-secondary"
                  size={18}
                />
                <input
                  type="password"
                  value={byok}
                  onChange={(e) => setByok(e.target.value)}
                  className="w-full bg-surface-secondary border border-border-primary rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-accent-primary transition-all text-primary"
                  placeholder="sk-... or AIza..."
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-accent-primary text-white font-bold text-lg shadow-lg shadow-accent-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading
                ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Verificando...
                  </>
                )
                : (
                  <>
                    Iniciar Sessão <Server size={20} />
                  </>
                )}
            </button>
          </form>
          {/* ... footer links ... */}
          <div className="mt-8 pt-8 border-t border-border-secondary flex justify-center gap-6 text-xs text-muted">
            <a href="#" className="hover:text-primary transition-colors">
              Esqueceu a senha?
            </a>
            <span className="text-border-secondary">|</span>
            <a href="#" className="hover:text-primary transition-colors">
              Solicitar acesso
            </a>
          </div>
        </Card>
        {/* ... */}
        <p className="text-center text-[11px] text-muted tracking-[0.1em] uppercase">
          Powered by{" "}
          <span className="text-primary font-bold">KUBEX Ecosystem</span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
