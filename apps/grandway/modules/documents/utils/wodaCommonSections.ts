/**
 * Shared field/section builders for the WODA form schemas. Keeps the common blocks
 * (applicant identity, parents, spokesperson) consistent across every variant while
 * letting each variant append its own document-specific section. Labels, descriptions
 * and placeholders here are written for a Nepali ward-office operator.
 *
 * The reference and dispatch numbers are not here: they and their print switches
 * live in the letter's Customizations panel (`document-types/woda-config-bar`).
 */

import type { WodaField, WodaSection } from "./wodaFormSchema";
import { WODA_DEFAULT_SIGNER_POST } from "./wodaDefaults";

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

/** Father + mother honorific/name pairs, optionally with their citizenship numbers. */
export function parentsSection(
  opts: { citizenship?: boolean } = {},
): WodaSection {
  const citizenship = (name: string, label: string): WodaField[] =>
    opts.citizenship
      ? [{ name, label, placeholder: "41/1066", optional: true }]
      : [];
  return {
    title: "Parents",
    description: 'Write "Late" as the honorific for a deceased parent.',
    fields: [
      honorificField("applicant_father_honorific", "Father honorific", "Mr."),
      nameField("applicant_father_name", "Father name", {
        placeholder: "Hari Bahadur Shrestha",
      }),
      ...citizenship("applicant_father_citizenship", "Father citizenship no."),
      honorificField("applicant_mother_honorific", "Mother honorific", "Mrs."),
      nameField("applicant_mother_name", "Mother name", {
        placeholder: "Sita Devi Shrestha",
      }),
      ...citizenship("applicant_mother_citizenship", "Mother citizenship no."),
    ],
  };
}

/** Grandfather + grandmother, named in the identity clause ("grandson of …"). */
export function grandparentsSection(): WodaSection {
  return {
    title: "Grandparents",
    description:
      'Printed as "grandson/granddaughter of …". Leave both blank to omit them.',
    fields: [
      honorificField("grandfather_honorific", "Grandfather honorific", "Mr."),
      nameField("grandfather_name", "Grandfather name", {
        placeholder: "Dhan Bahadur Shrestha",
      }),
      honorificField("grandmother_honorific", "Grandmother honorific", "Mrs."),
      nameField("grandmother_name", "Grandmother name", {
        placeholder: "Harisobha Shrestha",
      }),
    ],
  };
}

/**
 * The applicant's document numbers, printed as "holder of Nepali Citizenship
 * Certificate No. …, National Identity Card No. …, Passport No. …". Any left
 * blank is left out of the sentence.
 */
export function identityNumbersSection(): WodaSection {
  return {
    title: "Applicant documents",
    fields: [
      {
        name: "applicant_citizenship",
        label: "Citizenship certificate no.",
        placeholder: "61-01-71-00039",
        third: true,
      },
      {
        name: "applicant_nid",
        label: "National ID no.",
        placeholder: "118-180-380-5",
        optional: true,
        third: true,
      },
      {
        name: "applicant_passport",
        label: "Passport no.",
        placeholder: "PA4215417",
        optional: true,
        third: true,
      },
    ],
  };
}

/** Relatives beyond the parents (e.g. a grandparent) who appear in the relationship table. */
export function relativesField(): WodaField {
  return {
    name: "relatives",
    label: "Other relatives",
    control: "occupations",
    description:
      'Each row adds a table line and a photo space. Write the relation as "Grandfather" — it prints as "Applicant\'s Grandfather".',
    emptyText:
      "No other relatives — the table lists the applicant and parents.",
    occupationColumns: [
      {
        key: "name",
        label: "Name",
        type: "text",
        width: 190,
        placeholder: "Mr. Dhan Bahadur Khadka",
      },
      {
        key: "citizenship",
        label: "Citizenship no.",
        type: "text",
        placeholder: "371",
      },
      {
        key: "relation",
        label: "Relation",
        type: "text",
        placeholder: "Grandfather",
      },
    ],
  };
}

/** Legal basis sentence, prefilled with the set's default wording. */
export function legalBasisField(name: string, defaultValue: string): WodaField {
  return {
    name,
    label: "Legal basis for issuance",
    control: "textarea",
    description: 'Completes "This letter is issued in accordance with …".',
    defaultValue,
  };
}

/**
 * The three fiscal years an income or tax letter covers: the A.D. label printed
 * in the table header, and the period each spans (printed in the notes).
 */
export function fiscalYearsSection(description: string): WodaSection {
  const year = (n: number, label: string): WodaField[] => [
    {
      name: `fiscal_${n}_ad`,
      label: `Year ${n} (A.D.)`,
      placeholder: label,
      third: true,
    },
    {
      name: `fiscal_${n}_start`,
      label: "Starts",
      control: "date-ad",
      third: true,
    },
    {
      name: `fiscal_${n}_end`,
      label: "Ends",
      control: "date-ad",
      third: true,
    },
  ];
  return {
    title: "Fiscal years",
    description,
    fields: [
      earningGuardianField(),
      ...year(1, "2023/2024"),
      ...year(2, "2024/2025"),
      ...year(3, "2025/2026"),
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
      // The same ward official signs for many applicants — each field offers
      // the operator's saved snippets.
      {
        name: "spokesperson_name",
        label: "Name",
        placeholder: "Ram Lakhan Tharu",
        clipboardKey: "ward.spokesperson.name",
      },
      {
        name: "spokesperson_post",
        label: "Post / designation",
        placeholder: "Ward Chairman",
        defaultValue: WODA_DEFAULT_SIGNER_POST,
        half: true,
        clipboardKey: "ward.spokesperson.post",
      },
      {
        name: "spokesperson_contact",
        label: "Contact number",
        placeholder: "9801234567",
        half: true,
        optional: true,
        clipboardKey: "ward.spokesperson.contact",
      },
    ],
  };
}

/** Income sources with an amount per fiscal year — the Japan income and tax letters. */
export function incomeSourcesField(): WodaField {
  return {
    name: "occupations",
    label: "Income sources",
    control: "occupations",
    description:
      "One row per source; enter the amount earned in each of the three years.",
    emptyText: "No income sources yet — add your first row.",
    occupationColumns: [
      {
        key: "name",
        label: "Source",
        type: "text",
        width: 150,
        placeholder: "Paddy Cultivation",
      },
      { key: "income1", label: "Year 1 (Rs.)", type: "number" },
      { key: "income2", label: "Year 2 (Rs.)", type: "number" },
      { key: "income3", label: "Year 3 (Rs.)", type: "number" },
    ],
  };
}
