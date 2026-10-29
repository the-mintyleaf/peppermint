"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Center,
  Divider,
  Drawer,
  Group,
  Loader,
  Stack,
  Tabs,
  Text,
  Title,
  dayjs,
} from "@peppermint/ui";
import { RowActionsMenu } from "@peppermint/admin";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { NotesPanel } from "@/components/notes-panel";
import { getApiError } from "@/lib/authErrorMessages";
import { useLeadAccess } from "../../../../leadAccess.hooks";
import {
  useDeleteLead,
  useLeadDetail,
  useLeadNotesAdapter,
  useRefreshLead,
  useRestoreLead,
} from "../../../../leadManagement.hooks";
import type { LeadDetail } from "../../../../leadManagement.types";
import {
  openDeleteLeadModal,
  openRestoreLeadModal,
} from "../../leadDeletion.utils";
import { LeadHistoryPanel } from "./LeadHistoryPanel";
import { LeadOverviewPanel } from "./LeadOverviewPanel";
import type { LeadDetailDrawerProps } from "./LeadDetailDrawer.types";

function userName(user: { display_name: string; username: string } | null) {
  return user ? user.display_name || user.username : "";
}

/**
 * The profile's anchor: who this is, and where the record came from. The name
 * sits at `h3`, sized for the drawer's narrow column rather than a page. Its
 * provenance line carries the only two facts the property list below doesn't
 * repeat — when the lead was added and by whom. Stage is a lever, not a fact,
 * so it leads the overview below instead of crowding the heading.
 *
 * The Admin-only Delete sits in a dots menu beside the name — away from the
 * stage lever, behind a deliberate second click and a reason. Hidden for a
 * lead that was ever converted (the backend refuses it) or is already deleted.
 */
function LeadProfileHeader({ lead }: { lead: LeadDetail }) {
  const { isLeadAdmin } = useLeadAccess();
  const deleteLead = useDeleteLead();
  const addedBy = userName(lead.created_by);
  const canDelete =
    isLeadAdmin && !lead.deleted_at && !lead.converted_applicant_id;

  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
      <Stack gap={2} style={{ minWidth: 0 }}>
        <Title order={3}>{lead.full_name}</Title>
        <Text size="xs" c="dimmed">
          Added {dayjs(lead.created_at).format("MMM D, YYYY")}
          {addedBy ? ` by ${addedBy}` : ""}
        </Text>
      </Stack>
      {canDelete ? (
        <RowActionsMenu<LeadDetail>
          record={lead}
          aria-label={`More actions for ${lead.full_name}`}
          actions={[
            {
              label: "Delete lead",
              icon: <TrashIcon size={16} aria-hidden />,
              color: "red",
              onClick: (record) =>
                openDeleteLeadModal(record, deleteLead.mutateAsync),
            },
          ]}
        />
      ) : null}
    </Group>
  );
}

/**
 * A deleted lead (only an Admin ever receives one) says so first, in words:
 * when, by whom, why — and offers the one way back. Distinct from "lost": the
 * banner is red, sits above everything, and names the recovery path.
 */
function DeletedLeadBanner({ lead }: { lead: LeadDetail }) {
  const { isLeadAdmin } = useLeadAccess();
  const restoreLead = useRestoreLead();
  const deletedBy = userName(lead.deleted_by);
  const deletedAt = lead.deleted_at
    ? dayjs(lead.deleted_at).format("MMM D, YYYY h:mm A")
    : "";

  return (
    <Alert
      color="red"
      variant="light"
      icon={<TrashIcon size={18} aria-hidden />}
      title="This lead was deleted"
    >
      <Stack gap="xs">
        <Text size="xs">
          Deleted {deletedAt}
          {deletedBy ? ` by ${deletedBy}` : ""}. It is hidden from the board,
          search and dashboards, and nothing on it can change until it is
          restored.
        </Text>
        {lead.delete_reason ? (
          <Text size="xs">
            <Text span size="xs" fw={600}>
              Reason:
            </Text>{" "}
            {lead.delete_reason}
          </Text>
        ) : null}
        {isLeadAdmin ? (
          <Group>
            <Button
              size="xs"
              variant="default"
              leftSection={<ArrowCounterClockwiseIcon size={14} aria-hidden />}
              onClick={() =>
                openRestoreLeadModal(lead, restoreLead.mutateAsync)
              }
            >
              Restore lead
            </Button>
          </Group>
        ) : null}
      </Stack>
    </Alert>
  );
}

/**
 * Notes v2 through the shared `NotesPanel`: General / Visit tabs with
 * `meta.counts` badges, backdatable `noted_at`, edit/delete for the author
 * or an Admin. Read-only once the lead is deleted or was ever converted
 * (`converted_applicant_id` survives a reopen, and so does the rule).
 */
function LeadNotesTab({ lead }: { lead: LeadDetail }) {
  const adapter = useLeadNotesAdapter(lead.id);
  const { isLeadAdmin, currentUserId } = useLeadAccess();
  const refreshLead = useRefreshLead();

  let readOnlyReason: string | undefined;
  if (lead.deleted_at) {
    readOnlyReason =
      "This lead was deleted. Restore it to add or change notes.";
  } else if (lead.converted_applicant_id) {
    readOnlyReason =
      "This lead was converted — notes are now kept on the applicant, where these were copied.";
  }

  return (
    <NotesPanel
      adapter={adapter}
      currentUserId={currentUserId}
      isAdmin={isLeadAdmin}
      readOnlyReason={readOnlyReason}
      subjectLabel="lead"
      onWriteConflict={() => refreshLead(lead.id)}
    />
  );
}

/**
 * Full detail, always the real fetch — never trusts the board's trimmed row.
 * A 404 renders as generic not-found, never "access denied" — the backend
 * deliberately can't tell out-of-scope, missing and (for a Lead Manager)
 * deleted apart (`INTEGRATION.md` §7). A *different* failure (network blip,
 * 500) is NOT presented as "not found" — it gets a distinct message and a
 * retry. An Admin opening a deleted lead (e.g. from a notification link) gets
 * the lead itself, with `DeletedLeadBanner` on top.
 */
export function LeadDetailDrawer({
  leadId,
  opened,
  onClose,
}: LeadDetailDrawerProps) {
  // Closing clears `leadId` before the drawer's exit animation finishes, so
  // the last opened id is retained and kept rendered while it slides out —
  // otherwise the closing drawer flashes "Couldn't load this lead". Derived
  // during render (the documented "adjust state on prop change" pattern).
  const [retainedLeadId, setRetainedLeadId] = useState(leadId);
  if (leadId !== null && leadId !== retainedLeadId) {
    setRetainedLeadId(leadId);
  }
  const shownLeadId = leadId ?? retainedLeadId;

  const {
    data: lead,
    isLoading,
    isError,
    error,
    refetch,
  } = useLeadDetail(shownLeadId);
  const notFound =
    isError && getApiError(error).code === "LEADS_LEAD_NOT_FOUND";

  // `md` (~440px) — a reading column. The header names the surface ("Lead
  // Profile"), not the record — the lead's own name is the in-body heading.
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={<Title order={4}>Lead Profile</Title>}
    >
      {isLoading ? (
        <Center h={200}>
          <Loader size="sm" aria-label="Loading lead" />
        </Center>
      ) : notFound ? (
        <Stack align="center" gap={4} py="xl">
          <Text size="sm" fw={500} ta="center">
            Lead not found.
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            It may have been deleted, or it isn&apos;t one of yours.
          </Text>
        </Stack>
      ) : isError || !lead ? (
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed" ta="center">
            Couldn&apos;t load this lead.
          </Text>
          <Button size="xs" variant="default" onClick={() => refetch()}>
            Try again
          </Button>
        </Stack>
      ) : (
        // Keyed by id: `?lead=` can switch A → B while the drawer stays open
        // (a notification link, a spotlight hit). Remounting resets the tab,
        // the notes page/tab, any in-place note edit and the composer draft,
        // so nothing from A carries onto B.
        <Stack gap="md" key={lead.id}>
          {lead.deleted_at ? <DeletedLeadBanner lead={lead} /> : null}

          <LeadProfileHeader lead={lead} />

          <LeadOverviewPanel lead={lead} />

          <Divider />

          <Tabs defaultValue="notes">
            <Tabs.List>
              <Tabs.Tab value="notes">
                <Text size="xs" fw={600}>
                  Notes
                </Text>
              </Tabs.Tab>
              <Tabs.Tab value="history">
                <Text size="xs" fw={600}>
                  History
                </Text>
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="notes" pt="md">
              <LeadNotesTab lead={lead} />
            </Tabs.Panel>

            <Tabs.Panel value="history" pt="md">
              <LeadHistoryPanel leadId={lead.id} />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      )}
    </Drawer>
  );
}
