"use client";

import {
  Button,
  NumberInput,
  Stack,
  Textarea,
  TextInput,
  useForm,
} from "@peppermint/ui";

import type {
  EditOrganizationProfileFormProps,
  EditOrganizationProfileFormValues,
} from "./EditOrganizationProfileForm.types";

const COUNTRY_CODE_PATTERN = /^[A-Za-z]{2}$/;

export function EditOrganizationProfileForm({
  organization,
  onSubmit,
  isLoading,
}: EditOrganizationProfileFormProps) {
  const form = useForm<EditOrganizationProfileFormValues>({
    initialValues: {
      name_np: organization.name_np,
      name_en: organization.name_en,
      legal_name_np: organization.legal_name_np,
      short_name_np: organization.short_name_np,
      short_name_en: organization.short_name_en,
      description: organization.description,
      country_code: organization.country_code,
      timezone: organization.timezone,
      sort_order: organization.sort_order,
    },
    validate: {
      name_np: (value) => (!value ? "Required" : null),
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
          country_code: values.country_code.toUpperCase(),
          sort_order: Number(values.sort_order) || 0,
        }),
      )}
    >
      <Stack gap="md" p="md">
        <TextInput
          label="Name (Nepali)"
          required
          disabled={isLoading}
          {...form.getInputProps("name_np")}
        />
        <TextInput
          label="Name (English)"
          disabled={isLoading}
          {...form.getInputProps("name_en")}
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
          maxLength={2}
          disabled={isLoading}
          {...form.getInputProps("country_code")}
        />
        <TextInput
          label="Timezone"
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
          Save Changes
        </Button>
      </Stack>
    </form>
  );
}
