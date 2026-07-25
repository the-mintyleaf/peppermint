"use client";

import Link from "next/link";
import { Badge, Group, Stack, Text } from "@peppermint/ui";
import { statusColumn } from "@peppermint/admin";
import type { DataTableShellColumn } from "@peppermint/admin";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import {
  OFFER_STATUS_COLORS,
  OFFER_STATUS_LABELS,
  OFFER_STATUS_OPTIONS,
  OFFER_TYPE_LABELS,
  OFFER_TYPE_OPTIONS,
  QUALIFICATION_LEVEL_LABELS,
} from "../../offers.labels";
import type { Offer, OfferStatus } from "../../offers.types";
import { formatOfferDate } from "../../offers.utils";
import { OfferRowActionsMenu } from "./components/OfferRowActionsMenu";

interface OffersColumnsOptions {
  onViewDetails: (offer: Offer) => void;
}

/**
 * All display comes from the offer's write-once SNAPSHOT fields
 * (`institution_name`/`program_title`/…), never a fresh catalogue fetch (§3).
 * Column filters map to server params via `toOfferServerParams`: `status` /
 * `offer_type` (select), `intake_label` → `intake` (text substring),
 * `response_deadline` → `deadline_before` (date). The UUID filters
 * (`journey`/`applicant`/`institution`/`program`/`fiscal_year`) arrive as
 * deep-links, not column pickers (see `OffersWorklist.tsx`).
 */
export function getOffersColumns({
  onViewDetails,
}: OffersColumnsOptions): DataTableShellColumn<Offer>[] {
  return [
    {
      accessor: "applicant_name",
      title: "Applicant",
      icon: UserIcon,
      render: (offer: Offer) => (
        <Text
          size="xs"
          fw={500}
          component={Link}
          href={`/admin/applicants/${offer.applicant_id}`}
        >
          {offer.applicant_name || "—"}
        </Text>
      ),
    },
    {
      accessor: "institution_name",
      title: "Institution & program",
      icon: BuildingsIcon,
      render: (offer: Offer) => (
        <Stack gap={0}>
          <Text
            size="xs"
            fw={500}
            c={offer.institution_name ? undefined : "dimmed"}
          >
            {offer.institution_name || "—"}
          </Text>
          {offer.program_title ? (
            <Text size="xs" c="dimmed">
              {offer.program_title}
            </Text>
          ) : null}
        </Stack>
      ),
    },
    {
      accessor: "qualification_level",
      title: "Qualification",
      icon: GraduationCapIcon,
      render: (offer: Offer) => (
        <Text size="xs" c={offer.qualification_level ? undefined : "dimmed"}>
          {offer.qualification_level
            ? QUALIFICATION_LEVEL_LABELS[offer.qualification_level]
            : "—"}
        </Text>
      ),
    },
    {
      accessor: "intake_label",
      title: "Intake",
      icon: CalendarBlankIcon,
      filter: { type: "text", placeholder: "e.g. Feb 2027" },
      render: (offer: Offer) => (
        <Text size="xs" c={offer.intake_label ? undefined : "dimmed"}>
          {offer.intake_label || "—"}
        </Text>
      ),
    },
    {
      accessor: "offer_type",
      title: "Type",
      icon: FileTextIcon,
      filter: { type: "select", options: OFFER_TYPE_OPTIONS },
      render: (offer: Offer) => (
        <Text size="xs">{OFFER_TYPE_LABELS[offer.offer_type]}</Text>
      ),
    },
    statusColumn<Offer, OfferStatus>("status", {
      title: "Status",
      icon: PulseIcon,
      colorMap: OFFER_STATUS_COLORS,
      labelMap: OFFER_STATUS_LABELS,
      filter: { type: "select", options: OFFER_STATUS_OPTIONS },
    }),
    {
      accessor: "response_deadline",
      title: "Response deadline",
      icon: ClockIcon,
      filter: { type: "date", placeholder: "Due on or before" },
      render: (offer: Offer) => (
        <Stack gap={4}>
          <Text size="xs" c={offer.response_deadline ? undefined : "dimmed"}>
            {formatOfferDate(
              offer.response_deadline,
              offer.response_deadline_bs,
            )}
          </Text>
          <Group gap={4}>
            {offer.is_response_overdue ? (
              <Badge size="xs" color="red" variant="light">
                Overdue
              </Badge>
            ) : null}
            {offer.has_open_conditions ? (
              <Badge size="xs" color="orange" variant="light">
                Open conditions
              </Badge>
            ) : null}
          </Group>
        </Stack>
      ),
    },
    {
      accessor: "actions",
      title: "",
      textAlign: "right",
      render: (offer: Offer) => (
        <OfferRowActionsMenu offer={offer} onViewDetails={onViewDetails} />
      ),
    },
  ];
}
