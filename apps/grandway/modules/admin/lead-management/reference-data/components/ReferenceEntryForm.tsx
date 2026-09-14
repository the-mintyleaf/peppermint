"use client";

import {
  Button,
  Group,
  modals,
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
import { toReferenceCode } from "../../referenceEntry.utils";
import type {
  ReferenceEntryFormProps,
  ReferenceEntryFormValues,
} from "./ReferenceEntryForm.types";

/**
 * Name is the only thing asked for. `code` is derived from it
 * (`toReferenceCode`) rather than typed — it is a permanent internal
 * identifier nobody needs to choose — and `display_order` is left at the
 * server default, which orders the pickers alphabetically by name.
 */
const schema = z.object({
  name: z
    .string()
    .min(1, "Required")
    .max(150)
    .refine(
      (value) => toReferenceCode(value) !== "",
      "Use at least one letter or number.",
    ),
  requires_detail: z.boolean(),
});

function toInitialValues(
  entry: ReferenceEntryFormProps["initialEntry"],
): ReferenceEntryFormValues {
  return {
    name: entry?.name ?? "",
    requires_detail: entry?.requires_detail ?? false,
  };
}

export function ReferenceEntryForm({
  mode,
  initialEntry,
  isSubmitting,
  onSubmit,
  onCancel,
}: ReferenceEntryFormProps) {
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
        <Fields isSubmitting={isSubmitting} />
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

function Fields({ isSubmitting }: { isSubmitting: boolean }) {
  const { form } = useFormInstance<ReferenceEntryFormValues>();

  return (
    <>
      <TextInput
        label="Name"
        description="What this shows as in the picker."
        placeholder="Referral"
        required
        disabled={isSubmitting}
        {...form.getInputProps("name")}
      />

      <Switch
        label="Needs an explanation"
        description="Shown as “Please specify” on the lead form when this is picked."
        disabled={isSubmitting}
        checked={form.values.requires_detail}
        onChange={(e) =>
          form.setFieldValue("requires_detail", e.currentTarget.checked)
        }
      />
    </>
  );
}
