import { signatureSourceSuffix } from "@/modules/admin/signatures";
import type { Signature } from "../../documents.types";

/**
 * Options for the certificate's Instructor / Managing Director pickers, shared
 * by the Customizations panel and the Edit-fields modal so the two can never
 * disagree about what a signer is called.
 *
 * Two deliberate choices:
 *
 * - **Annotate, don't filter.** A signatory with no image still appears, marked
 *   "(no image)". The server accepts them, an operator may be preparing a
 *   certificate whose signature arrives later, and hiding a name they can see
 *   in the signature manager would read as a bug.
 * - **The `role` is shown but never filtered on.** It is free text, and a
 *   director may legitimately sign as the instructor — the contract is explicit
 *   that a picker must not narrow by it.
 */
export function certificateSignatureOptions(signatures: Signature[]) {
  return [
    { value: "", label: "Blank" },
    ...signatures.map((sig) => ({
      value: sig.id,
      label: `${sig.name}${sig.role ? ` — ${sig.role}` : ""}${signatureSourceSuffix(sig.signature_source)}`,
    })),
  ];
}
