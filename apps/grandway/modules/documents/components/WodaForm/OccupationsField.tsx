"use client";

import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
} from "@peppermint/ui";
import type { UseFormReturnType } from "@peppermint/ui";
import { PlusCircleIcon } from "@phosphor-icons/react/dist/csr/PlusCircle";
import { MinusCircleIcon } from "@phosphor-icons/react/dist/csr/MinusCircle";
import type { OccupationColumn } from "../../utils/wodaFormSchema";

type WodaFormValues = Record<string, unknown>;

interface OccupationsFieldProps {
  form: UseFormReturnType<WodaFormValues>;
  /** Form path holding the occupations array. */
  name: string;
  label: string;
  description?: string;
  columns: OccupationColumn[];
  disabled?: boolean;
}

/**
 * Repeatable editor for the `occupations` list (income sources). Replaces the old factory
 * behaviour that bound an array to a single `TextInput` — a field that literally could not
 * be filled. Bound to the form's list helpers so rows persist through the shared submit.
 */
export function OccupationsField({
  form,
  name,
  label,
  description,
  columns,
  disabled,
}: OccupationsFieldProps) {
  const rows = (form.getValues()[name] as Record<string, unknown>[]) ?? [];

  const addRow = () => {
    const blank: Record<string, unknown> = {};
    for (const col of columns) blank[col.key] = col.type === "number" ? 0 : "";
    form.insertListItem(name, blank);
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <div>
          <Text fw={500} size="sm">
            {label}
          </Text>
          {description && (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          )}
        </div>
        <Button
          size="xs"
          variant="light"
          leftSection={<PlusCircleIcon size={14} />}
          onClick={addRow}
          disabled={disabled}
        >
          Add row
        </Button>
      </Group>

      {rows.length === 0 ? (
        <Paper withBorder p="sm" bg="var(--mantine-color-gray-0)">
          <Text size="xs" c="dimmed" ta="center">
            No income sources yet — add your first row.
          </Text>
        </Paper>
      ) : (
        <Table.ScrollContainer minWidth={360}>
          <Table withTableBorder verticalSpacing={4} horizontalSpacing={6}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={32}>#</Table.Th>
                {columns.map((col) => (
                  <Table.Th key={col.key} w={col.width}>
                    {col.label}
                  </Table.Th>
                ))}
                <Table.Th w={44} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((_row, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    <Text size="xs">{index + 1}.</Text>
                  </Table.Td>
                  {columns.map((col) =>
                    col.type === "number" ? (
                      <Table.Td key={col.key}>
                        <NumberInput
                          size="xs"
                          hideControls
                          min={0}
                          thousandSeparator=","
                          aria-label={`${col.label} for row ${index + 1}`}
                          disabled={disabled}
                          {...form.getInputProps(`${name}.${index}.${col.key}`)}
                        />
                      </Table.Td>
                    ) : (
                      <Table.Td key={col.key}>
                        <TextInput
                          size="xs"
                          aria-label={`${col.label} for row ${index + 1}`}
                          disabled={disabled}
                          {...form.getInputProps(`${name}.${index}.${col.key}`)}
                        />
                      </Table.Td>
                    ),
                  )}
                  <Table.Td>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      aria-label={`Remove row ${index + 1}`}
                      disabled={disabled}
                      onClick={() => form.removeListItem(name, index)}
                    >
                      <MinusCircleIcon size={14} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Stack>
  );
}
