import type { AcceptInviteReq, InviteDTO } from '@/types';

export const createMockInvite = (): InviteDTO => ({
  id: 'inv_123',
  email: 'rafael@kubex.world',
  name: 'Rafael',
  role: 'Administrator',
  tenant_id: 'tenant_bellube_01',
  status: 'pending',
  expires_at: new Date(Date.now() + 86400000).toISOString(),
  type: 'internal',
});

export const validateMockInviteToken = (token: string): InviteDTO => {
  if (token === 'invalid') {
    throw new Error('Este convite e invalido ou ja foi utilizado.');
  }

  if (token === 'expired') {
    throw new Error('Este convite expirou. Solicite um novo acesso.');
  }

  return createMockInvite();
};

export const acceptMockInvite = (_token: string, _data: AcceptInviteReq): void => {};
