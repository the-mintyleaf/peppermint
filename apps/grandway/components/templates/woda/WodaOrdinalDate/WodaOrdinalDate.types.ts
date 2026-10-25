export interface WodaOrdinalDateProps {
  /** An ISO date (or anything `new Date` parses). */
  value: unknown;
  /** Appends " A.D.". */
  withEra?: boolean;
}
