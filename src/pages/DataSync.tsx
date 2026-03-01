import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  Link2,
  MoreVertical,
  Plus,
  RefreshCcw,
  Zap,
} from "lucide-react";
import React from "react";
import Card from "../components/ui/Card";

// Types
// Types aligned with Go Backend Schema
export interface IntegrationConfig {
  id: string; // UUID
  tenant_id: string; // UUID
  type: "MSSQL_ERP" | "REST_API" | "IMAP" | "SMTP" | string;
  name: string;
  settings: Record<string, any>; // JSON with connection details
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SyncJob {
  id: string; // UUID
  tenant_id: string; // UUID
  config_id: string; // Reference to IntegrationConfig
  task_name: string;
  cron_expression: string;
  is_active: boolean;
  last_sync_at: string | null;
  status?: "Success" | "Failed" | "Pending" | "Syncing"; // For UI State
  duration?: string; // For UI display
}

// Mocks
const mockConnections: IntegrationConfig[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    tenant_id: "tenant-mock-456",
    type: "MSSQL_ERP",
    name: "ERP Sankhya Production",
    settings: { host: "10.0.0.42", port: 1433 },
    is_active: true,
    updated_at: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: "a3b4c5d6-e7f8-9a0b-1c2d-3e4f5a6b7c8d",
    tenant_id: "tenant-mock-456",
    type: "MySQL",
    name: "Legacy MySQL Warehouse",
    settings: { host: "db.bellube.internal", port: 3306 },
    is_active: false,
    updated_at: new Date().toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    tenant_id: "tenant-mock-456",
    type: "REST_API",
    name: "Customer Analytics",
    settings: { endpoint: "https://api.analytics.com/v1" },
    is_active: true,
    updated_at: new Date(Date.now() - 60 * 60000).toISOString(),
  },
];

const mockCronjobs: SyncJob[] = [
  {
    id: "1",
    tenant_id: "tenant-mock-456",
    config_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    task_name: "Daily ERP Sync",
    cron_expression: "0 3 * * *", // 03:00 AM every day
    is_active: true,
    last_sync_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    status: "Success",
    duration: "12m 45s",
  },
  {
    id: "2",
    tenant_id: "tenant-mock-456",
    config_id: "550e8400-e29b-41d4-a716-446655440000",
    task_name: "Customer Data Indexing",
    cron_expression: "*/30 * * * *", // Every 30 minutes
    is_active: true,
    last_sync_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: "Success",
    duration: "45s",
  },
  {
    id: "4",
    tenant_id: "tenant-mock-456",
    config_id: "a3b4c5d6-e7f8-9a0b-1c2d-3e4f5a6b7c8d",
    task_name: "Legacy DB Backup",
    cron_expression: "0 1 * * 0", // 01:00 AM every Sunday
    is_active: false,
    last_sync_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: "Failed",
    duration: "0s",
  },
];

const DataSync: React.FC = () => {
  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent-primary uppercase tracking-[0.4em] text-xs font-bold">
            <Database size={16} /> Data & Orchestration
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Sync & Cronjobs
          </h2>
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
              <Link2 className="text-accent-secondary" size={20} />{" "}
              Active Connections
            </h3>
            <span className="text-xs font-bold text-muted uppercase tracking-widest">
              {mockConnections.length} Total
            </span>
          </div>

          <Card className="p-0 overflow-hidden border-border-primary/50 bg-surface-primary/20 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-primary/80 border-b border-border-secondary">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted">
                      Source
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted">
                      Type
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted">
                      Last Sync
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-secondary/50">
                  {mockConnections.map((conn) => (
                    <tr
                      key={conn.id}
                      className="hover:bg-surface-tertiary/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-primary">
                            {conn.name}
                          </span>
                          <span className="text-[10px] text-muted font-mono">
                            {conn.settings?.host || conn.settings?.endpoint || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-secondary bg-surface-tertiary px-2 py-1 rounded-lg border border-border-primary/50">
                          {conn.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          {conn.is_active
                            ? (
                              <CheckCircle2
                                className="text-status-success"
                                size={14}
                              />
                            )
                            : (
                              <AlertCircle
                                className="text-status-error"
                                size={14}
                              />
                            )}
                          <span
                            className={conn.is_active
                              ? "text-status-success"
                              : "text-status-error"}
                          >
                            {conn.is_active ? "Connected" : "Disconnected"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted">
                        {conn.updated_at ? new Date(conn.updated_at).toLocaleString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          title="More actions"
                          name="more-actions"
                          className="p-1.5 rounded-lg hover:bg-surface-tertiary text-muted transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
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
              <Calendar className="text-accent-secondary" size={20} />{" "}
              Active Cronjobs
            </h3>
            <span className="text-xs font-bold text-muted uppercase tracking-widest">
              {mockCronjobs.length} Scheduled
            </span>
          </div>

          <div className="space-y-3">
            {mockCronjobs.map((job) => (
              <Card
                key={job.id}
                className="p-5 border-border-secondary bg-surface-primary/40 backdrop-blur-sm group hover:border-border-accent transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-2xl ${
                        job.status === "Success"
                          ? "bg-status-success/10 text-status-success"
                          : job.status === "Failed"
                          ? "bg-status-error/10 text-status-error"
                          : "bg-status-warning/10 text-status-warning"
                      } border border-transparent group-hover:border-current/30 transition-colors`}
                    >
                      <Clock size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-primary">
                        {job.task_name}
                      </h4>
                      <div className="flex items-center gap-3 text-[10px] text-muted uppercase tracking-wider font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} /> {job.cron_expression}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap size={10} /> {job.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        job.status === "Success"
                          ? "bg-status-success/10 text-status-success border border-status-success/30"
                          : job.status === "Failed"
                          ? "bg-status-error/10 text-status-error border border-status-error/30"
                          : "bg-status-warning/10 text-status-warning border border-status-warning/30"
                      }`}
                    >
                      {job.status}
                    </span>
                    <p className="text-[10px] text-muted font-medium">
                      Last: {job.last_sync_at ? new Date(job.last_sync_at).toLocaleString() : "Never"}
                    </p>
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
