import { IntegrationConfig, SyncJob } from '@/pages/DataSync';
import { httpClient } from '@/core/http/client';
import { HTTP_CREDENTIALS } from '@/core/http/auth';
import { httpEndpoints } from '@/core/http/endpoints';
import { isSimulatedAuthEnabled } from '@/core/runtime/mode';
import { mockIntegrationConfigs, mockSyncJobs, waitMock } from '@/mocks';

export const getIntegrationConfigs = async (): Promise<IntegrationConfig[]> => {
    if (isSimulatedAuthEnabled()) {
        await waitMock(600);
        return mockIntegrationConfigs;
    }

    return httpClient.get<IntegrationConfig[]>(httpEndpoints.sync.integrations, {
        credentials: HTTP_CREDENTIALS.session,
    });
};

export const getSyncJobs = async (): Promise<SyncJob[]> => {
    if (isSimulatedAuthEnabled()) {
        await waitMock(600);
        return mockSyncJobs;
    }

    return httpClient.get<SyncJob[]>(httpEndpoints.sync.jobs, {
        credentials: HTTP_CREDENTIALS.session,
    });
};
