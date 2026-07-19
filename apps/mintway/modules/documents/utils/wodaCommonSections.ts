/**
 * Shared field/section builders for the WODA form schemas. Keeps the common blocks
 * (document meta, applicant identity, parents, spokesperson) consistent across every
 * variant while letting each variant append its own document-specific section. Labels,
 * descriptions and placeholders here are written for a Nepali ward-office operator.
 */

import type { WodaField, WodaSection } from "./wodaFormSchema";

/** Honorifics printed verbatim on the document — suggestions, not a closed set.
 *  "Late" prefixes a deceased person (several templates branch on it). */
export const HONORIFICS = ["Mr.", "Mrs.", "Ms.", "Miss", "Dr.", "Er.", "Late"];

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

/** Honorific picker (accepts a custom value) paired half-width with a name. */
export function honorificField(
  name: string,
  label: string,
  defaultValue?: string,
): WodaField {
  return {
    name,
    label,
    control: "combobox",
    options: HONORIFICS,
    placeholder: "Mr.",
    defaultValue,
    half: true,
  };
}

export function nameField(
  name: string,
  label: string,
  opts: { required?: boolean; placeholder?: string } = {},
): WodaField {
  return {
    name,
    label,
    half: true,
    required: opts.required,
    placeholder: opts.placeholder ?? "Ram Bahadur Shrestha",
  };
}

/** Document reference + AD date, with optional BS date / dispatch number. */
export function documentSection(
  opts: { dateBs?: boolean; dispatchNo?: boolean } = {},
): WodaSection {
  const fields: WodaField[] = [
    {
      name: "wodadoc_refno",
      label: "Reference no.",
      placeholder: "079/80-1234",
      half: true,
    },
  ];
  if (opts.dispatchNo) {
    fields.push({
      name: "dispatch_no",
      label: "Dispatch no.",
      placeholder: "512",
      half: true,
    });
  }
  fields.push({
    name: "wodadoc_date",
    label: "Issue date (A.D.)",
    control: "date-ad",
    half: opts.dateBs ? true : false,
  });
  if (opts.dateBs) {
    fields.push({
      name: "wodadoc_date_bs",
      label: "Issue date (B.S.)",
      control: "date-bs",
      half: true,
    });
  }
  return {
    title: "Document",
    description: "Reference and issue date printed in the letterhead.",
    fields,
  };
}

/** Applicant identity — honorific + name, optional gender and permanent address. */
export function applicantSection(
  opts: { gender?: boolean; address?: boolean } = {},
): WodaSection {
  const fields: WodaField[] = [
    honorificField("applicant_honorific", "Honorific", "Mr."),
    nameField("applicant_name", "Applicant name", {
      required: true,
      placeholder: "Ram Bahadur Shrestha",
    }),
  ];
  if (opts.gender) {
    fields.push({
      name: "applicant_gender",
      label: "Gender",
      control: "segmented",
      options: GENDER_OPTIONS,
      description: "Sets the son/daughter and his/her wording in the text.",
    });
  }
  if (opts.address) {
    fields.push({
      name: "applicant_permanent_address",
      label: "Permanent address",
      control: "textarea",
      placeholder: "Birendranagar-5, Surkhet",
    });
  }
  return { title: "Applicant", fields };
}

/** Father + mother honorific/name pairs. */
export function parentsSection(): WodaSection {
  return {
    title: "Parents",
    fields: [
      honorificField("applicant_father_honorific", "Father honorific", "Mr."),
      nameField("applicant_father_name", "Father name", {
        placeholder: "Hari Bahadur Shrestha",
      }),
      honorificField("applicant_mother_honorific", "Mother honorific", "Mrs."),
      nameField("applicant_mother_name", "Mother name", {
        placeholder: "Sita Devi Shrestha",
      }),
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
    description: "Whose income the certificate is about.",
  };
}

/** Spokesperson block — name, post, optional contact. */
export function spokespersonSection(): WodaSection {
  return {
    title: "Spokesperson",
    description:
      "The ward official who signs and is contactable for the document.",
    fields: [
      {
        name: "spokesperson_name",
        label: "Name",
        placeholder: "Hari Prasad Sharma",
      },
      {
        name: "spokesperson_post",
        label: "Post / designation",
        placeholder: "Ward Secretary",
        half: true,
      },
      {
        name: "spokesperson_contact",
        label: "Contact number",
        placeholder: "9801234567",
        half: true,
        optional: true,
      },
    ],
  };
}
