import { AcceptInviteReq, InviteDTO } from '@/types';
import { httpClient } from '@/core/http/client';
import { httpEndpoints } from '@/core/http/endpoints';
import { toHttpError } from '@/core/http/errors';
import { isSimulatedAuthEnabled } from '@/core/runtime/mode';
import { acceptMockInvite, validateMockInviteToken, waitMock } from '@/mocks';

const getErrorMessage = (error: unknown, fallback: string): string => {
    const normalized = toHttpError(error);
    const data = normalized.data as Record<string, unknown> | undefined;
    if (typeof data?.message === 'string' && data.message.length > 0) {
        return data.message;
    }
    return normalized.message || fallback;
};

export const validateInviteToken = async (token: string): Promise<InviteDTO> => {
    if (isSimulatedAuthEnabled()) {
        await waitMock(800);
        return validateMockInviteToken(token);
    }

    try {
        return await httpClient.get<InviteDTO>(httpEndpoints.invites.validate, {
            query: { token },
        });
    } catch (error) {
        throw new Error(
            getErrorMessage(error, 'Falha ao validar convite. Ele pode ser inválido ou expirado.')
        );
    }
};

export const acceptInvite = async (token: string, data: AcceptInviteReq): Promise<void> => {
    if (isSimulatedAuthEnabled()) {
        await waitMock(1500);
        acceptMockInvite(token, data);
        return;
    }

    try {
        await httpClient.post<void, AcceptInviteReq & { token: string }>(
            httpEndpoints.invites.accept,
            { token, ...data },
            { parseAs: 'void' }
        );
    } catch (error) {
        throw new Error(
            getErrorMessage(error, 'Erro ao processar seu cadastro. Tente novamente.')
        );
    }
};
