import { ArrowRight, Box, Globe, Shield, Zap } from "lucide-react";
import React from "react";

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-main text-primary font-sans overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 bg-vignette -z-10" />
      <div className="fixed inset-0 bg-grid -z-20 opacity-30" />

      {/* Navigation (Simple) */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center shadow-lg shadow-accent-primary/20">
            <Box className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">
            GNyx <span className="text-accent-primary">UI</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary">
          <a href="#features" className="hover:text-primary transition-colors">
            Features
          </a>
          <a href="#ecosystem" className="hover:text-primary transition-colors">
            Ecosystem
          </a>
          <a href="#about" className="hover:text-primary transition-colors">
            About
          </a>
        </div>
        <button
          onClick={() => window.location.hash = "#auth"}
          className="px-5 py-2 rounded-full border border-border-primary bg-surface-primary hover:bg-surface-tertiary transition-all text-sm font-semibold"
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative z-10">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-muted border border-accent-primary/30 text-accent-secondary text-xs font-bold uppercase tracking-widest animate-pulse">
            <Zap size={14} /> Nova Era da Engenharia
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            O Futuro da Operação <br />
            <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
              Kubex Ecosystem
            </span>
          </h1>

          <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
            Uma plataforma de governança, criação e entrega automatizada. Evolua
            sistemas reais com ferramentas explícitas e inteligência assistida.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => window.location.hash = "#auth"}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-accent-primary text-white font-bold text-lg shadow-lg shadow-accent-primary/20 hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              Acessar Plataforma <ArrowRight size={20} />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl border border-border-primary bg-surface-primary/50 text-primary font-bold text-lg hover:bg-surface-tertiary transition-all">
              Documentação
            </button>
          </div>
        </div>

        {/* Floating Features Mocks */}
        <div className="grid md:grid-cols-3 gap-6 mt-32">
          <div className="p-8 rounded-2xl border border-border-primary bg-surface-primary/40 backdrop-blur-xl hover:border-border-accent transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-surface-tertiary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="text-accent-secondary" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Governança</h3>
            <p className="text-secondary text-sm leading-relaxed">
              Controle total sobre provedores, custos e permissões em um único
              dashboard unificado.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-border-primary bg-surface-primary/40 backdrop-blur-xl hover:border-border-accent transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-surface-tertiary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="text-accent-secondary" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Produtividade</h3>
            <p className="text-secondary text-sm leading-relaxed">
              Geração de código e automação de processos repetitivos com
              precisão arquitetural.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-border-primary bg-surface-primary/40 backdrop-blur-xl hover:border-border-accent transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-surface-tertiary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Globe className="text-accent-secondary" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Agnóstico</h3>
            <p className="text-secondary text-sm leading-relaxed">
              Conecte-se a qualquer provedor de IA ou banco de dados através de
              interfaces universais.
            </p>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-border-primary/30 mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-muted text-sm uppercase tracking-widest">
          <p>© 2026 Kubex Ecosystem. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
