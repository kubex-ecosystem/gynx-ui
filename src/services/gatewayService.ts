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

const isSimulated = import.meta.env.VITE_SIMULATE_AUTH === 'true';

const mockMetrics: GatewayMetrics = {
    status: 'ONLINE',
    requestsPerMinute: 1200,
    connectedServices: 4,
    averageLatencyMs: 42,
};

const mockLogs: GatewayLog[] = [
    { level: 'INFO', timestamp: '2026-02-19T14:32:01.000Z', message: 'GNyx Gateway v1.0.2 iniciado com sucesso.' },
    { level: 'DEBUG', timestamp: '2026-02-19T14:32:05.000Z', message: 'Conectando ao provedor Gemini Pro via BYOK.' },
    { level: 'INFO', timestamp: '2026-02-19T14:32:10.000Z', message: 'Carregando 4 serviços do manifest GNyx.' },
    { level: 'WARN', timestamp: '2026-02-19T14:35:42.000Z', message: 'Latência elevada detectada no serviço MailHub (85ms).' },
    { level: 'INFO', timestamp: '2026-02-19T14:40:12.000Z', message: 'Cache de rotas atualizado.' },
    { level: 'DEBUG', timestamp: '2026-02-19T14:42:01.000Z', message: 'Requisição recebida: GET /api/v1/status' },
    { level: 'INFO', timestamp: '2026-02-19T14:45:33.000Z', message: 'Sincronização de dados ERP Sankhya concluída.' },
];

export const getGatewayMetrics = async (): Promise<GatewayMetrics> => {
    if (isSimulated) {
        await new Promise(r => setTimeout(r, 600));
        return mockMetrics;
    }

    const response = await fetch('/api/v1/gateway/metrics', { credentials: 'include' });
    if (!response.ok) throw new Error('Falha ao buscar métricas do gateway');
    return response.json();
};

export const getGatewayLogs = async (limit: number = 20): Promise<GatewayLog[]> => {
    if (isSimulated) {
        await new Promise(r => setTimeout(r, 800));
        return mockLogs.slice(-limit);
    }

    const response = await fetch(`/api/v1/gateway/logs?limit=${limit}`, { credentials: 'include' });
    if (!response.ok) throw new Error('Falha ao buscar logs do gateway');
    return response.json();
};
