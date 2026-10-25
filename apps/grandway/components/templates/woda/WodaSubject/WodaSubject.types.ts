export interface WodaSubjectProps {
  /** The letter's subject, e.g. "Birth Verification Certificate". */
  title: string;
  /**
   * `formal` — "SUBJECT: …" in capitals over "TO WHOM IT MAY CONCERN" (Japan letters).
   * `plain` — "Subject: …" in title case on one line (English-country letters).
   */
  variant: "formal" | "plain";
}
