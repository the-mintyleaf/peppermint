"use client";

import { Stack, Textarea, TextInput } from "@peppermint/ui";
import { FormWrapper, useFormInstance } from "@peppermint/admin";
import { z } from "zod";
import {
  AvailabilityFields,
  refineAvailabilityNote,
} from "../../../../../components/AvailabilityFields";
import { ReferenceFormActions } from "../../../../../reference-data/components/ReferenceFormActions";
import {
  useCreateCampus,
  useUpdateCampus,
} from "../../../../../institutions.hooks";
import type {
  Campus,
  CampusFormValues,
} from "../../../../../institutions.types";

const schema = z
  .object({
    name: z.string().min(1, "Required").max(255),
    city: z.string(),
    availability_status: z.enum(["active", "paused", "seasonal", "inactive"]),
    availability_note: z.string(),
    notes: z.string(),
  })
  .superRefine(refineAvailabilityNote);

function toInitial(entry?: Campus): CampusFormValues {
  return {
    name: entry?.name ?? "",
    city: entry?.city ?? "",
    availability_status: entry?.availability_status ?? "active",
    availability_note: entry?.availability_note ?? "",
    notes: entry?.notes ?? "",
  };
}

export function CampusForm({
  mode,
  institutionId,
  initialEntry,
  onDone,
}: {
  mode: "create" | "edit";
  institutionId: string;
  initialEntry?: Campus;
  onDone: () => void;
}) {
  const create = useCreateCampus(institutionId);
  const update = useUpdateCampus(institutionId);
  const submitting = create.isPending || update.isPending;

  return (
    <FormWrapper<CampusFormValues>
      initial={toInitial(initialEntry)}
      validation={[schema]}
      hasDirtCheck
      formClearOnSuccess={mode === "create"}
      finalSubmitFn={async (values) => {
        try {
          if (mode === "create") {
            await create.mutateAsync(values);
          } else if (initialEntry) {
            await update.mutateAsync({ id: initialEntry.id, body: values });
          }
          onDone();
          return { ok: true };
        } catch {
          return { ok: false };
        }
      }}
    >
      <Stack gap="sm">
        <Fields disabled={submitting} />
        <ReferenceFormActions
          mode={mode}
          submitting={submitting}
          onCancel={onDone}
        />
      </Stack>
    </FormWrapper>
  );
}

function Fields({ disabled }: { disabled: boolean }) {
  const { form } = useFormInstance<CampusFormValues>();
  return (
    <>
      <TextInput
        label="Name"
        description="A locality in the destination country."
        required
        disabled={disabled}
        {...form.getInputProps("name")}
      />
      <TextInput
        label="City"
        disabled={disabled}
        {...form.getInputProps("city")}
      />
      <AvailabilityFields disabled={disabled} />
      <Textarea
        label="Notes"
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("notes")}
      />
    </>
  );
}
