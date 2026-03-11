import { IntegrationConfig, SyncJob } from "@/pages/DataSync";
import { httpClient } from "@/core/http/client";
import { HTTP_CREDENTIALS } from "@/core/http/auth";
import { httpEndpoints } from "@/core/http/endpoints";
import { isSimulatedAuthEnabled } from "@/core/runtime/mode";
import { mockIntegrationConfigs, mockSyncJobs, waitMock } from "@/mocks";

const scopeTenantRecords = <T extends { tenant_id: string }>(
  records: T[],
  tenantId?: string,
): T[] =>
  tenantId
    ? records.map((record) => ({
        ...record,
        tenant_id: tenantId,
      }))
    : records;

export const getIntegrationConfigs = async (
  tenantId?: string,
): Promise<IntegrationConfig[]> => {
  if (isSimulatedAuthEnabled()) {
    await waitMock(600);
    return scopeTenantRecords(mockIntegrationConfigs, tenantId);
  }

  return await httpClient.get<IntegrationConfig[]>(
    httpEndpoints.sync.integrations,
    {
      credentials: HTTP_CREDENTIALS.session,
    },
  );
};

export const getSyncJobs = async (tenantId?: string): Promise<SyncJob[]> => {
  if (isSimulatedAuthEnabled()) {
    await waitMock(600);
    return scopeTenantRecords(mockSyncJobs, tenantId);
  }

  return await httpClient.get<SyncJob[]>(httpEndpoints.sync.jobs, {
    credentials: HTTP_CREDENTIALS.session,
  });
};
