import { z } from "zod";
import type { RefinementCtx } from "zod";

/**
 * A non-`active` availability status requires a non-empty note, on create AND
 * update, re-affirmed every time (INTEGRATION.md §3). Client-mirrors the backend's
 * `INSTITUTIONS_AVAILABILITY_NOTE_REQUIRED` rule so the field errors inline before
 * a round-trip. Attach with `schema.superRefine(refineAvailabilityNote)`.
 */
export function refineAvailabilityNote(
  values: { availability_status: string; availability_note: string },
  ctx: RefinementCtx,
): void {
  if (
    values.availability_status !== "active" &&
    !values.availability_note.trim()
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["availability_note"],
      message: "A note is required when the status isn't Active.",
    });
  }
}
