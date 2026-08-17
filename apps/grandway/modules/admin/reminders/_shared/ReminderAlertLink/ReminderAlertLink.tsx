"use client";

import Link from "next/link";
import { Button } from "@peppermint/ui";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { useReminder } from "../../reminders.hooks";
import type { ReminderAlertLinkProps } from "./ReminderAlertLink.types";

/**
 * The "View record" control on a `custom_reminder` alert.
 *
 * **Why this is a component and not a line in `resolveNotificationLink`:** that
 * function routes from the notification payload alone, and a `custom_reminder`
 * payload names only the reminder (`source_entity_id` is the reminder id,
 * `source_api_path` is `/api/v1/reminders/<id>/`). It carries nothing about the
 * applicant or client the follow-up concerns — so there is no route to derive,
 * and the module's standing rule is never to guess a URL from an id. Resolving
 * it means *asking*, which needs a hook, which needs a component.
 *
 * The lookup is cached under the reminder's own detail key, so several alerts
 * about the same reminder cost one request, and the panel that later opens the
 * same reminder reuses it.
 *
 * Output-contract states: **loading** the button renders disabled rather than
 * popping in late and shifting the row · **request-failed / not-found** renders
 * nothing — the alert still shows its title and body, which already name the
 * record and the note, so a missing link degrades to the same honest state
 * every other unroutable notification type has · **empty** N/A ·
 * **permission-denied** N/A, the drawer is already gated · **read-only** N/A ·
 * **archived record** a closed reminder still resolves and still links, because
 * its record is still worth reaching.
 */
export function ReminderAlertLink({
  reminderId,
  onNavigate,
}: ReminderAlertLinkProps) {
  const { data: reminder, isLoading, isError } = useReminder(reminderId);

  if (isLoading) {
    return (
      <Button size="compact-xs" variant="light" disabled>
        View record
      </Button>
    );
  }

  if (isError || !reminder) return null;

  // A client has no detail route in this app — the directory opens records in a
  // drawer from its list — so a client-owned reminder lands on the list. The
  // alert's title already names the owner, so the row the reader wants is
  // identifiable once they are there.
  const href = reminder.applicant
    ? `/admin/applicants/${reminder.applicant}`
    : "/admin/clients";

  return (
    <Button
      size="compact-xs"
      variant="light"
      component={Link}
      href={href}
      rightSection={<ArrowSquareOutIcon size={12} aria-hidden />}
      onClick={onNavigate}
    >
      {reminder.applicant ? "View applicant" : "View clients"}
    </Button>
  );
}
