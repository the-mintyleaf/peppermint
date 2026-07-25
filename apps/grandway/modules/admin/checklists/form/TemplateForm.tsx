"use client";

import { z } from "zod";
import {
  Button,
  NumberInput,
  Select,
  Stack,
  Switch,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import type { ModalFormComponentProps } from "@peppermint/admin";
// Concrete-file import, never the institutions barrel — cycle-safe (offers.api.ts precedent).
import { useCountries } from "@/modules/admin/institutions/institutions.hooks";
import { TEMPLATE_STATUS_OPTIONS } from "../checklists.labels";
import type { ChecklistTemplate } from "../checklists.types";
import { toTemplateFormValues } from "./TemplateForm.utils";
import type { TemplateFormValues } from "./TemplateForm.types";

const KEY_RE = /^[a-z0-9](?:[a-z0-9_-]{0,48}[a-z0-9])?$/;

const schema = z
  .object({
    key: z.string().regex(KEY_RE, "Lowercase letters, numbers, - and _ only"),
    label: z.string().min(1, "Required"),
    country: z.string().nullable(),
    is_default: z.boolean(),
  })
  .passthrough()
  .superRefine((v, ctx) => {
    if (v.is_default && !v.country) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["country"],
        message: "A default template must be scoped to a country",
      });
    }
  });

/**
 * Shared create + edit template form (`POST`/`PATCH /templates/`). `key` is
 * immutable once created (§7) — disabled, never hidden, so the value stays
 * visible on edit. Publishing (`status: "active"`) and retiring
 * (`status: "inactive"`) can also happen here via the Status select, though the
 * Template Detail page's dedicated Publish/Retire buttons are the primary path.
 */
export function TemplateForm({
  onSubmit,
  isLoading,
  initialValues,
}: ModalFormComponentProps<ChecklistTemplate, TemplateFormValues>) {
  const isEdit = Boolean(initialValues);
  const initial = toTemplateFormValues(initialValues);

  return (
    <FormWrapper<TemplateFormValues>
      initial={initial}
      validation={[schema]}
      hasDirtCheck={isEdit}
      finalSubmitFn={async (values) => {
        onSubmit(values);
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <TemplateFormFields isLoading={isLoading} isEdit={isEdit} />
        <SubmitButton isLoading={isLoading} isEdit={isEdit} />
      </Stack>
    </FormWrapper>
  );
}

function TemplateFormFields({
  isLoading,
  isEdit,
}: {
  isLoading: boolean;
  isEdit: boolean;
}) {
  const { form } = useFormInstance<TemplateFormValues>();
  const { data: countries, isLoading: countriesLoading } = useCountries();

  const countryOptions = (countries ?? []).map((country) => ({
    value: country.id,
    label: country.name,
  }));

  return (
    <>
      <TextInput
        label="Key"
        description={
          isEdit
            ? "Immutable once created"
            : "Unique, lowercase — e.g. australia-default"
        }
        placeholder="australia-default"
        required
        disabled={isLoading || isEdit}
        {...form.getInputProps("key")}
      />
      <TextInput
        label="Label"
        placeholder="e.g. Australia — Default Requirements"
        required
        disabled={isLoading}
        {...form.getInputProps("label")}
      />
      <Select
        label="Country"
        placeholder={
          countriesLoading ? "Loading countries…" : "General (no country)"
        }
        description="Leave blank for a general list, applied only manually"
        data={countryOptions}
        clearable
        searchable
        disabled={isLoading || countriesLoading}
        {...form.getInputProps("country")}
        onChange={(value) => form.setFieldValue("country", value)}
      />
      <Switch
        label="Default template for this country"
        description="The list this country's applicants automatically inherit — requires a country"
        disabled={isLoading || !form.values.country}
        checked={form.values.is_default}
        onChange={(event) =>
          form.setFieldValue("is_default", event.currentTarget.checked)
        }
      />
      <Select
        label="Status"
        description="Active is the only status a journey inherits from"
        data={TEMPLATE_STATUS_OPTIONS}
        allowDeselect={false}
        disabled={isLoading}
        {...form.getInputProps("status")}
      />
      <Textarea
        label="Status note"
        placeholder="Optional context for the current status"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("status_note")}
      />
      <NumberInput
        label="Display order"
        description="Lower numbers show first"
        min={0}
        allowDecimal={false}
        disabled={isLoading}
        value={form.values.display_order}
        onChange={(value) =>
          form.setFieldValue("display_order", value === "" ? "" : Number(value))
        }
      />
      <Textarea
        label="Description"
        placeholder="What this list is for"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("description")}
      />
      <Textarea
        label="Notes"
        placeholder="Internal notes"
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
      {isEdit ? "Save changes" : "Create template"}
    </Button>
  );
}
