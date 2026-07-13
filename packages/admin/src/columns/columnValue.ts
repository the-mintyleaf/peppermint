// Shared helpers for the column factories.

/** Reads a dot-path accessor from a row (e.g. "profile.name"). */
export function getFieldValue(row: unknown, accessor: string): unknown {
  if (!accessor.includes(".")) {
    return (row as Record<string, unknown>)?.[accessor];
  }
  return accessor.split(".").reduce<unknown>((acc, key) => {
    if (acc != null && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, row);
}

/** Turns a snake/camel accessor into a Title Case header ("account_status" → "Account Status"). */
export function accessorToTitle(accessor: string): string {
  const last = accessor.split(".").pop() ?? accessor;
  return last
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
