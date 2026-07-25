"use client";

import { Select, Text } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { useTemplatesList } from "../../checklists.hooks";
import type { ChecklistCreateValues } from "../ChecklistCreateForm.types";

const ACTIVE_TEMPLATES_PARAMS = {
  page: 1,
  pageSize: 100,
  search: "",
  sort: [],
  filters: { status: "active" },
};

/**
 * Applying a template requires it be `active` (`CHECKLISTS_TEMPLATE_NOT_ACTIVE`)
 * — scoped to active templates only so that failure mode can't happen from
 * this picker. Shows the template's country alongside its label since a
 * consultancy will usually have one template per country.
 */
export function TemplatePickerField({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<ChecklistCreateValues>();
  const { data, isFetching, isError } = useTemplatesList(
    ACTIVE_TEMPLATES_PARAMS,
  );

  const templates = data?.data ?? [];
  const options = templates.map((template) => ({
    value: template.id,
    label: template.country
      ? `${template.label} — ${template.country.name}`
      : template.label,
  }));

  return (
    <>
      <Select
        label="Template"
        description="Only active templates can be applied"
        placeholder="Choose a template"
        required
        searchable
        data={options}
        disabled={isLoading}
        nothingFoundMessage={
          isError
            ? "Couldn't load templates"
            : isFetching
              ? "Loading…"
              : "No active templates"
        }
        {...form.getInputProps("template")}
        onChange={(value) => form.setFieldValue("template", value)}
      />
      {!isFetching && !isError && templates.length === 0 ? (
        <Text size="xs" c="dimmed">
          No active templates yet — author one from Checklist templates, or
          build this checklist blank instead.
        </Text>
      ) : null}
    </>
  );
}
