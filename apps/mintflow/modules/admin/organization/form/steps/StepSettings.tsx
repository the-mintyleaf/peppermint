"use client";

import { Select, Stack } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { useQuery } from "@tanstack/react-query";
import { fetchOrgUnitOptions } from "../../module.api";
import type { OrgUnitFormValues } from "../orgUnitForm.types";

const TASK_VISIBILITY_OPTIONS = [
  { value: "all_members", label: "All Members — visible to everyone in the unit" },
  { value: "direct_members", label: "Direct Members — visible to assigned members only" },
  { value: "head_only", label: "Head Only — visible to office head only" },
];

const CONFIDENTIALITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "restricted", label: "Restricted" },
  { value: "confidential", label: "Confidential" },
  { value: "top_secret", label: "Top Secret" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
];

export function StepSettings() {
  const { form } = useFormInstance<OrgUnitFormValues>();

  const { data: parentOptions = [], isLoading: parentsLoading } = useQuery({
    queryKey: ["org-units.options"],
    queryFn: fetchOrgUnitOptions,
  });

  return (
    <Stack gap="md">
      <Select
        label="Parent Unit"
        placeholder="Select parent unit (leave blank for top-level)"
        data={parentOptions}
        disabled={parentsLoading}
        clearable
        searchable
        {...form.getInputProps("parentId")}
      />
      <Select
        label="Task Visibility"
        required
        data={TASK_VISIBILITY_OPTIONS}
        {...form.getInputProps("taskVisibility")}
      />
      <Select
        label="Confidentiality Level"
        required
        data={CONFIDENTIALITY_OPTIONS}
        {...form.getInputProps("confidentialityLevel")}
      />
      <Select
        label="Status"
        required
        data={STATUS_OPTIONS}
        {...form.getInputProps("status")}
      />
    </Stack>
  );
}
