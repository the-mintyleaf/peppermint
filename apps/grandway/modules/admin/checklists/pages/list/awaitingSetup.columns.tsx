"use client";

import Link from "next/link";
import { dateColumn } from "@peppermint/admin";
import type { DataTableShellColumn } from "@peppermint/admin";
import { Text } from "@peppermint/ui";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { GlobeIcon } from "@phosphor-icons/react/dist/csr/Globe";
import { MapTrifoldIcon } from "@phosphor-icons/react/dist/csr/MapTrifold";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import type { JourneyAwaitingChecklist } from "../../checklists.types";

/**
 * Read-only guidance, not actionable — no create/edit here (§7). Each row's
 * `id` is the JOURNEY's id, not a checklist's, so "View" links to the journey
 * detail, never to a checklist route that doesn't exist for this row.
 */
export const AWAITING_SETUP_COLUMNS: DataTableShellColumn<JourneyAwaitingChecklist>[] =
  [
    {
      accessor: "applicant",
      title: "Applicant",
      icon: UserIcon,
      render: (row) => (
        <Text
          size="xs"
          fw={500}
          component={Link}
          href={`/admin/applicants/${row.applicant.id}`}
        >
          {row.applicant.full_name}
        </Text>
      ),
    },
    {
      accessor: "target_country_ref",
      title: "Destination country",
      icon: GlobeIcon,
      render: (row) => (
        <Text size="xs" c={row.target_country_ref ? undefined : "dimmed"}>
          {row.target_country_ref ? row.target_country_ref.name : "—"}
        </Text>
      ),
    },
    {
      accessor: "stage",
      title: "Journey stage",
      icon: MapTrifoldIcon,
    },
    dateColumn<JourneyAwaitingChecklist>("created_at", {
      title: "Journey created",
      icon: CalendarBlankIcon,
    }),
    {
      accessor: "actions",
      title: "",
      textAlign: "right",
      render: (row) => (
        <Text
          size="xs"
          component={Link}
          href={`/admin/applicant-journeys/${row.id}`}
        >
          View journey
        </Text>
      ),
    },
  ];
