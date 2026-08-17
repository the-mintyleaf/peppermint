"use client";

import { useMemo, useState } from "react";
import { Badge, Box, Button, Loader, Stack, Tabs, Text } from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { ProfilePanelHeader } from "@/components/profile";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useReminderList } from "../../reminders.hooks";
import { nepalToday, sortRemindersForPanel } from "../../reminders.utils";
import type { Reminder } from "../../reminders.types";
import { ReminderFormModal } from "../../form/ReminderFormModal";
import { ReminderRow } from "../ReminderRow";
import type { RecordRemindersPanelProps } from "./RecordRemindersPanel.types";

type PanelFilter = "open" | "all";

/** Tab order, and the single place the two panels are enumerated. */
const TAB_VALUES = ["open", "all"] as const satisfies readonly PanelFilter[];

/**
 * The rows of one tab, or its empty state.
 *
 * Extracted so both panels render through one path — a second inline copy is
 * how two views drift into looking like two features.
 */
function ReminderList({
  reminders,
  today,
  emptyMessage,
  onReschedule,
}: {
  reminders: Reminder[];
  today: string;
  emptyMessage: string;
  onReschedule: (reminder: Reminder) => void;
}) {
  if (reminders.length === 0) {
    return (
      <Text size="xs" c="dimmed">
        {emptyMessage}
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      {reminders.map((reminder) => (
        <ReminderRow
          key={reminder.id}
          reminder={reminder}
          today={today}
          onReschedule={onReschedule}
        />
      ))}
    </Stack>
  );
}

/**
 * The record's dated follow-ups — the concept's "Reminders panel", embeddable
 * on any screen that owns an applicant or a client.
 *
 * **One request, filtered client-side.** `status` is deliberately omitted from
 * the query so the response carries open *and* closed rows, and the Open/All
 * toggle is a client-side filter over that one result. Two filtered requests
 * would be two cache entries, two loading states, and a flash of empty every
 * time the toggle moved — for a panel whose whole job is operational memory.
 *
 * Rows are sorted for reading (soonest due first, closed sunk to the bottom)
 * rather than in the server's order: this API has no `ordering` parameter and
 * always returns newest-created first, so reading order is the client's to own.
 *
 * Output-contract states: **empty** a plain sentence that differs by filter ·
 * **loading** `Loader` · **request-failed** `QueryErrorState` with retry ·
 * **permission-denied** N/A — the host screen gates on `caps.reminders` before
 * rendering this, and every endpoint here shares that one rule · **read-only**
 * N/A, this module has no read/write split, so anyone who sees the panel may
 * write · **archived record** reminders may be set on an archived applicant or
 * a retired client, deliberately, so nothing is hidden · **conflicting edits**
 * a 409 from a row surfaces as "already closed" and the invalidation refetches.
 */
export function RecordRemindersPanel({ owner }: RecordRemindersPanelProps) {
  const [filter, setFilter] = useState<PanelFilter>("open");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | undefined>(undefined);

  // One clock for the whole render pass — every row buckets against this same
  // value, so a list can never straddle midnight NPT inconsistently.
  //
  // Deliberately NOT memoized on mount. This panel can sit open indefinitely (a
  // detail tab, a drawer), and a `useMemo(..., [])` here would keep reporting
  // "due today" for a reminder that went overdue at midnight NPT while the tab
  // was open. Recomputing per render is one `Intl` format, and because the
  // result is a stable string the memos below still skip their work on every
  // render of an unchanged day.
  const today = nepalToday();

  const { data, isLoading, isError, isRefetching, refetch } = useReminderList({
    ...owner,
    page_size: 100,
  });

  const reminders = useMemo(
    () => sortRemindersForPanel(data?.data ?? [], today),
    [data?.data, today],
  );
  // `is_active` is the server's own derived flag — read it rather than
  // recomputing, so a row can never disagree with itself.
  const openReminders = useMemo(
    () => reminders.filter((reminder) => reminder.is_active),
    [reminders],
  );
  const openCount = openReminders.length;

  const handleAdd = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const handleReschedule = (reminder: Reminder) => {
    setEditing(reminder);
    setFormOpen(true);
  };

  return (
    // `gap={0}` so the tab strip sits flush under the header's own divider —
    // a gap there reads as a seam between two unrelated blocks, when the tabs
    // are the header's own control. Everything else that needs air asks for it
    // explicitly below.
    <Stack gap={0}>
      <ProfilePanelHeader
        title="Reminders"
        description="Dated follow-ups on this record. Admins are alerted when one comes due."
        action={
          <Button
            size="compact-sm"
            variant="light"
            leftSection={<PlusIcon size={14} aria-hidden />}
            onClick={handleAdd}
          >
            Add reminder
          </Button>
        }
      />

      {/* Loading and error belong ABOVE the tabs: they are properties of the
          one request that feeds both views, not of either view. Putting them
          inside a panel would redraw the tab strip on every refetch. */}
      {isLoading ? <Loader size="sm" mt="md" /> : null}

      {isError ? (
        <Box mt="md">
          <QueryErrorState
            message="Couldn't load reminders for this record."
            onRetry={() => refetch()}
            isRetrying={isRefetching}
          />
        </Box>
      ) : null}

      {/* Real tabs, and a filter over data already in hand — not a second
          request. Both panels read the same query result; the counts on the
          strip are what make "Open" a decision rather than a guess. */}
      {!isLoading && !isError ? (
        <Tabs
          value={filter}
          onChange={(value) => setFilter((value as PanelFilter) ?? "open")}
          keepMounted={false}
        >
          <Tabs.List>
            <Tabs.Tab
              value="open"
              rightSection={
                <Badge size="xs" variant="light" circle>
                  {openCount}
                </Badge>
              }
            >
              <Text size="xs" fw={700} span>
                Open
              </Text>
            </Tabs.Tab>
            <Tabs.Tab
              value="all"
              rightSection={
                <Badge size="xs" variant="light" circle>
                  {reminders.length}
                </Badge>
              }
            >
              <Text size="xs" fw={700} span>
                All
              </Text>
            </Tabs.Tab>
          </Tabs.List>

          {TAB_VALUES.map((value) => (
            <Tabs.Panel key={value} value={value} pt="md">
              <ReminderList
                reminders={value === "open" ? openReminders : reminders}
                today={today}
                emptyMessage={
                  value === "open"
                    ? "No open reminders. Add one to be prompted about this record later."
                    : "No reminders have been set on this record."
                }
                onReschedule={handleReschedule}
              />
            </Tabs.Panel>
          ))}
        </Tabs>
      ) : null}

      {/* Truncation is disclosed rather than hidden. Worded against the record,
          not against the rows on screen: the Open/All filter changes what is
          visible but not what was fetched, so "showing N of M" would contradict
          a filtered view. The warning is explicit that rows can be MISSING
          rather than merely reordered — this API has no `ordering`, so the page
          holds the newest-created reminders, and an old but still-open one can
          fall outside it. */}
      {!isLoading && !isError && (data?.meta.total ?? 0) > reminders.length ? (
        <Text size="xs" c="dimmed" mt="xs">
          This record has {data?.meta.total} reminders; only the{" "}
          {reminders.length} most recently created are loaded, so an older open
          follow-up may not appear here.
        </Text>
      ) : null}

      {/* Mounted only while open so the form engine reads fresh initial values
          for each row — `FormWrapper` captures `initial` once at mount. */}
      {formOpen ? (
        <ReminderFormModal
          opened
          onClose={() => setFormOpen(false)}
          owner={owner}
          reminder={editing}
        />
      ) : null}
    </Stack>
  );
}
