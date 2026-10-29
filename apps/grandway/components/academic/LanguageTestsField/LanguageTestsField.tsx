"use client";

import { Button, Group, Paper, Stack, Text } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { CertificateIcon } from "@phosphor-icons/react/dist/csr/Certificate";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import type { LanguageTestFormRow } from "../academic.types";
import { emptyLanguageTestRow } from "../languageTest.utils";
import { LanguageTestRow } from "./components/LanguageTestRow";
import type { LanguageTestsFieldProps } from "./LanguageTestsField.types";

/** Reads the list at a dot path; anything that isn't an array reads as empty. */
function readRows(values: unknown, path: string): LanguageTestFormRow[] {
  const value = path
    .split(".")
    .reduce<unknown>(
      (node, key) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[key]
          : undefined,
      values,
    );
  return Array.isArray(value) ? (value as LanguageTestFormRow[]) : [];
}

/**
 * Repeatable language-test editor for a FormWrapper form. The list at `path`
 * IS the payload (the API replaces the whole set), so add/remove act on the
 * form value directly — no local state. Every field is optional except the
 * test type, so only that one is marked.
 *
 * States: **empty** a dashed call-to-add · **at the cap** Add disabled with
 * the reason in words · **errors** per field from the schema / server
 * (`applyApiFieldErrors`) and a list-level line for the count rule ·
 * **disabled** every control and add/remove. Loading / request-failed are the
 * host form's (N/A here).
 */
export function LanguageTestsField({
  path,
  maxCount,
  label = "Language tests",
  description,
  disabled,
  popoverZIndex,
}: LanguageTestsFieldProps) {
  const { form } = useFormInstance<Record<string, unknown>>();
  const rows = readRows(form.values, path);
  const listError = form.errors[path];
  const atCap = maxCount !== undefined && rows.length >= maxCount;

  const addRow = () => {
    if (atCap) return;
    form.insertListItem(path, emptyLanguageTestRow());
  };
  const removeRow = (index: number) => form.removeListItem(path, index);

  const addButton = (
    <Button
      size="compact-xs"
      variant={rows.length === 0 ? "light" : "subtle"}
      leftSection={<PlusIcon size={14} aria-hidden />}
      onClick={addRow}
      disabled={disabled || atCap}
    >
      Add test
    </Button>
  );

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="flex-end" gap="xs">
        <Stack gap={2}>
          <Text size="sm" fw={500}>
            {label}
          </Text>
          {description ? (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          ) : null}
        </Stack>
        {rows.length > 0 ? addButton : null}
      </Group>

      {rows.length === 0 ? (
        <Paper
          withBorder
          radius="md"
          py="lg"
          px="md"
          style={{ borderStyle: "dashed" }}
        >
          <Stack gap={6} align="center">
            <CertificateIcon size={20} aria-hidden />
            <Text size="sm" fw={500}>
              No language tests recorded
            </Text>
            <Text size="xs" c="dimmed" ta="center">
              Add IELTS, PTE, TOEFL, Duolingo or another test once it&apos;s
              been taken.
            </Text>
            {addButton}
          </Stack>
        </Paper>
      ) : (
        <Stack gap="sm">
          {rows.map((row, index) => (
            <LanguageTestRow
              // Index keys match how FormWrapper keys errors
              // (`<path>.<index>.<field>`); values are controlled, so a removal
              // re-renders each row with its new data.
              key={index}
              path={path}
              index={index}
              row={row}
              onRemove={removeRow}
              disabled={disabled}
              popoverZIndex={popoverZIndex}
            />
          ))}
        </Stack>
      )}

      {listError ? (
        <Text size="xs" c="red" role="alert">
          {listError}
        </Text>
      ) : null}
      {atCap ? (
        <Text size="xs" c="dimmed">
          That&apos;s the maximum of {maxCount} tests. Remove one to add
          another.
        </Text>
      ) : null}
    </Stack>
  );
}
