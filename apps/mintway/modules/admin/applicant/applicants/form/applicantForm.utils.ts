import { z } from "zod";

import type {
  Applicant,
  ApplicantCreatePayload,
  ApplicantUpdatePayload,
} from "../../_shared";
import type { ApplicantFormValues } from "./ApplicantForm.types";

export const APPLICANT_FORM_INITIAL: ApplicantFormValues = {
  first_name: "",
  middle_name: "",
  last_name: "",
  preferred_display_name: "",
  name_native: "",
  nationality: "",
  primary_email: "",
  alternate_email: "",
  primary_phone: "",
  alternate_phone: "",
  lead_source: "",
  lead_source_detail: "",
  initial_interest: "",
  date_of_birth: "",
  gender: "",
  religion: "",
  summary: "",
  eligibility_summary: "",
  counselling_notes: "",
  payment_status: "",
  last_contacted_at: "",
  next_follow_up_at: "",
  follow_up_priority: "",
};

const emailish = (v: string) => !v || /^\S+@\S+\.\S+$/.test(v);
const str = () => z.string();

/**
 * Validation for both roles. Every form field is declared (so mantine-form doesn't
 * strip values it doesn't know) with only the meaningful rules applied. Staff must
 * supply an email or phone on create (`APPLICANT_CONTACT_REQUIRED`); `requireContact`
 * scopes that to create (edit never clears both).
 */
export function buildApplicantSchema(requireContact: boolean) {
  const base = z.object({
    first_name: z.string().min(1, "Required"),
    middle_name: str(),
    last_name: str(),
    preferred_display_name: str(),
    name_native: str(),
    nationality: str(),
    primary_email: z.string().refine(emailish, "Invalid email"),
    alternate_email: z.string().refine(emailish, "Invalid email"),
    primary_phone: str(),
    alternate_phone: str(),
    lead_source: str(),
    lead_source_detail: str(),
    initial_interest: str(),
    date_of_birth: str(),
    gender: str(),
    religion: str(),
    summary: str(),
    eligibility_summary: str(),
    counselling_notes: str(),
    payment_status: str(),
    last_contacted_at: str(),
    next_follow_up_at: str(),
    follow_up_priority: str(),
  });
  if (!requireContact) return base;
  return base.refine((v) => Boolean(v.primary_email || v.primary_phone), {
    message: "Enter at least an email or a phone number",
    path: ["primary_email"],
  });
}

/** ISO date → `YYYY-MM-DD` for `<input type="date">`. */
function toDateInput(iso?: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

/**
 * ISO datetime → `YYYY-MM-DDThh:mm` for `<input type="datetime-local">`. A full ISO
 * string (with seconds/offset) makes the native control render blank, so it must be
 * trimmed to the minute.
 */
function toDatetimeLocalInput(iso?: string | null): string {
  return iso ? iso.slice(0, 16) : "";
}

/** Prefill the form from an existing applicant (edit). Missing fields → "". */
export function applicantToFormValues(
  a: Partial<Applicant>,
): ApplicantFormValues {
  return {
    ...APPLICANT_FORM_INITIAL,
    first_name: a.first_name ?? "",
    middle_name: a.middle_name ?? "",
    last_name: a.last_name ?? "",
    preferred_display_name: a.preferred_display_name ?? "",
    name_native: a.name_native ?? "",
    nationality: a.nationality ?? "",
    primary_email: a.primary_email ?? "",
    alternate_email: a.alternate_email ?? "",
    primary_phone: a.primary_phone ?? "",
    alternate_phone: a.alternate_phone ?? "",
    lead_source: a.lead_source ?? "",
    lead_source_detail: a.lead_source_detail ?? "",
    initial_interest: a.initial_interest ?? "",
    date_of_birth: toDateInput(a.date_of_birth),
    gender: a.gender ?? "",
    religion: a.religion ?? "",
    summary: a.summary ?? "",
    eligibility_summary: a.eligibility_summary ?? "",
    counselling_notes: a.counselling_notes ?? "",
    payment_status: a.payment_status ?? "",
    last_contacted_at: toDatetimeLocalInput(a.last_contacted_at),
    next_follow_up_at: toDatetimeLocalInput(a.next_follow_up_at),
    follow_up_priority: a.follow_up_priority ?? "",
  };
}

/** Free-text fields — a blank value is a legitimate clear (sent as `""` on update). */
const STAFF_TEXT_FIELDS: (keyof ApplicantFormValues)[] = [
  "middle_name",
  "last_name",
  "preferred_display_name",
  "name_native",
  "nationality",
  "primary_email",
  "alternate_email",
  "primary_phone",
  "alternate_phone",
  "lead_source_detail",
  "initial_interest",
];

const ADMIN_TEXT_FIELDS: (keyof ApplicantFormValues)[] = [
  "religion",
  "summary",
  "eligibility_summary",
  "counselling_notes",
];

/** Date/enum/datetime fields — DRF rejects `""`, so an empty value is dropped. */
const STAFF_ENUM_DATE_FIELDS: (keyof ApplicantFormValues)[] = ["lead_source"];

const ADMIN_ENUM_DATE_FIELDS: (keyof ApplicantFormValues)[] = [
  "date_of_birth",
  "gender",
  "payment_status",
  "last_contacted_at",
  "next_follow_up_at",
  "follow_up_priority",
];

/**
 * Build a write payload honoring the role whitelist. On **create** every empty field
 * is dropped (don't send blanks). On **update** free-text fields are always sent — so a
 * cleared field (e.g. `counselling_notes`) actually clears server-side — while
 * date/enum fields are still dropped when empty (DRF rejects `""` for those; there is
 * no in-form affordance to clear them to null). `first_name` is always included.
 */
function toPayload(
  values: ApplicantFormValues,
  isAdmin: boolean,
  mode: "create" | "update",
): Record<string, unknown> {
  const payload: Record<string, unknown> = { first_name: values.first_name };

  const textFields = isAdmin
    ? [...STAFF_TEXT_FIELDS, ...ADMIN_TEXT_FIELDS]
    : STAFF_TEXT_FIELDS;
  const enumDateFields = isAdmin
    ? [...STAFF_ENUM_DATE_FIELDS, ...ADMIN_ENUM_DATE_FIELDS]
    : STAFF_ENUM_DATE_FIELDS;

  for (const key of textFields) {
    const value = values[key];
    if (typeof value !== "string") continue;
    // Update sends blanks to clear; create omits them.
    if (value !== "" || mode === "update") payload[key] = value;
  }
  for (const key of enumDateFields) {
    const value = values[key];
    if (typeof value === "string" && value !== "") payload[key] = value;
  }
  return payload;
}

export function toCreatePayload(
  values: ApplicantFormValues,
  isAdmin: boolean,
): ApplicantCreatePayload {
  return toPayload(values, isAdmin, "create") as ApplicantCreatePayload;
}

export function toUpdatePayload(
  values: ApplicantFormValues,
  isAdmin: boolean,
  recordVersion: number,
): ApplicantUpdatePayload {
  return {
    ...toPayload(values, isAdmin, "update"),
    record_version: recordVersion,
  } as ApplicantUpdatePayload;
}
