import { dayjs } from "@peppermint/ui";
import type {
  AcceptedExtension,
  BsDate,
  FileCategory,
  FileOwnerScope,
} from "./uploadedFiles.types";

/** Exactly 10,485,760 bytes — checked client-side before submit (§5/§7). */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** The seven accepted extensions (§5). */
export const ACCEPTED_EXTENSIONS: AcceptedExtension[] = [
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "docx",
  "xlsx",
];

/** Mantine `FileInput`'s `accept` prop — a comma-separated extension list. */
export const ACCEPTED_FILE_INPUT_ACCEPT = ACCEPTED_EXTENSIONS.map(
  (ext) => `.${ext}`,
).join(",");

/**
 * Image categories eligible for an inline thumbnail preview. There is no
 * preview/thumbnail endpoint (§9) — the only way to show one is to fetch the
 * bytes and build an object URL (`useFileBlob`), so this is deliberately
 * restricted to the two categories where that's worth the extra request.
 */
export const PREVIEWABLE_CATEGORIES = new Set<FileCategory>([
  "photograph",
  "signature_image",
]);

/**
 * Resolve the single owner key set on a scope object. Exactly one is always
 * set — a database constraint on the backend, not only validation (§4).
 * Throws rather than silently uploading against the wrong/no owner.
 */
export function getOwnerEntry(scope: FileOwnerScope): [string, string] {
  const entry = Object.entries(scope).find(([, value]) => Boolean(value));
  if (!entry) {
    throw new Error(
      "uploaded-files: exactly one owner key must be set on `scope`.",
    );
  }
  return entry as [string, string];
}

/** User-facing date display; appends the BS sibling's `display` when present (§3 — read either, never recompute). */
export function formatFileDate(
  gregorian: string | null | undefined,
  bs?: BsDate | null,
): string {
  if (!gregorian) return "—";
  const formatted = dayjs(gregorian).format("MMM D, YYYY");
  return bs?.display ? `${formatted} (${bs.display})` : formatted;
}

/** ISO datetime → readable local string, `—` when null. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return dayjs(value).format("MMM D, YYYY h:mm A");
}

/** Human file size, e.g. "482 KB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
