import { z } from "zod";

/** Admin-assigned ASCII slug (§5) — unique, immutable, not the primary key. */
export const CODE_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{0,48}[a-z0-9])?$/;
export const CODE_ERROR =
  "Lowercase letters, digits, - and _ only, starting and ending with a letter or digit.";

/** `code` is required and validated on create, read-only (any string) on edit. */
export function codeField(mode: "create" | "edit") {
  return mode === "create"
    ? z.string().min(1, "Required").max(50).regex(CODE_PATTERN, CODE_ERROR)
    : z.string();
}
