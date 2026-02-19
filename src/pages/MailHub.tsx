import React, { useState } from 'react';
import { Mail, Search, MessageSquare, Star, Tag, Clock, Send, ChevronRight, Inbox, Sparkles, Filter } from 'lucide-react';
import Card from '../components/ui/Card';

// Type definition
type EmailMock = {
  id: number;
  sender: string;
  subject: string;
  excerpt: string;
  aiLabel: 'Vendas' | 'Suporte' | 'Faturamento' | 'Urgente' | 'Informação';
  aiSummary: string;
  timestamp: string;
  isRead: boolean;
  isStarred?: boolean;
};

// Mocks
const mockEmails: EmailMock[] = [
  {
    id: 1,
    sender: 'Sankhya ERP Notification',
    subject: 'Faturamento de Pedido 45293',
    excerpt: 'O pedido de compra 45293 foi faturado e enviado para a transportadora selecionada.',
    aiLabel: 'Faturamento',
    aiSummary: 'Confirmação de faturamento do pedido 45293. Status enviado para logística.',
    timestamp: '14:20',
    isRead: false,
    isStarred: true,
  },
  {
    id: 2,
    sender: 'Carlos Alberto (Bellube)',
    subject: 'Proposta para novo cliente varejo',
    excerpt: 'Segue em anexo a proposta para o cliente varejo que visitamos ontem na unidade de Guarulhos.',
    aiLabel: 'Vendas',
    aiSummary: 'Proposta comercial para novo cliente do varejo (Unidade Guarulhos). Anexo incluído.',
    timestamp: '13:05',
    isRead: true,
  },
  {
    id: 3,
    sender: 'Suporte Técnico GCP',
    subject: 'Manutenção programada na região South1-a',
    excerpt: 'Prezado cliente, realizaremos uma manutenção preventiva em nossos servidores na região mencionada.',
    aiLabel: 'Urgente',
    aiSummary: 'Manutenção preventiva programada na região South1-a (GCP). Potencial impacto em infra.',
    timestamp: 'Ontem',
    isRead: false,
  },
  {
    id: 4,
    sender: 'RH Interno',
    subject: 'Atualização de políticas de home office',
    excerpt: 'Olá time, estamos atualizando as diretrizes de trabalho remoto para o próximo trimestre.',
    aiLabel: 'Informação',
    aiSummary: 'Comunicado interno sobre atualização das políticas de home office para o Q2/2026.',
    timestamp: 'Ontem',
    isRead: true,
  },
  {
    id: 5,
    sender: 'João Silva (Suporte)',
    subject: 'Ticket #4521 - Erro na integração ERP',
    excerpt: 'Estou com dificuldades para sincronizar os dados do banco MySQL legado com o novo gateway.',
    aiLabel: 'Suporte',
    aiSummary: 'Incidente técnico reportado: Erro na sincronização MySQL Legacy com Gateway GNyx.',
    timestamp: 'Ontem',
    isRead: true,
  }
];

const labelColors: Record<EmailMock['aiLabel'], string> = {
  'Vendas': 'text-accent-secondary border-accent-primary/30 bg-accent-muted',
  'Suporte': 'text-status-info border-status-info/30 bg-status-info/10',
  'Faturamento': 'text-status-success border-status-success/30 bg-status-success/10',
  'Urgente': 'text-status-error border-status-error/30 bg-status-error/10',
  'Informação': 'text-status-warning border-status-warning/30 bg-status-warning/10',
};

const MailHub: React.FC = () => {
  const [emails, setEmails] = useState<EmailMock[]>(mockEmails);
  const [selectedEmail, setSelectedEmail] = useState<EmailMock | null>(mockEmails[0]);

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] animate-fade-in">
      <header className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent-primary uppercase tracking-[0.4em] text-xs font-bold">
            <Mail size={16} /> Hub de Comunicação
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Intelligent Mail Hub</h2>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar em GNyx Mail..." 
              className="w-full bg-surface-primary border border-border-primary rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-accent-primary transition-all text-primary"
            />
          </div>
          <button className="p-2.5 rounded-xl border border-border-primary bg-surface-primary hover:bg-surface-tertiary transition-all text-secondary">
            <Filter size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Inbox List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-surface-tertiary">
          {emails.map((email) => (
            <button
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`p-4 rounded-2xl border transition-all text-left group ${
                selectedEmail?.id === email.id 
                  ? 'bg-accent-muted border-accent-primary/50 shadow-lg' 
                  : 'bg-surface-primary/40 border-border-primary/50 hover:bg-surface-primary hover:border-border-accent'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${labelColors[email.aiLabel]}`}>
                  {email.aiLabel}
                </span>
                <span className="text-[10px] text-muted font-medium">{email.timestamp}</span>
              </div>
              <h4 className={`text-sm font-bold mb-1 truncate ${email.isRead ? 'text-secondary' : 'text-primary'}`}>
                {email.sender}
              </h4>
              <p className={`text-xs mb-2 truncate ${email.isRead ? 'text-muted' : 'text-secondary'}`}>
                {email.subject}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {!email.isRead && <div className="w-2 h-2 rounded-full bg-accent-primary" />}
                  {email.isStarred && <Star className="text-status-warning fill-current" size={14} />}
                </div>
                <ChevronRight className={`text-muted transition-transform group-hover:translate-x-1 ${selectedEmail?.id === email.id ? 'translate-x-1' : ''}`} size={14} />
              </div>
            </button>
          ))}
        </div>

        {/* Content Viewer */}
        <div className="hidden lg:flex flex-1 flex-col h-full overflow-hidden rounded-3xl border border-border-primary bg-surface-primary/20 backdrop-blur-xl">
          {selectedEmail ? (
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
                    <h5 className="text-xs font-bold uppercase tracking-[0.3em] text-accent-secondary">GNyx IA Summary</h5>
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
                      <h3 className="text-xl font-bold text-primary">{selectedEmail.sender}</h3>
                      <p className="text-xs text-muted">{selectedEmail.subject}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-secondary">
                    <button className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors border border-border-primary/50"><Star size={18} /></button>
                    <button className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors border border-border-primary/50"><Tag size={18} /></button>
                    <button className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors border border-border-primary/50"><MessageSquare size={18} /></button>
                  </div>
                </div>

                <div className="text-secondary leading-relaxed space-y-4">
                  <p className="text-sm uppercase tracking-widest text-muted border-l-2 border-accent-primary pl-4 py-1">Message Body</p>
                  <p className="text-primary">{selectedEmail.excerpt}</p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
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
                  <button className="px-5 py-2 rounded-xl border border-border-primary text-secondary text-sm font-semibold hover:bg-surface-tertiary transition-all">Encaminhar</button>
                  <button className="px-5 py-2 rounded-xl bg-accent-primary text-white text-sm font-semibold hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-accent-primary/20">
                    Responder <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted space-y-4">
              <Inbox size={64} className="opacity-10" />
              <p className="uppercase tracking-[0.4em] text-xs font-bold">Selecione uma mensagem</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MailHub;
