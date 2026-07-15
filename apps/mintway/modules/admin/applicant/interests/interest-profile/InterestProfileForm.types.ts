import type { ModalFormComponentProps } from "@peppermint/admin";
import type { InterestProfile } from "../../_shared";

export interface InterestProfileFormValues extends Record<string, unknown> {
  preferred_countries: string[];
  preferred_study_levels: string[];
  preferred_fields: string[];
  preferred_programs: string[];
  preferred_cities: string[];
  preferred_intake: string;
  preferred_year: string;
  estimated_budget: string;
  budget_currency: string;
  funding_method: string;
  study_gap_summary: string;
  travel_history_summary: string;
  visa_refusal_history_summary: string;
  interests: string;
  qualification_summary: string;
  target_program: string;
  notes: string;
}

export type InterestProfilePayload = Record<string, unknown>;

export type InterestProfileFormProps = ModalFormComponentProps<
  InterestProfile,
  InterestProfilePayload
>;
