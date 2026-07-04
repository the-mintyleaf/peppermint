"use client";

import { Badge } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { CalendarIcon } from "@phosphor-icons/react/dist/csr/Calendar";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";

import type { AuthorityDelegation } from "../../delegations.types";
import { DelegationRowActionsMenu } from "./components/DelegationRowActionsMenu";

export function getDelegationsColumns(): DataTableShellColumn<AuthorityDelegation>[] {
  return [
    {
      accessor: "delegation_type",
      title: "Type",
      icon: TagIcon,
    },
    {
      accessor: "status",
      title: "Status",
      icon: PulseIcon,
      render: (record) => <Badge size="xs">{record.status}</Badge>,
    },
    {
      accessor: "starts_at",
      title: "Starts",
      icon: CalendarIcon,
      sortable: true,
      render: (record) => new Date(record.starts_at).toLocaleDateString(),
    },
    {
      accessor: "ends_at",
      title: "Ends",
      icon: CalendarIcon,
      render: (record) =>
        record.ends_at
          ? new Date(record.ends_at).toLocaleDateString()
          : "Indefinite",
    },
    {
      accessor: "id",
      key: "actions",
      title: "Actions",
      icon: DotsThreeVerticalIcon,
      sortable: false,
      render: (record) => <DelegationRowActionsMenu delegation={record} />,
    },
  ];
}
