import {
  getMockWorkspaceSettings,
  resetMockWorkspaceSettings,
  saveMockWorkspaceSettings,
  waitMock,
} from '@/mocks';
import type { WorkspaceSettingsData } from '../types';

export const workspaceService = {
  async getSettings(): Promise<WorkspaceSettingsData> {
    await waitMock(500);
    return getMockWorkspaceSettings();
  },

  async saveSettings(data: WorkspaceSettingsData): Promise<WorkspaceSettingsData> {
    await waitMock(800);
    saveMockWorkspaceSettings(data);
    return data;
  },

  async resetSettings(): Promise<WorkspaceSettingsData> {
    await waitMock(300);
    return resetMockWorkspaceSettings();
  },
};
