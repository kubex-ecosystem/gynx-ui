import {
  getMockWorkspaceSettings,
  resetMockWorkspaceSettings,
  saveMockWorkspaceSettings,
  waitMock,
} from "@/mocks";
import type { WorkspaceSettingsData } from "../types";

export interface WorkspaceScope {
  tenantId?: string | null;
  tenantName?: string | null;
}

const applyWorkspaceScope = (
  data: WorkspaceSettingsData,
  scope?: WorkspaceScope,
): WorkspaceSettingsData => ({
  ...data,
  tenantId: scope?.tenantId || data.tenantId,
  tenantName: scope?.tenantName || data.tenantName,
});

export const workspaceService = {
  async getSettings(scope?: WorkspaceScope): Promise<WorkspaceSettingsData> {
    await waitMock(500);
    return applyWorkspaceScope(getMockWorkspaceSettings(), scope);
  },

  async saveSettings(
    data: WorkspaceSettingsData,
    scope?: WorkspaceScope,
  ): Promise<WorkspaceSettingsData> {
    await waitMock(800);
    const scopedData = applyWorkspaceScope(data, scope);
    saveMockWorkspaceSettings(scopedData);
    return scopedData;
  },

  async resetSettings(scope?: WorkspaceScope): Promise<WorkspaceSettingsData> {
    await waitMock(300);
    return applyWorkspaceScope(resetMockWorkspaceSettings(), scope);
  },
};
