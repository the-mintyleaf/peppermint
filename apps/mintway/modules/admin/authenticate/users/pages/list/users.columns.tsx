"use client";

import { Stack, Text, Tooltip, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import type { UserAdmin } from "../../users.types";
import { UserRoleCell } from "./components/UserRoleCell";
import { UserRowActionsMenu } from "./components/UserRowActionsMenu";
import { UserStatusCell } from "./components/UserStatusCell";

interface UsersColumnsOptions {
  currentUserId?: string;
  isSuperadmin: boolean;
  onViewDetails: (user: UserAdmin) => void;
}

function fullName(p: UserAdmin["employee_profile"]): string {
  return (
    [p.preferred_name || p.first_name, p.last_name].filter(Boolean).join(" ") ||
    p.employee_code
  );
}

/** Compact "how long ago" — days+hours past a day, else hours+minutes. */
function timeAgo(value: string): string {
  const then = dayjs(value);
  const totalMinutes = dayjs().diff(then, "minute");
  if (totalMinutes < 1) return "just now";
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes && days === 0) parts.push(`${minutes}m`);
  return `${parts.join(" ")} ago`;
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
        <UserRoleCell
          user={user}
          currentUserId={currentUserId}
          isSuperadmin={isSuperadmin}
        />
      ),
    },
    {
      accessor: "account_status",
      title: "Status",
      render: (user: UserAdmin) => (
        <UserStatusCell
          user={user}
          currentUserId={currentUserId}
          isSuperadmin={isSuperadmin}
        />
      ),
    },
    {
      accessor: "last_login_at",
      title: "Last login",
      render: (user: UserAdmin) => {
        const d = user.last_login_at ? dayjs(user.last_login_at) : null;
        if (!d || !d.isValid())
          return (
            <Text size="xs" c="dimmed">
              Never
            </Text>
          );
        return (
          <Tooltip label={d.format("MMM D, YYYY h:mm A")} withArrow>
            <Text size="xs">{timeAgo(user.last_login_at as string)}</Text>
          </Tooltip>
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
