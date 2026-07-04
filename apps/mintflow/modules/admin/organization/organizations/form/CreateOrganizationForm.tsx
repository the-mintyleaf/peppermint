"use client";

import {
  Button,
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

const CODE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function CreateOrganizationForm({
  onSubmit,
  isLoading,
  codeError,
}: CreateOrganizationFormProps) {
  const form = useForm<CreateOrganizationFormValues>({
    initialValues: {
      name: "",
      code: "",
      organization_type: "",
      legal_name: "",
      short_name: "",
      description: "",
      country_code: "",
      timezone: "",
    },
    validate: {
      name: (value) => (!value ? "Required" : null),
      code: (value) => {
        if (!value) return "Required";
        if (!CODE_PATTERN.test(value)) {
          return "Lowercase letters, numbers, and hyphens only";
        }
        return null;
      },
      organization_type: (value) => (!value ? "Required" : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
      <Stack gap="md" p="md">
        <TextInput
          label="Name"
          placeholder="Ministry of Health"
          required
          disabled={isLoading}
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Code"
          placeholder="moh"
          description="Globally unique lowercase slug"
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
          label="Legal Name"
          disabled={isLoading}
          {...form.getInputProps("legal_name")}
        />
        <TextInput
          label="Short Name"
          disabled={isLoading}
          {...form.getInputProps("short_name")}
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
        <Button type="submit" loading={isLoading} fullWidth>
          Create Organization
        </Button>
      </Stack>
    </form>
  );
}
