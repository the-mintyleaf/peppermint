import type { StudyLevel } from "../applicantJourneys.types";

/**
 * The create/update request contract accepts exactly these 10 optional fields
 * plus `applicant` — `stage` is deliberately absent (never writable via
 * create/update, moves only through the dedicated lifecycle actions).
 * `notes` IS writable here (`docs/backend/applicant-journeys/INTEGRATION.md`
 * §7 lists it in both the create and update payload — an earlier revision of
 * that digest mistakenly omitted it, corrected 2026-07-24).
 *
 * The index signature matches `LeadFormValues`/`CreateUserValues` —
 * required because `FormWrapper<T>`'s generic bound is stricter than a
 * shell's `T extends object`; see the anti-pattern gate's own
 * `*Values`-suffix exemption (`apps/grandway/docs/AI.md` "Conventions").
 */
export interface JourneyFormValues extends Record<string, unknown> {
  applicant: string;
  target_country: string;
  target_institution_name: string;
  target_program_name: string;
  study_level: StudyLevel | "";
  field_of_study: string;
  preferred_intake: string;
  budget_amount: number | null;
  budget_currency: string;
  scholarship_interest: boolean;
  notes: string;
}
