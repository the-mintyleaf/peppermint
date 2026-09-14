/**
 * Derives a `ReferenceEntry.code` from the entry's name.
 *
 * `code` is a permanent, unique identifier — immutable once created
 * (`docs/backend/lead-management/INTEGRATION.md` §8) and validated against
 * `leads/validators.py`'s `REFERENCE_CODE_PATTERN`,
 * `^[a-z0-9](?:[a-z0-9_-]{0,48}[a-z0-9])?$`. Nothing a user decides depends on
 * it, so it is derived from the name rather than asked for: lowercased, every
 * run of non-alphanumerics collapsed to a single `-`.
 *
 * Returns `""` when the name has no ASCII alphanumerics to build one from —
 * the pattern cannot be satisfied, so callers must treat that as "this name
 * can't become a code" rather than sending it.
 */
export function toReferenceCode(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+/, "")
      .slice(0, 50)
      // Trimmed after slicing, not before: a 50-char cut can land mid-separator
      // and leave the trailing `-` the pattern forbids.
      .replace(/-+$/, "")
  );
}
