"use client";

import { NumberInput, Stack, Textarea, TextInput } from "@peppermint/ui";
import { FormWrapper, useFormInstance } from "@peppermint/admin";
import { z } from "zod";
import {
  AvailabilityFields,
  refineAvailabilityNote,
} from "../../components/AvailabilityFields";
import { useCreateCountry, useUpdateCountry } from "../../institutions.hooks";
import type { Country, CountryFormValues } from "../../institutions.types";
import { codeField } from "./referenceCode";
import { ReferenceFormActions } from "./ReferenceFormActions";

function schemaFor(mode: "create" | "edit") {
  return z
    .object({
      code: codeField(mode),
      name: z.string().min(1, "Required").max(150),
      availability_status: z.enum(["active", "paused", "seasonal", "inactive"]),
      availability_note: z.string(),
      notes: z.string(),
      display_order: z.number().int().min(0),
    })
    .superRefine(refineAvailabilityNote);
}

function toInitial(entry?: Country): CountryFormValues {
  return {
    code: entry?.code ?? "",
    name: entry?.name ?? "",
    availability_status: entry?.availability_status ?? "active",
    availability_note: entry?.availability_note ?? "",
    notes: entry?.notes ?? "",
    display_order: entry?.display_order ?? 0,
  };
}

export function CountryForm({
  mode,
  initialEntry,
  onDone,
}: {
  mode: "create" | "edit";
  initialEntry?: Country;
  onDone: () => void;
}) {
  const create = useCreateCountry();
  const update = useUpdateCountry();
  const submitting = create.isPending || update.isPending;

  return (
    <FormWrapper<CountryFormValues>
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
              availability_status: values.availability_status,
              availability_note: values.availability_note,
              notes: values.notes,
              display_order: values.display_order,
            });
          } else if (initialEntry) {
            await update.mutateAsync({
              id: initialEntry.id,
              body: {
                name: values.name,
                availability_status: values.availability_status,
                availability_note: values.availability_note,
                notes: values.notes,
                display_order: values.display_order,
              },
            });
          }
          onDone();
          return { ok: true };
        } catch {
          // useAppMutation already surfaced the error notification.
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
  const { form } = useFormInstance<CountryFormValues>();
  return (
    <>
      <TextInput
        label="Code"
        description={
          mode === "create"
            ? "ISO alpha-2 by convention (e.g. au) — permanent, can't be changed later."
            : "Permanent — set when this country was created."
        }
        placeholder="au"
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
      <AvailabilityFields disabled={disabled} />
      <Textarea
        label="Notes"
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("notes")}
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
