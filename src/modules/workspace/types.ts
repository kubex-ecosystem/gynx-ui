export interface WorkspaceSettingsData {
  tenantName: string;
  tenantId: string;
  billingPlan: string;
  region: string;
  dataRetention: string;
}

export interface WorkspaceStatusMessage {
  tone: 'success' | 'error' | 'info';
  message: string;
}
