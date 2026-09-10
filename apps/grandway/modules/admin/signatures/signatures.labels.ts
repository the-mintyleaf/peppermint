import type { SignatoryStatus, SignatorySource } from "./signatures.types";

/** §5 — three values. "Retired" rather than "Inactive": the record is kept, and the UI should say so. */
export const SIGNATORY_STATUS_LABELS: Record<SignatoryStatus, string> = {
  draft: "Draft",
  active: "Active",
  inactive: "Retired",
};

export const SIGNATORY_STATUS_COLORS: Record<SignatoryStatus, string> = {
  draft: "gray",
  active: "green",
  inactive: "orange",
};

/**
 * What each status means for the one thing an operator actually cares about —
 * whether this signer can be put on a certificate.
 */
export const SIGNATORY_STATUS_HINTS: Record<SignatoryStatus, string> = {
  draft: "Not offered in the certificate picker until activated.",
  active: "Offered in the certificate picker.",
  inactive:
    "No longer offered, but certificates that already name this signer still render them.",
};

/** §5 — which of the two possible sources is in force. Never null; `none` means a blank slot. */
export const SIGNATURE_SOURCE_LABELS: Record<SignatorySource, string> = {
  uploaded: "Uploaded image",
  url: "External link",
  none: "No image",
};

/**
 * The picker's option suffix. An operator choosing a signer with no image is
 * about to render a blank signature block, and should learn that here rather
 * than after printing. `url` and `uploaded` both render, so neither is flagged.
 */
export function signatureSourceSuffix(source: SignatorySource): string {
  return source === "none" ? " (no image)" : "";
}

/** Accepted upload extensions — **narrower than the file ledger's seven types** (§7). Do not widen. */
export const SIGNATURE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"] as const;

/** Mantine `FileInput`'s `accept` prop — a comma-separated MIME list. */
export const SIGNATURE_FILE_INPUT_ACCEPT =
  "image/png,image/jpeg,image/webp" as const;

/** 10 MB, the file ledger's cap (§7). */
export const MAX_SIGNATURE_SIZE_BYTES = 10 * 1024 * 1024;
