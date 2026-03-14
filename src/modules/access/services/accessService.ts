import { HTTP_CREDENTIALS } from "@/core/http/auth";
import { httpClient } from "@/core/http/client";
import { httpEndpoints } from "@/core/http/endpoints";
import type {
  AccessInvite,
  AccessInviteListResponse,
  AccessMembersResponse,
  CreateAccessInviteInput,
  UpdateAccessMemberRoleInput,
  UpdateAccessMemberRoleResponse,
} from "../types";

interface APIEnvelope<T> {
  status: string;
  message?: string;
  data: T;
}

export const accessService = {
  async getMembers(tenantId: string): Promise<AccessMembersResponse> {
    return httpClient.get<AccessMembersResponse>(httpEndpoints.access.members, {
      credentials: HTTP_CREDENTIALS.session,
      query: { tenant_id: tenantId },
    });
  },

  async listInvites(tenantId: string): Promise<AccessInviteListResponse> {
    const response = await httpClient.get<
      APIEnvelope<AccessInviteListResponse>
    >(httpEndpoints.invites.root, {
      credentials: HTTP_CREDENTIALS.session,
      query: { tenant_id: tenantId, page: 1, limit: 25, type: "internal" },
    });
    return response.data;
  },

  async createInvite(input: CreateAccessInviteInput): Promise<AccessInvite> {
    return httpClient.post<AccessInvite, CreateAccessInviteInput>(
      httpEndpoints.invites.create,
      input,
      {
        credentials: HTTP_CREDENTIALS.session,
        headers: { "Content-Type": "application/json" },
      },
    );
  },

  async updateMemberRole(
    userId: string,
    input: UpdateAccessMemberRoleInput,
  ): Promise<UpdateAccessMemberRoleResponse> {
    return httpClient.patch<
      UpdateAccessMemberRoleResponse,
      UpdateAccessMemberRoleInput
    >(httpEndpoints.access.memberRole(userId), input, {
      credentials: HTTP_CREDENTIALS.session,
      headers: { "Content-Type": "application/json" },
    });
  },
};
