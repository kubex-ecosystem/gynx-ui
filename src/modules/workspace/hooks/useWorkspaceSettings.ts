import { useCallback, useEffect, useMemo, useState } from "react";
import {
  workspaceService,
  type WorkspaceScope,
} from "../services/workspaceService";
import type { WorkspaceSettingsData, WorkspaceStatusMessage } from "../types";

const resolveErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

export const useWorkspaceSettings = (scope?: WorkspaceScope) => {
  const [formData, setFormData] = useState<WorkspaceSettingsData | null>(null);
  const [savedSnapshot, setSavedSnapshot] =
    useState<WorkspaceSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<WorkspaceStatusMessage | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const settings = await workspaceService.getSettings(scope);
      setFormData(settings);
      setSavedSnapshot(settings);
      setStatus(null);
    } catch (loadError) {
      setError(
        resolveErrorMessage(
          loadError,
          "Nao foi possivel carregar as configuracoes do workspace.",
        ),
      );
      setFormData(null);
      setSavedSnapshot(null);
    } finally {
      setIsLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const updateField = useCallback(
    <K extends keyof WorkspaceSettingsData>(
      field: K,
      value: WorkspaceSettingsData[K],
    ) => {
      setFormData((current) =>
        current ? { ...current, [field]: value } : current,
      );
      setStatus(null);
    },
    [],
  );

  const save = useCallback(async () => {
    if (!formData) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const persisted = await workspaceService.saveSettings(formData, scope);
      setFormData(persisted);
      setSavedSnapshot(persisted);
      setStatus({
        tone: "success",
        message: "Configuracoes aplicadas no ambiente local da sessao.",
      });
    } catch (saveError) {
      const message = resolveErrorMessage(
        saveError,
        "Nao foi possivel salvar as configuracoes do workspace.",
      );
      setError(message);
      setStatus({
        tone: "error",
        message,
      });
    } finally {
      setIsSaving(false);
    }
  }, [formData, scope]);

  const restoreDefaults = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      const defaults = await workspaceService.resetSettings(scope);
      setFormData(defaults);
      setSavedSnapshot(defaults);
      setStatus({
        tone: "info",
        message: "Workspace restaurado para a configuracao padrao do mock.",
      });
    } catch (resetError) {
      const message = resolveErrorMessage(
        resetError,
        "Nao foi possivel restaurar os defaults do workspace.",
      );
      setError(message);
      setStatus({
        tone: "error",
        message,
      });
    } finally {
      setIsSaving(false);
    }
  }, [scope]);

  const isDirty = useMemo(() => {
    if (!formData || !savedSnapshot) {
      return false;
    }

    return JSON.stringify(formData) !== JSON.stringify(savedSnapshot);
  }, [formData, savedSnapshot]);

  return {
    formData,
    isLoading,
    isSaving,
    isDirty,
    error,
    status,
    updateField,
    save,
    restoreDefaults,
    retry: loadSettings,
  };
};
