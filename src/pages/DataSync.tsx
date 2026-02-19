import React from 'react';
import { Database, Clock, Plus, CheckCircle2, AlertCircle, RefreshCcw, MoreVertical, Link2, Calendar } from 'lucide-react';
import Card from '../components/ui/Card';

// Types
type DBConnection = {
  id: string;
  name: string;
  type: 'PostgreSQL' | 'MySQL' | 'Sankhya' | 'Oracle';
  host: string;
  status: 'Connected' | 'Error' | 'Syncing';
  lastSync: string;
};

type Cronjob = {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  status: 'Success' | 'Failed' | 'Pending';
  duration: string;
};

// Mocks
const mockConnections: DBConnection[] = [
  { id: '1', name: 'ERP Sankhya Production', type: 'Sankhya', host: '10.0.0.42', status: 'Connected', lastSync: '10 mins ago' },
  { id: '2', name: 'Legacy MySQL Warehouse', type: 'MySQL', host: 'db.bellube.internal', status: 'Syncing', lastSync: 'Syncing now...' },
  { id: '3', name: 'Customer Analytics (PG)', type: 'PostgreSQL', host: 'pg-prod-01.kubex.cloud', status: 'Connected', lastSync: '1 hour ago' },
  { id: '4', name: 'Oracle Archive DB', type: 'Oracle', host: 'archive.local', status: 'Error', lastSync: '2 days ago' },
];

const mockCronjobs: Cronjob[] = [
  { id: '1', name: 'Daily ERP Sync', schedule: '03:00 AM', lastRun: 'Today, 03:02 AM', status: 'Success', duration: '12m 45s' },
  { id: '2', name: 'MailHub AI Indexing', schedule: 'Every 30 mins', lastRun: '14:30 PM', status: 'Success', duration: '45s' },
  { id: '3', name: 'Cache Cleanup Service', schedule: '00:00 AM', lastRun: 'Yesterday, 00:01 AM', status: 'Success', duration: '12s' },
  { id: '4', name: 'Backup Gateway Config', schedule: 'Weekly (Sun)', lastRun: 'Feb 15, 01:00 AM', status: 'Failed', duration: '0s' },
];

const DataSync: React.FC = () => {
  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent-primary uppercase tracking-[0.4em] text-xs font-bold">
            <Database size={16} /> Data & Orchestration
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Sync & Cronjobs</h2>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-border-primary bg-surface-primary text-secondary text-sm font-semibold hover:bg-surface-tertiary transition-all flex items-center justify-center gap-2">
            <RefreshCcw size={16} /> Refresh All
          </button>
          <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-accent-primary text-white text-sm font-bold hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/20">
            <Plus size={18} /> New Sync Task
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Database Connections */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <Link2 className="text-accent-secondary" size={20} /> Active Connections
            </h3>
            <span className="text-xs font-bold text-muted uppercase tracking-widest">{mockConnections.length} Total</span>
          </div>
          
          <Card className="p-0 overflow-hidden border-border-primary/50 bg-surface-primary/20 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-primary/80 border-b border-border-secondary">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted">Source</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted">Type</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted">Last Sync</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-secondary/50">
                  {mockConnections.map((conn) => (
                    <tr key={conn.id} className="hover:bg-surface-tertiary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-primary">{conn.name}</span>
                          <span className="text-[10px] text-muted font-mono">{conn.host}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-secondary bg-surface-tertiary px-2 py-1 rounded-lg border border-border-primary/50">
                          {conn.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          {conn.status === 'Connected' ? <CheckCircle2 className="text-status-success" size={14} /> : 
                           conn.status === 'Syncing' ? <RefreshCcw className="text-accent-secondary animate-spin" size={14} /> :
                           <AlertCircle className="text-status-error" size={14} />}
                          <span className={
                            conn.status === 'Connected' ? 'text-status-success' : 
                            conn.status === 'Syncing' ? 'text-accent-secondary' : 'text-status-error'
                          }>{conn.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted">{conn.lastSync}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-surface-tertiary text-muted transition-colors"><MoreVertical size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* Cronjobs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <Calendar className="text-accent-secondary" size={20} /> Active Cronjobs
            </h3>
            <span className="text-xs font-bold text-muted uppercase tracking-widest">{mockCronjobs.length} Scheduled</span>
          </div>

          <div className="space-y-3">
            {mockCronjobs.map((job) => (
              <Card key={job.id} className="p-5 border-border-secondary bg-surface-primary/40 backdrop-blur-sm group hover:border-border-accent transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${
                      job.status === 'Success' ? 'bg-status-success/10 text-status-success' :
                      job.status === 'Failed' ? 'bg-status-error/10 text-status-error' :
                      'bg-status-warning/10 text-status-warning'
                    } border border-transparent group-hover:border-current/30 transition-colors`}>
                      <Clock size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-primary">{job.name}</h4>
                      <div className="flex items-center gap-3 text-[10px] text-muted uppercase tracking-wider font-bold">
                        <span className="flex items-center gap-1"><Calendar size={10} /> {job.schedule}</span>
                        <span className="flex items-center gap-1"><Zap size={10} /> {job.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      job.status === 'Success' ? 'bg-status-success/10 text-status-success border border-status-success/30' :
                      job.status === 'Failed' ? 'bg-status-error/10 text-status-error border border-status-error/30' :
                      'bg-status-warning/10 text-status-warning border border-status-warning/30'
                    }`}>
                      {job.status}
                    </span>
                    <p className="text-[10px] text-muted font-medium">Last: {job.lastRun}</p>
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
