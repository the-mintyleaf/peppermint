import type { FileCategory, VerificationStatus } from "./uploadedFiles.types";

export const FILE_CATEGORY_LABELS: Record<FileCategory, string> = {
  passport: "Passport",
  photograph: "Photograph",
  academic_transcript: "Academic transcript",
  academic_certificate: "Academic certificate",
  test_score_report: "Test score report",
  offer_letter: "Offer letter",
  financial: "Financial",
  sponsorship: "Sponsorship",
  signature_image: "Signature image",
  generated_document: "Generated document",
  other: "Other",
};

export const FILE_CATEGORY_OPTIONS = (
  Object.keys(FILE_CATEGORY_LABELS) as FileCategory[]
).map((value) => ({ value, label: FILE_CATEGORY_LABELS[value] }));

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

/** `pending` is neutral, not a warning — every new upload starts here (§4). */
export const VERIFICATION_STATUS_COLORS: Record<VerificationStatus, string> = {
  pending: "orange",
  verified: "green",
  rejected: "red",
};

export const VERIFICATION_STATUS_OPTIONS = (
  Object.keys(VERIFICATION_STATUS_LABELS) as VerificationStatus[]
).map((value) => ({ value, label: VERIFICATION_STATUS_LABELS[value] }));

/** Verify accepts only these two — `pending` is a starting state, not a settable verdict (§5/§7). */
export const VERIFY_DECISION_OPTIONS = VERIFICATION_STATUS_OPTIONS.filter(
  (option) => option.value !== "pending",
);

export const UPLOAD_SOURCE_LABELS: Record<string, string> = {
  staff_upload: "Staff upload",
  system_generated: "System generated",
};
