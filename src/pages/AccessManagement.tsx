import {
  AlertCircle,
  LoaderCircle,
  MailPlus,
  RefreshCcw,
  Save,
  Shield,
  Users,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import AccessNotice from "@/components/security/AccessNotice";
import Card from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { useRBAC } from "@/hooks/useRBAC";
import { useAccessManagement } from "@/modules/access/hooks/useAccessManagement";

const AccessManagement: React.FC = () => {
  const { activeTenant, activeRoleName } = useAuth();
  const { hasPermission, hasAppCapability } = useRBAC();
  const canReadAccess = hasPermission("user.read");
  const canCreateInvite = hasAppCapability("invites.create");
  const canManageRoles = hasPermission("role.manage");
  const {
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
    reload,
    createInvite,
    updateMemberRole,
  } = useAccessManagement(activeTenant?.id);

  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [roleDrafts, setRoleDrafts] = useState<Record<string, string>>({});

  const inviteRoleOptions = useMemo(
    () =>
      roles.filter((role) =>
        [
          "admin",
          "manager",
          "viewer",
          "partner_admin",
          "partner_manager",
          "partner_rep",
          "finance",
          "cs",
        ].includes(role.code),
      ),
    [roles],
  );

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTenant?.id || !inviteRole) {
      return;
    }

    await createInvite({
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      tenant_id: activeTenant.id,
      type: "internal",
    });

    setInviteName("");
    setInviteEmail("");
    setInviteRole("");
  };

  const handleRoleSave = async (userId: string, currentRoleCode?: string) => {
    if (!activeTenant?.id) {
      return;
    }

    const nextRoleCode = roleDrafts[userId] || currentRoleCode;
    if (!nextRoleCode || nextRoleCode === currentRoleCode) {
      return;
    }

    await updateMemberRole(userId, {
      tenant_id: activeTenant.id,
      role_code: nextRoleCode,
    });

    setRoleDrafts((current) => {
      const next = { ...current };
      delete next[userId];
      return next;
    });
  };

  if (!canReadAccess) {
    return (
      <div className="space-y-6 animate-fade-in">
        <AccessNotice
          title="Access restricted"
          description="This area requires the `user.read` permission in the active tenant scope."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.4em] text-accent-primary">
            <Shield size={16} /> Access Management MVP
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary">
            Tenant Members, Roles and Invites
          </h2>
          <p className="mt-2 text-sm text-secondary">
            Current scope:{" "}
            <span className="font-semibold text-primary">
              {activeTenant?.name ||
                activeTenant?.slug ||
                activeTenant?.id ||
                "No tenant"}
            </span>
            {activeRoleName && (
              <span className="text-muted"> · {activeRoleName}</span>
            )}
          </p>
        </div>

        <button
          onClick={() => void reload()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-primary bg-surface-primary px-4 py-2 text-sm font-semibold text-secondary transition-all hover:bg-surface-tertiary"
        >
          <RefreshCcw size={16} /> Refresh
        </button>
      </header>

      {statusMessage && (
        <Card className="border-status-success/30 bg-status-success/5 p-4 text-sm text-status-success">
          {statusMessage}
        </Card>
      )}

      {error && (
        <Card className="border-status-error/30 bg-status-error/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 text-status-error" size={18} />
            <div>
              <p className="text-sm font-semibold text-primary">
                Access management failed to load
              </p>
              <p className="mt-1 text-xs text-secondary">{error}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-primary">Tenant Members</h3>
              <p className="text-xs text-secondary">
                Real memberships and effective permissions from the active
                tenant.
              </p>
            </div>
            <span className="rounded-full border border-border-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted">
              {members.length} members
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border-primary bg-surface-secondary/40 p-5 text-secondary">
              <LoaderCircle size={18} className="animate-spin" />
              <div>
                <p className="text-sm font-semibold text-primary">
                  Loading members
                </p>
                <p className="text-xs text-muted">
                  Resolving memberships and effective permissions.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-border-primary bg-surface-primary/40 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        {member.name || member.email}
                      </p>
                      <p className="text-xs text-secondary">{member.email}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                        <span className="rounded-full border border-border-primary px-2 py-1 text-primary">
                          {member.role_name || member.role_code || "Member"}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-1 ${
                            member.is_active
                              ? "border-status-success/30 text-status-success"
                              : "border-status-warning/30 text-status-warning"
                          }`}
                        >
                          {member.is_active ? "active" : "inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="max-w-xl">
                      {canManageRoles && member.id !== currentUserId && (
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                          <select
                            value={
                              roleDrafts[member.id] || member.role_code || ""
                            }
                            onChange={(e) =>
                              setRoleDrafts((current) => ({
                                ...current,
                                [member.id]: e.target.value,
                              }))
                            }
                            className="min-w-[220px] rounded-xl border border-border-primary bg-surface-secondary px-3 py-2 text-xs text-primary"
                          >
                            {roles.map((role) => (
                              <option key={role.id} value={role.code}>
                                {role.display_name} ({role.code})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() =>
                              void handleRoleSave(member.id, member.role_code)
                            }
                            disabled={
                              isUpdatingRoleFor === member.id ||
                              (roleDrafts[member.id] ||
                                member.role_code ||
                                "") === (member.role_code || "")
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-primary px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Save size={14} />
                            {isUpdatingRoleFor === member.id
                              ? "Updating..."
                              : "Update role"}
                          </button>
                        </div>
                      )}

                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                        Effective permissions
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {member.permissions.length > 0 ? (
                          member.permissions.map((permission) => (
                            <span
                              key={`${member.id}-${permission}`}
                              className="rounded-full bg-surface-tertiary px-2 py-1 text-[11px] text-secondary"
                            >
                              {permission}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted">
                            No permissions resolved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <Users className="text-accent-secondary" size={18} />
              <h3 className="text-lg font-bold text-primary">
                Current Access Scope
              </h3>
            </div>

            <div className="space-y-2 text-sm text-secondary">
              <p>
                Active role:{" "}
                <span className="font-semibold text-primary">
                  {activeRoleName || currentRoleCode || "Unknown"}
                </span>
              </p>
              <p>
                Role management:{" "}
                <span className="font-semibold text-primary">
                  {canManageRoles ? "allowed" : "not allowed"}
                </span>
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                Current effective permissions
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {currentPermissions.length > 0 ? (
                  currentPermissions.map((permission) => (
                    <span
                      key={permission}
                      className="rounded-full bg-accent-muted px-2 py-1 text-[11px] text-accent-secondary"
                    >
                      {permission}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted">
                    No permissions resolved
                  </span>
                )}
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h3 className="text-lg font-bold text-primary">Available Roles</h3>
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="rounded-2xl border border-border-primary bg-surface-primary/30 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        {role.display_name}
                      </p>
                      <p className="text-[11px] text-secondary">{role.code}</p>
                    </div>
                    <div className="text-right text-[11px] text-muted">
                      <p>{role.permission_count} perms</p>
                      <p>{role.is_system_role ? "system" : "custom"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <MailPlus className="text-accent-secondary" size={18} />
              <h3 className="text-lg font-bold text-primary">Tenant Invites</h3>
            </div>

            {canCreateInvite ? (
              <form onSubmit={handleCreateInvite} className="space-y-3">
                <input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Invitee name"
                  className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-3 text-sm text-primary"
                />
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="invitee@company.com"
                  type="email"
                  required
                  className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-3 text-sm text-primary"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-3 text-sm text-primary"
                >
                  <option value="">Select a role</option>
                  {inviteRoleOptions.map((role) => (
                    <option key={role.id} value={role.code}>
                      {role.display_name} ({role.code})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isCreatingInvite || !activeTenant?.id}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MailPlus size={16} />
                  {isCreatingInvite ? "Creating invite..." : "Create invite"}
                </button>
              </form>
            ) : (
              <AccessNotice
                title="Invite creation restricted"
                description="This action requires the `user.invite` permission in the active tenant scope."
              />
            )}

            <div className="space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="rounded-2xl border border-border-primary bg-surface-primary/30 p-3"
                >
                  <p className="text-sm font-semibold text-primary">
                    {invite.email}
                  </p>
                  <p className="mt-1 text-[11px] text-secondary">
                    {invite.role} · {invite.status} · expires{" "}
                    {new Date(invite.expires_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {invites.length === 0 && !isLoading && (
                <p className="text-xs text-muted">
                  No invites found for the active tenant.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccessManagement;
