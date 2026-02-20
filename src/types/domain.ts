export type Theme = 'light' | 'dark';
export type Language = 'en' | 'pt';

export interface Idea {
  id: string;
  text: string;
  timestamp?: Date;
}

export interface GNyxDataTable {
  id?: string;
  name: string;
  schema: {
    columnCount: number;
    columns: Array<{ originalName: string; type: 'text' | 'number' | 'date' | 'mixed' }>;
  };
  headers: string[];
  rows: Record<string, any>[];
  sourceType: 'csv_upload' | 'go_integration' | 'mock';
}

// Invite System Interfaces
export interface InviteDTO {
  id: string;
  name?: string;
  token?: string;
  email: string;
  role: string;
  tenant_id: string;
  team_id?: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  expires_at: string;
  type?: 'internal' | 'partner';
}

export interface AcceptInviteReq {
  name?: string;
  last_name?: string;
  password?: string;
}

export interface AcceptResult {
  user_id: string;
  tenant_id: string;
  membership: string;
}

export interface AnalysisResult {
  table: {
    headers: string[];
    rows: any[][];
  };
  chart: {
    type: 'bar_chart' | 'line_chart' | 'pie_chart' | 'area_chart' | 'count' | null;
    data: any | null;
  };
}

export interface HistoryItem {
  id: string;
  prompt: string;
  purpose: string;
  ideas: Idea[];
  timestamp: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface Draft {
  ideas: Idea[];
  purpose: string;
}
