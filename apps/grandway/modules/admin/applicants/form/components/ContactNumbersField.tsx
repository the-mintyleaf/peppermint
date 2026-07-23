"use client";

import { useFormInstance } from "@peppermint/admin";
import {
  ActionIcon,
  Button,
  Group,
  Radio,
  Select,
  Stack,
  Text,
  TextInput,
} from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import type { ContactNumberInput } from "../../applicants.types";
import type { ApplicantFormValues } from "../ApplicantForm.types";

const LABEL_OPTIONS = [
  { value: "mobile", label: "Mobile" },
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "viber", label: "Viber" },
  { value: "other", label: "Other" },
];

const EMPTY_ROW: ContactNumberInput = {
  number: "",
  label: "mobile",
  is_primary: false,
};

/**
 * Whole-set-replace on submit, matching the backend contract — the array this
 * manages IS the payload, not a delta (`docs/backend/applicants/INTEGRATION.md`
 * §3). Exactly one row is primary at all times once the list is non-empty;
 * the backend doesn't hard-require this, but it's the only sane UI default.
 * Mirrors `lead-management/form/ContactNumbersField.tsx` almost verbatim.
 */
export function ContactNumbersField() {
  const { form } = useFormInstance<ApplicantFormValues>();
  const rows = form.values.contact_numbers;
  const primaryIndex = rows.findIndex((row) => row.is_primary);
  const arrayError =
    typeof form.errors.contact_numbers === "string"
      ? form.errors.contact_numbers
      : undefined;

  const setPrimary = (index: number) => {
    form.setFieldValue(
      "contact_numbers",
      rows.map((row, i) => ({ ...row, is_primary: i === index })),
    );
  };

  const addRow = () => {
    form.insertListItem("contact_numbers", {
      ...EMPTY_ROW,
      is_primary: rows.length === 0,
    });
  };

  const removeRow = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    if (rows[index]?.is_primary && next[0]) {
      next[0] = { ...next[0], is_primary: true };
    }
    form.setFieldValue("contact_numbers", next);
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={500}>
          Contact numbers{" "}
          <Text span c="red">
            *
          </Text>
        </Text>
        <Button
          size="compact-xs"
          variant="subtle"
          leftSection={<PlusIcon size={14} aria-hidden />}
          onClick={addRow}
        >
          Add number
        </Button>
      </Group>

      {rows.length === 0 ? (
        <Text size="xs" c="dimmed">
          No contact numbers yet — add at least one.
        </Text>
      ) : (
        <Radio.Group
          value={primaryIndex >= 0 ? String(primaryIndex) : null}
          onChange={(value) => setPrimary(Number(value))}
        >
          <Stack gap="xs">
            {rows.map((row, index) => (
              <Group key={index} gap="xs" wrap="nowrap" align="flex-start">
                <Radio
                  value={String(index)}
                  aria-label="Primary number"
                  mt={8}
                />
                <TextInput
                  placeholder="98XXXXXXXX"
                  style={{ flex: 1 }}
                  {...form.getInputProps(`contact_numbers.${index}.number`)}
                />
                <Select
                  data={LABEL_OPTIONS}
                  w={130}
                  {...form.getInputProps(`contact_numbers.${index}.label`)}
                />
                <ActionIcon
                  variant="subtle"
                  color="red"
                  disabled={rows.length <= 1}
                  aria-label="Remove number"
                  onClick={() => removeRow(index)}
                  mt={4}
                >
                  <TrashIcon size={16} aria-hidden />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        </Radio.Group>
      )}

      {arrayError ? (
        <Text size="xs" c="red">
          {arrayError}
        </Text>
      ) : (
        <Text size="xs" c="dimmed">
          Select the radio button next to a number to mark it primary.
        </Text>
      )}
    </Stack>
  );
}
