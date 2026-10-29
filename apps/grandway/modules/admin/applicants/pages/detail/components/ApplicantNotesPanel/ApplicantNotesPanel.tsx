"use client";

import { Stack, useQueryClient } from "@peppermint/ui";
import { ProfilePanelHeader } from "@/components/profile";
import { NotesPanel } from "@/components/notes-panel";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { useApplicantAuthority } from "../../../../applicants.access";
import { useApplicantNotesAdapter } from "../../../../applicants.hooks";
import { applicantsQueryKeys } from "../../../../applicants.queryKeys";
import type { ApplicantNotesPanelProps } from "./ApplicantNotesPanel.types";

const ARCHIVED_REASON =
  "This applicant is archived. Notes stay readable, but nothing can be added or changed until an Admin restores the file.";

/**
 * The applicant's General / Visit notes through the shared `NotesPanel`.
 *
 * Open to Admins and Lead Managers alike — notes are their own resource, not
 * the applicant record (which stays Admin-edit-only in this app). Edit/delete
 * show on a reader's own notes; an Admin moderates every note. Notes copied
 * from the converted lead arrive here already, with their original author.
 *
 * Archived → read-only with the reason. A write refused with 409 (archived in
 * another tab) refetches the applicant so the banner follows.
 */
export function ApplicantNotesPanel({ applicant }: ApplicantNotesPanelProps) {
  const adapter = useApplicantNotesAdapter(applicant.id);
  const { user } = useCurrentUser();
  const authority = useApplicantAuthority();
  const queryClient = useQueryClient();

  // Everyone who reaches this page may write notes (the same reach as reading
  // the applicant), so archiving is the only freeze.
  const readOnlyReason =
    applicant.status === "archived" ? ARCHIVED_REASON : undefined;

  return (
    <Stack gap="md">
      <ProfilePanelHeader
        title="Notes"
        description="General notes and office visits — backdate a visit to when it happened"
      />
      <NotesPanel
        adapter={adapter}
        currentUserId={user?.id}
        isAdmin={authority.moderateNotes}
        readOnlyReason={readOnlyReason}
        subjectLabel="applicant"
        onWriteConflict={() =>
          void queryClient.invalidateQueries({
            queryKey: applicantsQueryKeys.detail(applicant.id),
            exact: true,
          })
        }
      />
    </Stack>
  );
}
