import React from 'react';
import type { ProviderInfo } from '@/services/configService';

interface ToolProviderSelectorProps {
  availableProviders: ProviderInfo[];
  isLoading?: boolean;
  selectedProvider: string;
  onChange: (provider: string) => void;
  label?: string;
}

const ToolProviderSelector: React.FC<ToolProviderSelectorProps> = ({
  availableProviders,
  isLoading = false,
  selectedProvider,
  onChange,
  label = 'Provider em uso',
}) => {
  const selectedProviderInfo = availableProviders.find((provider) => provider.name === selectedProvider) ?? null;
  const selectId = `tool-provider-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          {label}
        </label>
        {selectedProviderInfo && (
          <span className="text-[11px] uppercase tracking-[0.25em] text-muted">
            {selectedProviderInfo.default_model || 'model auto'}
          </span>
        )}
      </div>
      <select
        id={selectId}
        value={selectedProvider}
        onChange={(event) => onChange(event.target.value)}
        disabled={isLoading || availableProviders.length === 0}
        className="w-full rounded-xl border border-border-primary bg-surface-primary px-3 py-2 text-sm text-primary shadow-sm transition focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {availableProviders.length === 0 && (
          <option value="">{isLoading ? 'Carregando providers...' : 'Nenhum provider disponível'}</option>
        )}
        {availableProviders.map((provider) => (
          <option key={provider.name} value={provider.name}>
            {provider.display_name || provider.name}
          </option>
        ))}
      </select>
      {selectedProviderInfo && (
        <p className="text-[11px] text-muted">
          Runtime: {selectedProviderInfo.status} · Modo: {selectedProviderInfo.mode || 'server'}
        </p>
      )}
    </div>
  );
};

export default ToolProviderSelector;
