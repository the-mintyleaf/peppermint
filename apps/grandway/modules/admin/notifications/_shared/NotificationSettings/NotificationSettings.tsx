"use client";

import {
  Alert,
  Center,
  Divider,
  Loader,
  Stack,
  Switch,
  Text,
} from "@peppermint/ui";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { QueryErrorState } from "@/components/QueryErrorState";
import {
  useNotificationPreferences,
  useUpdatePreferences,
} from "../../notifications.hooks";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
} from "../../notifications.labels";
import type { NotificationCategory } from "../../notifications.types";
import type { SettingsSection } from "./NotificationSettings.types";

/**
 * Grouped by what the alert is about, mirroring how a reader thinks about
 * the inbox. Every category appears exactly once.
 */
const SECTIONS: SettingsSection[] = [
  {
    title: "People",
    categories: ["lead", "applicant_status", "assignment", "notes"],
  },
  {
    title: "Work in progress",
    categories: ["journey", "checklist", "follow_up", "documents", "file"],
  },
  { title: "Deadlines", categories: ["offer", "expiry"] },
];

/**
 * Notification settings — rendered inside the drawer in place of the inbox.
 *
 * Form reasoning (`/form-builder`): this is a set of independent on/off
 * preferences, not a record being composed, so there is no Save button, no
 * dirty state, and no `FormWrapper` — nothing is "in progress" to lose. Each
 * switch is a lever that applies immediately with one partial `PATCH`, and the
 * switches re-render from the server's FULL response (written into the cache),
 * never from what was sent. A failed save therefore leaves the switch where it
 * was and raises an error toast; while a save is in flight the switches are
 * disabled so two PATCHes cannot race. Defaults (everything on, "only mine"
 * off) mean most people never open this — so it is one tap away in the drawer
 * header, not a page of its own.
 *
 * The most consequential fact is stated first and not hidden in a tooltip:
 * changes apply only to alerts created from now on (§7) — muting does not
 * clear what is already in the inbox, and un-muting does not bring back what
 * was skipped.
 *
 * States: loading → `Loader`; request-failed → `QueryErrorState` + retry;
 * pending save → switches disabled; empty/permission-denied/read-only N/A (the
 * resource always exists and is always the caller's own).
 */
export function NotificationSettings() {
  const { data, isLoading, isError, isRefetching, refetch } =
    useNotificationPreferences();
  const update = useUpdatePreferences();

  if (isLoading) {
    return (
      <Center h={200}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (isError || !data) {
    return (
      <QueryErrorState
        message="Couldn't load your notification settings."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

  const setCategory = (category: NotificationCategory, inApp: boolean) =>
    update.mutate({ categories: { [category]: { in_app: inApp } } });

  return (
    <Stack gap="md">
      <Alert
        variant="light"
        color="blue"
        icon={<InfoIcon size={16} aria-hidden />}
      >
        Changes apply to new alerts only. Alerts already in your inbox stay
        where they are, and alerts skipped while a category was off are not
        recovered.
      </Alert>

      <Stack gap="xs">
        <Text size="xs" fw={600} tt="uppercase" c="dimmed">
          Scope
        </Text>
        <Switch
          label="Only alerts about applicants assigned to me"
          description="Alerts about someone else's applicant, or an unassigned one, are not raised for you. Alerts that aren't about an applicant, and being assigned or unassigned yourself, are unaffected."
          checked={data.assigned_only}
          disabled={update.isPending}
          onChange={(event) =>
            update.mutate({ assigned_only: event.currentTarget.checked })
          }
        />
      </Stack>

      {SECTIONS.map((section) => (
        <Stack key={section.title} gap="sm">
          <Divider />
          <Text size="xs" fw={600} tt="uppercase" c="dimmed">
            {section.title}
          </Text>
          {section.categories.map((category) => (
            <Switch
              key={category}
              label={CATEGORY_LABELS[category]}
              description={CATEGORY_DESCRIPTIONS[category]}
              checked={data.categories[category].in_app}
              disabled={update.isPending}
              onChange={(event) =>
                setCategory(category, event.currentTarget.checked)
              }
            />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
