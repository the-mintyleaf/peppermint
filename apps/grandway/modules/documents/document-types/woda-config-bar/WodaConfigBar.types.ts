import type { WodaContent } from "../../documents.types";

/** A print switch the WODA Customizations panel owns. */
export type WodaReferenceFlagKey = "show_refno" | "show_dispatch_no";

/** The number a print switch prints. */
export type WodaReferenceValueKey = "wodadoc_refno" | "dispatch_no";

/** Every content key the panel writes — and the only ones it ever writes. */
export type WodaReferenceKey = WodaReferenceFlagKey | WodaReferenceValueKey;

/** One header line: its switch, its number, and the copy for both controls. */
export interface WodaReferenceLine {
  showKey: WodaReferenceFlagKey;
  valueKey: WodaReferenceValueKey;
  switchLabel: string;
  inputLabel: string;
  placeholder: string;
}

/** A change from the panel: some of its four keys, never anything else. */
export type WodaReferenceChange = Partial<
  Record<WodaReferenceFlagKey, boolean> & Record<WodaReferenceValueKey, string>
>;

export interface WodaReferenceLineControlProps {
  line: WodaReferenceLine;
  content: WodaContent;
  disabled: boolean;
  onChange: (change: WodaReferenceChange) => void;
}
