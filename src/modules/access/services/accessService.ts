import { HTTP_CREDENTIALS } from "@/core/http/auth";
import { httpClient } from "@/core/http/client";
import { httpEndpoints } from "@/core/http/endpoints";
import type {
  AccessInviteListResponse,
  AccessMembersResponse,
  CreateAccessInviteInput,
} from "../types";

export const accessService = {
  async getMembers(tenantId: string): Promise<AccessMembersResponse> {
    return httpClient.get<AccessMembersResponse>(httpEndpoints.access.members, {
      credentials: HTTP_CREDENTIALS.session,
      query: { tenant_id: tenantId },
    });
  },

  async listInvites(tenantId: string): Promise<AccessInviteListResponse> {
    return httpClient.get<AccessInviteListResponse>(
      httpEndpoints.invites.root,
      {
        credentials: HTTP_CREDENTIALS.session,
        query: { tenant_id: tenantId, page: 1, limit: 25 },
      },
    );
  },

  async createInvite(input: CreateAccessInviteInput): Promise<void> {
    await httpClient.post<void, CreateAccessInviteInput>(
      httpEndpoints.invites.create,
      input,
      {
        credentials: HTTP_CREDENTIALS.session,
        parseAs: "void",
        headers: { "Content-Type": "application/json" },
      },
    );
  },
};
