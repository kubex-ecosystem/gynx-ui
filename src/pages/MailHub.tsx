import {
  AlertCircle,
  ChevronRight,
  Clock,
  Filter,
  Inbox,
  LoaderCircle,
  Mail,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import React from "react";
import { mailLabelColors } from "@/mocks";
import { useMailHub } from "@/modules/mail/hooks/useMailHub";

const MailHub: React.FC = () => {
  const {
    emails,
    totalEmails,
    searchTerm,
    selectedEmail,
    isLoading,
    error,
    setSearchTerm,
    selectEmail,
    toggleStar,
    retry,
  } = useMailHub();

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] animate-fade-in">
      <header className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent-primary uppercase tracking-[0.4em] text-xs font-bold">
            <Mail size={16} /> Hub de Comunicação
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Intelligent Mail Hub
          </h2>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 text-muted" size={16} />
            <input
              type="text"
              placeholder="Pesquisar em GNyx Mail..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-surface-primary border border-border-primary rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-accent-primary transition-all text-primary"
            />
          </div>
          <button
            title="Filtros de busca"
            className="p-2.5 rounded-xl border border-border-primary bg-surface-primary hover:bg-surface-tertiary transition-all text-secondary"
          >
            <Filter size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Inbox List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-surface-tertiary">
          {isLoading && (
            <div className="rounded-3xl border border-border-primary bg-surface-primary/30 p-6 flex items-center gap-3 text-secondary">
              <LoaderCircle size={18} className="animate-spin" />
              <div>
                <p className="text-sm font-semibold text-primary">Carregando caixa de entrada</p>
                <p className="text-xs text-muted">Buscando mensagens do workspace atual.</p>
              </div>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-3xl border border-status-error/30 bg-status-error/5 p-6 space-y-4">
              <div className="flex items-start gap-3 text-status-error">
                <AlertCircle size={18} className="mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Falha ao carregar mensagens</p>
                  <p className="text-xs text-secondary">{error}</p>
                </div>
              </div>
              <button
                onClick={() => void retry()}
                className="px-4 py-2 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-sm font-semibold hover:bg-status-error/15 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!isLoading && !error && emails.length === 0 && (
            <div className="rounded-3xl border border-border-primary bg-surface-primary/20 p-6 text-center space-y-3">
              <Inbox size={36} className="mx-auto text-muted opacity-60" />
              <div>
                <p className="text-sm font-semibold text-primary">Nenhuma mensagem encontrada</p>
                <p className="text-xs text-secondary">
                  Ajuste a busca. O workspace possui {totalEmails} mensagens disponiveis no mock atual.
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && emails.map((email) => (
            <button
              key={email.id}
              onClick={() => selectEmail(email.id)}
              className={`p-4 rounded-2xl border transition-all text-left group ${
                selectedEmail?.id === email.id
                  ? "bg-accent-muted border-accent-primary/50 shadow-lg"
                  : "bg-surface-primary/40 border-border-primary/50 hover:bg-surface-primary hover:border-border-accent"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                    mailLabelColors[email.aiLabel]
                  }`}
                >
                  {email.aiLabel}
                </span>
                <span className="text-[10px] text-muted font-medium">
                  {email.timestamp}
                </span>
              </div>
              <h4
                className={`text-sm font-bold mb-1 truncate ${
                  email.isRead ? "text-secondary" : "text-primary"
                }`}
              >
                {email.sender}
              </h4>
              <p
                className={`text-xs mb-2 truncate ${
                  email.isRead ? "text-muted" : "text-secondary"
                }`}
              >
                {email.subject}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {!email.isRead && (
                    <div className="w-2 h-2 rounded-full bg-accent-primary" />
                  )}
                  {email.isStarred && (
                    <Star
                      className="text-status-warning fill-current"
                      size={14}
                    />
                  )}
                </div>
                <ChevronRight
                  className={`text-muted transition-transform group-hover:translate-x-1 ${
                    selectedEmail?.id === email.id ? "translate-x-1" : ""
                  }`}
                  size={14}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Content Viewer */}
        <div className="hidden lg:flex flex-1 flex-col h-full overflow-hidden rounded-3xl border border-border-primary bg-surface-primary/20 backdrop-blur-xl">
          {selectedEmail
            ? (
              <div className="flex flex-col h-full overflow-y-auto">
                {/* AI Summary Banner */}
                <div className="p-6 bg-accent-muted/30 border-b border-accent-primary/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                    <Sparkles size={80} className="text-accent-primary" />
                  </div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="p-3 rounded-2xl bg-accent-primary/20 text-accent-secondary border border-accent-primary/30">
                      <Sparkles size={20} />
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-[0.3em] text-accent-secondary">
                        GNyx IA Summary
                      </h5>
                      <p className="text-sm text-primary font-medium leading-relaxed italic">
                        "{selectedEmail.aiSummary}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email Content Body */}
                <div className="flex-1 p-8 space-y-8">
                  <div className="flex items-center justify-between border-b border-border-secondary pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-surface-tertiary flex items-center justify-center text-accent-secondary font-bold text-lg border border-border-primary shadow-inner">
                        {selectedEmail.sender[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-primary">
                          {selectedEmail.sender}
                        </h3>
                        <p className="text-xs text-muted">
                          {selectedEmail.subject}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 text-secondary">
                      <button
                        title="Favoritar"
                        onClick={() => toggleStar(selectedEmail.id)}
                        className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors border border-border-primary/50"
                      >
                        <Star
                          size={18}
                          className={selectedEmail.isStarred ? "text-status-warning fill-current" : undefined}
                        />
                      </button>
                      <button
                        title="Etiquetar"
                        className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors border border-border-primary/50"
                      >
                        <Tag size={18} />
                      </button>
                      <button
                        title="Responder"
                        className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors border border-border-primary/50"
                      >
                        <MessageSquare size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="text-secondary leading-relaxed space-y-4">
                    <p className="text-sm uppercase tracking-widest text-muted border-l-2 border-accent-primary pl-4 py-1">
                      Message Body
                    </p>
                    <p className="text-primary">{selectedEmail.excerpt}</p>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                      ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p>
                      Atenciosamente,<br />
                      <strong>{selectedEmail.sender}</strong>
                    </p>
                  </div>
                </div>

                <div className="p-6 border-t border-border-secondary bg-surface-primary/40 mt-auto flex justify-between items-center">
                  <div className="flex gap-2">
                    <span className="text-[10px] text-muted uppercase tracking-[0.2em] flex items-center gap-1">
                      <Clock size={12} /> Recebido em {selectedEmail.timestamp}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-5 py-2 rounded-xl border border-border-primary text-secondary text-sm font-semibold hover:bg-surface-tertiary transition-all">
                      Encaminhar
                    </button>
                    <button className="px-5 py-2 rounded-xl bg-accent-primary text-white text-sm font-semibold hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-accent-primary/20">
                      Responder <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
            : (
              <div className="flex flex-col items-center justify-center h-full text-muted space-y-4">
                <Inbox size={64} className="opacity-10" />
                <p className="uppercase tracking-[0.4em] text-xs font-bold">
                  {isLoading ? "Carregando mensagens" : "Selecione uma mensagem"}
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MailHub;
