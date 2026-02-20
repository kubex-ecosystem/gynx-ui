import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Box,
  CheckCircle2,
  Cpu,
  Eye,
  EyeOff,
  Globe,
  Key,
  Loader2,
  Lock,
  Mail,
  Server,
} from "lucide-react";
import React, { useState } from "react";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";

const providers = [
  { id: "openai", name: "OpenAI", icon: Bot },
  { id: "anthropic", name: "Anthropic", icon: SparkleIcon },
  { id: "gemini", name: "Google Gemini", icon: Globe },
  { id: "ollama", name: "Ollama (Local)", icon: Cpu },
];

function SparkleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z" />
      <path d="M12 10V3" />
      <path d="M12 21v-7" />
      <path d="M16.5 4.5 12 9" />
      <path d="m12 15 4.5 4.5" />
      <path d="M21 12h-7" />
      <path d="M10 12H3" />
      <path d="m4.5 4.5 4.5 4.5" />
      <path d="m15 15 4.5 4.5" />
    </svg>
  );
}

const Auth: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // BYOK States
  const [useByok, setUseByok] = useState(false);
  const [byokProvider, setByokProvider] = useState("openai");
  const [byokKey, setByokKey] = useState("");

  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Falha na autenticação");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/v1/auth/google/start?next=/";
  };

  return (
    <div className="min-h-screen bg-main text-primary flex items-center justify-center px-4 relative">
      <div className="fixed inset-0 bg-vignette -z-10" />
      <div className="fixed inset-0 bg-grid -z-20 opacity-20" />

      <div className="w-full max-w-md space-y-8 animate-fade-in py-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent-primary flex items-center justify-center shadow-xl shadow-accent-primary/20 rotate-3">
              <Box className="text-white" size={36} />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Entrar na GNyx</h1>
          <p className="text-secondary text-sm px-8">
            Acesse o Workspace Bellube para gerenciar sua infraestrutura IA.
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
                  placeholder="rafael@kubex.world"
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-secondary border border-border-primary rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-accent-primary transition-all text-primary"
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  onTouchStart={() => setShowPassword(true)}
                  onTouchEnd={() => setShowPassword(false)}
                  className="absolute right-3 top-3 text-secondary hover:text-primary transition-colors cursor-pointer select-none"
                  title="Pressione para visualizar"
                >
                  {/* Corrigido: usando text-secondary que é mais visível/cinza que o muted mas menos que o primary */}
                  {showPassword
                    ? <EyeOff size={18} className="opacity-80" />
                    : <Eye size={18} className="opacity-80" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    rememberMe
                      ? "bg-accent-primary border-accent-primary"
                      : "border-border-primary"
                  }`}
                >
                  {rememberMe && (
                    <CheckCircle2 size={12} className="text-white" />
                  )}
                </div>
                Manter conectado
              </button>

              <a
                href="#"
                className="text-[10px] font-bold text-accent-secondary hover:text-accent-primary transition-colors uppercase tracking-widest"
              >
                Esqueceu a senha?
              </a>
            </div>

            {/* BYOK Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  setUseByok(!useByok)}
                className="flex items-center gap-2 text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    useByok
                      ? "bg-accent-primary border-accent-primary"
                      : "border-border-primary"
                  }`}
                >
                  {useByok && <CheckCircle2 size={12} className="text-white" />}
                </div>
                Usar Chave Própria (BYOK)
              </button>
            </div>

            {/* BYOK Expanded Content */}
            <AnimatePresence>
              {useByok && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 p-4 rounded-2xl bg-surface-secondary/50 border border-border-primary mt-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-widest">
                        Provider de IA
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {providers.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setByokProvider(p.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-[10px] font-bold transition-all ${
                              byokProvider === p.id
                                ? "border-accent-primary bg-accent-muted text-accent-secondary"
                                : "border-border-primary bg-surface-primary text-secondary hover:border-border-accent"
                            }`}
                          >
                            <p.icon size={14} />
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-widest">
                        API Key
                      </label>
                      <div className="relative">
                        <Key
                          className="absolute left-3 top-2.5 text-secondary"
                          size={14}
                        />
                        <input
                          type="password"
                          value={byokKey}
                          onChange={(e) => setByokKey(e.target.value)}
                          className="w-full bg-main border border-border-primary rounded-xl px-9 py-2 text-xs focus:outline-none focus:border-accent-primary transition-all text-primary font-mono"
                          placeholder="sk-..."
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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

          {/* Social Login - Reposicionado para o final do card */}
          <div className="relative my-8 flex items-center">
            <div className="flex-grow border-t border-border-secondary"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-muted uppercase tracking-widest text-center">
              Ou continue com
            </span>
            <div className="flex-grow border-t border-border-secondary"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-xl border border-border-primary bg-surface-primary hover:bg-surface-tertiary transition-all flex items-center justify-center gap-3 text-sm font-bold text-primary group"
          >
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-3.3 3.28-8.18 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google OAuth
          </button>

          <div className="mt-8 pt-8 border-t border-border-secondary flex justify-center gap-6 text-xs text-muted text-center">
            <a href="#sign-up" className="hover:text-primary transition-colors">
              Solicitar acesso
            </a>
            <span className="text-border-secondary">|</span>
            <a href="#landing" className="hover:text-primary transition-colors">
              Kubex Cloud
            </a>
          </div>
        </Card>

        <p className="text-center text-[11px] text-muted tracking-[0.1em] uppercase">
          Powered by{" "}
          <span className="text-primary font-bold">KUBEX Ecosystem</span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
