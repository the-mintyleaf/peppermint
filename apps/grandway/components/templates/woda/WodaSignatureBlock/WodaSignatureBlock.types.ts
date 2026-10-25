import type { WodaValues } from "../wodaFormat";

export interface WodaSignatureBlockProps {
  values: WodaValues;
  /** Space above the dotted line, left for the signature and stamp. */
  gap?: string;
}
