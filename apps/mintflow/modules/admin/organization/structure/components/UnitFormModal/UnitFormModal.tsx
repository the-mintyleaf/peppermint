"use client";

import { useEffect } from "react";
import {
  Alert,
  Button,
  Modal,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  useForm,
} from "@peppermint/ui";

import { getApiError } from "@/lib/authErrorMessages";

import { useStructureStore } from "../../Structure.store";
import {
  useCreateUnit,
  useUnitDetail,
  useUpdateUnit,
} from "../../Structure.hooks";
import type { UnitFormModalProps, UnitFormValues } from "./UnitFormModal.types";

const UNIT_TYPE_OPTIONS = [
  { value: "root", label: "Root" },
  { value: "department", label: "Department" },
  { value: "division", label: "Division" },
  { value: "branch", label: "Branch" },
  { value: "section", label: "Section" },
  { value: "subsection", label: "Subsection" },
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

const UNIT_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "merged", label: "Merged" },
  { value: "split", label: "Split" },
  { value: "renamed", label: "Renamed" },
  { value: "archived", label: "Archived" },
];

const CODE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function UnitFormModal({ organizationId }: UnitFormModalProps) {
  const { unitModal, closeUnitModal } = useStructureStore();
  const isEdit = unitModal.mode === "edit";
  const { data: editingUnit } = useUnitDetail(
    isEdit ? (unitModal.editingUnitId ?? null) : null,
  );
  const createMutation = useCreateUnit(organizationId);
  const updateMutation = useUpdateUnit(organizationId);

  const form = useForm<UnitFormValues>({
    initialValues: {
      name: "",
      code: "",
      unit_type: "",
      status: "draft",
      description: "",
      sort_order: 0,
      is_operational: true,
    },
    validate: {
      name: (value) => (!value ? "Required" : null),
      code: (value) => {
        if (isEdit) return null;
        if (!value) return "Required";
        if (!CODE_PATTERN.test(value)) {
          return "Lowercase letters, numbers, and hyphens only";
        }
        return null;
      },
      unit_type: (value) => (!value ? "Required" : null),
    },
  });

  useEffect(() => {
    if (isEdit && editingUnit) {
      form.setValues({
        name: editingUnit.name,
        code: editingUnit.code,
        unit_type: editingUnit.unit_type,
        status: editingUnit.status,
        description: editingUnit.description,
        sort_order: editingUnit.sort_order,
        is_operational: editingUnit.is_operational,
      });
    } else if (!isEdit) {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, editingUnit?.id]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(values: UnitFormValues) {
    if (isEdit && unitModal.editingUnitId) {
      updateMutation.mutate(
        {
          unitId: unitModal.editingUnitId,
          payload: {
            name: values.name,
            unit_type: values.unit_type || undefined,
            status: values.status,
            description: values.description,
            sort_order: values.sort_order,
            is_operational: values.is_operational,
          },
        },
        { onSuccess: closeUnitModal },
      );
      return;
    }

    createMutation.mutate(
      {
        name: values.name,
        code: values.code,
        unit_type: values.unit_type || "other",
        parent: unitModal.parentId ?? null,
        description: values.description,
        sort_order: values.sort_order,
        is_operational: values.is_operational,
      },
      {
        onSuccess: closeUnitModal,
        onError: (error) => {
          const apiError = getApiError(error);
          if (apiError.code === "ORGANIZATION_UNIT_CODE_EXISTS") {
            form.setFieldError("code", apiError.message);
          }
        },
      },
    );
  }

  return (
    <Modal
      opened={unitModal.open}
      onClose={closeUnitModal}
      title={isEdit ? "Edit Unit" : "Create Unit"}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md" p="md">
          {!isEdit && (
            <Text size="xs" c="dimmed">
              {unitModal.parentId
                ? `Under: ${unitModal.parentName}`
                : "This will be a root-level unit."}
            </Text>
          )}
          <TextInput
            label="Name"
            required
            disabled={isLoading}
            {...form.getInputProps("name")}
          />
          {!isEdit && (
            <TextInput
              label="Code"
              description="Unique within this organization"
              required
              disabled={isLoading}
              {...form.getInputProps("code")}
            />
          )}
          <Select
            label="Unit Type"
            required
            data={UNIT_TYPE_OPTIONS}
            disabled={isLoading}
            {...form.getInputProps("unit_type")}
          />
          {isEdit && (
            <Select
              label="Status"
              data={UNIT_STATUS_OPTIONS}
              disabled={isLoading}
              {...form.getInputProps("status")}
            />
          )}
          <Textarea
            label="Description"
            minRows={2}
            autosize
            disabled={isLoading}
            {...form.getInputProps("description")}
          />
          <NumberInput
            label="Sort Order"
            min={0}
            disabled={isLoading}
            {...form.getInputProps("sort_order")}
          />
          <Switch
            label="Operational"
            description="Distinguishes a real operating unit from a placeholder"
            disabled={isLoading}
            {...form.getInputProps("is_operational", { type: "checkbox" })}
          />
          {isEdit && (
            <Alert color="blue" variant="light">
              To change this unit&apos;s parent, use the Move action instead.
            </Alert>
          )}
          <Button type="submit" loading={isLoading} fullWidth>
            {isEdit ? "Save Changes" : "Create Unit"}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
