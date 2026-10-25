import type { WodaValues } from "../wodaFormat";

export interface WodaApplicantIdentityProps {
  values: WodaValues;
  /** Writes "applicant Mr. …" — the English-country letters name the role. */
  withRoleWord?: boolean;
}
