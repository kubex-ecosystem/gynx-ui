import { useCallback, useEffect, useMemo, useState } from "react";
import { PROVIDERS_META } from "../constants";
import { providersSettingsService } from "../services/providersSettingsService";
import type { ProviderCardState } from "../types";
import { useProvidersStore } from "@/store/useProvidersStore";
import { configService, type ProviderInfo } from "@/services/configService";

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
  const [runtimeProviders, setRuntimeProviders] = useState<Record<string, ProviderInfo>>({});
  const [testMessages, setTestMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalKeys(buildLocalKeysSnapshot(getDecryptedKey));
  }, [getDecryptedKey]);

  useEffect(() => {
    let mounted = true;

    const loadRuntimeProviders = async () => {
      try {
        const config = await configService.getConfig(true);
        if (!mounted) return;

        setRuntimeProviders(config.providers);

        const current = config.providers[globalDefault];
        if (!current?.available && config.default_provider && config.providers[config.default_provider]) {
          setGlobalDefault(config.default_provider);
        }
      } catch (error) {
        console.error("Failed to load runtime provider configuration", error);
      }
    };

    void loadRuntimeProviders();

    return () => {
      mounted = false;
    };
  }, [globalDefault, setGlobalDefault]);

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
    const runtimeInfo = runtimeProviders[providerId];
    const canUseServerConfig = Boolean(runtimeInfo?.configured);
    if (!key && providerId !== "ollama" && !canUseServerConfig) {
      setTestMessages((current) => ({
        ...current,
        [providerId]: "Missing API key in local settings.",
      }));
      return;
    }

    setStatus(providerId, "TESTING");

    try {
      const result = await providersSettingsService.testProvider(providerId);
      setStatus(providerId, result.available ? "READY" : "ERROR");
      setTestMessages((current) => ({
        ...current,
        [providerId]: result.message,
      }));
    } catch (error) {
      setStatus(providerId, "ERROR");
      setTestMessages((current) => ({
        ...current,
        [providerId]: error instanceof Error ? error.message : "Provider test failed.",
      }));
    }
  }, [localKeys, runtimeProviders, setStatus]);

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
    setTestMessages((current) => ({
      ...current,
      [providerId]: "",
    }));
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
      runtimeInfo: runtimeProviders[provider.id],
      testMessage: testMessages[provider.id],
    }))
  ), [globalDefault, localKeys, runtimeProviders, showKeys, status, testMessages]);

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
