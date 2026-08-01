export interface DocumentPhotoFieldProps {
  /** The document's applicant. `null` on a standalone document, which has none. */
  applicantId: string | null;
  /** Name behind the initials placeholder — the applicant's, when known. */
  name?: string;
}
