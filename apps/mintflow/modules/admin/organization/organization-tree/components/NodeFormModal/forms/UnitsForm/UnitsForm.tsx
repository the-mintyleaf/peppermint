"use client";

import {
  Button,
  Select,
  Stack,
  TextInput,
  Textarea,
  useForm,
} from "@peppermint/ui";
import { UNIT_STATUS_LABELS } from "../../../../../organization.constants";
import type { UnitType, UnitStatus } from "../../../../../organization.types";
import type { UnitsFormProps, UnitsFormValues } from "./UnitsForm.types";

const UNIT_TYPE_OPTIONS: { value: UnitType; label: string }[] = [
  { value: "department", label: "Department" },
  { value: "division", label: "Division" },
  { value: "branch", label: "Branch" },
  { value: "section", label: "Section" },
  { value: "subsection", label: "Sub-Section" },
  { value: "cell", label: "Cell" },
  { value: "team", label: "Team" },
  { value: "committee", label: "Committee" },
  { value: "project_unit", label: "Project Unit" },
  { value: "field_office", label: "Field Office" },
  { value: "regional_office", label: "Regional Office" },
  { value: "district_office", label: "District Office" },
  { value: "temporary_unit", label: "Temporary Unit" },
  { value: "other", label: "Other" },
];

const UNIT_STATUS_OPTIONS = (
  Object.entries(UNIT_STATUS_LABELS) as [UnitStatus, string][]
)
  .filter(([v]) => ["draft", "active", "inactive", "archived"].includes(v))
  .map(([value, label]) => ({ value, label }));

export function UnitsForm({
  initialValues,
  onSubmit,
  isLoading = false,
  isEditing = false,
}: UnitsFormProps) {
  const form = useForm<UnitsFormValues>({
    initialValues: {
      name: initialValues?.name ?? "",
      code: initialValues?.code ?? "",
      unit_type: initialValues?.unit_type ?? "department",
      description: initialValues?.description ?? "",
      status: initialValues?.status ?? "draft",
    },
    validate: {
      name: (v: string) => (!v.trim() ? "Name is required" : null),
      unit_type: (v: string) => (!v ? "Type is required" : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md" p="md">
        <TextInput
          label="Name"
          placeholder="e.g. Human Resources Division"
          required
          disabled={isLoading}
          {...form.getInputProps("name")}
        />

        <TextInput
          label="Code"
          placeholder="hr-div"
          description="Unique slug within this organization"
          disabled={isLoading || isEditing}
          {...form.getInputProps("code")}
        />

        <Select
          label="Unit Type"
          placeholder="Select type"
          data={UNIT_TYPE_OPTIONS}
          required
          disabled={isLoading}
          {...form.getInputProps("unit_type")}
        />

        <Textarea
          label="Description"
          placeholder="What does this unit do?"
          autosize
          minRows={2}
          maxRows={4}
          disabled={isLoading}
          {...form.getInputProps("description")}
        />

        <Select
          label="Status"
          data={UNIT_STATUS_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("status")}
        />

        <Button type="submit" loading={isLoading} fullWidth>
          {isEditing ? "Update Unit" : "Create Unit"}
        </Button>
      </Stack>
    </form>
  );
}
