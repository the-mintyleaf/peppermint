"use client";

import { useFormInstance } from "@peppermint/admin";
import { Button, Group, Paper, Stack, Text } from "@peppermint/ui";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import type { ApplicantFormValues } from "../../ApplicantForm.types";
import { emptyEducationRow } from "../../education.utils";
import { EducationRow } from "./components/EducationRow";
import type { EducationsFieldProps } from "./EducationsField.types";

/**
 * Repeatable education editor — the sibling of the shared
 * `LanguageTestsField`, same card-per-record shape. The list IS the payload
 * (`educations` replaces wholesale), so add/remove act on the form value
 * directly. New rows append at the bottom; the server returns them newest
 * completion first, which is the order they come back in on the next edit.
 *
 * States: **empty** a dashed call-to-add · **errors** per field from the
 * schema / server (`educations.<i>.<field>`) · loading / request-failed are
 * the host form's (N/A here).
 */
export function EducationsField({ label = "Education" }: EducationsFieldProps) {
  const { form } = useFormInstance<ApplicantFormValues>();
  const rows = form.values.educations;

  const addRow = () => form.insertListItem("educations", emptyEducationRow());
  const removeRow = (index: number) => form.removeListItem("educations", index);

  const addButton = (
    <Button
      size="compact-xs"
      variant={rows.length === 0 ? "light" : "subtle"}
      leftSection={<PlusIcon size={14} aria-hidden />}
      onClick={addRow}
    >
      Add education
    </Button>
  );

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="flex-end" gap="xs">
        <Stack gap={2}>
          <Text size="sm" fw={500}>
            {label}
          </Text>
          <Text size="xs" c="dimmed">
            SEE, +2, bachelor&apos;s and beyond — only the level is required.
          </Text>
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
            <GraduationCapIcon size={20} aria-hidden />
            <Text size="sm" fw={500}>
              No education recorded
            </Text>
            <Text size="xs" c="dimmed" ta="center">
              Add each qualification from their marksheets or transcripts.
            </Text>
            {addButton}
          </Stack>
        </Paper>
      ) : (
        <Stack gap="sm">
          {rows.map((row, index) => (
            // Index keys match how FormWrapper keys errors
            // (`educations.<index>.<field>`); values are controlled.
            <EducationRow
              key={index}
              index={index}
              row={row}
              onRemove={removeRow}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
