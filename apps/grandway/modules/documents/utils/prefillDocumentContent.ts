/**
 * Seeds a NEW letter's content from the applicant prefill
 * (`GET /documents/prefill/<applicant_id>/`, `documentPrefill.types.ts`).
 *
 * Pure. Three rules keep it safe:
 * 1. **Only into fields the letter's form shows** (its `WodaFormSchema`), or keys
 *    its default content already holds — so every seeded value is editable.
 * 2. **Only into an empty value.** A default the letter ships with (legal basis,
 *    institution constants, a stock relation) is never overwritten.
 * 3. **Nothing is invented.** A `null` relative or address, or a blank part,
 *    leaves the field as it was. Honorifics follow gender only where that is
 *    unambiguous (see `honorificFor`).
 *
 * The backend does not know template keys (`documents/INTEGRATION.md` §7, prefill
 * notes): this mapping is the frontend's.
 */

import type {
  DocumentPrefill,
  PrefillAddress,
  PrefillRelative,
} from "../documentPrefill.types";
import type { BsDate, DocumentContent } from "../documents.types";
import type { WodaFormSchema } from "./wodaFormSchema";

type Values = Record<string, unknown>;

/**
 * "Birendranagar-5, Surkhet" — the way the ward office writes an address (and
 * every address field's placeholder). Falls back to the backend's `formatted`
 * line when there is no municipality to anchor it.
 */
export function wardAddress(address: PrefillAddress | null): string {
  if (!address) return "";
  const { municipality, wardNo, district, formatted } = address;
  if (!municipality.trim()) return formatted.trim();
  const place = wardNo.trim() ? `${municipality}-${wardNo}` : municipality;
  return [place, district].filter((part) => part.trim()).join(", ");
}

/** `{ year: 2055, month: 5, day: 20 }` → `"2055/05/20"`, the letters' B.S. format. */
export function bsDateText(date: BsDate | null): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.year}/${pad(date.month)}/${pad(date.day)}`;
}

const nameOf = (person: PrefillRelative | null) => person?.name ?? "";
const citizenshipOf = (person: PrefillRelative | null) =>
  person?.citizenshipNo ?? "";

/** Every content key the prefill can fill, across the Woda, LOR and MOI letters. */
function candidateValues(prefill: DocumentPrefill): Values {
  const { applicant: a, father, mother, grandfather, grandmother } = prefill;
  const permanent = wardAddress(a.permanentAddress);
  return {
    // Woda — applicant, identity numbers, birth
    applicant_name: a.fullName,
    applicant_permanent_address: permanent,
    applicant_citizenship: a.citizenshipNo,
    applicant_nid: a.nationalIdNo,
    applicant_passport: a.passportNo,
    applicant_dob: a.dateOfBirth ?? "",
    applicant_dob_bs: bsDateText(a.dateOfBirthBs),
    applicant_surname: a.lastName,
    // Woda — parents and grandparents
    applicant_father_name: nameOf(father),
    applicant_father_citizenship: citizenshipOf(father),
    applicant_mother_name: nameOf(mother),
    applicant_mother_citizenship: citizenshipOf(mother),
    grandfather_name: nameOf(grandfather),
    grandmother_name: nameOf(grandmother),
    // Affidavit of financial support (+ LOR/MOI share the student/father keys)
    student_name: a.fullName,
    student_citizenship_no: a.citizenshipNo,
    student_nid_no: a.nationalIdNo,
    student_passport_no: a.passportNo,
    father_name: nameOf(father),
    mother_name: nameOf(mother),
    permanent_address: permanent,
    // LOR / MOI
    student_first_name: a.firstName,
    student_last_name: a.lastName,
    student_address: permanent || wardAddress(a.currentAddress),
    student_dob: a.dateOfBirth ?? "",
  };
}

/**
 * The affidavit names its sponsor and three signatories by a stock relation
 * (Grandfather; Grandmother, Father, Mother). A name is seeded only while the
 * relation still reads that way — it is that person's name, not a guess at who
 * sponsors or signs.
 */
function relationSeeds(prefill: DocumentPrefill): {
  relationKey: string;
  relation: string;
  values: Values;
}[] {
  const { father, mother, grandfather, grandmother } = prefill;
  return [
    {
      relationKey: "sponsor_relation",
      relation: "grandfather",
      values: {
        sponsor_name: nameOf(grandfather),
        sponsor_citizenship_no: citizenshipOf(grandfather),
      },
    },
    {
      relationKey: "signer1_relation",
      relation: "grandmother",
      values: { signer1_name: nameOf(grandmother) },
    },
    {
      relationKey: "signer2_relation",
      relation: "father",
      values: { signer2_name: nameOf(father) },
    },
    {
      relationKey: "signer3_relation",
      relation: "mother",
      values: { signer3_name: nameOf(mother) },
    },
  ];
}

/** A seeded name brings its honorific's form default when the honorific is blank. */
const HONORIFIC_FOR_NAME: Record<string, string> = {
  applicant_father_name: "applicant_father_honorific",
  applicant_mother_name: "applicant_mother_honorific",
  grandfather_name: "grandfather_honorific",
  grandmother_name: "grandmother_honorific",
  father_name: "father_honorific",
  mother_name: "mother_honorific",
  sponsor_name: "sponsor_honorific",
};

const MALE_HONORIFICS = ["mr.", "mr"];
const FEMALE_HONORIFICS = ["mrs.", "mrs", "ms.", "ms", "miss"];

/**
 * The honorific for the applicant's gender. A man is "Mr."; a woman keeps a
 * female honorific she already has (the affidavit's stock "Miss") and otherwise
 * gets "Ms." — marital status is not on the file, and "Ms." does not need it.
 * Any other value ("Dr.", "Late", a custom one) is left alone, as is everything
 * for a gender the file does not state.
 */
function honorificFor(current: unknown, male: boolean): string | null {
  const value = typeof current === "string" ? current.trim().toLowerCase() : "";
  const own = male ? MALE_HONORIFICS : FEMALE_HONORIFICS;
  const other = male ? FEMALE_HONORIFICS : MALE_HONORIFICS;
  if (own.includes(value)) return null;
  if (value && !other.includes(value)) return null;
  return male ? "Mr." : "Ms.";
}

function genderValues(prefill: DocumentPrefill, content: Values): Values {
  const { gender } = prefill.applicant;
  if (gender !== "male" && gender !== "female") return {};
  const male = gender === "male";
  const out: Values = {
    applicant_gender: male ? "Male" : "Female",
    student_pronoun: male ? "him" : "her",
    student_kinship: male ? "son" : "daughter",
  };
  for (const key of ["applicant_honorific", "student_honorific"]) {
    const next = honorificFor(content[key], male);
    if (next) out[key] = next;
  }
  return out;
}

function isBlank(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  );
}

/** Writes the honorific's form default ("Mr.", "Mrs.") beside a seeded name, if blank. */
function fillHonorific(
  out: Values,
  honorificKey: string | undefined,
  defaults: Map<string, unknown>,
): void {
  if (!honorificKey || !isBlank(out[honorificKey])) return;
  const fallback = defaults.get(honorificKey);
  if (typeof fallback === "string" && fallback.trim()) {
    out[honorificKey] = fallback;
  }
}

/** Field names a schema shows, with each field's default. */
function schemaDefaults(schema: WodaFormSchema): Map<string, unknown> {
  return new Map(
    schema.sections.flatMap((section) =>
      section.fields.map((field) => [field.name, field.defaultValue] as const),
    ),
  );
}

/** A file with nothing entered — used only to list the keys the mapping can fill. */
const EMPTY_PREFILL: DocumentPrefill = {
  applicant: {
    firstName: "",
    middleName: "",
    lastName: "",
    fullName: "",
    gender: "",
    dateOfBirth: null,
    dateOfBirthBs: null,
    nationality: "",
    citizenshipNo: "",
    citizenshipIssueDistrict: "",
    nationalIdNo: "",
    passportNo: "",
    permanentAddress: null,
    currentAddress: null,
    primaryEmail: "",
    primaryPhone: "",
  },
  father: null,
  mother: null,
  grandfather: null,
  grandmother: null,
  educations: [],
  languageTests: [],
  photoMediaId: null,
};

/** Content keys this module knows how to fill — for "is a prefill worth fetching?". */
const SEEDABLE_KEYS = new Set([
  ...Object.keys(candidateValues(EMPTY_PREFILL)),
  ...relationSeeds(EMPTY_PREFILL).flatMap((seed) => Object.keys(seed.values)),
]);

/** `true` when a letter with this form has at least one field the prefill fills. */
export function schemaUsesPrefill(schema: WodaFormSchema): boolean {
  return [...schemaDefaults(schema).keys()].some((name) =>
    SEEDABLE_KEYS.has(name),
  );
}

/**
 * `content` (a new letter's default content) with the prefill written into the
 * empty fields its form shows. Returns a new object; `content` is not mutated.
 */
export function seedContentFromPrefill(
  content: DocumentContent,
  prefill: DocumentPrefill,
  schema: WodaFormSchema,
): DocumentContent {
  const base = content as Values;
  const defaults = schemaDefaults(schema);
  const out: Values = { ...base };
  const owns = (key: string) => defaults.has(key) || key in base;

  const fill = (values: Values) => {
    for (const [key, value] of Object.entries(values)) {
      if (!owns(key) || isBlank(value) || !isBlank(out[key])) continue;
      out[key] = typeof value === "string" ? value.trim() : value;
      fillHonorific(out, HONORIFIC_FOR_NAME[key], defaults);
    }
  };

  fill(candidateValues(prefill));

  for (const seed of relationSeeds(prefill)) {
    const relation = out[seed.relationKey] ?? defaults.get(seed.relationKey);
    if (
      typeof relation === "string" &&
      relation.trim().toLowerCase() === seed.relation
    ) {
      fill(seed.values);
    }
  }

  // Gendered words replace a default rather than fill a blank, so they are
  // written directly — still only into keys the letter owns.
  for (const [key, value] of Object.entries(genderValues(prefill, out))) {
    if (owns(key)) out[key] = value;
  }

  return out as DocumentContent;
}
