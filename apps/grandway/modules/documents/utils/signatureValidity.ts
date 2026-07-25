import type { Signature } from "../documents.types";

/** Where a signatory sits in its validity window today. */
export type SignatureValidity =
  | "unbounded"
  | "not_yet_valid"
  | "in_window"
  | "expired";

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
 * Both bounds are optional and inclusive; with neither set the signatory is unbounded,
 * which is the normal case and not a problem to flag. Same-length `YYYY-MM-DD` strings
 * compare correctly lexicographically.
 *
 * This is a **frontend advisory only** — the backend enforces `is_active` + non-archived
 * on a referencing document (`signature.md` §4), not the date window. So an out-of-window
 * signatory is surfaced and never silently hidden: hiding it would remove a choice the
 * server still accepts, and the operator may legitimately be preparing a back-dated
 * document.
 *
 * Lives here rather than beside the admin list cell because `modules/admin/signatures`
 * already imports from `modules/documents`; putting it there and importing it from the
 * certificate picker would close a cycle.
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

/** Suffix for a picker option, e.g. "Dr Sharma (expired)". Empty when in window. */
export function signatureValiditySuffix(signature: Signature): string {
  const validity = getSignatureValidity(signature);
  if (validity === "expired") return " (expired)";
  if (validity === "not_yet_valid") return " (not yet valid)";
  return "";
}
