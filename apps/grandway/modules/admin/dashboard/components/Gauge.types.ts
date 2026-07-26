export interface GaugeProps {
  /** 0–100, or `null` when the denominator was 0 (renders "—" and an empty arc). */
  percent: number | null;
  /** What the rate measures, e.g. "Lead → Applicant". */
  label: string;
  /** The raw fraction behind the rate, e.g. "412 / 1,284". */
  caption: string;
}
