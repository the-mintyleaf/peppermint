export interface ApplicantProfileModalProps {
  /** The applicant whose profile is open, or `null` when the modal is closed. */
  applicantId: string | null;
  onClose: () => void;
}

export interface ApplicantProfileBodyProps {
  applicantId: string;
  onClose: () => void;
  /** Report edit-form open state so the parent can hold its close affordances. */
  onEditingChange: (editing: boolean) => void;
}
