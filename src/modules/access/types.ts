export interface AccessMember {
  id: string;
  email: string;
  name: string;
  last_name?: string;
  status: string;
  tenant_id: string;
  role_id: string;
  role_code?: string;
  role_name?: string;
  is_active: boolean;
  created_at: string;
  permissions: string[];
}

export interface AccessRole {
  id: string;
  code: string;
  display_name: string;
  description?: string;
  is_system_role: boolean;
  permission_count: number;
}

export interface AccessMembersResponse {
  tenant_id: string;
  current_user_id: string;
  current_role_code?: string;
  current_permissions: string[];
  members: AccessMember[];
  roles: AccessRole[];
}

export interface UpdateAccessMemberRoleInput {
  tenant_id: string;
  role_code: string;
}

export interface UpdateAccessMemberRoleResponse {
  message: string;
  member: AccessMember;
}

export interface AccessInvite {
  id: string;
  name?: string;
  token?: string;
  email: string;
  role: string;
  tenant_id: string;
  team_id?: string;
  status: string;
  expires_at: string;
  type?: string;
}

export interface AccessInviteListResponse {
  data: AccessInvite[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CreateAccessInviteInput {
  name: string;
  email: string;
  tenant_id: string;
  type: "internal" | "partner";
  role: string;
}
