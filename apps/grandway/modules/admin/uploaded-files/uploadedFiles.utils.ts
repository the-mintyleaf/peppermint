import { dayjs } from "@peppermint/ui";
import type {
  AcceptedExtension,
  FileOwnerScope,
  UploadedFile,
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
 * What opening a file does: `image`/`pdf` open the in-app viewer, `download`
 * saves it under its original filename. Decided by type, never by category —
 * a passport scan can be a JPEG or a PDF.
 */
export type FileViewKind = "image" | "pdf" | "download";

/** Accepted image extensions → the MIME type the browser needs to render them. */
const IMAGE_EXTENSION_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/** The last dot-segment, lower-cased — the same rule the backend checks (§5). */
function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot + 1).toLowerCase();
}

/**
 * `content_type` first, extension as the fallback: the backend derives
 * `content_type` from the extension after checking the leading bytes against
 * it (§5), but the exact extension → type strings are not published, so
 * the extension is the safety net if a stored type is unexpected.
 */
export function getFileViewKind(
  file: Pick<UploadedFile, "content_type" | "original_filename">,
): FileViewKind {
  const type = file.content_type.toLowerCase();
  const ext = extensionOf(file.original_filename);
  if (type === "application/pdf") return "pdf";
  if (type.startsWith("image/")) return "image";
  if (ext === "pdf") return "pdf";
  if (ext in IMAGE_EXTENSION_TYPES) return "image";
  return "download";
}

/**
 * The MIME type the viewer stamps on its object URL. Always set explicitly
 * rather than trusting the blob's own type: the `<iframe>` only gets the
 * browser's PDF viewer for `application/pdf`, and pinning the type means the
 * viewer can never render the bytes as anything else (e.g. HTML).
 */
export function getViewerMimeType(
  file: Pick<UploadedFile, "content_type" | "original_filename">,
  kind: Exclude<FileViewKind, "download">,
): string {
  if (kind === "pdf") return "application/pdf";
  const type = file.content_type.toLowerCase();
  if (type.startsWith("image/")) return type;
  return (
    IMAGE_EXTENSION_TYPES[extensionOf(file.original_filename)] ?? "image/jpeg"
  );
}

/**
 * Resolve the single owner key set on a scope object. Exactly one must be
 * set — a database constraint on the backend, not only validation (§4).
 * Throws rather than silently uploading against the wrong (or an
 * ambiguously-scoped) owner if a caller ever passes zero or more than one.
 */
export function getOwnerEntry(scope: FileOwnerScope): [string, string] {
  const entries = Object.entries(scope).filter(([, value]) => Boolean(value));
  if (entries.length !== 1) {
    throw new Error(
      `uploaded-files: exactly one owner key must be set on \`scope\` (got ${entries.length}).`,
    );
  }
  return entries[0] as [string, string];
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
