import { createQueryKeys } from "@peppermint/admin";

/** Entries — `lists()` is a prefix of every `.list(filters)`, including field suggestions. */
export const clipboardEntryKeys = createQueryKeys("authenticate.clipboard");

/** Categories — a bare, unpaginated array, so only `.all` is ever queried. */
export const clipboardCategoryKeys = createQueryKeys(
  "authenticate.clipboardCategories",
);
