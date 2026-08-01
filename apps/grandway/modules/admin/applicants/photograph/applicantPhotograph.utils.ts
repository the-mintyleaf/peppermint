import type { UploadedFile } from "@/modules/admin/uploaded-files/uploadedFiles.types";

/**
 * The photo-only subset of the backend's seven accepted extensions
 * (`docs/backend/uploaded-files/DATA_CONTRACT.md` §5). `pdf`/`docx`/`xlsx` are
 * accepted by the endpoint but are not a portrait — the picker refuses them
 * client-side so a document never lands under `category=photograph` and starts
 * rendering as a broken `<img>` on every CV.
 */
export const PHOTO_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

/** Mantine `FileInput`'s `accept` prop — a comma-separated extension list. */
export const PHOTO_FILE_INPUT_ACCEPT = PHOTO_EXTENSIONS.map(
  (ext) => `.${ext}`,
).join(",");

export const PHOTO_TYPE_ERROR = "Accepted types: JPG, JPEG, PNG, WEBP";

/** True when the filename's **last** dot-segment is a photo extension — the
 * same rule the backend applies, so `photo.png.exe` is refused here too. */
export function hasPhotoExtension(fileName: string): boolean {
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  return (PHOTO_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * Up-to-two-letter initials for the avatar fallback — the same rule
 * `ProfileSidebar` applies, kept here so every photo surface degrades to an
 * identical placeholder rather than two subtly different ones.
 */
export function applicantInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

/**
 * Resolve *the* photograph from an applicant's files.
 *
 * The backend marks no file as primary — `?category=photograph` can legitimately
 * return several, and choosing among them is a client-side convention
 * (`uploaded-files/INTEGRATION.md` §9). The convention this app commits to:
 * **the newest current, non-archived photograph.** `is_current` already excludes
 * superseded versions, so anything left is a genuinely separate upload rather
 * than an older version of the same one.
 */
export function pickCurrentPhotograph(
  files: UploadedFile[] | undefined,
): UploadedFile | null {
  if (!files?.length) return null;
  const candidates = files.filter(
    (f) => f.category === "photograph" && f.is_current && !f.is_archived,
  );
  if (candidates.length === 0) return null;
  return candidates.reduce((newest, file) =>
    file.created_at > newest.created_at ? file : newest,
  );
}
