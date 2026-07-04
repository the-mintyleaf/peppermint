"use client";

import { Badge } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { CalendarIcon } from "@phosphor-icons/react/dist/csr/Calendar";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/csr/Envelope";
import { IdentificationBadgeIcon } from "@phosphor-icons/react/dist/csr/IdentificationBadge";
import { LockIcon } from "@phosphor-icons/react/dist/csr/Lock";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { RobotIcon } from "@phosphor-icons/react/dist/csr/Robot";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";

import type { AccountStatus, ActorType, User } from "../../users.types";
import { UserRowActionsMenu } from "./components/UserRowActionsMenu";

const ACTOR_TYPE_COLORS: Record<ActorType, string> = {
  human: "blue",
  system: "gray",
  ai: "grape",
  external: "yellow",
};

const ACCOUNT_STATUS_COLORS: Record<AccountStatus, string> = {
  pending: "gray",
  active: "green",
  suspended: "orange",
  deactivated: "red",
  archived: "dark",
};

export interface GetUsersColumnsOptions {
  currentUserId?: string;
  onViewDetails: (user: User) => void;
}

export function getUsersColumns({
  currentUserId,
  onViewDetails,
}: GetUsersColumnsOptions): DataTableShellColumn<User>[] {
  return [
    {
      accessor: "username",
      title: "Username",
      icon: UserIcon,
      sortable: true,
    },
    {
      accessor: "display_name",
      title: "Display Name",
      icon: IdentificationBadgeIcon,
      sortable: true,
    },
    {
      accessor: "email",
      title: "Email",
      icon: EnvelopeIcon,
      sortable: true,
    },
    {
      accessor: "actor_type",
      title: "Actor Type",
      icon: RobotIcon,
      render: (record) => (
        <Badge size="xs" color={ACTOR_TYPE_COLORS[record.actor_type]}>
          {record.actor_type}
        </Badge>
      ),
    },
    {
      accessor: "account_status",
      title: "Status",
      icon: PulseIcon,
      render: (record) => (
        <Badge size="xs" color={ACCOUNT_STATUS_COLORS[record.account_status]}>
          {record.account_status}
        </Badge>
      ),
    },
    {
      accessor: "is_login_enabled",
      title: "Login",
      icon: LockIcon,
      render: (record) => (
        <Badge size="xs" color={record.is_login_enabled ? "green" : "gray"}>
          {record.is_login_enabled ? "Enabled" : "Disabled"}
        </Badge>
      ),
    },
    {
      accessor: "last_login",
      title: "Last Login",
      icon: ClockIcon,
      sortable: true,
      render: (record) => record.last_login ?? "Never",
    },
    {
      accessor: "created_at",
      title: "Created",
      icon: CalendarIcon,
      sortable: true,
    },
    {
      accessor: "id",
      key: "actions",
      title: "Actions",
      icon: DotsThreeVerticalIcon,
      sortable: false,
      render: (record) => (
        <UserRowActionsMenu
          user={record}
          isSelf={Boolean(currentUserId) && record.id === currentUserId}
          onViewDetails={onViewDetails}
        />
      ),
    },
  ];
}
