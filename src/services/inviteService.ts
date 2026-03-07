import { AcceptInviteReq, InviteDTO } from '@/types';
import { HttpError, httpClient } from '@/core/http/client';

const isSimulated = import.meta.env.VITE_SIMULATE_AUTH === 'true';

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof HttpError) {
        const data = error.data as Record<string, unknown> | undefined;
        if (typeof data?.message === 'string' && data.message.length > 0) {
            return data.message;
        }
        return error.message || fallback;
    }
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
};

export const validateInviteToken = async (token: string): Promise<InviteDTO> => {
    if (isSimulated) {
        await new Promise(resolve => setTimeout(resolve, 800));

        if (token === 'invalid') {
            throw new Error('Este convite é inválido ou já foi utilizado.');
        }
        if (token === 'expired') {
            throw new Error('Este convite expirou. Solicite um novo acesso.');
        }

        return {
            id: "inv_123",
            email: "rafael@kubex.world",
            name: "Rafael",
            role: "Administrator",
            tenant_id: "tenant_bellube_01",
            status: "pending",
            expires_at: new Date(Date.now() + 86400000).toISOString(),
            type: "internal",
        };
    }

    try {
        return await httpClient.get<InviteDTO>('/invites/validate', {
            query: { token },
        });
    } catch (error) {
        throw new Error(
            getErrorMessage(error, 'Falha ao validar convite. Ele pode ser inválido ou expirado.')
        );
    }
};

export const acceptInvite = async (token: string, data: AcceptInviteReq): Promise<void> => {
    if (isSimulated) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return;
    }

    try {
        await httpClient.post<void, AcceptInviteReq & { token: string }>(
            '/invites/accept',
            { token, ...data },
            { parseAs: 'void' }
        );
    } catch (error) {
        throw new Error(
            getErrorMessage(error, 'Erro ao processar seu cadastro. Tente novamente.')
        );
    }
};
