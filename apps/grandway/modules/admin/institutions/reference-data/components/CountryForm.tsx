"use client";

import { Stack, Textarea, TextInput } from "@peppermint/ui";
import { FormWrapper, useFormInstance } from "@peppermint/admin";
import { z } from "zod";
import { AvailabilityFields } from "../../components/AvailabilityFields";
import { useCreateCountry, useUpdateCountry } from "../../institutions.hooks";
import type { Country, CountryFormValues } from "../../institutions.types";
import { codeField } from "./referenceCode";
import { ReferenceFormActions } from "./ReferenceFormActions";

/**
 * No `availability_note` and no `display_order`: this form doesn't collect
 * either, and deliberately doesn't send them — an existing note and sort
 * position survive an edit untouched. The reason behind a withdrawal is
 * captured by `CountryCard`'s Withdraw action instead.
 */
function schemaFor(mode: "create" | "edit") {
  return z.object({
    code: codeField(mode),
    name: z.string().min(1, "Required").max(150),
    availability_status: z.enum(["active", "paused", "seasonal", "inactive"]),
    notes: z.string(),
  });
}

function toInitial(entry?: Country): CountryFormValues {
  return {
    code: entry?.code ?? "",
    name: entry?.name ?? "",
    availability_status: entry?.availability_status ?? "active",
    notes: entry?.notes ?? "",
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
              notes: values.notes,
            });
          } else if (initialEntry) {
            await update.mutateAsync({
              id: initialEntry.id,
              body: {
                name: values.name,
                availability_status: values.availability_status,
                notes: values.notes,
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
        placeholder="Australia"
        required
        disabled={disabled}
        {...form.getInputProps("name")}
      />
      <AvailabilityFields
        disabled={disabled}
        description="The reason behind a withdrawal is recorded by Withdraw on the country's row."
        withNote={false}
      />
      <Textarea
        label="Notes"
        placeholder="Anything the team should know about this destination."
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("notes")}
      />
    </>
  );
}
