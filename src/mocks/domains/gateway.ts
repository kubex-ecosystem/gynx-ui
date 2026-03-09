import type { GatewayLog, GatewayMetrics } from '@/services/gatewayService';

export const mockGatewayMetrics: GatewayMetrics = {
  status: 'ONLINE',
  requestsPerMinute: 1200,
  connectedServices: 4,
  averageLatencyMs: 42,
};

export const mockGatewayLogs: GatewayLog[] = [
  { level: 'INFO', timestamp: '2026-02-19T14:32:01.000Z', message: 'GNyx Gateway v1.0.2 iniciado com sucesso.' },
  { level: 'DEBUG', timestamp: '2026-02-19T14:32:05.000Z', message: 'Conectando ao provedor Gemini Pro via BYOK.' },
  { level: 'INFO', timestamp: '2026-02-19T14:32:10.000Z', message: 'Carregando 4 servicos do manifest GNyx.' },
  { level: 'WARN', timestamp: '2026-02-19T14:35:42.000Z', message: 'Latencia elevada detectada no servico MailHub (85ms).' },
  { level: 'INFO', timestamp: '2026-02-19T14:40:12.000Z', message: 'Cache de rotas atualizado.' },
  { level: 'DEBUG', timestamp: '2026-02-19T14:42:01.000Z', message: 'Requisicao recebida: GET /api/v1/status' },
  { level: 'INFO', timestamp: '2026-02-19T14:45:33.000Z', message: 'Sincronizacao de dados ERP Sankhya concluida.' },
];
