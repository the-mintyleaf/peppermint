"use client";

import { useCapabilities } from "@/config/access";
import { useSignatoryList } from "@/modules/admin/signatures";

/**
 * How many signatories exist that the certificate picker will not offer —
 * everything that is not `active`.
 *
 * Only used to explain an empty picker, so the query is **disabled unless it is
 * actually needed**: a certificate with signers available never pays for it.
 * Gated on `signatories` as well, since the signatory library is Admin-only on
 * every route including reads, and `documentWrite` is a different rule that
 * merely coincides today.
 */
export function useDraftSignatoryCount(): number {
  const capabilities = useCapabilities();
  const { data } = useSignatoryList({}, { enabled: capabilities.signatories });
  return (data?.data ?? []).filter((s) => !s.is_active).length;
}
