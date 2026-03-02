import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Box,
  Building,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { AcceptInviteReq, InviteDTO } from "@/types";
import { validateInviteToken, acceptInvite } from "@/services/inviteService";

const AcceptInvite: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [invite, setInvite] = useState<InviteDTO | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<AcceptInviteReq>({
    name: "",
    last_name: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Simular extração de token da URL (ex: #accept-invite?token=xyz)
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.split("?")[1]);
    const tokenParam = urlParams.get("token");
    setToken(tokenParam);

    if (tokenParam) {
      validateToken(tokenParam);
    } else {
      setIsValidating(false);
      setError("Token de convite não encontrado.");
    }
  }, []);

  const validateToken = async (t: string) => {
    setIsValidating(true);
    try {
      const inviteData = await validateInviteToken(t);
      setInvite(inviteData);
      setFormData((prev) => ({ ...prev, name: inviteData.name || "" }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (!token) throw new Error("Chave de convite ausente.");

      await acceptInvite(token, formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao processar seu cadastro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-main flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-accent-primary" size={48} />
        <p className="text-muted uppercase tracking-widest text-xs font-bold">
          Validando seu convite...
        </p>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 border-status-error/30 bg-status-error/5 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-status-error/10 flex items-center justify-center mx-auto">
            <AlertCircle className="text-status-error" size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary">
              Ops! Algo deu errado.
            </h2>
            <p className="text-secondary text-sm">{error}</p>
          </div>
          <button
            onClick={() => window.location.hash = "#landing"}
            className="w-full py-3 rounded-xl bg-surface-tertiary text-primary font-bold hover:bg-surface-tertiary/80 transition-all"
          >
            Voltar para o Início
          </button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 text-center space-y-6 border-status-success/30 bg-status-success/5">
            <div className="w-20 h-20 rounded-3xl bg-status-success/10 flex items-center justify-center mx-auto border border-status-success/20">
              <CheckCircle2 className="text-status-success" size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-primary">
                Bem-vindo à GNyx!
              </h2>
              <p className="text-secondary text-sm">
                Seu cadastro foi concluído com sucesso no ecossistema Bellube.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-primary/50 border border-border-primary text-left flex items-start gap-3">
              <Mail className="text-accent-secondary shrink-0" size={20} />
              <div>
                <p className="text-xs font-bold text-primary">
                  E-mail de confirmação enviado
                </p>
                <p className="text-[10px] text-muted">
                  Enviamos os detalhes do seu acesso para{" "}
                  <strong>{invite?.email}</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.hash = "#auth"}
              className="w-full py-4 rounded-xl bg-accent-primary text-white font-bold text-lg shadow-lg shadow-accent-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              Ir para o Login <ArrowRight size={20} />
            </button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main text-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="fixed inset-0 bg-vignette -z-10" />
      <div className="fixed inset-0 bg-grid -z-20 opacity-20" />

      <div className="w-full max-w-lg space-y-8 animate-fade-in relative z-10">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent-primary flex items-center justify-center shadow-xl shadow-accent-primary/20 rotate-3">
              <Box className="text-white" size={36} />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Finalizar Cadastro
          </h1>
          <p className="text-secondary text-sm">
            Você foi convidado para participar da organização GNyx.
          </p>
        </div>

        <Card className="bg-surface-primary/80 backdrop-blur-xl border-border-primary/50 shadow-2xl p-8 space-y-8">
          {/* Invite Info Header */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-accent-muted/20 border border-accent-primary/20">
            <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center text-accent-secondary border border-accent-primary/30">
              <Building size={24} />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-bold text-accent-secondary uppercase tracking-[0.2em]">
                Organização
              </p>
              <p className="text-sm font-bold text-primary">
                {invite?.tenant_id.replace("tenant_", "").toUpperCase()}
              </p>
              <p className="text-xs text-muted">
                Acesso como:{" "}
                <span className="text-accent-secondary font-mono">
                  {invite?.role}
                </span>
              </p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-[0.2em]">
                  Nome
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-3 text-secondary"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-secondary border border-border-primary rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-accent-primary transition-all text-primary"
                    placeholder="Nome"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-[0.2em]">
                  Sobrenome
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-3 text-secondary"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full bg-surface-secondary border border-border-primary rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-accent-primary transition-all text-primary"
                    placeholder="Sobrenome"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-[0.2em]">
                E-mail (Identificado)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-muted" size={18} />
                <input
                  title="O e-mail associado a este convite não pode ser alterado."
                  type="email"
                  value={invite?.email}
                  readOnly
                  className="w-full bg-main border border-border-primary rounded-xl px-10 py-3 text-sm text-muted cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-[0.2em]">
                Defina sua Senha
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-secondary"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-surface-secondary border border-border-primary rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-accent-primary transition-all text-primary"
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                <button
                  type="button"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  className="absolute right-3 top-3 text-secondary hover:text-primary transition-colors cursor-pointer select-none"
                >
                  {showPassword
                    ? <EyeOff size={18} className="opacity-80" />
                    : <Eye size={18} className="opacity-80" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-secondary/30 border border-border-primary flex items-start gap-3">
              <ShieldCheck className="text-status-success shrink-0" size={18} />
              <p className="text-[10px] text-secondary leading-relaxed italic">
                Ao clicar em finalizar, você concorda com os termos de uso e
                política de privacidade da Kubex Cloud para a infraestrutura
                GNyx.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-accent-primary text-white font-bold text-lg shadow-lg shadow-accent-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting
                ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />{" "}
                    Processando...
                  </>
                )
                : (
                  <>
                    Finalizar Cadastro <CheckCircle2 size={20} />
                  </>
                )}
            </button>
          </form>
        </Card>

        <p className="text-center text-[11px] text-muted tracking-[0.1em] uppercase">
          Powered by{" "}
          <span className="text-primary font-bold">KUBEX Ecosystem</span>
        </p>
      </div>
    </div>
  );
};

export default AcceptInvite;
