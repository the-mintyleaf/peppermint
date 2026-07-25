"use client";

import { Textarea } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import type { ProgramFormValues } from "../../../institutions.types";
import type { ProgramFieldsProps } from "../ProgramForm.types";

/** The long free-text entry-expectation fields (detail-only on read). */
export function ProgramEntryFields({ disabled }: ProgramFieldsProps) {
  const { form } = useFormInstance<ProgramFormValues>();
  return (
    <>
      <Textarea
        label="Academic requirement"
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("academic_requirement")}
      />
      <Textarea
        label="English requirement"
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("english_requirement")}
      />
      <Textarea
        label="Backlog tolerance"
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("backlog_tolerance")}
      />
      <Textarea
        label="Document expectation"
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("document_expectation")}
      />
      <Textarea
        label="Selection notes"
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("selection_notes")}
      />
    </>
  );
}
