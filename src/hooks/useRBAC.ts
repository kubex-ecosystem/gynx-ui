import { useAuth } from "@/context/AuthContext";
import {
  hasCapability,
  hasWildcardPermission,
  type AppCapability,
} from "@/core/access/rbacMvp";

export const useRBAC = () => {
  const { permissions, activeRoleCode } = useAuth();

  const hasPermission = (permissionCode: string): boolean => {
    if (hasWildcardPermission(permissions)) return true;
    return permissions.includes(permissionCode);
  };

  const hasRole = (roleCode: string): boolean => {
    return activeRoleCode === roleCode;
  };

  const hasAnyPermission = (permissionsToCheck: string[]): boolean => {
    if (hasWildcardPermission(permissions)) return true;
    return permissionsToCheck.some((perm) => permissions.includes(perm));
  };

  const hasAppCapability = (capability: AppCapability): boolean => {
    return hasCapability(permissions, capability);
  };

  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAppCapability,
  };
};
