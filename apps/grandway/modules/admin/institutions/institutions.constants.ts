// Shared label / color / option maps for the catalogue enums (§5). Reused across
// columns, forms, and the detail drawer so a single edit keeps them in sync.

import type {
  AvailabilityStatus,
  InstitutionType,
  QualificationLevel,
  TuitionFeePeriod,
} from "./institutions.types";

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  active: "Active",
  paused: "Paused",
  seasonal: "Seasonal",
  inactive: "Withdrawn",
};

export const AVAILABILITY_COLORS: Record<AvailabilityStatus, string> = {
  active: "teal",
  seasonal: "blue",
  paused: "yellow",
  inactive: "gray",
};

export const AVAILABILITY_OPTIONS: {
  value: AvailabilityStatus;
  label: string;
}[] = (Object.keys(AVAILABILITY_LABELS) as AvailabilityStatus[]).map(
  (value) => ({
    value,
    label: AVAILABILITY_LABELS[value],
  }),
);

/** Non-`active` statuses require an availability note (INTEGRATION.md §3). */
export function statusRequiresNote(status: AvailabilityStatus): boolean {
  return status !== "active";
}

export const INSTITUTION_TYPE_LABELS: Record<InstitutionType, string> = {
  university: "University",
  college: "College",
  polytechnic: "Polytechnic",
  language_school: "Language school",
  other: "Other",
};

export const INSTITUTION_TYPE_OPTIONS: {
  value: InstitutionType;
  label: string;
}[] = (Object.keys(INSTITUTION_TYPE_LABELS) as InstitutionType[]).map(
  (value) => ({ value, label: INSTITUTION_TYPE_LABELS[value] }),
);

export const QUALIFICATION_LEVEL_LABELS: Record<QualificationLevel, string> = {
  school: "School",
  certificate: "Certificate",
  diploma: "Diploma",
  bachelors: "Bachelor's",
  postgraduate_diploma: "Postgraduate diploma",
  masters: "Master's",
  phd: "PhD",
  other: "Other",
};

export const QUALIFICATION_LEVEL_OPTIONS: {
  value: QualificationLevel;
  label: string;
}[] = (Object.keys(QUALIFICATION_LEVEL_LABELS) as QualificationLevel[]).map(
  (value) => ({ value, label: QUALIFICATION_LEVEL_LABELS[value] }),
);

export const FEE_PERIOD_LABELS: Record<
  Exclude<TuitionFeePeriod, "">,
  string
> = {
  per_year: "per year",
  per_semester: "per semester",
  total_program: "total program",
};

export const FEE_PERIOD_OPTIONS: {
  value: Exclude<TuitionFeePeriod, "">;
  label: string;
}[] = (Object.keys(FEE_PERIOD_LABELS) as Exclude<TuitionFeePeriod, "">[]).map(
  (value) => ({ value, label: FEE_PERIOD_LABELS[value] }),
);

/** Money is a decimal string — render with its currency; null tuition → "—". */
export function formatTuition(
  amount: string | null,
  currency: string,
  feePeriod: TuitionFeePeriod,
): string {
  if (amount == null || amount === "") return "—";
  const period = feePeriod ? ` ${FEE_PERIOD_LABELS[feePeriod]}` : "";
  const money = currency ? `${currency} ${amount}` : amount;
  return `${money}${period}`;
}
