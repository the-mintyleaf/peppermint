/**
 * Re-exported from `modules/documents` so the certificate signatory picker and this cell
 * share one verdict. It cannot live here: `modules/admin/signatures` imports from
 * `modules/documents`, so the reverse import would be a cycle.
 */
export { formatValidityRange, getSignatureValidity } from "@/modules/documents";
