export interface WorkspaceFormData {
  tenantName: string;
  tenantId: string;
  billingPlan: string;
  region: string;
  dataRetention: string;
}

const WORKSPACE_STORAGE_KEY = 'gnyx.mock.workspace.settings';

export const defaultWorkspaceFormData: WorkspaceFormData = {
  tenantName: 'GNyx Demo Corp',
  tenantId: 'tenant_demo_123',
  billingPlan: 'Enterprise API',
  region: 'South America (sa-east-1)',
  dataRetention: '90 dias',
};

export const getMockWorkspaceSettings = (): WorkspaceFormData => {
  if (typeof window === 'undefined') {
    return defaultWorkspaceFormData;
  }

  const stored = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
  if (!stored) {
    return defaultWorkspaceFormData;
  }

  try {
    return {
      ...defaultWorkspaceFormData,
      ...(JSON.parse(stored) as Partial<WorkspaceFormData>),
    };
  } catch {
    return defaultWorkspaceFormData;
  }
};

export const saveMockWorkspaceSettings = (data: WorkspaceFormData): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(data));
};

export const resetMockWorkspaceSettings = (): WorkspaceFormData => {
  saveMockWorkspaceSettings(defaultWorkspaceFormData);
  return defaultWorkspaceFormData;
};
