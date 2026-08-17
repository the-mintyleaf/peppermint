"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Group,
  Loader,
  SegmentedControl,
  Stack,
  Text,
} from "@peppermint/ui";
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
  const today = useMemo(() => nepalToday(), []);

  const { data, isLoading, isError, isRefetching, refetch } = useReminderList({
    ...owner,
    page_size: 100,
  });

  const reminders = useMemo(
    () => sortRemindersForPanel(data?.data ?? [], today),
    [data?.data, today],
  );
  const openCount = reminders.filter((r) => r.status === "active").length;
  const visible =
    filter === "open" ? reminders.filter((r) => r.is_active) : reminders;

  const handleAdd = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const handleReschedule = (reminder: Reminder) => {
    setEditing(reminder);
    setFormOpen(true);
  };

  return (
    <Stack gap="md">
      <ProfilePanelHeader
        title="Reminders"
        description="Dated follow-ups on this record. Admins are alerted when one comes due."
        count={openCount}
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

      {/* A filter over data already in hand — not a second request. */}
      <Group justify="flex-start">
        <SegmentedControl
          size="xs"
          value={filter}
          onChange={(value) => setFilter(value as PanelFilter)}
          data={[
            { label: "Open", value: "open" },
            { label: "All", value: "all" },
          ]}
          aria-label="Filter reminders by status"
        />
      </Group>

      {isLoading ? <Loader size="sm" /> : null}

      {isError ? (
        <QueryErrorState
          message="Couldn't load reminders for this record."
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      ) : null}

      {!isLoading && !isError && visible.length === 0 ? (
        <Text size="xs" c="dimmed">
          {filter === "open"
            ? "No open reminders. Add one to be prompted about this record later."
            : "No reminders have been set on this record."}
        </Text>
      ) : null}

      {!isLoading && !isError && visible.length > 0 ? (
        <Stack gap="xs">
          {visible.map((reminder) => (
            <ReminderRow
              key={reminder.id}
              reminder={reminder}
              today={today}
              onReschedule={handleReschedule}
            />
          ))}
        </Stack>
      ) : null}

      {/* Truncation is disclosed rather than hidden: `meta.total` is the true
          count, and a record with more than a page of reminders should say so
          instead of quietly showing the first hundred. */}
      {!isLoading && !isError && (data?.meta.total ?? 0) > reminders.length ? (
        <Text size="xs" c="dimmed">
          Showing the {reminders.length} most recent of {data?.meta.total}.
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
