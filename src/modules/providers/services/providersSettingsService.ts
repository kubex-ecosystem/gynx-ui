import { unifiedAIService } from "@/services/unifiedAIService";

export const providersSettingsService = {
  async testProvider(providerId: string): Promise<boolean> {
    const result = await unifiedAIService.testProvider(providerId);
    return result.available;
  },
};
