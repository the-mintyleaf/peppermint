/**
 * Shared field/section builders for the WODA form schemas. Keeps the common blocks
 * (document meta, applicant identity, parents, spokesperson) consistent across every
 * variant while letting each variant append its own document-specific section.
 */

import type { WodaField, WodaSection } from "./wodaFormSchema";

/** Honorifics printed verbatim on the document — suggestions, not a closed set. */
export const HONORIFICS = ["Mr.", "Mrs.", "Ms.", "Miss", "Dr.", "Er."];

/** Kinship/relationship terms printed verbatim — suggestions, not a closed set. */
export const RELATIONS = [
  "Grandfather",
  "Grandmother",
  "Father",
  "Mother",
  "Uncle",
  "Aunt",
  "Brother",
  "Sister",
  "Son",
  "Daughter",
];

export const GENDER_OPTIONS = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

export const EARNING_GUARDIAN_OPTIONS = [
  { label: "Father", value: "father" },
  { label: "Mother", value: "mother" },
];

/** Honorific + name pair (both half-width so they sit on one row). */
export function honorificField(name: string, label: string): WodaField {
  return { name, label, control: "combobox", options: HONORIFICS, half: true };
}

export function nameField(
  name: string,
  label: string,
  opts: { required?: boolean } = {},
): WodaField {
  return { name, label, half: true, required: opts.required };
}

/** Document reference + AD date, with optional BS date / dispatch number. */
export function documentSection(
  opts: { dateBs?: boolean; dispatchNo?: boolean } = {},
): WodaSection {
  const fields: WodaField[] = [
    { name: "wodadoc_refno", label: "Ref. No.", half: true },
  ];
  if (opts.dispatchNo) {
    fields.push({ name: "dispatch_no", label: "Dispatch No.", half: true });
  }
  fields.push({
    name: "wodadoc_date",
    label: "Date (A.D.)",
    control: "date-ad",
    half: opts.dateBs ? true : false,
  });
  if (opts.dateBs) {
    fields.push({
      name: "wodadoc_date_bs",
      label: "Date (B.S.)",
      control: "date-bs",
      half: true,
    });
  }
  return { title: "Document", fields };
}

/** Applicant identity — honorific + name, optional gender and permanent address. */
export function applicantSection(
  opts: { gender?: boolean; address?: boolean } = {},
): WodaSection {
  const fields: WodaField[] = [
    honorificField("applicant_honorific", "Honorific"),
    nameField("applicant_name", "Applicant name", { required: true }),
  ];
  if (opts.gender) {
    fields.push({
      name: "applicant_gender",
      label: "Gender",
      control: "segmented",
      options: GENDER_OPTIONS,
    });
  }
  if (opts.address) {
    fields.push({
      name: "applicant_permanent_address",
      label: "Permanent address",
      control: "textarea",
    });
  }
  return { title: "Applicant", fields };
}

/** Father + mother honorific/name pairs. */
export function parentsSection(): WodaSection {
  return {
    title: "Parents",
    fields: [
      honorificField("applicant_father_honorific", "Father honorific"),
      nameField("applicant_father_name", "Father name"),
      honorificField("applicant_mother_honorific", "Mother honorific"),
      nameField("applicant_mother_name", "Mother name"),
    ],
  };
}

/** Earning-guardian toggle (father/mother) — printed verbatim in income/tax documents. */
export function earningGuardianField(): WodaField {
  return {
    name: "applicant_earning_guardian",
    label: "Earning guardian",
    control: "segmented",
    options: EARNING_GUARDIAN_OPTIONS,
    defaultValue: "father",
  };
}

/** Spokesperson block — name, post, optional contact. */
export function spokespersonSection(): WodaSection {
  return {
    title: "Spokesperson",
    fields: [
      { name: "spokesperson_name", label: "Name" },
      { name: "spokesperson_post", label: "Post", half: true },
      {
        name: "spokesperson_contact",
        label: "Contact",
        half: true,
        optional: true,
      },
    ],
  };
}
