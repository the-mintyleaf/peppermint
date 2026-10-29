export interface LanguageTestsFieldProps {
  /**
   * Dot path of the `LanguageTestFormRow[]` inside the FormWrapper form —
   * `"language_certificates"` (lead) or `"language_tests"` (applicant).
   */
  path: string;
  /** Most rows allowed (a lead: `LEAD_CERTIFICATE_LIMIT` = 10). Omit for no cap. */
  maxCount?: number;
  /** Section heading. Defaults to "Language tests". */
  label?: string;
  /** Helper line under the heading. */
  description?: string;
  disabled?: boolean;
  /** z-index for Select / date popovers when the form sits in a raised layer. */
  popoverZIndex?: number;
}
