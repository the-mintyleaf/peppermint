"use client";

import { useFormInstance } from "@peppermint/admin";
import {
  ActionIcon,
  Button,
  Group,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import type { CreateClientValues } from "../clients.types";
import { CONTACT_LABEL_OPTIONS, EMPTY_CONTACT_ROW } from "./clientForm.utils";

/**
 * Whole-set-replace repeater matching the backend contract — the array this
 * manages IS the payload, not a delta. Unlike leads, `is_primary` is a per-row
 * toggle rather than a single-choice radio: the clients contract allows zero or
 * several primaries (§4), so nothing here forces exactly one.
 */
export function ClientContactNumbersField({
  isLoading,
}: {
  isLoading?: boolean;
}) {
  const { form } = useFormInstance<CreateClientValues>();
  const rows = form.values.contact_numbers;
  const arrayError =
    typeof form.errors.contact_numbers === "string"
      ? form.errors.contact_numbers
      : undefined;

  const addRow = () => {
    form.insertListItem("contact_numbers", { ...EMPTY_CONTACT_ROW });
  };

  const removeRow = (index: number) => {
    form.removeListItem("contact_numbers", index);
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={500}>
          Contact numbers
        </Text>
        <Button
          size="compact-xs"
          variant="subtle"
          leftSection={<PlusIcon size={14} aria-hidden />}
          disabled={isLoading}
          onClick={addRow}
        >
          Add number
        </Button>
      </Group>

      {rows.length === 0 ? (
        <Text size="xs" c="dimmed">
          No contact numbers yet.
        </Text>
      ) : (
        <Stack gap="xs">
          {rows.map((_, index) => (
            <Group key={index} gap="xs" wrap="nowrap" align="flex-start">
              <TextInput
                aria-label="Phone number"
                placeholder="98XXXXXXXX"
                style={{ flex: 1 }}
                disabled={isLoading}
                {...form.getInputProps(`contact_numbers.${index}.number`)}
              />
              <Select
                aria-label="Number type"
                data={CONTACT_LABEL_OPTIONS}
                w={130}
                disabled={isLoading}
                {...form.getInputProps(`contact_numbers.${index}.label`)}
              />
              <Switch
                aria-label="Primary number"
                label="Primary"
                mt={8}
                disabled={isLoading}
                {...form.getInputProps(`contact_numbers.${index}.is_primary`, {
                  type: "checkbox",
                })}
              />
              <ActionIcon
                variant="subtle"
                color="red"
                aria-label="Remove number"
                disabled={isLoading}
                onClick={() => removeRow(index)}
                mt={4}
              >
                <TrashIcon size={16} aria-hidden />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      )}

      {arrayError ? (
        <Text size="xs" c="red">
          {arrayError}
        </Text>
      ) : null}
    </Stack>
  );
}
