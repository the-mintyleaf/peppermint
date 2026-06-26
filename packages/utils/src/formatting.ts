import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function formatDate(
  date: string | Date | number,
  template = "DD MMM YYYY",
): string {
  return dayjs(date).format(template);
}

export function formatDateTime(
  date: string | Date | number,
  template = "DD MMM YYYY HH:mm",
): string {
  return dayjs(date).format(template);
}

export function formatRelative(date: string | Date | number): string {
  return dayjs(date).fromNow();
}

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatCurrency(
  value: number,
  currency = "USD",
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    value,
  );
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
