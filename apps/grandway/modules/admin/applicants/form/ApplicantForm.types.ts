import type {
  ContactNumberInput,
  FamilyRelationship,
  Gender,
} from "../applicants.types";

export interface AddressSectionValues {
  country: string;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  street_address: string;
  postal_code: string;
}

export interface FamilyMemberFormRow {
  relationship: FamilyRelationship | "";
  full_name: string;
  occupation: string;
  contact_number: string;
}

export interface EmergencyContactFormRow {
  full_name: string;
  relationship: string;
  contact_number: string;
  email: string;
  address: string;
}

/**
 * Flat, single-object shape shared by all 4 steps — `stepFields` (per-step
 * validation scoping) reads from and `FormWrapper`'s combined validate reads
 * against this whole object, same approach as `LeadFormValues`. The index
 * signature matches `LeadFormValues`/`CreateUserValues` — required because
 * `FormWrapper<T>`'s generic bound is stricter than a shell's `T extends
 * object`; see the anti-pattern gate's own `*Values`-suffix exemption.
 */
export interface ApplicantFormValues extends Record<string, unknown> {
  // Step 1 — Identity & Contact
  /**
   * A newly-picked photograph, staged for upload after the record itself is
   * saved. Not part of the applicant payload and never sent as JSON: the
   * backend has no photo field, and a file's owner must already exist before
   * `POST /files/` will accept it. `null` means "leave the current one alone" —
   * on create it is always `null`, since there is no id to own the file yet.
   */
  photograph: File | null;
  full_name: string;
  date_of_birth: string | null;
  gender: Gender | "";
  nationality: string;
  email: string;
  contact_numbers: ContactNumberInput[];

  // Step 2 — Addresses
  permanent_address: AddressSectionValues;
  current_address: AddressSectionValues;

  // Step 3 — Passport
  passport_number: string;
  issuing_country: string;
  place_of_issue: string;
  issued_date: string | null;
  expiry_date: string | null;

  // Step 4 — Family & Emergency Contacts
  family_members: FamilyMemberFormRow[];
  emergency_contacts: EmergencyContactFormRow[];
}
