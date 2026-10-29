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
import { FAMILY_RELATIONSHIP_OPTIONS } from "../../applicants.labels";
import type {
  ApplicantFormValues,
  FamilyMemberFormRow,
} from "../ApplicantForm.types";

const EMPTY_ROW: FamilyMemberFormRow = {
  relationship: "",
  full_name: "",
  occupation: "",
  contact_number: "",
  citizenship_no: "",
};

/**
 * Whole-set-replace on submit, fully optional overall — a row, once added,
 * requires `relationship` + `full_name` (`familyEmergencySchema`). One name
 * field: the backend went English-only in DATA_CONTRACT v1.3.0.
 *
 * Grandparents and each member's citizenship number exist for the ward-office
 * (WODA) letters, which name the family line — so the relationship list puts
 * them straight after the parents.
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
              <Grid.Col span={{ base: 12, sm: 4, lg: 2 }}>
                <Select
                  label="Relationship"
                  data={FAMILY_RELATIONSHIP_OPTIONS}
                  {...form.getInputProps(
                    `family_members.${index}.relationship`,
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 8, lg: 3 }}>
                <TextInput
                  label="Full name"
                  required
                  {...form.getInputProps(`family_members.${index}.full_name`)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4, lg: 2 }}>
                <TextInput
                  label="Occupation"
                  {...form.getInputProps(`family_members.${index}.occupation`)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4, lg: 2 }}>
                <TextInput
                  label="Contact number"
                  type="tel"
                  {...form.getInputProps(
                    `family_members.${index}.contact_number`,
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 10, sm: 3, lg: 2 }}>
                <TextInput
                  label="Citizenship no."
                  placeholder="27-01-50-00001"
                  maxLength={50}
                  {...form.getInputProps(
                    `family_members.${index}.citizenship_no`,
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
