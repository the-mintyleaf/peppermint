import type { Signature } from "@/modules/documents";

/** Where a signatory sits in its `valid_from`/`valid_to` window today. */
export type SignatureValidity =
  | "unbounded"
  | "not_yet_valid"
  | "in_window"
  | "expired";

export interface SignatureValidityCellProps {
  signature: Signature;
}
