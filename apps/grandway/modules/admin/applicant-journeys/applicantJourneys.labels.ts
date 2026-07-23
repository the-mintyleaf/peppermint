import type {
  JourneyOutcome,
  JourneyStage,
  StudyLevel,
} from "./applicantJourneys.types";

export const STAGE_LABELS: Record<JourneyStage, string> = {
  planning: "Planning",
  profile_building: "Profile Building",
  shortlisting: "Shortlisting",
  applying: "Applying",
  offer_stage: "Offer Stage",
  visa_stage: "Visa Stage",
  completed: "Completed",
  closed: "Closed",
  deferred: "Deferred",
};

/**
 * One color family progressing `planning` → `visa_stage` (active work), then
 * a distinct color per terminal state so "how far/how it ended" reads at a
 * glance from the badge alone — never a substitute for reading `outcome`,
 * which is the only authoritative record of *why* a `closed` journey ended
 * (`CONCEPT.md` "Final outcome": "closed covers five different outcomes").
 */
export const STAGE_COLORS: Record<JourneyStage, string> = {
  planning: "blue",
  profile_building: "cyan",
  shortlisting: "teal",
  applying: "grape",
  offer_stage: "indigo",
  visa_stage: "violet",
  completed: "green",
  closed: "red",
  deferred: "orange",
};

export const OUTCOME_LABELS: Record<JourneyOutcome, string> = {
  successful: "Successful",
  withdrawn: "Withdrawn",
  rejected: "Rejected",
  not_qualified: "Not qualified",
  cancelled: "Cancelled",
  other: "Other",
};

export const STUDY_LEVEL_LABELS: Record<StudyLevel, string> = {
  school: "School",
  certificate: "Certificate",
  diploma: "Diploma",
  bachelors: "Bachelor's",
  postgraduate_diploma: "Postgraduate Diploma",
  masters: "Master's",
  phd: "PhD",
  other: "Other",
};
