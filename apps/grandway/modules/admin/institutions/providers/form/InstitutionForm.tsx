"use client";

import { useMemo } from "react";
import {
  Alert,
  Button,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";
import {
  AvailabilityFields,
  refineAvailabilityNote,
} from "../../components/AvailabilityFields";
import { INSTITUTION_TYPE_OPTIONS } from "../../institutions.constants";
import { useCountries } from "../../institutions.hooks";
import type { InstitutionFormValues } from "../../institutions.types";
import type { InstitutionFormProps } from "./InstitutionForm.types";

const schema = z
  .object({
    country: z.string().min(1, "Select a country"),
    name: z.string().min(1, "Required").max(255),
    common_name: z.string(),
    institution_type: z.enum([
      "university",
      "college",
      "polytechnic",
      "language_school",
      "other",
    ]),
    availability_status: z.enum(["active", "paused", "seasonal", "inactive"]),
    availability_note: z.string(),
    notes: z.string(),
  })
  .superRefine(refineAvailabilityNote);

function toInitial(
  initialValues: InstitutionFormProps["initialValues"],
): InstitutionFormValues {
  return {
    country: initialValues?.country?.id ?? "",
    name: initialValues?.name ?? "",
    common_name: initialValues?.common_name ?? "",
    institution_type: initialValues?.institution_type ?? "university",
    availability_status: initialValues?.availability_status ?? "active",
    availability_note: initialValues?.availability_note ?? "",
    notes: initialValues?.notes ?? "",
  };
}

export function InstitutionForm({
  initialValues,
  onSubmit,
  isLoading,
}: InstitutionFormProps) {
  const isEdit = Boolean(initialValues?.id);
  const originalCountry = initialValues?.country?.id ?? "";

  return (
    <FormWrapper<InstitutionFormValues>
      initial={toInitial(initialValues)}
      validation={[schema]}
      finalSubmitFn={async (values) => {
        onSubmit(values);
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <Fields
          isLoading={isLoading}
          isEdit={isEdit}
          originalCountry={originalCountry}
        />
        <SubmitButton isLoading={isLoading} isEdit={isEdit} />
      </Stack>
    </FormWrapper>
  );
}

function Fields({
  isLoading,
  isEdit,
  originalCountry,
}: {
  isLoading: boolean;
  isEdit: boolean;
  originalCountry: string;
}) {
  const { form } = useFormInstance<InstitutionFormValues>();
  const { data: countries = [] } = useCountries();

  const countryOptions = useMemo(
    () =>
      countries.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` })),
    [countries],
  );
  const countryChanged =
    isEdit && form.values.country !== originalCountry && originalCountry !== "";

  return (
    <>
      <Select
        label="Country"
        placeholder="Pick a country"
        data={countryOptions}
        required
        searchable
        disabled={isLoading}
        {...form.getInputProps("country")}
      />
      {countryChanged ? (
        <Alert
          variant="light"
          color="yellow"
          icon={<WarningIcon size={16} aria-hidden />}
          title="This rewrites the country on every program here"
        >
          A program&apos;s country is derived from its institution — moving this
          provider re-files all of its programs under the new country in one go.
        </Alert>
      ) : null}
      <TextInput
        label="Name"
        required
        disabled={isLoading}
        {...form.getInputProps("name")}
      />
      <TextInput
        label="Common name"
        description="A short or informal name, if any."
        disabled={isLoading}
        {...form.getInputProps("common_name")}
      />
      <Select
        label="Type"
        data={INSTITUTION_TYPE_OPTIONS}
        allowDeselect={false}
        disabled={isLoading}
        {...form.getInputProps("institution_type")}
      />
      <AvailabilityFields disabled={isLoading} />
      <Textarea
        label="Notes"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("notes")}
      />
    </>
  );
}

function SubmitButton({
  isLoading,
  isEdit,
}: {
  isLoading: boolean;
  isEdit: boolean;
}) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      {isEdit ? "Save institution" : "Create institution"}
    </Button>
  );
}
