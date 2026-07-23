"use client";

import { Group, Stack, Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { StatusBadge } from "@peppermint/admin";
import type { AuthorityType, User } from "../../users.types";
import { UserRowActionsMenu } from "./components/UserRowActionsMenu";

interface UsersColumnsOptions {
  onViewDetails: (user: User) => void;
}

const AUTHORITY_COLORS: Partial<Record<AuthorityType, string>> = {
  superadmin: "grape",
  admin: "blue",
  lead_manager: "gray",
};
const AUTHORITY_LABELS: Partial<Record<AuthorityType, string>> = {
  superadmin: "Superadmin",
  admin: "Admin",
  lead_manager: "Lead Manager",
};

export function getUsersColumns({
  onViewDetails,
}: UsersColumnsOptions): DataTableShellColumn<User>[] {
  return [
    {
      accessor: "display_name",
      title: "Account",
      render: (user: User) => (
        <Stack gap={0}>
          <Text size="xs" fw={500}>
            {user.display_name || user.username}
          </Text>
          <Text size="xs" c="dimmed">
            @{user.username}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "authority_type",
      title: "Authority",
      render: (user: User) => (
        <StatusBadge<AuthorityType>
          value={user.authority_type}
          colorMap={AUTHORITY_COLORS}
          labelMap={AUTHORITY_LABELS}
        />
      ),
    },
    {
      accessor: "is_active",
      title: "Status",
      render: (user: User) => (
        <Group gap={4} wrap="nowrap">
          <StatusBadge<"active" | "blocked">
            value={user.is_active ? "active" : "blocked"}
            colorMap={{ active: "teal", blocked: "red" }}
            labelMap={{ active: "Active", blocked: "Blocked" }}
          />
          {user.must_change_password ? (
            <StatusBadge<"pending">
              value="pending"
              colorMap={{ pending: "yellow" }}
              labelMap={{ pending: "Password reset pending" }}
            />
          ) : null}
        </Group>
      ),
    },
    {
      accessor: "mfa_enabled",
      title: "MFA",
      render: (user: User) => (
        <Text size="xs" c={user.mfa_enabled ? undefined : "dimmed"}>
          {user.mfa_enabled ? "Enabled" : "Off"}
        </Text>
      ),
    },
    {
      accessor: "last_login",
      title: "Last login",
      render: (user: User) => {
        const d = user.last_login ? dayjs(user.last_login) : null;
        return d && d.isValid() ? (
          <Text size="xs">{d.format("MMM D, YYYY h:mm A")}</Text>
        ) : (
          <Text size="xs" c="dimmed">
            Never
          </Text>
        );
      },
    },
    {
      accessor: "actions",
      title: "",
      textAlign: "right",
      render: (user: User) => (
        <UserRowActionsMenu user={user} onViewDetails={onViewDetails} />
      ),
    },
  ];
}
