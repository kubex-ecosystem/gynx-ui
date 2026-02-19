import React, { useState } from 'react';
import { Database, Clock, Plus, CheckCircle2, AlertCircle, RefreshCcw, MoreVertical, Link2, Calendar, ToggleLeft, ToggleRight, Settings2, Activity } from 'lucide-react';
import Card from '../components/ui/Card';

// Real Data Schema Models
interface IntegrationConfig {
  id: string; // UUID
  tenant_id: string; // UUID
  type: 'MSSQL_ERP' | 'REST_API' | 'IMAP' | 'SMTP';
  name: string;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string; // ISO Date
  updated_at: string; // ISO Date
}

interface SyncJob {
  id: string; // UUID
  tenant_id: string; // UUID
  config_id: string; // UUID ref a IntegrationConfig
  task_name: string;
  cron_expression: string;
  is_active: boolean;
  last_sync_at: string | null;
}

// Mocks aligned with Schema
const mockConfigs: IntegrationConfig[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    tenant_id: 'b23ac10b-58cc-4372-a567-0e02b2c3d401',
    type: 'MSSQL_ERP',
    name: 'Sankhya Produção',
    settings: { host: '10.0.0.42', port: 1433, db: 'SANKHYA_PROD' },
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-02-15T14:30:00Z'
  },
  {
    id: 'a11bc10b-58cc-4372-a567-0e02b2c3d999',
    tenant_id: 'b23ac10b-58cc-4372-a567-0e02b2c3d401',
    type: 'REST_API',
    name: 'Logística Transfolha API',
    settings: { endpoint: 'https://api.transfolha.com.br/v2', auth: 'Bearer' },
    is_active: true,
    created_at: '2026-02-01T08:00:00Z',
    updated_at: '2026-02-18T09:15:00Z'
  },
  {
    id: 'c22cc10b-58cc-4372-a567-0e02b2c3d111',
    tenant_id: 'b23ac10b-58cc-4372-a567-0e02b2c3d401',
    type: 'IMAP',
    name: 'Google Workspace (Suporte)',
    settings: { host: 'imap.gmail.com', port: 993 },
    is_active: false,
    created_at: '2026-01-20T11:00:00Z',
    updated_at: '2026-02-10T16:40:00Z'
  }
];

const mockJobs: SyncJob[] = [
  {
    id: 'e11ec10b-58cc-4372-a567-0e02b2c3d001',
    tenant_id: 'b23ac10b-58cc-4372-a567-0e02b2c3d401',
    config_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    task_name: 'Sincronização de Pedidos',
    cron_expression: '0 */15 * * * *', // A cada 15 min
    is_active: true,
    last_sync_at: '2026-02-19T14:45:00Z'
  },
  {
    id: 'e11ec10b-58cc-4372-a567-0e02b2c3d002',
    tenant_id: 'b23ac10b-58cc-4372-a567-0e02b2c3d401',
    config_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    task_name: 'Atualização de Estoque Global',
    cron_expression: '0 0 3 * * *', // Todo dia às 03:00
    is_active: true,
    last_sync_at: '2026-02-19T03:00:05Z'
  },
  {
    id: 'e11ec10b-58cc-4372-a567-0e02b2c3d003',
    tenant_id: 'b23ac10b-58cc-4372-a567-0e02b2c3d401',
    config_id: 'a11bc10b-58cc-4372-a567-0e02b2c3d999',
    task_name: 'Web-Scraping Concorrentes',
    cron_expression: '0 0 12 * * 1-5', // Seg a Sex às 12:00
    is_active: false,
    last_sync_at: '2026-02-18T12:00:10Z'
  }
];

const DataSync: React.FC = () => {
  const [configs, setConfigs] = useState<IntegrationConfig[]>(mockConfigs);
  const [jobs, setJobs] = useState<SyncJob[]>(mockJobs);

  const toggleConfig = (id: string) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c));
  };

  const toggleJob = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, is_active: !j.is_active } : j));
  };

  const getTypeBadge = (type: IntegrationConfig['type']) => {
    const colors = {
      'MSSQL_ERP': 'text-accent-secondary bg-accent-muted border-accent-primary/30',
      'REST_API': 'text-status-info bg-status-info/10 border-status-info/30',
      'IMAP': 'text-status-warning bg-status-warning/10 border-status-warning/30',
      'SMTP': 'text-status-success bg-status-success/10 border-status-success/30',
    };
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${colors[type]}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent-primary uppercase tracking-[0.4em] text-xs font-bold">
            <Database size={16} /> Motor de Integração
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Sincronização e Fluxos</h2>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-border-primary bg-surface-primary text-secondary text-sm font-semibold hover:bg-surface-tertiary transition-all flex items-center justify-center gap-2">
            <RefreshCcw size={16} /> Atualizar Tudo
          </button>
          <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-accent-primary text-white text-sm font-bold hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/20">
            <Plus size={18} /> Nova Integração
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Database Connections */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <Link2 className="text-accent-secondary" size={20} /> Configurações de Origem
            </h3>
            <span className="text-xs font-bold text-muted uppercase tracking-widest">{configs.length} Ativas</span>
          </div>
          
          <Card className="p-0 overflow-hidden border-border-primary/50 bg-surface-primary/20 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-primary/80 border-b border-border-secondary">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted">Nome / Host</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted">Tipo</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-secondary/50">
                  {configs.map((config) => (
                    <tr key={config.id} className="hover:bg-surface-tertiary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-primary">{config.name}</span>
                          <span className="text-[10px] text-muted font-mono">{config.settings.host || config.settings.endpoint}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getTypeBadge(config.type)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button onClick={() => toggleConfig(config.id)} title={config.is_active ? "Desativar" : "Ativar"}>
                            {config.is_active ? 
                              <ToggleRight className="text-accent-primary" size={28} /> : 
                              <ToggleLeft className="text-muted" size={28} />
                            }
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-1.5 rounded-lg hover:bg-surface-tertiary text-secondary transition-colors"><Settings2 size={16} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-surface-tertiary text-muted transition-colors"><MoreVertical size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* Sync Jobs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <Activity className="text-accent-secondary" size={20} /> Jobs Agendados (Sync)
            </h3>
            <span className="text-xs font-bold text-muted uppercase tracking-widest">{jobs.length} Cronjobs</span>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <Card key={job.id} className="p-5 border-border-secondary bg-surface-primary/40 backdrop-blur-sm group hover:border-border-accent transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${
                      job.is_active ? 'bg-status-success/10 text-status-success' : 'bg-surface-tertiary text-muted'
                    } border border-transparent group-hover:border-current/30 transition-colors`}>
                      <Clock size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-primary">{job.task_name}</h4>
                      <div className="flex items-center gap-3 text-[10px] text-muted uppercase tracking-wider font-bold">
                        <span className="flex items-center gap-1 font-mono text-accent-secondary"><Calendar size={10} /> {job.cron_expression}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> Ultima: {job.last_sync_at ? new Date(job.last_sync_at).toLocaleTimeString() : 'Nunca'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right flex flex-col items-end gap-1">
                       <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        job.is_active ? 'bg-status-success/10 text-status-success border border-status-success/30' : 'bg-surface-tertiary text-muted border border-border-primary'
                      }`}>
                        {job.is_active ? 'Ativo' : 'Pausado'}
                      </span>
                    </div>
                    <button onClick={() => toggleJob(job.id)} className="transition-transform hover:scale-110">
                      {job.is_active ? 
                        <ToggleRight className="text-status-success" size={32} /> : 
                        <ToggleLeft className="text-muted" size={32} />
                      }
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DataSync;
