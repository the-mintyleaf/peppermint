"use client";

import { useFormInstance } from "@peppermint/admin";
import { Alert, DateInput, Fieldset, Grid, TextInput } from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import type { ApplicantFormValues } from "../ApplicantForm.types";

export interface PassportSectionProps {
  /** True when this applicant already had a passport on file at load time. */
  hadExistingPassport: boolean;
}

function isBlank(values: ApplicantFormValues): boolean {
  return (
    !values.passport_number.trim() &&
    !values.issuing_country.trim() &&
    !values.place_of_issue.trim() &&
    !values.issued_date &&
    !values.expiry_date
  );
}

/**
 * Single optional section — expiry matters operationally (blocks visas), so
 * it's rendered here alongside issue date rather than tucked away; the
 * detail page renders expiry with a color-coded prominence separately.
 * `ApplicantForm.schemas.ts`'s passport schema enforces expiry-after-issued
 * only when both dates are present.
 *
 * There is no "remove passport" endpoint — the API only upserts one record
 * (`docs/backend/applicants/INTEGRATION.md` §4). If every field is cleared
 * on a record that already had a passport, `toApplicantPayload` deliberately
 * omits the section from the request rather than submitting an invalid
 * empty-required-field payload — this banner tells the user why their
 * clear didn't take effect, instead of a silent no-op.
 */
export function PassportSection({ hadExistingPassport }: PassportSectionProps) {
  const { form } = useFormInstance<ApplicantFormValues>();
  const showCannotRemoveWarning = hadExistingPassport && isBlank(form.values);
  return (
    <Fieldset legend="Passport (optional)">
      {showCannotRemoveWarning ? (
        <Alert
          color="yellow"
          variant="light"
          icon={<WarningIcon size={16} aria-hidden />}
          mb="md"
        >
          A passport already on file can&apos;t be removed this way — re-enter a
          passport number to save changes, or leave the fields as they were.
        </Alert>
      ) : null}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Passport number"
            {...form.getInputProps("passport_number")}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Issuing country"
            {...form.getInputProps("issuing_country")}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Place of issue"
            {...form.getInputProps("place_of_issue")}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <DateInput
            label="Issued date"
            valueFormat="YYYY-MM-DD"
            clearable
            {...form.getInputProps("issued_date")}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <DateInput
            label="Expiry date"
            valueFormat="YYYY-MM-DD"
            clearable
            {...form.getInputProps("expiry_date")}
          />
        </Grid.Col>
      </Grid>
    </Fieldset>
  );
}
