"use client";

import { useFormInstance } from "@peppermint/admin";
import {
  ActionIcon,
  Button,
  Fieldset,
  Grid,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import type {
  ApplicantFormValues,
  EmergencyContactFormRow,
} from "../ApplicantForm.types";

const EMPTY_ROW: EmergencyContactFormRow = {
  full_name_np: "",
  full_name_en: "",
  relationship: "",
  contact_number: "",
  email: "",
  address: "",
};

/**
 * Kept distinct from `family_members` — an emergency contact may be a friend
 * or landlord, not a relative (`docs/backend/applicants/CONCEPT.md`), so
 * `relationship` here is free text, not the family enum. Whole-set-replace on
 * submit; a row, once added, requires `full_name_np` + `relationship` +
 * `contact_number` (the backend's non-optional `EmergencyContact` fields;
 * `ApplicantForm.schemas.ts`'s step-4 schema).
 */
export function EmergencyContactsField() {
  const { form } = useFormInstance<ApplicantFormValues>();
  const rows = form.values.emergency_contacts;

  const addRow = () =>
    form.insertListItem("emergency_contacts", { ...EMPTY_ROW });
  const removeRow = (index: number) =>
    form.removeListItem("emergency_contacts", index);

  return (
    <Fieldset legend="Emergency contacts">
      <Stack gap="sm">
        <Group justify="flex-end">
          <Button
            size="compact-xs"
            variant="subtle"
            leftSection={<PlusIcon size={14} aria-hidden />}
            onClick={addRow}
          >
            Add emergency contact
          </Button>
        </Group>

        {rows.length === 0 ? (
          <Text size="xs" c="dimmed">
            No emergency contacts added.
          </Text>
        ) : (
          rows.map((_, index) => (
            <Stack key={index} gap="xs">
              <Grid align="flex-end">
                <Grid.Col span={{ base: 12, sm: 3 }}>
                  <TextInput
                    label="Full name (Nepali)"
                    required
                    {...form.getInputProps(
                      `emergency_contacts.${index}.full_name_np`,
                    )}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 3 }}>
                  <TextInput
                    label="Full name (English)"
                    {...form.getInputProps(
                      `emergency_contacts.${index}.full_name_en`,
                    )}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 3 }}>
                  <TextInput
                    label="Relationship"
                    placeholder="e.g. Friend, Landlord"
                    required
                    {...form.getInputProps(
                      `emergency_contacts.${index}.relationship`,
                    )}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 10, sm: 3 }}>
                  <TextInput
                    label="Contact number"
                    required
                    {...form.getInputProps(
                      `emergency_contacts.${index}.contact_number`,
                    )}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 2 }}>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label="Remove emergency contact"
                    onClick={() => removeRow(index)}
                  >
                    <TrashIcon size={16} aria-hidden />
                  </ActionIcon>
                </Grid.Col>
              </Grid>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Email"
                    type="email"
                    {...form.getInputProps(`emergency_contacts.${index}.email`)}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Textarea
                    label="Address"
                    autosize
                    minRows={1}
                    {...form.getInputProps(
                      `emergency_contacts.${index}.address`,
                    )}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          ))
        )}
      </Stack>
    </Fieldset>
  );
}
