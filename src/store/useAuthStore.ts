import { create } from 'zustand';
import { AuthContext, Tenant } from '@/types/auth';

interface AuthStore extends AuthContext {
  login: (context: AuthContext) => void;
  logout: () => void;
  switchTenant: (tenant: Tenant, newRole: string, newPermissions: string[]) => void;
  setMockAdminContext: () => void;
}

const initialState: AuthContext = {
  user: null,
  activeTenant: null,
  activeRoleCode: null,
  permissions: [],
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  login: (context) => set({ ...context, isAuthenticated: true }),

  logout: () => set(initialState),

  switchTenant: (tenant, newRole, newPermissions) =>
    set((state) => ({
      ...state,
      activeTenant: tenant,
      activeRoleCode: newRole,
      permissions: newPermissions,
    })),

  // Função para mock de ambiente de dev como Admin do sistema
  setMockAdminContext: () => {
    set({
      user: {
        id: 'user-mock-123',
        email: 'admin@bellube.com',
        name: 'Admin',
        last_name: 'Bellube',
      },
      activeTenant: {
        id: 'tenant-mock-456',
        org_id: 'org-mock-789',
        name: 'Bellube Global',
        slug: 'bellube',
        plan: 'enterprise',
      },
      activeRoleCode: 'admin',
      permissions: [
        '*', // curinga para admin
        'deal.read',
        'deal.create',
        'deal.update',
        'deal.delete',
        'partner.read',
        'partner.create',
        'commission.read',
        'commission.approve',
        'settings.read',
        'settings.update',
      ],
      isAuthenticated: true,
    });
  },
}));
