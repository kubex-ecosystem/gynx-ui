import { AcceptInviteReq, InviteDTO } from '../types';

const isSimulated = import.meta.env.VITE_SIMULATE_AUTH === 'true';

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

    const response = await fetch(`/api/v1/invites/validate?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao validar convite. Ele pode ser inválido ou expirado.');
    }

    return response.json();
};

export const acceptInvite = async (token: string, data: AcceptInviteReq): Promise<void> => {
    if (isSimulated) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return;
    }

    const response = await fetch('/api/v1/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...data })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao processar seu cadastro. Tente novamente.');
    }
};
