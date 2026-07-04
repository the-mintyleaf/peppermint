"use client";

import { Button, Stack, Textarea, TextInput, useForm } from "@peppermint/ui";

import type {
  EditOrganizationProfileFormProps,
  EditOrganizationProfileFormValues,
} from "./EditOrganizationProfileForm.types";

export function EditOrganizationProfileForm({
  organization,
  onSubmit,
  isLoading,
}: EditOrganizationProfileFormProps) {
  const form = useForm<EditOrganizationProfileFormValues>({
    initialValues: {
      name: organization.name,
      legal_name: organization.legal_name,
      short_name: organization.short_name,
      description: organization.description,
      country_code: organization.country_code,
      timezone: organization.timezone,
    },
    validate: {
      name: (value) => (!value ? "Required" : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
      <Stack gap="md" p="md">
        <TextInput
          label="Name"
          required
          disabled={isLoading}
          {...form.getInputProps("name")}
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
          maxLength={2}
          disabled={isLoading}
          {...form.getInputProps("country_code")}
        />
        <TextInput
          label="Timezone"
          disabled={isLoading}
          {...form.getInputProps("timezone")}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          Save Changes
        </Button>
      </Stack>
    </form>
  );
}
