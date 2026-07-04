"use client";

import type { DataTableShellColumn } from "@peppermint/admin";
import { CalendarIcon } from "@phosphor-icons/react/dist/csr/Calendar";
import { NoteIcon } from "@phosphor-icons/react/dist/csr/Note";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { TextAlignLeftIcon } from "@phosphor-icons/react/dist/csr/TextAlignLeft";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";

import type { OrganizationEventLog } from "../../eventLog.types";

const EVENT_TYPE_OPTIONS = [
  "organization_created",
  "organization_updated",
  "organization_status_changed",
  "unit_created",
  "unit_updated",
  "unit_moved",
  "unit_renamed",
  "unit_deactivated",
  "unit_reactivated",
  "position_created",
  "position_updated",
  "position_deactivated",
  "membership_created",
  "membership_status_changed",
  "unit_membership_created",
  "unit_membership_ended",
  "position_assigned",
  "position_assignment_ended",
  "reporting_line_created",
  "reporting_line_ended",
  "delegation_created",
  "delegation_revoked",
  "site_created",
  "site_assigned",
  "integrity_rebuilt",
  "metadata_updated",
].map((value) => ({ value, label: value.replace(/_/g, " ") }));

export function getEventLogColumns(): DataTableShellColumn<OrganizationEventLog>[] {
  return [
    {
      accessor: "event_type",
      title: "Event",
      icon: TagIcon,
      filter: { type: "select", options: EVENT_TYPE_OPTIONS },
    },
    {
      accessor: "summary",
      title: "Summary",
      icon: TextAlignLeftIcon,
    },
    {
      accessor: "reason",
      title: "Reason",
      icon: NoteIcon,
      render: (record) => record.reason || "—",
    },
    {
      accessor: "actor",
      title: "Actor",
      icon: UserIcon,
      render: (record) => record.actor || "System",
    },
    {
      accessor: "created_at",
      title: "When",
      icon: CalendarIcon,
      sortable: true,
      render: (record) => new Date(record.created_at).toLocaleString(),
    },
  ];
}
