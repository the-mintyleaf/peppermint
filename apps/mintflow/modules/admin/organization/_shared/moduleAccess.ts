import type {
  AccessLevel,
  AccessMenuChange,
  AccessMenuData,
} from "@peppermint/ui";
import type {
  PermissionAction,
  PermissionArea,
} from "./PermissionsMatrix/PermissionsMatrix.types";

// Stubs — replace with real API calls when accounts/roles sub-modules are built
const MOCK_ACCOUNTS: Array<{
  id: string;
  fullName: string;
  email: string;
  status: string;
  roleId: string;
  personalizedPermissions: Array<{
    area: PermissionArea;
    actions: PermissionAction[];
  }>;
}> = [];
const MOCK_ROLES: Array<{
  id: string;
  name: string;
  description: string;
  status: string;
  permissions: Array<{ area: PermissionArea; actions: PermissionAction[] }>;
}> = [];

const ACTION_TO_LEVEL: Record<PermissionAction, AccessLevel> = {
  view: "view",
  create: "edit",
  edit: "edit",
  delete: "manage",
  approve: "manage",
  manage: "manage",
};

function highestAccessLevel(actions: PermissionAction[]): AccessLevel {
  const order: AccessLevel[] = ["view", "edit", "manage", "owner"];
  let best: AccessLevel = "view";
  for (const action of actions) {
    const level = ACTION_TO_LEVEL[action];
    if (order.indexOf(level) > order.indexOf(best)) best = level;
  }
  return best;
}

function hasAreaAccess(
  permissions: { area: PermissionArea; actions: PermissionAction[] }[],
  area: PermissionArea,
): boolean {
  return permissions.some((p) => p.area === area && p.actions.length > 0);
}

export function buildModuleAccessFromPermissions(
  area: PermissionArea,
): AccessMenuData {
  const roles = MOCK_ROLES.filter(
    (role) => role.status === "active" && hasAreaAccess(role.permissions, area),
  ).map((role) => {
    const perm = role.permissions.find((p) => p.area === area);
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      memberCount: MOCK_ACCOUNTS.filter((a) => a.roleId === role.id).length,
      accessLevel: highestAccessLevel(perm?.actions ?? ["view"]),
    };
  });

  const accounts = MOCK_ACCOUNTS.filter((account) => {
    if (account.status !== "active") return false;
    const role = MOCK_ROLES.find((r) => r.id === account.roleId);
    if (role && hasAreaAccess(role.permissions, area)) return true;
    return hasAreaAccess(account.personalizedPermissions, area);
  }).map((account) => {
    const personalized = account.personalizedPermissions.find(
      (p) => p.area === area,
    );
    const role = MOCK_ROLES.find((r) => r.id === account.roleId);
    const rolePerm = role?.permissions.find((p) => p.area === area);
    const actions = personalized?.actions.length
      ? personalized.actions
      : (rolePerm?.actions ?? ["view"]);
    return {
      id: account.id,
      name: account.fullName,
      email: account.email,
      accessLevel: highestAccessLevel(actions),
    };
  });

  return {
    accounts,
    roles,
    invitedCount: accounts.length,
  };
}

export function applyModuleAccessChange(
  current: AccessMenuData,
  change: AccessMenuChange,
): AccessMenuData {
  if (change.type === "invite" && change.inviteQuery) {
    const id = `invite-${Date.now()}`;
    return {
      ...current,
      accounts: [
        ...current.accounts,
        {
          id,
          name: change.inviteQuery,
          email: change.inviteQuery.includes("@")
            ? change.inviteQuery
            : undefined,
          accessLevel: change.accessLevel,
        },
      ],
      invitedCount: (current.invitedCount ?? current.accounts.length) + 1,
    };
  }

  if (change.type === "account" && change.accountId) {
    return {
      ...current,
      accounts: current.accounts.map((a) =>
        a.id === change.accountId
          ? { ...a, accessLevel: change.accessLevel }
          : a,
      ),
    };
  }

  if (change.type === "role" && change.roleId) {
    return {
      ...current,
      roles: current.roles.map((r) =>
        r.id === change.roleId ? { ...r, accessLevel: change.accessLevel } : r,
      ),
    };
  }

  return current;
}
