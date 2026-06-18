"use client";

import { Stack, TextInput, Textarea, Select } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import type { AccountFormValues } from "../accountsForm.types";

export function StepPersonalInfo() {
  const { form } = useFormInstance<AccountFormValues>();

  return (
    <Stack gap="md">
      <TextInput
        label="Full Name"
        placeholder="e.g. Ram Bahadur Thapa"
        required
        {...form.getInputProps("fullName")}
      />
      <TextInput
        label="Birthday"
        placeholder="YYYY-MM-DD"
        required
        {...form.getInputProps("birthday")}
      />
      <Textarea
        label="Address"
        placeholder="e.g. Singha Durbar, Kathmandu"
        required
        rows={3}
        {...form.getInputProps("address")}
      />
      <Select
        label="Status"
        data={[
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "suspended", label: "Suspended" },
        ]}
        {...form.getInputProps("status")}
      />
    </Stack>
  );
}
