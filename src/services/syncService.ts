import { IntegrationConfig, SyncJob } from '@/pages/DataSync';
import { httpClient } from '@/core/http/client';

const isSimulated = import.meta.env.VITE_SIMULATE_AUTH === 'true';

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
        cron_expression: "0 3 * * *",
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
        cron_expression: "*/30 * * * *",
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
        cron_expression: "0 1 * * 0",
        is_active: false,
        last_sync_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        status: "Failed",
        duration: "0s",
    },
];

export const getIntegrationConfigs = async (): Promise<IntegrationConfig[]> => {
    if (isSimulated) {
        await new Promise(r => setTimeout(r, 600));
        return mockConnections;
    }

    return httpClient.get<IntegrationConfig[]>('/integrations', {
        credentials: 'include',
    });
};

export const getSyncJobs = async (): Promise<SyncJob[]> => {
    if (isSimulated) {
        await new Promise(r => setTimeout(r, 600));
        return mockCronjobs;
    }

    return httpClient.get<SyncJob[]>('/sync-jobs', {
        credentials: 'include',
    });
};
