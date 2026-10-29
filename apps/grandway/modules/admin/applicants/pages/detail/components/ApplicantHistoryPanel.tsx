"use client";

import type { ReactNode } from "react";
import { Center, Loader, Stack, Text } from "@peppermint/ui";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { CertificateIcon } from "@phosphor-icons/react/dist/csr/Certificate";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { NoteIcon } from "@phosphor-icons/react/dist/csr/Note";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { PlusCircleIcon } from "@phosphor-icons/react/dist/csr/PlusCircle";
import { UserCirclePlusIcon } from "@phosphor-icons/react/dist/csr/UserCirclePlus";
import { UserMinusIcon } from "@phosphor-icons/react/dist/csr/UserMinus";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { HistoryTable, ProfilePanelHeader } from "@/components/profile";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useApplicantHistory } from "../../../applicants.hooks";
import type { HistoryEntry } from "../../../applicants.types";

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
  applicant_restored: {
    icon: <ArrowCounterClockwiseIcon size={14} aria-hidden />,
    color: "green",
  },
  applicant_note_added: {
    icon: <NoteIcon size={14} aria-hidden />,
    color: "cyan",
  },
  applicant_note_updated: {
    icon: <NoteIcon size={14} aria-hidden />,
    color: "cyan",
  },
  applicant_note_deleted: {
    icon: <NoteIcon size={14} aria-hidden />,
    color: "red",
  },
  applicant_notes_imported: {
    icon: <NoteIcon size={14} aria-hidden />,
    color: "blue",
  },
  applicant_education_changed: {
    icon: <GraduationCapIcon size={14} aria-hidden />,
    color: "violet",
  },
  applicant_language_tests_changed: {
    icon: <CertificateIcon size={14} aria-hidden />,
    color: "violet",
  },
  applicant_assigned: {
    icon: <UserCirclePlusIcon size={14} aria-hidden />,
    color: "blue",
  },
  applicant_unassigned: {
    icon: <UserMinusIcon size={14} aria-hidden />,
    color: "gray",
  },
};

/**
 * `changes.assigned_to` on an assignment event is `{ from, to }` as **user
 * ids** — a pair of UUIDs is noise in a table someone reads by eye, and the
 * `summary` already names the move. Drop it; keep every other change.
 */
function withoutAssigneeIds(entry: HistoryEntry): HistoryEntry {
  const changes = entry.changes ?? {};
  if (!("assigned_to" in changes)) return entry;
  return {
    ...entry,
    changes: Object.fromEntries(
      Object.entries(changes).filter(([field]) => field !== "assigned_to"),
    ),
  };
}

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
  const entries = (data?.data ?? []).map(withoutAssigneeIds);
  const truncated = (data?.meta.total ?? 0) > entries.length;

  return (
    <Stack gap="md">
      <ProfilePanelHeader
        title="History"
        description="Recorded automatically — read only"
      />

      {isLoading ? (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      ) : isError ? (
        <QueryErrorState
          message="Couldn't load history."
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      ) : entries.length === 0 ? (
        <Text size="xs" c="dimmed">
          No history yet.
        </Text>
      ) : (
        <HistoryTable
          entries={entries}
          iconFor={(action) => ICONS[action]}
          truncatedNote={
            truncated
              ? `Showing the ${entries.length} most recent entries.`
              : undefined
          }
        />
      )}
    </Stack>
  );
}
