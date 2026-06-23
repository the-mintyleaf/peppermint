"use client";

import { Checkbox, Table, Text, Box } from "@peppermint/ui";
import type { PermissionAction, PermissionArea, PermissionsMatrixProps, PermissionSet } from "./PermissionsMatrix.types";

const AREAS: { value: PermissionArea; label: string }[] = [
  { value: "tickets", label: "Tickets" },
  { value: "users", label: "Users" },
  { value: "reports", label: "Reports" },
  { value: "settings", label: "Settings" },
  { value: "organization", label: "Organization" },
  { value: "roles", label: "Roles" },
  { value: "accounts", label: "Accounts" },
];

const ACTIONS: { value: PermissionAction; label: string }[] = [
  { value: "view", label: "View" },
  { value: "create", label: "Create" },
  { value: "edit", label: "Edit" },
  { value: "delete", label: "Delete" },
  { value: "approve", label: "Approve" },
  { value: "manage", label: "Manage" },
];

function getActionsForArea(permissions: PermissionSet[], area: PermissionArea): PermissionAction[] {
  return permissions.find((p) => p.area === area)?.actions ?? [];
}

function isChecked(permissions: PermissionSet[], area: PermissionArea, action: PermissionAction): boolean {
  return getActionsForArea(permissions, area).includes(action);
}

function toggle(
  permissions: PermissionSet[],
  area: PermissionArea,
  action: PermissionAction,
): PermissionSet[] {
  const existing = permissions.find((p) => p.area === area);
  if (!existing) {
    return [...permissions, { area, actions: [action] }];
  }
  const hasAction = existing.actions.includes(action);
  const newActions = hasAction
    ? existing.actions.filter((a) => a !== action)
    : [...existing.actions, action];

  if (newActions.length === 0) {
    return permissions.filter((p) => p.area !== area);
  }
  return permissions.map((p) => (p.area === area ? { ...p, actions: newActions } : p));
}

export function PermissionsMatrix({ value, onChange, disabled }: PermissionsMatrixProps) {
  return (
    <Box style={{ overflowX: "auto" }}>
      <Table withTableBorder withColumnBorders fz="xs">
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ minWidth: 120 }}>
              <Text size="xs" fw={600}>Area</Text>
            </Table.Th>
            {ACTIONS.map((action) => (
              <Table.Th key={action.value} style={{ textAlign: "center", minWidth: 72 }}>
                <Text size="xs" fw={600}>{action.label}</Text>
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {AREAS.map((area) => (
            <Table.Tr key={area.value}>
              <Table.Td>
                <Text size="xs">{area.label}</Text>
              </Table.Td>
              {ACTIONS.map((action) => (
                <Table.Td key={action.value} style={{ textAlign: "center" }}>
                  <Checkbox
                    size="xs"
                    checked={isChecked(value, area.value, action.value)}
                    onChange={() => onChange(toggle(value, area.value, action.value))}
                    disabled={disabled}
                    aria-label={`${area.label} – ${action.label}`}
                  />
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
