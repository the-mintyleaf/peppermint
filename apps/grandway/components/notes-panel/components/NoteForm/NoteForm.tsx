"use client";

import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import type { KeyboardEvent } from "react";
import {
  Button,
  DateTimePicker,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
  modals,
} from "@peppermint/ui";
import type { UseFormReturnType } from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";

import {
  NOTE_BODY_MAX,
  NOTE_TABS,
  NOTE_TIME_DISPLAY,
  getNoteErrorMessage,
  isFutureDateError,
  isTooFarInFuture,
  latestAllowedPickerValue,
  noteCategoryLabel,
  notedAtPresets,
  noteFieldErrors,
} from "../../NotesPanel.utils";
import type { NoteFormValues } from "../../NotesPanel.types";
import type {
  FormBinderProps,
  NoteFieldsProps,
  NoteFormFooterProps,
  NoteFormProps,
} from "./NoteForm.types";

const FUTURE_MESSAGE =
  "That time is in the future. Pick now or an earlier time.";

/**
 * `noted_at` is re-checked against the clock at validation time (not at
 * mount), so a form left open for a while still applies the same "now + 5 min"
 * ceiling the server does. The composer may leave it empty — that means now.
 */
function buildSchema(mode: NoteFormProps["mode"]) {
  const body = z
    .string()
    .trim()
    .min(1, "Write the note before saving.")
    .max(
      NOTE_BODY_MAX,
      `Keep the note under ${NOTE_BODY_MAX.toLocaleString()} characters.`,
    );
  const notedAt =
    mode === "edit"
      ? z
          .string({ error: "Pick when it happened." })
          .min(1, "Pick when it happened.")
          .refine((value) => !isTooFarInFuture(value), FUTURE_MESSAGE)
      : z
          .string()
          .nullable()
          .refine(
            (value) => value === null || !isTooFarInFuture(value),
            FUTURE_MESSAGE,
          );
  return z.object({ body, noted_at: notedAt, category: z.string().min(1) });
}

/** Hands the live form instance up to `NoteForm`, which sits outside the engine. */
function FormBinder({ onBind }: FormBinderProps) {
  const { form } = useFormInstance<NoteFormValues>();
  useEffect(() => {
    onBind(form);
  }, [form, onBind]);
  return null;
}

function categoryOptions(current: string) {
  const options = NOTE_TABS.map((tab) => ({
    value: tab.value as string,
    label: tab.label,
  }));
  // A category the backend added later is kept selectable so an edit that
  // only fixes a typo never silently re-files the note.
  if (!options.some((option) => option.value === current)) {
    options.push({ value: current, label: noteCategoryLabel(current) });
  }
  return options;
}

function NoteFormFooter({ submitLabel, onCancel }: NoteFormFooterProps) {
  const { isLoading, handleSubmit } = useFormControls();
  return (
    <Group gap="xs" justify="flex-end">
      <Button
        variant="subtle"
        color="gray"
        size="xs"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button size="xs" onClick={handleSubmit} loading={isLoading}>
        {submitLabel}
      </Button>
    </Group>
  );
}

function NoteFields({
  mode,
  bodyLabel,
  showCategory,
  onCancel,
  popoverZIndex,
}: NoteFieldsProps) {
  const { form } = useFormInstance<NoteFormValues>();
  const { isLoading, handleSubmit } = useFormControls();
  const categoryLabelId = useId();
  const presets = useMemo(() => notedAtPresets(mode === "create"), [mode]);
  const isCreate = mode === "create";

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl+Enter saves; Escape backs out. Plain Enter stays a newline —
    // notes are free-form and multi-line.
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void handleSubmit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
  };

  return (
    <Stack gap="xs">
      <Textarea
        variant="unstyled"
        aria-label={bodyLabel}
        placeholder={bodyLabel}
        autosize
        minRows={2}
        maxRows={14}
        px="xs"
        maxLength={NOTE_BODY_MAX}
        data-autofocus
        autoFocus
        disabled={isLoading}
        onKeyDown={handleKeyDown}
        {...form.getInputProps("body")}
      />
      <Group gap="sm" align="flex-end" wrap="wrap" px="xs">
        {showCategory ? (
          <Stack gap={4}>
            <Text size="xs" fw={500} id={categoryLabelId}>
              Category
            </Text>
            <SegmentedControl
              size="xs"
              aria-labelledby={categoryLabelId}
              data={categoryOptions(form.values.category)}
              disabled={isLoading}
              value={form.values.category}
              onChange={(value) => form.setFieldValue("category", value)}
            />
          </Stack>
        ) : null}
        <DateTimePicker
          size="xs"
          label="When"
          description={
            isCreate ? "Leave as now, or backdate a past visit." : undefined
          }
          placeholder={isCreate ? "Now" : undefined}
          clearable={isCreate}
          valueFormat={NOTE_TIME_DISPLAY}
          maxDate={latestAllowedPickerValue()}
          presets={presets}
          timePickerProps={{ format: "12h" }}
          popoverProps={
            popoverZIndex !== undefined ? { zIndex: popoverZIndex } : undefined
          }
          disabled={isLoading}
          w={230}
          {...form.getInputProps("noted_at")}
        />
      </Group>
    </Stack>
  );
}

/**
 * The composer and the in-place editor share this one form: a borderless
 * textarea and its "When" control framed together, with the actions docked
 * bottom-right so they read as part of the field. Built on `FormWrapper`
 * only — the engine owns state, Zod validation and submit; this owns chrome.
 */
export function NoteForm({
  mode,
  initialValues,
  submitLabel,
  bodyLabel,
  showCategory,
  onSubmit,
  onCancel,
  popoverZIndex,
}: NoteFormProps) {
  const schema = useMemo(() => buildSchema(mode), [mode]);
  const formRef = useRef<UseFormReturnType<NoteFormValues> | null>(null);
  const bindForm = useCallback((form: UseFormReturnType<NoteFormValues>) => {
    formRef.current = form;
  }, []);

  /**
   * Backing out of a note with text in it asks first — a stray Escape should
   * not silently throw away a visit write-up. A pristine form just closes.
   */
  const requestCancel = () => {
    if (!formRef.current?.isDirty()) {
      onCancel();
      return;
    }
    modals.openConfirmModal({
      title: mode === "edit" ? "Discard your changes?" : "Discard this note?",
      children:
        mode === "edit"
          ? "The note stays as it was before you started editing."
          : "What you wrote will be lost and no note will be saved.",
      labels: { confirm: "Discard", cancel: "Keep writing" },
      confirmProps: { color: "red" },
      // The app theme zeroes modal body padding; confirm modals restore it
      // through `inner` (CLAUDE.md → Modals).
      styles: { inner: { padding: "var(--mantine-spacing-md)" } },
      zIndex: popoverZIndex,
      onConfirm: onCancel,
    });
  };

  const handleFinalSubmit = async (values: NoteFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      // The mutation already toasted the resolved message. Field-level causes
      // also land on their field so the fix is next to the problem.
      const fieldErrors = noteFieldErrors(error);
      if (isFutureDateError(error)) {
        fieldErrors.noted_at = getNoteErrorMessage(error);
      }
      if (Object.keys(fieldErrors).length > 0) {
        formRef.current?.setErrors((current) => ({
          ...current,
          ...fieldErrors,
        }));
      }
    }
    // `ok: true` on purpose (as in ReminderFormModal): an `ok: false` would
    // stack FormWrapper's generic toast on top of the mutation's specific one.
    // The form stays open with its values because the host only closes it
    // when `onSubmit` resolves.
    return { ok: true };
  };

  return (
    <FormWrapper<NoteFormValues>
      initial={initialValues}
      validation={[schema]}
      finalSubmitFn={handleFinalSubmit}
    >
      <FormBinder onBind={bindForm} />
      <Paper withBorder radius="md" p="xs">
        <Stack gap="xs">
          <NoteFields
            mode={mode}
            bodyLabel={bodyLabel}
            showCategory={showCategory}
            onCancel={requestCancel}
            popoverZIndex={popoverZIndex}
          />
          <NoteFormFooter submitLabel={submitLabel} onCancel={requestCancel} />
        </Stack>
      </Paper>
    </FormWrapper>
  );
}
