import type { EducationFormRow } from "../../../../ApplicantForm.types";

export interface EducationRowProps {
  /** Row index inside `educations` — the row lives at `educations.<index>`. */
  index: number;
  row: EducationFormRow;
  onRemove: (index: number) => void;
}

/** One group of fields inside a row card. */
export interface EducationRowSectionProps {
  /** `educations.<index>` — the prefix every field path hangs off. */
  base: string;
  row: EducationFormRow;
}
