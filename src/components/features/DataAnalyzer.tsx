import {
  AlertCircle,
  BarChart3,
  Database,
  Download,
  FileText,
  History,
  Loader2,
  Menu,
  RefreshCcw,
  Share2,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMultiProvider } from "@/hooks/useMultiProvider";
import { useTranslations } from "@/i18n/useTranslations";
import { AnalysisResult, GNyxDataTable, Theme } from "@/types";
import { csvToGNyxTable } from "@/utils/csvParser";
import Card from "@/components/ui/Card";

interface DataAnalyzerProps {
  initialData?: GNyxDataTable;
  onDataLoaded?: (data: GNyxDataTable) => void;
  theme: Theme;
}

interface SavedAnalysis {
  id: string;
  name: string;
  query: string;
  code: string;
  schema: GNyxDataTable["schema"];
  timestamp: string;
  resultType: string;
}

const DataAnalyzer: React.FC<DataAnalyzerProps> = (
  { initialData, onDataLoaded, theme },
) => {
  const { t } = useTranslations();
  const { service: aiService } = useMultiProvider();

  // State
  const [data, setData] = useState<GNyxDataTable | null>(initialData || null);
  const [analysisQuery, setAnalysisQuery] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [generatedCode, setGeneratedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [error, setError] = useState("");
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [analysisName, setAnalysisName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<
    "upload" | "analyze" | "results"
  >(initialData ? "analyze" : "upload");
  const [structureExpanded, setStructureExpanded] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [activeVisualization, setActiveVisualization] = useState<
    "table" | string
  >("table");

  // Load saved analyses
  useEffect(() => {
    const stored = localStorage.getItem("gnyx_saved_analyses");
    if (stored) {
      try {
        setSavedAnalyses(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved analyses", e);
      }
    }
  }, []);

  const saveToLocalStorage = (analyses: SavedAnalysis[]) => {
    localStorage.setItem("gnyx_saved_analyses", JSON.stringify(analyses));
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingStatus("Lendo arquivo...");

    try {
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      const tableData = csvToGNyxTable(text, file.name);
      setData(tableData);
      if (onDataLoaded) onDataLoaded(tableData);

      setCurrentView("analyze");
      setError("");
    } catch (err: any) {
      setError("Erro ao processar CSV: " + err.message);
    } finally {
      setIsLoading(false);
      setLoadingStatus("");
    }
  };

  const runAnalysis = async () => {
    if (!data) return;
    if (!analysisQuery.trim()) return;

    setIsLoading(true);
    setLoadingStatus("Planejando estratégia de análise...");
    setError("");

    try {
      const csvPreview = data.headers.join(",") + "" +
        data.rows.slice(0, 5).map((row) =>
          data.headers.map((h) => row[h]).join(",")
        ).join("");

      const prompt = `Given this dataset structure:
Name: ${data.name}
Headers: ${data.headers.join(", ")}
Sample Data (CSV format):
${csvPreview}

User's request: "${analysisQuery}"

Write JavaScript code to perform this analysis on the full dataset.
The dataset is available as an array of objects called 'rows', where each object has column names as keys.

IMPORTANT: You must ALWAYS return data in this exact structure:
const analysisResult = {
  table: { headers: string[], rows: any[][] },
  chart: {
    type: 'bar_chart' | 'line_chart' | 'pie_chart' | 'area_chart' | 'count' | null,
    data: {
      labels: string[],
      values: number[],
      title?: string,
      label?: string // for count type
    } | null
  }
};

Guidelines:
- Choose the best chart type for the data.
- Always include the table results.
- Convert numeric strings to Numbers.
- Handle null/undefined values.
- Return ONLY the JS code, no markdown, no backticks.`;

      // Use Multi-Provider Service
      const response = await aiService.generateContent({
        provider: "gemini", // Fallback or preferred
        ideas: [prompt],
        maxTokens: 2000,
        temperature: 0.2,
      });

      const code = response.prompt; // The text property contains the code in GenerateResponse
      setGeneratedCode(code);
      setLoadingStatus("Calculando resultados...");

      // Execute code safely
      const executeAnalysis = new Function(
        "rows",
        code + "return analysisResult;",
      );
      const result = executeAnalysis(data.rows) as AnalysisResult;

      setAnalysisResult(result);
      setActiveVisualization("table");
      setCurrentView("results");
      setShowSaveDialog(true);
    } catch (err: any) {
      setError("Falha na análise: " + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingStatus("");
    }
  };

  const handleSaveAnalysis = () => {
    if (!generatedCode || !data) return;

    const newAnalysis: SavedAnalysis = {
      id: crypto.randomUUID(),
      name: analysisName || analysisQuery,
      query: analysisQuery,
      code: generatedCode,
      schema: data.schema,
      timestamp: new Date().toISOString(),
      resultType: analysisResult?.chart?.type || "table",
    };

    const updated = [newAnalysis, ...savedAnalyses];
    setSavedAnalyses(updated);
    saveToLocalStorage(updated);
    setShowSaveDialog(false);
    setAnalysisName("");
  };

  const deleteSaved = (id: string) => {
    const updated = savedAnalyses.filter((a) => a.id !== id);
    setSavedAnalyses(updated);
    saveToLocalStorage(updated);
  };

  const renderChart = () => {
    if (!analysisResult?.chart?.data) return null;
    const { type, data: chartData } = analysisResult.chart;

    const chartDataFormatted = chartData.labels.map((
      label: string,
      i: number,
    ) => ({
      name: label,
      value: chartData.values[i],
    }));

    switch (type) {
      case "bar_chart":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartDataFormatted}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border-secondary)"
              />
              <XAxis
                dataKey="name"
                stroke="var(--color-text-secondary)"
                fontSize={12}
              />
              <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface-primary)",
                  border: "1px solid var(--color-border-primary)",
                }}
                itemStyle={{ color: "var(--color-accent-secondary)" }}
              />
              <Bar
                dataKey="value"
                fill="var(--color-accent-primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      case "line_chart":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartDataFormatted}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border-secondary)"
              />
              <XAxis
                dataKey="name"
                stroke="var(--color-text-secondary)"
                fontSize={12}
              />
              <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface-primary)",
                  border: "1px solid var(--color-border-primary)",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-accent-primary)"
                strokeWidth={3}
                dot={{ fill: "var(--color-accent-secondary)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie_chart":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartDataFormatted}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {chartDataFormatted.map((_: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`hsl(${(index * 45) % 360}, 70%, 60%)`}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case "count":
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-muted uppercase tracking-widest text-sm font-bold mb-2">
              {chartData.label || "Resultado Total"}
            </span>
            <span className="text-6xl font-bold text-accent-primary animate-pulse">
              {chartData.value.toLocaleString()}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-main rounded-3xl border border-border-primary overflow-hidden">
      {/* Sidebar - Saved Analyses */}
      <aside
        className={`${sidebarOpen ? "w-80" : "w-0"
          } transition-all duration-300 border-r border-border-primary bg-surface-primary/30 flex flex-col overflow-hidden`}
      >
        <div className="p-6 border-b border-border-primary">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <History className="text-accent-secondary" size={20} />
            Histórico
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {savedAnalyses.length === 0
            ? (
              <div className="text-center py-10 text-muted opacity-50">
                <Database size={40} className="mx-auto mb-2" />
                <p className="text-xs uppercase tracking-widest">
                  Sem análises salvas
                </p>
              </div>
            )
            : (
              savedAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="p-4 rounded-xl border border-border-secondary bg-surface-primary/50 hover:border-border-accent transition-all group"
                >
                  <h3 className="text-sm font-bold text-primary truncate mb-1">
                    {analysis.name}
                  </h3>
                  <p className="text-xs text-muted line-clamp-2 mb-3">
                    {analysis.query}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 rounded-lg bg-accent-muted text-accent-secondary text-[10px] font-bold uppercase hover:bg-accent-primary hover:text-white transition-colors">
                      Abrir
                    </button>
                    <button
                      title="Excluir análise salva"
                      onClick={() => deleteSaved(analysis.id)}
                      className="p-1.5 rounded-lg text-muted hover:text-status-error transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-6 py-4 border-b border-border-primary bg-surface-primary/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors text-secondary"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <BarChart3 className="text-accent-primary" size={24} />
              <h1 className="text-xl font-bold text-primary tracking-tight">
                Data Analyzer{" "}
                <span className="text-accent-secondary text-xs uppercase ml-2 px-2 py-0.5 bg-accent-muted rounded-full border border-accent-primary/20">
                  AI Driven
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {data && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-tertiary/50 border border-border-primary text-xs">
                <FileText size={14} className="text-accent-secondary" />
                <span className="text-primary font-medium truncate max-w-[150px]">
                  {data.name}
                </span>
              </div>
            )}
            <label className="cursor-pointer">
              <div className="px-4 py-2 bg-accent-primary text-white rounded-xl hover:bg-accent-secondary transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-accent-primary/20">
                <Upload size={16} />
                <span className="hidden sm:inline">Novo Dataset</span>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {/* Error */}
          {error && (
            <Card className="mb-8 border-status-error/30 bg-status-error/5 text-status-error flex items-center gap-3 p-4 animate-fade-in">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </Card>
          )}

          {/* Initial Upload View */}
          {currentView === "upload" && !isLoading && (
            <div className="max-w-2xl mx-auto py-20 text-center space-y-8">
              <div className="w-24 h-24 rounded-3xl bg-accent-muted flex items-center justify-center mx-auto border border-accent-primary/20 shadow-inner">
                <Database size={48} className="text-accent-primary" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-primary">
                  Análise Inteligente de Dados
                </h2>
                <p className="text-secondary">
                  Carregue um arquivo CSV para extrair insights automáticos,
                  gerar gráficos e tabelas dinâmicas usando IA.
                </p>
              </div>
              <label className="block w-full h-64 rounded-3xl border-2 border-dashed border-border-primary hover:border-accent-primary bg-surface-primary/20 hover:bg-surface-primary/40 transition-all cursor-pointer group">
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <Upload
                    size={48}
                    className="text-muted group-hover:text-accent-primary transition-colors"
                  />
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-primary">
                      Arraste ou clique para enviar
                    </p>
                    <p className="text-sm text-muted">
                      Suporta arquivos CSV até 10MB
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          )}

          {/* Analyze View */}
          {currentView === "analyze" && data && !isLoading && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
              <Card
                title="Configuração da Análise"
                description={`Analisando: ${data.name}`}
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-[0.3em]">
                      Pergunta ao Analista IA
                    </label>
                    <textarea
                      value={analysisQuery}
                      onChange={(e) => setAnalysisQuery(e.target.value)}
                      placeholder="Ex: Qual o total de faturamento por categoria no último mês?"
                      className="w-full h-32 bg-main border border-border-primary rounded-2xl p-4 text-primary focus:border-accent-primary transition-all resize-none outline-none"
                    />
                  </div>
                  <button
                    onClick={runAnalysis}
                    disabled={!analysisQuery.trim()}
                    className="w-full py-4 bg-accent-primary text-white rounded-2xl font-bold text-lg hover:bg-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-primary/20 transition-all flex items-center justify-center gap-3"
                  >
                    <Zap size={24} />
                    Processar com IA
                  </button>
                </div>
              </Card>

              {/* Data Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-muted uppercase tracking-[0.2em]">
                    Prévia do Dataset
                  </h3>
                  <span className="text-xs text-muted">
                    {data.rows.length} registros • {data.headers.length} colunas
                  </span>
                </div>
                <div className="rounded-2xl border border-border-primary bg-surface-primary/30 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-surface-primary/80 border-b border-border-primary">
                          {data.headers.map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 font-bold text-secondary uppercase tracking-wider whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-secondary/50">
                        {data.rows.slice(0, 5).map((row, i) => (
                          <tr
                            key={i}
                            className="hover:bg-surface-tertiary/20 transition-colors"
                          >
                            {data.headers.map((h) => (
                              <td
                                key={h}
                                className="px-4 py-3 text-secondary truncate max-w-[200px]"
                              >
                                {row[h]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results View */}
          {currentView === "results" && analysisResult && !isLoading && (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-primary mb-1">
                    Resultados da Análise
                  </h2>
                  <p className="text-secondary italic text-sm">
                    "{analysisQuery}"
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView("analyze")}
                  className="px-4 py-2 rounded-xl border border-border-primary bg-surface-primary text-secondary hover:bg-surface-tertiary transition-all text-sm font-bold flex items-center gap-2"
                >
                  <RefreshCcw size={16} /> Nova Consulta
                </button>
              </header>

              {/* Save Dialog */}
              {showSaveDialog && (
                <Card className="bg-accent-muted/10 border-accent-primary/30 p-6 animate-slide-up">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold text-accent-secondary uppercase tracking-widest">
                        Deseja salvar esta análise no histórico?
                      </label>
                      <input
                        value={analysisName}
                        onChange={(e) => setAnalysisName(e.target.value)}
                        placeholder="Nome da análise (ex: Relatório Mensal)"
                        className="w-full bg-main border border-border-primary rounded-xl px-4 py-2 text-sm text-primary focus:border-accent-primary outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowSaveDialog(false)}
                        className="px-4 py-2 text-muted text-sm font-bold"
                      >
                        Pular
                      </button>
                      <button
                        onClick={handleSaveAnalysis}
                        className="px-6 py-2 bg-accent-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-accent-primary/20"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Visualization Grid */}
              <div className="grid grid-cols-1 gap-8">
                {/* Chart */}
                {analysisResult.chart.type && (
                  <Card className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold text-primary">
                        {analysisResult.chart.data?.title ||
                          "Visualização dos Dados"}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          title="Compartilhar"
                          className="p-2 rounded-lg bg-surface-tertiary text-secondary hover:text-primary transition-colors"
                        >
                          <Share2 size={18} />
                        </button>
                        <button
                          title="Baixar"
                          className="p-2 rounded-lg bg-surface-tertiary text-secondary hover:text-primary transition-colors"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="w-full flex items-center justify-center">
                      {renderChart()}
                    </div>
                  </Card>
                )}

                {/* Table Result */}
                <Card
                  title="Dados Consolidados"
                  className="p-0 overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-surface-primary border-b border-border-primary">
                          {analysisResult.table.headers.map((h) => (
                            <th
                              key={h}
                              className="px-6 py-4 font-bold text-secondary uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-secondary/50">
                        {analysisResult.table.rows.map((row, i) => (
                          <tr
                            key={i}
                            className="hover:bg-surface-tertiary/20 transition-colors"
                          >
                            {row.map((cell, j) => (
                              <td
                                key={j}
                                className="px-6 py-4 text-primary font-medium"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center space-y-6 py-20">
              <div className="relative">
                <Loader2
                  size={64}
                  className="text-accent-primary animate-spin"
                />
                <Zap
                  size={24}
                  className="absolute inset-0 m-auto text-accent-secondary animate-pulse"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-bold text-primary animate-pulse">
                  {loadingStatus}
                </p>
                <p className="text-sm text-muted">
                  GNyx Engine está processando seu pedido...
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DataAnalyzer;
