"use client";

import { Divider, Stack, TextInput, Title } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import type { OrgUnitFormValues } from "../orgUnitForm.types";

export function StepContact() {
  const { form } = useFormInstance<OrgUnitFormValues>();

  return (
    <Stack gap="md">
      <Title order={6} c="dimmed">
        Office Contact
      </Title>
      <TextInput
        label="Phone"
        placeholder="e.g. 01-4211234"
        {...form.getInputProps("phone")}
      />
      <TextInput
        label="Email"
        type="email"
        placeholder="e.g. info@moha.gov.np"
        {...form.getInputProps("email")}
      />
      <TextInput
        label="Fax"
        placeholder="e.g. 01-4211235"
        {...form.getInputProps("fax")}
      />
      <TextInput
        label="Website"
        placeholder="e.g. https://moha.gov.np"
        {...form.getInputProps("website")}
      />

      <Divider label="Office Head" labelPosition="left" />

      <TextInput
        label="Head Name"
        placeholder="e.g. Ram Bahadur Thapa"
        {...form.getInputProps("headName")}
      />
      <TextInput
        label="Head Title / Designation"
        placeholder="e.g. Secretary"
        {...form.getInputProps("headTitle")}
      />
      <TextInput
        label="Head Phone"
        placeholder="e.g. 01-4211236"
        {...form.getInputProps("headPhone")}
      />
      <TextInput
        label="Head Email"
        type="email"
        placeholder="e.g. secretary@moha.gov.np"
        {...form.getInputProps("headEmail")}
      />
    </Stack>
  );
}
