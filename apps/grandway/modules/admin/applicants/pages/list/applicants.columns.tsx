"use client";

import { Badge, Group, Stack, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { dateColumn } from "@peppermint/admin";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { CalendarIcon } from "@phosphor-icons/react/dist/csr/Calendar";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/csr/EnvelopeSimple";
import { GlobeHemisphereWestIcon } from "@phosphor-icons/react/dist/csr/GlobeHemisphereWest";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { STATUS_LABELS } from "../../applicants.labels";
import {
  applicantDestinationNames,
  applicantDisplayName,
} from "../../applicants.labels";
import type { Applicant } from "../../applicants.types";
import { ApplicantPhoto } from "../../photograph";
import { ApplicantRowActionsMenu } from "./components/ApplicantRowActionsMenu";
import { ApplicantStatusSwitch } from "./components/ApplicantStatusSwitch";
import { OpenDocumentButton } from "./components/OpenDocumentButton";
import { OpenJourneysButton } from "./components/OpenJourneysButton";
import { OpenRemindersButton } from "./components/OpenRemindersButton";

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
      // The photo rides inside the identity cell rather than taking a column of
      // its own: it is not a fact you sort, filter or scan down — it only helps
      // confirm you are looking at the right person, which is the name's job.
      //
      // Cost, stated because it is not free: each row resolves its own photo in
      // two requests (find the file, then the audited byte download), so a
      // 25-row page issues 50. Both are cached for the session, and a repeat
      // visit or a page revisit re-renders from cache.
      render: (applicant: Applicant) => (
        <Group gap="xs" wrap="nowrap">
          <ApplicantPhoto
            applicantId={applicant.id}
            name={applicantDisplayName(applicant)}
            size={28}
          />
          <Stack gap={0}>
            <Text size="xs" fw={500}>
              {applicantDisplayName(applicant)}
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
        </Group>
      ),
    },
    {
      // Interactive inline switch (not a read-only badge) — picking a status
      // inline-confirms and mutates in place; status stays an explicit manual
      // change (`docs/backend/applicants/CONCEPT.md`).
      accessor: "status",
      title: "Status",
      icon: PulseIcon,
      width: 300,
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
      // Email, not a phone number: an operator scanning this list is
      // identifying a person, and one stable address does that better than
      // whichever of several numbers happens to be primary. The full set of
      // numbers is one click away on the profile.
      accessor: "email",
      title: "Email",
      icon: EnvelopeSimpleIcon,
      render: (applicant: Applicant) => (
        <Text size="xs" c={applicant.email ? undefined : "dimmed"}>
          {applicant.email || "—"}
        </Text>
      ),
    },
    {
      // Reads the `destinations` projection, so the country tabs above the
      // table have something visible to correspond to — without it a filtered
      // tab looks identical to the unfiltered one. A read-only fact, hence
      // plain neutral chips rather than anything that invites a click; the
      // journeys themselves are one click away on the row's journeys button.
      accessor: "destinations",
      title: "Destinations",
      icon: GlobeHemisphereWestIcon,
      render: (applicant: Applicant) => {
        const names = applicantDestinationNames(applicant.destinations ?? []);
        if (names.length === 0) {
          return (
            <Text size="xs" c="dimmed">
              No journey yet
            </Text>
          );
        }
        return (
          <Group gap={4} wrap="wrap">
            {names.map((name) => (
              <Badge key={name} size="xs" variant="light" color="gray">
                {name}
              </Badge>
            ))}
          </Group>
        );
      },
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
        <Group gap={4} justify="flex-end" wrap="nowrap">
          {/*
            OpenDocumentButton self-gates to admins: documents answer non-admins with
            404 (not 403), so the affordance itself must not render for them — showing
            it would leak that documents may exist and fire a request that can only
            fail (documents/docs/SECURITY.md).
          */}
          <OpenJourneysButton applicant={applicant} />
          <OpenDocumentButton applicant={applicant} />
          {/* Self-gates on `caps.reminders` — every reminders endpoint 403s a
              superadmin. Opens the same panel the detail tab hosts, in a modal,
              so a follow-up can be set without leaving the list. */}
          <OpenRemindersButton applicant={applicant} />
          <ApplicantRowActionsMenu
            applicant={applicant}
            onViewDetails={onViewDetails}
          />
        </Group>
      ),
    },
  ];
}
