import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Database,
  Download,
  LoaderCircle,
  PanelTop,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import ToolProviderSelector from "@/components/providers/ToolProviderSelector";
import AccessNotice from "@/components/security/AccessNotice";
import Card from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { useToolProvider } from "@/modules/providers/hooks/useToolProvider";
import { biStudioService } from "@/modules/bi/services/biStudioService";
import type {
  BICatalogStatus,
  GenerateBoardResponse,
} from "@/modules/bi/types";

const DEFAULT_PROMPT =
  "Create a compact sales overview dashboard with total sales, order count, sales by month, and top customers for the selected period.";

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const BIStudio: React.FC = () => {
  const { hasAccess, activeTenant, activeRoleName } = useAuth();
  const {
    availableProviders,
    selectedProvider,
    isLoading: providersLoading,
    setSelectedProvider,
  } = useToolProvider("bi.board-generation");

  const [catalogStatus, setCatalogStatus] = useState<BICatalogStatus | null>(
    null,
  );
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [result, setResult] = useState<GenerateBoardResponse | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedKind, setCopiedKind] = useState<
    "command" | "schema" | "bundle" | null
  >(null);

  const loadStatus = async () => {
    setIsStatusLoading(true);
    setStatusError(null);
    try {
      const data = await biStudioService.getCatalogStatus();
      setCatalogStatus(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load BI catalog status.";
      setStatusError(message);
    } finally {
      setIsStatusLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const datasetSummary = useMemo(() => {
    if (!catalogStatus) return [];
    return catalogStatus.datasets.slice(0, 6);
  }, [catalogStatus]);

  const copyText = async (
    kind: "command" | "schema" | "bundle",
    content: string,
  ) => {
    await navigator.clipboard.writeText(content);
    setCopiedKind(kind);
    window.setTimeout(
      () => setCopiedKind((current) => (current === kind ? null : current)),
      2000,
    );
  };

  const handleGenerate = async () => {
    if (!catalogStatus?.available) {
      return;
    }
    setIsGenerating(true);
    setGenerateError(null);
    setStatusMessage(null);
    try {
      const response = await biStudioService.generateBoard({
        prompt,
        domain: "sales",
        provider: selectedProvider || undefined,
        max_widgets: 4,
      });
      setResult(response);
      setStatusMessage(
        `Board generated in ${response.generation_mode} mode with ${response.provider}/${response.model}.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate BI board.";
      setGenerateError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!result) return;
    setIsExporting(true);
    setGenerateError(null);
    try {
      const blob = await biStudioService.exportBoardBundle({
        prompt,
        domain: result.domain,
        provider: result.provider,
        model: result.model,
        generation_mode: result.generation_mode,
        fallback_reason: result.fallback_reason,
        usage: result.usage,
        grounding_context: result.grounding_context,
        plan: result.plan,
        dashboard_schema: result.dashboard_schema,
      });
      const safeName = (result.dashboard_schema.title || "generated-board")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      downloadBlob(blob, `${safeName || "generated-board"}.zip`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to export board bundle.";
      setGenerateError(message);
    } finally {
      setIsExporting(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className="space-y-6 animate-fade-in">
        <AccessNotice
          title="Access restricted"
          description="This area requires an authenticated tenant scope to generate grounded BI board demos."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.4em] text-accent-primary">
            <PanelTop size={16} /> Metadata-Driven BI Demo
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            BI Studio Proof of Concept
          </h2>
          <p className="text-sm text-secondary max-w-3xl">
            Generate a portable dashboard artifact grounded on Sankhya BI
            metadata already introspected into Domus. No live Sankhya runtime is
            required for this demo.
          </p>
          {activeTenant && (
            <p className="text-sm text-secondary">
              Current scope:{" "}
              <span className="font-semibold text-primary">
                {activeTenant.name || activeTenant.slug || activeTenant.id}
              </span>
              {activeRoleName && (
                <span className="text-muted"> · {activeRoleName}</span>
              )}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void loadStatus()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-primary bg-surface-primary px-4 py-2 text-sm font-semibold text-secondary transition-all hover:bg-surface-tertiary"
        >
          <RefreshCcw
            size={16}
            className={isStatusLoading ? "animate-spin" : ""}
          />{" "}
          Refresh metadata status
        </button>
      </header>

      {statusError && (
        <Card className="border-status-error/30 bg-status-error/5 p-5 text-sm text-status-error">
          {statusError}
        </Card>
      )}

      {isStatusLoading ? (
        <Card className="p-6 border-border-secondary bg-surface-primary/40">
          <div className="flex items-center gap-3 text-secondary">
            <LoaderCircle size={18} className="animate-spin" />
            Resolving Sankhya metadata catalog status...
          </div>
        </Card>
      ) : !catalogStatus?.available ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-6 border-status-warning/30 bg-status-warning/5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-status-warning/20 bg-status-warning/10 p-2 text-status-warning">
                <AlertTriangle size={18} />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-primary">
                  Metadata catalog required
                </h3>
                <p className="text-sm text-secondary">
                  {catalogStatus?.message ||
                    "The BI demo requires a grounded Sankhya catalog before board generation becomes usable."}
                </p>
                <div className="rounded-2xl border border-border-primary bg-surface-primary/70 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted">
                    Suggested sync command
                  </p>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-primary">
                    {catalogStatus?.sync_command_example ||
                      'gnyx metadata sankhya sync --env-file ./config/.env.local --pg-dsn "$DOMUS_PG_DSN"'}
                  </pre>
                  <button
                    type="button"
                    onClick={() =>
                      void copyText(
                        "command",
                        catalogStatus?.sync_command_example ||
                          'gnyx metadata sankhya sync --env-file ./config/.env.local --pg-dsn "$DOMUS_PG_DSN"',
                      )
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border-primary bg-surface-primary px-3 py-2 text-xs font-semibold text-secondary transition hover:bg-surface-tertiary"
                  >
                    <ClipboardCopy size={14} />{" "}
                    {copiedKind === "command"
                      ? "Command copied"
                      : "Copy command"}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border-secondary bg-surface-primary/40">
            <h3 className="text-lg font-bold text-primary">
              Current registry snapshot
            </h3>
            <div className="mt-4 space-y-3 text-sm text-secondary">
              <p>
                Schema:{" "}
                <span className="font-semibold text-primary">
                  {catalogStatus?.schema_name || "sankhya_catalog"}
                </span>
              </p>
              <p>
                Datasets tracked:{" "}
                <span className="font-semibold text-primary">
                  {catalogStatus?.total_datasets || 0}
                </span>
              </p>
              <p>
                Ready:{" "}
                <span className="font-semibold text-status-success">
                  {catalogStatus?.ready_datasets || 0}
                </span>
              </p>
              <p>
                Empty:{" "}
                <span className="font-semibold text-status-warning">
                  {catalogStatus?.empty_datasets || 0}
                </span>
              </p>
              <p>
                Failed:{" "}
                <span className="font-semibold text-status-error">
                  {catalogStatus?.failed_datasets || 0}
                </span>
              </p>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <Card className="p-6 border-border-secondary bg-surface-primary/40">
              <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                      Prompt
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      rows={7}
                      className="mt-2 w-full rounded-2xl border border-border-primary bg-surface-primary px-4 py-3 text-sm text-primary shadow-sm transition focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleGenerate()}
                      disabled={isGenerating || !prompt.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-primary/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                    >
                      {isGenerating ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      {isGenerating
                        ? "Generating board..."
                        : "Generate portable board"}
                    </button>
                    {result && (
                      <button
                        type="button"
                        onClick={() => void handleExport()}
                        disabled={isExporting}
                        className="inline-flex items-center gap-2 rounded-xl border border-border-primary bg-surface-primary px-5 py-3 text-sm font-semibold text-secondary transition hover:bg-surface-tertiary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isExporting ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Download size={16} />
                        )}
                        {isExporting
                          ? "Packaging ZIP..."
                          : "Download ZIP bundle"}
                      </button>
                    )}
                  </div>
                  {statusMessage && (
                    <p className="text-sm text-status-success">
                      {statusMessage}
                    </p>
                  )}
                  {generateError && (
                    <p className="text-sm text-status-error">{generateError}</p>
                  )}
                </div>
                <div className="space-y-4">
                  <ToolProviderSelector
                    availableProviders={availableProviders}
                    isLoading={providersLoading}
                    selectedProvider={selectedProvider}
                    onChange={setSelectedProvider}
                    label="Board provider"
                  />
                  <div className="rounded-2xl border border-border-primary bg-surface-primary/70 p-4 text-sm text-secondary">
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted">
                      Catalog
                    </p>
                    <p className="mt-2 font-semibold text-primary">
                      {catalogStatus.schema_name}
                    </p>
                    <p className="mt-1">
                      {catalogStatus.ready_datasets} ready datasets ·{" "}
                      {catalogStatus.empty_datasets} empty
                    </p>
                    {catalogStatus.last_loaded_at && (
                      <p className="mt-1 text-xs text-muted">
                        Last sync:{" "}
                        {new Date(
                          catalogStatus.last_loaded_at,
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border-secondary bg-surface-primary/40">
              <h3 className="text-lg font-bold text-primary">
                Grounding snapshot
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {datasetSummary.map((dataset) => (
                  <div
                    key={dataset.dataset_name}
                    className="rounded-2xl border border-border-primary bg-surface-primary/50 p-4"
                  >
                    <p className="text-sm font-semibold text-primary">
                      {dataset.dataset_name}
                    </p>
                    <p className="mt-1 text-xs text-secondary">
                      {dataset.table_name}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="rounded-full bg-surface-tertiary px-2 py-1 text-secondary">
                        {dataset.status}
                      </span>
                      <span className="font-semibold text-primary">
                        {dataset.row_count.toLocaleString()} rows
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-border-secondary bg-surface-primary/40">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-primary">
                    Portable artifact
                  </h3>
                  <p className="text-sm text-secondary">
                    Copy the generated schema or export a ZIP bundle with the
                    full board package.
                  </p>
                </div>
                {result && (
                  <button
                    type="button"
                    onClick={() =>
                      void copyText(
                        "schema",
                        JSON.stringify(result.dashboard_schema, null, 2),
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-border-primary bg-surface-primary px-3 py-2 text-xs font-semibold text-secondary transition hover:bg-surface-tertiary"
                  >
                    <ClipboardCopy size={14} />{" "}
                    {copiedKind === "schema"
                      ? "Schema copied"
                      : "Copy schema JSON"}
                  </button>
                )}
              </div>

              {!result ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border-primary bg-surface-primary/30 p-6 text-sm text-secondary">
                  No board generated yet. Use the prompt on the left to produce
                  a portable board artifact.
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border-primary bg-surface-primary/50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted">
                        Board
                      </p>
                      <p className="mt-2 text-lg font-semibold text-primary">
                        {result.dashboard_schema.title}
                      </p>
                      <p className="mt-1 text-xs text-secondary">
                        {result.dashboard_schema.widgets.length} widgets
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border-primary bg-surface-primary/50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted">
                        Runtime
                      </p>
                      <p className="mt-2 text-sm font-semibold text-primary">
                        {result.provider} / {result.model}
                      </p>
                      <p className="mt-1 text-xs text-secondary">
                        Mode: {result.generation_mode}
                      </p>
                    </div>
                  </div>

                  {result.usage && (
                    <div className="rounded-2xl border border-border-primary bg-surface-primary/50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted">
                        Usage
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <p className="text-sm text-secondary">
                          Prompt tokens:{" "}
                          <span className="font-semibold text-primary">
                            {result.usage.prompt_tokens ?? 0}
                          </span>
                        </p>
                        <p className="text-sm text-secondary">
                          Completion tokens:{" "}
                          <span className="font-semibold text-primary">
                            {result.usage.completion_tokens ?? 0}
                          </span>
                        </p>
                        <p className="text-sm text-secondary">
                          Total tokens:{" "}
                          <span className="font-semibold text-primary">
                            {result.usage.total_tokens ?? 0}
                          </span>
                        </p>
                        <p className="text-sm text-secondary">
                          Latency:{" "}
                          <span className="font-semibold text-primary">
                            {result.usage.latency_ms ?? 0} ms
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {result.plan.widgets.map((widget) => (
                      <div
                        key={widget.id}
                        className="rounded-2xl border border-border-primary bg-surface-primary/40 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-primary">
                              {widget.title}
                            </p>
                            <p className="text-xs text-secondary">
                              {widget.type} · {widget.data_source.main_table}
                            </p>
                          </div>
                          <span className="rounded-full bg-accent-muted px-2 py-1 text-[11px] font-semibold text-accent-secondary">
                            {widget.size.cols}x{widget.size.rows}
                          </span>
                        </div>
                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-surface-secondary/70 p-3 text-[11px] text-secondary">
                          {widget.data_source.sql}
                        </pre>
                      </div>
                    ))}
                  </div>

                  <details className="rounded-2xl border border-border-primary bg-surface-primary/40 p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-primary">
                      Raw provider JSON
                    </summary>
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-[11px] text-secondary">
                      {result.raw_provider_json}
                    </pre>
                  </details>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default BIStudio;
