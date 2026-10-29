export interface DocumentPhotoFieldProps {
  /** The document's applicant. `null` on a standalone document, which has none. */
  applicantId: string | null;
  /** Name behind the initials placeholder — the applicant's, when known. */
  name?: string;
  /**
   * Replaces the default caption ("…updates their profile and every other
   * document that shows it"). The certificate needs its own: it prints the
   * photograph stored with it, not whichever is current.
   */
  caption?: string;
}
