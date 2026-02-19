import React, { useEffect, useState } from 'react';
import { Activity, Globe, LayoutDashboard, Server, ShieldCheck, Terminal as TerminalIcon, Zap } from 'lucide-react';
import Card from '../components/ui/Card';

// Mocks
const metrics = [
  { label: 'Gateway Status', value: 'ONLINE', icon: ShieldCheck, color: 'text-status-success', bg: 'bg-status-success/10' },
  { label: 'Requisições / min', value: '1.2k', icon: Activity, color: 'text-accent-secondary', bg: 'bg-accent-muted' },
  { label: 'Serviços Conectados', value: '4', icon: Server, color: 'text-status-info', bg: 'bg-status-info/10' },
  { label: 'Latência Média', value: '42ms', icon: Zap, color: 'text-status-warning', bg: 'bg-status-warning/10' },
];

const mockLogs = [
  '[INFO] 2026-02-19 14:32:01 - GNyx Gateway v1.0.2 iniciado com sucesso.',
  '[DEBUG] 2026-02-19 14:32:05 - Conectando ao provedor Gemini Pro via BYOK.',
  '[INFO] 2026-02-19 14:32:10 - Carregando 4 serviços do manifest Bellube.',
  '[WARN] 2026-02-19 14:35:42 - Latência elevada detectada no serviço MailHub (85ms).',
  '[INFO] 2026-02-19 14:40:12 - Cache de rotas atualizado.',
  '[DEBUG] 2026-02-19 14:42:01 - Requisição recebida: GET /api/v1/status',
  '[INFO] 2026-02-19 14:45:33 - Sincronização de dados ERP Sankhya concluída.',
];

const GatewayDashboard: React.FC = () => {
  const [logs, setLogs] = useState<string[]>(mockLogs);

  // Simple log animation mock
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = `[DEBUG] ${new Date().toISOString().replace('T', ' ').split('.')[0]} - Heartbeat: Gateway healthy.`;
      setLogs(prev => [...prev.slice(-14), newLog]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-accent-primary uppercase tracking-[0.4em] text-xs font-bold">
          <LayoutDashboard size={16} /> Operação GNyx
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Gateway Dashboard</h2>
        <p className="text-secondary text-sm">Monitoramento em tempo real do ecossistema Bellube.</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-6 border-border-secondary bg-surface-primary/40 backdrop-blur-sm group hover:border-border-accent transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted uppercase tracking-[0.2em]">{metric.label}</p>
                <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${metric.bg} ${metric.color} group-hover:scale-110 transition-transform duration-300`}>
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
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Gateway Realtime Logs</span>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-status-error/40 hover:bg-status-error transition-colors" />
            <div className="w-3 h-3 rounded-full bg-status-warning/40 hover:bg-status-warning transition-colors" />
            <div className="w-3 h-3 rounded-full bg-status-success/40 hover:bg-status-success transition-colors" />
          </div>
        </header>
        <div className="p-6 font-mono text-sm leading-relaxed space-y-2 h-[400px] overflow-y-auto bg-surface-primary/40 scrollbar-thin scrollbar-thumb-surface-tertiary">
          {logs.map((log, i) => {
            const isInfo = log.includes('[INFO]');
            const isWarn = log.includes('[WARN]');
            const isDebug = log.includes('[DEBUG]');
            
            return (
              <div key={i} className="flex gap-4 group">
                <span className="text-muted text-[10px] w-4 opacity-50 group-hover:opacity-100 transition-opacity">{i + 1}</span>
                <span className={
                  isInfo ? 'text-status-info' :
                  isWarn ? 'text-status-warning' :
                  isDebug ? 'text-accent-secondary' : 'text-primary'
                }>
                  {log}
                </span>
              </div>
            );
          })}
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
