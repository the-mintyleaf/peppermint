"use client";

import type { DataTableShellColumn } from "@peppermint/admin";
import { CalendarIcon } from "@phosphor-icons/react/dist/csr/Calendar";
import { HashIcon } from "@phosphor-icons/react/dist/csr/Hash";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { StarIcon } from "@phosphor-icons/react/dist/csr/Star";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";

import { MembershipStatusBadge } from "../../../_shared/components/MembershipStatusBadge";
import type { OrganizationMembership } from "../../members.types";

export function getMembersColumns(): DataTableShellColumn<OrganizationMembership>[] {
  return [
    {
      accessor: "user",
      title: "User ID",
      icon: UserIcon,
    },
    {
      accessor: "employee_code",
      title: "Employee Code",
      icon: HashIcon,
      sortable: true,
    },
    {
      accessor: "membership_status",
      title: "Status",
      icon: PulseIcon,
      render: (record) => (
        <MembershipStatusBadge status={record.membership_status} />
      ),
    },
    {
      accessor: "is_primary",
      title: "Primary",
      icon: StarIcon,
      render: (record) => (record.is_primary ? "Yes" : "No"),
    },
    {
      accessor: "joined_at",
      title: "Joined",
      icon: CalendarIcon,
      sortable: true,
      render: (record) =>
        record.joined_at
          ? new Date(record.joined_at).toLocaleDateString()
          : "—",
    },
  ];
}
