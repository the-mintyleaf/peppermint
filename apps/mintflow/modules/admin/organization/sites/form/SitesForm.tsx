"use client";

import { Button, Select, Stack, TextInput, useForm } from "@peppermint/ui";
import type { SitesFormProps } from "./sitesForm.types";
import type { Site } from "../sites.types";

const SITE_TYPE_OPTIONS = [
  { value: "headquarters", label: "Headquarters" },
  { value: "field_office", label: "Field Office" },
  { value: "regional_office", label: "Regional Office" },
  { value: "district_office", label: "District Office" },
  { value: "service_centre", label: "Service Centre" },
  { value: "warehouse", label: "Warehouse" },
  { value: "other", label: "Other" },
];

export function SitesForm({
  initialValues,
  onSubmit,
  isLoading,
}: SitesFormProps) {
  const form = useForm<Partial<Site>>({
    initialValues: initialValues ?? {
      name: "",
      code: "",
      site_type: "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      province_state: "",
      district: "",
      country_code: "",
      postal_code: "",
    },
    validate: {
      name: (v) => (!v ? "Required" : null),
      code: (v) => (!v ? "Required" : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md" p="md">
        <TextInput
          label="Site Name"
          required
          disabled={isLoading}
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Code"
          required
          disabled={isLoading}
          description="Unique within this organisation"
          {...form.getInputProps("code")}
        />
        <Select
          label="Site Type"
          data={SITE_TYPE_OPTIONS}
          clearable
          disabled={isLoading}
          {...form.getInputProps("site_type")}
        />
        <TextInput
          label="Address Line 1"
          disabled={isLoading}
          {...form.getInputProps("address_line_1")}
        />
        <TextInput
          label="Address Line 2"
          disabled={isLoading}
          {...form.getInputProps("address_line_2")}
        />
        <TextInput
          label="City"
          disabled={isLoading}
          {...form.getInputProps("city")}
        />
        <TextInput
          label="District"
          disabled={isLoading}
          {...form.getInputProps("district")}
        />
        <TextInput
          label="Province / State"
          disabled={isLoading}
          {...form.getInputProps("province_state")}
        />
        <TextInput
          label="Country Code"
          disabled={isLoading}
          description="ISO 3166-1 alpha-2 (e.g. UG)"
          maxLength={2}
          {...form.getInputProps("country_code")}
        />
        <TextInput
          label="Postal Code"
          disabled={isLoading}
          {...form.getInputProps("postal_code")}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          {initialValues?.id ? "Update Site" : "Add Site"}
        </Button>
      </Stack>
    </form>
  );
}
