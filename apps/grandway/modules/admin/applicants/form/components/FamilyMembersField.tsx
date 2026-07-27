"use client";

import { useFormInstance } from "@peppermint/admin";
import {
  ActionIcon,
  Button,
  Fieldset,
  Grid,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import type {
  ApplicantFormValues,
  FamilyMemberFormRow,
} from "../ApplicantForm.types";

const RELATIONSHIP_OPTIONS = [
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "spouse", label: "Spouse" },
  { value: "sibling", label: "Sibling" },
  { value: "child", label: "Child" },
  { value: "guardian", label: "Guardian" },
  { value: "other", label: "Other" },
];

const EMPTY_ROW: FamilyMemberFormRow = {
  relationship: "",
  full_name: "",
  occupation: "",
  contact_number: "",
};

/**
 * Whole-set-replace on submit, fully optional overall — a row, once added,
 * requires `relationship` + `full_name` (step-4 schema in `ApplicantForm.tsx`).
 * One name field: the backend went English-only in DATA_CONTRACT v1.3.0.
 */
export function FamilyMembersField() {
  const { form } = useFormInstance<ApplicantFormValues>();
  const rows = form.values.family_members;

  const addRow = () => form.insertListItem("family_members", { ...EMPTY_ROW });
  const removeRow = (index: number) =>
    form.removeListItem("family_members", index);

  return (
    <Fieldset legend="Family members">
      <Stack gap="sm">
        <Group justify="flex-end">
          <Button
            size="compact-xs"
            variant="subtle"
            leftSection={<PlusIcon size={14} aria-hidden />}
            onClick={addRow}
          >
            Add family member
          </Button>
        </Group>

        {rows.length === 0 ? (
          <Text size="xs" c="dimmed">
            No family members added.
          </Text>
        ) : (
          rows.map((_, index) => (
            <Grid key={index} align="flex-end">
              <Grid.Col span={{ base: 12, sm: 3 }}>
                <Select
                  label="Relationship"
                  data={RELATIONSHIP_OPTIONS}
                  {...form.getInputProps(
                    `family_members.${index}.relationship`,
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 3 }}>
                <TextInput
                  label="Full name"
                  required
                  {...form.getInputProps(`family_members.${index}.full_name`)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 2 }}>
                <TextInput
                  label="Occupation"
                  {...form.getInputProps(`family_members.${index}.occupation`)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 10, sm: 3 }}>
                <TextInput
                  label="Contact number"
                  {...form.getInputProps(
                    `family_members.${index}.contact_number`,
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 2, sm: 1 }}>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label="Remove family member"
                  onClick={() => removeRow(index)}
                >
                  <TrashIcon size={16} aria-hidden />
                </ActionIcon>
              </Grid.Col>
            </Grid>
          ))
        )}
      </Stack>
    </Fieldset>
  );
}
