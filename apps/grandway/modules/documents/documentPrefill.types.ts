import type { BsDate } from "./documents.types";

/**
 * `GET /api/v1/documents/prefill/<applicant_id>/` (`documents/INTEGRATION.md` §4
 * `DocumentPrefill`), mapped to app-native camelCase.
 *
 * A **seed**, never a source of truth: it is the applicant file at the moment the
 * form opened, nothing pushes later changes, and the name parts are a naive split
 * of `full_name` (compound surnames come out wrong). Every field it fills must stay
 * editable in the document's own form.
 */
export interface DocumentPrefill {
  applicant: PrefillApplicant;
  father: PrefillRelative | null;
  mother: PrefillRelative | null;
  grandfather: PrefillRelative | null;
  grandmother: PrefillRelative | null;
  educations: PrefillEducation[];
  languageTests: PrefillLanguageTest[];
  /** The applicant's newest current, non-archived photograph, or `null`. */
  photoMediaId: string | null;
}

/** The applicant file's own `gender` vocabulary (`applicants` §5). */
export type PrefillGender = "male" | "female" | "other" | "undisclosed" | "";

export interface PrefillApplicant {
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  gender: PrefillGender;
  /** `YYYY-MM-DD` or `null`. */
  dateOfBirth: string | null;
  dateOfBirthBs: BsDate | null;
  nationality: string;
  citizenshipNo: string;
  citizenshipIssueDistrict: string;
  nationalIdNo: string;
  passportNo: string;
  permanentAddress: PrefillAddress | null;
  currentAddress: PrefillAddress | null;
  primaryEmail: string;
  primaryPhone: string;
}

export interface PrefillAddress {
  province: string;
  district: string;
  municipality: string;
  wardNo: string;
  /** The street line. */
  tole: string;
  /** `tole, municipality-ward, district, province`, non-empty parts only. */
  formatted: string;
}

export interface PrefillRelative {
  name: string;
  citizenshipNo: string;
  occupation: string;
}

export interface PrefillEducation {
  level: string;
  qualification: string;
  institution: string;
  country: string;
  completionStatus: string;
  /** Decimal string, or `null`. */
  score: string | null;
  scoreType: string;
  gradingSystem: string;
  startYear: number | null;
  completionYear: number | null;
  /** `"bs"` or `"ad"` — which calendar the two years are in. */
  yearCalendar: string;
}

export interface PrefillLanguageTest {
  testType: string;
  overallScore: string | null;
  listeningScore: string | null;
  readingScore: string | null;
  writingScore: string | null;
  speakingScore: string | null;
  testDate: string | null;
  testDateBs: BsDate | null;
  certificateNumber: string;
  expiryDate: string | null;
  expiryDateBs: BsDate | null;
}
