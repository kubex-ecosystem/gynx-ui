import { useAuthStore } from '@/store/useAuthStore';

export const useRBAC = () => {
  const { permissions, activeRoleCode } = useAuthStore();

  const hasPermission = (permissionCode: string): boolean => {
    // Caso seja um super admin com permissão curinga '*'
    if (permissions.includes('*')) return true;
    return permissions.includes(permissionCode);
  };

  const hasRole = (roleCode: string): boolean => {
    return activeRoleCode === roleCode;
  };

  const hasAnyPermission = (permissionsToCheck: string[]): boolean => {
    if (permissions.includes('*')) return true;
    return permissionsToCheck.some((perm) => permissions.includes(perm));
  };

  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
  };
};
