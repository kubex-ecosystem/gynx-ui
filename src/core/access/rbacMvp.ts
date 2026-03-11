export type AppCapability =
  | "workspace.read"
  | "workspace.update"
  | "providers.read"
  | "providers.update"
  | "providers.test"
  | "sync.read"
  | "sync.update"
  | "invites.read"
  | "invites.create";

const CAPABILITY_PERMISSIONS: Record<AppCapability, string[]> = {
  "workspace.read": ["settings.read"],
  "workspace.update": ["settings.update"],
  "providers.read": ["settings.read"],
  "providers.update": ["settings.update"],
  "providers.test": ["settings.update"],
  "sync.read": ["settings.read"],
  "sync.update": ["settings.update"],
  "invites.read": ["user.read"],
  "invites.create": ["user.invite"],
};

export const hasWildcardPermission = (permissions: string[]): boolean =>
  permissions.includes("*");

export const hasCapability = (
  permissions: string[],
  capability: AppCapability,
): boolean => {
  if (hasWildcardPermission(permissions)) {
    return true;
  }

  return CAPABILITY_PERMISSIONS[capability].some((permission) =>
    permissions.includes(permission),
  );
};
