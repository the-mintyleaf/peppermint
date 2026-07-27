"use client";

import type { ReactNode } from "react";
import { Center, Loader, Text } from "@peppermint/ui";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { PlusCircleIcon } from "@phosphor-icons/react/dist/csr/PlusCircle";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { HistoryTable } from "@/components/profile";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useApplicantHistory } from "../../../applicants.hooks";

const ICONS: Record<string, { icon: ReactNode; color: string }> = {
  applicant_created: {
    icon: <PlusCircleIcon size={14} aria-hidden />,
    color: "blue",
  },
  applicant_updated: {
    icon: <PencilSimpleIcon size={14} aria-hidden />,
    color: "gray",
  },
  applicant_status_changed: {
    icon: <ArrowsClockwiseIcon size={14} aria-hidden />,
    color: "grape",
  },
  applicant_contact_changed: {
    icon: <AddressBookIcon size={14} aria-hidden />,
    color: "teal",
  },
  applicant_address_changed: {
    icon: <MapPinIcon size={14} aria-hidden />,
    color: "teal",
  },
  applicant_passport_changed: {
    icon: <IdentificationCardIcon size={14} aria-hidden />,
    color: "indigo",
  },
  applicant_family_changed: {
    icon: <UsersThreeIcon size={14} aria-hidden />,
    color: "orange",
  },
  applicant_emergency_contact_changed: {
    icon: <UsersThreeIcon size={14} aria-hidden />,
    color: "orange",
  },
};

/**
 * Read-only, server-written, backed by the central audit log — the same table
 * as every other profile (`HistoryTable`). Nested-collection events
 * carry only a **count** in `metadata`, never the replaced values — this is not
 * a diff viewer (`docs/backend/applicants/INTEGRATION.md` §4).
 */
export function ApplicantHistoryPanel({
  applicantId,
}: {
  applicantId: string;
}) {
  const { data, isLoading, isError, isRefetching, refetch } =
    useApplicantHistory(applicantId);
  const entries = data?.data ?? [];
  const truncated = (data?.meta.total ?? 0) > entries.length;

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        message="Couldn't load history."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

  if (entries.length === 0) {
    return (
      <Text size="xs" c="dimmed">
        No history yet.
      </Text>
    );
  }

  return (
    <HistoryTable
      entries={entries}
      iconFor={(action) => ICONS[action]}
      truncatedNote={
        truncated
          ? `Showing the ${entries.length} most recent entries.`
          : undefined
      }
    />
  );
}
