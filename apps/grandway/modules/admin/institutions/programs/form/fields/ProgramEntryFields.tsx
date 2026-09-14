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
        placeholder="Year 12 or an equivalent qualification, with a minimum GPA of 2.8."
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("academic_requirement")}
      />
      <Textarea
        label="English requirement"
        placeholder="IELTS 6.0 overall with no band below 5.5, or PTE 50."
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("english_requirement")}
      />
      <Textarea
        label="Backlog tolerance"
        placeholder="Up to 8 backlogs accepted alongside a strong overall record."
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("backlog_tolerance")}
      />
      <Textarea
        label="Document expectation"
        placeholder="Academic transcripts, passport bio page, English test report."
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("document_expectation")}
      />
      <Textarea
        label="Selection notes"
        placeholder="Interviews run fortnightly; a portfolio is reviewed for design intakes."
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("selection_notes")}
      />
    </>
  );
}
