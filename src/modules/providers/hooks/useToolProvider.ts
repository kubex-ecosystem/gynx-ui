import { useEffect, useMemo, useState } from 'react';
import { configService, type ProviderInfo } from '@/services/configService';
import { useProvidersStore } from '@/store/useProvidersStore';

const resolvePreferredProvider = (
  providers: ProviderInfo[],
  requested: string | undefined,
  fallback: string | undefined,
): string => {
  const names = new Set(providers.map((provider) => provider.name));

  if (requested && names.has(requested)) {
    return requested;
  }

  if (fallback && names.has(fallback)) {
    return fallback;
  }

  return providers[0]?.name ?? '';
};

export const useToolProvider = (toolId: string) => {
  const { globalDefault, toolPreferences, setToolPreference } = useProvidersStore();
  const [availableProviders, setAvailableProviders] = useState<ProviderInfo[]>([]);
  const [defaultProvider, setDefaultProvider] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const loadProviders = async () => {
      setIsLoading(true);
      try {
        const config = await configService.getConfig();
        if (cancelled) {
          return;
        }

        const providers = config.available_providers
          .map((name) => config.providers[name])
          .filter((provider): provider is ProviderInfo => Boolean(provider));

        setAvailableProviders(providers);
        setDefaultProvider(config.default_provider || providers[0]?.name || '');

        const currentPreference = toolPreferences[toolId];
        const resolved = resolvePreferredProvider(providers, currentPreference, globalDefault || config.default_provider);
        if (currentPreference && resolved && currentPreference !== resolved) {
          setToolPreference(toolId, resolved);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(`Failed to load providers for ${toolId}`, error);
          setAvailableProviders([]);
          setDefaultProvider('');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProviders();

    return () => {
      cancelled = true;
    };
  }, [globalDefault, setToolPreference, toolId, toolPreferences]);

  const selectedProvider = useMemo(
    () => resolvePreferredProvider(availableProviders, toolPreferences[toolId], globalDefault || defaultProvider),
    [availableProviders, defaultProvider, globalDefault, toolPreferences, toolId],
  );

  const selectedProviderInfo = useMemo(
    () => availableProviders.find((provider) => provider.name === selectedProvider) ?? null,
    [availableProviders, selectedProvider],
  );

  const handleSelectProvider = (provider: string) => {
    setToolPreference(toolId, provider);
  };

  return {
    availableProviders,
    selectedProvider,
    selectedProviderInfo,
    isLoading,
    setSelectedProvider: handleSelectProvider,
  };
};
