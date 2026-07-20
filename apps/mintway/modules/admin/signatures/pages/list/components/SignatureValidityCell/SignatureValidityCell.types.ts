import type { Signature } from "@/modules/documents";

/** Where a signatory sits in its `valid_from`/`valid_to` window today. */
export type { SignatureValidity } from "@/modules/documents";

export interface SignatureValidityCellProps {
  signature: Signature;
}
