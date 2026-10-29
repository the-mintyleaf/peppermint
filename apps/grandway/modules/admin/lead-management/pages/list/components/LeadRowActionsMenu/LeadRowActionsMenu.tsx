"use client";

import { useState } from "react";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { NotePencilIcon } from "@phosphor-icons/react/dist/csr/NotePencil";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { PhoneCallIcon } from "@phosphor-icons/react/dist/csr/PhoneCall";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { ActionIcon, Group, Tooltip } from "@peppermint/ui";
import { RowActionsMenu, useModalTableShellContext } from "@peppermint/admin";

import { useLeadAccess } from "../../../../leadAccess.hooks";
import { useDeleteLead } from "../../../../leadManagement.hooks";
import type { LeadBoardRow } from "../../../../leadManagement.types";
import { openDeleteLeadModal } from "../../leadDeletion.utils";
import { AddVisitNoteModal, canAddVisitNote } from "../AddVisitNoteModal";
import { RecordFollowUpModal } from "../RecordFollowUpModal";
import type { LeadRowActionsMenuProps } from "./LeadRowActionsMenu.types";

/**
 * "Edit" delegates to the shell's own edit modal (`openEditModal`). Stage
 * moves and the lifecycle transitions (change stage, mark lost, convert,
 * reopen) live in the inline `LeadStageSwitch` in the Stage column, so this
 * menu keeps the non-stage actions: View, Edit, Add visit note, Record
 * follow-up, and — for an Admin, last and divided off as the one destructive
 * lever — Delete.
 *
 * "Add visit note" is the one action also given a quiet one-click icon on the
 * row: logging a walk-in is the most frequent write on the board and is safe
 * (no stage change, editable later). It and the menu item hide wherever notes
 * are read-only (`canAddVisitNote`: converted or deleted). Follow-up hides once
 * a lead is closed (`lost`/`converted`) — there is nothing left to follow up
 * on. Delete hides on a `converted` lead (the backend refuses it: an
 * applicant's origin record); a converted-then-reopened lead looks active in
 * the list shape, so the server's 409 `LEADS_LEAD_ALREADY_CONVERTED` covers
 * that case for both Delete and the visit note.
 */
export function LeadRowActionsMenu({
  lead,
  onViewDetails,
}: LeadRowActionsMenuProps) {
  const { openEditModal } = useModalTableShellContext<LeadBoardRow>();
  const { isLeadAdmin } = useLeadAccess();
  const deleteLead = useDeleteLead();
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [visitNoteOpen, setVisitNoteOpen] = useState(false);
  const isClosed = lead.stage === "lost" || lead.stage === "converted";
  const notesWritable = canAddVisitNote(lead);
  const visitNoteLabel = `Add visit note for ${lead.full_name}`;

  return (
    <>
      <Group gap={4} justify="flex-end" wrap="nowrap">
        {notesWritable ? (
          <Tooltip label="Add visit note">
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label={visitNoteLabel}
              onClick={() => setVisitNoteOpen(true)}
            >
              <NotePencilIcon size={16} aria-hidden />
            </ActionIcon>
          </Tooltip>
        ) : null}
        <RowActionsMenu<LeadBoardRow>
          record={lead}
          aria-label={`Actions for ${lead.full_name}`}
          actions={[
            {
              label: "View details",
              icon: <EyeIcon size={16} aria-hidden />,
              onClick: onViewDetails,
            },
            {
              label: "Edit",
              icon: <PencilSimpleIcon size={16} aria-hidden />,
              onClick: (record) => openEditModal(record),
            },
            {
              label: "Add visit note",
              icon: <NotePencilIcon size={16} aria-hidden />,
              dividerBefore: true,
              hidden: (record) => !canAddVisitNote(record),
              onClick: () => setVisitNoteOpen(true),
            },
            {
              label: "Record follow-up",
              icon: <PhoneCallIcon size={16} aria-hidden />,
              dividerBefore: !notesWritable,
              hidden: () => isClosed,
              onClick: () => setFollowUpOpen(true),
            },
            {
              label: "Delete lead",
              icon: <TrashIcon size={16} aria-hidden />,
              color: "red",
              dividerBefore: true,
              hidden: (record) => !isLeadAdmin || record.stage === "converted",
              onClick: (record) =>
                openDeleteLeadModal(record, deleteLead.mutateAsync),
            },
          ]}
        />
      </Group>

      <AddVisitNoteModal
        lead={lead}
        opened={visitNoteOpen}
        onClose={() => setVisitNoteOpen(false)}
      />
      <RecordFollowUpModal
        lead={lead}
        opened={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
      />
    </>
  );
}
