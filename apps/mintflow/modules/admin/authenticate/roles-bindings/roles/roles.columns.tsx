"use client";

import type { DataTableShellColumn } from "@peppermint/admin";
import { ActionIcon, Badge, Group, Text, Tooltip } from "@peppermint/ui";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { BracketsCurlyIcon } from "@phosphor-icons/react/dist/csr/BracketsCurly";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { ShieldIcon } from "@phosphor-icons/react/dist/csr/Shield";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";

import type { Role } from "./roles.types";

export interface RolesColumnActions {
  onManagePermissions: (role: Role) => void;
  onDeprecate: (role: Role) => void;
}

/**
 * Columns are built via a function (not a static array) because the
 * "Manage permissions" / "Deprecate" actions need closures over state owned
 * by RolesList (drawer open state, deprecate mutation).
 */
export function buildRolesColumns({
  onManagePermissions,
  onDeprecate,
}: RolesColumnActions): DataTableShellColumn<Role>[] {
  return [
    { accessor: "key", title: "Key", icon: KeyIcon, sortable: true },
    {
      accessor: "display_name",
      title: "Display Name",
      icon: TagIcon,
      sortable: true,
    },
    {
      accessor: "role_type",
      title: "Role Type",
      icon: BracketsCurlyIcon,
      sortable: true,
    },
    {
      accessor: "is_assignable",
      title: "Assignable",
      icon: CheckCircleIcon,
      render: (record) => (
        <Badge
          size="xs"
          color={record.is_assignable ? "green" : "gray"}
          variant="light"
        >
          {record.is_assignable ? "Assignable" : "Not assignable"}
        </Badge>
      ),
    },
    {
      accessor: "is_active",
      title: "Active",
      icon: ShieldIcon,
      render: (record) => (
        <Badge
          size="xs"
          color={record.is_active ? "green" : "gray"}
          variant="light"
        >
          {record.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessor: "is_deprecated",
      title: "Deprecated",
      icon: ArchiveIcon,
      render: (record) =>
        record.is_deprecated ? (
          <Badge size="xs" color="orange" variant="light">
            Deprecated
          </Badge>
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        ),
    },
    {
      accessor: "version",
      title: "Version",
      icon: ClockCounterClockwiseIcon,
      sortable: true,
    },
    {
      accessor: "row_actions",
      title: "",
      icon: GearSixIcon,
      textAlign: "right",
      render: (record) => (
        <Group gap={4} justify="flex-end" wrap="nowrap">
          <Tooltip label="Manage permissions">
            <ActionIcon
              variant="subtle"
              aria-label={`Manage permissions for ${record.display_name}`}
              onClick={() => onManagePermissions(record)}
            >
              <LockKeyIcon size={16} aria-hidden />
            </ActionIcon>
          </Tooltip>
          <Tooltip
            label={
              record.is_deprecated ? "Already deprecated" : "Deprecate role"
            }
          >
            <ActionIcon
              variant="subtle"
              color="orange"
              disabled={record.is_deprecated}
              aria-label={`Deprecate ${record.display_name}`}
              onClick={() => onDeprecate(record)}
            >
              <ArchiveIcon size={16} aria-hidden />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];
}
