export interface BICatalogDatasetStatus {
  dataset_name: string;
  table_name: string;
  status: string;
  row_count: number;
  last_loaded_at?: string;
}

export interface BICatalogStatus {
  source_system: string;
  domain: string;
  schema_name: string;
  available: boolean;
  total_datasets: number;
  ready_datasets: number;
  empty_datasets: number;
  failed_datasets: number;
  last_loaded_at?: string;
  datasets: BICatalogDatasetStatus[];
  sync_command_example: string;
  message: string;
}

export interface BIWidgetDisplayColumn {
  key: string;
  header: string;
  align?: string;
  sortable?: boolean;
}

export interface BIWidget {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  metric_goal?: string;
  size: { cols: number; rows: number };
  data_source: {
    main_table: string;
    sql: string;
    expected_granularity: string;
  };
  display?: {
    color?: string;
    unit?: string;
    columns?: BIWidgetDisplayColumn[];
  };
}

export interface BoardPlan {
  board_title: string;
  board_description?: string;
  business_goal?: string;
  domain: string;
  widgets: BIWidget[];
  assumptions?: string[];
  warnings?: string[];
}

export interface DashboardSchemaWidget {
  id: string;
  type: string;
  size: { cols: number; rows: number };
  config: {
    title?: string;
    subtitle?: string;
    sqlQuery?: string;
    unit?: string;
  };
}

export interface DashboardSchema {
  dashboardId: string;
  title: string;
  description?: string;
  widgets: DashboardSchemaWidget[];
}

export interface BIUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  estimated_cost?: number;
  latency_ms?: number;
}

export interface GenerateBoardRequest {
  prompt: string;
  domain: "sales";
  provider?: string;
  model?: string;
  max_widgets?: number;
}

export interface GenerateBoardResponse {
  domain: string;
  provider: string;
  model: string;
  usage?: BIUsage;
  attempts?: Array<{
    provider: string;
    model: string;
    class: string;
    message: string;
  }>;
  generation_mode: "llm" | "llm_recovered" | "fallback_template";
  fallback_reason?: string;
  grounding_context?: Record<string, unknown>;
  plan: BoardPlan;
  dashboard_schema: DashboardSchema;
  raw_provider_json?: string;
}

export interface ExportBoardBundleRequest {
  prompt: string;
  domain: string;
  provider: string;
  model: string;
  generation_mode: string;
  fallback_reason?: string;
  usage?: BIUsage;
  grounding_context?: Record<string, unknown>;
  plan: BoardPlan;
  dashboard_schema: DashboardSchema;
}
