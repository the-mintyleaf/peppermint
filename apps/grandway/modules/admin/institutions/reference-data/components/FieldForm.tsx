"use client";

import { NumberInput, Stack, Switch, TextInput } from "@peppermint/ui";
import { FormWrapper, useFormInstance } from "@peppermint/admin";
import { z } from "zod";
import { useCreateField, useUpdateField } from "../../institutions.hooks";
import type { Field, FieldFormValues } from "../../institutions.types";
import { codeField } from "./referenceCode";
import { ReferenceFormActions } from "./ReferenceFormActions";

function schemaFor(mode: "create" | "edit") {
  return z.object({
    code: codeField(mode),
    name: z.string().min(1, "Required").max(150),
    is_active: z.boolean(),
    display_order: z.number().int().min(0),
  });
}

function toInitial(entry?: Field): FieldFormValues {
  return {
    code: entry?.code ?? "",
    name: entry?.name ?? "",
    is_active: entry?.is_active ?? true,
    display_order: entry?.display_order ?? 0,
  };
}

export function FieldForm({
  mode,
  initialEntry,
  onDone,
}: {
  mode: "create" | "edit";
  initialEntry?: Field;
  onDone: () => void;
}) {
  const create = useCreateField();
  const update = useUpdateField();
  const submitting = create.isPending || update.isPending;

  return (
    <FormWrapper<FieldFormValues>
      initial={toInitial(initialEntry)}
      validation={[schemaFor(mode)]}
      hasDirtCheck
      formClearOnSuccess={mode === "create"}
      finalSubmitFn={async (values) => {
        try {
          if (mode === "create") {
            await create.mutateAsync({
              code: values.code,
              name: values.name,
              is_active: values.is_active,
              display_order: values.display_order,
            });
          } else if (initialEntry) {
            await update.mutateAsync({
              id: initialEntry.id,
              body: {
                name: values.name,
                is_active: values.is_active,
                display_order: values.display_order,
              },
            });
          }
          onDone();
          return { ok: true };
        } catch {
          return { ok: false };
        }
      }}
    >
      <Stack gap="sm">
        <Fields mode={mode} disabled={submitting} />
        <ReferenceFormActions
          mode={mode}
          submitting={submitting}
          onCancel={onDone}
        />
      </Stack>
    </FormWrapper>
  );
}

function Fields({
  mode,
  disabled,
}: {
  mode: "create" | "edit";
  disabled: boolean;
}) {
  const { form } = useFormInstance<FieldFormValues>();
  return (
    <>
      <TextInput
        label="Code"
        description={
          mode === "create"
            ? "A short, permanent identifier — can't be changed later."
            : "Permanent — set when this field was created."
        }
        placeholder="computing"
        required={mode === "create"}
        disabled={mode === "edit" || disabled}
        {...form.getInputProps("code")}
        onChange={(e) =>
          form.setFieldValue("code", e.currentTarget.value.toLowerCase())
        }
      />
      <TextInput
        label="Name"
        required
        disabled={disabled}
        {...form.getInputProps("name")}
      />
      <Switch
        label="Active"
        description="Withdrawn fields don't appear when classifying new programs."
        disabled={disabled}
        checked={form.values.is_active}
        onChange={(e) =>
          form.setFieldValue("is_active", e.currentTarget.checked)
        }
      />
      <NumberInput
        label="Sort position"
        description="Lower numbers show first."
        min={0}
        w={160}
        disabled={disabled}
        {...form.getInputProps("display_order")}
      />
    </>
  );
}
