"use client";

import { Stack, TextInput, Select, Textarea } from "@peppermint/ui";
import { useFormControls } from "@peppermint/admin";
import type { LoanFormValues } from "../loanForm.types";

export function StepDates() {
  const { form } = useFormControls<LoanFormValues>();
  return (
    <Stack gap="md">
      <TextInput
        label="Loan Date"
        type="date"
        required
        {...form.getInputProps("loanDate")}
      />
      <TextInput
        label="Due Date"
        type="date"
        required
        {...form.getInputProps("dueDate")}
      />
      <TextInput
        label="Return Date"
        type="date"
        description="Leave blank if not yet returned"
        {...form.getInputProps("returnDate")}
      />
      <Select
        label="Status"
        data={[
          { value: "active", label: "Active" },
          { value: "overdue", label: "Overdue" },
          { value: "returned", label: "Returned" },
        ]}
        {...form.getInputProps("status")}
      />
      <Textarea
        label="Notes"
        placeholder="Any additional notes..."
        autosize
        minRows={3}
        {...form.getInputProps("notes")}
      />
    </Stack>
  );
}
