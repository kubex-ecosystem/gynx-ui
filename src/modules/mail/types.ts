export type MailLabel =
  | 'Vendas'
  | 'Suporte'
  | 'Faturamento'
  | 'Urgente'
  | 'Informacao';

export interface MailMessage {
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
