export type MailLabel = 'Vendas' | 'Suporte' | 'Faturamento' | 'Urgente' | 'Informacao';

export interface MailMockItem {
  id: number;
  sender: string;
  subject: string;
  excerpt: string;
  aiLabel: MailLabel;
  aiSummary: string;
  timestamp: string;
  isRead: boolean;
  isStarred?: boolean;
}

export const mockEmails: MailMockItem[] = [
  {
    id: 1,
    sender: 'Sankhya ERP Notification',
    subject: 'Faturamento de Pedido 45293',
    excerpt: 'O pedido de compra 45293 foi faturado e enviado para a transportadora selecionada.',
    aiLabel: 'Faturamento',
    aiSummary: 'Confirmacao de faturamento do pedido 45293. Status enviado para logistica.',
    timestamp: '14:20',
    isRead: false,
    isStarred: true,
  },
  {
    id: 2,
    sender: 'Carlos Alberto (Some Partner Inc)',
    subject: 'Proposta para novo cliente varejo',
    excerpt: 'Segue em anexo a proposta para o cliente varejo que visitamos ontem na unidade de Guarulhos.',
    aiLabel: 'Vendas',
    aiSummary: 'Proposta comercial para novo cliente do varejo (Unidade Guarulhos). Anexo incluido.',
    timestamp: '13:05',
    isRead: true,
  },
  {
    id: 3,
    sender: 'Suporte Tecnico GCP',
    subject: 'Manutencao programada na regiao South1-a',
    excerpt: 'Prezado cliente, realizaremos uma manutencao preventiva em nossos servidores na regiao mencionada.',
    aiLabel: 'Urgente',
    aiSummary: 'Manutencao preventiva programada na regiao South1-a (GCP). Potencial impacto em infra.',
    timestamp: 'Ontem',
    isRead: false,
  },
  {
    id: 4,
    sender: 'RH Interno',
    subject: 'Atualizacao de politicas de home office',
    excerpt: 'Ola time, estamos atualizando as diretrizes de trabalho remoto para o proximo trimestre.',
    aiLabel: 'Informacao',
    aiSummary: 'Comunicado interno sobre atualizacao das politicas de home office para o Q2/2026.',
    timestamp: 'Ontem',
    isRead: true,
  },
  {
    id: 5,
    sender: 'Joao Silva (Suporte)',
    subject: 'Ticket #4521 - Erro na integracao ERP',
    excerpt: 'Estou com dificuldades para sincronizar os dados do banco MySQL legado com o novo gateway.',
    aiLabel: 'Suporte',
    aiSummary: 'Incidente tecnico reportado: Erro na sincronizacao MySQL Legacy com Gateway GNyx.',
    timestamp: 'Ontem',
    isRead: true,
  },
];

export const mailLabelColors: Record<MailLabel, string> = {
  Vendas: 'text-accent-secondary border-accent-primary/30 bg-accent-muted',
  Suporte: 'text-status-info border-status-info/30 bg-status-info/10',
  Faturamento: 'text-status-success border-status-success/30 bg-status-success/10',
  Urgente: 'text-status-error border-status-error/30 bg-status-error/10',
  Informacao: 'text-status-warning border-status-warning/30 bg-status-warning/10',
};
