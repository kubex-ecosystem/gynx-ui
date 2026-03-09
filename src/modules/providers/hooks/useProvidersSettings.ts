import { useCallback, useEffect, useMemo, useState } from "react";
import { PROVIDERS_META } from "../constants";
import { providersSettingsService } from "../services/providersSettingsService";
import type { ProviderCardState } from "../types";
import { useProvidersStore } from "@/store/useProvidersStore";

const buildLocalKeysSnapshot = (
  getDecryptedKey: (providerId: string) => string,
): Record<string, string> =>
  Object.fromEntries(
    PROVIDERS_META.map((provider) => [provider.id, getDecryptedKey(provider.id)]),
  );

export const useProvidersSettings = () => {
  const {
    status,
    globalDefault,
    expertMode,
    toolPreferences,
    setKey,
    removeKey,
    setStatus,
    setGlobalDefault,
    setExpertMode,
    setToolPreference,
    getDecryptedKey,
  } = useProvidersStore();

  const [localKeys, setLocalKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLocalKeys(buildLocalKeysSnapshot(getDecryptedKey));
  }, [getDecryptedKey]);

  const handleKeyChange = useCallback((providerId: string, value: string) => {
    setLocalKeys((current) => ({
      ...current,
      [providerId]: value,
    }));
  }, []);

  const toggleShowKey = useCallback((providerId: string) => {
    setShowKeys((current) => ({
      ...current,
      [providerId]: !current[providerId],
    }));
  }, []);

  const handleTestConnection = useCallback(async (providerId: string) => {
    const key = localKeys[providerId];
    if (!key && providerId !== "ollama") {
      return;
    }

    setStatus(providerId, "TESTING");

    try {
      const isAvailable = await providersSettingsService.testProvider(providerId);
      setStatus(providerId, isAvailable ? "READY" : "ERROR");
    } catch {
      setStatus(providerId, "ERROR");
    }
  }, [localKeys, setStatus]);

  const handleSaveProvider = useCallback(async (providerId: string) => {
    setKey(providerId, localKeys[providerId] || "");
    await handleTestConnection(providerId);
  }, [handleTestConnection, localKeys, setKey]);

  const handleRemoveProviderKey = useCallback((providerId: string) => {
    removeKey(providerId);
    setLocalKeys((current) => ({
      ...current,
      [providerId]: "",
    }));
    setStatus(providerId, "IDLE");
  }, [removeKey, setStatus]);

  const handleTestAllProviders = useCallback(async () => {
    for (const provider of PROVIDERS_META) {
      await handleTestConnection(provider.id);
    }
  }, [handleTestConnection]);

  const providerCards = useMemo<ProviderCardState[]>(() => (
    PROVIDERS_META.map((provider) => ({
      provider,
      apiKey: localKeys[provider.id] || "",
      showKey: Boolean(showKeys[provider.id]),
      status: status[provider.id] || "IDLE",
      isGlobalDefault: globalDefault === provider.id,
    }))
  ), [globalDefault, localKeys, showKeys, status]);

  return {
    providerCards,
    globalDefault,
    expertMode,
    toolPreferences,
    setGlobalDefault,
    setExpertMode,
    setToolPreference,
    handleKeyChange,
    toggleShowKey,
    handleSaveProvider,
    handleRemoveProviderKey,
    handleTestConnection,
    handleTestAllProviders,
  };
};
