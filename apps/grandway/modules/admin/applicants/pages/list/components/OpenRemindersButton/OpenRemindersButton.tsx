"use client";

import { useState } from "react";
import { ActionIcon, Box, Modal, ScrollArea, Tooltip } from "@peppermint/ui";
import { AlarmIcon } from "@phosphor-icons/react/dist/csr/Alarm";
import { useCapabilities } from "@/config/access";
// Concrete-file import, not the `reminders` barrel — the app's cycle rule.
import { RecordRemindersPanel } from "@/modules/admin/reminders/_shared/RecordRemindersPanel";
import { applicantDisplayName } from "../../../../applicants.labels";
import type { OpenRemindersButtonProps } from "./OpenRemindersButton.types";

/**
 * List-row entry into an applicant's reminders — the row-level analog of
 * `OpenJourneysButton`.
 *
 * **A modal rather than a route**, deliberately. Setting a follow-up is almost
 * always an interruption of something else: an operator is working down the
 * list, remembers they owe someone a call, and wants to leave a dated note
 * without losing their place, their filters, or their scroll position. Sending
 * them to the detail page to do it costs two navigations and their context —
 * which is the same reason this module has no `/admin/reminders` route at all.
 *
 * The modal hosts the very same `RecordRemindersPanel` the detail tab does, so
 * reading and writing behave identically in both places and there is one
 * component to keep correct rather than two.
 *
 * **Self-gating on `caps.reminders`**, like `OpenDocumentButton` gates itself on
 * documents: every reminders endpoint 403s a `superadmin`, so the affordance
 * must not render for one rather than opening a panel that can only fail.
 *
 * Output-contract states: **loading / empty / request-failed** all belong to the
 * panel inside, which owns them already · **permission-denied** the button does
 * not render · **read-only** N/A, this module has no read/write split · nothing
 * here is destructive, so no confirm and no spatial separation is needed at
 * this level (the rows inside handle their own).
 */
export function OpenRemindersButton({ applicant }: OpenRemindersButtonProps) {
  const { reminders: canUseReminders } = useCapabilities();
  const [opened, setOpened] = useState(false);

  if (!canUseReminders) return null;

  const displayName = applicantDisplayName(applicant);

  return (
    <>
      <Tooltip label="Reminders" withArrow>
        <ActionIcon
          variant="subtle"
          size="sm"
          color="gray"
          aria-label={`Reminders for ${displayName}`}
          onClick={() => setOpened(true)}
        >
          <AlarmIcon size={16} aria-hidden />
        </ActionIcon>
      </Tooltip>

      {/* Mounted only while open: the panel fetches on mount, so a closed modal
          per row would put one request per row on the page. */}
      {opened ? (
        <Modal
          opened
          onClose={() => setOpened(false)}
          size="lg"
          // A record with a long history of follow-ups scrolls INSIDE the
          // modal; without this the modal grows past the viewport and the
          // "Add reminder" control at the top scrolls away with the page.
          scrollAreaComponent={ScrollArea.Autosize}
          // The person, not the feature — the panel's own header says
          // "Reminders" a line below, and repeating it here would waste the
          // one line that tells the operator whose list they opened.
          title={displayName}
        >
          {/* The app theme zeroes Modal body padding; the content wrapper
              restores it rather than the modal's own `styles`. */}
          <Box p="md">
            <RecordRemindersPanel owner={{ applicant: applicant.id }} />
          </Box>
        </Modal>
      ) : null}
    </>
  );
}
