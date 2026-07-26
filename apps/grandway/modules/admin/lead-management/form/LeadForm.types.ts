import type {
  ContactNumberInput,
  LanguageTestStatus,
  StudyLevel,
} from "../leadManagement.types";

export interface StudyInterestFormValues {
  interested_countries: string[];
  study_level: StudyLevel | "";
  field_of_study: string;
  preferred_intake: string;
  budget_amount: number | null;
  budget_currency: string;
  scholarship_interest: boolean;
  highest_qualification: string;
  language_test_status: LanguageTestStatus | "";
  interest_notes: string;
}

/**
 * `stage` is deliberately not a field here — it's never writable via create
 * or update (`docs/backend/lead-management/INTEGRATION.md` §7); stage moves
 * only through the dedicated lifecycle actions built in a later phase.
 *
 * The index signature below matches `CreateUserValues`/`UpdateUserValues`
 * (`../../authenticate/users/users.types.ts`) — required because
 * `FormWrapper<T>`'s generic bound is stricter than a shell's `T extends
 * object`; see the anti-pattern gate's own `*Values`-suffix exemption.
 */
export interface LeadFormValues extends Record<string, unknown> {
  full_name: string;
  email: string;
  address: string;
  source: string;
  source_detail: string;
  contact_numbers: ContactNumberInput[];
  study_interest: StudyInterestFormValues;
}
