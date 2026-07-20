import type { Signature } from "@/modules/documents";
import type { SignatureValidity } from "./SignatureValidityCell.types";

/**
 * `YYYY-MM-DD` for today in the operator's own timezone. The bounds are calendar dates, not
 * instants, so comparing them against a UTC instant would flip the verdict for anyone whose
 * local date differs from UTC's — which is most of the day for Nepal (UTC+05:45).
 */
function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Where the signatory sits in its validity window *today*. Both bounds are optional and
 * inclusive; with neither set the signatory is unbounded, which is the normal case and not
 * a problem to flag. Same-length `YYYY-MM-DD` strings compare correctly lexicographically.
 *
 * Note this is a **frontend advisory only** — the backend enforces `is_active` +
 * non-archived on a referencing document (`signature.md` §4), not the date window. So an
 * expired signatory is surfaced, never silently hidden.
 */
export function getSignatureValidity(signature: Signature): SignatureValidity {
  const { validFrom, validTo } = signature;
  if (!validFrom && !validTo) return "unbounded";

  const today = todayIso();
  if (validFrom && today < validFrom) return "not_yet_valid";
  if (validTo && today > validTo) return "expired";
  return "in_window";
}

/** `2026-01-01 → 2026-12-31`, with an en dash for whichever end is open. */
export function formatValidityRange(signature: Signature): string {
  const { validFrom, validTo } = signature;
  if (!validFrom && !validTo) return "No limit";
  return `${validFrom ?? "—"} → ${validTo ?? "—"}`;
}
