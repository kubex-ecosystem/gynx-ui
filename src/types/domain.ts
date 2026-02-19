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
