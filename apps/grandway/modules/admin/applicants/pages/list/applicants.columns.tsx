"use client";

import { Stack, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { dateColumn } from "@peppermint/admin";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { CalendarIcon } from "@phosphor-icons/react/dist/csr/Calendar";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/csr/EnvelopeSimple";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { STATUS_LABELS } from "../../applicants.labels";
import type { Applicant } from "../../applicants.types";
import { ApplicantRowActionsMenu } from "./components/ApplicantRowActionsMenu";
import { ApplicantStatusSwitch } from "./components/ApplicantStatusSwitch";

interface ApplicantsColumnsOptions {
  onViewDetails: (applicant: Applicant) => void;
}

export function getApplicantsColumns({
  onViewDetails,
}: ApplicantsColumnsOptions): DataTableShellColumn<Applicant>[] {
  return [
    {
      accessor: "full_name",
      title: "Applicant",
      icon: IdentificationCardIcon,
      render: (applicant: Applicant) => (
        <Stack gap={0}>
          <Text size="xs" fw={500}>
            {applicant.full_name ||
              applicant.full_name_en ||
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
    {
      // Interactive inline switch (not a read-only badge) — picking a status
      // inline-confirms and mutates in place; status stays an explicit manual
      // change (`docs/backend/applicants/CONCEPT.md`).
      accessor: "status",
      title: "Status",
      icon: PulseIcon,
      filter: {
        type: "select",
        options: Object.entries(STATUS_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      },
      render: (applicant: Applicant) => (
        <ApplicantStatusSwitch applicant={applicant} />
      ),
    },
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
        />
      ),
    },
  ];
}
