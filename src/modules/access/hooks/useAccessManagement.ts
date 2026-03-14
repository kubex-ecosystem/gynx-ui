import { useCallback, useEffect, useState } from "react";
import { toHttpError } from "@/core/http/errors";
import { accessService } from "../services/accessService";
import type {
  AccessInvite,
  AccessMember,
  AccessRole,
  CreateAccessInviteInput,
  UpdateAccessMemberRoleInput,
} from "../types";

const getErrorMessage = (error: unknown, fallback: string): string => {
  const normalized = toHttpError(error);
  const data = normalized.data as Record<string, unknown> | undefined;
  if (typeof data?.error === "string" && data.error.length > 0) {
    return data.error;
  }
  if (typeof data?.message === "string" && data.message.length > 0) {
    return data.message;
  }
  return normalized.message || fallback;
};

export const useAccessManagement = (tenantId?: string | null) => {
  const [members, setMembers] = useState<AccessMember[]>([]);
  const [roles, setRoles] = useState<AccessRole[]>([]);
  const [invites, setInvites] = useState<AccessInvite[]>([]);
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);
  const [currentRoleCode, setCurrentRoleCode] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [isUpdatingRoleFor, setIsUpdatingRoleFor] = useState<string | null>(
    null,
  );
  const [latestCreatedInvite, setLatestCreatedInvite] =
    useState<AccessInvite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tenantId) {
      setMembers([]);
      setRoles([]);
      setInvites([]);
      setCurrentPermissions([]);
      setCurrentRoleCode(null);
      setCurrentUserId(null);
      setLatestCreatedInvite(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [membersResponse, invitesResponse] = await Promise.all([
        accessService.getMembers(tenantId),
        accessService.listInvites(tenantId),
      ]);

      setMembers(membersResponse.members);
      setRoles(membersResponse.roles);
      setInvites(
        Array.isArray(invitesResponse.data) ? invitesResponse.data : [],
      );
      setCurrentPermissions(membersResponse.current_permissions);
      setCurrentRoleCode(membersResponse.current_role_code || null);
      setCurrentUserId(membersResponse.current_user_id || null);
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Failed to load access management data for the active tenant.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const createInvite = useCallback(
    async (input: CreateAccessInviteInput) => {
      setIsCreatingInvite(true);
      setStatusMessage(null);
      setError(null);
      setLatestCreatedInvite(null);

      try {
        const invite = await accessService.createInvite(input);
        setLatestCreatedInvite(invite);
        setStatusMessage(`Invite created for ${input.email}.`);
        await load();
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Failed to create invite for the active tenant.",
          ),
        );
      } finally {
        setIsCreatingInvite(false);
      }
    },
    [load],
  );

  const updateMemberRole = useCallback(
    async (userId: string, input: UpdateAccessMemberRoleInput) => {
      setIsUpdatingRoleFor(userId);
      setStatusMessage(null);
      setError(null);

      try {
        const response = await accessService.updateMemberRole(userId, input);
        setStatusMessage(response.message);
        await load();
      } catch (error) {
        setError(
          getErrorMessage(error, "Failed to update tenant member role."),
        );
      } finally {
        setIsUpdatingRoleFor(null);
      }
    },
    [load],
  );

  return {
    members,
    roles,
    invites,
    currentPermissions,
    currentRoleCode,
    currentUserId,
    isLoading,
    isCreatingInvite,
    isUpdatingRoleFor,
    error,
    statusMessage,
    latestCreatedInvite,
    reload: load,
    createInvite,
    updateMemberRole,
  };
};
