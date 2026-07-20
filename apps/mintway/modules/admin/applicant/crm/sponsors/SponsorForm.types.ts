import type { ModalFormComponentProps } from "@peppermint/admin";
import type { Sponsor } from "../../_shared";

/** Sponsor form state — strings + the primary flag; money fields are decimal strings. */
export interface SponsorFormValues extends Record<string, unknown> {
  sponsor_type: string;
  name: string;
  relationship_to_applicant: string;
  occupation_or_business: string;
  organization_name: string;
  address: string;
  country: string;
  phone: string;
  email: string;
  annual_income: string;
  income_currency: string;
  funding_amount: string;
  funding_currency: string;
  funding_source: string;
  is_primary: boolean;
  verification_status: string;
  verification_notes: string;
}

/** Cleaned create/update payload the form emits (empties dropped; required fields kept). */
export interface SponsorPayload extends Record<string, unknown> {
  sponsor_type: string;
  is_primary: boolean;
}

export type SponsorFormProps = ModalFormComponentProps<Sponsor, SponsorPayload>;
