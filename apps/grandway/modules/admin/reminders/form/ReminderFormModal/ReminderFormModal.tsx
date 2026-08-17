"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  DateInput,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  modals,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";
import { useCreateReminder, useUpdateReminder } from "../../reminders.hooks";
import { changedUpdateFields, nepalToday } from "../../reminders.utils";
import type {
  ReminderFormModalProps,
  ReminderFormValues,
} from "./ReminderFormModal.types";

const NOTE_MAX = 5000;

/**
 * **The date floor is Nepal's today, not the browser's.** `nepalToday()` feeds
 * both this schema and the picker's `minDate`, so the control cannot even offer
 * a date the server would reject — the difference between a form that prevents
 * the error and one that merely reports it.
 */
function buildSchema(today: string) {
  return z.object({
    due_date: z
      .string({ error: "Pick a date for the follow-up." })
      .min(1, "Pick a date for the follow-up.")
      // String comparison IS date comparison for `YYYY-MM-DD`, and it keeps the
      // check in the same calendar the server uses. Constructing a `Date` here
      // would re-introduce the timezone drift this module exists to avoid.
      .refine((value) => value >= today, {
        message:
          "Pick today or a later date — a reminder can't fire in the past.",
      }),
    note: z
      .string()
      .trim()
      .min(
        1,
        "Say what the follow-up is for — this is what you'll read when it fires.",
      )
      .max(
        NOTE_MAX,
        `Keep the note under ${NOTE_MAX.toLocaleString()} characters.`,
      ),
  });
}

/**
 * Quick picks. A follow-up date is almost always "a bit from now" rather than a
 * specific calendar day, so the common intents are one tap instead of a
 * navigate-and-click through the picker. Computed off Nepal's today so they can
 * never disagree with the field's own floor.
 */
function quickPickDates(today: string): { label: string; value: string }[] {
  const addDays = (days: number) =>
    new Date(Date.parse(`${today}T00:00:00Z`) + days * 86_400_000)
      .toISOString()
      .slice(0, 10);
  return [
    { label: "Tomorrow", value: addDays(1) },
    { label: "In a week", value: addDays(7) },
    { label: "In a month", value: addDays(30) },
  ];
}

function ReminderFields({ today }: { today: string }) {
  const { form } = useFormInstance<ReminderFormValues>();
  const quickPicks = useMemo(() => quickPickDates(today), [today]);
  const note = form.values.note ?? "";

  return (
    <Stack gap="md">
      <Stack gap={6}>
        <DateInput
          label="Due date"
          description="The reminder surfaces at the start of this day, Nepal time."
          placeholder="2026-08-25"
          valueFormat="YYYY-MM-DD"
          // Past days are unreachable in the picker, not merely rejected on
          // submit — the constraint is expressed by the control itself.
          minDate={today}
          required
          // A short value gets a short field. A full-width date input reads as
          // an invitation to type prose into it.
          maw={220}
          {...form.getInputProps("due_date")}
        />
        <Group gap="xs">
          {quickPicks.map((pick) => (
            <Button
              key={pick.value}
              size="compact-xs"
              variant="subtle"
              color="gray"
              onClick={() => form.setFieldValue("due_date", pick.value)}
            >
              {pick.label}
            </Button>
          ))}
        </Group>
      </Stack>

      <Stack gap={4}>
        <Textarea
          label="Note"
          description="Why this follow-up exists — the alert shows this text verbatim."
          placeholder="Chase IELTS certificate before the SOP review call."
          autosize
          minRows={3}
          maxRows={8}
          required
          maxLength={NOTE_MAX}
          {...form.getInputProps("note")}
        />
        {/* Only surfaces near the ceiling — a permanent 0/5,000 counter on a
            note nobody will fill that far is noise, but silently hitting an
            invisible cap is worse. */}
        {note.length > NOTE_MAX * 0.9 ? (
          <Text size="xs" c="dimmed" ta="right">
            {note.length.toLocaleString()} / {NOTE_MAX.toLocaleString()}
          </Text>
        ) : null}
      </Stack>
    </Stack>
  );
}

/**
 * Lifts the engine's live dirty flag out to the modal, which owns the close
 * affordances (header ✕, overlay click, Cancel) but sits outside `FormWrapper`
 * and so cannot read `useFormControls()` itself.
 */
function DirtyReporter({ onChange }: { onChange: (dirty: boolean) => void }) {
  const { isDirty } = useFormControls();
  useEffect(() => {
    onChange(isDirty);
  }, [isDirty, onChange]);
  return null;
}

function ReminderFormFooter({
  onCancel,
  submitLabel,
}: {
  onCancel: () => void;
  submitLabel: string;
}) {
  const { isLoading, handleSubmit } = useFormControls();
  return (
    <Group justify="flex-end" gap="sm">
      <Button
        variant="subtle"
        color="gray"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button onClick={handleSubmit} loading={isLoading}>
        {submitLabel}
      </Button>
    </Group>
  );
}

/**
 * Built on `FormWrapper` only — no `FormShell`, no `ModalTableShell`. This is a
 * two-field modal opened from a record panel, not a list module's CRUD modal,
 * so it owns its chrome and submit footer while the engine owns state,
 * validation and dirty tracking.
 *
 * Output-contract states: **empty** N/A (a form, not a list) · **loading** the
 * footer's pending button · **request-failed** the mutation's resolved toast,
 * with the modal and its values kept open to retry · **permission-denied** N/A,
 * the host screen gates on `caps.reminders` before this can be opened ·
 * **read-only** N/A — this module has no read/write split, so anyone who can
 * see the panel can write · **archived record** callers must not open this for
 * a closed reminder (no reopen exists; it would 409) · **conflicting edits**
 * the 409 surfaces as "already closed" and the panel refetches · **unsaved
 * changes** guarded below.
 */
export function ReminderFormModal({
  opened,
  onClose,
  owner,
  reminder,
}: ReminderFormModalProps) {
  const isEdit = Boolean(reminder);
  // Read once per mount, not per render: a modal left open across midnight NPT
  // that silently re-floored its own date field mid-edit would be worse than
  // one whose floor is a few minutes stale (the server re-checks regardless).
  const today = useMemo(() => nepalToday(), []);
  const schema = useMemo(() => buildSchema(today), [today]);

  const createMutation = useCreateReminder();
  const updateMutation = useUpdateReminder(reminder?.id ?? "");

  const [isDirty, setIsDirty] = useState(false);
  const handleDirtyChange = useCallback((dirty: boolean) => {
    setIsDirty(dirty);
  }, []);

  /**
   * Closing with unsaved edits asks first. The reminder text is short but it is
   * *thought* — someone has decided what the follow-up is for, and a stray
   * overlay click should not silently discard that.
   */
  const requestClose = () => {
    if (!isDirty) {
      onClose();
      return;
    }
    modals.openConfirmModal({
      title: isEdit ? "Discard these changes?" : "Discard this reminder?",
      children: isEdit
        ? "Your edits to the date and note will be lost. The reminder itself stays as it was."
        : "The date and note you entered will be lost, and no reminder will be set.",
      labels: { confirm: "Discard", cancel: "Keep editing" },
      confirmProps: { color: "red" },
      // `useConfirmModal`/`modals.openConfirmModal` restore their padding
      // through `inner` — the app theme zeroes modal body padding globally.
      styles: { inner: { padding: "var(--mantine-spacing-md)" } },
      onConfirm: onClose,
    });
  };

  const initial: ReminderFormValues = {
    due_date: reminder?.due_date ?? null,
    note: reminder?.note ?? "",
  };

  const handleFinalSubmit = async (values: ReminderFormValues) => {
    // The schema guarantees a date, but the form type allows `null` until it
    // validates — narrow rather than assert.
    const dueDate = values.due_date;
    if (!dueDate)
      return { ok: false, message: "Pick a date for the follow-up." };
    const note = values.note.trim();

    try {
      if (reminder) {
        // Only the changed subset of {due_date, note} may be sent: every other
        // field is rejected outright, and an empty PATCH is a 400. "Nothing
        // changed" is a successful no-op, not a request.
        const payload = changedUpdateFields(reminder, {
          due_date: dueDate,
          note,
        });
        if (payload) await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync({ ...owner, due_date: dueDate, note });
      }
      onClose();
      return { ok: true };
    } catch {
      // `useAppMutation` already raised the resolved error toast. Returning
      // `ok: false` with no message keeps the modal open with its values intact
      // rather than stacking a second notification on top of the first.
      return { ok: false };
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={requestClose}
      title={isEdit ? "Reschedule reminder" : "Add reminder"}
      size="md"
    >
      {/* The app theme zeroes Modal body padding, so the content wrapper
          restores it via `p` — never through the modal's own `styles`. */}
      <Stack p="md">
        {/* `initial` is read once at mount, so the engine is keyed on the row
            being edited: opening the modal for a different reminder (or
            switching create→edit) must remount it, not reuse stale values. */}
        <FormWrapper<ReminderFormValues>
          key={reminder?.id ?? "create"}
          initial={initial}
          validation={[schema]}
          finalSubmitFn={handleFinalSubmit}
          hasDirtCheck
        >
          <DirtyReporter onChange={handleDirtyChange} />
          <Stack gap="lg">
            <ReminderFields today={today} />
            <ReminderFormFooter
              onCancel={requestClose}
              submitLabel={isEdit ? "Save changes" : "Set reminder"}
            />
          </Stack>
        </FormWrapper>
      </Stack>
    </Modal>
  );
}
