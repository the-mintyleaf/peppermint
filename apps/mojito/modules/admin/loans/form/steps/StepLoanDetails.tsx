"use client";

import { Stack, TextInput } from "@zetsel/ui";
import { useFormControls } from "@zetsel/admin";
import type { LoanFormValues } from "../loanForm.types";

export function StepLoanDetails() {
  const { form } = useFormControls<LoanFormValues>();
  return (
    <Stack gap="md">
      <TextInput
        label="Member ID"
        placeholder="member-001"
        required
        description="Enter the member's ID"
        {...form.getInputProps("memberId")}
        onChange={(e) => {
          form.setFieldValue("memberId", e.currentTarget.value);
          form.setFieldValue("memberName", e.currentTarget.value);
        }}
      />
      <TextInput
        label="Member Name"
        placeholder="Alice Johnson"
        required
        {...form.getInputProps("memberName")}
      />
      <TextInput
        label="Book ID"
        placeholder="book-001"
        required
        description="Enter the book's ID"
        {...form.getInputProps("bookId")}
        onChange={(e) => {
          form.setFieldValue("bookId", e.currentTarget.value);
          form.setFieldValue("bookTitle", e.currentTarget.value);
        }}
      />
      <TextInput
        label="Book Title"
        placeholder="The Great Gatsby"
        required
        {...form.getInputProps("bookTitle")}
      />
    </Stack>
  );
}
