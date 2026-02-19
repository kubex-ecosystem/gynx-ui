import React, { useState } from 'react';
import { Box, Key, Lock, Mail, Server } from 'lucide-react';
import Card from '../components/ui/Card';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [byok, setByok] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in with:', { email, password, byok });
    // Mock login redirect
    window.location.hash = '#gateway-dashboard';
  };

  return (
    <div className="min-h-screen bg-main text-primary flex items-center justify-center px-4 relative">
      <div className="fixed inset-0 bg-vignette -z-10" />
      <div className="fixed inset-0 bg-grid -z-20 opacity-20" />
      
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent-primary flex items-center justify-center shadow-xl shadow-accent-primary/20 rotate-3">
              <Box className="text-white" size={36} />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Entrar na GNyx</h1>
          <p className="text-secondary text-sm">Acesse o Workspace Bellube para gerenciar sua infraestrutura IA.</p>
        </div>

        <Card className="bg-surface-primary/80 backdrop-blur-xl border-border-primary/50 shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-[0.3em]">Email Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-secondary" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-secondary border border-border-primary rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-accent-primary transition-all text-primary"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-[0.3em]">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-secondary" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-secondary border border-border-primary rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-accent-primary transition-all text-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted uppercase tracking-[0.3em]">IA Provider (BYOK)</label>
                <span className="text-[10px] text-accent-secondary bg-accent-muted px-2 py-0.5 rounded-full font-bold">OPCIONAL</span>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-3 text-secondary" size={18} />
                <input
                  type="password"
                  value={byok}
                  onChange={(e) => setByok(e.target.value)}
                  className="w-full bg-surface-secondary border border-border-primary rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-accent-primary transition-all text-primary"
                  placeholder="sk-... or AIza..."
                />
              </div>
              <p className="text-[10px] text-muted italic">Sua chave é usada apenas na sessão e nunca persistida no servidor.</p>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-accent-primary text-white font-bold text-lg shadow-lg shadow-accent-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              Iniciar Sessão <Server size={20} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border-secondary flex justify-center gap-6 text-xs text-muted">
            <a href="#" className="hover:text-primary transition-colors">Esqueceu a senha?</a>
            <span className="text-border-secondary">|</span>
            <a href="#" className="hover:text-primary transition-colors">Solicitar acesso</a>
          </div>
        </Card>

        <p className="text-center text-[11px] text-muted tracking-[0.1em] uppercase">
          Powered by <span className="text-primary font-bold">KUBEX Ecosystem</span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
