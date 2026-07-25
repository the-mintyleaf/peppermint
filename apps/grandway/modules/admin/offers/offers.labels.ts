import type {
  ConditionStatus,
  ConditionType,
  DecisionOutcome,
  OfferStatus,
  OfferType,
  QualificationLevel,
  TuitionFeePeriod,
} from "./offers.types";

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  draft: "Draft",
  issued: "Issued",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  deferred: "Deferred",
  expired: "Expired",
};

/**
 * `draft`/`issued` are the active states; each terminal state gets a distinct
 * colour so an offer's outcome reads at a glance from the badge alone.
 */
export const OFFER_STATUS_COLORS: Record<OfferStatus, string> = {
  draft: "gray",
  issued: "blue",
  accepted: "green",
  rejected: "red",
  withdrawn: "orange",
  deferred: "grape",
  expired: "dark",
};

export const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  conditional: "Conditional",
  unconditional: "Unconditional",
};

export const QUALIFICATION_LEVEL_LABELS: Record<QualificationLevel, string> = {
  school: "School",
  certificate: "Certificate",
  diploma: "Diploma",
  bachelors: "Bachelor's",
  postgraduate_diploma: "Postgraduate Diploma",
  masters: "Master's",
  phd: "PhD",
  other: "Other",
};

export const TUITION_FEE_PERIOD_LABELS: Record<TuitionFeePeriod, string> = {
  per_year: "Per year",
  per_semester: "Per semester",
  total_program: "Total program",
};

export const CONDITION_TYPE_LABELS: Record<ConditionType, string> = {
  academic_result: "Academic result",
  english_test: "English test",
  document_submission: "Document submission",
  deposit_payment: "Deposit payment",
  interview: "Interview",
  identity_confirmation: "Identity confirmation",
  other: "Other",
};

export const CONDITION_STATUS_LABELS: Record<ConditionStatus, string> = {
  pending: "Pending",
  satisfied: "Satisfied",
  waived: "Waived",
  not_applicable: "Not applicable",
};

export const CONDITION_STATUS_COLORS: Record<ConditionStatus, string> = {
  pending: "orange",
  satisfied: "green",
  waived: "blue",
  not_applicable: "gray",
};

export const DECISION_OUTCOME_LABELS: Record<DecisionOutcome, string> = {
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  deferred: "Deferred",
  expired: "Expired",
};

// ── Select option helpers ────────────────────────────────────────────────────

export const OFFER_TYPE_OPTIONS = (
  Object.keys(OFFER_TYPE_LABELS) as OfferType[]
).map((value) => ({ value, label: OFFER_TYPE_LABELS[value] }));

export const OFFER_STATUS_OPTIONS = (
  Object.keys(OFFER_STATUS_LABELS) as OfferStatus[]
).map((value) => ({ value, label: OFFER_STATUS_LABELS[value] }));

export const QUALIFICATION_LEVEL_OPTIONS = (
  Object.keys(QUALIFICATION_LEVEL_LABELS) as QualificationLevel[]
).map((value) => ({ value, label: QUALIFICATION_LEVEL_LABELS[value] }));

export const TUITION_FEE_PERIOD_OPTIONS = (
  Object.keys(TUITION_FEE_PERIOD_LABELS) as TuitionFeePeriod[]
).map((value) => ({ value, label: TUITION_FEE_PERIOD_LABELS[value] }));

export const CONDITION_TYPE_OPTIONS = (
  Object.keys(CONDITION_TYPE_LABELS) as ConditionType[]
).map((value) => ({ value, label: CONDITION_TYPE_LABELS[value] }));

export const CONDITION_STATUS_OPTIONS = (
  Object.keys(CONDITION_STATUS_LABELS) as ConditionStatus[]
).map((value) => ({ value, label: CONDITION_STATUS_LABELS[value] }));

export const DECISION_OUTCOME_OPTIONS = (
  Object.keys(DECISION_OUTCOME_LABELS) as DecisionOutcome[]
).map((value) => ({ value, label: DECISION_OUTCOME_LABELS[value] }));
