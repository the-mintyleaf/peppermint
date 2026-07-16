"use client";

import type { DataTableShellColumn } from "@peppermint/admin";
import {
  ActionIcon,
  Badge,
  dayjs,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@peppermint/ui";
import { CalendarIcon } from "@phosphor-icons/react/dist/csr/Calendar";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";
import { GlobeIcon } from "@phosphor-icons/react/dist/csr/Globe";
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";

import type { RoleBinding, RoleBindingStatus } from "./bindings.types";

const STATUS_COLORS: Record<RoleBindingStatus, string> = {
  active: "green",
  revoked: "red",
  expired: "gray",
};

const SCOPE_LABELS: Record<RoleBinding["scope_type"], string> = {
  global: "Global",
  organization: "Organization",
  organization_unit: "Organization unit",
};

function formatDate(value: string | null): string {
  return value ? dayjs(value).format("MMM D, YYYY") : "—";
}

export interface BindingsColumnActions {
  onRevoke: (binding: RoleBinding) => void;
}

/**
 * Columns are built via a function (not a static array) because the
 * "Revoke" action needs a closure over state owned by BindingsList.
 */
export function buildBindingsColumns({
  onRevoke,
}: BindingsColumnActions): DataTableShellColumn<RoleBinding>[] {
  return [
    { accessor: "subject_user", title: "User", icon: UserIcon },
    { accessor: "role", title: "Role", icon: KeyIcon },
    {
      accessor: "scope_type",
      title: "Scope",
      icon: GlobeIcon,
      render: (record) => (
        <Stack gap={2}>
          <Badge size="xs" variant="light">
            {SCOPE_LABELS[record.scope_type]}
          </Badge>
          {(record.organization || record.organization_unit) && (
            <Text size="xs" c="dimmed">
              {record.organization_unit ?? record.organization}
            </Text>
          )}
        </Stack>
      ),
    },
    {
      accessor: "status",
      title: "Status",
      icon: PulseIcon,
      render: (record) => (
        <Badge size="xs" color={STATUS_COLORS[record.status]} variant="light">
          {record.status}
        </Badge>
      ),
    },
    {
      accessor: "valid_from",
      title: "Valid From",
      icon: CalendarIcon,
      render: (record) => (
        <Text size="xs">{formatDate(record.valid_from)}</Text>
      ),
    },
    {
      accessor: "valid_until",
      title: "Valid Until",
      icon: CalendarIcon,
      render: (record) => (
        <Text size="xs">{formatDate(record.valid_until)}</Text>
      ),
    },
    {
      accessor: "row_actions",
      title: "",
      icon: GearSixIcon,
      textAlign: "right",
      render: (record) => (
        <Group justify="flex-end" wrap="nowrap">
          <Tooltip
            label={record.status === "active" ? "Revoke binding" : "Not active"}
          >
            <ActionIcon
              variant="subtle"
              color="red"
              disabled={record.status !== "active"}
              aria-label={`Revoke binding ${record.id}`}
              onClick={() => onRevoke(record)}
            >
              <XCircleIcon size={16} aria-hidden />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];
}
