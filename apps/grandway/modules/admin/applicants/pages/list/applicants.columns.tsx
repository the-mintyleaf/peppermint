"use client";

import { Stack, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { dateColumn, statusColumn } from "@peppermint/admin";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { CalendarIcon } from "@phosphor-icons/react/dist/csr/Calendar";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/csr/EnvelopeSimple";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import type { Applicant } from "../../applicants.types";
import { ApplicantRowActionsMenu } from "./components/ApplicantRowActionsMenu";

const STATUS_COLORS: Record<string, string> = {
  active: "green",
  dormant: "yellow",
  archived: "gray",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  dormant: "Dormant",
  archived: "Archived",
};

interface ApplicantsColumnsOptions {
  onViewDetails: (applicant: Applicant) => void;
  onChangeStatus: (applicant: Applicant) => void;
}

export function getApplicantsColumns({
  onViewDetails,
  onChangeStatus,
}: ApplicantsColumnsOptions): DataTableShellColumn<Applicant>[] {
  return [
    {
      accessor: "full_name_en",
      title: "Applicant",
      icon: IdentificationCardIcon,
      render: (applicant: Applicant) => (
        <Stack gap={0}>
          <Text size="xs" fw={500}>
            {applicant.full_name_en ||
              applicant.full_name_np ||
              applicant.full_name_romanized}
          </Text>
          {applicant.creation_source === "lead_conversion" ? (
            <Text
              size="xs"
              c="dimmed"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <ArrowsLeftRightIcon size={12} aria-hidden />
              From lead
            </Text>
          ) : null}
        </Stack>
      ),
    },
    statusColumn<Applicant>("status", {
      title: "Status",
      icon: PulseIcon,
      colorMap: STATUS_COLORS,
      labelMap: STATUS_LABELS,
      filter: {
        type: "select",
        options: [
          { label: "Active", value: "active" },
          { label: "Dormant", value: "dormant" },
          { label: "Archived", value: "archived" },
        ],
      },
    }),
    {
      // The list-shape response has no `contact_numbers` (only the detail
      // shape does — `docs/backend/applicants/INTEGRATION.md` §4), so this
      // renders the one contact field the list row actually carries
      // (`email`) rather than a primary phone number the API can't supply
      // here. Flagged as a spec deviation in this module's build report.
      accessor: "email",
      title: "Email",
      icon: EnvelopeSimpleIcon,
      render: (applicant: Applicant) => (
        <Text size="xs" c={applicant.email ? undefined : "dimmed"}>
          {applicant.email || "—"}
        </Text>
      ),
    },
    dateColumn<Applicant>("created_at", {
      title: "Created",
      icon: CalendarIcon,
    }),
    {
      accessor: "actions",
      title: "",
      textAlign: "right",
      render: (applicant: Applicant) => (
        <ApplicantRowActionsMenu
          applicant={applicant}
          onViewDetails={onViewDetails}
          onChangeStatus={onChangeStatus}
        />
      ),
    },
  ];
}
