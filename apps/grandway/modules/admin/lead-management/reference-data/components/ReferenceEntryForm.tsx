"use client";

import {
  Button,
  Divider,
  Group,
  modals,
  NumberInput,
  Stack,
  Switch,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";
import type {
  ReferenceEntryFormProps,
  ReferenceEntryFormValues,
} from "./ReferenceEntryForm.types";

/** Mirrors `leads/validators.py`'s `REFERENCE_CODE_PATTERN` exactly. */
const CODE_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{0,48}[a-z0-9])?$/;
const CODE_ERROR =
  "Lowercase letters, digits, - and _ only, starting and ending with a letter or digit.";

function buildSchema(mode: "create" | "edit") {
  return z.object({
    code:
      mode === "create"
        ? z.string().min(1, "Required").max(50).regex(CODE_PATTERN, CODE_ERROR)
        : z.string(),
    name_np: z.string().min(1, "Required").max(150),
    name_en: z.string().max(150),
    requires_detail: z.boolean(),
    display_order: z.number().int().min(0),
  });
}

function toInitialValues(
  entry: ReferenceEntryFormProps["initialEntry"],
): ReferenceEntryFormValues {
  return {
    code: entry?.code ?? "",
    name_np: entry?.name_np ?? "",
    name_en: entry?.name_en ?? "",
    requires_detail: entry?.requires_detail ?? false,
    display_order: entry?.display_order ?? 0,
  };
}

export function ReferenceEntryForm({
  mode,
  initialEntry,
  isSubmitting,
  onSubmit,
  onCancel,
}: ReferenceEntryFormProps) {
  const schema = buildSchema(mode);
  const initial = toInitialValues(initialEntry);

  return (
    <FormWrapper<ReferenceEntryFormValues>
      initial={initial}
      validation={[schema]}
      hasDirtCheck
      formClearOnSuccess={mode === "create"}
      finalSubmitFn={async (values) => {
        const result = await onSubmit(values);
        return result;
      }}
    >
      <Stack gap="sm">
        <Fields mode={mode} isSubmitting={isSubmitting} />
        <FooterActions
          mode={mode}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
        />
      </Stack>
    </FormWrapper>
  );
}

/**
 * Discarding a dirty draft is reversible in effect (nothing was ever saved)
 * but not in effort — a confirm step here is the cheap way to protect a few
 * typed minutes, matching the CLAUDE.md `useConfirmModal`-style padding rule
 * (`inner`, since the modal body's own padding is themed to 0).
 */
function FooterActions({
  mode,
  isSubmitting,
  onCancel,
}: {
  mode: "create" | "edit";
  isSubmitting: boolean;
  onCancel: () => void;
}) {
  const { handleSubmit, isLoading, isDirty } = useFormControls();

  const handleCancel = () => {
    if (!isDirty) {
      onCancel();
      return;
    }
    modals.openConfirmModal({
      title: "Discard changes?",
      children: "What you've entered here hasn't been saved.",
      labels: { confirm: "Discard", cancel: "Keep editing" },
      confirmProps: { color: "red" },
      styles: { inner: { padding: "var(--mantine-spacing-md)" } },
      onConfirm: onCancel,
    });
  };

  return (
    <Group justify="flex-end" gap="xs">
      <Button
        variant="default"
        size="xs"
        onClick={handleCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        size="xs"
        onClick={handleSubmit}
        loading={isSubmitting || isLoading}
      >
        {mode === "create" ? "Add" : "Save"}
      </Button>
    </Group>
  );
}

function Fields({
  mode,
  isSubmitting,
}: {
  mode: "create" | "edit";
  isSubmitting: boolean;
}) {
  const { form } = useFormInstance<ReferenceEntryFormValues>();

  return (
    <>
      <TextInput
        label="Code"
        description={
          mode === "create"
            ? "A short, permanent identifier — can't be changed later."
            : "Permanent — set when this entry was created."
        }
        placeholder="referral"
        required={mode === "create"}
        disabled={mode === "edit" || isSubmitting}
        {...form.getInputProps("code")}
        onChange={(e) =>
          form.setFieldValue("code", e.currentTarget.value.toLowerCase())
        }
      />

      <Group grow align="flex-start">
        <TextInput
          label="Name (Nepali)"
          required
          disabled={isSubmitting}
          {...form.getInputProps("name_np")}
        />
        <TextInput
          label="Name (English)"
          disabled={isSubmitting}
          {...form.getInputProps("name_en")}
        />
      </Group>

      <Divider />

      <Switch
        label="Needs an explanation"
        description="Shown as “Please specify” on the lead form when this is picked."
        disabled={isSubmitting}
        checked={form.values.requires_detail}
        onChange={(e) =>
          form.setFieldValue("requires_detail", e.currentTarget.checked)
        }
      />

      <NumberInput
        label="Sort position"
        description="Lower numbers show first in the picker."
        min={0}
        w={160}
        disabled={isSubmitting}
        {...form.getInputProps("display_order")}
      />
    </>
  );
}
