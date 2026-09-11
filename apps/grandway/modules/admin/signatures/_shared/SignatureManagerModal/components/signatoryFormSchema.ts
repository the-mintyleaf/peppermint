import { z } from "zod";
import {
  MAX_SIGNATURE_SIZE_BYTES,
  SIGNATURE_EXTENSIONS,
} from "../../../signatures.labels";

/**
 * `role` is **free text, max 100** — the contract is explicit that it is not an
 * enum and that a picker must never filter by it, because a director may
 * legitimately sign as the instructor. Do not turn this into a Select.
 *
 * `signature_image_url` is validated only for well-formedness, matching the
 * server: it never fetches the link, so a valid URL pointing at nothing passes
 * here exactly as it does there.
 */
export const signatoryDetailShape = {
  name: z
    .string()
    .trim()
    .min(1, "A name is required")
    .max(255, "Max 255 characters"),
  title: z.string().max(255, "Max 255 characters"),
  role: z.string().max(100, "Max 100 characters"),
  signature_image_url: z
    .union([z.literal(""), z.string().url("Enter a full URL, or leave blank")])
    .refine((v) => v.length <= 500, "Max 500 characters"),
};

/**
 * The two rejections a client can pre-empt. The third — leading bytes
 * disagreeing with the extension, i.e. a PDF renamed `.png` — **cannot** be
 * checked here and arrives as a notification from the mutation.
 *
 * The extension list is narrower than the file ledger's seven types and
 * deliberately so: none of PDF/DOCX/XLSX is a signature.
 */
export const signatureFileSchema = z
  .instanceof(File)
  .refine((f) => f.size > 0, "This file is empty")
  .refine(
    (f) => f.size <= MAX_SIGNATURE_SIZE_BYTES,
    "Image must be 10 MB or smaller",
  )
  .refine(
    (f) =>
      SIGNATURE_EXTENSIONS.some((ext) =>
        f.name.toLowerCase().endsWith(`.${ext}`),
      ),
    "Accepted types: PNG, JPG, JPEG, WEBP",
  );

/** Editing details only — the image is its own endpoint and its own panel. */
export const signatoryDetailSchema = z.object(signatoryDetailShape);

/**
 * Creating. The image is **optional here but not deferred**: the signatory is
 * created first (the upload endpoint needs an id that does not exist yet), then
 * the image is posted against the new id. That sequencing is a backend
 * constraint and should stay invisible — one form, one action.
 */
export const signatoryCreateSchema = z.object({
  ...signatoryDetailShape,
  file: signatureFileSchema.nullable(),
});
