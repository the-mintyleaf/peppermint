"use client";

import { useFormInstance } from "@peppermint/admin";
import { Fieldset, Grid, Stack, TextInput, Textarea } from "@peppermint/ui";
import type { ApplicantFormValues } from "../ApplicantForm.types";

/**
 * Two independent, fully optional sections — permanent and current address.
 * Mapped to the `addresses[]` array at submit time (`address_type:
 * "permanent"|"current"`), including an entry only if any of its fields are
 * filled (`ApplicantForm.tsx`'s `toApplicantPayload`).
 */
function AddressFields({
  prefix,
}: {
  prefix: "permanent_address" | "current_address";
}) {
  const { form } = useFormInstance<ApplicantFormValues>();
  return (
    <Stack gap="sm">
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Country"
            placeholder="Nepal"
            {...form.getInputProps(`${prefix}.country`)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Province"
            {...form.getInputProps(`${prefix}.province`)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="District"
            {...form.getInputProps(`${prefix}.district`)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Municipality"
            {...form.getInputProps(`${prefix}.municipality`)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput label="Ward" {...form.getInputProps(`${prefix}.ward`)} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Postal code"
            {...form.getInputProps(`${prefix}.postal_code`)}
          />
        </Grid.Col>
      </Grid>
      <Textarea
        label="Street address"
        autosize
        minRows={2}
        {...form.getInputProps(`${prefix}.street_address`)}
      />
    </Stack>
  );
}

export function AddressesSection() {
  return (
    <Stack gap="md">
      <Fieldset legend="Permanent address">
        <AddressFields prefix="permanent_address" />
      </Fieldset>
      <Fieldset legend="Current address">
        <AddressFields prefix="current_address" />
      </Fieldset>
    </Stack>
  );
}
