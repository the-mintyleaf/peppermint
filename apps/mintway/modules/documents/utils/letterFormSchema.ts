/**
 * Schemas for the letter documents — Letter of Recommendation (LOR) and Medium of
 * Instruction (MOI). Each institution variant is created by `createLorForm` /
 * `createMoiForm` with a bag of prefilled constants (institution name, letterhead title,
 * recommender contacts, …). These builders turn that bag into a `WodaFormSchema` rendered
 * by the shared `WodaForm`, so the old factory's problems are gone: fields render once
 * (no snake_case duplicates), controls fit the data, and saved content prefills on edit.
 */

import type { WodaField, WodaFormSchema } from "./wodaFormSchema";

/** Personal honorifics (students, parents). */
const HONORIFICS = ["Mr.", "Mrs.", "Ms.", "Miss"];
/** Academic honorifics for a recommender. */
const ACADEMIC_HONORIFICS = [
  "Dr.",
  "Er.",
  "Prof.",
  "Asst. Prof.",
  "Mr.",
  "Mrs.",
];

const PRONOUNS = [
  { label: "He / him", value: "him" },
  { label: "She / her", value: "her" },
];

type LetterConstants = Record<string, unknown>;

/** A schema field tagged with its section and whether it always shows. */
interface LetterField extends WodaField {
  section: string;
  /** When false, the field renders only if the variant supplies it as a constant. */
  always?: boolean;
}

const LOR_SECTIONS = ["Letter", "Student", "Course", "Recommender"];

const LOR_FIELDS: LetterField[] = [
  // Letter
  {
    section: "Letter",
    name: "lor_ref_no",
    label: "Reference no.",
    placeholder: "079/80-1234",
    half: true,
    always: true,
  },
  {
    section: "Letter",
    name: "lor_letter_no",
    label: "Letter no.",
    placeholder: "512",
    optional: true,
    half: true,
    always: true,
  },
  {
    section: "Letter",
    name: "lor_date",
    label: "Issue date (A.D.)",
    control: "date-ad",
    always: true,
  },
  // Note: institution_name, lor_title, lor_salutation, institution_subname and
  // institution_address are NOT editable fields. Each LOR template is hardcoded per
  // institution; institution_name + lor_title are only ROUTER keys (TemplateLor switches
  // on them) and the rest are never printed. They are baked into the saved content by
  // createLorForm instead, so editing them can't blank a letter or misroute it.
  // Student
  {
    section: "Student",
    name: "student_honorific",
    label: "Honorific",
    control: "combobox",
    options: HONORIFICS,
    defaultValue: "Mr.",
    placeholder: "Mr.",
    half: true,
    always: true,
  },
  {
    section: "Student",
    name: "student_name",
    label: "Full name",
    placeholder: "Gita Kumari Shrestha",
    required: true,
    half: true,
    always: true,
  },
  {
    section: "Student",
    name: "student_first_name",
    label: "First name",
    description: "Used where the letter refers to the student informally.",
    placeholder: "Gita",
    half: true,
    always: true,
  },
  {
    section: "Student",
    name: "student_last_name",
    label: "Last name",
    description: "Used for the 'Mr. Surname' style.",
    placeholder: "Shrestha",
    half: true,
    always: true,
  },
  {
    section: "Student",
    name: "student_pronoun",
    label: "Pronoun",
    control: "segmented",
    options: PRONOUNS,
    defaultValue: "him",
    always: true,
  },
  // Student — per-variant (opted in by the institution's constants)
  {
    section: "Student",
    name: "father_honorific",
    label: "Father honorific",
    control: "combobox",
    options: HONORIFICS,
    placeholder: "Mr.",
    half: true,
  },
  {
    section: "Student",
    name: "father_name",
    label: "Father name",
    placeholder: "Hari Bahadur Shrestha",
    half: true,
  },
  {
    section: "Student",
    name: "student_address",
    label: "Student address",
    control: "textarea",
    placeholder: "Birendranagar-5, Surkhet",
  },
  {
    section: "Student",
    name: "student_registration_no",
    label: "Registration no.",
    placeholder: "2078-BBA-123",
    half: true,
  },
  {
    section: "Student",
    name: "student_dob",
    label: "Date of birth (A.D.)",
    control: "date-ad",
    half: true,
  },
  {
    section: "Student",
    name: "grade",
    label: "Grade / class completed",
    placeholder: "12",
    half: true,
  },
  {
    section: "Student",
    name: "year_of_completion",
    label: "Year of completion",
    placeholder: "2081",
    half: true,
  },
  {
    section: "Student",
    name: "qualification",
    label: "Qualification",
    placeholder: "Diploma in Civil Engineering",
    half: true,
  },
  {
    section: "Student",
    name: "qualification_year",
    label: "Qualification year",
    placeholder: "2081",
    half: true,
  },
  // Course & study
  {
    section: "Course",
    name: "program",
    label: "Program",
    placeholder: "BBA",
    half: true,
  },
  {
    section: "Course",
    name: "program_full_name",
    label: "Program full name",
    placeholder: "Bachelor of Business Administration",
    half: true,
  },
  {
    section: "Course",
    name: "degree_name",
    label: "Degree name",
    placeholder: "Bachelor's degree",
    half: true,
  },
  {
    section: "Course",
    name: "subject",
    label: "Subject",
    placeholder: "Science",
    half: true,
  },
  {
    section: "Course",
    name: "study_field",
    label: "Field of study",
    placeholder: "Management",
    half: true,
  },
  {
    section: "Course",
    name: "target_program",
    label: "Target program",
    placeholder: "Master's degree",
    half: true,
  },
  {
    section: "Course",
    name: "study_duration",
    label: "Study duration (in words)",
    description: "Number of years, spelled out.",
    placeholder: "three",
    half: true,
  },
  {
    section: "Course",
    name: "study_year_start",
    label: "Study start year",
    placeholder: "2021",
    half: true,
  },
  {
    section: "Course",
    name: "academic_year_start",
    label: "Academic year start",
    placeholder: "2021",
    half: true,
  },
  {
    section: "Course",
    name: "academic_year_end",
    label: "Academic year end",
    placeholder: "2024",
    half: true,
  },
  {
    section: "Course",
    name: "graduation_year",
    label: "Graduation year",
    placeholder: "2024",
    half: true,
  },
  {
    section: "Course",
    name: "teaching_semesters",
    label: "Teaching semesters",
    placeholder: "8",
    half: true,
  },
  {
    section: "Course",
    name: "teaching_subjects",
    label: "Teaching subjects",
    control: "textarea",
    placeholder: "Programming, Databases",
  },
  {
    section: "Course",
    name: "student_interests",
    label: "Student interests",
    control: "textarea",
    placeholder: "robotics, mathematics",
  },
  // Recommender
  {
    section: "Recommender",
    name: "recommender_honorific",
    label: "Honorific",
    control: "combobox",
    options: ACADEMIC_HONORIFICS,
    placeholder: "Dr.",
    half: true,
    always: true,
  },
  {
    section: "Recommender",
    name: "recommender_name",
    label: "Name",
    placeholder: "Hari Prasad Sharma",
    required: true,
    half: true,
    always: true,
  },
  {
    section: "Recommender",
    name: "recommender_title",
    label: "Title / position",
    placeholder: "Principal",
    always: true,
  },
  {
    section: "Recommender",
    name: "recommender_dept",
    label: "Department",
    placeholder: "Management",
    optional: true,
    always: true,
  },
  {
    section: "Recommender",
    name: "recommender_contact",
    label: "Contact number",
    placeholder: "081-540076",
    optional: true,
    half: true,
    always: true,
  },
  {
    section: "Recommender",
    name: "recommender_email",
    label: "Email",
    placeholder: "principal@college.edu.np",
    optional: true,
    half: true,
    always: true,
  },
];

const MOI_SECTIONS = [
  "Letter",
  "Institution",
  "Student",
  "Program",
  "Signatory",
];

const MOI_FIELDS: LetterField[] = [
  // Letter
  {
    section: "Letter",
    name: "moi_ref_no",
    label: "Reference no.",
    placeholder: "079/80-1234",
    half: true,
    always: true,
  },
  {
    section: "Letter",
    name: "moi_letter_no",
    label: "Letter no.",
    placeholder: "512",
    optional: true,
    half: true,
  },
  {
    section: "Letter",
    name: "moi_date",
    label: "Issue date (A.D.)",
    control: "date-ad",
    always: true,
  },
  // Institution
  {
    section: "Institution",
    name: "institution_name",
    label: "Institution name",
    placeholder: "Global College of Management",
    always: true,
  },
  {
    section: "Institution",
    name: "institution_address",
    label: "Institution address",
    control: "textarea",
    placeholder: "Baneshwor, Kathmandu",
    always: true,
  },
  // Student
  {
    section: "Student",
    name: "student_honorific",
    label: "Honorific",
    control: "combobox",
    options: HONORIFICS,
    defaultValue: "Mr.",
    placeholder: "Mr.",
    half: true,
    always: true,
  },
  {
    section: "Student",
    name: "student_name",
    label: "Full name",
    placeholder: "Gita Kumari Shrestha",
    required: true,
    half: true,
    always: true,
  },
  {
    section: "Student",
    name: "student_last_name",
    label: "Last name",
    description: "Used for the 'Mr. Surname' style.",
    placeholder: "Shrestha",
    half: true,
    always: true,
  },
  {
    section: "Student",
    name: "student_pronoun",
    label: "Pronoun",
    control: "segmented",
    options: PRONOUNS,
    defaultValue: "him",
    half: true,
    always: true,
  },
  {
    section: "Student",
    name: "father_honorific",
    label: "Father honorific",
    control: "combobox",
    options: HONORIFICS,
    placeholder: "Mr.",
    half: true,
  },
  {
    section: "Student",
    name: "father_name",
    label: "Father name",
    placeholder: "Hari Bahadur Shrestha",
    half: true,
  },
  {
    section: "Student",
    name: "student_address",
    label: "Student address",
    control: "textarea",
    placeholder: "Birendranagar-5, Surkhet",
  },
  {
    section: "Student",
    name: "student_dob",
    label: "Date of birth (A.D.)",
    control: "date-ad",
  },
  {
    section: "Student",
    name: "student_registration_no",
    label: "Registration no.",
    placeholder: "2078-BBA-123",
    half: true,
  },
  {
    section: "Student",
    name: "student_cgpa",
    label: "CGPA / GPA",
    placeholder: "3.75",
    half: true,
  },
  {
    section: "Student",
    name: "completion_year_bs",
    label: "Completion year (B.S.)",
    placeholder: "2081",
    half: true,
  },
  {
    section: "Student",
    name: "completion_year_ad",
    label: "Completion year (A.D.)",
    placeholder: "2024",
    half: true,
  },
  // Program
  {
    section: "Program",
    name: "program",
    label: "Program",
    placeholder: "BBA",
    half: true,
  },
  {
    section: "Program",
    name: "study_duration",
    label: "Study duration (in words)",
    description: "Number of years, spelled out.",
    placeholder: "three",
    half: true,
  },
  {
    section: "Program",
    name: "study_year_start",
    label: "Study start year",
    placeholder: "2021",
    half: true,
  },
  {
    section: "Program",
    name: "study_year_end",
    label: "Study end year",
    placeholder: "2024",
    half: true,
  },
  {
    section: "Program",
    name: "academic_year_start",
    label: "Academic year start",
    placeholder: "2021",
    half: true,
  },
  {
    section: "Program",
    name: "academic_year_end",
    label: "Academic year end",
    placeholder: "2024",
    half: true,
  },
  {
    section: "Program",
    name: "graduation_year",
    label: "Graduation year",
    placeholder: "2024",
    half: true,
  },
  // Signatory
  {
    section: "Signatory",
    name: "signatory_name",
    label: "Name",
    placeholder: "Amba Datt Joshi",
    required: true,
    always: true,
  },
  {
    section: "Signatory",
    name: "signatory_contact",
    label: "Contact number",
    placeholder: "9801234567",
    optional: true,
    half: true,
    always: true,
  },
  {
    section: "Signatory",
    name: "signatory_email",
    label: "Email",
    placeholder: "principal@college.edu.np",
    optional: true,
    half: true,
    always: true,
  },
];

/** Build a schema from a field catalogue: keep always-on fields plus any the variant
 *  supplies, prefill supplied constants as defaults, and group into ordered sections. */
function buildSchema(
  catalogue: LetterField[],
  sectionOrder: string[],
  constants: LetterConstants,
): WodaFormSchema {
  const included = catalogue.filter(
    (field) => field.always || field.name in constants,
  );

  const toField = (field: LetterField): WodaField => ({
    ...field,
    defaultValue:
      field.name in constants ? constants[field.name] : field.defaultValue,
  });

  const sections = sectionOrder
    .map((title) => ({
      title,
      fields: included.filter((field) => field.section === title).map(toField),
    }))
    .filter((section) => section.fields.length > 0);

  return { sections };
}

export function buildLorSchema(constants: LetterConstants): WodaFormSchema {
  return buildSchema(LOR_FIELDS, LOR_SECTIONS, constants);
}

export function buildMoiSchema(constants: LetterConstants): WodaFormSchema {
  return buildSchema(MOI_FIELDS, MOI_SECTIONS, constants);
}
