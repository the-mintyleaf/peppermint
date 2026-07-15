"use client";

import { Stack, Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { StatusBadge } from "@peppermint/admin";
import type {
  AccountStatus,
  Role,
} from "@/modules/admin/authenticate/_shared/authenticate.types";
import type { UserAdmin } from "../../users.types";
import { UserRowActionsMenu } from "./components/UserRowActionsMenu";

interface UsersColumnsOptions {
  currentUserId?: string;
  isSuperadmin: boolean;
  onViewDetails: (user: UserAdmin) => void;
}

const ROLE_COLORS: Partial<Record<Role, string>> = {
  superadmin: "grape",
  admin: "blue",
  staff: "gray",
};

const STATUS_COLORS: Partial<Record<AccountStatus, string>> = {
  active: "teal",
  suspended: "orange",
  deactivated: "gray",
};

function fullName(p: UserAdmin["employee_profile"]): string {
  return (
    [p.preferred_name || p.first_name, p.last_name].filter(Boolean).join(" ") ||
    p.employee_code
  );
}

export function getUsersColumns({
  currentUserId,
  isSuperadmin,
  onViewDetails,
}: UsersColumnsOptions): DataTableShellColumn<UserAdmin>[] {
  return [
    {
      accessor: "employee_profile.first_name",
      title: "Employee",
      render: (user: UserAdmin) => (
        <Stack gap={0}>
          <Text size="xs" fw={500}>
            {fullName(user.employee_profile)}
          </Text>
          <Text size="xs" c="dimmed">
            @{user.username}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "employee_profile.employee_code",
      title: "Employee code",
      render: (user: UserAdmin) => (
        <Text size="xs">{user.employee_profile.employee_code}</Text>
      ),
    },
    {
      accessor: "employee_profile.job_title",
      title: "Job title",
      render: (user: UserAdmin) => (
        <Text size="xs">{user.employee_profile.job_title}</Text>
      ),
    },
    {
      accessor: "role",
      title: "Role",
      render: (user: UserAdmin) => (
        <StatusBadge<Role>
          value={user.role}
          colorMap={ROLE_COLORS}
          labelMap={{
            superadmin: "Superadmin",
            admin: "Admin",
            staff: "Staff",
          }}
        />
      ),
    },
    {
      accessor: "account_status",
      title: "Status",
      render: (user: UserAdmin) => (
        <StatusBadge<AccountStatus>
          value={user.account_status}
          colorMap={STATUS_COLORS}
          labelMap={{
            active: "Active",
            suspended: "Suspended",
            deactivated: "Deactivated",
          }}
        />
      ),
    },
    {
      accessor: "last_login_at",
      title: "Last login",
      render: (user: UserAdmin) => {
        const d = user.last_login_at ? dayjs(user.last_login_at) : null;
        return d && d.isValid() ? (
          <Text size="xs">{d.format("MMM D, YYYY")}</Text>
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        );
      },
    },
    {
      accessor: "actions",
      title: "",
      textAlign: "right",
      render: (user: UserAdmin) => (
        <UserRowActionsMenu
          user={user}
          currentUserId={currentUserId}
          isSuperadmin={isSuperadmin}
          onViewDetails={onViewDetails}
        />
      ),
    },
  ];
}
