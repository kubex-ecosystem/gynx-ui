import {
  Activity,
  LayoutDashboard,
  Server,
  ShieldCheck,
  Terminal as TerminalIcon,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { getGatewayMetrics, getGatewayLogs, GatewayMetrics, GatewayLog } from "@/services/gatewayService";

// Helper to convert MS format
const formatLatency = (ms: number) => {
  return `${ms.toFixed(0)}ms`;
};

// Map log colors
const getLogColor = (level: string) => {
  switch (level) {
    case 'INFO': return "text-status-info";
    case 'WARN': return "text-status-warning";
    case 'ERROR': return "text-status-error";
    case 'DEBUG': return "text-accent-secondary";
    default: return "text-primary";
  }
};

const GatewayDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<GatewayMetrics | null>(null);
  const [logs, setLogs] = useState<GatewayLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      let [metricsData, logsData] = await Promise.all([
        getGatewayMetrics(),
        getGatewayLogs(14)
      ]);
      if (typeof logsData === 'string') {
        console.error("Erro ao carregar dados do Dashboard", logsData);
        logsData = [];
      }
      setMetrics(metricsData);
      setLogs(logsData);
    } catch (error) {
      console.error("Erro ao carregar dados do Dashboard", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Polling real/mock a cada 10s
    return () => clearInterval(interval);
  }, []);

  const metricCards = [
    {
      label: "Gateway Status",
      value: metrics?.status || "...",
      icon: ShieldCheck,
      color: metrics?.status === 'ONLINE' ? "text-status-success" : "text-status-error",
      bg: metrics?.status === 'ONLINE' ? "bg-status-success/10" : "bg-status-error/10",
    },
    {
      label: "Requisições / min",
      value: metrics ? `${(metrics.requestsPerMinute || 0 / 1000).toFixed(1)}k` : "...",
      icon: Activity,
      color: "text-accent-secondary",
      bg: "bg-accent-muted",
    },
    {
      label: "Serviços Conectados",
      value: (metrics?.connectedServices || 0).toString() || "...",
      icon: Server,
      color: "text-status-info",
      bg: "bg-status-info/10",
    },
    {
      label: "Latência Média",
      value: metrics ? formatLatency((metrics.averageLatencyMs || 0)) : "...",
      icon: Zap,
      color: "text-status-warning",
      bg: "bg-status-warning/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-accent-primary uppercase tracking-[0.4em] text-xs font-bold">
          <LayoutDashboard size={16} /> Operação GNyx
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">
          Gateway Dashboard
        </h2>
        <p className="text-secondary text-sm">
          Monitoramento em tempo real do ecossistema GNyx.
        </p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(metricCards || []).map((metric) => (
          <Card
            key={metric.label}
            className="p-6 border-border-secondary bg-surface-primary/40 backdrop-blur-sm group hover:border-border-accent transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted uppercase tracking-[0.2em]">
                  {metric.label}
                </p>
                <p className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </p>
              </div>
              <div
                className={`p-3 rounded-xl ${metric.bg} ${metric.color} group-hover:scale-110 transition-transform duration-300`}
              >
                <metric.icon size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Terminal View */}
      <Card className="bg-main border-border-primary/50 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <header className="px-6 py-4 border-b border-border-secondary flex items-center justify-between bg-surface-primary/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <TerminalIcon className="text-accent-secondary" size={18} />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Gateway Realtime Logs
            </span>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-status-error/40 hover:bg-status-error transition-colors" />
            <div className="w-3 h-3 rounded-full bg-status-warning/40 hover:bg-status-warning transition-colors" />
            <div className="w-3 h-3 rounded-full bg-status-success/40 hover:bg-status-success transition-colors" />
          </div>
        </header>
        <div className="p-6 font-mono text-sm leading-relaxed space-y-2 h-[400px] overflow-y-auto bg-surface-primary/40 scrollbar-thin scrollbar-thumb-surface-tertiary">
          {(logs || []).map((log, i) => (
            <div key={i} className="flex gap-4 group">
              <span className="text-muted text-[10px] w-4 opacity-50 group-hover:opacity-100 transition-opacity">
                {i + 1}
              </span>
              <span className={getLogColor(log.level)}>
                [{log.level}] {log.timestamp.replace("T", " ").split(".")[0]} - {log.message}
              </span>
            </div>
          ))}
          <div className="flex gap-4 animate-pulse">
            <span className="text-muted text-[10px] w-4">_</span>
            <span className="text-accent-primary">▋</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GatewayDashboard;
