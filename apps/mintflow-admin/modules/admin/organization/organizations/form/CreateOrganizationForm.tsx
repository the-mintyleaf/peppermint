"use client";

import {
  Button,
  NumberInput,
  Select,
  Stack,
  Textarea,
  TextInput,
  useForm,
} from "@peppermint/ui";

import type {
  CreateOrganizationFormProps,
  CreateOrganizationFormValues,
} from "./CreateOrganizationForm.types";

const ORGANIZATION_TYPE_OPTIONS = [
  { value: "ministry", label: "Ministry" },
  { value: "agency", label: "Agency" },
  { value: "department", label: "Department" },
  { value: "enterprise", label: "Enterprise" },
  { value: "division", label: "Division" },
  { value: "office", label: "Office" },
  { value: "committee", label: "Committee" },
  { value: "project_body", label: "Project Body" },
  { value: "external_partner", label: "External Partner" },
  { value: "system", label: "System" },
  { value: "other", label: "Other" },
];

const CODE_PATTERN = /^[A-Za-z0-9_\-]+$/;
const COUNTRY_CODE_PATTERN = /^[A-Za-z]{2}$/;

export function CreateOrganizationForm({
  onSubmit,
  isLoading,
  codeError,
}: CreateOrganizationFormProps) {
  const form = useForm<CreateOrganizationFormValues>({
    initialValues: {
      name_np: "",
      name_en: "",
      code: "",
      organization_type: "",
      legal_name_np: "",
      short_name_np: "",
      short_name_en: "",
      description: "",
      country_code: "",
      timezone: "",
      sort_order: 0,
    },
    validate: {
      name_np: (value) => (!value ? "Required" : null),
      code: (value) => {
        if (!value) return "Required";
        if (!CODE_PATTERN.test(value)) {
          return "Letters, numbers, underscore, and hyphen only";
        }
        return null;
      },
      organization_type: (value) => (!value ? "Required" : null),
      country_code: (value) => {
        if (!value) return null;
        if (!COUNTRY_CODE_PATTERN.test(value)) {
          return "Must be a 2-letter ISO country code";
        }
        return null;
      },
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        onSubmit({
          ...values,
          code: values.code.toLowerCase(),
          country_code: values.country_code.toUpperCase(),
          sort_order: Number(values.sort_order) || 0,
        }),
      )}
    >
      <Stack gap="md" p="md">
        <TextInput
          label="Name (Nepali)"
          placeholder="स्वास्थ्य मन्त्रालय"
          required
          disabled={isLoading}
          {...form.getInputProps("name_np")}
        />
        <TextInput
          label="Name (English)"
          placeholder="Ministry of Health"
          disabled={isLoading}
          {...form.getInputProps("name_en")}
        />
        <TextInput
          label="Code"
          placeholder="MOH"
          description="Globally unique code"
          required
          disabled={isLoading}
          error={form.errors.code ?? codeError}
          {...form.getInputProps("code")}
        />
        <Select
          label="Organization Type"
          required
          data={ORGANIZATION_TYPE_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("organization_type")}
        />
        <TextInput
          label="Legal name (Nepali)"
          disabled={isLoading}
          {...form.getInputProps("legal_name_np")}
        />
        <TextInput
          label="Short name (Nepali)"
          disabled={isLoading}
          {...form.getInputProps("short_name_np")}
        />
        <TextInput
          label="Short name (English)"
          disabled={isLoading}
          {...form.getInputProps("short_name_en")}
        />
        <Textarea
          label="Description"
          minRows={2}
          autosize
          disabled={isLoading}
          {...form.getInputProps("description")}
        />
        <TextInput
          label="Country Code"
          placeholder="NP"
          maxLength={2}
          disabled={isLoading}
          {...form.getInputProps("country_code")}
        />
        <TextInput
          label="Timezone"
          placeholder="Asia/Kathmandu"
          disabled={isLoading}
          {...form.getInputProps("timezone")}
        />
        <NumberInput
          label="Sort order"
          min={0}
          disabled={isLoading}
          {...form.getInputProps("sort_order")}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          Create Organization
        </Button>
      </Stack>
    </form>
  );
}
