import {
  applyApiFieldErrors,
  getApiFieldErrors,
  toFormErrorPath,
  toLanguageTestFormRows,
  toLanguageTestPayloads,
} from "@/components/academic";
import type { FieldErrorTarget } from "@/components/academic";
import { getApiError } from "@/lib/authErrorMessages";
import type {
  AddressInput,
  AddressType,
  ApplicantAddress,
  ApplicantCreatePayload,
  ApplicantDetail,
  FamilyRelationship,
} from "../applicants.types";
import { STEP_FIELDS } from "./ApplicantForm.schemas";
import type {
  AddressSectionValues,
  ApplicantFormValues,
} from "./ApplicantForm.types";
import { toEducationFormRows, toEducationPayloads } from "./education.utils";

const EMPTY_ADDRESS: AddressSectionValues = {
  country: "",
  province: "",
  district: "",
  municipality: "",
  ward: "",
  street_address: "",
  postal_code: "",
};

const INITIAL: ApplicantFormValues = {
  photograph: null,
  full_name: "",
  date_of_birth: null,
  gender: "",
  nationality: "",
  email: "",
  contact_numbers: [],
  permanent_address: { ...EMPTY_ADDRESS },
  current_address: { ...EMPTY_ADDRESS },
  citizenship_no: "",
  citizenship_issue_district: "",
  national_id_no: "",
  passport_number: "",
  issuing_country: "",
  place_of_issue: "",
  issued_date: null,
  expiry_date: null,
  educations: [],
  language_tests: [],
  family_members: [],
  emergency_contacts: [],
};

/**
 * Guarantees exactly one `is_primary: true` once the list is non-empty — a
 * pre-existing record with zero or multiple primaries must be normalized on
 * load rather than resubmitted as-is (same rationale as `lead-management`'s
 * `LeadForm.tsx`).
 */
function normalizeContactNumbers(
  rows: ApplicantFormValues["contact_numbers"],
): ApplicantFormValues["contact_numbers"] {
  if (rows.length === 0) return rows;
  const primaryIndex = rows.findIndex((r) => r.is_primary);
  const targetIndex = primaryIndex >= 0 ? primaryIndex : 0;
  return rows.map((r, i) => ({ ...r, is_primary: i === targetIndex }));
}

function findAddress(
  addresses: ApplicantAddress[] | undefined,
  type: AddressType,
): AddressSectionValues {
  const match = addresses?.find((a) => a.address_type === type);
  if (!match) return { ...EMPTY_ADDRESS };
  return {
    country: match.country ?? "",
    province: match.province ?? "",
    district: match.district ?? "",
    municipality: match.municipality ?? "",
    ward: match.ward ?? "",
    street_address: match.street_address ?? "",
    postal_code: match.postal_code ?? "",
  };
}

/** Prefill for edit; a blank form for create. */
export function toFormValues(record?: ApplicantDetail): ApplicantFormValues {
  if (!record) return INITIAL;
  return {
    // Always `null`, never the existing photograph: this field stages a *new*
    // upload, and the record's current photo is read live by the field itself.
    // Seeding it would make an untouched form dirty and re-upload the same
    // bytes on every save.
    photograph: null,
    full_name: record.full_name ?? "",
    date_of_birth: record.date_of_birth,
    gender: record.gender ?? "",
    nationality: record.nationality ?? "",
    email: record.email ?? "",
    contact_numbers: normalizeContactNumbers(
      (record.contact_numbers ?? []).map((c) => ({
        id: c.id,
        number: c.number,
        label: c.label,
        is_primary: c.is_primary,
      })),
    ),
    permanent_address: findAddress(record.addresses, "permanent"),
    current_address: findAddress(record.addresses, "current"),
    citizenship_no: record.citizenship_no ?? "",
    citizenship_issue_district: record.citizenship_issue_district ?? "",
    national_id_no: record.national_id_no ?? "",
    passport_number: record.passport?.passport_number ?? "",
    issuing_country: record.passport?.issuing_country ?? "",
    place_of_issue: record.passport?.place_of_issue ?? "",
    issued_date: record.passport?.issued_date ?? null,
    expiry_date: record.passport?.expiry_date ?? null,
    educations: toEducationFormRows(record.educations),
    language_tests: toLanguageTestFormRows(record.language_tests),
    family_members: (record.family_members ?? []).map((m) => ({
      relationship: m.relationship,
      full_name: m.full_name ?? "",
      occupation: m.occupation ?? "",
      contact_number: m.contact_number ?? "",
      citizenship_no: m.citizenship_no ?? "",
    })),
    emergency_contacts: (record.emergency_contacts ?? []).map((e) => ({
      full_name: e.full_name ?? "",
      relationship: e.relationship,
      contact_number: e.contact_number,
      email: e.email ?? "",
      address: e.address ?? "",
    })),
  };
}

function isBlankAddress(values: AddressSectionValues): boolean {
  return Object.values(values).every((v) => v.trim() === "");
}

function addressToInput(
  type: AddressType,
  values: AddressSectionValues,
): AddressInput | null {
  if (isBlankAddress(values)) return null;
  return {
    address_type: type,
    country: values.country.trim(),
    province: values.province.trim(),
    district: values.district.trim(),
    municipality: values.municipality.trim(),
    ward: values.ward.trim(),
    street_address: values.street_address.trim(),
    postal_code: values.postal_code.trim(),
  };
}

export function isBlankPassport(values: ApplicantFormValues): boolean {
  return (
    !values.passport_number.trim() &&
    !values.issuing_country.trim() &&
    !values.place_of_issue.trim() &&
    !values.issued_date &&
    !values.expiry_date
  );
}

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * The academic lists, sent only when they changed. Both replace wholesale,
 * and resending a record carried over from a lead **drops its
 * `source_lead_id`** — so re-saving an unrelated field must not resend them,
 * or every edit would silently erase the "From lead" provenance. Compared as
 * payloads, so a cosmetic editor default (the BS calendar on a year-less row)
 * never counts as a change. On create, `initial` is `null` and a non-empty
 * list is sent.
 */
function academicChanges(
  values: ApplicantFormValues,
  initial: ApplicantFormValues | null,
): Pick<ApplicantCreatePayload, "educations" | "language_tests"> {
  const educations = toEducationPayloads(values.educations);
  const languageTests = toLanguageTestPayloads(values.language_tests);
  const out: Pick<ApplicantCreatePayload, "educations" | "language_tests"> = {};
  const educationsChanged = initial
    ? !sameJson(educations, toEducationPayloads(initial.educations))
    : educations.length > 0;
  const testsChanged = initial
    ? !sameJson(languageTests, toLanguageTestPayloads(initial.language_tests))
    : languageTests.length > 0;
  if (educationsChanged) out.educations = educations;
  if (testsChanged) out.language_tests = languageTests;
  return out;
}

/**
 * The create/update body. `initial` is the edit form's starting values
 * (`null` on create) — only the academic lists need it, to decide whether
 * they changed.
 *
 * A blank passport section is never sent. A record that never had one omits
 * the key ("no passport on file"); a record that had one and was blanked
 * can't have it removed via this API (upsert-only, no delete — an empty
 * `passport_number` would just 400), so the clear is not submitted and
 * `PassportSection` tells the user why instead of a silent no-op.
 */
export function toApplicantPayload(
  values: ApplicantFormValues,
  initial: ApplicantFormValues | null,
): ApplicantCreatePayload {
  const addresses = [
    addressToInput("permanent", values.permanent_address),
    addressToInput("current", values.current_address),
  ].filter((a): a is AddressInput => a !== null);

  const payload: ApplicantCreatePayload = {
    full_name: values.full_name.trim(),
    nationality: values.nationality.trim(),
    email: values.email.trim(),
    // Always sent: `""` is how a number is cleared.
    citizenship_no: values.citizenship_no.trim(),
    citizenship_issue_district: values.citizenship_issue_district.trim(),
    national_id_no: values.national_id_no.trim(),
    contact_numbers: values.contact_numbers.map((c) => ({
      number: c.number.trim(),
      label: c.label,
      is_primary: c.is_primary,
    })),
    addresses,
    family_members: values.family_members.map((m) => ({
      relationship: m.relationship as FamilyRelationship,
      full_name: m.full_name.trim(),
      occupation: m.occupation.trim(),
      contact_number: m.contact_number.trim(),
      citizenship_no: m.citizenship_no.trim(),
    })),
    emergency_contacts: values.emergency_contacts.map((e) => ({
      full_name: e.full_name.trim(),
      relationship: e.relationship.trim(),
      contact_number: e.contact_number.trim(),
      email: e.email.trim(),
      address: e.address.trim(),
    })),
    ...academicChanges(values, initial),
  };

  // Always sent (as explicit `null`/`""` when cleared) — `undefined`/omitted
  // would be dropped from the JSON body entirely, which PATCH reads as
  // "untouched," silently reverting a clear.
  payload.date_of_birth = values.date_of_birth || null;
  payload.gender = values.gender;

  if (!isBlankPassport(values)) {
    payload.passport = {
      passport_number: values.passport_number.trim(),
      issuing_country: values.issuing_country.trim(),
      place_of_issue: values.place_of_issue.trim(),
      // Explicit `null` (not `undefined`) so a cleared date actually clears.
      issued_date: values.issued_date || null,
      expiry_date: values.expiry_date || null,
    };
  }

  return payload;
}

// ── Server field errors ──────────────────────────────────────────────────────

/** Top-level scalar fields a `VALIDATION_ERROR` may name, as form paths. */
const SCALAR_FIELDS = [
  "full_name",
  "date_of_birth",
  "gender",
  "nationality",
  "email",
  "citizenship_no",
  "citizenship_issue_district",
  "national_id_no",
] as const;

/** Nested lists DRF reports as `[ {field: [msg]}, … ]`, index-aligned. */
const LIST_FIELDS = [
  "contact_numbers",
  "family_members",
  "emergency_contacts",
  "educations",
  "language_tests",
] as const;

/** `passport.<field>` lives flat in the form. */
const PASSPORT_FIELDS = [
  "passport_number",
  "issuing_country",
  "place_of_issue",
  "issued_date",
  "expiry_date",
] as const;

function firstMessage(value: unknown): string | null {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" ? first : null;
}

/** DRF-style `details` (`{ field: [msg] }`, nested per list row) → form paths. */
function detailsToFormErrors(
  details: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const key of SCALAR_FIELDS) {
    const message = firstMessage(details[key]);
    if (message) errors[key] = message;
  }
  for (const key of LIST_FIELDS) {
    const rows = details[key];
    if (!Array.isArray(rows)) continue;
    rows.forEach((row, index) => {
      if (!row || typeof row !== "object" || Array.isArray(row)) return;
      for (const [field, value] of Object.entries(row)) {
        const message = firstMessage(value);
        if (message) errors[`${key}.${index}.${field}`] = message;
      }
    });
  }
  const passport = details.passport;
  if (passport && typeof passport === "object" && !Array.isArray(passport)) {
    const fields = passport as Record<string, unknown>;
    for (const field of PASSPORT_FIELDS) {
      const message = firstMessage(fields[field]);
      if (message) errors[field] = message;
    }
  }
  return errors;
}

/** The first step (in form order) owning any of these error paths, or `null`. */
function firstStepFor(paths: string[]): number | null {
  const roots = new Set(paths.map((path) => path.split(".")[0]));
  const index = STEP_FIELDS.findIndex((fields) =>
    fields.some((field) => roots.has(field)),
  );
  return index >= 0 ? index : null;
}

/**
 * Lays a refused save's field errors onto the form so they sit next to the
 * value that caused them, and returns the step to jump to (or `null` when the
 * error named no field — the mutation's toast is then the whole message).
 *
 * Two shapes arrive: `APPLICANTS_EDUCATION_INVALID` /
 * `APPLICANTS_LANGUAGE_TEST_INVALID` carry a flat `details.fields` map
 * (`educations[1].score` → message), handled by the shared
 * `applyApiFieldErrors`; everything else is DRF-style `details`. Indexes count
 * from 0 in the list sent, which is the form's own row order.
 */
export function applyServerErrors(
  form: FieldErrorTarget,
  error: unknown,
): number | null {
  applyApiFieldErrors(form, error, { apiPath: "educations" });
  applyApiFieldErrors(form, error, { apiPath: "language_tests" });
  // `setErrors` is a state update, so the paths just written are read back
  // from the error itself, not from `form.errors`.
  const flat = Object.keys(getApiFieldErrors(error) ?? {})
    .map(toFormErrorPath)
    .filter(
      (path) =>
        path.startsWith("educations.") || path.startsWith("language_tests."),
    );

  const { details } = getApiError(error);
  const nested = details ? detailsToFormErrors(details) : {};
  if (Object.keys(nested).length > 0) {
    form.setErrors((current) => ({ ...current, ...nested }));
  }
  return firstStepFor([...flat, ...Object.keys(nested)]);
}
