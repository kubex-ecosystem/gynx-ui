import { unifiedAIService } from "@/services/unifiedAIService";

export const providersSettingsService = {
  async testProvider(providerId: string): Promise<{ available: boolean; message: string }> {
    return unifiedAIService.testProvider(providerId);
  },
};
