"use client";

import {
  Button,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  useForm,
} from "@peppermint/ui";
import { ORGANIZATION_TYPE_LABELS } from "../../organization.constants";
import type { OrganizationType } from "../../organization.types";
import type { Organization } from "../organizations.types";
import type { OrganizationsFormProps } from "./OrganizationsForm.types";

const ORG_TYPE_OPTIONS = (
  Object.entries(ORGANIZATION_TYPE_LABELS) as [OrganizationType, string][]
).map(([value, label]) => ({ value, label }));

export function OrganizationsForm({
  initialValues,
  onSubmit,
  isLoading = false,
}: OrganizationsFormProps) {
  const isEditing = Boolean(initialValues?.id);

  const form = useForm<Organization>({
    initialValues: {
      id: initialValues?.id ?? "",
      name: initialValues?.name ?? "",
      code: initialValues?.code ?? "",
      organization_type: initialValues?.organization_type ?? "ministry",
      status: initialValues?.status ?? "draft",
      parent_organization: initialValues?.parent_organization ?? null,
      legal_name: initialValues?.legal_name ?? "",
      short_name: initialValues?.short_name ?? "",
      description: initialValues?.description ?? "",
      country_code: initialValues?.country_code ?? "",
      timezone: initialValues?.timezone ?? "",
      is_active: initialValues?.is_active ?? true,
      created_at: initialValues?.created_at ?? "",
      updated_at: initialValues?.updated_at ?? "",
    },
    validate: {
      name: (v) => (!v.trim() ? "Name is required" : null),
      code: (v) => (!v.trim() ? "Code is required" : null),
      organization_type: (v) => (!v ? "Type is required" : null),
      country_code: (v) =>
        v && v.length !== 2
          ? "Must be a 2-letter country code (ISO 3166-1)"
          : null,
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
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
          description="Globally unique slug — cannot be changed after creation"
          required
          disabled={isLoading || isEditing}
          {...form.getInputProps("code")}
        />

        <Select
          label="Type"
          placeholder="Select type"
          data={ORG_TYPE_OPTIONS}
          required
          disabled={isLoading}
          {...form.getInputProps("organization_type")}
        />

        <TextInput
          label="Legal Name"
          placeholder="Ministry of Health and Social Welfare"
          disabled={isLoading}
          {...form.getInputProps("legal_name")}
        />

        <TextInput
          label="Short Name"
          placeholder="MoH"
          disabled={isLoading}
          {...form.getInputProps("short_name")}
        />

        <TextInput
          label="Country Code"
          placeholder="UG"
          maxLength={2}
          description="ISO 3166-1 alpha-2 (2 letters)"
          disabled={isLoading}
          {...form.getInputProps("country_code")}
        />

        <TextInput
          label="Timezone"
          placeholder="Africa/Kampala"
          description="IANA timezone name"
          disabled={isLoading}
          {...form.getInputProps("timezone")}
        />

        <Textarea
          label="Description"
          placeholder="Brief description of this organization's purpose"
          autosize
          minRows={2}
          maxRows={4}
          disabled={isLoading}
          {...form.getInputProps("description")}
        />

        {isEditing && (
          <Text size="xs" c="dimmed">
            To change status, use the status action in the list view.
          </Text>
        )}

        <Button type="submit" loading={isLoading} fullWidth>
          {isEditing ? "Update Organization" : "Create Organization"}
        </Button>
      </Stack>
    </form>
  );
}
