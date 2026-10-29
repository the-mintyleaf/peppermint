"use client";

import { useMemo, useState } from "react";
import {
  Anchor,
  Button,
  Collapse,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  modals,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";
import {
  CLIPBOARD_CONFIRM_Z_INDEX,
  CLIPBOARD_LABEL_MAX,
  CLIPBOARD_TEXT_MAX,
} from "../../clipboard.constants";
import { fieldKeyOptions } from "../../clipboard.fieldKeys";
import {
  useCreateClipboardEntry,
  useUpdateClipboardEntry,
} from "../../clipboard.hooks";
import type {
  ClipboardEntryCreate,
  ClipboardEntryUpdate,
} from "../../clipboard.types";
import type {
  ClipboardEntryFormProps,
  ClipboardEntryFormValues,
} from "./ClipboardEntryForm.types";

const schema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Give the snippet a short name so you can find it again.")
    .max(
      CLIPBOARD_LABEL_MAX,
      `Keep the name under ${CLIPBOARD_LABEL_MAX} characters.`,
    ),
  text: z
    .string()
    .trim()
    .min(1, "Enter the text you want to reuse.")
    .max(
      CLIPBOARD_TEXT_MAX,
      `Keep the text under ${CLIPBOARD_TEXT_MAX.toLocaleString()} characters.`,
    ),
  category: z.string().nullable(),
  field_key: z.string().nullable(),
});

/** Only what changed — an empty PATCH is pointless, and unchanged updates audit nothing. */
function toUpdateBody(
  entry: NonNullable<ClipboardEntryFormProps["entry"]>,
  values: ClipboardEntryFormValues,
): ClipboardEntryUpdate {
  const body: ClipboardEntryUpdate = {};
  const label = values.label.trim();
  const text = values.text.trim();
  const fieldKey = values.field_key ?? "";
  if (label !== entry.label) body.label = label;
  if (text !== entry.text) body.text = text;
  if (fieldKey !== entry.field_key) body.field_key = fieldKey;
  if (values.category !== (entry.category?.id ?? null)) {
    body.category = values.category;
  }
  return body;
}

function toCreateBody(values: ClipboardEntryFormValues): ClipboardEntryCreate {
  return {
    label: values.label.trim(),
    text: values.text.trim(),
    ...(values.field_key ? { field_key: values.field_key } : {}),
    ...(values.category ? { category: values.category } : {}),
  };
}

function EntryFields({
  categories,
  currentFieldKey,
}: Pick<ClipboardEntryFormProps, "categories"> & { currentFieldKey: string }) {
  const { form } = useFormInstance<ClipboardEntryFormValues>();
  // Open when a key is already set so it is never hidden from the person who set it.
  const [linkOpen, setLinkOpen] = useState(Boolean(form.values.field_key));
  const text = form.values.text ?? "";
  const fieldOptions = useMemo(
    () => fieldKeyOptions(currentFieldKey),
    [currentFieldKey],
  );

  return (
    <Stack gap="md">
      <TextInput
        label="Name"
        description="What you'll look for later, e.g. “Ward 5 office”."
        required
        maxLength={CLIPBOARD_LABEL_MAX}
        data-autofocus
        {...form.getInputProps("label")}
      />

      <Stack gap={4}>
        <Textarea
          label="Text to reuse"
          description="Exactly what gets copied or filled in. Line breaks are kept."
          required
          autosize
          minRows={4}
          maxRows={10}
          maxLength={CLIPBOARD_TEXT_MAX}
          {...form.getInputProps("text")}
        />
        {text.length > CLIPBOARD_TEXT_MAX * 0.9 ? (
          <Text size="xs" c="dimmed" ta="right">
            {text.length.toLocaleString()} /{" "}
            {CLIPBOARD_TEXT_MAX.toLocaleString()}
          </Text>
        ) : null}
      </Stack>

      {/* Nothing to choose from until a category exists — they're made under
          "Manage categories", so don't show an empty control. */}
      {categories.length > 0 ? (
        <Select
          label="Category"
          description="Optional. Helps you filter your snippets."
          placeholder="No category"
          clearable
          data={categories.map((c) => ({ value: c.id, label: c.name }))}
          // The drawer is a layer above page content; keep the list reachable.
          comboboxProps={{ zIndex: 500 }}
          {...form.getInputProps("category")}
        />
      ) : null}

      <Stack gap={6}>
        <Anchor
          component="button"
          type="button"
          size="sm"
          onClick={() => setLinkOpen((open) => !open)}
          aria-expanded={linkOpen}
        >
          {linkOpen ? "Hide document field" : "Offer in a document field…"}
        </Anchor>
        <Collapse expanded={linkOpen}>
          <Select
            label="Document field"
            description="Suggest this snippet when you fill in that field of a document."
            placeholder="Any — only in the clipboard"
            searchable
            clearable
            data={fieldOptions}
            comboboxProps={{ zIndex: 500 }}
            {...form.getInputProps("field_key")}
          />
        </Collapse>
      </Stack>
    </Stack>
  );
}

function EntryFooter({
  onCancel,
  submitLabel,
}: {
  onCancel: () => void;
  submitLabel: string;
}) {
  const { isLoading, isDirty, handleSubmit } = useFormControls();

  // Leaving with unsaved edits asks first; a pristine form just closes.
  const requestCancel = () => {
    if (!isDirty) {
      onCancel();
      return;
    }
    modals.openConfirmModal({
      title: "Discard these changes?",
      children: "What you've typed here won't be saved.",
      labels: { confirm: "Discard", cancel: "Keep editing" },
      confirmProps: { color: "red" },
      styles: { inner: { padding: "var(--mantine-spacing-md)" } },
      zIndex: CLIPBOARD_CONFIRM_Z_INDEX,
      onConfirm: onCancel,
    });
  };

  return (
    <Group justify="flex-end" gap="sm">
      <Button
        variant="subtle"
        color="gray"
        onClick={requestCancel}
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
 * Save-or-edit one snippet. `FormWrapper` only (the drawer owns the chrome).
 *
 * Control choices: **Name** and **Text** are the only required fields — text is a
 * multiline `Textarea` because addresses have line breaks. **Category** is a `Select`
 * shown only once a category exists. **Document field** is hidden behind a disclosure
 * and shown by human name ("Father's name"), never as the raw dotted key; it opens by
 * itself when the snippet already has one.
 *
 * States: loading → the footer button; request-failed → the mutation's toast (limit and
 * invalid-category errors carry specific copy) with the values kept; empty / read-only /
 * permission N/A (owner-only, every authority).
 */
export function ClipboardEntryForm({
  entry,
  prefill,
  categories,
  onDone,
  onCancel,
}: ClipboardEntryFormProps) {
  const createMutation = useCreateClipboardEntry();
  const updateMutation = useUpdateClipboardEntry();

  const initial: ClipboardEntryFormValues = {
    label: entry?.label ?? prefill?.label ?? "",
    text: entry?.text ?? prefill?.text ?? "",
    category: entry?.category?.id ?? null,
    field_key: (entry ? entry.field_key : prefill?.field_key) || null,
  };

  const handleFinalSubmit = async (values: ClipboardEntryFormValues) => {
    try {
      if (entry) {
        const body = toUpdateBody(entry, values);
        if (Object.keys(body).length > 0) {
          await updateMutation.mutateAsync({ id: entry.id, body });
        }
      } else {
        await createMutation.mutateAsync(toCreateBody(values));
      }
      onDone();
      return { ok: true };
    } catch {
      // The mutation already toasted the resolved message; reporting `ok: true` keeps
      // FormWrapper from stacking a second generic toast. The form stays open.
      return { ok: true };
    }
  };

  return (
    <FormWrapper<ClipboardEntryFormValues>
      key={entry?.id ?? "create"}
      initial={initial}
      validation={[schema]}
      finalSubmitFn={handleFinalSubmit}
      hasDirtCheck
    >
      <Stack gap="lg">
        <EntryFields
          categories={categories}
          currentFieldKey={initial.field_key ?? ""}
        />
        <EntryFooter
          onCancel={onCancel}
          submitLabel={entry ? "Save changes" : "Save snippet"}
        />
      </Stack>
    </FormWrapper>
  );
}
