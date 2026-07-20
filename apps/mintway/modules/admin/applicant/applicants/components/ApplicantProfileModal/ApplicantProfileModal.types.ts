export interface ApplicantProfileModalProps {
  /** The applicant whose profile is open, or `null` when the modal is closed. */
  applicantId: string | null;
  onClose: () => void;
}

export interface ApplicantProfileBodyProps {
  applicantId: string;
}
