/**
 * Whether a header line prints. A document saved before the switches existed has
 * no flag, so it keeps printing a number it already has rather than losing it.
 */
export function isWodaLineShown(
  values: Record<string, unknown> | undefined,
  showKey: string,
  valueKey: string,
): boolean {
  const flag = values?.[showKey];
  if (typeof flag === "boolean") return flag;
  const value = values?.[valueKey];
  return typeof value === "string" && value.trim() !== "";
}
