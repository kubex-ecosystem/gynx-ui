import { httpClient } from '@/core/http/client';
import { HTTP_CREDENTIALS } from '@/core/http/auth';
import { httpEndpoints } from '@/core/http/endpoints';
import { isSimulatedAuthEnabled } from '@/core/runtime/mode';
import { mockGatewayLogs, mockGatewayMetrics, waitMock } from '@/mocks';

export interface GatewayMetrics {
    status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
    requestsPerMinute: number;
    connectedServices: number;
    averageLatencyMs: number;
}

export interface GatewayLog {
    level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
    timestamp: string;
    message: string;
}

export const getGatewayMetrics = async (): Promise<GatewayMetrics> => {
    if (isSimulatedAuthEnabled()) {
        await waitMock(600);
        return mockGatewayMetrics;
    }

    return await httpClient.get<GatewayMetrics>(httpEndpoints.gateway.metrics, {
        credentials: HTTP_CREDENTIALS.session,
    });
};

export const getGatewayLogs = async (limit: number = 20): Promise<GatewayLog[]> => {
    if (isSimulatedAuthEnabled()) {
        await waitMock(800);
        return mockGatewayLogs.slice(-limit);
    }

    return await httpClient.get<GatewayLog[]>(httpEndpoints.gateway.logs, {
        credentials: HTTP_CREDENTIALS.session,
        query: { limit },
    });
};
