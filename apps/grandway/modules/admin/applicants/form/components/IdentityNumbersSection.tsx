"use client";

import { useFormInstance } from "@peppermint/admin";
import { Fieldset, Grid, TextInput } from "@peppermint/ui";
import type { ApplicantFormValues } from "../ApplicantForm.types";

/**
 * Citizenship and national ID numbers — free text (the backend checks only
 * length), printed on the ward-office (WODA) letters. Citizenship number and
 * its issuing district pair on one row because they come off the same card
 * and are read together; the national ID is a separate document.
 * All optional, so none is marked.
 */
export function IdentityNumbersSection() {
  const { form } = useFormInstance<ApplicantFormValues>();
  return (
    <Fieldset legend="Citizenship & national ID (optional)">
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Citizenship number"
            placeholder="27-01-75-12345"
            maxLength={50}
            {...form.getInputProps("citizenship_no")}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Issued in (district)"
            placeholder="Kathmandu"
            maxLength={100}
            {...form.getInputProps("citizenship_issue_district")}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="National ID number"
            placeholder="123-456-789-0"
            maxLength={50}
            {...form.getInputProps("national_id_no")}
          />
        </Grid.Col>
      </Grid>
    </Fieldset>
  );
}
