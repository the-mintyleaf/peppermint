import type { QueryParams } from "@peppermint/admin";
import type { Role, RolesFetchResponse } from "./roles.types";

export const MOCK_ROLES: Role[] = [
  {
    id: "1",
    name: "Super Admin",
    description: "Full access to all system areas.",
    permissions: [
      { area: "tickets", actions: ["view", "create", "edit", "delete", "approve", "manage"] },
      { area: "users", actions: ["view", "create", "edit", "delete", "manage"] },
      { area: "reports", actions: ["view", "manage"] },
      { area: "settings", actions: ["view", "edit", "manage"] },
      { area: "organization", actions: ["view", "create", "edit", "delete", "manage"] },
      { area: "roles", actions: ["view", "create", "edit", "delete", "manage"] },
      { area: "accounts", actions: ["view", "create", "edit", "delete", "manage"] },
    ],
    status: "active",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Manager",
    description: "Can view and approve tickets. Manages users within their unit.",
    permissions: [
      { area: "tickets", actions: ["view", "create", "edit", "approve"] },
      { area: "users", actions: ["view", "create", "edit"] },
      { area: "reports", actions: ["view"] },
      { area: "organization", actions: ["view"] },
    ],
    status: "active",
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
  },
  {
    id: "3",
    name: "Staff",
    description: "Standard employee. Can create and view tickets assigned to them.",
    permissions: [
      { area: "tickets", actions: ["view", "create", "edit"] },
      { area: "reports", actions: ["view"] },
    ],
    status: "active",
    createdAt: "2025-01-03T00:00:00Z",
    updatedAt: "2025-01-03T00:00:00Z",
  },
  {
    id: "4",
    name: "Auditor",
    description: "Read-only access for compliance auditing purposes.",
    permissions: [
      { area: "tickets", actions: ["view"] },
      { area: "users", actions: ["view"] },
      { area: "reports", actions: ["view"] },
      { area: "organization", actions: ["view"] },
      { area: "roles", actions: ["view"] },
      { area: "accounts", actions: ["view"] },
    ],
    status: "active",
    createdAt: "2025-01-04T00:00:00Z",
    updatedAt: "2025-01-04T00:00:00Z",
  },
  {
    id: "5",
    name: "Legacy Operator",
    description: "Deprecated role — no longer assigned.",
    permissions: [
      { area: "tickets", actions: ["view", "create"] },
    ],
    status: "inactive",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
];

export async function fetchRoles(params?: QueryParams): Promise<RolesFetchResponse> {
  let data = [...MOCK_ROLES];

  if (params?.filters?.status) {
    data = data.filter((r) => r.status === params.filters!.status);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q),
    );
  }

  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const start = (page - 1) * pageSize;

  return {
    data: data.slice(start, start + pageSize),
    meta: { total: data.length, page, pageSize },
  };
}

export async function fetchRoleOptions(): Promise<{ value: string; label: string }[]> {
  return MOCK_ROLES.filter((r) => r.status === "active").map((r) => ({
    value: r.id,
    label: r.name,
  }));
}

export async function createRole(values: Partial<Role>): Promise<Role> {
  const now = new Date().toISOString();
  return {
    ...values,
    id: String(Date.now()),
    permissions: values.permissions ?? [],
    createdAt: now,
    updatedAt: now,
  } as Role;
}

export async function updateRole(id: string, values: Partial<Role>): Promise<Role> {
  return { ...values, id, updatedAt: new Date().toISOString() } as Role;
}

export async function deleteRole(id: string): Promise<void> {
  void id;
}
