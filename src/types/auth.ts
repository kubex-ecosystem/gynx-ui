export interface Tenant {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  plan: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  last_name: string;
}

export interface AuthContext {
  user: User | null;
  activeTenant: Tenant | null;
  activeRoleCode: string | null;
  permissions: string[];
  isAuthenticated: boolean;
}
