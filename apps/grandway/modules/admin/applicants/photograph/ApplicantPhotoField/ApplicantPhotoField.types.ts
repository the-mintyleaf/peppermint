export interface ApplicantPhotoFieldProps {
  /** Whose photograph this edits. */
  applicantId: string;
  /** Name behind the initials placeholder and the image's alt text. */
  name: string;
  /**
   * Commit mode.
   * - `"immediate"` — picking a file uploads it straight away (the document
   *   forms, which have no applicant save of their own to ride along with).
   * - `"deferred"` — the picked file is handed to `onChange` and the embedding
   *   form uploads it on submit (the applicant edit form, so one Save covers
   *   the whole record).
   */
  mode: "immediate" | "deferred";
  /** `deferred` only — the file staged for upload, owned by the form. */
  value?: File | null;
  /** `deferred` only — receives the picked file, or `null` when cleared. */
  onChange?: (file: File | null) => void;
  /** Client-side validation message from the embedding form, if any. */
  error?: string | null;
  disabled?: boolean;
  /** Hides the field's own label/description; the embedding layout supplies them. */
  hideLabel?: boolean;
}
